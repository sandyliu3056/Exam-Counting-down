// =====================================================================
// 英語學習站 · Supabase Edge Function「send-report」
// 學生在「學習紀錄」做好 PDF 報告後，按「直接寄出」就由這裡寄給老師（透過 Resend 寄信服務）。
//
// 為了不被拿去亂寄信：
//   · 只有登入（email 已確認）的帳號能寄。
//   · 收件人一定要是本站的「老師」帳號的 email。
//   · 每個學生 24 小時內最多 5 封，全站 24 小時內最多 90 封（Resend 免費方案一天 100 封）。
//   · 附件只能是 6 MB 以內的 PDF。
// 老師按「回覆」會直接回到學生填的 email。
//
// 需要的 Secrets（Supabase 後台 → Edge Functions → Secrets）：
//   RESEND_API_KEY  Resend 的 API 金鑰（re_ 開頭）
//   MAIL_FROM       寄件人，例如：英語學習站 <report@funenglishlearning.com>（網域要先在 Resend 驗證）
// SUPABASE_URL 和伺服器金鑰是 Supabase 自動提供的，不用設定。設定步驟見 README.md。
// =====================================================================

export const LIMITS = { perUser: 5, perDay: 90, pdfBytes: 6_000_000, message: 500, summary: 4000 };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const out = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
const EMAIL = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[a-z]{2,}$/i;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// the server key: the new secret key ({"default": "sb_secret_…"}) or the legacy service_role key
function serverKey(env) {
  try { const k = JSON.parse(env.SUPABASE_SECRET_KEYS || '{}'); if (k && typeof k.default === 'string' && k.default) return k.default; } catch (e) { /* not set */ }
  return env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export async function handle(req, env, fetchFn = fetch) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return out(405, { error: 'method' });
  const base = String(env.SUPABASE_URL || '').replace(/\/+$/, ''), key = serverKey(env), resendKey = env.RESEND_API_KEY, from = env.MAIL_FROM;
  if (!base || !key || !resendKey || !from) return out(503, { error: 'not_configured' });

  // who is sending (the student's own login token)
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return out(401, { error: 'login' });
  const ur = await fetchFn(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  const user = ur.ok ? await ur.json().catch(() => null) : null;
  if (!user || !user.id) return out(401, { error: 'login' });

  let b;
  try { b = await req.json(); } catch (e) { return out(400, { error: 'bad_request' }); }
  if (!b || typeof b !== 'object') return out(400, { error: 'bad_request' });
  const to = String(b.to || '').trim().toLowerCase(), replyTo = String(b.replyTo || user.email || '').trim();
  if (!EMAIL.test(to)) return out(400, { error: 'bad_to' });
  if (!EMAIL.test(replyTo)) return out(400, { error: 'bad_reply' });
  const pdf = String(b.pdf || '').replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(pdf) || pdf.length * 0.75 > LIMITS.pdfBytes) return out(400, { error: 'bad_pdf' });
  let head = ''; try { head = atob(pdf.slice(0, 8)); } catch (e) { /* not base64 */ }
  if (!head.startsWith('%PDF-')) return out(400, { error: 'bad_pdf' });

  // the database, with the server key (sent as apikey; a legacy JWT key also as the bearer)
  const H = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
  const db = async (path, init = {}) => {
    const r = await fetchFn(`${base}/rest/v1/${path}`, { ...init, headers: { ...H, 'Content-Type': 'application/json', ...(init.headers || {}) } });
    if (!r.ok) throw new Error(`db ${r.status}`);
    return init.method && init.method !== 'GET' ? null : r.json();
  };
  try {
    // the sender has a profile (a confirmed account); the receiver is a teacher on this site
    const [me] = await db(`profiles?select=id,name,email&id=eq.${encodeURIComponent(user.id)}`);
    if (!me) return out(403, { error: 'login' });
    const [teacher] = await db(`profiles?select=id,name&role=eq.teacher&email=eq.${encodeURIComponent(to)}`);
    if (!teacher) return out(404, { error: 'not_teacher' });
    const since = encodeURIComponent(new Date(Date.now() - 864e5).toISOString());
    const mine = await db(`mail_log?select=id&user_id=eq.${encodeURIComponent(user.id)}&sent_at=gte.${since}&limit=${LIMITS.perUser}`);
    if (mine.length >= LIMITS.perUser) return out(429, { error: 'rate_user', limit: LIMITS.perUser });
    const all = await db(`mail_log?select=id&sent_at=gte.${since}&limit=${LIMITS.perDay}`);
    if (all.length >= LIMITS.perDay) return out(429, { error: 'rate_site' });

    const name = String(me.name || (user.email || '').split('@')[0] || '學生').slice(0, 60);
    const msg = String(b.message || '').trim().slice(0, LIMITS.message), summary = String(b.summary || '').trim().slice(0, LIMITS.summary);
    const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' });
    const file = `${(String(b.fileName || '').replace(/\.pdf$/i, '').replace(/[^\w.\-㐀-鿿]+/g, '_').replace(/^[._]+/, '').slice(0, 60) || 'report')}.pdf`;
    const subject = `${name} 的英文學習報告 ${day}`;
    const text = [`${teacher.name ? teacher.name + ' ' : ''}老師您好：`, `${name}（${user.email}）從英語學習站寄來學習報告，PDF 在附件。`,
      ...(msg ? [`學生想說的話：\n${msg}`] : []), ...(summary ? [summary] : []), `直接按「回覆」就會寄到 ${replyTo}。`].join('\n\n');
    const html = `<div style="font-family:system-ui,'Noto Sans TC',sans-serif;font-size:15px;line-height:1.7;color:#1d2b4f">
<p>${esc(teacher.name ? teacher.name + ' ' : '')}老師您好：</p>
<p><b>${esc(name)}</b>（${esc(user.email)}）從英語學習站寄來學習報告，PDF 在附件。</p>
${msg ? `<p style="background:#fff7d6;border-radius:10px;padding:10px 14px"><b>學生想說的話：</b><br>${esc(msg).replace(/\n/g, '<br>')}</p>` : ''}
${summary ? `<pre style="font-family:inherit;white-space:pre-wrap;background:#f3f6fb;border-radius:10px;padding:10px 14px">${esc(summary)}</pre>` : ''}
<p style="color:#5b6787">直接按「回覆」就會寄到 ${esc(replyTo)}。</p></div>`;

    const r = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html, attachments: [{ filename: file, content: pdf }] }),
    });
    if (!r.ok) return out(502, { error: 'send_failed', status: r.status });
    await db('mail_log', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: user.id, to_email: to }) });
    // keep a week of the log, enough for the daily limits
    await db(`mail_log?sent_at=lt.${encodeURIComponent(new Date(Date.now() - 7 * 864e5).toISOString())}`, { method: 'DELETE' }).catch(() => {});
    return out(200, { ok: true });
  } catch (e) {
    return out(500, { error: 'server' });
  }
}

// on Supabase (Deno); the tests import handle() directly
if (typeof Deno !== 'undefined') Deno.serve(req => handle(req, Deno.env.toObject()));
