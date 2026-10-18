/* =====================================================
   🌱 字根字首字尾 (roots.html): browse the prefixes, roots and suffixes, hear the example words, take a 拆字測驗
   Data: roots-data.js (window.ROOTS_DATA). Read-aloud: speech.js, shared with the main site.
   ===================================================== */
(() => {
  'use strict';
  const DATA = window.ROOTS_DATA || { prefix: [], root: [], suffix: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const app = $('#app');
  // jump without the page's smooth scrolling ('instant' is newer than some iPhones: fall back to a plain jump)
  const jumpTo = el => { try { el ? el.scrollIntoView({ block: 'start', behavior: 'instant' }) : window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { el ? el.scrollIntoView(true) : window.scrollTo(0, 0); } };

  /* ---------------- Look: the theme, font and voice chosen on the main site ---------------- */
  const LS_UI = 'tve_exam_ui_v1', LS_ROOTS = 'tve_roots_v1';
  const THEMES = ['navy', 'forest', 'plum', 'sakura', 'mint', 'sunset'];
  const readJSON = k => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } };
  let ui = readJSON(LS_UI);
  function applyLook() {
    document.body.dataset.theme = THEMES.includes(ui.theme) ? ui.theme : 'navy';
    document.body.dataset.font = ui.font === 'clean' ? 'clean' : 'hand';
    $('#themeSelect').value = document.body.dataset.theme; $('#fontSelect').value = document.body.dataset.font;
  }
  // only these two change; the main site's other settings (language, account, tour …) stay as they are
  function saveLook(k, v) { const cur = readJSON(LS_UI); cur[k] = v; ui[k] = v; try { localStorage.setItem(LS_UI, JSON.stringify(cur)); } catch (e) { } applyLook(); }
  $('#themeSelect').addEventListener('change', e => saveLook('theme', e.target.value));
  $('#fontSelect').addEventListener('change', e => saveLook('font', e.target.value));
  window.addEventListener('storage', e => { if (e.key === LS_UI) { ui = readJSON(LS_UI); applyLook(); } });
  applyLook();
  const store = readJSON(LS_ROOTS); // { how: 0/1 (怎麼用 open), best: { all: 8, root: 10 … } }
  const saveStore = () => { try { localStorage.setItem(LS_ROOTS, JSON.stringify(store)); } catch (e) { } };

  /* ---------------- Toast + read-aloud ---------------- */
  let toastTimer;
  function toast(msg, ms = 2200) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }
  const SAY_TEXT = {
    voiceMuteHint: '🔊 聽不到聲音？請關掉靜音模式：撥動側邊的響鈴／靜音開關（iPhone 15 Pro 以後的機型按住「動作按鈕」），朗讀時再按音量鍵調大聲。',
    voiceMuteHintPad: '🔊 聽不到聲音？請從控制中心關掉靜音（鈴鐺圖示），朗讀時再按音量鍵調大聲。',
    voiceStuck: '朗讀沒有開始。請重新整理頁面再試；還是不行，請檢查這台裝置的「文字轉語音」設定。',
    voiceStuckIOS: '朗讀沒有開始。請把瀏覽器（或主畫面上的 App）完全關掉再打開；還是不行，請到「設定 › 輔助使用 › 朗讀內容 › 聲音」下載一個英文聲音。',
    voiceNone: '這個瀏覽器不支援朗讀。',
  };
  const SP = window.TVESpeech;
  if (SP) SP.setup({ kind: () => (ui.voice === 'f' ? 'f' : 'm'), toast, text: k => SAY_TEXT[k] || k });
  const say = w => { if (SP && SP.hasTTS()) SP.speak(w); else toast(SAY_TEXT.voiceNone); };

  /* ---------------- Names ---------------- */
  const KINDS = [['prefix', '字首', 'Prefix'], ['root', '字根', 'Root'], ['suffix', '字尾', 'Suffix']];
  const KIND_NAME = { prefix: '字首', root: '字根', suffix: '字尾' };
  const CODE = { prefix: 'p', root: 'r', suffix: 's' };
  const GROUPS = {
    prefix: [['neg', '否定・相反'], ['num', '數量'], ['degree', '程度・大小'], ['time', '時間・順序'], ['place', '位置・方向'], ['other', '其他']],
    root: [['sense', '看・聽・說・寫'], ['move', '移動・動作'], ['make', '製作・身體・性質'], ['life', '生命・自然'], ['mind', '心智・感覺'], ['society', '社會・其他']],
    suffix: [['person', '人'], ['noun', '名詞'], ['adj', '形容詞'], ['verb', '動詞'], ['adv', '副詞']],
  };
  const GROUP_NAME = Object.fromEntries(Object.values(GROUPS).flat());
  const POS_NAME = { 'n.': '名詞', 'v.': '動詞', 'adj.': '形容詞', 'adv.': '副詞' };
  const CEFR = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B1', 5: 'B2', 6: 'B2', 7: 'B2+', 8: 'C1', 9: 'C2' }; // the same as the 單字庫
  const ALL = [].concat(DATA.prefix, DATA.root, DATA.suffix);
  const byId = new Map(ALL.map(e => [e.id, e]));
  const nEx = ALL.reduce((n, e) => n + e.examples.length, 0);

  /* ---------------- State + address (#prefix, #root/r-spect, #quiz …) ---------------- */
  const VIEWS = ['prefix', 'root', 'suffix', 'quiz'];
  const state = { view: 'prefix', group: '', q: '', range: 'all', quiz: null };
  function readHash() {
    let raw = location.hash.replace(/^#\/?/, ''); try { raw = decodeURIComponent(raw); } catch (e) { }
    const [v, id] = raw.split('/'), known = VIEWS.includes(v);
    // an unknown address (the skip link's #app, a mangled link) keeps the current view
    return { view: known ? v : state.view, id: known && id && byId.has(id) ? id : '', known: known || !raw };
  }

  /* ---------------- Pieces ---------------- */
  const seg = (p, me) => `<span class="rt-seg k-${p[1]}${me ? ' is-me' : ''}"><b lang="en">${esc(p[0])}</b>${p[2] ? `<i>${esc(p[2])}</i>` : ''}</span>`;
  // the parts of a word, the entry's own affix outlined (only its first appearance)
  function split(x, e) {
    let done = !e;
    return x.parts.map(p => { const me = !done && p[1] === CODE[e.kind] && e.keys.includes(p[0].toLowerCase()); if (me) done = true; return seg(p, me); }).join('<span class="rt-plus" aria-hidden="true">+</span>');
  }
  function row(e, x, hits) {
    return `<li class="rt-row${hits && hits.has(x.w) ? ' rt-hit' : ''}">
      <div class="rt-line"><span class="rt-word" lang="en">${esc(x.w)}</span><button type="button" class="icon-btn rt-say" data-say="${esc(x.w)}" aria-label="唸 ${esc(x.w)}">🔊</button><span class="rt-pos" lang="en">${esc(x.pos)}</span><span class="rt-zh">${esc(x.zh)}</span><span class="rt-badges">${x.lv && CEFR[x.lv] ? `<span class="chip" title="程度">${CEFR[x.lv]}</span>` : ''}${x.hf ? '<span class="chip rt-hf">統測高頻</span>' : ''}</span></div>
      <div class="rt-split">${split(x, e)}<span class="rt-lit">→ 字面：${esc(x.lit)}</span></div>
      ${x.note ? `<p class="rt-note">✎ ${esc(x.note)}</p>` : ''}
    </li>`;
  }
  function card(e, hits) {
    return `<article class="card rt-card" id="${esc(e.id)}">
      <div class="rt-head"><span class="rt-form k-${CODE[e.kind]}" lang="en">${esc(e.form)}</span><div class="rt-mean"><b>${esc(e.mean)}</b><span class="en" lang="en">${esc(e.meanEn)}</span></div></div>
      <div class="rt-meta"><span class="chip">${KIND_NAME[e.kind]}・${esc(GROUP_NAME[e.group] || '')}</span>${e.makes ? `<span class="chip info">變成${POS_NAME[e.makes] || esc(e.makes)}</span>` : ''}<span class="chip">${esc(e.origin)}</span></div>
      <p class="rt-tip">💡 ${esc(e.tip)}</p>
      <ul class="rt-ex">${e.examples.map(x => row(e, x, hits)).join('')}</ul>
    </article>`;
  }
  const grid = (list, hits) => `<div class="rt-grid">${list.map(e => card(e, hits)).join('')}</div>`;

  /* ---------------- Search ---------------- */
  const norm = s => String(s || '').trim().toLowerCase().replace(/^[-\s]+|[-\s]+$/g, '');
  function search(q) {
    const hits = new Set(), found = [];
    for (const e of ALL) {
      const own = e.keys.some(k => k.startsWith(q) || (q.length >= 4 && q === k)) || [e.form, e.mean, e.meanEn, e.sense].some(s => String(s).toLowerCase().includes(q));
      const ex = e.examples.filter(x => x.w.includes(q) || x.zh.includes(q));
      ex.forEach(x => hits.add(x.w));
      if (own || ex.length) found.push(e);
    }
    return { found, hits };
  }
  // a word that is not an example: the parts its spelling contains (roots of 4+ letters inside it,
  // a prefix it starts with, a suffix it ends with). Only a lead: the same letters do not always mean the same thing.
  function partsIn(q) {
    if (!/^[a-z]{5,}$/.test(q)) return [];
    return ALL.filter(e => e.keys.some(k => k !== q && (e.kind === 'root' ? k.length >= 4 && q.includes(k) : e.kind === 'prefix' ? k.length >= 3 && q.startsWith(k) : k.length >= 3 && q.endsWith(k))));
  }
  // the list and the line that counts it (the count is its own live line, outside the list that gets replaced)
  function listParts() {
    const q = norm(state.q);
    if (q) {
      const { found, hits } = search(q);
      if (!found.length) {
        const maybe = partsIn(q);
        return { count: `找不到「${state.q.trim()}」。`, html: maybe.length ? `<h2 class="section-title rt-sec">拼字裡有這些字首字根字尾</h2><p class="section-sub">只是線索：拼字相同時，意思不一定有關。</p>${grid(maybe)}` : `<div class="card rt-empty"><p>試試輸入字首、字根、字尾（例：un、spect、tion），或中文意思（例：看、不）。</p></div>` };
      }
      return { count: `找到 ${found.length} 個（${KINDS.map(([k, zh]) => `${zh} ${found.filter(e => e.kind === k).length}`).join('・')}）`,
        html: KINDS.map(([k, zh]) => { const l = found.filter(e => e.kind === k); return l.length ? `<h2 class="section-title rt-sec">${zh}</h2>${grid(l, hits)}` : ''; }).join('') };
    }
    const k = state.view, gs = GROUPS[k].filter(([g]) => !state.group || g === state.group);
    const n = DATA[k].filter(e => !state.group || e.group === state.group).length;
    return { count: `共 ${n} 個${KIND_NAME[k]}${state.group ? `（${GROUP_NAME[state.group]}）` : ''}`,
      html: gs.map(([g, name]) => { const l = DATA[k].filter(e => e.group === g); return l.length ? `<h2 class="section-title rt-sec">${name}</h2>${grid(l)}` : ''; }).join('') };
  }
  function groupPills() {
    if (norm(state.q)) return '';
    const k = state.view, pill = (g, name, n) => `<button type="button" class="subtab" data-group="${g}" aria-pressed="${state.group === g}">${name}<b>${n}</b></button>`;
    return `<nav class="subtabs rt-groups" aria-label="小分類">${pill('', '全部', DATA[k].length)}${GROUPS[k].map(([g, name]) => pill(g, name, DATA[k].filter(e => e.group === g).length)).join('')}</nav>`;
  }

  /* ---------------- Page ---------------- */
  function headHTML() {
    const going = state.quiz && state.quiz.i < state.quiz.qs.length && state.view !== 'quiz'; // a quiz waiting to be finished
    const tab = (v, label, sub, dot) => `<a class="rt-kind${v === 'quiz' && going ? ' has-session' : ''}" data-kind="${v}" href="#${v}"${state.view === v ? ' aria-current="page"' : ''}><span>${dot ? '<i class="rt-dot" aria-hidden="true"></i>' : ''}${label}</span><small>${sub}${v === 'quiz' && going ? '<span class="sr-only">（還沒做完）</span>' : ''}</small></a>`;
    return `<nav class="subtabs" aria-label="單字">
        <a class="subtab" href="./#/flashcards"><span aria-hidden="true">🃏</span> 單字卡</a><a class="subtab" href="./#/vocab"><span aria-hidden="true">📚</span> 單字庫</a><a class="subtab" href="./#/phrases"><span aria-hidden="true">🧩</span> 片語</a><a class="subtab" href="roots.html" aria-current="page"><span aria-hidden="true">🌱</span> 字根字首</a>
      </nav>
      <header class="page-head"><h1 tabindex="-1"><span aria-hidden="true">🌱</span> 字根字首字尾</h1>
        <p>把單字拆成「字首＋字根＋字尾」，認得每一塊的意思，就能猜出沒看過的單字。共 ${DATA.prefix.length} 個字首、${DATA.root.length} 個字根、${DATA.suffix.length} 個字尾，${nEx} 個例字；點 🔊 聽發音。</p></header>
      <nav class="rt-kinds" aria-label="字首、字根、字尾、測驗">${KINDS.map(([k, zh, en]) => tab(k, zh, `${en} · ${DATA[k].length}`, true)).join('')}${tab('quiz', '🎯 測驗', 'Quiz')}</nav>`;
  }
  function howHTML() {
    const open = store.how !== 0;
    return `<details class="card rt-how"${open ? ' open' : ''}><summary>💡 怎麼用拆字記單字？</summary>
      <div class="rt-formula">${seg(['un', 'p', '不'])}<span class="rt-eq">+</span>${seg(['believ', 'b', '相信'])}<span class="rt-eq">+</span>${seg(['able', 's', '可…的'])}<span class="rt-eq">=</span><span class="rt-whole" lang="en">unbelievable</span><span>難以置信的</span><button type="button" class="icon-btn rt-say" data-say="unbelievable" aria-label="唸 unbelievable">🔊</button></div>
      <ol>
        <li><b>字首</b>在最前面，常常改變意思：un-（不）、re-（再）、pre-（之前）。</li>
        <li><b>字根</b>是核心意思，多半來自拉丁文或希臘文：spect（看）、port（搬運）。</li>
        <li><b>字尾</b>在最後面，常常決定詞性：-tion 名詞、-able 形容詞、-ly 副詞。</li>
        <li>拆出來的「字面意思」是線索；真正的意思還是要看例句。</li>
      </ol>
      <div class="rt-legend"><span class="rl-p"><i></i>字首</span><span class="rl-r"><i></i>字根</span><span class="rl-s"><i></i>字尾</span><span class="rl-b"><i></i>原本就是一個單字</span></div>
    </details>`;
  }
  function render(opts = {}) {
    const { view, id } = readHash();
    // another kind: a fresh list (the search too); a quiz stays where it was, for when the student comes back to 🎯
    if (view !== state.view) { state.group = ''; state.q = ''; }
    state.view = view;
    if (id && view !== 'quiz') { state.q = ''; const e = byId.get(id); if (e && state.group && e.group !== state.group) state.group = ''; }
    let body;
    if (view === 'quiz') body = state.quiz ? (state.quiz.i < state.quiz.qs.length ? questionHTML() : resultHTML()) : quizSetHTML();
    else body = `${howHTML()}<div class="card rt-tools">
        <div class="rt-search"><input type="search" id="rtQ" value="${esc(state.q)}" placeholder="搜尋：spect、看、inspect…" aria-label="搜尋字首、字根、字尾、單字或中文" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><button type="button" class="rt-clear" data-act="clear" aria-label="清除搜尋"${state.q ? '' : ' hidden'}>✕</button></div>
        <div id="rtPills">${groupPills()}</div>
      </div>${(p => `<p class="rt-count" id="rtCount" role="status">${esc(p.count)}</p><div id="rtList">${p.html}</div>`)(listParts())}`;
    app.innerHTML = headHTML() + body;
    document.title = `${view === 'quiz' ? '拆字測驗' : KIND_NAME[view]}｜字根字首字尾｜英語學習站`;
    if (id && view !== 'quiz') {
      const c = document.getElementById(id);
      if (c) { jumpTo(c); c.classList.add('rt-flash'); setTimeout(() => c.classList.remove('rt-flash'), 2400); }
    } else if (opts.top) jumpTo(null);
    const cur = $('.subtabs [aria-current="page"]', app); if (cur) cur.parentNode.scrollLeft = cur.offsetLeft - cur.parentNode.offsetLeft - 8; // 字根字首 is the 4th pill
    if (opts.focus) { const f = $(opts.focus, app); if (f) f.focus({ preventScroll: !!id }); }
  }
  function refreshList() {
    const p = listParts(); $('#rtCount').textContent = p.count; $('#rtList').innerHTML = p.html; $('#rtPills').innerHTML = groupPills();
    const c = $('.rt-clear', app); if (c) c.hidden = !state.q;
  }

  /* ---------------- 拆字測驗 ---------------- */
  const QN = 10;
  const RANGES = [['all', '全部'], ['prefix', '字首'], ['root', '字根'], ['suffix', '字尾']];
  // two meanings clash (and cannot both be options) when they share a sense tag or a meaningful Chinese character
  // (a meaning made only of those common characters, e.g. 動作（名詞）, keeps them)
  const core = s => { const c = String(s).replace(/[^一-鿿]/g, ''), m = c.replace(/[的之性狀態動作名詞使成為做人者與有關某於或等地]/g, ''); return new Set(m || c); };
  const near = (a, b) => { const B = core(b); return [...core(a)].some(c => B.has(c)); };
  const sameAffix = (a, b) => a.keys.some(k => b.keys.includes(k)); // in-/im-, -en, -ant/-ent and -al each have two entries
  const clash = (a, b) => a.sense === b.sense || near(a.mean, b.mean) || sameAffix(a, b);
  // three wrong options that also differ from each other (two options meaning the same would give both away)
  function pick3(cands, ok, apart) {
    const out = [];
    for (const c of shuffle(cands)) { if (out.length === 3) break; if (ok(c) && !out.some(o => !apart(o, c))) out.push(c); }
    return out.length === 3 ? out : null;
  }
  function makeQ(e, type) {
    const same = DATA[e.kind].filter(o => o !== e);
    if (type === 'mean') {
      const d = pick3(same, o => !clash(o, e), (a, b) => !clash(a, b)); if (!d) return null;
      return { id: e.id, type, ask: `${KIND_NAME[e.kind]} <span class="rt-big" lang="en">${esc(e.form)}</span> 是什麼意思？`, hint: `例：${e.examples.slice(0, 2).map(x => `<span lang="en">${esc(x.w)}</span>`).join('、')}`, opts: shuffle([e.mean, ...d.map(o => o.mean)]), answer: e.mean, en: false, x: e.examples[0] };
    }
    if (type === 'form') {
      const d = pick3(same, o => !clash(o, e), (a, b) => !clash(a, b) && a.form !== b.form); if (!d) return null;
      return { id: e.id, type, ask: `哪一個${KIND_NAME[e.kind]}的意思是「${esc(e.mean)}」？`, hint: '', opts: shuffle([e.form, ...d.map(o => o.form)]), answer: e.form, en: true, x: e.examples[0] };
    }
    const x = shuffle(e.examples)[0];
    const others = ALL.filter(o => o !== e).flatMap(o => o.examples).filter(y => y.w !== x.w && !near(y.zh, x.zh));
    const samePos = others.filter(y => y.pos === x.pos);
    const d = pick3(samePos.length >= 12 ? samePos : others, () => true, (a, b) => a.w !== b.w && !near(a.zh, b.zh)); if (!d) return null;
    return { id: e.id, type: 'word', ask: `<span class="rt-split rt-q-split">${split(x, e)}</span> 合起來是 <span class="rt-big" lang="en">${esc(x.w)}</span>，意思最可能是？`, hint: '', opts: shuffle([x.zh, ...d.map(y => y.zh)]), answer: x.zh, en: false, x };
  }
  function startQuiz() {
    const pool = shuffle(state.range === 'all' ? ALL : DATA[state.range]), qs = [];
    for (const e of pool) {
      if (qs.length === QN) break;
      const r = Math.random(), type = r < .4 ? 'mean' : r < .65 ? 'form' : 'word';
      const q = makeQ(e, type) || makeQ(e, 'word'); if (q) qs.push(q);
    }
    state.quiz = { range: state.range, qs, i: 0, chosen: null, right: 0, wrong: [] };
  }
  function quizSetHTML() {
    const best = (store.best || {})[state.range];
    return `<section class="card rt-quiz-set" aria-labelledby="qsTitle"><h2 id="qsTitle" style="margin-top:0">🎯 拆字測驗</h2>
      <p class="muted">每題 4 選 1：字首、字根、字尾是什麼意思，或用拆開的部分猜整個單字的意思。一次 ${QN} 題。</p>
      <h3 class="small" style="margin:14px 0 0">範圍</h3>
      <div class="rt-opts" role="group" aria-label="範圍">${RANGES.map(([k, l]) => `<button type="button" class="rt-pick" data-range="${k}" aria-pressed="${state.range === k}">${l}</button>`).join('')}</div>
      <p class="rt-best">${best != null ? `這個範圍的最佳成績：${best} / ${QN}` : '還沒有這個範圍的成績。'}</p>
      <button type="button" class="btn accent" data-act="start" style="min-height:48px;font-size:18px;padding:8px 26px">開始測驗 ▶</button></section>`;
  }
  function questionHTML() {
    const s = state.quiz, q = s.qs[s.i], done = s.chosen != null, e = byId.get(q.id);
    const opt = (o, n) => {
      const cls = !done ? '' : o === q.answer ? ' is-right' : n === s.chosen ? ' is-wrong' : '';
      return `<button type="button" class="rt-opt${q.en ? ' en-opt' : ''}${cls}" data-opt="${n}"${done ? ' disabled' : ''}${q.en ? ' lang="en"' : ''}><span class="rt-n" aria-hidden="true">${n + 1}</span><span>${esc(o)}</span>${done && o === q.answer ? '<span class="sr-only">（正確答案）</span>' : done && n === s.chosen ? '<span class="sr-only">（你的答案）</span>' : ''}</button>`;
    };
    const ok = done && q.opts[s.chosen] === q.answer;
    return `<section class="card rt-q" aria-labelledby="qTitle">
      <div class="rt-q-top"><span>第 ${s.i + 1} / ${s.qs.length} 題</span><span class="rt-bar" aria-hidden="true"><i style="width:${Math.round((s.i + (done ? 1 : 0)) / s.qs.length * 100)}%"></i></span><span>✓ ${s.right}</span></div>
      <h2 id="qTitle" tabindex="-1">${q.ask}</h2>${q.hint ? `<p class="rt-q-hint">${q.hint}</p>` : ''}
      <div class="rt-q-opts">${q.opts.map(opt).join('')}</div>
      ${done ? `<div class="rt-fb"><p class="rt-fb-title ${ok ? 'ok' : 'bad'}" id="rtVerdict">${ok ? '✔ 答對了！' : `✘ 正確答案：${esc(q.answer)}`}</p>
        <p style="margin:0"><span class="rt-form k-${CODE[e.kind]}" lang="en" style="font-size:20px">${esc(e.form)}</span> ${esc(e.mean)}　<a href="#${e.kind}/${esc(e.id)}">看這張卡 →</a></p>
        <ul class="rt-ex">${row(e, q.x)}</ul></div>
        <div class="rt-next"><button type="button" class="btn accent" data-act="next" aria-describedby="rtVerdict">${s.i + 1 < s.qs.length ? '下一題 →' : '看成績 🎉'}</button></div>` : ''}
    </section>`;
  }
  function resultHTML() {
    const s = state.quiz, n = s.qs.length;
    return `<section class="card rt-result" aria-labelledby="rTitle"><div class="big-icon" aria-hidden="true">${s.right / n >= .8 ? '🎉' : '💪'}</div>
      <h2 id="rTitle" tabindex="-1">拆字測驗完成</h2><p class="rt-score">${s.right} / ${n}</p>
      <p class="muted">${s.right === n ? '全對！太厲害了。' : s.right / n >= .7 ? '很不錯！把答錯的再看一次。' : '多看幾張卡片，再挑戰一次！'}</p>
      ${s.wrong.length ? `<div class="rt-review"><h3>答錯的</h3><ul>${s.wrong.map(id => { const e = byId.get(id); return `<li><a href="#${e.kind}/${esc(e.id)}"><span lang="en">${esc(e.form)}</span></a>　${esc(e.mean)}</li>`; }).join('')}</ul></div>` : ''}
      <div class="row" style="justify-content:center;margin-top:16px"><button type="button" class="btn accent" data-act="again">再測一次</button><button type="button" class="btn ghost" data-act="setup">換範圍</button></div></section>`;
  }
  function answer(n) {
    const s = state.quiz; if (!s || s.chosen != null || s.i >= s.qs.length) return;
    const q = s.qs[s.i]; s.chosen = n;
    if (q.opts[n] === q.answer) s.right++; else s.wrong.push(q.id);
    render({ focus: '[data-act=next]' });
  }
  function next() {
    const s = state.quiz; if (!s || s.chosen == null) return;
    s.i++; s.chosen = null;
    if (s.i >= s.qs.length) { store.best = store.best || {}; store.best[s.range] = Math.max(store.best[s.range] || 0, s.right); saveStore(); }
    render({ focus: s.i < s.qs.length ? '#qTitle' : '#rTitle' });
    const top = $('.rt-q, .rt-result', app); if (top && top.getBoundingClientRect().top < 0) jumpTo(top);
  }

  /* ---------------- Events ---------------- */
  app.addEventListener('click', e => {
    const say1 = e.target.closest('[data-say]'); if (say1) { say(say1.dataset.say); return; }
    const g = e.target.closest('[data-group]'); if (g) { state.group = g.dataset.group; refreshList(); const b = $(`[data-group="${state.group}"]`, app); if (b) b.focus({ preventScroll: true }); return; }
    const r = e.target.closest('[data-range]'); if (r) { state.range = r.dataset.range; render({ focus: `[data-range="${state.range}"]` }); return; }
    const o = e.target.closest('[data-opt]'); if (o) { answer(+o.dataset.opt); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'clear') { state.q = ''; const i = $('#rtQ'); i.value = ''; refreshList(); i.focus(); }
    else if (act === 'start' || act === 'again') { if (act === 'again') state.range = state.quiz.range; startQuiz(); render({ focus: '#qTitle', top: true }); }
    else if (act === 'next') next();
    else if (act === 'setup') { state.quiz = null; render({ focus: '#qsTitle', top: true }); }
  });
  let typing = 0;
  app.addEventListener('input', e => {
    if (e.target.id !== 'rtQ') return;
    state.q = e.target.value; clearTimeout(typing); typing = setTimeout(refreshList, 120);
  });
  app.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('rt-how')) { store.how = e.target.open ? 1 : 0; saveStore(); } }, true);
  // 1–4 picks an answer, Enter goes on
  document.addEventListener('keydown', e => {
    if (state.view !== 'quiz' || !state.quiz || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const s = state.quiz;
    if (s.chosen == null && /^[1-4]$/.test(e.key) && s.i < s.qs.length) { e.preventDefault(); answer(+e.key - 1); }
  });
  window.addEventListener('hashchange', () => {
    const h = readHash(); if (!h.known) { app.focus(); return; }
    if (SP) SP.stop(); render({ top: !h.id, focus: h.id ? '' : 'h1' });
  });
  $('.skip-link').addEventListener('click', e => { e.preventDefault(); app.focus(); });
  // back on this page from the main site (Back keeps the old page): it may have changed the look
  window.addEventListener('pageshow', e => { if (e.persisted) { ui = readJSON(LS_UI); applyLook(); } });
  const toTop = $('#toTop');
  window.addEventListener('scroll', () => { toTop.hidden = window.scrollY < 700; }, { passive: true });
  toTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); $('h1', app).focus({ preventScroll: true }); });

  render();
})();
