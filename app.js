/* =====================================================
   統測英文衝刺站 — App
   純前端，資料存在 localStorage，可匯出 / 匯入 JSON
   ===================================================== */
(function () {
  'use strict';

  const LS_DATA = 'tve_exam_app_v1';
  const LS_UI = 'tve_exam_ui_v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const uid = (p = 'id') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const todayStr = (d = new Date()) => {
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return todayStr(d); };
  const fmtDate = (iso) => iso ? esc(String(iso).replace('T', ' ').slice(0, 16)) : '';
  const shuffleArr = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- State ---------------- */
  const emptyProgress = () => ({ cards: {}, readingQuizzes: [], vocabQuizzes: [], days: {}, bookmarks: { vocab: [], articles: [] } });
  // Records from other devices (cloud sync, imported files) are shown on the teacher's pages. Keep their shape and
  // force every number and date to be one, so nothing inside a record can turn into HTML.
  function cleanProgress(p) {
    const obj = x => (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}, arr = x => Array.isArray(x) ? x.filter(y => y && typeof y === 'object') : [];
    const num = x => { const n = Number(x); return Number.isFinite(n) ? n : 0; }, isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d);
    const when = d => typeof d === 'string' && /^[0-9T:.+\-Z ]{4,40}$/.test(d) ? d : '';
    const idx = x => x == null || x === '' || !Number.isFinite(Number(x)) ? null : Number(x);
    const okKey = k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype';
    const out = Object.assign(emptyProgress(), obj(p));
    out.days = {}; Object.entries(obj(p && p.days)).forEach(([d, n]) => { if (isDay(d)) out.days[d] = Math.max(0, num(n)); });
    const cards = {}; Object.entries(obj(out.cards)).filter(([id]) => okKey(id)).forEach(([id, c]) => { c = obj(c); cards[id] = Object.assign({}, c, { box: Math.min(3, Math.max(0, Math.round(num(c.box)))), seen: num(c.seen), correct: num(c.correct), wrong: num(c.wrong), last: when(c.last) || null, due: isDay(c.due) ? c.due : todayStr() }); }); out.cards = cards;
    out.readingQuizzes = arr(out.readingQuizzes).map(r => Object.assign({}, r, { date: when(r.date), score: num(r.score), total: num(r.total) || 1, secs: r.secs == null ? null : num(r.secs),
      answers: arr(r.answers).map(a => Object.assign({}, a, { qi: num(a.qi), chosen: idx(a.chosen), correct: num(a.correct) })) }));
    out.vocabQuizzes = arr(out.vocabQuizzes).map(r => Object.assign({}, r, { date: when(r.date), score: num(r.score), total: num(r.total) || 1, wrong: arr(r.wrong).map(w => Object.assign({}, w, { vocabId: String(w.vocabId ?? '') })).filter(w => okKey(w.vocabId)) }));
    ['mcq', 'translate'].forEach(k => { if (out[k] === undefined) return; const m = {}; Object.entries(obj(out[k])).filter(([id]) => okKey(id)).forEach(([id, r]) => { r = obj(r); m[id] = Object.assign({}, r, { tries: num(r.tries), ok: num(r.ok) }, k === 'mcq' ? { chosen: idx(r.chosen) } : {}); }); out[k] = m; });
    if (out.myWords !== undefined) out.myWords = cleanItems(out.myWords, 'vocab');
    if (out.mcqTests !== undefined) out.mcqTests = arr(out.mcqTests).map(r => Object.assign({}, r, { date: when(r.date), score: num(r.score), total: num(r.total) || 1, secs: r.secs == null ? null : num(r.secs) }));
    const b = obj(out.bookmarks); out.bookmarks = { vocab: arr0(b.vocab), articles: arr0(b.articles) };
    return out;
  }
  const arr0 = x => Array.isArray(x) ? x.filter(y => typeof y === 'string') : [];
  // Ids end up in HTML attributes and lookups, so anything from outside this device (files, the cloud) is checked.
  const SAFE_ID = /^[A-Za-z0-9_.:-]{1,80}$/;
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const cleanIds = list => Array.isArray(list) ? list.filter(id => typeof id === 'string' && SAFE_ID.test(id)) : [];
  function cleanItems(list, kind) {
    return (Array.isArray(list) ? list : []).filter(isObj).map(x => {
      x = Object.assign({}, x);
      if (typeof x.id !== 'string' || !SAFE_ID.test(x.id)) x.id = uid(kind === 'article' ? 'art' : 'v');
      if (kind === 'article') {
        x.title = String(x.title ?? ''); x.passage = String(x.passage ?? ''); x.tags = Array.isArray(x.tags) ? x.tags.map(String) : [];
        x.questions = (Array.isArray(x.questions) ? x.questions : []).filter(q => isObj(q) && Array.isArray(q.options))
          .map(q => Object.assign({}, q, { q: String(q.q ?? ''), options: q.options.map(o => String(o ?? '')), answer: Number.isInteger(q.answer) ? q.answer : 0 }));
      } else x.word = String(x.word ?? '');
      return x;
    });
  }
  const SETTING_KEYS = ['examName', 'examNameEn', 'examDate', 'studentName', 'motto', 'teacherCode', 'teacherEmail'];
  function cleanSettings(st) {
    const out = {}; if (isObj(st)) SETTING_KEYS.forEach(k => { if (typeof st[k] === 'string') out[k] = st[k]; });
    if (out.examDate && !/^\d{4}-\d{2}-\d{2}$/.test(out.examDate)) delete out.examDate;
    return out;
  }
  const cleanReports = list => (Array.isArray(list) ? list : []).filter(isObj).map(r => ({ id: typeof r.id === 'string' && SAFE_ID.test(r.id) ? r.id : uid('rep'), name: String(r.name ?? ''), exportedAt: typeof r.exportedAt === 'string' ? r.exportedAt : null, progress: cleanProgress(r.progress) }));
  const cleanAccounts = list => (Array.isArray(list) ? list : []).filter(isObj).map(a => Object.assign({}, a, { id: typeof a.id === 'string' && SAFE_ID.test(a.id) ? a.id : uid('u'), email: String(a.email ?? ''), name: String(a.name ?? ''), role: a.role === 'teacher' ? 'teacher' : 'student' }));

  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { data = null; }
    if (!data) data = { settings: clone(SEED_DATA.settings), articles: clone(SEED_DATA.articles), vocab: clone(SEED_DATA.vocab), progress: emptyProgress(), studentReports: [], accounts: [] };
    data.settings = Object.assign(clone(SEED_DATA.settings), cleanSettings(data.settings));
    data.articles = cleanItems(data.articles, 'article');
    data.vocab = cleanItems(data.vocab, 'vocab');
    data.progress = cleanProgress(data.progress);
    data.studentReports = cleanReports(data.studentReports);
    data.accounts = cleanAccounts(data.accounts);
    data.hiddenVocab = cleanIds(data.hiddenVocab);
    data.hiddenArticles = cleanIds(data.hiddenArticles);
    if (typeof data.progressOwner !== 'string') data.progressOwner = null;
    const OLD_UNITS = { 'Unit 1 學習與健康': 'Unit 1 · Study & Health', 'Unit 2 文化與生活': 'Unit 2 · Culture & Life', 'Unit 3 商業與書信': 'Unit 3 · Business & Letters', 'Unit 4 統測高頻字': 'Unit 4 · High-frequency Words', '統測 B 級': 'Reading · B1', '統測 應用文': 'Reading · Practical' };
    const OLD_TAGS = { '健康': 'Health', '科普': 'Science', '文化': 'Culture', '生活': 'Life', '書信': 'Letter', '商業': 'Business' };
    data.vocab.forEach(v => { if (OLD_UNITS[v.unit]) v.unit = OLD_UNITS[v.unit]; });
    data.articles.forEach(a => { if (OLD_UNITS[a.level]) a.level = OLD_UNITS[a.level]; if (Array.isArray(a.tags)) a.tags = a.tags.map(x => OLD_TAGS[x] || x); });
    if (data.settings.motto === 'Practice makes perfect. 每天 10 個單字、1 篇文章！') data.settings.motto = SEED_DATA.settings.motto;
    // keep built-in passages up to date: add new ones (unless the teacher deleted them) and upgrade untouched originals
    const contentHash = a => { const s = a.passage + '|' + a.questions.map(q => q.q + q.options.join('') + q.answer).join('|'); let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return (x >>> 0).toString(36); };
    const ORIGINAL = { a1: '1fbtow3', a2: '8z06fz', a3: 'f6vfhn' };
    data.seedArticles = data.seedArticles || data.articles.map(a => a.id);
    let synced = false;
    SEED_DATA.articles.forEach(sa => {
      const i = data.articles.findIndex(a => a.id === sa.id);
      if (i < 0) { if (!data.seedArticles.includes(sa.id)) { data.articles.push(clone(sa)); synced = true; } }
      else if (!data.articles[i].edited && ORIGINAL[sa.id] && contentHash(data.articles[i]) === ORIGINAL[sa.id] && contentHash(sa) !== ORIGINAL[sa.id]) { data.articles[i] = clone(sa); synced = true; }
      if (!data.seedArticles.includes(sa.id)) { data.seedArticles.push(sa.id); synced = true; }
    });
    if (synced) { try { localStorage.setItem(LS_DATA, JSON.stringify(data)); } catch (e) { } }
    if (!data.settings.teacherCode) data.settings.teacherCode = SEED_DATA.settings.teacherCode;
    return data;
  }
  function save() { rebuildVocab(); rebuildArticles(); localStorage.setItem(LS_DATA, JSON.stringify(state)); scheduleSync(); }

  let state = load();

  /* ---------------- Built-in library (library.js) + custom words ---------------- */
  const CEFR = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B1', 5: 'B2', 6: 'B2', 7: 'B2+' };
  const LIBRARY = (window.VOCAB_LIBRARY_RAW || []).map(r => {
    // [id, word, pos, zh, syn, example, level, type, unit]
    const type = r[7] || 'word';
    const level = r[6];
    const cefr = type === 'word' ? (CEFR[level] || '') : String(level || '');
    const unit = r[8] || (type === 'word' ? `lv${level}` : 'ph0');
    return { id: r[0], word: r[1], pos: r[2], zh: r[3], syn: r[4] || '', example: r[5] || '', level, cefr, type, unit, lib: true };
  });
  const LIBMAP = {}; LIBRARY.forEach(v => { LIBMAP[v.id] = v; });
  function unitLabel(u) {
    if (!u) return '';
    let m = /^lv(\d)$/.exec(u); if (m) return tf('unitLv', { n: m[1], c: CEFR[m[1]] || '' });
    m = /^ph(\d+)$/.exec(u); if (m) return `${t('unitPh')} · ${t('phCat' + m[1]) === 'phCat' + m[1] ? '' : t('phCat' + m[1])}`.replace(/ · $/, '');
    const map = t('seedUnits'); return (map && typeof map === 'object' && map[u]) || u;
  }
  // Built-in reading library (reading-library.js) + the teacher's own and edited passages (state.articles)
  const READ_LIB = (window.READING_LIBRARY || []).map(a => Object.assign({ lib: true }, a));
  let ARTICLES = [];
  function rebuildArticles() {
    const hidden = new Set(state.hiddenArticles || []), own = new Set(state.articles.map(a => a.id));
    ARTICLES = state.articles.concat(READ_LIB.filter(a => !own.has(a.id) && !hidden.has(a.id)));
  }
  const articleById = id => ARTICLES.find(a => a.id === id);
  let VOCAB = [], VMAP = {};
  function rebuildVocab() {
    const hidden = new Set(state.hiddenVocab || []);
    const custom = (state.vocab || []).concat((state.progress && state.progress.myWords) || []).map(v => Object.assign({ type: 'word' }, v));
    const overrides = {}; custom.forEach(v => { if (LIBMAP[v.id]) overrides[v.id] = v; });
    const customOnly = custom.filter(v => !LIBMAP[v.id]);
    const lib = LIBRARY.filter(v => !hidden.has(v.id)).map(v => overrides[v.id] ? Object.assign({}, v, overrides[v.id], { lib: true }) : v);
    VOCAB = customOnly.concat(lib);
    VMAP = {}; VOCAB.forEach(v => { VMAP[v.id] = v; });
  }
  rebuildVocab();
  rebuildArticles();
  const pickRandom = (arr, n, excludeId) => { const out = [], used = new Set(); let guard = 0; while (out.length < n && guard++ < n * 20 && used.size < arr.length) { const i = Math.floor(Math.random() * arr.length); if (used.has(i)) continue; used.add(i); const x = arr[i]; if (x.id === excludeId) continue; out.push(x); } return out; };
  let ui = Object.assign({ lang: 'en', font: 'hand', theme: 'navy', user: null },
    (() => { try { return JSON.parse(localStorage.getItem(LS_UI) || '{}'); } catch (e) { return {}; } })());
  const saveUi = () => localStorage.setItem(LS_UI, JSON.stringify({ lang: ui.lang, font: ui.font, theme: ui.theme, user: ui.user }));
  Object.defineProperty(ui, 'teacher', { get: () => !!(ui.user && ui.user.role === 'teacher') });

  // volatile view state
  const view = { page: 'home', articleId: null, answers: {}, submitted: false, editing: null, flash: null, flashSetup: { mode: 'due', unit: '', shuffle: true, limit: 30 }, quiz: null, quizSetup: { type: 'choice', count: 10, unit: '' }, vocabSearch: '', vocabUnit: '', vocabEdit: null, bulkOpen: false, studentSource: 'local', cloudStudents: [], authMode: 'login', vocabBm: false };

  /* ---------------- i18n ---------------- */
  const t = (k) => (I18N[ui.lang] && I18N[ui.lang][k] !== undefined) ? I18N[ui.lang][k] : (I18N.zh[k] !== undefined ? I18N.zh[k] : k);
  const tf = (k, o) => t(k).replace(/\{(\w+)\}/g, (_, n) => o[n]);
  function applyI18n() {
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.documentElement.lang = ui.lang === 'zh' ? 'zh-Hant' : 'en';
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------------- Progress helpers ---------------- */
  const INTERVALS = [0, 1, 3, 7]; // days until next review for box 0..3
  function card(id) { return state.progress.cards[id] || (state.progress.cards[id] = { box: 0, seen: 0, correct: 0, wrong: 0, last: null, due: todayStr() }); }
  function bumpDay() { const d = todayStr(); state.progress.days[d] = (state.progress.days[d] || 0) + 1; }
  function markCard(id, known) {
    const c = card(id);
    c.seen++; c.last = new Date().toISOString();
    if (known) { c.correct++; c.box = Math.min(3, c.box + 1); }
    else { c.wrong++; c.box = 0; }
    c.due = addDays(todayStr(), INTERVALS[c.box]);
    bumpDay();
  }
  function dueCards() { const td = todayStr(); return VOCAB.filter(v => { const c = state.progress.cards[v.id]; return c && c.seen > 0 && c.due <= td; }); }
  function newCards() { return VOCAB.filter(v => !state.progress.cards[v.id] || state.progress.cards[v.id].seen === 0); }
  function masteredCount() { return VOCAB.filter(v => (state.progress.cards[v.id] || {}).box === 3).length; }
  function streak(progress = state.progress) {
    let n = 0, d = todayStr();
    if (!progress.days[d]) d = addDays(d, -1);
    while (progress.days[d]) { n++; d = addDays(d, -1); }
    return n;
  }
  function daysLeft() {
    const ex = new Date(state.settings.examDate + 'T00:00:00');
    const td = new Date(todayStr() + 'T00:00:00');
    return Math.round((ex - td) / 86400000);
  }

  /* ---------------- Auth (local or Supabase) ---------------- */
  // busy: an account is loading, so nothing is uploaded yet. contentOk: the shared material was read from the
  // cloud on this device, so a teacher's save may replace it.
  // epoch: bumped by every login and logout, so a slow, older account load can never apply its result
  const cloud = { configured: false, enabled: false, ready: null, sb: null, syncTimer: null, seq: 0, epoch: 0, busy: 0, contentOk: false, lastContent: '', teacherCode: '', warned: false };
  const LS_UNSYNCED = 'tve_exam_unsynced_v1'; // id of the account whose latest practice has not reached the cloud
  const LS_STASH = 'tve_exam_stash_v1'; // { accountId: progress } practice set aside when that account signed out before uploading
  const readStash = () => { try { const s = JSON.parse(localStorage.getItem(LS_STASH) || '{}'); return isObj(s) ? s : {}; } catch (e) { return {}; } };
  const writeStash = (s) => { if (Object.keys(s).length) localStorage.setItem(LS_STASH, JSON.stringify(s)); else localStorage.removeItem(LS_STASH); };
  async function sha(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return 'x' + (h >>> 0).toString(16);
  }
  const loadScript = (src) => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => { el.remove(); rej(new Error('cannot load ' + src)); }; document.head.appendChild(el); });
  const sbCheck = ({ data, error }) => { if (error) throw error; return data; };
  function initCloud() {
    const cfg = window.SUPABASE_CONFIG;
    if (!cfg || !/^https:\/\/[^\s/]+/.test(cfg.url || '') || !cfg.anonKey) return;
    cloud.configured = true;
    const ep = cloud.epoch;
    cloud.ready = (async () => {
      if (!window.supabase) await loadScript('vendor/supabase.js');
      if (!cloud.sb) cloud.sb = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data, error } = await cloud.sb.auth.getSession();
      // offline: keep the saved account and try again when the connection is back
      if (error && window.supabase.isAuthRetryableFetchError && window.supabase.isAuthRetryableFetchError(error)) throw error;
      const u = data && data.session && data.session.user;
      if (u) await cloudAfterLogin(u, ep);
      else if (ui.user && ep === cloud.epoch) { if (ui.user.cloud) leaveCloudAccount(ui.user); ui.user = null; saveUi(); }
      cloud.enabled = true;
      try { await pullContent(); } catch (e) { console.warn(e); }
      if (u && localStorage.getItem(LS_UNSYNCED) === u.id) syncNow().catch(e => console.warn(e));
      applyUi(); render();
    })().catch(e => { console.warn('Supabase init failed', e); cloud.enabled = false; toast('☁️ ' + t('cloudDown')); });
  }
  // back online after starting offline: connect again and upload what was practised meanwhile
  window.addEventListener('online', () => {
    if (!cloud.configured) return;
    if (!cloud.enabled) initCloud();
    else if (ui.user && ui.user.cloud && localStorage.getItem(LS_UNSYNCED) === ui.user.id) syncNow().catch(e => console.warn(e));
  });
  async function cloudAfterLogin(u, ep) {
    cloud.busy++;
    try {
      const prof = sbCheck(await cloud.sb.from('profiles').select('name, role').eq('id', u.id).maybeSingle()) || {};
      const user = { id: u.id, email: u.email, name: prof.name || u.email, role: prof.role === 'teacher' ? 'teacher' : 'student', cloud: true };
      const teacherCode = user.role === 'teacher' ? sbCheck(await cloud.sb.rpc('get_teacher_code')) || '' : '';
      const row = sbCheck(await cloud.sb.from('progress').select('data').eq('user_id', u.id).maybeSingle());
      if (ep !== cloud.epoch) return false; // someone logged in or out meanwhile
      // whose practice is on this device? (decided after loading, so practice done while loading counts)
      const owner = state.progressOwner || null, flag = localStorage.getItem(LS_UNSYNCED), stash = readStash();
      if (owner && owner !== u.id && flag === owner) { stash[owner] = state.progress; writeStash(stash); } // another account's unsent work
      let push = false;
      if (stash[u.id]) { state.progress = cleanProgress(stash[u.id]); push = true; }
      else if (owner === u.id && flag === u.id) push = true;
      else if (row && isObj(row.data) && Object.keys(row.data).length) state.progress = cleanProgress(row.data);
      else if (!owner || owner === u.id) push = true; // practice done before signing up becomes this account's
      else state.progress = emptyProgress();
      state.progressOwner = u.id;
      if (user.role !== 'teacher' && !state.settings.studentName) state.settings.studentName = user.name;
      localStorage.setItem(LS_DATA, JSON.stringify(state));
      if (push) {
        const seq = cloud.seq;
        await pushProgress(u.id);
        const s = readStash(); delete s[u.id]; writeStash(s);
        if (seq === cloud.seq && localStorage.getItem(LS_UNSYNCED) === u.id) localStorage.removeItem(LS_UNSYNCED);
      }
      if (ep !== cloud.epoch) return false;
      ui.user = user; saveUi(); cloud.teacherCode = teacherCode;
      // the invite code typed at sign-up is only needed once, by the database
      if (u.user_metadata && u.user_metadata.teacher_code) cloud.sb.auth.updateUser({ data: { teacher_code: null } }).catch(() => {});
      return true;
    } finally { cloud.busy--; }
  }
  const CONTENT_SETTINGS = ['examName', 'examNameEn', 'examDate', 'motto', 'teacherEmail'];
  async function pullContent() {
    if (!cloud.sb || !ui.user || !ui.user.cloud) return;
    const row = sbCheck(await cloud.sb.from('content').select('data').eq('id', 'main').maybeSingle());
    const c = row && row.data;
    if (isObj(c) && Object.keys(c).length) {
      if (Array.isArray(c.articles)) state.articles = cleanItems(c.articles, 'article'); if (Array.isArray(c.vocab)) state.vocab = cleanItems(c.vocab, 'vocab');
      if (Array.isArray(c.hiddenVocab)) state.hiddenVocab = cleanIds(c.hiddenVocab); if (Array.isArray(c.hiddenArticles)) state.hiddenArticles = cleanIds(c.hiddenArticles);
      // an empty teacher setting never wipes what the student typed (e.g. the teacher email)
      const cs = cleanSettings(c.settings); CONTENT_SETTINGS.forEach(k => { if (cs[k]) state.settings[k] = cs[k]; });
      rebuildVocab(); rebuildArticles();
      localStorage.setItem(LS_DATA, JSON.stringify(state));
      cloud.lastContent = JSON.stringify(contentPayload());
      cloud.contentOk = true;
    } else {
      cloud.contentOk = true; // nothing shared yet: the first teacher save creates it
      if (ui.teacher) await pushContent();
    }
  }
  function contentPayload() {
    const settings = {}; CONTENT_SETTINGS.forEach(k => { settings[k] = state.settings[k] || ''; });
    return { articles: state.articles, vocab: state.vocab, hiddenVocab: state.hiddenVocab || [], hiddenArticles: state.hiddenArticles || [], settings };
  }
  async function pushContent() {
    if (!cloud.sb || !ui.teacher || !ui.user.cloud) return;
    // never replace the class material from a device that could not read it first
    if (!cloud.contentOk) { if (!cloud.warned) { cloud.warned = true; toast(t('contentNotLoaded')); } return; }
    const data = contentPayload(), json = JSON.stringify(data);
    if (json === cloud.lastContent) return;
    sbCheck(await cloud.sb.from('content').upsert({ id: 'main', data }));
    cloud.lastContent = json;
  }
  async function pushProgress(id = ui.user && ui.user.cloud && ui.user.id) {
    if (!cloud.sb || !id || state.progressOwner !== id) return;
    sbCheck(await cloud.sb.from('progress').upsert({ user_id: id, data: state.progress }));
  }
  async function syncNow() {
    if (!cloud.enabled || cloud.busy || !ui.user || !ui.user.cloud) return;
    const seq = cloud.seq, id = ui.user.id;
    await Promise.all([pushProgress(id), pushContent()]);
    if (seq === cloud.seq && localStorage.getItem(LS_UNSYNCED) === id) localStorage.removeItem(LS_UNSYNCED);
  }
  function scheduleSync() {
    if (!ui.user || !ui.user.cloud) return;
    // remembered even offline or while the account is still loading, so the practice is uploaded later
    cloud.seq++; localStorage.setItem(LS_UNSYNCED, ui.user.id);
    if (!cloud.enabled || cloud.busy) return;
    clearTimeout(cloud.syncTimer);
    cloud.syncTimer = setTimeout(() => { syncNow().catch(e => toast('☁️ ' + e.message)); }, 1500);
  }
  // the list holds names only; a student's record is downloaded when the teacher opens it
  async function loadCloudStudents() {
    const [profs, rows] = await Promise.all([
      cloud.sb.from('profiles').select('id, email, name').eq('role', 'student').order('name').then(sbCheck),
      cloud.sb.from('progress').select('user_id, updated_at').then(sbCheck)]);
    const when = new Map(rows.map(r => [r.user_id, r.updated_at]));
    view.cloudStudents = profs.map(p => ({ id: 'cloud_' + p.id, uid: p.id, name: p.name || p.email || t('roleStudent'), email: p.email || '', exportedAt: when.get(p.id) || null, progress: null }));
  }
  async function loadStudentProgress(rep) {
    if (rep.tried) return; rep.tried = true;
    try {
      const row = sbCheck(await cloud.sb.from('progress').select('data, updated_at').eq('user_id', rep.uid).maybeSingle());
      rep.progress = cleanProgress(row && row.data); if (row) rep.exportedAt = row.updated_at;
    } catch (e) { rep.progress = emptyProgress(); toast('☁️ ' + e.message); }
    render();
  }
  async function cloudReady() {
    if (cloud.ready) await cloud.ready;
    if (cloud.configured && !cloud.enabled) { initCloud(); await cloud.ready; } // the connection may be back
    if (cloud.configured && !cloud.enabled) throw new Error(t('cloudDown'));
    return cloud.enabled;
  }

  async function registerUser({ email, pass, name, role, code }) {
    if (!email || !pass || !name) throw new Error(t('needFields'));
    if (await cloudReady()) {
      if (role === 'teacher' && !code) throw new Error(t('badCode'));
      const meta = role === 'teacher' ? { name, teacher_code: code } : { name };
      const ep = ++cloud.epoch;
      const data = sbCheck(await cloud.sb.auth.signUp({ email, password: pass, options: { data: meta, emailRedirectTo: location.origin + location.pathname } }));
      if (!data.session) { const e = new Error(t('checkEmail')); e.notice = true; throw e; }
      if (!await cloudAfterLogin(data.user, ep)) throw new Error(t('cloudDown'));
      try { await pullContent(); } catch (e) { console.warn(e); }
      return role === 'teacher' && !ui.teacher ? 'teacherCodeRejected' : null;
    }
    if (role === 'teacher' && code !== (state.settings.teacherCode || '')) throw new Error(t('badCode'));
    const key = email.trim().toLowerCase();
    if (state.accounts.some(a => a.email === key)) throw new Error(t('userExists'));
    const acc = { id: uid('u'), email: key, name, role, hash: await sha(key + ':' + pass), createdAt: new Date().toISOString() };
    state.accounts.push(acc); save();
    ui.user = { id: acc.id, email: key, name, role, cloud: false }; saveUi();
    if (role === 'student' && !state.settings.studentName) { state.settings.studentName = name; save(); }
    return null;
  }
  async function loginUser({ email, pass }) {
    if (!email || !pass) throw new Error(t('needFields'));
    if (await cloudReady()) {
      const ep = ++cloud.epoch;
      const data = sbCheck(await cloud.sb.auth.signInWithPassword({ email, password: pass }));
      if (!await cloudAfterLogin(data.user, ep)) throw new Error(t('cloudDown'));
      try { await pullContent(); } catch (e) { console.warn(e); }
      return;
    }
    const key = email.trim().toLowerCase();
    const acc = state.accounts.find(a => a.email === key);
    if (!acc || acc.hash !== await sha(key + ':' + pass)) throw new Error(t('loginFail'));
    ui.user = { id: acc.id, email: key, name: acc.name, role: acc.role, cloud: false }; saveUi();
    if (acc.role === 'student' && !state.settings.studentName) { state.settings.studentName = acc.name; save(); }
  }
  // practice that could not be uploaded is set aside for this account (and uploaded at its next login);
  // the next person on this device starts with a clean record
  function leaveCloudAccount(me) {
    if (localStorage.getItem(LS_UNSYNCED) === me.id && state.progressOwner === me.id) { const s = readStash(); s[me.id] = state.progress; writeStash(s); }
    localStorage.removeItem(LS_UNSYNCED);
    state.progress = emptyProgress(); state.progressOwner = null;
    if (state.settings.studentName === me.name) state.settings.studentName = '';
    localStorage.setItem(LS_DATA, JSON.stringify(state));
  }
  async function logoutUser() {
    cloud.epoch++;
    if (ui.user && ui.user.cloud) {
      const me = ui.user;
      clearTimeout(cloud.syncTimer);
      try { await syncNow(); } catch (e) { }
      leaveCloudAccount(me);
      // 'local' signs out this device only, so a student's phone stays signed in
      if (cloud.sb) try { await cloud.sb.auth.signOut({ scope: 'local' }); } catch (e) { }
      cloud.lastContent = ''; cloud.teacherCode = ''; cloud.contentOk = false; cloud.warned = false;
    }
    ui.user = null; saveUi(); view.cloudStudents = [];
    if (view.page === 'students') view.page = 'home';
  }

  /* ---------------- Exam time plan (light, no timer page) ---------------- */
  const TIME_PLAN = [['secVocab', 8, '#6f9cff'], ['secDialog', 8, '#5ccfb0'], ['secCloze', 14, '#f2b84b'], ['secReading', 40, '#ff8fab'], ['secWriting', 15, '#b28dff'], ['secCheck', 10, '#9aa7bd'], ['secBuffer', 5, '#d5dbe6']];
  const fmtDur = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
  function dailySentence(dateStr = todayStr()) {
    const list = window.DAILY_SENTENCES || []; if (!list.length) return null;
    const dayNum = Math.floor(Date.UTC(+dateStr.slice(0, 4), +dateStr.slice(5, 7) - 1, +dateStr.slice(8, 10)) / 86400000);
    return list[((dayNum % list.length) + list.length) % list.length];
  }
  function dailyCard() {
    const d = dailySentence(); if (!d) return '';
    const hl = d.word ? esc(d.en).replace(new RegExp('(' + d.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), `<b title="${esc(d.wordZh || '')}">$1</b>`) : esc(d.en);
    return `<div class="card daily-card"><span class="ribbon">💬</span>
      <div class="daily-label">${t('dailyTitle')} · ${todayStr().replace(/-/g, '/')}</div>
      <div class="daily-en">“${hl}”</div>
      ${d.src ? `<div class="daily-src">— ${esc(d.src)}</div>` : ''}
      <div class="daily-zh">${esc(d.zh)}</div>
      <div class="row" style="margin-top:8px">${d.word ? `<span class="chip info"><span class="en">${esc(d.word)}</span> · ${esc(d.wordZh || '')}</span>` : ''}<span class="spacer"></span><button class="btn sm ghost" data-action="speak" data-word="${esc(d.en)}">🔊 ${t('listen')}</button></div>
    </div>`;
  }
  function timePlanCard() {
    const total = TIME_PLAN.reduce((a, x) => a + x[1], 0);
    const segs = TIME_PLAN.map(([k, m, c]) => `<div class="tp-seg" style="flex:${m};background:${c}" title="${esc(t(k))} ${m} ${t('min')}"><span>${m}</span></div>`).join('');
    const legend = TIME_PLAN.map(([k, m, c]) => `<span class="tp-leg"><i style="background:${c}"></i>${esc(t(k))} <b>${m}′</b></span>`).join('');
    const mark = (min, key) => `<div class="tp-mark" style="left:${min / total * 100}%"><span>${esc(t(key))}</span></div>`;
    return `<div class="card timeplan">
      <div class="row" style="justify-content:space-between"><b>${total} ${t('min')}</b><span class="small muted">${t('tpScore')}</span></div>
      <div class="tp-bar">${segs}</div>
      <div class="tp-marks">${mark(30, 'tpMark30')}${mark(50, 'tpMark50')}</div>
      <div class="tp-legend">${legend}</div>
      <ul class="tp-tips"><li>${t('tpTip1')}</li><li>${t('tpTip2')}</li><li>${t('tpTip3')}</li></ul>
      <a class="small" href="docs/tve-english-exam-guide.pdf" target="_blank" rel="noopener">${t('pdfLink')}</a>
    </div>`;
  }

  /* ---------------- Bookmarks ---------------- */
  const bm = () => { const p = state.progress; if (!p.bookmarks) p.bookmarks = { vocab: [], articles: [] }; return p.bookmarks; };
  const isBm = (kind, id) => bm()[kind].includes(id);
  function toggleBm(kind, id) { const l = bm()[kind]; const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.push(id); save(); toast(i >= 0 ? t('bookmarkRemoved') : t('bookmarkAdded')); }
  const bmBtn = (kind, id, sm = true) => `<button class="btn ${sm ? 'sm' : ''} bm-btn ${isBm(kind, id) ? 'on' : ''}" data-action="toggleBm" data-kind="${kind}" data-id="${esc(id)}" title="${t('bookmark')}">${isBm(kind, id) ? t('removeBookmark') : t('addBookmark')}</button>`;

  /* ---------------- Speech ---------------- */
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.9;
    speechSynthesis.speak(u);
  }
  function speakStop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  /* ---------------- Pages ---------------- */
  function pageHome() {
    const dl = daysLeft();
    const due = dueCards().length, nw = newCards().length;
    const recent = state.progress.readingQuizzes.slice(-5).reverse();
    const name = state.settings.studentName ? `${esc(state.settings.studentName)}，` : '';
    return `
      <div class="banner"><picture><source srcset="img/banner-static.svg" media="(prefers-reduced-motion: reduce)"><img src="img/banner.svg" alt="" class="banner-img" width="1400" height="220"></picture></div>
      <div class="stat-grid">
        <div class="stat-card"><span class="ribbon">🔤</span><div class="k">${t('statVocab')}</div><div class="v">${VOCAB.length}</div><div class="s">${VOCAB.filter(v => v.type === 'phrase').length ? `${VOCAB.filter(v => v.type === 'word').length} ${t('typeWord')} + ${VOCAB.filter(v => v.type === 'phrase').length} ${t('typePhrase')}` : t('statVocabS')}</div></div>
        <div class="stat-card"><span class="ribbon">📖</span><div class="k">${t('statArticles')}</div><div class="v">${ARTICLES.length}</div><div class="s">${t('statArticlesS')}</div></div>
        <div class="stat-card"><span class="ribbon">🌟</span><div class="k">${t('statMastered')}</div><div class="v">${masteredCount()} <span class="small muted">/ ${VOCAB.length}</span></div><div class="s">${t('statMasteredS')}</div></div>
        <div class="stat-card"><span class="ribbon">⏰</span><div class="k">${t('statDue')}</div><div class="v">${due}</div><div class="s">${t('statDueS')}</div></div>
      </div>
      ${dailyCard()}
      ${state.settings.motto ? `<div class="card" style="margin-top:14px;border-style:dashed"><b>💬 ${t('motto')}：</b> ${name}${esc(state.settings.motto)}</div>` : ''}
      <h2 class="section-title">🗓️ ${t('todayPlan')}</h2>
      <p class="section-sub">${t('todayPlanSub')} · 🔥 ${t('streak')} ${streak()} ${t('streakDays')}</p>
      <div class="list">
        <div class="list-item"><span>🃏</span><div class="grow"><div class="title">${t('taskReview')}</div><div class="meta">${due} ${t('statDueS')}</div></div><button class="btn sm accent" data-action="goFlash" data-mode="due">${t('go')}</button></div>
        <div class="list-item"><span>✨</span><div class="grow"><div class="title">${t('taskNew')}</div><div class="meta">${nw} ${t('statVocabS')}</div></div><button class="btn sm accent" data-action="goFlash" data-mode="new">${t('go')}</button></div>
        <div class="list-item"><span>📖</span><div class="grow"><div class="title">${t('taskRead')}</div><div class="meta">${ARTICLES.length} ${t('statArticlesS')}</div></div><button class="btn sm accent" data-action="nav" data-page="reading">${t('go')}</button></div>
      </div>
      <h2 class="section-title">⏱️ ${t('timePlanTitle')}</h2>
      <p class="section-sub">${t('timePlanSub')}</p>
      ${timePlanCard()}
      <div style="margin-top:24px">${worldMapCard(dl)}</div>
      <h2 class="section-title">🔖 ${t('bookmarks')}</h2>
      ${homeBookmarks()}
      <h2 class="section-title">🏅 ${t('recentQuiz')}</h2>
      ${recent.length ? `<div class="list">${recent.map(r => `<div class="list-item"><div class="grow"><div class="title">${esc(r.title)}</div><div class="meta">${fmtDate(r.date)}</div></div><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span></div>`).join('')}</div>` : `<p class="muted">${t('noQuiz')}</p>`}
    `;
  }

  function worldMapCard(dl) {
    const W = window.WORLD_DOTS; if (!W) return '';
    const step = 10, cols = W.rows[0].length, rows = W.rows.length;
    // natural colours: green land, earth-toned deserts / steppe / tundra, on a blue ocean; dots drawn as toy-brick studs
    const COL = { rain: '#2f8f4e', temp: '#5dbb63', boreal: '#3d8a63', steppe: '#c9b071', desert: '#dba65a', tundra: '#a99d7c' };
    const hash = (a, b) => { const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return h - Math.floor(h); };
    const biome = (lat, lon, r, c) => {
      lat += hash(r, c) * 6 - 3; lon += hash(c + 7, r + 3) * 6 - 3; // soften region edges
      const inb = (a, b, x, y) => lat >= a && lat <= b && lon >= x && lon <= y;
      if (lat >= 62 || (lon > -60 && lon < -15 && lat > 58)) return 'tundra';
      if (inb(14, 34, -18, 60) || inb(24, 40, 44, 72) || inb(22, 38, -118, -102) || inb(-31, -18, 116, 145) || inb(-30, -17, 11, 26) || inb(-50, -18, -76, -67) || inb(2, 13, 39, 52)) return 'desert';
      if (inb(38, 50, 50, 118) || inb(34, 50, -112, -98) || inb(-38, -28, -68, -60)) return 'steppe';
      if (Math.abs(lat) <= 11) return 'rain';
      return lat >= 50 ? 'boreal' : 'temp';
    };
    const paths = {}; let sea = '', shine = '';
    W.rows.forEach((row, r) => { for (let c = 0; c < cols; c++) {
      const x = c * step + step / 2, y = r * step + step / 2;
      if (row[c] === '.') { sea += `M${x} ${y}h0`; continue; }
      const k = biome(W.lat0 - r * W.step, -180 + c * W.step + W.step / 2, r, c);
      paths[k] = (paths[k] || '') + `M${x} ${y}h0`; shine += `M${x - 1.3} ${y - 1.3}h0`;
    } });
    const dots = `<path d="${sea}" stroke="#ffffff" stroke-opacity=".16" stroke-width="2.8" stroke-linecap="round"/>`
      + Object.entries(paths).map(([k, d]) => `<path d="${d}" stroke="${COL[k]}" stroke-width="7.6" stroke-linecap="round"/>`).join('')
      + `<path d="${shine}" stroke="#ffffff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>`;
    const xy = (lon, lat) => [((lon + 180) / W.step) * step, ((W.lat0 - lat) / W.step) * step + step / 2];
    const [tx, ty] = xy(121, 23.5), [lx, ly] = xy(-118, 34), [nx, ny] = xy(-74, 40.7), [ux, uy] = xy(-0.1, 51.5), [sx, sy] = xy(151, -33.9), [cx, cy] = xy(-79.4, 43.7);
    const pin = (x, y, label, anchor = 'start') => `<circle cx="${x}" cy="${y}" r="7" fill="#ff6b81" stroke="#fff" stroke-width="2"/><text x="${x + (anchor === 'end' ? -12 : 12)}" y="${y + 6}" class="map-pin-label desk-only" text-anchor="${anchor}">${esc(label)}</text>`;
    const arc = tx < lx ? `M${tx},${ty} Q${(tx + lx) / 2},${Math.min(ty, ly) - 140} ${lx},${ly}` : `M${tx},${ty} Q${tx + 300},${ty - 160} ${cols * step},${ly - 60}`;
    return `<div class="map-card"><span class="map-count">📅 ${state.settings.examDate.replace(/-/g, '/')} · ${dl > 0 ? tf('daysLeftShort', { n: dl }) : dl === 0 ? t('today') : t('examChipPassed')}</span>
      <h3>🌍 ${t('mapTitle')}</h3><p>${t('mapSub')}</p>
      <svg viewBox="0 0 ${cols * step} ${rows * step}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${dots}
        <path d="${arc}" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 10" opacity=".85"/>
        <path d="M0,${ly - 60} Q${lx / 2},${ly - 160} ${lx},${ly}" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 10" opacity=".85"/>
        <g><g transform="scale(1.5)"><path d="M14 0 4 -2.4 -2 -12 -6 -12 -2.6 -2.4 -10 -2.4 -13 -6.5 -15.5 -6.5 -13.5 0 -15.5 6.5 -13 6.5 -10 2.4 -2.6 2.4 -6 12 -2 12 4 2.4Z" fill="#ffffff" stroke="#1f3b73" stroke-width="1.2" stroke-linejoin="round"/></g><animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="${arc}"/></g>
        ${pin(lx, ly, 'Los Angeles')}${pin(nx, ny, 'New York')}${pin(ux, uy, 'London', 'end')}${pin(sx, sy, 'Sydney')}${pin(cx, cy, 'Toronto', 'end')}
        <g transform="translate(${tx},${ty})"><g><polygon points="0,-16 5,-5 16,-4 8,4 10,15 0,9 -10,15 -8,4 -16,-4 -5,-5" fill="#ff6b81" stroke="#fff" stroke-width="2"/><animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="1.6s" repeatCount="indefinite"/></g>
        <text x="20" y="6" class="map-pin-label desk-only">Taiwan · ${esc(t('youAreHere'))}</text><text x="-26" y="-26" class="map-pin-label mobile-only" text-anchor="end">Taiwan · ${esc(t('youAreHere'))}</text></g>
      </svg></div>`;
  }
  function homeBookmarks() {
    const b = bm();
    const words = b.vocab.map(id => VOCAB.find(v => v.id === id)).filter(Boolean);
    const arts = b.articles.map(articleById).filter(Boolean);
    if (!words.length && !arts.length) return `<div class="card bookmark-card"><span class="ribbon">🔖</span><p class="muted" style="margin:0">${t('noBookmarks')}</p></div>`;
    return `<div class="card bookmark-card"><span class="ribbon">🔖</span>
      ${arts.length ? `<div class="bm-group"><b>📖 ${t('bookmarkedArticles')}</b><div class="bm-list">${arts.map(a => `<button class="bm-tag" data-action="openArticleHome" data-id="${esc(a.id)}">${esc(a.title)}</button>`).join('')}</div></div>` : ''}
      ${words.length ? `<div class="bm-group"><b>🔤 ${t('bookmarkedWords')}</b> <span class="small muted">(${words.length})</span><div class="bm-list">${words.map(v => `<span class="bm-tag word en" title="${esc(v.zh)}">${esc(v.word)}<small>${esc(v.zh)}</small></span>`).join('')}</div>
        <div style="margin-top:8px"><button class="btn sm accent" data-action="goFlash" data-mode="bookmark">${t('startPractice')} · ${t('modeBookmark')}</button></div></div>` : ''}
    </div>`;
  }

  /* ---- Multiple choice (選擇題): window.MCQ_ITEMS (mcq.js) + cloze passages window.CLOZE_SETS (cloze.js) ---- */
  const MC_TYPES = [['vocab', 'mcVocab', '🔤'], ['grammar', 'mcGrammar', '📐'], ['dialogue', 'mcDialogue', '💬'], ['cloze', 'mcCloze', '🧩']];
  const mcItems = () => window.MCQ_ITEMS || [];
  const clozeSets = () => window.CLOZE_SETS || [];
  const mcRec = id => (state.progress.mcq || {})[id];
  const L4 = 'ABCD';
  function mcRecord(id, chosen, answer) {
    const p = state.progress; p.mcq = p.mcq || {};
    const r = p.mcq[id] || { tries: 0, ok: 0 }, ok = chosen === answer;
    p.mcq[id] = { tries: r.tries + 1, ok: r.ok + (ok ? 1 : 0), lastOk: ok, chosen, last: new Date().toISOString() };
  }
  // every answerable unit: single items, and each blank of a cloze passage ("C01-2")
  function mcUnits() {
    const u = mcItems().map(it => ({ id: it.id, type: it.type, level: it.level, q: it.q, options: it.options, answer: it.answer, explain: it.explain }));
    clozeSets().forEach(c => c.blanks.forEach((b, k) => u.push({ id: `${c.id}-${k + 1}`, type: 'cloze', level: c.level, q: `${c.title} (${k + 1})`, options: b.options, answer: b.answer, explain: b.explain })));
    return u;
  }
  function mcStats(progress) {
    const rec = progress.mcq || {}, units = mcUnits(), byType = {};
    MC_TYPES.forEach(([k]) => { byType[k] = { done: 0, right: 0, total: 0 }; });
    units.forEach(u => { const b = byType[u.type]; if (!b) return; b.total++; const r = rec[u.id]; if (r) { b.done++; if (r.lastOk) b.right++; } });
    const wrong = units.filter(u => rec[u.id] && !rec[u.id].lastOk).map(u => Object.assign({ chosenIdx: rec[u.id].chosen, wrongTimes: rec[u.id].tries - rec[u.id].ok }, u))
      .sort((a, b) => b.wrongTimes - a.wrongTimes);
    const done = Object.values(byType).reduce((s, b) => s + b.done, 0), right = Object.values(byType).reduce((s, b) => s + b.right, 0);
    return { byType, wrong, done, right, total: units.length };
  }
  const mcQ = q => esc(q).replace(/_{3,}/g, '<span class="mc-blank"></span>').replace(/\n/g, '<br>');
  function pageMcq() {
    if (!mcItems().length && !clozeSets().length) return `<h2 class="section-title" style="margin-top:8px">📝 ${t('mcTitle')}</h2><div class="card"><p class="muted" style="margin:0">${t('mcNoItems')}</p></div>`;
    if (view.mc) return view.mc.done ? mcResults() : (view.mc.kind === 'cloze' ? mcClozeStage() : mcStage());
    const f = view.mcf || (view.mcf = { type: '', level: '', status: '', mode: 'practice', count: 10 });
    const S = mcStats(state.progress);
    const count = f.type === 'cloze' ? mcClozeFiltered().length : mcFiltered().length;
    return `<h2 class="section-title" style="margin-top:8px">📝 ${t('mcTitle')}</h2><p class="section-sub">${tf('mcSub', { n: mcItems().length, c: clozeSets().length })}</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="k">${t('mcAnswered')}</div><div class="v">${S.done} <span class="small muted">/ ${S.total}</span></div></div>
        <div class="stat-card"><div class="k">${t('trRight')}</div><div class="v">${S.done ? Math.round(S.right / S.done * 100) + '%' : '—'}</div><div class="s">${S.right} / ${S.done}</div></div>
        <div class="stat-card"><div class="k">${t('trToReview')}</div><div class="v">${S.wrong.length}</div></div>
      </div>
      <div class="card">
        <div class="phr-cats" style="padding-top:0">
          <button class="phr-cat ${!f.type ? 'on' : ''}" data-action="mcType" data-v=""><b>🎯 ${t('mcMixed')}</b><span>${mcItems().length}</span></button>
          ${MC_TYPES.map(([k, l, ic]) => { const b = S.byType[k]; return `<button class="phr-cat ${f.type === k ? 'on' : ''}" data-action="mcType" data-v="${k}"><b>${ic} ${t(l)}</b><span>${k === 'cloze' ? tf('mcClozeCount', { n: clozeSets().length }) : b.total}${b.done ? ` · ${Math.round(b.right / b.done * 100)}%` : ''}</span></button>`; }).join('')}
        </div>
        <div class="row">
          <div class="seg" role="group">${[['', t('newsAll')], ['B1', 'B1'], ['B2', 'B2']].map(([v, l]) => `<button class="seg-btn ${f.level === v ? 'on' : ''}" data-action="mcLevel" data-v="${v}">${l}</button>`).join('')}</div>
          <div class="seg" role="group">${[['', t('trAll')], ['todo', t('trTodo')], ['wrong', t('trWrongOnly')]].map(([v, l]) => `<button class="seg-btn ${f.status === v ? 'on' : ''}" data-action="mcStatus" data-v="${v}">${l}</button>`).join('')}</div>
        </div>
        <div class="row" style="margin-top:10px">
          <div class="seg" role="group">${[['practice', '✏️ ' + t('mcPractice')], ['test', '⏱️ ' + t('mcTest')]].map(([v, l]) => `<button class="seg-btn ${f.mode === v ? 'on' : ''}" data-action="mcMode" data-v="${v}">${l}</button>`).join('')}</div>
          <div class="seg" role="group">${(f.type === 'cloze' ? [1, 2, 4] : [10, 20, 30]).map(n => `<button class="seg-btn ${f.count === n ? 'on' : ''}" data-action="mcCount" data-v="${n}">${f.type === 'cloze' ? tf('mcNPassages', { n }) : tf('mcNQ', { n })}</button>`).join('')}</div>
          <span class="spacer"></span>
          <button class="btn accent" data-action="mcStart" ${count ? '' : 'disabled'}>${t('mcStart')}</button>
        </div>
        <p class="small muted" style="margin:8px 0 0">${t(f.mode === 'test' ? 'mcTestHint' : 'mcPracticeHint')} · ${tf('mcAvailable', { n: count })}</p>
      </div>
      ${(state.progress.mcqTests || []).length ? `<div class="card"><h3 style="margin-top:0">${t('mcRecent')}</h3><div class="list">${state.progress.mcqTests.slice(-8).reverse().map(r => `<div class="list-item"><span class="small muted">${fmtDate(r.date)}</span><span>${esc(r.type ? t((MC_TYPES.find(x => x[0] === r.type) || [0, 'mcMixed'])[1]) : t('mcMixed'))} · ${t(r.mode === 'test' ? 'mcTest' : 'mcPractice')}</span><span class="spacer"></span><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span>${r.secs != null ? `<span class="small muted">${fmtDur(r.secs)}</span>` : ''}</div>`).join('')}</div></div>` : ''}`;
  }
  function mcFiltered() {
    const f = view.mcf;
    return mcItems().filter(it => (!f.type || it.type === f.type) && (!f.level || it.level === f.level)
      && (!f.status || (f.status === 'todo' ? !mcRec(it.id) : (mcRec(it.id) && !mcRec(it.id).lastOk))));
  }
  function mcClozeFiltered() {
    const f = view.mcf;
    return clozeSets().filter(c => (!f.level || c.level === f.level) && (!f.status || (f.status === 'todo'
      ? c.blanks.every((b, k) => !mcRec(`${c.id}-${k + 1}`)) : c.blanks.some((b, k) => mcRec(`${c.id}-${k + 1}`) && !mcRec(`${c.id}-${k + 1}`).lastOk))));
  }
  function mcTimer(s) { return s.mode === 'test' ? `<span class="chip" id="mcTimer">⏱️ ${fmtDur(Math.round((Date.now() - s.start) / 1000))}</span>` : ''; }
  function mcStage() {
    const s = view.mc, it = mcItems().find(x => x.id === s.ids[s.i]);
    const chosen = s.answers[it.id], revealed = s.mode === 'practice' && chosen != null;
    return `<div class="row" style="margin:8px 0 12px"><button class="btn sm ghost" data-action="mcExit">${t('back')}</button><span class="spacer"></span>${mcTimer(s)}<span class="small muted">${tf('trProgress', { i: s.i + 1, n: s.ids.length })}</span></div>
      <div class="card mc-card">
        <div class="news-meta"><span class="chip">${(MC_TYPES.find(x => x[0] === it.type) || [])[2] || ''} ${esc(t((MC_TYPES.find(x => x[0] === it.type) || [0, 'mcMixed'])[1]))}</span><span class="chip">${esc(it.level || '')}</span><span class="small muted">${esc(it.id)}</span></div>
        <div class="mc-q en">${mcQ(it.q)}</div>
        <div class="mc-opts">${it.options.map((o, oi) => {
          let cls = 'option';
          if (revealed) { if (oi === it.answer) cls += ' correct'; else if (oi === chosen) cls += ' wrong'; } else if (oi === chosen) cls += ' selected';
          return `<div class="${cls}" data-action="mcChoose" data-o="${oi}" role="button" tabindex="0"><span class="letter">${L4[oi]}</span><span class="en">${esc(o)}</span></div>`;
        }).join('')}</div>
        ${revealed ? `<div class="explain">${chosen === it.answer ? '✅ ' + t('correct') : '❌ ' + t('wrong')} · ${esc(it.explain || '')}</div>` : ''}
        <div class="row"><span class="spacer"></span>${s.i > 0 && s.mode === 'test' ? `<button class="btn ghost" data-action="mcPrev">‹ ${t('pgPrev')}</button>` : ''}
          <button class="btn accent" data-action="mcNext" ${chosen == null ? 'disabled' : ''}>${s.i < s.ids.length - 1 ? t('quizNext') + ' ›' : t(s.mode === 'test' ? 'mcSubmit' : 'mcFinish')}</button></div>
      </div>`;
  }
  function mcClozeStage() {
    const s = view.mc, c = clozeSets().find(x => x.id === s.ids[s.i]);
    const checked = s.checked && s.checked[c.id];
    const passage = esc(c.passage).replace(/__(\d)__/g, (m, n) => { const a = s.answers[`${c.id}-${n}`]; const b = c.blanks[n - 1];
      const txt = a != null ? esc(b.options[a]) : ''; const cls = checked ? (a === b.answer ? 'ok' : 'bad') : (a != null ? 'filled' : '');
      return `<span class="cz-blank ${cls}"><b>${n}</b>${txt ? ' ' + txt : ''}</span>`; }).replace(/\n\s*\n/g, '<br><br>');
    return `<div class="row" style="margin:8px 0 12px"><button class="btn sm ghost" data-action="mcExit">${t('back')}</button><span class="spacer"></span>${mcTimer(s)}<span class="small muted">${tf('mcPassageN', { i: s.i + 1, n: s.ids.length })}</span></div>
      <div class="card mc-card">
        <div class="news-meta"><span class="chip">🧩 ${t('mcCloze')}</span><span class="chip">${esc(c.level || '')}</span><span class="small muted">${esc(c.id)}</span></div>
        <h3 class="en" style="margin:2px 0">${esc(c.title)}</h3>
        <div class="passage cz-passage ${ui.font === 'clean' ? 'clean' : ''}">${passage}</div>
        ${c.blanks.map((b, k) => { const id = `${c.id}-${k + 1}`, a = s.answers[id]; return `<div class="question"><div class="q">${k + 1}.</div>
          <div class="mc-opts row-opts">${b.options.map((o, oi) => { let cls = 'option'; if (checked) { if (oi === b.answer) cls += ' correct'; else if (oi === a) cls += ' wrong'; } else if (oi === a) cls += ' selected';
            return `<div class="${cls}" data-action="czChoose" data-id="${esc(id)}" data-o="${oi}" role="button" tabindex="0"><span class="letter">${L4[oi]}</span><span class="en">${esc(o)}</span></div>`; }).join('')}</div>
          ${checked ? `<div class="explain">${a === b.answer ? '✅' : '❌'} ${esc(b.explain || '')}</div>` : ''}</div>`; }).join('')}
        ${checked && c.passage_zh ? `<details class="cz-zh"><summary>${t('mcShowZh')}</summary><p>${esc(c.passage_zh).replace(/\n\s*\n/g, '<br><br>')}</p></details>` : ''}
        <div class="row" style="margin-top:12px"><span class="spacer"></span>
          ${!checked && s.mode === 'practice' ? `<button class="btn accent" data-action="czCheck">${t('mcCheck')}</button>` : `<button class="btn accent" data-action="czNext">${s.i < s.ids.length - 1 ? t('mcNextPassage') + ' ›' : t(s.mode === 'test' ? 'mcSubmit' : 'mcFinish')}</button>`}</div>
      </div>`;
  }
  function mcResults() {
    const s = view.mc;
    const units = s.kind === 'cloze'
      ? s.ids.flatMap(cid => { const c = clozeSets().find(x => x.id === cid); return c.blanks.map((b, k) => ({ id: `${cid}-${k + 1}`, q: `${c.title} (${k + 1})`, options: b.options, answer: b.answer, explain: b.explain })); })
      : s.ids.map(id => mcItems().find(x => x.id === id));
    const right = units.filter(u => s.answers[u.id] === u.answer).length;
    const wrongs = units.filter(u => s.answers[u.id] !== u.answer);
    return `<div class="card center mc-card"><div class="big-icon">${right / units.length >= .8 ? '🎉' : '💪'}</div><h2>${t('mcResult')}</h2><p class="big">${right} / ${units.length}</p>
        ${s.secs != null ? `<p class="muted">⏱️ ${fmtDur(s.secs)}</p>` : ''}
        <div class="row" style="justify-content:center"><button class="btn accent" data-action="mcStart">${t('trAgain')}</button>${wrongs.length ? `<button class="btn" data-action="mcRedo">${t('trRedoWrong')}</button>` : ''}<button class="btn ghost" data-action="mcExit">${t('back')}</button></div></div>
      ${wrongs.length ? `<h3 class="section-title">❌ ${t('mcWrongReview')}</h3>${wrongs.map(u => `<div class="card mc-review"><div class="mc-q en">${mcQ(u.q)}</div>
        <div class="small">${t('studentChose')}：<span class="chip bad en">${s.answers[u.id] != null ? L4[s.answers[u.id]] + '. ' + esc(u.options[s.answers[u.id]]) : '—'}</span> → ${t('correctIs')}：<span class="chip ok en">${L4[u.answer]}. ${esc(u.options[u.answer])}</span></div>
        <div class="explain">${esc(u.explain || '')}</div></div>`).join('')}` : ''}`;
  }
  function mcFinish() {
    const s = view.mc;
    s.secs = Math.round((Date.now() - s.start) / 1000);
    if (s.mode === 'test') {  // in a mock test, answers are recorded at the end
      if (s.kind === 'cloze') s.ids.forEach(cid => { const c = clozeSets().find(x => x.id === cid); c.blanks.forEach((b, k) => { const id = `${cid}-${k + 1}`; mcRecord(id, s.answers[id], b.answer); }); });
      else s.ids.forEach(id => { const it = mcItems().find(x => x.id === id); mcRecord(id, s.answers[id], it.answer); });
    }
    const units = s.kind === 'cloze' ? s.ids.flatMap(cid => clozeSets().find(x => x.id === cid).blanks.map((b, k) => [`${cid}-${k + 1}`, b.answer])) : s.ids.map(id => [id, mcItems().find(x => x.id === id).answer]);
    const p = state.progress; p.mcqTests = (p.mcqTests || []).concat([{ date: new Date().toISOString(), type: s.type, mode: s.mode, score: units.filter(([id, a]) => s.answers[id] === a).length, total: units.length, secs: s.secs }]).slice(-50);
    s.done = true; bumpDay(); save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- Translation practice (中譯英): window.TRANSLATION_ITEMS from translate.js ---- */
  const TR_GROUPS = ['trG1', 'trG2', 'trG3', 'trG4', 'trG5', 'trG6', 'trG7', 'trG8'];
  const trItems = () => window.TRANSLATION_ITEMS || [];
  const trGroupOf = it => Math.min(TR_GROUPS.length, Math.max(1, Math.ceil((parseInt(String(it.id).replace(/\D/g, ''), 10) || 1) / 25)));
  const trRec = id => (state.progress.translate || {})[id];
  function trFiltered() {
    const f = view.trf || (view.trf = { group: 0, level: '', status: '' });
    return trItems().filter(it => (!f.group || trGroupOf(it) === f.group) && (!f.level || it.level === f.level)
      && (!f.status || (f.status === 'todo' ? !trRec(it.id) : (trRec(it.id) && !trRec(it.id).lastOk))));
  }
  function trKeyHits(it, answer) { return (it.keys || []).map(k => ({ k, hit: noteRe(k.en).test(answer || '') })); }
  function pageTranslate() {
    const items = trItems();
    if (!items.length) return `<h2 class="section-title" style="margin-top:8px">✍️ ${t('trTitle')}</h2><div class="card"><p class="muted" style="margin:0">${t('trNoItems')}</p></div>`;
    if (view.tr) return view.tr.i >= view.tr.ids.length ? trSummary() : trStage();
    const f = view.trf || (view.trf = { group: 0, level: '', status: '' });
    const S = trStats(state.progress), list = trFiltered();
    const mark = it => { const r = trRec(it.id); return r ? (r.lastOk ? '<span class="tr-mark ok">✓</span>' : '<span class="tr-mark bad">✗</span>') : '<span class="tr-mark">·</span>'; };
    return `<h2 class="section-title" style="margin-top:8px">✍️ ${t('trTitle')}</h2><p class="section-sub">${tf('trSub', { n: items.length })}</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="k">${t('trPractised')}</div><div class="v">${S.done} <span class="small muted">/ ${items.length}</span></div></div>
        <div class="stat-card"><div class="k">${t('trRight')}</div><div class="v">${S.right}</div><div class="s">${S.done ? Math.round(S.right / S.done * 100) + '%' : ''}</div></div>
        <div class="stat-card"><div class="k">${t('trToReview')}</div><div class="v">${S.wrong.length}</div></div>
      </div>
      <div class="card">
        <div class="phr-cats" style="padding-top:0">${[0].concat(TR_GROUPS.map((_, i) => i + 1)).map(g => `<button class="phr-cat ${f.group === g ? 'on' : ''}" data-action="trGroup" data-v="${g}"><b>${g ? t(TR_GROUPS[g - 1]) : t('newsAll')}</b><span>${g ? items.filter(it => trGroupOf(it) === g).length : items.length}</span></button>`).join('')}</div>
        <div class="row">
          <div class="seg" role="group">${[['', t('newsAll')], ['B1', 'B1'], ['B2', 'B2']].map(([v, l]) => `<button class="seg-btn ${f.level === v ? 'on' : ''}" data-action="trLevel" data-v="${v}">${l}</button>`).join('')}</div>
          <div class="seg" role="group">${[['', t('trAll')], ['todo', t('trTodo')], ['wrong', t('trWrongOnly')]].map(([v, l]) => `<button class="seg-btn ${f.status === v ? 'on' : ''}" data-action="trStatus" data-v="${v}">${l}</button>`).join('')}</div>
          <span class="spacer"></span>
          <button class="btn accent" data-action="trStart" ${list.length ? '' : 'disabled'}>✍️ ${tf('trStartN', { n: Math.min(10, list.length) })}</button>
        </div>
      </div>
      <div class="tr-list">${list.map(it => `<button class="tr-row" data-action="trOne" data-id="${esc(it.id)}">${mark(it)}<span class="tr-zh">${esc(it.zh)}</span><span class="chip">${esc(it.level || '')}</span></button>`).join('') || `<p class="muted">${t('trNoMatch')}</p>`}</div>`;
  }
  function trStage() {
    const s = view.tr, it = trItems().find(x => x.id === s.ids[s.i]);
    if (!it) { view.tr = null; return pageTranslate(); }
    if (s.i >= s.ids.length) return '';
    const top = `<div class="row" style="margin:8px 0 12px"><button class="btn sm ghost" data-action="trExit">${t('back')}</button><span class="spacer"></span><span class="small muted">${tf('trProgress', { i: s.i + 1, n: s.ids.length })} · ✓ ${s.right}</span></div>`;
    const hits = s.checked ? trKeyHits(it, s.answer) : [];
    return `${top}<div class="card tr-card">
      <div class="news-meta"><span class="chip">${esc(t(TR_GROUPS[trGroupOf(it) - 1]))}</span><span class="chip">${esc(it.level || '')}</span><span class="small muted">${esc(it.id)}</span></div>
      <div class="tr-q">${esc(it.zh)}</div>
      ${s.checked ? '' : `<div class="tr-hint">${s.hint ? `💡 ${(it.keys || []).map(k => `<span class="chip"><span class="en">${esc(k.en)}</span> ${esc(k.zh)}</span>`).join(' ')}` : `<button class="btn sm ghost" data-action="trHint">💡 ${t('trShowHint')}</button>`}</div>`}
      <textarea id="trInput" class="tr-input en" rows="3" placeholder="${t('trPlaceholder')}" ${s.checked ? 'readonly' : ''} autocapitalize="sentences" spellcheck="false">${esc(s.answer || '')}</textarea>
      ${s.checked ? `<div class="tr-result">
          <div class="tr-keys">${hits.map(h => `<span class="chip ${h.hit ? 'ok' : 'bad'}">${h.hit ? '✓' : '✗'} <span class="en">${esc(h.k.en)}</span> ${esc(h.k.zh)}</span>`).join(' ')}<span class="small muted">${tf('trKeysHit', { n: hits.filter(h => h.hit).length, t: hits.length })}</span></div>
          <div class="tr-model"><b>${t('trModel')}</b><p class="en">${esc(it.en)} <button class="btn sm ghost" data-action="speak" data-word="${esc(it.en)}" aria-label="${t('speak')}">🔊</button></p>
            ${(it.alt || []).length ? `<b>${t('trAlso')}</b>${it.alt.map(a => `<p class="en">${esc(a)}</p>`).join('')}` : ''}</div>
          ${it.point ? `<div class="tr-point">📐 ${esc(it.point)}</div>` : ''}
          <p class="small muted" style="margin:4px 0 0">${t('trSelfCheck')}</p>
          <div class="row"><button class="btn accent" data-action="trMark" data-ok="1">✅ ${t('trSelfRight')}</button><button class="btn" data-action="trMark" data-ok="0">❌ ${t('trSelfWrong')}</button></div>
        </div>` : `<div class="row"><button class="btn accent" data-action="trCheck">${t('trCheck')}</button><span class="small muted">${t('trCtrlEnter')}</span></div>`}
    </div>`;
  }
  function trSummary() {
    const s = view.tr;
    return `<div class="card center tr-card"><div class="big-icon">🎉</div><h2>${t('trDone')}</h2><p class="big">${s.right} / ${s.ids.length}</p>
      <div class="row" style="justify-content:center"><button class="btn accent" data-action="trStart">${t('trAgain')}</button>${s.right < s.ids.length ? `<button class="btn" data-action="trRedo">${t('trRedoWrong')}</button>` : ''}<button class="btn ghost" data-action="trExit">${t('back')}</button></div></div>`;
  }

  /* ---- Phrases tab: the 2,800+ built-in phrases by category ---- */
  function pagerHTML(cur, pages, action, labelOf) {
    if (pages <= 1) return '';
    const span = window.innerWidth < 600 ? 1 : 2;
    const set = new Set([0, pages - 1]);
    for (let i = cur - span; i <= cur + span; i++) if (i >= 0 && i < pages) set.add(i);
    if (cur <= span + 2) for (let i = 0; i < Math.min(pages, span * 2 + 3); i++) set.add(i);
    if (cur >= pages - span - 3) for (let i = Math.max(0, pages - span * 2 - 3); i < pages; i++) set.add(i);
    const arr = [...set].sort((a, b) => a - b), nums = [];
    arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) nums.push('…'); nums.push(n); });
    return `<div class="pager">
      <button class="pg-btn" data-action="${action}" data-p="${cur - 1}" ${cur === 0 ? 'disabled' : ''} aria-label="${t('pgPrev')}">‹</button>
      ${nums.map(n => n === '…' ? '<span class="pg-gap">…</span>' : `<button class="pg-btn pg-num ${n === cur ? 'on' : ''}" data-action="${action}" data-p="${n}" ${n === cur ? 'aria-current="page"' : ''}>${n + 1}</button>`).join('')}
      <button class="pg-btn" data-action="${action}" data-p="${cur + 1}" ${cur >= pages - 1 ? 'disabled' : ''} aria-label="${t('pgNext')}">›</button>
      <select class="input pager-sel" data-pager="${action}" aria-label="${t('pgJump')}">${Array.from({ length: pages }, (_, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${t('pgJumpTo')} ${i + 1}${labelOf ? ' · ' + esc(labelOf(i)) : ''}</option>`).join('')}</select>
    </div>`;
  }
  const PHR_PAGE = 24;
  function pagePhrases() {
    const f = view.phr || (view.phr = { cat: '', level: '', q: '', bm: false, page: 0 });
    const all = VOCAB.filter(v => v.type === 'phrase');
    const cats = Array.from({ length: 10 }, (_, i) => 'ph' + (i + 1));
    const box = id => (state.progress.cards[id] || {}).box || 0;
    const q = f.q.trim().toLowerCase();
    const list = all.filter(v => (!f.cat || v.unit === f.cat) && (!f.level || v.cefr === f.level) && (!f.bm || isBm('vocab', v.id))
      && (!q || v.word.toLowerCase().includes(q) || (v.zh || '').includes(f.q.trim()) || (v.syn || '').toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(list.length / PHR_PAGE)), cur = Math.min(f.page, pages - 1);
    const shown = list.slice(cur * PHR_PAGE, cur * PHR_PAGE + PHR_PAGE);
    const inCat = f.cat ? all.filter(v => v.unit === f.cat) : all;
    const mastered = inCat.filter(v => box(v.id) === 3).length;
    const exampleHTML = v => { if (!v.example) return ''; const re = noteRe(v.word.replace(/\([^)]*\)/g, ' ').replace(/…|\.\.\./g, ' ')); return markTerms(v.example, [{ re, cls: 'lp' }]); };
    const pager = pagerHTML(cur, pages, 'phrGo', i => (list[i * PHR_PAGE] || {}).word || '');
    return `<h2 class="section-title" style="margin-top:8px">🧩 ${t('phrTitle')}</h2><p class="section-sub">${tf('phrSub', { n: all.length })}</p>
      <div class="phr-cats">
        <button class="phr-cat ${!f.cat ? 'on' : ''}" data-action="phrCat" data-v=""><b>${t('newsAll')}</b><span>${all.length}</span></button>
        ${cats.map(c => { const n = all.filter(v => v.unit === c).length; return n ? `<button class="phr-cat ${f.cat === c ? 'on' : ''}" data-action="phrCat" data-v="${c}"><b>${esc(t('phCat' + c.slice(2)))}</b><span>${n}</span></button>` : ''; }).join('')}
      </div>
      <div class="card phr-tools">
        <div class="row">
          <input type="text" id="phrSearch" placeholder="🔍 ${t('phrSearch')}" value="${esc(f.q)}" style="max-width:300px">
          <div class="seg" role="group">${[['', t('newsAll')], ['B1', 'B1'], ['B2', 'B2']].map(([v, l]) => `<button class="seg-btn ${f.level === v ? 'on' : ''}" data-action="phrLevel" data-v="${v}">${l}</button>`).join('')}</div>
          <button class="btn sm ${f.bm ? 'accent' : 'ghost'}" data-action="phrBm">🔖 ${t('modeBookmark')}</button>
          <span class="spacer"></span>
          <span class="small muted">${tf('phrMastered', { n: mastered, t: inCat.length })}</span>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn accent" data-action="phrFlash">🃏 ${t('phrPractice')}</button>
          <button class="btn" data-action="phrQuiz">📝 ${t('phrQuiz')}</button>
          <span class="small muted">${f.cat ? esc(t('phCat' + f.cat.slice(2))) : t('phrAllCats')}</span>
        </div>
      </div>
      <p class="small muted" style="margin:6px 2px">${tf('phrCount', { n: list.length })}</p>
      ${list.length ? `<div class="phr-grid">${shown.map(v => `<article class="phr-card">
        <div class="phr-head"><span class="phr-word en">${esc(v.word)}</span><span class="chip">${esc(v.cefr || '')}</span>${box(v.id) === 3 ? `<span class="chip ok">✓ ${t('level3')}</span>` : ''}</div>
        <div class="phr-zh">${esc(v.zh)}</div>
        ${v.example ? `<div class="phr-ex en">${exampleHTML(v)}</div>` : ''}
        ${v.syn ? `<div class="small muted en">≈ ${esc(v.syn)}</div>` : ''}
        <div class="row phr-acts"><button class="btn sm ghost" data-action="speak" data-word="${esc(v.example || v.word)}" aria-label="${t('speak')}">🔊</button>${bmBtn('vocab', v.id)}<span class="spacer"></span><span class="small muted">${esc(t('phCat' + String(v.unit || '').slice(2)))}</span></div>
      </article>`).join('')}</div>${pager}` : `<div class="card"><p class="muted" style="margin:0">${t('phrNone')}</p></div>`}`;
  }

  /* ---- Daily English news (news.json is refreshed every morning by a GitHub Action) ---- */
  const news = { status: 'idle', data: null, source: '' };
  async function loadNews() {
    news.status = 'loading';
    try {
      const r = await fetch('news.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      news.data = await r.json();
      news.status = (news.data.items || []).length ? 'ok' : 'empty';
    } catch (e) { news.status = 'error'; }
    if (view.page === 'news') render();
  }
  /* ---- News study notes: key words, phrases and grammar in a story ---- */
  let WORDMAP = null;
  function lemmas(w) {
    w = w.toLowerCase(); const out = [w];
    const add = x => { if (x.length > 2 && !out.includes(x)) out.push(x); };
    if (/ies$/.test(w)) add(w.slice(0, -3) + 'y');
    if (/(s|x|ch|sh)es$/.test(w)) add(w.slice(0, -2));
    if (/[^s]s$/.test(w)) add(w.slice(0, -1));
    if (/ied$/.test(w)) add(w.slice(0, -3) + 'y');
    if (/ed$/.test(w)) { add(w.slice(0, -1)); add(w.slice(0, -2)); if (/(.)\1ed$/.test(w)) add(w.slice(0, -3)); }
    if (/ing$/.test(w)) { add(w.slice(0, -3) + 'e'); add(w.slice(0, -3)); if (/(.)\1ing$/.test(w)) add(w.slice(0, -4)); }
    if (/ly$/.test(w)) add(w.slice(0, -2));
    return out;
  }
  function findWord(w, minLevel = 0) {
    if (!WORDMAP) { WORDMAP = {}; LIBRARY.forEach(v => { if (v.type === 'word' && /^[a-z]+$/.test(v.word) && !WORDMAP[v.word]) WORDMAP[v.word] = v; }); }
    for (const x of lemmas(w)) { const v = WORDMAP[x]; if (v) return v.level >= minLevel ? v : null; }
    return null;
  }
  function highlightWords(title) {
    return esc(title).replace(/\b([A-Za-z]{4,})\b/g, (m, w) => { const v = findWord(w, 3); return v ? `<span class="nw" title="${esc(v.zh)}">${m}</span>` : m; });
  }
  // Split at . ! ? followed by a capital letter or quote, but not after initials such as "U.S." (no regex
  // lookbehind: older iPhone Safari cannot parse it)
  function splitSentences(text) {
    const out = [];
    String(text || '').split(/\n+/).forEach(line => {
      const re = /[.!?]+["”’']*\s+(?=[A-Z"“‘'])/g; let start = 0, m;
      while ((m = re.exec(line))) {
        if (/(^|[\s.])[A-Z]$/.test(line.slice(start, m.index))) continue;
        out.push(line.slice(start, m.index + m[0].length).trim()); start = m.index + m[0].length;
      }
      if (line.slice(start).trim()) out.push(line.slice(start).trim());
    });
    return out;
  }
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Wrap matches of each term in <span class="..">, escaping everything else. Longer terms win where they overlap.
  function markTerms(text, terms) {
    const hits = [];
    terms.forEach(tm => { tm.re.lastIndex = 0; let m; while ((m = tm.re.exec(text))) { if (!m[0]) { tm.re.lastIndex++; continue; } hits.push({ s: m.index, e: m.index + m[0].length, tm }); } });
    hits.sort((a, b) => (b.e - b.s) - (a.e - a.s) || a.s - b.s);
    const used = []; hits.forEach(h => { if (!used.some(u => h.s < u.e && u.s < h.e)) used.push(h); });
    used.sort((a, b) => a.s - b.s);
    let out = '', i = 0;
    used.forEach(h => { out += esc(text.slice(i, h.s)) + `<span class="${h.tm.cls}"${h.tm.title ? ` title="${esc(h.tm.title)}"` : ''}>${esc(text.slice(h.s, h.e))}</span>`; i = h.e; });
    return out + esc(text.slice(i));
  }
  const termRe = s => new RegExp(`\\b${s.trim().split(/\s+/).map(escRe).join('[\\s,]+')}\\b`, 'gi');

  // Phrases from the built-in list as regular expressions: verb forms, "be" forms, and gaps for sb/sth/one's.
  const IRREG = { be: "am is are was were been being isn't aren't wasn't weren't", can: "can't cannot could couldn't", will: "won't would wouldn't", understand: 'understood', become: 'became', sleep: 'slept', wake: 'woke woken', have: 'has had having', do: 'does did done doing', go: 'goes went gone going', get: 'gets got gotten getting', make: 'made', take: 'took taken', give: 'gave given', come: 'came', keep: 'kept', bring: 'brought', find: 'found', hold: 'held', stand: 'stood', catch: 'caught', think: 'thought', run: 'ran running', put: 'putting', set: 'setting', cut: 'cutting', let: 'letting', break: 'broke broken', fall: 'fell fallen', grow: 'grew grown', show: 'shown', see: 'saw seen', know: 'knew known', tell: 'told', say: 'said', pay: 'paid', lead: 'led', leave: 'left', sit: 'sat sitting', wear: 'wore worn', throw: 'threw thrown', draw: 'drew drawn', write: 'wrote written', drive: 'drove driven', eat: 'ate eaten', begin: 'began begun beginning', deal: 'dealt', feel: 'felt', hang: 'hung', lay: 'laid', lie: 'lay lain lying', lose: 'lost', mean: 'meant', meet: 'met', send: 'sent', sell: 'sold', spend: 'spent', stick: 'stuck', strike: 'struck', teach: 'taught', buy: 'bought', fight: 'fought', win: 'won winning', speak: 'spoke spoken', wake: 'woke woken', rise: 'rose risen', ride: 'rode ridden', fly: 'flew flown', shake: 'shook shaken', choose: 'chose chosen', forget: 'forgot forgotten', hide: 'hid hidden', build: 'built', light: 'lit', shoot: 'shot', blow: 'blew blown', dig: 'dug digging', swim: 'swam swum swimming', stop: 'stopped stopping', drop: 'dropped dropping', plan: 'planned planning', shut: 'shutting', hit: 'hitting', step: 'stepped stepping', carry: 'carried carries', try: 'tried tries', rely: 'relied relies', apply: 'applied applies', worry: 'worried worries' };
  const NOT_VERB = new Set('a an the in on at by for of to as from with out up off over under into onto all so no not and or but than more most less least very too much many such what how when where who which one each every this that these those it its after before about around'.split(' '));
  const POSS = "(?:my|your|his|her|its|our|their|one's|[a-z]+'s)";
  const PARTICLES = new Set('on up off out down in over away back around about through along apart aside'.split(' '));
  const PHRASE_SKIP = new Set(['come to sth', 'come to']);
  function verbForms(v) {
    const f = new Set([v, v + 's', v + 'ed', v + 'd', v + 'ing', v + 'er', v + 'est']);
    if (/e$/.test(v)) { f.add(v.slice(0, -1) + 'ing'); f.add(v + 'd'); f.add(v + 'r'); f.add(v + 'st'); }  // safe → safer
    if (/(s|x|z|ch|sh|o)$/.test(v)) f.add(v + 'es');
    if (/[^aeiou]y$/.test(v)) { f.add(v.slice(0, -1) + 'ies'); f.add(v.slice(0, -1) + 'ied'); f.add(v.slice(0, -1) + 'ier'); f.add(v.slice(0, -1) + 'iest'); }
    if (/[^aeiou][aeiou][bdgklmnprt]$/.test(v)) { f.add(v + v.slice(-1) + 'ed'); f.add(v + v.slice(-1) + 'ing'); f.add(v + v.slice(-1) + 'er'); f.add(v + v.slice(-1) + 'est'); }  // jog → jogging
    (IRREG[v] || '').split(' ').filter(Boolean).forEach(x => f.add(x));
    return Array.from(f).sort((a, b) => b.length - a.length);
  }
  // A study note in dictionary form ("flock to", "leave sb empty-handed", "summon") matched in running text:
  // inflected first word, "be" forms, sb/sth as a short gap (same rule as scripts/make_lessons.py)
  function noteRe(note) {
    const toks = String(note || '').toLowerCase().split(/\s+/).filter(Boolean);
    const gap = x => /^(sb|sth|sb\/sth|someone|something|somebody)$/.test(x);
    while (toks.length && gap(toks[toks.length - 1])) toks.pop();
    if (!toks.length) return /$^/g;
    // every content word may be inflected, and up to 4 extra words may come in between ("cares deeply about")
    const sep = "(?:[\\s,]+[\\w'’-]+){0,4}[\\s,]+";
    let src = '\\b';
    toks.forEach((x, i) => {
      if (gap(x)) { src += "(?:[\\w'’-]+[\\s,]+){1,3}"; return; }
      x = { "can't": 'can', cannot: 'can', "won't": 'will', "isn't": 'be', "aren't": 'be', "don't": 'do', "doesn't": 'do', "didn't": 'do' }[x] || x;
      let w;
      if (/^(one's|sb's)$/.test(x)) w = POSS;
      else if (/^[a-z]+$/.test(x) && (!NOT_VERB.has(x) || IRREG[x])) w = `(?:${verbForms(x).map(escRe).join('|').replace(/'/g, "['’]")})`;
      else w = escRe(x).replace(/'/g, "['’]");
      src += w + (i < toks.length - 1 ? (gap(toks[i + 1]) ? '[\\s,]+' : sep) : '');
    });
    return new RegExp(src + '(?![\\w])', 'gi');
  }
  let PHRASE_RES = null;
  function phraseRes() {
    if (PHRASE_RES) return PHRASE_RES;
    PHRASE_RES = [];
    LIBRARY.forEach(v => {
      if (v.type !== 'phrase') return;
      const toks = v.word.replace(/\([^)]*\)/g, ' ').replace(/[…]|\.\.\./g, ' ').split(/\s+/).map(x => x.replace(/[,;:!?]+$/, '')).filter(Boolean);
      const isGap = x => /^(sb|sth|sb\/sth|someone|something|somebody|V|v-ing|V-ing|A|B|Z)$/.test(x);
      if (PHRASE_SKIP.has(v.word)) return;
      while (toks.length && isGap(toks[0])) toks.shift();
      const tailGap = toks.length && isGap(toks[toks.length - 1]);
      while (toks.length && isGap(toks[toks.length - 1])) toks.pop();
      const lit = toks.filter(x => !isGap(x) && !/^(one's|sb's)$/.test(x));
      if (lit.length < 2 || lit.join('').length < 6) return;
      const parts = toks.map((x, i) => {
        if (isGap(x)) return null;
        if (/^(one's|sb's)$/.test(x)) return POSS;
        const lx = x.toLowerCase();
        if (i === 0 && !NOT_VERB.has(lx) && /^[a-z]+$/.test(lx)) return `(?:${verbForms(lx).join('|')})`;
        return escRe(x);
      });
      let src = '\\b';
      // "V sb on/up/off…" with nothing after the particle: allow only a one-word object (him, it, Tom) to avoid false hits
      const shortGap = !tailGap && PARTICLES.has(toks[toks.length - 1]);
      parts.forEach((p, i) => {
        if (p === null) { src += (shortGap && i === parts.length - 2) ? "[\\w'’-]+[\\s,]+" : "(?:[\\w'’-]+[\\s,]+){1,3}"; return; }
        src += p + (i < parts.length - 1 ? '[\\s,]+' : '');
      });
      src += '\\b';
      try { PHRASE_RES.push({ v, re: new RegExp(src, 'gi'), len: lit.join(' ').length }); } catch (e) { /* skip odd entries */ }
    });
    return PHRASE_RES;
  }
  const PP = "(?:\\w{3,}ed|known|made|given|taken|seen|found|built|shown|done|held|written|sold|told|paid|kept|left|brought|thought|caught|taught|bought|chosen|driven|eaten|fallen|forgotten|hidden|broken|spoken|stolen|worn|won|grown|thrown|drawn|led|met|hurt|cut|set|put|lost|sent|spent|struck|hung|begun)";
  const FEEL = '(?:interested|excited|worried|tired|bored|surprised|pleased|scared|married|concerned|related|based|supposed|used|need|feed|seed|speed|indeed|hundred|bleed|breed|proceed|succeed|exceed)\\b';
  const NOT_EST = '(?:forest|interest|west|request|guest|protest|contest|honest|rest|test|nest|chest|quest|harvest|modest|digest|suggest|arrest|manifest|conquest|priest|pest|vest|crest|unrest|everest|midwest|southwest|northwest|latest)\\b';
  const GRAMMAR = [
    ['passive', new RegExp(`\\b(?:am|is|are|was|were|be|been|being|gets?|got)\\s+(?:\\w+ly\\s+)?(?!${FEEL})${PP}\\b`, 'i')],
    ['perfect', new RegExp(`\\b(?:has|have|had|'ve|’ve)\\s+(?:not\\s+|never\\s+|already\\s+|just\\s+|ever\\s+|\\w+ly\\s+)?(?:been|become|come|gone|run|${PP})\\b`, 'i')],
    ['relative', /\b[A-Za-z]+,?\s+(?:who|which|whose|whom)\b/],
    ['compare', new RegExp(`\\b(?:more|less)\\s+\\w{3,}\\s+than\\b|\\b(?!rather|other)\\w{2,}er\\s+than\\b|\\bthe\\s+(?:most|least)\\s+\\w+|\\bthe\\s+(?!${NOT_EST})(?:best|worst|\\w{2,}est)\\b|\\bas\\s+\\w+\\s+as\\b`, 'i')],
    ['modal', /\b(?:[Cc]an|[Cc]ould|[Mm]ight|[Mm]ust|[Ss]hould|[Ww]ould|[Mm]ay)\s+(?:not\s+|never\s+|also\s+|still\s+)?(?:be\s+)?[a-z]+\b/],
    ['future', /\b(?:[Ww]ill|[Ww]on't|'ll|’ll)\s+(?:not\s+|never\s+|also\s+|soon\s+)?[a-z]+\b|\b(?:is|are|am)\s+going\s+to\s+[a-z]+\b/],
    ['ifClause', /\b(?:[Ii]f|[Uu]nless)\b/],
    ['whTo', /\b(?:[Hh]ow|[Ww]hat|[Ww]here|[Ww]hen|[Ww]hether)\s+to\s+[a-z]+\b/],
    ['thereBe', /\b[Tt]here\s+(?:is|are|was|were|will be|has been|have been)\b/],
    ['gerund', /^(?!(?:During|Nothing|Something|Anything|Everything|Morning|Evening|Spring|String|King|Thing|Wedding|Breaking|Ceiling|Bring|Sing|Ring|Swing|Wing|Darling|Sterling|Beijing|Viking|Pudding)\b)[A-Z][a-z]{2,}ing\b[^,.;:?!]{0,60}?\b(?:is|was|has|can|could|may|might|will|would|should|must|helps|makes|takes|gives|seems|becomes|means|keeps|requires|improves|lets)\b/],
    ['question', /\?\s*["”’']?$/],
  ];
  const gramText = k => { const g = t('gram')[k] || ['', '']; return { point: g[0], explain: g[1] }; };
  function analyzeStory(it) {
    const text = [it.title, it.summary].filter(Boolean).join('\n');
    const words = [], seenW = new Set();
    // Skip capitalised names (Turkey, Monarch, Legend of Zelda) unless the word starts a sentence or the headline is in Title Case
    const tw = (it.title || '').match(/[A-Za-z]+/g) || [];
    const titleCase = tw.length > 2 && tw.filter(w => /^[A-Z]/.test(w)).length / tw.length > 0.6;
    const re = /[A-Za-z]{4,}/g; let m;
    while ((m = re.exec(text))) {
      const w = m[0], before = text.slice(Math.max(0, m.index - 3), m.index);
      const starts = m.index === 0 || /[.!?:\n"“‘']\s*$/.test(before);
      if (/^[A-Z]/.test(w) && !starts && !(titleCase && m.index < (it.title || '').length)) continue;
      const v = findWord(w, 3); if (v && !seenW.has(v.word)) { seenW.add(v.word); words.push({ v, form: w }); }
    }
    const phrases = [], spans = [];
    phraseRes().forEach(p => { p.re.lastIndex = 0; const m = p.re.exec(text); if (m) phrases.push({ v: p.v, s: m.index, e: m.index + m[0].length, len: p.len }); });
    phrases.sort((a, b) => b.len - a.len);
    const ph = []; phrases.forEach(p => { if (!spans.some(s => p.s < s.e && s.s < p.e)) { spans.push(p); ph.push(p); } });
    const sentences = splitSentences(text);
    const grammar = [];
    GRAMMAR.forEach(([k, re]) => {
      if (grammar.length >= 4) return;
      for (const s of sentences) { const m = re.exec(s); if (m) { grammar.push(Object.assign({ k, sentence: s, s: m.index, e: m.index + m[0].length }, gramText(k))); break; } }
    });
    return { words: words.slice(0, 8), phrases: ph.slice(0, 5), grammar };
  }
  function vocabEntry(word) { for (const x of lemmas(word)) { const v = VOCAB.find(e => e.word.toLowerCase() === x); if (v) return v; } return null; }
  function saveWordBtn(word, pos, zh, ex) {
    const v = vocabEntry(word), on = v && isBm('vocab', v.id);
    return `<button class="btn sm save-word ${on ? 'on' : ''}" data-action="saveNewsWord" data-id="${v ? esc(v.id) : ''}" data-word="${esc(v ? v.word : word)}" data-pos="${esc(pos || '')}" data-zh="${esc(zh || '')}" data-ex="${esc(ex || '')}" title="${t(on ? 'removeBookmark' : 'addBookmark')}" aria-pressed="${!!on}">${on ? '★' : '☆'}</button>`;
  }
  const sentenceWith = (text, word) => splitSentences(text).find(s => { const re = noteRe(word); return re.test(s); }) || '';
  // Lessons saved before translations existed have one "passage" string instead of paragraphs
  const lessonParas = les => les.paragraphs || String(les.passage || '').split(/\n\s*\n/).filter(Boolean).map(en => ({ en, zh: '' }));
  function newsLessons() {
    const items = (news.data && news.data.items) || [], links = new Set(items.map(i => i.link));
    return ((news.data && news.data.lessons) || []).filter(l => links.has(l.link) && lessonParas(l).length);
  }
  function newsReader(les) {
    const paras = lessonParas(les), full = paras.map(p => p.en).join('\n\n');
    const showZh = view.newsZh !== false, hasZh = paras.some(p => p.zh);
    const terms = (les.vocab || []).map(v => ({ re: noteRe(v.word), cls: 'lw', title: v.zh })).concat((les.phrases || []).map(p => ({ re: noteRe(p.phrase), cls: 'lp', title: p.zh })));
    const item = ((news.data && news.data.items) || []).find(i => i.link === les.link) || {};
    return `<div class="row reader-nav" style="margin:8px auto 12px"><button class="btn sm ghost" data-action="closeNewsArticle">← ${t('newsBack')}</button></div>
      <article class="card news-reader">
        <div class="news-meta"><span class="news-src ${SRC_CLASS[les.source] || ''}">${esc(les.source)}</span>${les.topic ? `<span class="chip">${esc(les.topic)}</span>` : ''}<span class="small muted">${tf('lessonWords', { n: les.words || full.split(/\s+/).filter(Boolean).length })}${item.date ? ' · ' + ago(item.date) : ''}</span></div>
        <h2 class="reader-title en">${esc(les.title)}</h2>
        ${les.title_zh ? `<p class="reader-title-zh">${esc(les.title_zh)}</p>` : ''}
        <div class="reader-tools">
          <button class="btn sm accent" data-action="speak" data-word="${esc(full)}">🔊 ${t('lessonListen')}</button><button class="btn sm ghost" data-action="speakStop" aria-label="${t('newsStop')}">⏹</button>
          ${hasZh ? `<div class="seg" role="group" aria-label="${t('newsTransLabel')}"><button class="seg-btn ${showZh ? 'on' : ''}" data-action="newsZh" data-v="1" aria-pressed="${showZh}">${t('newsBoth')}</button><button class="seg-btn ${!showZh ? 'on' : ''}" data-action="newsZh" data-v="0" aria-pressed="${!showZh}">${t('newsEnOnly')}</button></div>` : ''}
        </div>
        <div class="reader-body">${paras.map((p, i) => `<div class="rp">
          <p class="rp-en en"><button class="rp-say" data-action="speak" data-word="${esc(p.en)}" aria-label="${t('lessonListen')} ${i + 1}">🔊</button>${markTerms(p.en, terms)}</p>
          ${p.zh && showZh ? `<p class="rp-zh">${esc(p.zh)}</p>` : ''}
        </div>`).join('')}</div>
        <p class="small muted reader-note">✍️ ${tf('newsRetold', { s: esc(les.source) })} <a href="${esc(les.link)}" target="_blank" rel="noopener noreferrer">${tf('newsRead', { s: esc(les.source) })} ↗</a></p>
        <div class="lesson-grid">
          <section class="lesson-box lb-words"><h4>🔤 ${t('lessonVocab')}</h4><ul>${(les.vocab || []).map(v => `<li><span class="lw-word en">${esc(v.word)}</span> <span class="small muted">${esc(v.pos || '')}</span> <span class="lw-zh">${esc(v.zh)}</span>${saveWordBtn(v.word, v.pos, v.zh, sentenceWith(full, v.word))}</li>`).join('')}</ul></section>
          <section class="lesson-box lb-phrases"><h4>🧩 ${t('lessonPhrases')}</h4><ul>${(les.phrases || []).map(p => `<li><span class="lp-word en">${esc(p.phrase)}</span> <span class="lw-zh">${esc(p.zh)}</span></li>`).join('')}</ul></section>
          <section class="lesson-box lb-grammar"><h4>📐 ${t('lessonGrammar')}</h4>${(les.grammar || []).map(g => `<div class="gram-item"><b>${esc(g.point)}</b><p class="small">${esc(g.explain)}</p><p class="gram-ex en">“${g.focus ? markTerms(g.example, [{ re: new RegExp(escRe(g.focus.trim()).replace(/\s+/g, '\\s+'), 'gi'), cls: 'gram-focus' }]) : esc(g.example)}”</p></div>`).join('')}</section>
        </div>
      </article>
      <div class="row reader-nav" style="margin:12px auto 0"><button class="btn sm ghost" data-action="closeNewsArticle">← ${t('newsBack')}</button></div>`;
  }
  // Show about 70 characters on each side of a match, cut at word boundaries
  function clipAround(str, s, e, pad = 70) {
    let a = Math.max(0, s - pad), b = Math.min(str.length, e + pad);
    if (a > 0) { const k = str.indexOf(' ', a); a = k >= 0 && k < s ? k + 1 : a; }
    if (b < str.length) { const k = str.lastIndexOf(' ', b); b = k > e ? k : b; }
    return { a, b, pre: a > 0 ? '…' : '', post: b < str.length ? '…' : '' };
  }
  function studyPanel(it) {
    const a = analyzeStory(it);
    const text = [it.title, it.summary].filter(Boolean).join(' ');
    const none = !a.words.length && !a.phrases.length && !a.grammar.length;
    return `<div class="study-panel">
      ${a.words.length ? `<div class="study-sec"><b>🔤 ${t('lessonVocab')}</b><ul>${a.words.map(({ v, form }) => `<li><span class="lw-word en">${esc(v.word)}</span>${form.toLowerCase() !== v.word ? ` <span class="small muted en">(${esc(form)})</span>` : ''} <span class="small muted">${esc(v.pos || '')} · ${esc(v.cefr || '')}</span> <span class="lw-zh">${esc(v.zh)}</span>${saveWordBtn(v.word, v.pos, v.zh, text)}</li>`).join('')}</ul></div>` : ''}
      ${a.phrases.length ? `<div class="study-sec"><b>🧩 ${t('lessonPhrases')}</b><ul>${a.phrases.map(p => `<li><span class="lp-word en">${esc(p.v.word)}</span> <span class="lw-zh">${esc(p.v.zh)}</span></li>`).join('')}</ul></div>` : ''}
      ${a.grammar.length ? `<div class="study-sec"><b>📐 ${t('lessonGrammar')}</b>${a.grammar.map(g => { const w = clipAround(g.sentence, g.s, g.e); return `<div class="gram-item"><b>${esc(g.point)}</b><p class="small">${esc(g.explain)}</p><p class="gram-ex en">“${w.pre}${esc(g.sentence.slice(w.a, g.s))}<mark>${esc(g.sentence.slice(g.s, g.e))}</mark>${esc(g.sentence.slice(g.e, w.b))}${w.post}”</p></div>`; }).join('')}</div>` : ''}
      ${none ? `<p class="small muted">${t('studyNone')}</p>` : ''}
      <p class="small muted study-foot">${t('studyAuto')}</p>
    </div>`;
  }
  function ago(iso) {
    if (!iso) return '';
    const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
    return h < 24 ? tf('newsAgoH', { n: h || 1 }) : tf('newsAgoD', { n: Math.round(h / 24) });
  }
  // Google's page translator: the whole original article in Traditional Chinese, on Google's site
  const gtranslate = url => `https://translate.google.com/translate?sl=en&tl=zh-TW&hl=zh-TW&u=${encodeURIComponent(url)}`;
  const SRC_CLASS = { 'CNN': 'cnn', 'CNN 10': 'cnn', 'BBC': 'bbc', 'NPR': 'npr', 'The Guardian': 'guardian', 'Taipei Times': 'taipei' };
  function pageNews() {
    if (news.status === 'idle') loadNews();
    const items = (news.data && news.data.items) || [];
    const lessons = newsLessons(), lessonOf = {}; lessons.forEach(l => { lessonOf[l.link] = l; });
    if (view.newsArticle && lessonOf[view.newsArticle]) return newsReader(lessonOf[view.newsArticle]);
    const sources = Array.from(new Set(items.map(i => i.source)));
    // stories with a full article come first, then the others; newest first within each group
    const shown = items.map((it, i) => [it, i]).filter(([it]) => !news.source || it.source === news.source).sort((a, b) => (lessonOf[a[0].link] ? 0 : 1) - (lessonOf[b[0].link] ? 0 : 1) || a[1] - b[1]);
    const open = view.newsOpen || (view.newsOpen = {});
    const upd = news.data && news.data.updated ? news.data.updated.slice(0, 16).replace('T', ' ').replace(/-/g, '/') : '';
    let body;
    if (news.status === 'loading' || news.status === 'idle') body = `<p class="muted">${t('newsLoading')}</p>`;
    else if (!items.length) body = `<div class="card news-empty">📭 ${t('newsEmpty')}</div>`;
    else body = `<div class="row" style="margin-bottom:10px"><button class="btn sm ${!news.source ? 'accent' : 'ghost'}" data-action="newsSource" data-src="">${t('newsAll')} (${items.length})</button>${sources.map(s => `<button class="btn sm ${news.source === s ? 'accent' : 'ghost'}" data-action="newsSource" data-src="${esc(s)}">${esc(s)}</button>`).join('')}<span class="spacer"></span>${upd ? `<span class="small muted">${t('newsUpdated')} ${upd} UTC</span>` : ''}</div>
      ${!lessons.length ? `<p class="small muted news-nolesson">📖 ${t(ui.teacher ? 'lessonsNoneTeacher' : 'lessonsNone')}</p>` : ''}
      <div class="news-list">${shown.map(([it, i]) => { const les = lessonOf[it.link]; return `<article class="news-card${les ? ' has-article' : ''}${open[i] ? ' open' : ''}">
        <div class="news-meta"><span class="news-src ${SRC_CLASS[it.source] || ''}">${esc(it.source)}</span><span class="chip">${esc(it.topic || '')}</span>${les ? `<span class="chip ai-chip">📖 ${t('newsFullBadge')}</span>` : ''}<span class="small muted">${ago(it.date)}</span></div>
        <h3 class="news-title en">${les ? `<button class="news-title-btn" data-action="openNewsArticle" data-link="${esc(it.link)}">${highlightWords(it.title)}</button>` : `<a href="${esc(it.link)}" target="_blank" rel="noopener noreferrer">${highlightWords(it.title)}</a>`}</h3>
        ${les && les.title_zh ? `<p class="news-title-zh">${esc(les.title_zh)}</p>` : ''}
        ${it.summary ? `<p class="news-sum en">${esc(it.summary)}</p>` : ''}
        <div class="row">${les ? `<button class="btn sm accent" data-action="openNewsArticle" data-link="${esc(it.link)}">📖 ${t('newsReadFull')}</button>` : `<button class="btn sm study-btn ${open[i] ? 'accent' : ''}" data-action="newsStudy" data-i="${i}" aria-expanded="${!!open[i]}">📘 ${t('studyBtn')}</button>`}${les ? '' : `<a class="btn sm ghost" href="${esc(gtranslate(it.link))}" target="_blank" rel="noopener noreferrer">🌐 ${t('newsGoogleZh')} ↗</a>`}<a class="btn sm ghost" href="${esc(it.link)}" target="_blank" rel="noopener noreferrer">${tf('newsRead', { s: esc(it.source) })} ↗</a><button class="btn sm ghost" data-action="speak" data-word="${esc(it.title)}" aria-label="${t('lessonListen')}">🔊</button></div>
        ${open[i] && !les ? studyPanel(it) : ''}
      </article>`; }).join('')}</div>
      <p class="small muted">💡 ${t('newsWordHint')}</p>`;
    const CUR = [
      ['CNN 10', 'https://edition.cnn.com/cnn10', 'curCnn10'],
      ['BBC Learning English', 'https://www.bbc.co.uk/learningenglish/', 'curBbcLe'],
      ['News in Levels', 'https://www.newsinlevels.com/', 'curLevels'],
      ['Breaking News English', 'https://breakingnewsenglish.com/', 'curBne'],
      ['Taipei Times', 'https://www.taipeitimes.com/', 'curTaipei'],
    ];
    return `<h2 class="section-title" style="margin-top:8px">📰 ${t('newsTitle')}</h2><p class="section-sub">${t('newsSub')}</p>
      ${body}
      <h2 class="section-title">🎧 ${t('newsSources')}</h2>
      <div class="cur-grid">${CUR.map(([n, u, k]) => `<a class="cur-card" href="${u}" target="_blank" rel="noopener noreferrer"><b>${n} ↗</b><span>${t(k)}</span></a>`).join('')}</div>`;
  }

  /* ---- Reading ---- */
  const READ_SHOW = 12;  // passages shown per level before "show more"
  function pageReading() {
    if (view.editing) return articleEditor();
    if (view.articleId) return articleView();
    const rf = view.readFilter || (view.readFilter = { topic: '', status: '', q: '', more: {} });
    rf.more = rf.more || {}; rf.q = rf.q || '';
    const histOf = id => state.progress.readingQuizzes.filter(r => r.articleId === id);
    const done = a => histOf(a.id).length > 0;
    const GROUPS = [['Reading · B1', 'grpB1', '📗'], ['Reading · B2', 'grpB2', '📘'], ['Reading · Practical', 'grpPractical', '✉️']];
    const groupOf = a => GROUPS.some(g => g[0] === a.level) ? a.level : '_other';
    const topics = Array.from(new Set(ARTICLES.flatMap(a => a.tags || [])));
    const q = rf.q.trim().toLowerCase();
    const visible = ARTICLES.filter(a => (!rf.topic || (a.tags || []).includes(rf.topic)) && (!rf.status || (rf.status === 'done') === done(a))
      && (!q || a.title.toLowerCase().includes(q) || (a.title_zh || '').includes(rf.q.trim())));
    const card = a => {
      const hist = histOf(a.id), isDone = hist.length > 0;
      const best = isDone ? Math.max(...hist.map(r => Math.round(r.score / r.total * 100))) : null;
      return `<div class="list-item read-item ${isDone ? 'is-done' : ''}">
        <span class="read-check" title="${isDone ? t('readDone') : t('readTodo')}">${isDone ? '✓' : ''}</span>
        <div class="grow" data-action="openArticle" data-id="${esc(a.id)}" style="cursor:pointer">
          <div class="title">${esc(a.title)}</div>
          ${a.title_zh ? `<div class="small muted">${esc(a.title_zh)}</div>` : ''}
          <div class="meta">${a.questions.length} ${t('questions')} · ${tf('wordsCount', { n: (a.passage || '').split(/\s+/).filter(Boolean).length })} ${(a.tags || []).map(x => `<span class="chip">${esc(unitLabel(x))}</span>`).join('')}</div>
        </div>
        ${best !== null ? `<span class="chip ${best >= 80 ? 'ok' : best >= 60 ? 'warn' : 'bad'}">${t('best')} ${best}%</span><span class="chip">${t('attempts')} ${hist.length} ${t('times')}</span>` : ''}
        ${bmBtn('articles', a.id)}
        <button class="btn sm" data-action="openArticle" data-id="${esc(a.id)}">${isDone ? t('retry') : t('go')}</button>
        <span class="teacher-only"><button class="btn sm ghost" data-action="editArticle" data-id="${esc(a.id)}">${t('editArticle')}</button> <button class="btn sm danger" data-action="deleteArticle" data-id="${esc(a.id)}">${t('deleteArticle')}</button></span>
      </div>`;
    };
    const filtering = rf.topic || rf.status || q;
    const groups = GROUPS.map(g => g[0]).concat(['_other']).map(key => {
      const all = ARTICLES.filter(a => groupOf(a) === key), list = visible.filter(a => groupOf(a) === key);
      if (!all.length) return '';
      const g = GROUPS.find(x => x[0] === key) || ['_other', 'grpOther', '📄'];
      const nd = all.filter(done).length;
      const shown = rf.more[key] || filtering ? list : list.slice(0, READ_SHOW);
      return `<section class="read-group" id="grp-${g[1]}"><h3 class="read-group-title">${g[2]} ${t(g[1])} <span class="read-progress"><span class="bar"><i style="width:${all.length ? nd / all.length * 100 : 0}%"></i></span>${nd} / ${all.length} ${t('readDoneShort')}</span></h3>
        ${list.length ? `<div class="list">${shown.map(card).join('')}</div>${shown.length < list.length ? `<div class="center" style="margin-top:8px"><button class="btn ghost" data-action="readMore" data-v="${esc(key)}">${tf('readShowMore', { n: list.length - shown.length })}</button></div>` : ''}` : `<p class="small muted">${t('readNoneHere')}</p>`}</section>`;
    }).join('');
    const totalDone = ARTICLES.filter(done).length;
    const toc = `<div class="card read-toc">
        <div class="row"><b>📑 ${t('readToc')}</b><span class="chip ok">✓ ${totalDone} / ${ARTICLES.length}</span><span class="spacer"></span>
          ${GROUPS.filter(g => ARTICLES.some(a => a.level === g[0])).map(g => `<a class="btn sm ghost" href="#grp-${g[1]}" data-action="jumpGroup" data-target="grp-${g[1]}">${g[2]} ${t(g[1])}</a>`).join('')}</div>
        <div class="row" style="margin-top:8px"><input type="text" id="readSearch" placeholder="🔍 ${t('readSearch')}" value="${esc(rf.q)}" style="max-width:320px"></div>
        <div class="row" style="margin-top:8px"><span class="small muted">${t('readTopic')}</span>
          <button class="btn sm ${!rf.topic ? 'accent' : 'ghost'}" data-action="readTopic" data-v="">${t('newsAll')}</button>
          ${topics.map(x => `<button class="btn sm ${rf.topic === x ? 'accent' : 'ghost'}" data-action="readTopic" data-v="${esc(x)}">${esc(unitLabel(x))}</button>`).join('')}</div>
        <div class="row" style="margin-top:8px"><span class="small muted">${t('readStatus')}</span>
          ${[['', t('newsAll')], ['todo', t('readTodo')], ['done', '✓ ' + t('readDone')]].map(([v, l]) => `<button class="btn sm ${rf.status === v ? 'accent' : 'ghost'}" data-action="readStatus" data-v="${v}">${l}</button>`).join('')}</div>
      </div>`;
    return `<h2 class="section-title" style="margin-top:8px">${t('readingTitle')}</h2><p class="section-sub">${t('readingSub')}</p>
      <div class="teacher-only block" style="margin-bottom:12px"><button class="btn accent" data-action="newArticle">${t('newArticle')}</button></div>
      ${ARTICLES.length ? toc + groups : `<p class="muted">${t('noArticles')}</p>`}`;
  }

  // Chinese translation of a reading passage: the teacher's own (passage_zh) or the built-in one (reading-zh.js)
  function readingZh(a) {
    const en = String(a.passage || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
    if (a.passage_zh) { const zh = String(a.passage_zh).split(/\n\s*\n/).map(x => x.trim()).filter(Boolean); return zh.length ? { title: a.title_zh || '', en, zh } : null; }
    const b = !a.edited && (window.READING_ZH || {})[a.id];
    return b && b.paragraphs.length === en.length ? { title: b.title_zh || '', en, zh: b.paragraphs } : null;
  }
  function articleView() {
    const a = articleById(view.articleId);
    if (!a) { view.articleId = null; return pageReading(); }
    const L = 'ABCD';
    const Z = readingZh(a), showZh = !!Z && (view.readZh != null ? view.readZh : view.submitted);  // translation shows after answering, or on request
    const qs = a.questions.map((q, qi) => {
      const chosen = view.answers[qi];
      return `<div class="question"><div class="q">${qi + 1}. ${esc(q.q)}</div>
        ${q.options.map((o, oi) => {
          let cls = 'option';
          if (view.submitted) { if (oi === q.answer) cls += ' correct'; else if (chosen === oi) cls += ' wrong'; }
          else if (chosen === oi) cls += ' selected';
          return `<div class="${cls}" data-action="choose" data-q="${qi}" data-o="${oi}"><span class="letter">${L[oi]}</span><span>${esc(o)}</span></div>`;
        }).join('')}
        ${view.submitted ? `<div class="explain">${chosen === q.answer ? '✅ ' + t('correct') : '❌ ' + t('wrong')}${q.explain ? ' · ' + t('explain') + '：' + esc(q.explain) : ''}</div>` : ''}
      </div>`;
    }).join('');
    let scoreHtml = '';
    if (view.submitted) {
      const sc = a.questions.filter((q, i) => view.answers[i] === q.answer).length;
      scoreHtml = `<div class="score-banner"><div>${t('yourScore')}</div><div class="big">${sc} / ${a.questions.length}</div><div>${Math.round(sc / a.questions.length * 100)}%</div>${view.readSecs != null ? `<div class="pace ${view.readSecs <= 600 ? 'ok' : 'slow'}">${tf('paceLine', { t: fmtDur(view.readSecs), p: '10:00' })}</div>` : ''}<div style="margin-top:8px"><button class="btn accent" data-action="retry">${t('retry')}</button></div></div>`;
    }
    return `<button class="btn ghost sm" data-action="backList">${t('back')}</button>
      <div class="card" style="margin-top:12px">
        <div class="row" style="align-items:flex-start"><h2 style="margin:0 0 4px;flex:1">${esc(a.title)}</h2>${bmBtn('articles', a.id)}</div>
        ${showZh && Z.title ? `<div class="reader-title-zh" style="margin:-2px 0 6px">${esc(Z.title)}</div>` : ''}
        <div class="muted small" style="margin-bottom:12px">${esc(unitLabel(a.level || ''))} ${(a.tags || []).map(x => `<span class="chip">${esc(unitLabel(x))}</span>`).join('')}</div>
        ${Z ? `<div class="reader-tools" style="margin-bottom:10px"><div class="seg" role="group" aria-label="${t('newsTransLabel')}" style="margin-left:0"><button class="seg-btn ${showZh ? 'on' : ''}" data-action="readZh" data-v="1" aria-pressed="${showZh}">${t('newsBoth')}</button><button class="seg-btn ${!showZh ? 'on' : ''}" data-action="readZh" data-v="0" aria-pressed="${!showZh}">${t('newsEnOnly')}</button></div>${!view.submitted && !showZh ? `<span class="small muted">${t('readZhHint')}</span>` : ''}</div>` : ''}
        ${showZh ? `<div class="passage passage-zh ${ui.font === 'clean' ? 'clean' : ''}">${Z.en.map((p, i) => `<div class="rp"><p class="rp-en en">${esc(p)}</p>${Z.zh[i] ? `<p class="rp-zh">${esc(Z.zh[i])}</p>` : ''}</div>`).join('')}</div>`
          : `<div class="passage ${ui.font === 'clean' ? 'clean' : ''}">${esc(a.passage)}</div>`}
        ${qs}
        ${view.submitted ? scoreHtml : `<div class="center" style="margin-top:18px"><button class="btn accent" data-action="submitQuiz" style="font-size:18px;padding:12px 30px">${t('submit')}</button></div>`}
      </div>`;
  }

  function articleEditor() {
    const a = view.editing;
    const qHtml = a.questions.map((q, i) => `<div class="q-editor" data-qi="${i}">
      <div class="field"><label>${t('qText')} ${i + 1}</label><input type="text" data-f="q" data-qi="${i}" value="${esc(q.q)}"></div>
      <div class="opts">${['optA', 'optB', 'optC', 'optD'].map((k, oi) => `<div class="opt-row"><input type="radio" name="ans${i}" data-f="ans" data-qi="${i}" value="${oi}" ${q.answer === oi ? 'checked' : ''} title="${t('correctAns')}"><input type="text" placeholder="${t(k)}" data-f="opt" data-qi="${i}" data-oi="${oi}" value="${esc(q.options[oi] || '')}"></div>`).join('')}</div>
      <div class="field" style="margin-top:8px"><label>${t('explainLbl')}</label><input type="text" data-f="explain" data-qi="${i}" value="${esc(q.explain || '')}"></div>
      <button class="btn sm danger" data-action="removeQ" data-qi="${i}">${t('removeQ')}</button>
    </div>`).join('');
    return `<button class="btn ghost sm" data-action="cancelEdit">${t('cancel')}</button>
      <div class="card" style="margin-top:12px"><span class="teacher-banner">🧑‍🏫 ${t('editorTitle')}</span>
        <div class="grid-3">
          <div class="field"><label>${t('title')}</label><input type="text" id="edTitle" value="${esc(a.title)}"></div>
          <div class="field"><label>${t('level')}</label><input type="text" id="edLevel" value="${esc(a.level || '')}"></div>
          <div class="field"><label>${t('tagsLbl')}</label><input type="text" id="edTags" value="${esc((a.tags || []).join(', '))}"></div>
        </div>
        <div class="field"><label>${t('passage')}</label><textarea id="edPassage" style="min-height:220px">${esc(a.passage)}</textarea></div>
        <div class="field"><label>${t('passageZh')}</label><textarea id="edPassageZh" style="min-height:160px" placeholder="${t('passageZhHint')}">${esc(a.passage_zh != null ? a.passage_zh : (() => { const z = !a.edited && (window.READING_ZH || {})[a.id]; return z ? z.paragraphs.join('\n\n') : ''; })())}</textarea></div>
        <h3>${t('qList')}</h3>
        <div id="qEditors">${qHtml}</div>
        <div class="row"><button class="btn ghost" data-action="addQ">${t('addQ')}</button><span class="spacer"></span><button class="btn accent" data-action="saveArticle">${t('save')}</button></div>
      </div>`;
  }
  function collectEditor() {
    const a = view.editing;
    a.title = $('#edTitle').value.trim(); a.level = $('#edLevel').value.trim();
    a.tags = $('#edTags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    a.passage = $('#edPassage').value;
    if ($('#edPassageZh')) a.passage_zh = $('#edPassageZh').value.trim();
    $$('#qEditors .q-editor').forEach((box, i) => {
      const q = a.questions[i];
      q.q = $('[data-f=q]', box).value.trim();
      q.options = $$('[data-f=opt]', box).map(x => x.value.trim());
      const r = $('[data-f=ans]:checked', box); q.answer = r ? +r.value : 0;
      q.explain = $('[data-f=explain]', box).value.trim();
    });
  }

  /* ---- Flashcards & quiz ---- */
  function units() { return Array.from(new Set(VOCAB.map(v => v.unit || ''))).filter(Boolean); }
  function unitSelect(id, val) {
    const all = units();
    const custom = all.filter(u => !LIBRARY.some(v => v.unit === u));
    const words = all.filter(u => LIBRARY.some(v => v.unit === u && v.type === 'word'));
    const phrases = all.filter(u => LIBRARY.some(v => v.unit === u && v.type === 'phrase'));
    const opt = u => `<option value="${esc(u)}" ${u === val ? 'selected' : ''}>${esc(unitLabel(u))}</option>`;
    const grp = (label, arr) => arr.length ? `<optgroup label="${esc(label)}">${arr.map(opt).join('')}</optgroup>` : '';
    const presets = [['@B1', t('presetB1')], ['@B2', t('presetB2')], ['@A', t('presetA')], ['@phrase', t('presetPhrase')], ['@custom', t('presetCustom')]].filter(p => (p[0] === '@custom' ? custom.length : p[0] === '@phrase' ? phrases.length : words.length));
    const hf = HF_SETS ? `<optgroup label="${esc(t('hfGroup'))}"><option value="@hf" ${val === '@hf' ? 'selected' : ''}>${tf('hfAll', { n: (window.HIGH_FREQ || []).length })}</option>${Array.from({ length: HF_SETS }, (_, i) => `<option value="@hf:${i + 1}" ${val === '@hf:' + (i + 1) ? 'selected' : ''}>${tf('hfSet', { n: i + 1, a: i * 100 + 1, b: Math.min((i + 1) * 100, window.HIGH_FREQ.length) })}</option>`).join('')}</optgroup>` : '';
    return `<select class="input" id="${id}"><option value="">${t('allUnits')}</option>${presets.map(p => `<option value="${p[0]}" ${p[0] === val ? 'selected' : ''}>${p[1]}</option>`).join('')}${hf}${grp(t('presetCustom'), custom)}${grp(t('libWords'), words)}${grp(t('libPhrases'), phrases)}</select>`;
  }
  // 統測高頻 3000 (highfreq.js): ids in order, most frequent first, in sets of 100
  const HF_RANK = {}; (window.HIGH_FREQ || []).forEach((id, i) => { HF_RANK[id] = i; });
  const HF_SETS = Math.ceil((window.HIGH_FREQ || []).length / 100);
  function inUnit(v, unit) {
    if (!unit) return true;
    if (unit === '@hf') return HF_RANK[v.id] !== undefined;
    if (unit.startsWith('@hf:')) { const r = HF_RANK[v.id], n = +unit.slice(4); return r !== undefined && r >= (n - 1) * 100 && r < n * 100; }
    if (unit === '@B1') return v.type === 'word' && (v.level === 3 || v.level === 4);
    if (unit === '@B2') return v.type === 'word' && (v.level === 5 || v.level === 6 || v.level === 7);
    if (unit === '@A') return v.type === 'word' && (v.level === 1 || v.level === 2);
    if (unit === '@phrase') return v.type === 'phrase';
    if (unit === '@custom') return !LIBMAP[v.id] || v.override;
    return v.unit === unit;
  }
  function poolFor(mode, unit) {
    let pool = VOCAB.filter(v => inUnit(v, unit));
    if (mode === 'due') pool = pool.filter(v => { const c = state.progress.cards[v.id]; return !c || c.seen === 0 || c.due <= todayStr(); });
    else if (mode === 'unknown') pool = pool.filter(v => { const c = state.progress.cards[v.id]; return c && c.wrong > 0 && c.box < 2; });
    else if (mode === 'new') pool = pool.filter(v => !state.progress.cards[v.id] || state.progress.cards[v.id].seen === 0);
    else if (mode === 'bookmark') pool = pool.filter(v => isBm('vocab', v.id));
    return pool;
  }

  function pageFlash() {
    if (view.flash) return flashStage();
    if (view.quiz) return quizStage();
    const fs = view.flashSetup, qsu = view.quizSetup;
    const count = poolFor(fs.mode, fs.unit).length;
    return `<h2 class="section-title" style="margin-top:8px">${t('flashTitle')}</h2><p class="section-sub">${t('flashSub')}</p>
      <div class="card">
        <div class="grid-3">
          <div class="field"><label>${t('range')}</label><select class="input" id="fsMode">
            <option value="due" ${fs.mode === 'due' ? 'selected' : ''}>${t('modeDue')} + ${t('modeNew')}</option>
            <option value="all" ${fs.mode === 'all' ? 'selected' : ''}>${t('modeAll')}</option>
            <option value="unknown" ${fs.mode === 'unknown' ? 'selected' : ''}>${t('modeUnknown')}</option>
            <option value="new" ${fs.mode === 'new' ? 'selected' : ''}>${t('modeNew')}</option>
            <option value="bookmark" ${fs.mode === 'bookmark' ? 'selected' : ''}>🔖 ${t('modeBookmark')}</option></select></div>
          <div class="field"><label>${t('unit')}</label>${unitSelect('fsUnit', fs.unit)}</div>
          <div class="field"><label>${t('shuffle')}</label><select class="input" id="fsShuffle"><option value="1" ${fs.shuffle ? 'selected' : ''}>✓ ${t('shuffle')}</option><option value="0" ${!fs.shuffle ? 'selected' : ''}>—</option></select></div>
          <div class="field"><label>${t('perRound')}</label><select class="input" id="fsLimit">${[10, 20, 30, 50, 100, 0].map(n => `<option value="${n}" ${(fs.limit ?? 30) === n ? 'selected' : ''}>${n ? n : t('allCards')}</option>`).join('')}</select></div>
        </div>
        <div class="row"><span class="muted">${count} ${t('statDueS')}${fs.limit ? ` · ${t('perRound')} ${Math.min(count, fs.limit)}` : ''}</span><span class="spacer"></span><button class="btn accent" data-action="startFlash" ${count ? '' : 'disabled'} style="font-size:18px;padding:12px 30px">${t('startPractice')}</button></div>
      </div>
      <h2 class="section-title">${t('vocabQuiz')}</h2><p class="section-sub">${t('svcQuizP')}</p>
      <div class="card">
        <div class="grid-3">
          <div class="field"><label>${t('quizType')}</label><select class="input" id="qsType">
            <option value="choice" ${qsu.type === 'choice' ? 'selected' : ''}>${t('quizChoice')}</option>
            <option value="choiceRev" ${qsu.type === 'choiceRev' ? 'selected' : ''}>${t('quizChoiceRev')}</option>
            <option value="spell" ${qsu.type === 'spell' ? 'selected' : ''}>${t('quizSpell')}</option></select></div>
          <div class="field"><label>${t('unit')}</label>${unitSelect('qsUnit', qsu.unit)}</div>
          <div class="field"><label>${t('quizCount')}</label><input type="number" id="qsCount" min="3" max="50" value="${qsu.count}"></div>
        </div>
        <div class="row"><span class="spacer"></span><button class="btn" data-action="startQuiz" ${VOCAB.length >= 4 ? '' : 'disabled'} style="font-size:18px;padding:12px 30px">${t('startQuiz')}</button></div>
      </div>`;
  }

  function flashStage() {
    const f = view.flash;
    if (f.idx >= f.queue.length) {
      return `<div class="card center"><h2>🎉 ${t('roundDone')}</h2><p style="font-size:20px">${tf('roundStats', { k: f.known.length, d: f.missed.length })}</p>
        <div class="row" style="justify-content:center"><button class="btn accent" data-action="flashAgain">${t('again')}</button>${f.missed.length ? `<button class="btn" data-action="flashMissed">${t('practiceUnknown')}</button>` : ''}<button class="btn ghost" data-action="flashExit">${t('back')}</button></div></div>`;
    }
    const v = VOCAB.find(x => x.id === f.queue[f.idx]);
    if (!v) { f.idx++; return flashStage(); }
    const c = state.progress.cards[v.id] || { box: 0 };
    const ex = v.example ? esc(v.example).replace(new RegExp('(' + v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'i'), '<b>$1</b>') : '';
    return `<div class="flash-stage">
      <div class="row" style="width:min(640px,100%)"><button class="btn ghost sm" data-action="flashExit">${t('back')}</button><span class="spacer"></span><span class="muted">${f.idx + 1} / ${f.queue.length}</span></div>
      <div class="progress-bar"><div style="width:${f.idx / f.queue.length * 100}%"></div></div>
      <div class="flash-card ${f.flipped ? 'flipped' : ''}" data-action="flip">
        <div class="flash-inner">
          <div class="flash-face flash-front"><span class="ribbon ribbon-l ribbon-${['new', 'info', 'warn', 'ok'][c.box]}" title="${t('box')}">${['🌱', '📘', '⭐', '🏆'][c.box]}</span><button class="flash-bm ${isBm('vocab', v.id) ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${esc(v.id)}" title="${t('bookmark')}">🔖</button>
            <div class="flash-word">${esc(v.word)}</div><div class="flash-pos">${esc(v.pos || '')}</div>
            <button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}" style="margin-top:14px">${t('speak')}</button>
            <span class="flash-hint">${t('tapToFlip')}</span></div>
          <div class="flash-face flash-back"><div class="flash-zh">${esc(v.zh)}</div><div class="flash-pos" style="color:#fff;opacity:.8">${esc(v.word)} ${esc(v.pos || '')}${v.cefr ? ` · ${esc(v.cefr)}` : ''}</div>${v.syn ? `<div class="flash-syn">≈ ${esc(v.syn)}</div>` : ''}${ex ? `<div class="flash-example">${ex}</div>` : ''}</div>
        </div>
      </div>
      <div class="flash-actions"><button class="btn danger" data-action="flashMark" data-known="0">${t('dontKnow')}</button><button class="btn ok" data-action="flashMark" data-known="1">${t('know')}</button></div>
    </div>`;
  }

  function buildQuiz() {
    const s = view.quizSetup;
    let pool = VOCAB.filter(v => inUnit(v, s.unit));
    if (s.type === 'spell' && pool.some(v => v.type === 'word')) pool = pool.filter(v => v.type === 'word');
    if (pool.length < 4) pool = VOCAB.slice();
    // prioritise weak/due words, then fill randomly
    const weak = shuffleArr(pool.filter(v => { const c = state.progress.cards[v.id]; return c && (c.box < 2); }));
    const rest = shuffleArr(pool.filter(v => !weak.includes(v)));
    const items = weak.concat(rest).slice(0, Math.max(3, Math.min(50, s.count | 0 || 10)));
    const qs = items.map(v => {
      let dpool = VOCAB.filter(x => x.type === v.type && x.id !== v.id && (v.type !== 'word' || !v.level || Math.abs((x.level || 3) - v.level) <= 1));
      if (dpool.length < 3) dpool = VOCAB.filter(x => x.id !== v.id);
      const distract = pickRandom(dpool, 3, v.id);
      const opts = shuffleArr([v, ...distract]);
      return { id: v.id, opts: opts.map(o => o.id) };
    });
    view.quiz = { type: s.type, qs, idx: 0, correct: 0, wrong: [], answered: false, chosen: null };
  }

  function quizStage() {
    const q = view.quiz;
    const byId = id => VOCAB.find(x => x.id === id);
    if (q.idx >= q.qs.length) {
      return `<div class="card center"><h2>📝 ${t('quizDone')}</h2><div class="score-banner"><div class="big">${tf('quizResult', { c: q.correct, t: q.qs.length })}</div></div>
        ${q.wrong.length ? `<div class="list" style="margin-top:14px;text-align:left">${q.wrong.map(w => `<div class="list-item"><div class="grow"><div class="title en">${esc(w.word)}</div><div class="meta">${esc(w.zh)}${w.given ? ` · ${t('typed')}「${esc(w.given)}」` : ''}</div></div></div>`).join('')}</div>` : ''}
        <div class="row" style="justify-content:center;margin-top:14px"><button class="btn accent" data-action="quizAgain">${t('again')}</button><button class="btn ghost" data-action="quizExit">${t('back')}</button></div></div>`;
    }
    const cur = q.qs[q.idx], v = byId(cur.id);
    if (!v) { q.idx++; return quizStage(); }
    const head = `<div class="row"><button class="btn ghost sm" data-action="quizExit">${t('back')}</button><span class="spacer"></span><span class="muted">${q.idx + 1} / ${q.qs.length} · ✅ ${q.correct}</span></div>
      <div class="progress-bar" style="margin:10px auto"><div style="width:${q.idx / q.qs.length * 100}%"></div></div>`;
    let body = '';
    if (q.type === 'spell') {
      body = `<div class="quiz-word" style="font-family:var(--font-body)">${esc(v.zh)} <span class="muted" style="font-size:18px">${esc(v.pos || '')}</span></div>
        <input type="text" class="spell-input" id="spellInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${q.answered ? 'disabled' : ''} value="${esc(q.chosen || '')}">
        ${q.answered ? `<div class="center" style="margin-top:12px;font-size:20px">${q.lastOk ? '✅' : '❌'} ${t('answerIs')}<b class="en" style="font-size:26px">${esc(v.word)}</b>${v.syn ? `<div class="muted en">≈ ${esc(v.syn)}</div>` : ''}<div class="muted en">${esc(v.example || '')}</div></div>
          <div class="center" style="margin-top:12px"><button class="btn accent" data-action="quizNext">${t('next')}</button></div>`
          : `<div class="center" style="margin-top:12px"><button class="btn accent" data-action="spellCheck">${t('check')}</button> <button class="btn ghost" data-action="spellSkip">${t('skip')}</button></div>`}`;
    } else {
      const rev = q.type === 'choiceRev';
      body = `<div class="quiz-word" ${rev ? 'style="font-family:var(--font-body)"' : ''}>${esc(rev ? v.zh : v.word)} ${!rev ? `<button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}">🔊</button>` : `<span class="muted" style="font-size:18px">${esc(v.pos || '')}</span>`}</div>
        <div class="quiz-options">${cur.opts.map(oid => { const o = byId(oid); if (!o) return ''; let cls = 'quiz-opt'; if (q.answered) { if (oid === v.id) cls += ' correct'; else if (q.chosen === oid) cls += ' wrong'; } return `<button class="${cls}" data-action="quizChoose" data-id="${esc(oid)}" ${q.answered ? 'disabled' : ''}><span class="${rev ? 'en' : ''}">${esc(rev ? o.word : o.zh)}</span></button>`; }).join('')}</div>
        ${q.answered ? `<div class="center" style="margin-top:14px"><div class="muted en">${esc(v.word)} ${esc(v.pos || '')}${v.syn ? ` ≈ ${esc(v.syn)}` : ''} — ${esc(v.example || '')}</div><button class="btn accent" data-action="quizNext" style="margin-top:8px">${t('next')}</button></div>` : ''}`;
    }
    return `<div class="card" style="max-width:800px;margin:0 auto">${head}${body}</div>`;
  }
  function quizAnswer(ok, given) {
    const q = view.quiz, v = VOCAB.find(x => x.id === q.qs[q.idx].id);
    q.answered = true; q.lastOk = ok;
    if (ok) q.correct++; else q.wrong.push({ vocabId: v.id, word: v.word, zh: v.zh, given: given || '' });
    markCard(v.id, ok);
  }
  function finishQuiz() {
    const q = view.quiz;
    state.progress.vocabQuizzes.push({ id: uid('vq'), type: q.type, score: q.correct, total: q.qs.length, date: new Date().toISOString(), wrong: q.wrong });
    save();
  }

  /* ---- Vocab bank ---- */
  function pageVocab() {
    const s = view.vocabSearch.toLowerCase();
    const ty = view.vocabType || '';
    const list = VOCAB.filter(v => inUnit(v, view.vocabUnit) && (!ty || (ty === 'custom' ? (!LIBMAP[v.id] || v.override) : v.type === ty)) && (!view.vocabBm || isBm('vocab', v.id)) && (!s || v.word.toLowerCase().includes(s) || (v.zh || '').includes(s) || (v.syn || '').toLowerCase().includes(s) || (v.example || '').toLowerCase().includes(s)));
    if (String(view.vocabUnit).startsWith('@hf')) list.sort((a, b) => HF_RANK[a.id] - HF_RANK[b.id]);  // most frequent first
    const PAGE = 50, pages = Math.max(1, Math.ceil(list.length / PAGE));
    view.vocabPage = Math.min(Math.max(0, view.vocabPage || 0), pages - 1);
    const pageList = list.slice(view.vocabPage * PAGE, view.vocabPage * PAGE + PAGE);
    const cur = view.vocabPage;
    const span = window.innerWidth < 520 ? 1 : 2;
    const nums = (() => {
      const set = new Set([0, pages - 1]);
      for (let i = cur - span; i <= cur + span; i++) if (i >= 0 && i < pages) set.add(i);
      if (cur <= span + 2) for (let i = 0; i < Math.min(pages, span * 2 + 3); i++) set.add(i);
      if (cur >= pages - span - 3) for (let i = Math.max(0, pages - span * 2 - 3); i < pages; i++) set.add(i);
      const arr = [...set].sort((a, b) => a - b), out = [];
      arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) out.push('…'); out.push(n); });
      return out;
    })();
    const pager = pages > 1 ? `<div class="pager">
      <button class="pg-btn" data-action="vocabGo" data-p="${cur - 1}" ${cur === 0 ? 'disabled' : ''} aria-label="${t('pgPrev')}">‹</button>
      ${nums.map(n => n === '…' ? '<span class="pg-gap">…</span>' : `<button class="pg-btn pg-num ${n === cur ? 'on' : ''}" data-action="vocabGo" data-p="${n}" ${n === cur ? 'aria-current="page"' : ''}>${n + 1}</button>`).join('')}
      <button class="pg-btn" data-action="vocabGo" data-p="${cur + 1}" ${cur >= pages - 1 ? 'disabled' : ''} aria-label="${t('pgNext')}">›</button>
      <select class="input pager-sel" aria-label="${t('pgJump')}">${Array.from({ length: pages }, (_, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${t('pgJumpTo')} ${i + 1} · ${esc((list[i * PAGE] || {}).word || '')}</option>`).join('')}</select>
    </div>` : '';
    const row = v => {
      if (view.vocabEdit && view.vocabEdit.id === v.id) return vocabEditRow(view.vocabEdit);
      const c = state.progress.cards[v.id] || { box: 0, seen: 0 };
      return `<tr><td class="bm-cell"><button class="bm-star ${isBm('vocab', v.id) ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${esc(v.id)}" title="${t('bookmark')}">🔖</button></td><td class="word">${esc(v.word)} <button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}" style="padding:2px 6px">🔊</button>${v.cefr ? `<div class="small muted" style="font-weight:400">${esc(v.cefr)}</div>` : ''}</td><td class="pos">${esc(v.pos || '')}</td><td class="zh">${esc(v.zh)}</td><td class="syn en">${v.syn ? `<span class="wb-lbl">≈ </span>` : ''}${esc(v.syn || '')}</td><td class="example">${esc(v.example || '')}</td><td class="small muted unit">${esc(unitLabel(v.unit))}</td>
        <td class="box"><span class="chip ${['', 'info', 'warn', 'ok'][c.box]}">${c.seen ? t('level' + c.box) : t('level0')}</span></td>
        <td class="teacher-only acts"><button class="btn sm ghost" data-action="editVocab" data-id="${esc(v.id)}">${t('edit')}</button> <button class="btn sm danger" data-action="deleteVocab" data-id="${esc(v.id)}">${t('del')}</button></td></tr>`;
    };
    return `<h2 class="section-title" style="margin-top:8px">${t('vocabTitle')}</h2><p class="section-sub">${t('vocabSub')}</p>
      <div class="row" style="margin-bottom:12px">
        <input type="text" id="vocabSearch" placeholder="🔍 ${t('search')}" value="${esc(view.vocabSearch)}" style="max-width:320px">
        <button class="btn sm ${view.vocabBm ? 'accent' : 'ghost'}" data-action="toggleVocabBm">🔖 ${t('onlyBookmarks')}</button>
        <div style="min-width:220px">${unitSelect('vocabUnit', view.vocabUnit)}</div>
        <select class="input" id="vocabType" style="width:auto"><option value="" ${!ty ? 'selected' : ''}>${t('typeAll')}</option><option value="word" ${ty === 'word' ? 'selected' : ''}>${t('typeWord')}</option><option value="phrase" ${ty === 'phrase' ? 'selected' : ''}>${t('typePhrase')}</option><option value="custom" ${ty === 'custom' ? 'selected' : ''}>${t('presetCustom')}</option></select>
        <span class="muted small">${t('total')} ${list.length} ${t('items')}</span><span class="spacer"></span>
        <span class="teacher-only"><button class="btn accent sm" data-action="addVocab">${t('addVocab')}</button> <button class="btn sm" data-action="toggleBulk">${t('bulkImport')}</button></span>
      </div>
      ${view.bulkOpen ? `<div class="card teacher-only block" style="margin-bottom:12px"><b>${t('bulkTitle')}</b><p class="small muted">${t('bulkHint')}</p>
        <div class="grid-2"><div class="field"><label>${t('unit')}</label><input type="text" id="bulkUnit" placeholder="Unit 5 ..." value="${esc(String(view.vocabUnit).startsWith('@') ? '' : view.vocabUnit)}"></div></div>
        <textarea id="bulkText" placeholder="adventure, n., 冒險, Life is an adventure.&#10;brave | adj. | 勇敢的"></textarea>
        <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn ghost" data-action="toggleBulk">${t('cancel')}</button><button class="btn accent" data-action="bulkImport">${t('importBtn')}</button></div></div>` : ''}
      ${pager}
      <div style="overflow-x:auto"><table class="vocab-table wb-table"><thead><tr><th></th><th>${t('word')}</th><th>${t('pos')}</th><th>${t('meaning')}</th><th>${t('synonyms')}</th><th>${t('example')}</th><th>${t('unit')}</th><th>${t('box')}</th><th class="teacher-only">${t('actions')}</th></tr></thead>
      <tbody>${view.vocabEdit && !view.vocabEdit.id ? vocabEditRow(view.vocabEdit) : ''}${pageList.map(row).join('')}</tbody></table></div>${pager}`;
  }
  function vocabEditRow(v) {
    return `<tr class="teacher-only wb-edit" style="display:table-row;background:#fff8df"><td></td><td><input type="text" id="veWord" value="${esc(v.word)}" placeholder="word"></td><td><input type="text" id="vePos" value="${esc(v.pos || '')}" placeholder="n."></td><td><input type="text" id="veZh" value="${esc(v.zh)}" placeholder="中文"></td><td><input type="text" id="veSyn" value="${esc(v.syn || '')}" placeholder="synonyms"></td><td><input type="text" id="veEx" value="${esc(v.example || '')}" placeholder="example"></td><td><input type="text" id="veUnit" value="${esc(v.unit || '')}" placeholder="Unit"></td><td></td>
      <td><button class="btn sm ok" data-action="saveVocab">${t('save')}</button> <button class="btn sm ghost" data-action="cancelVocab">${t('cancel')}</button></td></tr>`;
  }

  /* ---- Progress (student) ---- */
  function masteryBars(progress, vocab) {
    const counts = [0, 0, 0, 0];
    vocab.forEach(v => { const c = progress.cards[v.id]; counts[c && c.seen ? c.box : 0]++; });
    const colors = ['#c9d2e3', '#6f9cff', '#f2b84b', '#2e9e5b'];
    return [0, 1, 2, 3].map(i => `<div class="bar-row"><div class="lbl">${t('level' + i)}</div><div class="bar"><div style="width:${vocab.length ? counts[i] / vocab.length * 100 : 0}%;background:${colors[i]}"></div></div><div class="num">${counts[i]}</div></div>`).join('');
  }
  function heatmap(progress) {
    let s = '';
    for (let i = 83; i >= 0; i--) {
      const d = addDays(todayStr(), -i), n = progress.days[d] || 0;
      s += `<span class="${n ? 'l' + Math.min(4, Math.ceil(n / 5)) : ''}" title="${d}: ${n}"></span>`;
    }
    return `<div class="heat">${s}</div>`;
  }
  function quizTables(progress, articles) {
    const rq = progress.readingQuizzes.slice().reverse().slice(0, 30);
    const vq = progress.vocabQuizzes.slice().reverse().slice(0, 30);
    const typeName = { choice: t('quizChoice'), choiceRev: t('quizChoiceRev'), spell: t('quizSpell') };
    return `<h3>${t('quizHistory')}</h3>${rq.length ? `<table class="vocab-table"><thead><tr><th>${t('date')}</th><th>${t('article')}</th><th>${t('score')}</th></tr></thead><tbody>${rq.map(r => `<tr><td class="small">${fmtDate(r.date)}</td><td>${esc(r.title)}</td><td><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span></td></tr>`).join('')}</tbody></table>` : `<p class="muted">${t('noData')}</p>`}
      <h3>${t('vocabQuizHistory')}</h3>${vq.length ? `<table class="vocab-table"><thead><tr><th>${t('date')}</th><th>${t('vocabQuiz')}</th><th>${t('score')}</th></tr></thead><tbody>${vq.map(r => `<tr><td class="small">${fmtDate(r.date)}</td><td>${typeName[r.type] || r.type}</td><td><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span></td></tr>`).join('')}</tbody></table>` : `<p class="muted">${t('noData')}</p>`}`;
  }
  function pageProgress() {
    const p = state.progress;
    const total = Object.values(p.days).reduce((a, b) => a + b, 0);
    return `<h2 class="section-title" style="margin-top:8px">${t('progressTitle')}</h2><p class="section-sub">${t('progressSub')}</p>
      <div class="card"><div class="row"><div><b>🔥 ${t('streak')}</b> ${streak()} ${t('streakDays')}</div><div><b>${t('totalActivity')}</b> ${total}</div><span class="spacer"></span>
        <button class="btn accent" data-action="sendTeacher" ${view.reportBusy ? 'disabled' : ''}>${t('sendToTeacher')}</button></div><p class="small muted" style="margin:6px 0 0">${t('sendHint')}</p></div>
      ${reportCard()}
      <div class="card"><h3 style="margin-top:0">${t('mastery')}</h3>${masteryBars(p, VOCAB)}<h3>${t('activity')}</h3>${heatmap(p)}</div>
      <div class="card">${quizTables(p, ARTICLES)}<div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn danger sm" data-action="resetProgress">${t('resetProgress')}</button></div></div>`;
  }

  /* ---- Progress report for the teacher: a PDF (html2pdf.js, loaded only when needed) + email ---- */
  let pdfLib = null;
  function loadPdfLib() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (!pdfLib) pdfLib = new Promise((ok, no) => {
      const s = document.createElement('script'); s.src = 'vendor/html2pdf.bundle.min.js';
      s.onload = () => ok(window.html2pdf); s.onerror = () => { pdfLib = null; no(new Error('load')); };
      document.head.appendChild(s);
    });
    return pdfLib;
  }
  // translation practice results: { id: { tries, ok, lastOk, answer, last } }
  function trStats(progress) {
    const tr = progress.translate || {}, items = window.TRANSLATION_ITEMS || [];
    const done = Object.keys(tr), right = done.filter(id => tr[id].lastOk);
    const wrong = done.filter(id => !tr[id].lastOk).map(id => Object.assign({ id }, tr[id], items.find(x => x.id === id) || {})).filter(x => x.zh)
      .sort((a, b) => (b.tries - b.ok) - (a.tries - a.ok));
    return { done: done.length, right: right.length, wrong, total: items.length };
  }
  const reportName = () => state.settings.studentName || (ui.user && ui.user.name) || t('roleStudent');
  function reportHTML(progress, name) {
    const A = analyzeReport(progress, name), T = trStats(progress);
    const mastered = VOCAB.filter(v => (progress.cards[v.id] || {}).box === 3).length;
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); days.push([k.slice(5), progress.days[k] || 0]); }
    const maxDay = Math.max(1, ...days.map(d => d[1]));
    const stat = (k, v, s) => `<div class="pr-stat"><div class="pr-k">${k}</div><div class="pr-v">${v}</div>${s ? `<div class="pr-s">${s}</div>` : ''}</div>`;
    const rq = A.rq.slice().reverse().slice(0, 10);
    return `<div class="pdf-report">
      <div class="pr-head"><div><div class="pr-title">${t('reportTitle')}</div><div class="pr-sub">${esc(name)} · ${t('reportDate')} ${todayStr()}</div></div>
        <div class="pr-exam">${esc(state.settings.examName || '')}<br><b>${tf('reportDaysLeft', { n: daysLeft() })}</b></div></div>
      <div class="pr-stats">
        ${stat(t('streak'), `${streak(progress)} ${t('streakDays')}`, `${t('totalActivity')} ${A.total}`)}
        ${stat(t('lastActive'), A.last || t('never'))}
        ${stat(t('avgReading'), A.avg === null ? '—' : A.avg + '%', `${t('readingDone')} ${A.rq.length}`)}
        ${stat(t('statMastered'), `${mastered}`, `/ ${VOCAB.length}`)}
        ${stat(t('reportTranslate'), T.done ? `${T.right} / ${T.done}` : '—', T.total ? tf('trDoneOf', { n: T.done, t: T.total }) : '')}
      </div>
      <h2>📅 ${t('reportActivity')}</h2>
      <div class="pr-bars">${days.map(([d, n]) => `<div class="pr-bar"><div class="pr-fill" style="height:${Math.round(n / maxDay * 60)}px"></div><div class="pr-n">${n || ''}</div><div class="pr-d">${d}</div></div>`).join('')}</div>
      <h2>📖 ${t('reportReading')}</h2>
      ${rq.length ? `<table class="pr-table"><tr><th>${t('reportWhen')}</th><th>${t('title')}</th><th>${t('reportScore')}</th><th>${t('reportTime')}</th></tr>${rq.map(r => `<tr><td>${fmtDate(r.date)}</td><td class="en">${esc(r.title)}</td><td>${r.score} / ${r.total}</td><td>${r.secs != null ? fmtDur(r.secs) : '—'}</td></tr>`).join('')}</table>` : `<p class="pr-none">${t('noData')}</p>`}
      <h2>❌ ${t('wrongAnalysis')}</h2>
      ${A.wrongs.length ? A.wrongs.slice(0, 10).map(w => `<div class="pr-item"><div class="pr-meta en">${esc(w.title)}</div><div class="en">${esc(w.q)}</div><div>${t('studentChose')}：<span class="pr-bad">${w.chosen.map(esc).join('、')}</span> → ${t('correctIs')}：<span class="pr-ok">${esc(w.correct)}</span>（${tf('wrongTimes', { n: w.n })}）</div></div>`).join('') : `<p class="pr-none">${t('noWrong')}</p>`}
      <h2>🧠 ${t('weakWords')}</h2>
      ${A.weakList.length ? `<div class="pr-words">${A.weakList.slice(0, 24).map(w => `<span><b class="en">${esc(w.word)}</b> ${esc(w.zh)}</span>`).join('')}</div>` : `<p class="pr-none">${t('noWeak')}</p>`}
      ${(() => { const M = mcStats(progress); return `<h2>📝 ${t('tabMcq')}</h2>${M.done ? `<div class="pr-words">${MC_TYPES.map(([k, l]) => { const b = M.byType[k]; return `<span><b>${t(l)}</b> ${b.done ? `${b.right} / ${b.done}（${Math.round(b.right / b.done * 100)}%）` : '—'}</span>`; }).join('')}</div>
        ${M.wrong.slice(0, 8).map(u => `<div class="pr-item"><div class="en">${esc(u.q).replace(/\n/g, ' / ')}</div><div class="en">${t('studentChose')}：<span class="pr-bad">${u.chosenIdx != null ? esc(u.options[u.chosenIdx]) : '—'}</span> → ${t('correctIs')}：<span class="pr-ok">${esc(u.options[u.answer])}</span></div></div>`).join('')}` : `<p class="pr-none">${t('noData')}</p>`}`; })()}
      <h2>✍️ ${t('reportTranslate')}</h2>
      ${T.wrong.length ? T.wrong.slice(0, 10).map(x => `<div class="pr-item"><div>${esc(x.zh)}</div><div class="en">${t('trYours')}：<span class="pr-bad">${esc(x.answer || '—')}</span></div><div class="en">${t('trModel')}：<span class="pr-ok">${esc(x.en)}</span></div></div>`).join('') : `<p class="pr-none">${T.done ? t('trAllRight') : t('noData')}</p>`}
      <div class="pr-foot">${t('reportFoot')}</div>
    </div>`;
  }
  function reportText(progress, name) {
    const A = analyzeReport(progress, name), T = trStats(progress);
    const mastered = VOCAB.filter(v => (progress.cards[v.id] || {}).box === 3).length;
    return [
      `${t('reportTitle')} — ${name} (${todayStr()})`,
      `${t('streak')}: ${streak(progress)} ${t('streakDays')} · ${t('totalActivity')} ${A.total} · ${t('lastActive')}: ${A.last || t('never')}`,
      `${t('avgReading')}: ${A.avg === null ? '—' : A.avg + '%'} (${t('readingDone')} ${A.rq.length})`,
      `${t('statMastered')}: ${mastered} / ${VOCAB.length}`,
      T.done ? `${t('reportTranslate')}: ${T.right} / ${T.done}` : '',
      (() => { const M = mcStats(progress); return M.done ? `${t('tabMcq')}: ${M.right} / ${M.done}` : ''; })(),
      A.wrongs.length ? `${t('wrongAnalysis')}: ` + A.wrongs.slice(0, 5).map(w => w.q).join(' | ') : '',
      A.weakList.length ? `${t('weakWords')}: ` + A.weakList.slice(0, 10).map(w => w.word).join(', ') : '',
    ].filter(Boolean).join('\n');
  }
  async function makeReportPDF(name) {
    const lib = await loadPdfLib();
    const stage = document.createElement('div'); stage.className = 'pdf-stage'; stage.innerHTML = reportHTML(state.progress, name);
    document.body.appendChild(stage);
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      return await lib().set({
        margin: [10, 10, 12, 10], image: { type: 'jpeg', quality: 0.92 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.pr-item', 'tr', '.pr-stats', '.pr-bars'] },
      }).from(stage.firstElementChild).outputPdf('blob');
    } finally { stage.remove(); }
  }
  const canShareFiles = () => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] })); } catch (e) { return false; } };
  function reportCard() {
    if (view.reportBusy) return `<div class="card report-card"><p style="margin:0">⏳ ${t('pdfMaking')}</p></div>`;
    const r = view.report; if (!r) return '';
    const share = canShareFiles();
    return `<div class="card report-card" id="reportCard"><h3 style="margin-top:0">📄 ${t('pdfReady')}</h3>
      <div class="field"><label>${t('teacherEmail')}</label><input type="email" id="teacherEmailInput" value="${esc(state.settings.teacherEmail || '')}" placeholder="teacher@example.com" autocomplete="email" inputmode="email"></div>
      <div class="row">
        ${share ? `<button class="btn accent" data-action="sharePdf">📤 ${t('sharePdf')}</button>` : ''}
        <button class="btn ${share ? '' : 'accent'}" data-action="mailPdf">📧 ${t('emailTeacher')}</button>
        <a class="btn ghost" href="${r.url}" download="${esc(r.name)}">⬇️ ${t('downloadPdf')}</a>
        <a class="btn ghost" href="${r.url}" target="_blank" rel="noopener">👀 ${t('previewPdf')}</a>
        <button class="btn ghost sm" data-action="exportJson">${t('exportJson')}</button>
      </div>
      <p class="small muted" style="margin:8px 0 0">${t(share ? 'shareHintPdf' : 'mailHintPdf')}</p></div>`;
  }
  function saveTeacherEmail() {
    const el = $('#teacherEmailInput'); if (!el) return state.settings.teacherEmail || '';
    const v = el.value.trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast(t('badEmail')); el.focus(); return null; }
    if (v !== (state.settings.teacherEmail || '')) { state.settings.teacherEmail = v; save(); }
    return v;
  }

  /* ---- Students (teacher) ---- */
  function analyzeReport(progress, name) {
    const wrongMap = Object.create(null);
    progress.readingQuizzes.forEach(r => (r.answers || []).forEach(a => {
      if (a.chosen === a.correct) return;
      const key = r.articleId + '|' + a.qi;
      const art = articleById(r.articleId);
      const q = art && art.questions[a.qi];
      if (!wrongMap[key]) wrongMap[key] = { title: r.title, q: a.q || (q && q.q) || ('Q' + (a.qi + 1)), n: 0, chosen: [], correct: a.correctText || (q && q.options[q.answer]) || '', explain: q && q.explain };
      wrongMap[key].n++; wrongMap[key].chosen.push(a.chosenText || (q && q.options[a.chosen]) || '—');
    }));
    const wrongs = Object.values(wrongMap).sort((a, b) => b.n - a.n);
    const weak = Object.create(null);
    Object.entries(progress.cards).forEach(([id, c]) => { if (c.wrong > 0) weak[id] = { missed: c.wrong, quiz: 0, typed: [], box: c.box }; });
    progress.vocabQuizzes.forEach(r => (r.wrong || []).forEach(w => { const k = w.vocabId; if (!weak[k]) weak[k] = { missed: 0, quiz: 0, typed: [], box: 0 }; weak[k].quiz++; if (w.given) weak[k].typed.push(w.given); weak[k].word = w.word; weak[k].zh = w.zh; }));
    const weakList = Object.entries(weak).map(([id, w]) => { const v = VOCAB.find(x => x.id === id); return Object.assign({ id, word: v ? v.word : w.word, zh: v ? v.zh : w.zh }, w); }).filter(w => w.word).sort((a, b) => (b.missed + b.quiz) - (a.missed + a.quiz)).slice(0, 40);
    const rq = progress.readingQuizzes;
    const avg = rq.length ? Math.round(rq.reduce((s, r) => s + r.score / r.total, 0) / rq.length * 100) : null;
    const dates = Object.keys(progress.days).sort();
    const last = dates.length ? dates[dates.length - 1] : null;
    const total = Object.values(progress.days).reduce((a, b) => a + b, 0);
    const notStudied = VOCAB.filter(v => !progress.cards[v.id] || progress.cards[v.id].seen === 0);
    const timeline = [].concat(
      rq.map(r => ({ date: r.date, text: `${t('readingLbl')}：${r.title} ${r.score}/${r.total}` })),
      progress.vocabQuizzes.map(r => ({ date: r.date, text: `${t('vocabQuizLbl')}：${r.score}/${r.total}` }))
    ).sort((a, b) => b.date < a.date ? -1 : 1).slice(0, 15);
    return { wrongs, weakList, avg, last, total, notStudied, timeline, rq };
  }
  function pageGate() {
    return `<div class="card gate"><div class="big-icon">🔒</div><h2>${t('teacherOnly')}</h2><p class="muted">${t('teacherOnlySub')}</p><button class="btn accent" data-action="openAuth" style="font-size:18px;padding:12px 30px">${t('loginNow')}</button></div>`;
  }
  function pageStudents() {
    if (!ui.teacher) return pageGate();
    const reports = state.studentReports;
    const src = view.studentSource;
    let rep = src === 'local' ? { name: state.settings.studentName || t('localDevice'), progress: state.progress, exportedAt: null } : (reports.find(r => r.id === src) || view.cloudStudents.find(r => r.id === src));
    if (!rep) { view.studentSource = 'local'; return pageStudents(); }
    if (!rep.progress) { const cs = rep; if (!cs.tried) setTimeout(() => loadStudentProgress(cs)); rep = Object.assign({}, cs, { progress: emptyProgress() }); }
    const A = analyzeReport(rep.progress, rep.name);
    const mastered = VOCAB.filter(v => (rep.progress.cards[v.id] || {}).box === 3).length;
    return `<h2 class="section-title" style="margin-top:8px">${t('studentsTitle')}</h2><p class="section-sub">${t('studentsSub')}</p>
      <div class="card"><div class="row">
        <div class="field" style="margin:0;min-width:260px"><label>${t('source')}</label><select class="input" id="studentSource"><option value="local" ${src === 'local' ? 'selected' : ''}>${t('localDevice')}</option>${view.cloudStudents.map(r => `<option value="${esc(r.id)}" ${src === r.id ? 'selected' : ''}>☁️ ${esc(r.name)}${r.exportedAt ? ' · ' + fmtDate(r.exportedAt) : ''}</option>`).join('')}${reports.map(r => `<option value="${esc(r.id)}" ${src === r.id ? 'selected' : ''}>📄 ${esc(r.name)} · ${fmtDate(r.exportedAt)}</option>`).join('')}</select></div>
        <span class="spacer"></span>
        ${cloud.enabled ? `<button class="btn" data-action="loadCloud">${t('loadCloud')}</button>` : `<span class="small muted">${t('cloudOff')}</span>`}
        <label class="btn"><span>${t('importReport')}</span><input type="file" id="reportFile" accept="application/json" style="display:none"></label>
        ${src !== 'local' && !src.startsWith('cloud_') ? `<button class="btn danger sm" data-action="deleteReport" data-id="${esc(src)}">${t('deleteReport')}</button>` : ''}
      </div></div>
      <div class="stat-grid">
        <div class="stat-card"><div class="k">${t('reportFrom')}</div><div class="v" style="font-size:22px">${esc(rep.name)}</div><div class="s">${rep.exportedAt ? t('exportedAt') + ' ' + fmtDate(rep.exportedAt) : ''}</div></div>
        <div class="stat-card"><div class="k">${t('lastActive')}</div><div class="v" style="font-size:22px">${A.last || t('never')}</div><div class="s">🔥 ${t('streak')} ${streak(rep.progress)} ${t('streakDays')} · ${t('totalActivity')} ${A.total}</div></div>
        <div class="stat-card"><div class="k">${t('avgReading')}</div><div class="v">${A.avg === null ? '—' : A.avg + '%'}</div><div class="s">${t('readingDone')} ${A.rq.length}</div></div>
        <div class="stat-card"><div class="k">${t('statMastered')}</div><div class="v">${mastered} <span class="small muted">/ ${VOCAB.length}</span></div><div class="s">${t('notYetStudied')} ${A.notStudied.length}</div></div>
      </div>
      <div class="card" style="margin-top:14px"><h3 style="margin-top:0">❌ ${t('wrongAnalysis')}</h3>
        ${A.wrongs.length ? `<div class="list">${A.wrongs.map(w => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="meta">${esc(w.title)}</div><div class="title" style="font-size:16px">${esc(w.q)}</div>
          <div class="small">${t('studentChose')}：<span class="chip bad">${w.chosen.map(esc).join('</span> <span class="chip bad">')}</span> → ${t('correctIs')}：<span class="chip ok">${esc(w.correct)}</span></div>${w.explain ? `<div class="small muted">${esc(w.explain)}</div>` : ''}</div><span class="chip bad">${tf('wrongTimes', { n: w.n })}</span></div>`).join('')}</div>` : `<p class="muted">${t('noWrong')}</p>`}
      </div>
      <div class="card"><h3 style="margin-top:0">🧠 ${t('weakWords')}</h3>
        ${A.weakList.length ? `<table class="vocab-table"><thead><tr><th>${t('word')}</th><th>${t('meaning')}</th><th>${t('flashRound')}</th><th>${t('vocabQuizLbl')}</th><th>${t('typed')}</th><th>${t('box')}</th></tr></thead><tbody>${A.weakList.map(w => `<tr><td class="word">${esc(w.word)}</td><td>${esc(w.zh)}</td><td>${w.missed ? `<span class="chip bad">${tf('missedTimes', { n: w.missed })}</span>` : ''}</td><td>${w.quiz ? `<span class="chip warn">${tf('quizWrongTimes', { n: w.quiz })}</span>` : ''}</td><td class="small muted en">${w.typed.map(esc).join(', ')}</td><td><span class="chip ${['', 'info', 'warn', 'ok'][w.box || 0]}">${t('level' + (w.box || 0))}</span></td></tr>`).join('')}</tbody></table>` : `<p class="muted">${t('noWeak')}</p>`}
      </div>
      ${(() => { const M = mcStats(rep.progress); return M.done ? `<div class="card"><h3 style="margin-top:0">📝 ${t('tabMcq')} <span class="small muted">${M.right} / ${M.done}</span></h3>
        <div class="row">${MC_TYPES.map(([k, l, ic]) => { const b = M.byType[k]; return b.done ? `<span class="chip ${b.right / b.done >= .8 ? 'ok' : b.right / b.done >= .6 ? 'warn' : 'bad'}">${ic} ${t(l)} ${b.right}/${b.done}</span>` : ''; }).join('')}</div>
        ${M.wrong.length ? `<div class="list" style="margin-top:10px">${M.wrong.slice(0, 20).map(u => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="title en" style="font-size:15px">${mcQ(u.q)}</div><div class="small">${t('studentChose')}：<span class="chip bad en">${u.chosenIdx != null ? esc(u.options[u.chosenIdx]) : '—'}</span> → ${t('correctIs')}：<span class="chip ok en">${esc(u.options[u.answer])}</span></div></div><span class="chip bad">${tf('wrongTimes', { n: u.wrongTimes })}</span></div>`).join('')}</div>` : ''}</div>` : ''; })()}
      ${(() => { const T = trStats(rep.progress); return T.done ? `<div class="card"><h3 style="margin-top:0">✍️ ${t('reportTranslate')} <span class="small muted">${T.right} / ${T.done} · ${tf('trDoneOf', { n: T.done, t: T.total })}</span></h3>${T.wrong.length ? `<div class="list">${T.wrong.slice(0, 20).map(x => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="title" style="font-size:16px">${esc(x.zh)}</div><div class="small en">${t('trYours')}：<span class="chip bad">${esc(x.answer || '—')}</span></div><div class="small en">${t('trModel')}：<span class="chip ok">${esc(x.en)}</span></div></div><span class="chip bad">${tf('wrongTimes', { n: x.tries - x.ok })}</span></div>`).join('')}</div>` : `<p class="muted">${t('trAllRight')}</p>`}</div>` : ''; })()}
      ${(() => { const b = rep.progress.bookmarks || { vocab: [], articles: [] }; const ws = b.vocab.map(id => VOCAB.find(v => v.id === id)).filter(Boolean); const as = b.articles.map(articleById).filter(Boolean); return (ws.length || as.length) ? `<div class="card bookmark-card"><span class="ribbon">🔖</span><h3 style="margin-top:0">${t('bookmarks')}</h3>${as.length ? `<div class="bm-group"><b>📖 ${t('bookmarkedArticles')}</b><div class="bm-list">${as.map(a => `<span class="bm-tag">${esc(a.title)}</span>`).join('')}</div></div>` : ''}${ws.length ? `<div class="bm-group"><b>🔤 ${t('bookmarkedWords')}</b><div class="bm-list">${ws.map(v => `<span class="bm-tag word en">${esc(v.word)}<small>${esc(v.zh)}</small></span>`).join('')}</div></div>` : ''}</div>` : ''; })()}
      <div class="card"><h3 style="margin-top:0">${t('mastery')}</h3>${masteryBars(rep.progress, VOCAB)}<h3>${t('activity')}</h3>${heatmap(rep.progress)}
        <h3>${t('timeline')}</h3>${A.timeline.length ? `<div class="list">${A.timeline.map(x => `<div class="list-item"><span class="small muted">${fmtDate(x.date)}</span><span>${esc(x.text)}</span></div>`).join('')}</div>` : `<p class="muted">${t('noData')}</p>`}</div>`;
  }

  /* ---- Settings ---- */
  function pageSettings() {
    const s = state.settings;
    return `<h2 class="section-title" style="margin-top:8px">${t('settingsTitle')}</h2><p class="section-sub">${t('settingsSub')}</p>
      <div class="card">
        <div class="grid-2">
          <div class="field"><label>${t('examName')}</label><input type="text" id="stExamName" value="${esc(s.examName)}"></div>
          <div class="field"><label>${t('examNameEn')}</label><input type="text" id="stExamNameEn" value="${esc(s.examNameEn || '')}"></div>
          <div class="field"><label>${t('examDate')}</label><input type="date" id="stExamDate" value="${esc(s.examDate)}"></div>
          <div class="field"><label>${t('studentName')}</label><input type="text" id="stStudent" value="${esc(s.studentName || '')}"></div>
          <div class="field"><label>${t('teacherEmail')}</label><input type="email" id="stTeacherEmail" value="${esc(s.teacherEmail || '')}" placeholder="teacher@example.com" inputmode="email"></div>
        </div>
        <div class="field"><label>${t('mottoLbl')}</label><input type="text" id="stMotto" value="${esc(s.motto || '')}"></div>
        <div class="field teacher-only block"><label>${t('inviteCodeLbl')}</label><input type="text" id="stCode" value="${esc(cloud.configured ? cloud.teacherCode : (s.teacherCode || ''))}" autocomplete="off"${cloud.configured ? ` placeholder="${t('inviteCodeCloudPh')}"` : ''}></div>
        <div class="row"><span class="muted small">${t('teacherHint')}</span><span class="spacer"></span><button class="btn accent" data-action="saveSettings">${t('save')}</button></div>
      </div>
      <div class="card"><h3 style="margin-top:0">${t('dataTitle')}</h3><p class="small muted">${t('dataSub')}</p>
        <div class="row">
          <button class="btn" data-action="exportAll">${t('exportAll')}</button>
          <button class="btn" data-action="exportContent">${t('exportContent')}</button>
          <label class="btn ghost"><span>${t('importData')}</span><input type="file" id="importFile" accept="application/json" style="display:none"></label>
          <span class="small">${t('importMode')}</span><select class="input" id="importMode" style="width:auto"><option value="merge">${t('importMerge')}</option><option value="replace">${t('importReplace')}</option></select>
        </div>
        <div class="row teacher-only flex" style="margin-top:12px"><button class="btn danger sm" data-action="resetAll">${t('resetAll')}</button></div>
      </div>
      ${ui.teacher && !cloud.configured ? `<div class="card"><h3 style="margin-top:0">👥 ${t('accountsTitle')} <span class="cloud-badge">${t('localOnly')}</span></h3>
        ${state.accounts.length ? `<table class="vocab-table"><thead><tr><th>${t('email')}</th><th>${t('displayName')}</th><th>${t('role')}</th><th></th></tr></thead><tbody>${state.accounts.map(a => `<tr><td>${esc(a.email)}</td><td>${esc(a.name)}</td><td><span class="chip ${a.role === 'teacher' ? 'warn' : 'info'}">${a.role === 'teacher' ? t('roleTeacher') : t('roleStudent')}</span></td><td>${ui.user && ui.user.id === a.id ? '' : `<button class="btn sm danger" data-action="deleteAccount" data-id="${esc(a.id)}">${t('deleteAccount')}</button>`}</td></tr>`).join('')}</tbody></table>` : `<p class="muted">${t('noAccounts')}</p>`}</div>` : ''}`;
  }

  /* ---------------- Render ---------------- */
  function render() {
    updateExamChip();
    const pages = { home: pageHome, reading: pageReading, flashcards: pageFlash, vocab: pageVocab, phrases: pagePhrases, translate: pageTranslate, mcq: pageMcq, news: pageNews, progress: pageProgress, students: pageStudents, settings: pageSettings };

    $('#app').innerHTML = (pages[view.page] || pageHome)();
    $$('#tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.page === view.page));
    const sp = $('#spellInput'); if (sp && !sp.disabled) sp.focus();
  }
  function nav(page) { speakStop(); if (page === 'news' && view.page === 'news') view.newsArticle = null; view.page = page; window.scrollTo({ top: 0 }); render(); }

  /* ---------------- Export / Import ---------------- */
  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function shareOrDownload(name, obj, title) {
    const json = JSON.stringify(obj, null, 2);
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([json], name, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title }); return; }
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    download(name, obj); toast(t('shareFail'));
  }
  function importJSON(obj, mode) {
    if (!obj || typeof obj !== 'object') throw new Error('bad');
    if (obj.type === 'student-report') { addReport(obj); return 'report'; }
    if (!Array.isArray(obj.articles) && !Array.isArray(obj.vocab) && !obj.settings) throw new Error('bad');
    if (mode === 'replace') {
      state = { settings: Object.assign(clone(SEED_DATA.settings), cleanSettings(obj.settings)), articles: cleanItems(obj.articles, 'article'), vocab: cleanItems(obj.vocab, 'vocab'), hiddenVocab: cleanIds(obj.hiddenVocab), hiddenArticles: cleanIds(obj.hiddenArticles), progress: cleanProgress(obj.progress), progressOwner: state.progressOwner || null, studentReports: cleanReports(obj.studentReports), accounts: Array.isArray(obj.accounts) ? cleanAccounts(obj.accounts) : state.accounts };
    } else {
      if (obj.settings) { const keep = state.settings.teacherCode, ns = cleanSettings(obj.settings); state.settings = Object.assign(state.settings, ns); if (!ns.teacherCode) state.settings.teacherCode = keep; }
      cleanItems(obj.articles, 'article').forEach(a => { const i = state.articles.findIndex(x => x.id === a.id); if (i >= 0) state.articles[i] = a; else state.articles.push(a); });
      cleanItems(obj.vocab, 'vocab').forEach(v => { const i = state.vocab.findIndex(x => x.id === v.id || (!v.override && x.word.toLowerCase() === v.word.toLowerCase())); if (i >= 0) state.vocab[i] = Object.assign({}, state.vocab[i], v); else state.vocab.push(v); });
      if (Array.isArray(obj.hiddenVocab)) state.hiddenVocab = Array.from(new Set((state.hiddenVocab || []).concat(cleanIds(obj.hiddenVocab))));
      if (Array.isArray(obj.hiddenArticles)) state.hiddenArticles = Array.from(new Set((state.hiddenArticles || []).concat(cleanIds(obj.hiddenArticles))));
    }
    save(); return 'data';
  }
  function addReport(obj) {
    const rep = { id: uid('rep'), name: typeof obj.studentName === 'string' && obj.studentName ? obj.studentName : t('roleStudent'), exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(), progress: cleanProgress(obj.progress) };
    state.studentReports.unshift(rep); state.studentReports = state.studentReports.slice(0, 20); save();
    view.studentSource = rep.id;
  }
  function readFile(file, cb) {
    const r = new FileReader(); r.onload = () => { try { cb(JSON.parse(r.result)); } catch (e) { toast(t('importFail')); } }; r.readAsText(file);
  }

  /* ---------------- Actions ---------------- */
  const actions = {
    nav(el) { nav(el.dataset.page); },
    goFlash(el) { view.flashSetup.mode = el.dataset.mode; view.flash = null; view.quiz = null; nav('flashcards'); },
    goQuiz() { view.flash = null; view.quiz = null; nav('flashcards'); setTimeout(() => { const h = $$('.section-title')[1]; if (h) h.scrollIntoView({ behavior: 'smooth' }); }, 50); },
    speak(el) { speak(el.dataset.word); },
    newsSource(el) { news.source = el.dataset.src; render(); },
    newsStudy(el) { const o = view.newsOpen || (view.newsOpen = {}); o[el.dataset.i] = !o[el.dataset.i]; render(); },
    openNewsArticle(el) { view.newsArticle = el.dataset.link; view.newsScroll = window.scrollY; speakStop(); window.scrollTo({ top: 0 }); render(); },
    closeNewsArticle() { view.newsArticle = null; speakStop(); render(); window.scrollTo({ top: view.newsScroll || 0 }); },
    newsZh(el) { view.newsZh = el.dataset.v === '1'; render(); },
    speakStop() { speakStop(); },
    saveNewsWord(el) {
      // Words not in the word bank go to the student's own list (progress), not to the teacher's shared content
      const d = el.dataset; let id = d.id && VMAP[d.id] ? d.id : null;
      if (!id) { const p = state.progress; p.myWords = p.myWords || []; id = uid('v'); p.myWords.push({ id, word: d.word, pos: d.pos, zh: d.zh, syn: '', example: d.ex, unit: 'news' }); rebuildVocab(); }
      toggleBm('vocab', id); render();
    },
    readTopic(el) { view.readFilter.topic = el.dataset.v; render(); },
    readStatus(el) { view.readFilter.status = el.dataset.v; render(); },
    readMore(el) { view.readFilter.more[el.dataset.v] = true; render(); },
    jumpGroup(el) { const g = document.getElementById(el.dataset.target); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    toggleBm(el) { toggleBm(el.dataset.kind, el.dataset.id); if (view.flash) { const b = $('.flash-bm'); if (b) b.classList.toggle('on', isBm('vocab', el.dataset.id)); } else render(); },
    toggleVocabBm() { view.vocabBm = !view.vocabBm; view.vocabPage = 0; render(); },
    vocabPage(el) { view.vocabPage = (view.vocabPage || 0) + (+el.dataset.d); render(); },
    vocabGo(el) { view.vocabPage = +el.dataset.p; render(); },
    mcType(el) { view.mcf.type = el.dataset.v; view.mcf.count = el.dataset.v === 'cloze' ? 1 : (view.mcf.count > 4 ? view.mcf.count : 10); render(); },
    mcLevel(el) { view.mcf.level = el.dataset.v; render(); },
    mcStatus(el) { view.mcf.status = el.dataset.v; render(); },
    mcMode(el) { view.mcf.mode = el.dataset.v; render(); },
    mcCount(el) { view.mcf.count = +el.dataset.v; render(); },
    mcStart() {
      const f = view.mcf, cloze = f.type === 'cloze';
      const ids = shuffleArr((cloze ? mcClozeFiltered() : mcFiltered()).map(x => x.id)).slice(0, f.count || (cloze ? 1 : 10));
      if (!ids.length) { toast(t('trNoMatch')); view.mc = null; render(); return; }
      view.mc = { kind: cloze ? 'cloze' : 'items', type: f.type, ids, i: 0, answers: {}, checked: {}, mode: f.mode, start: Date.now() };
      window.scrollTo({ top: 0 }); render();
    },
    mcRedo() {
      const s = view.mc, wrong = s.kind === 'cloze' ? s.ids.filter(cid => clozeSets().find(x => x.id === cid).blanks.some((b, k) => s.answers[`${cid}-${k + 1}`] !== b.answer)) : s.ids.filter(id => s.answers[id] !== mcItems().find(x => x.id === id).answer);
      view.mc = Object.assign({}, s, { ids: wrong, i: 0, answers: {}, checked: {}, done: false, start: Date.now(), secs: null }); render();
    },
    mcExit() { view.mc = null; render(); },
    mcChoose(el) {
      const s = view.mc, it = mcItems().find(x => x.id === s.ids[s.i]);
      if (s.mode === 'practice' && s.answers[it.id] != null) return;
      s.answers[it.id] = +el.dataset.o;
      if (s.mode === 'practice') { mcRecord(it.id, s.answers[it.id], it.answer); bumpDay(); save(); }
      render();
    },
    mcPrev() { view.mc.i = Math.max(0, view.mc.i - 1); render(); },
    mcNext() { const s = view.mc; if (s.i < s.ids.length - 1) { s.i++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else mcFinish(); },
    czChoose(el) { const s = view.mc, cid = s.ids[s.i]; if (s.checked[cid]) return; s.answers[el.dataset.id] = +el.dataset.o; render(); },
    czCheck() {
      const s = view.mc, c = clozeSets().find(x => x.id === s.ids[s.i]);
      if (c.blanks.some((b, k) => s.answers[`${c.id}-${k + 1}`] == null)) { toast(t('pleaseAnswerAll')); return; }
      c.blanks.forEach((b, k) => mcRecord(`${c.id}-${k + 1}`, s.answers[`${c.id}-${k + 1}`], b.answer));
      s.checked[c.id] = true; bumpDay(); save(); render();
    },
    czNext() {
      const s = view.mc, c = clozeSets().find(x => x.id === s.ids[s.i]);
      if (s.mode === 'test' && c.blanks.some((b, k) => s.answers[`${c.id}-${k + 1}`] == null)) { toast(t('pleaseAnswerAll')); return; }
      if (s.i < s.ids.length - 1) { s.i++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else mcFinish();
    },
    trGroup(el) { view.trf.group = +el.dataset.v; render(); },
    trLevel(el) { view.trf.level = el.dataset.v; render(); },
    trStatus(el) { view.trf.status = el.dataset.v; render(); },
    trStart() { const ids = shuffleArr(trFiltered().map(x => x.id)).slice(0, 10); if (!ids.length) { view.tr = null; render(); return; } view.tr = { ids, i: 0, right: 0, wrong: [] }; window.scrollTo({ top: 0 }); render(); },
    trOne(el) { view.tr = { ids: [el.dataset.id], i: 0, right: 0, wrong: [] }; window.scrollTo({ top: 0 }); render(); },
    trRedo() { const ids = view.tr.wrong.slice(); view.tr = { ids, i: 0, right: 0, wrong: [] }; render(); },
    trExit() { view.tr = null; render(); },
    trHint() { view.tr.hint = true; view.tr.answer = ($('#trInput') || {}).value || ''; render(); const i = $('#trInput'); if (i) i.focus(); },
    trCheck() { const v = (($('#trInput') || {}).value || '').trim(); if (!v) { toast(t('trTypeFirst')); return; } Object.assign(view.tr, { answer: v, checked: true }); render(); },
    trMark(el) {
      const s = view.tr, id = s.ids[s.i], ok = el.dataset.ok === '1', p = state.progress;
      p.translate = p.translate || {};
      const r = p.translate[id] || { tries: 0, ok: 0 };
      p.translate[id] = { tries: r.tries + 1, ok: r.ok + (ok ? 1 : 0), lastOk: ok, answer: s.answer, last: new Date().toISOString() };
      if (ok) s.right++; else s.wrong.push(id);
      Object.assign(s, { i: s.i + 1, answer: '', checked: false, hint: false });
      bumpDay(); save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    phrGo(el) { view.phr.page = +el.dataset.p; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    phrCat(el) { Object.assign(view.phr, { cat: el.dataset.v, page: 0 }); render(); },
    phrLevel(el) { Object.assign(view.phr, { level: el.dataset.v, page: 0 }); render(); },
    phrBm() { Object.assign(view.phr, { bm: !view.phr.bm, page: 0 }); render(); },
    phrFlash() { Object.assign(view.flashSetup, { mode: 'due', unit: view.phr.cat || '@phrase' }); view.flash = null; view.quiz = null; nav('flashcards'); },
    phrQuiz() { view.quizSetup.unit = view.phr.cat || '@phrase'; view.flash = null; view.quiz = null; nav('flashcards'); setTimeout(() => { const h = $$('.section-title')[1]; if (h) h.scrollIntoView({ behavior: 'smooth' }); }, 50); },
    openArticleHome(el) { view.articleId = el.dataset.id; view.answers = {}; view.submitted = false; view.readZh = null; view.readStart = Date.now(); nav('reading'); },
    // reading
    openArticle(el) { view.articleId = el.dataset.id; view.answers = {}; view.submitted = false; view.readZh = null; view.readStart = Date.now(); window.scrollTo({ top: 0 }); render(); },
    backList() { view.articleId = null; render(); },
    readZh(el) { view.readZh = el.dataset.v === '1'; render(); },
    choose(el) { if (view.submitted) return; view.answers[+el.dataset.q] = +el.dataset.o; render(); },
    submitQuiz() {
      const a = articleById(view.articleId);
      if (Object.keys(view.answers).length < a.questions.length) { toast(t('pleaseAnswerAll')); return; }
      view.submitted = true;
      view.readSecs = view.readStart ? Math.round((Date.now() - view.readStart) / 1000) : null;
      const answers = a.questions.map((q, i) => ({ qi: i, q: q.q, chosen: view.answers[i], chosenText: q.options[view.answers[i]], correct: q.answer, correctText: q.options[q.answer] }));
      const score = answers.filter(x => x.chosen === x.correct).length;
      state.progress.readingQuizzes.push({ id: uid('rq'), articleId: a.id, title: a.title, score, total: a.questions.length, date: new Date().toISOString(), secs: view.readSecs, answers });
      bumpDay(); save(); render();
      setTimeout(() => { const s = $('.score-banner'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
    },
    retry() { view.answers = {}; view.submitted = false; view.readZh = null; view.readStart = Date.now(); window.scrollTo({ top: 0 }); render(); },
    newArticle() { view.editing = { id: uid('a'), title: '', level: 'Reading · B1', tags: [], passage: '', questions: [{ q: '', options: ['', '', '', ''], answer: 0, explain: '' }] }; render(); },
    editArticle(el) { const a = clone(articleById(el.dataset.id)); delete a.lib; view.editing = a; render(); },
    deleteArticle(el) {
      if (!confirm(t('confirmDel'))) return;
      const id = el.dataset.id;
      state.articles = state.articles.filter(x => x.id !== id);
      if (READ_LIB.some(a => a.id === id)) { state.hiddenArticles = state.hiddenArticles || []; if (!state.hiddenArticles.includes(id)) state.hiddenArticles.push(id); }
      save(); render();
    },
    cancelEdit() { view.editing = null; render(); },
    addQ() { collectEditor(); view.editing.questions.push({ q: '', options: ['', '', '', ''], answer: 0, explain: '' }); render(); },
    removeQ(el) { collectEditor(); view.editing.questions.splice(+el.dataset.qi, 1); render(); },
    saveArticle() {
      collectEditor(); const a = view.editing;
      if (!a.title || !a.passage.trim()) { toast(t('needTitle')); return; }
      if (!a.questions.length || a.questions.some(q => !q.q || q.options.some(o => !o))) { toast(t('needQ')); return; }
      a.edited = true;
      const i = state.articles.findIndex(x => x.id === a.id); if (i >= 0) state.articles[i] = a; else state.articles.push(a);
      save(); view.editing = null; toast(t('articleSaved')); render();
    },
    // flashcards
    startFlash() {
      const fs = view.flashSetup;
      let pool = poolFor(fs.mode, fs.unit);
      if (fs.mode === 'due') { // due (reviewed before) first, then new words
        const td = todayStr();
        let due = pool.filter(v => { const c = state.progress.cards[v.id]; return c && c.seen > 0 && c.due <= td; }), fresh = pool.filter(v => !due.includes(v));
        if (fs.shuffle) { due = shuffleArr(due); fresh = shuffleArr(fresh); }
        pool = due.concat(fresh);
      } else if (fs.shuffle) pool = shuffleArr(pool);
      pool = pool.map(v => v.id);
      if (fs.limit) pool = pool.slice(0, fs.limit);
      if (!pool.length) { toast(t('noCards')); return; }
      view.flash = { queue: pool, idx: 0, flipped: false, known: [], missed: [] }; render();
    },
    flip() { view.flash.flipped = !view.flash.flipped; $('.flash-card').classList.toggle('flipped', view.flash.flipped); },
    flashMark(el) {
      const f = view.flash, known = el.dataset.known === '1', id = f.queue[f.idx];
      markCard(id, known); (known ? f.known : f.missed).push(id);
      f.idx++; f.flipped = false; save(); render();
    },
    flashAgain() { actions.startFlash(); },
    flashMissed() { view.flash = { queue: shuffleArr(view.flash.missed), idx: 0, flipped: false, known: [], missed: [] }; render(); },
    flashExit() { view.flash = null; render(); },
    // quiz
    startQuiz() { buildQuiz(); render(); },
    quizChoose(el) { const q = view.quiz; if (q.answered) return; q.chosen = el.dataset.id; quizAnswer(q.chosen === q.qs[q.idx].id); save(); render(); },
    spellCheck() { const q = view.quiz; const given = ($('#spellInput').value || '').trim(); if (!given) return; q.chosen = given; const v = VOCAB.find(x => x.id === q.qs[q.idx].id); quizAnswer(given.toLowerCase() === v.word.toLowerCase(), given); save(); render(); },
    spellSkip() { const q = view.quiz; q.chosen = ''; quizAnswer(false, '(skip)'); save(); render(); },
    quizNext() { const q = view.quiz; q.idx++; q.answered = false; q.chosen = null; if (q.idx >= q.qs.length) finishQuiz(); render(); },
    quizAgain() { buildQuiz(); render(); },
    quizExit() { view.quiz = null; render(); },
    // vocab
    addVocab() { view.vocabEdit = { id: '', word: '', pos: '', zh: '', example: '', unit: String(view.vocabUnit).startsWith('@') ? '' : view.vocabUnit }; render(); setTimeout(() => $('#veWord') && $('#veWord').focus(), 30); },
    editVocab(el) { view.vocabEdit = clone(VOCAB.find(x => x.id === el.dataset.id)); render(); },
    cancelVocab() { view.vocabEdit = null; render(); },
    saveVocab() {
      const v = { word: $('#veWord').value.trim(), pos: $('#vePos').value.trim(), zh: $('#veZh').value.trim(), example: $('#veEx').value.trim(), unit: $('#veUnit').value.trim() };
      if (!v.word || !v.zh) { toast(t('needTitle')); return; }
      v.syn = ($('#veSyn') ? $('#veSyn').value : view.vocabEdit.syn || '').trim();
      if (view.vocabEdit.id) {
        const i = state.vocab.findIndex(x => x.id === view.vocabEdit.id);
        if (i >= 0) state.vocab[i] = Object.assign(state.vocab[i], v);
        else { const lib = VMAP[view.vocabEdit.id]; state.vocab.push(Object.assign({}, lib, v, { id: view.vocabEdit.id, override: true })); }
      } else state.vocab.push(Object.assign({ id: uid('v') }, v));
      view.vocabEdit = null; save(); toast(t('saved')); render();
    },
    deleteVocab(el) {
      if (!confirm(t('confirmDel'))) return;
      const id = el.dataset.id;
      if (state.vocab.some(x => x.id === id)) state.vocab = state.vocab.filter(x => x.id !== id);
      if (state.progress.myWords) state.progress.myWords = state.progress.myWords.filter(x => x.id !== id);
      if (LIBMAP[id]) { state.hiddenVocab = state.hiddenVocab || []; if (!state.hiddenVocab.includes(id)) state.hiddenVocab.push(id); }
      save(); render();
    },
    toggleBulk() { view.bulkOpen = !view.bulkOpen; render(); },
    bulkImport() {
      const unit = $('#bulkUnit').value.trim(); let n = 0;
      $('#bulkText').value.split(/\n/).map(l => l.trim()).filter(Boolean).forEach(line => {
        const p = line.split(/\s*[|,，]\s*/); if (p.length < 2) return;
        let word, pos = '', zh, ex = '';
        if (p.length === 2) { [word, zh] = p; } else { [word, pos, zh, ...ex] = p; ex = ex.join(', '); }
        if (!word || !zh) return;
        const v = { word, pos, zh, example: ex, unit };
        const ci = state.vocab.findIndex(x => x.word.toLowerCase() === word.toLowerCase());
        if (ci >= 0) state.vocab[ci] = Object.assign(state.vocab[ci], v);
        else { const lib = VOCAB.find(x => x.word.toLowerCase() === word.toLowerCase() && LIBMAP[x.id]); if (lib) state.vocab.push(Object.assign({}, lib, v, { id: lib.id, override: true })); else state.vocab.push(Object.assign({ id: uid('v') }, v)); }
        n++;
      });
      save(); view.bulkOpen = false; toast(`${t('imported')} +${n}`); render();
    },
    // progress
    async sendTeacher() {
      if (view.reportBusy) return;
      view.reportBusy = true; render();
      try {
        const name = reportName(), blob = await makeReportPDF(name);
        if (view.report) URL.revokeObjectURL(view.report.url);
        view.report = { blob, name: `${t('reportFile')}-${name}-${todayStr()}.pdf`.replace(/[\\/:*?"<>|]/g, '_'), url: URL.createObjectURL(blob) };
      } catch (e) { toast(t('pdfFail')); }
      view.reportBusy = false; render();
      const c = $('#reportCard'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    sharePdf() {
      const email = saveTeacherEmail(); if (email === null || !view.report) return;
      const file = new File([view.report.blob], view.report.name, { type: 'application/pdf' });
      // both calls start inside the tap, which iPhone Safari requires
      if (email && navigator.clipboard) navigator.clipboard.writeText(email).then(() => toast(tf('emailCopied', { e: email }))).catch(() => {});
      navigator.share({ files: [file], title: t('reportTitle'), text: reportText(state.progress, reportName()) }).catch(e => { if (!e || e.name !== 'AbortError') toast(t('shareFail')); });
    },
    mailPdf() {
      const email = saveTeacherEmail(); if (email === null || !view.report) return;
      if (!email) { toast(t('needEmail')); const el = $('#teacherEmailInput'); if (el) el.focus(); return; }
      const a = document.createElement('a'); a.href = view.report.url; a.download = view.report.name; document.body.appendChild(a); a.click(); a.remove();
      const name = reportName();
      const body = reportText(state.progress, name) + '\n\n' + tf('mailAttachHint', { f: view.report.name });
      setTimeout(() => { location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(t('reportTitle') + ' — ' + name + ' ' + todayStr())}&body=${encodeURIComponent(body)}`; }, 300);
    },
    exportJson() {
      const obj = { type: 'student-report', studentName: state.settings.studentName || t('roleStudent'), exportedAt: new Date().toISOString(), progress: state.progress };
      shareOrDownload(`progress-${state.settings.studentName || 'student'}-${todayStr()}.json`, obj, t('sendToTeacher'));
    },
    resetProgress() { if (!confirm(t('confirmReset'))) return; state.progress = emptyProgress(); save(); render(); },
    deleteReport(el) { if (!confirm(t('confirmDel'))) return; state.studentReports = state.studentReports.filter(r => r.id !== el.dataset.id); view.studentSource = 'local'; save(); render(); },
    // settings
    saveSettings() {
      const s = state.settings;
      s.examName = $('#stExamName').value.trim() || s.examName; s.examNameEn = $('#stExamNameEn').value.trim();
      if ($('#stExamDate').value) s.examDate = $('#stExamDate').value;
      s.studentName = $('#stStudent').value.trim(); s.motto = $('#stMotto').value.trim();
      if ($('#stTeacherEmail')) s.teacherEmail = $('#stTeacherEmail').value.trim();
      const code = ui.teacher && $('#stCode') ? $('#stCode').value.trim() : '';
      // in cloud mode the invite code lives only in the database, never in the shared material
      if (cloud.configured && ui.teacher && code !== cloud.teacherCode) {
        if (code && code.length < 8) { toast(t('inviteTooShort')); return; }
        if (!code && !confirm(t('inviteClearConfirm'))) return;
        if (cloud.enabled && ui.user.cloud) cloud.sb.rpc('set_teacher_code', { new_code: code }).then(sbCheck).then(() => { cloud.teacherCode = code; toast(t(code ? 'inviteSaved' : 'inviteCleared')); }, e => toast('☁️ ' + e.message));
      } else if (!cloud.configured && code) s.teacherCode = code;
      save(); toast(t('saved')); render();
    },
    exportAll() { download(`tve-exam-all-${todayStr()}.json`, state); },
    exportContent() { shareOrDownload(`tve-exam-material-${todayStr()}.json`, { settings: { examName: state.settings.examName, examNameEn: state.settings.examNameEn, examDate: state.settings.examDate, motto: state.settings.motto }, articles: state.articles, vocab: state.vocab, hiddenVocab: state.hiddenVocab || [], hiddenArticles: state.hiddenArticles || [] }, t('exportContent')); },
    resetAll() { if (!confirm(t('confirmResetAll'))) return; const p = state.progress, code = state.settings.teacherCode; state = { settings: Object.assign(clone(SEED_DATA.settings), { teacherCode: code }), articles: clone(SEED_DATA.articles), vocab: clone(SEED_DATA.vocab), hiddenVocab: [], progress: p, studentReports: state.studentReports, accounts: state.accounts }; save(); render(); },
    deleteAccount(el) { if (!confirm(t('confirmDel'))) return; state.accounts = state.accounts.filter(a => a.id !== el.dataset.id); save(); render(); },
    openAuth() { openAuth('login'); },
    async loadCloud() { try { await loadCloudStudents(); toast(tf('cloudLoaded', { n: view.cloudStudents.length })); if (view.cloudStudents.length && view.studentSource === 'local') view.studentSource = view.cloudStudents[0].id; render(); } catch (e) { toast('☁️ ' + e.message); } }
  };

  /* ---------------- Events ---------------- */
  $('#app').addEventListener('click', e => {
    const el = e.target.closest('[data-action]'); if (!el || !$('#app').contains(el)) return;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
    const fn = actions[el.dataset.action]; if (fn) { e.preventDefault(); fn(el); }
  });
  $('#app').addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'fsMode') view.flashSetup.mode = e.target.value, render();
    else if (id === 'fsUnit') view.flashSetup.unit = e.target.value, render();
    else if (id === 'fsShuffle') view.flashSetup.shuffle = e.target.value === '1';
    else if (id === 'fsLimit') view.flashSetup.limit = +e.target.value, render();
    else if (id === 'vocabType') view.vocabType = e.target.value, view.vocabPage = 0, render();
    else if (e.target.classList.contains('pager-sel') && e.target.dataset.pager === 'phrGo') view.phr.page = +e.target.value, render();
    else if (e.target.classList.contains('pager-sel')) view.vocabPage = +e.target.value, render();
    else if (id === 'qsType') view.quizSetup.type = e.target.value;
    else if (id === 'qsUnit') view.quizSetup.unit = e.target.value;
    else if (id === 'qsCount') view.quizSetup.count = +e.target.value;
    else if (id === 'vocabUnit') view.vocabUnit = e.target.value, view.vocabPage = 0, render();
    else if (id === 'studentSource') view.studentSource = e.target.value, render();
    else if (id === 'importFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { try { const r = importJSON(obj, $('#importMode').value); toast(r === 'report' ? t('reportImported') : t('imported')); if (r === 'report' && ui.teacher) view.page = 'students'; render(); } catch (x) { toast(t('importFail')); } }); }
    else if (id === 'reportFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { if (obj && obj.type === 'student-report') { addReport(obj); toast(t('reportImported')); render(); } else toast(t('notReport')); }); }
  });
  $('#app').addEventListener('input', e => {
    if (e.target.id === 'readSearch') { view.readFilter.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $('#readSearch'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
    if (e.target.id === 'phrSearch') { view.phr.q = e.target.value; view.phr.page = 0; const pos = e.target.selectionStart; render(); const i = $('#phrSearch'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
    if (e.target.id === 'vocabSearch') { view.vocabSearch = e.target.value; view.vocabPage = 0; const pos = e.target.selectionStart; render(); const i = $('#vocabSearch'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
  });
  $('#app').addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-action]')) { e.preventDefault(); e.target.click(); return; }
    if (e.target.id === 'trInput' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); actions.trCheck(); }
    if (e.target.id === 'spellInput' && e.key === 'Enter') { e.preventDefault(); if (view.quiz && view.quiz.answered) actions.quizNext(); else actions.spellCheck(); }
  });
  document.addEventListener('keydown', e => {
    if (view.page === 'flashcards' && view.quiz && view.quiz.answered && e.key === 'Enter' && view.quiz.idx < view.quiz.qs.length) { e.preventDefault(); actions.quizNext(); return; }
    if (!view.flash || view.page !== 'flashcards' || e.target.matches('input,textarea,select')) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); actions.flip(); }
    else if (e.key === 'ArrowRight' || e.key === 'k') actions.flashMark({ dataset: { known: '1' } });
    else if (e.key === 'ArrowLeft' || e.key === 'd') actions.flashMark({ dataset: { known: '0' } });
  });
  // ---- cute calendar for the exam date ----
  const cal = { open: false, y: 2027, m: 3 };
  const pad2 = n => String(n).padStart(2, '0');
  function renderCal() {
    const pop = $('#calPop'), first = new Date(cal.y, cal.m, 1), lead = first.getDay(), days = new Date(cal.y, cal.m + 1, 0).getDate();
    const td = todayStr(), ex = state.settings.examDate, wd = t('weekdays');
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span class="cal-cell empty"></span>';
    for (let d = 1; d <= days; d++) {
      const ds = `${cal.y}-${pad2(cal.m + 1)}-${pad2(d)}`, dow = (lead + d - 1) % 7;
      const cls = ['cal-cell', ds === td ? 'is-today' : '', ds === ex ? 'is-exam' : '', ds > td && ds < ex ? 'is-between' : '', ds < td ? 'is-past' : '', dow === 0 || dow === 6 ? 'is-weekend' : ''].filter(Boolean).join(' ');
      cells += `<button type="button" class="${cls}" data-date="${ds}" ${ds < td ? 'disabled' : ''} aria-label="${ds}">${ds === ex ? '<span class="cal-star">⭐</span>' : ''}${d}</button>`;
    }
    pop.innerHTML = `<div class="cal-rings" aria-hidden="true"><i></i><i></i></div>
      <div class="cal-head"><button type="button" data-cal="-12" aria-label="-1 year">«</button><button type="button" data-cal="-1" aria-label="-1 month">‹</button>
        <div class="cal-title"><span class="cal-month">${t('monthsLong')[cal.m]}</span> <span class="cal-year">${cal.y}</span></div>
        <button type="button" data-cal="1" aria-label="+1 month">›</button><button type="button" data-cal="12" aria-label="+1 year">»</button></div>
      <div class="cal-sub">🐣 ${t('calTitle')}</div>
      <div class="cal-grid">${wd.map((w, i) => `<span class="cal-wd ${i === 0 || i === 6 ? 'is-weekend' : ''}">${w}</span>`).join('')}${cells}</div>
      <div class="cal-foot"><span><i class="lg lg-today"></i>${t('calToday')}</span><span><i class="lg lg-exam"></i>${t('calExam')}</span><span><i class="lg lg-between"></i>${t('calCountdown')}</span>
        <button type="button" class="btn sm ghost" data-cal="exam">${t('calGoExam')}</button></div>`;
  }
  function placeCal() {
    const pop = $('#calPop'), r = $('#examChip').getBoundingClientRect(), w = Math.min(330, window.innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.top = Math.round(r.bottom + 10) + 'px';
    pop.style.left = Math.round(Math.max(12, Math.min(r.left, window.innerWidth - w - 12))) + 'px';
  }
  function openCal() { const d = state.settings.examDate; cal.y = +d.slice(0, 4); cal.m = +d.slice(5, 7) - 1; cal.open = true; renderCal(); $('#calPop').classList.remove('hidden'); placeCal(); $('#examChip').setAttribute('aria-expanded', 'true'); }
  function closeCal() { cal.open = false; $('#calPop').classList.add('hidden'); $('#examChip').setAttribute('aria-expanded', 'false'); }
  $('#examChip').addEventListener('click', e => { e.stopPropagation(); cal.open ? closeCal() : openCal(); });
  $('#calPop').addEventListener('click', e => {
    e.stopPropagation();
    const nav2 = e.target.closest('[data-cal]'), day = e.target.closest('[data-date]');
    if (nav2) {
      const v = nav2.dataset.cal;
      if (v === 'exam') { const d = state.settings.examDate; cal.y = +d.slice(0, 4); cal.m = +d.slice(5, 7) - 1; }
      else { const n = cal.y * 12 + cal.m + (+v); cal.y = Math.floor(n / 12); cal.m = n % 12; }
      renderCal(); return;
    }
    if (day && !day.disabled) { state.settings.examDate = day.dataset.date; save(); closeCal(); toast(t('saved')); render(); }
  });
  setInterval(() => { const el = document.getElementById('mcTimer'); if (el && view.mc && view.mc.mode === 'test' && !view.mc.done) el.textContent = '⏱️ ' + fmtDur(Math.round((Date.now() - view.mc.start) / 1000)); }, 1000);
  document.addEventListener('click', () => { if (cal.open) closeCal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cal.open) closeCal(); });
  window.addEventListener('resize', () => { if (cal.open) placeCal(); });
  window.addEventListener('scroll', () => { if (cal.open) placeCal(); }, { passive: true });
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; if (b.dataset.page === 'reading') { view.articleId = null; view.editing = null; } nav(b.dataset.page); });

  // header controls
  const langSel = $('#langSelect'), fontSel = $('#fontSelect'), themeSel = $('#themeSelect'), authBtn = $('#authBtn');
  function updateExamChip() {
    const chip = $('#examChip'); if (!chip) return;
    chip.title = t('chipHint');
    const dl = daysLeft(), ex = new Date(state.settings.examDate + 'T00:00:00');
    $('#miniCalMon').textContent = t('monthsShort')[ex.getMonth()];
    $('#miniCalDay').textContent = ex.getDate();
    $('#examChipDate').textContent = `${state.settings.examDate.replace(/-/g, '/')} (${t('weekdays')[ex.getDay()]})`;
    $('#examChipDays').textContent = dl > 0 ? tf('daysLeftShort', { n: dl }) : dl === 0 ? t('headerToday') : t('examChipPassed');
    chip.classList.toggle('soon', dl >= 0 && dl <= 30);
  }
  function applyUi() {
    document.body.dataset.font = ui.font; document.body.dataset.theme = ui.theme;
    document.body.classList.toggle('teacher', ui.teacher);
    authBtn.classList.toggle('logged', !!ui.user);
    updateExamChip();
    $('#authBtnText').textContent = ui.user ? `${ui.user.role === 'teacher' ? '🧑‍🏫' : '🎓'} ${ui.user.name} · ${t('logout')}` : `👤 ${t('login')} / ${t('register')}`;
    langSel.value = ui.lang; fontSel.value = ui.font; themeSel.value = ui.theme;
    const tc = { navy: '#1f3b73', forest: '#1f4d3a', plum: '#4b2353', sakura: '#e26a9a', mint: '#2f9e8f', sunset: '#b84a2c' }[ui.theme] || '#1f3b73';
    const m = $('meta[name=theme-color]'); if (m) m.content = tc;
    applyI18n();
  }
  langSel.addEventListener('change', () => { ui.lang = langSel.value; saveUi(); applyUi(); render(); });
  fontSel.addEventListener('change', () => { ui.font = fontSel.value; saveUi(); applyUi(); render(); });
  themeSel.addEventListener('change', () => { ui.theme = themeSel.value; saveUi(); applyUi(); });
  // ---- auth modal ----
  const modal = $('#authModal');
  function openAuth(mode) {
    view.authMode = mode || 'login';
    $$('.auth-tab').forEach(b => b.classList.toggle('active', b.dataset.auth === view.authMode));
    modal.classList.toggle('login-mode', view.authMode === 'login');
    $('#authSubmit').textContent = view.authMode === 'login' ? t('loginBtn') : t('registerBtn');
    $('#authMode').textContent = cloud.configured ? t('authCloudNote') : t('authLocalNote');
    $('#auPass').autocomplete = view.authMode === 'login' ? 'current-password' : 'new-password';
    // Supabase needs 6+ characters for new passwords; older local accounts may still use 4
    $('#auPass').minLength = view.authMode === 'login' ? 1 : cloud.configured ? 6 : 4;
    $('.teacher-code-field').classList.toggle('hidden', $('#auRole').value !== 'teacher' || view.authMode === 'login');
    const wasOpen = !modal.classList.contains('hidden'); modal.classList.remove('hidden'); if (!wasOpen) setTimeout(() => { if (!modal.contains(document.activeElement)) $('#auEmail').focus(); }, 50);
  }
  function closeAuth() { modal.classList.add('hidden'); $('#authForm').reset(); }
  authBtn.addEventListener('click', async () => {
    if (ui.user) { await logoutUser(); toast(t('loggedOut')); applyUi(); render(); } else openAuth('login');
  });
  $('#authClose').addEventListener('click', closeAuth);
  modal.addEventListener('click', e => { if (e.target === modal) closeAuth(); });
  $$('.auth-tab').forEach(b => b.addEventListener('click', () => openAuth(b.dataset.auth)));
  $('#auRole').addEventListener('change', () => $('.teacher-code-field').classList.toggle('hidden', $('#auRole').value !== 'teacher'));
  $('#authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#authSubmit'); btn.disabled = true;
    try {
      const email = $('#auEmail').value.trim(), pass = $('#auPass').value;
      let note = null;
      if (view.authMode === 'login') await loginUser({ email, pass });
      else note = await registerUser({ email, pass, name: $('#auName').value.trim(), role: $('#auRole').value, code: $('#auCode').value.trim() });
      closeAuth(); toast(note ? t(note) : tf('welcome', { n: ui.user.name }));
      if (ui.teacher && view.page === 'home') view.page = 'students';
      applyUi(); render();
    } catch (err) {
      // sign-up worked but the email must be confirmed first: keep the form open on the login tab with the note
      if (err.notice) { openAuth('login'); $('#authMode').textContent = err.message; toast(err.message); return; }
      const map = { user_already_exists: 'userExists', email_exists: 'userExists', invalid_credentials: 'loginFail', weak_password: 'weakPass', email_not_confirmed: 'emailNotConfirmed', over_email_send_rate_limit: 'tooManyTries', over_request_rate_limit: 'tooManyTries', email_address_invalid: 'badEmail' };
      toast(map[err.code] ? t(map[err.code]) : err.message);
    } finally { btn.disabled = false; }
  });

  // midnight refresh of countdown
  let lastDay = todayStr();
  setInterval(() => { updateExamChip(); if (todayStr() !== lastDay) { lastDay = todayStr(); if (view.page === 'home') render(); } }, 60000);

  applyUi();
  render();
  initCloud();
})();
