/* =====================================================
   英語學習站 — App
   純前端，資料存在 localStorage，可匯出 / 匯入 JSON
   ===================================================== */
(function () {
  'use strict';

  const LS_DATA = 'tve_exam_app_v1';
  const LS_UI = 'tve_exam_ui_v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const uid = (p = 'id') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const str = (s) => { try { return String(s ?? ''); } catch (e) { return ''; } };
  const esc = (s) => str(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const todayStr = (d = new Date()) => {
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return todayStr(d); };
  const fmtDate = (iso) => iso ? esc(String(iso).replace('T', ' ').slice(0, 16)) : '';
  const shuffleArr = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- State ---------------- */
  // the five levels a student can pick on the home page; B1 and B2 are the 統測 range
  const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];
  // what the student studies for: the 統測 path (default) or their own pace through a level
  const GOALS = ['exam', 'general'];
  const emptyProgress = () => ({ cards: {}, readingQuizzes: [], vocabQuizzes: [], days: {}, bookmarks: { vocab: [], articles: [] } });
  // Records from other devices (cloud sync, imported files) are shown on the teacher's pages. Keep their shape and
  // force every number and date to be one, so nothing inside a record can turn into HTML.
  function cleanProgress(p) {
    const obj = x => (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}, arr = x => Array.isArray(x) ? x.filter(y => y && typeof y === 'object') : [];
    const num = x => { const n = Number(x); return Number.isFinite(n) ? n : 0; }, isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d);
    const when = d => typeof d === 'string' && /^[0-9T:.+\-Z ]{4,40}$/.test(d) ? d : '';
    const idx = x => x == null || x === '' || !Number.isFinite(Number(x)) ? null : Number(x);
    const okKey = k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype';
    const sv = x => x == null ? x : str(x); // text fields stay text
    const out = Object.assign(emptyProgress(), obj(p));
    out.days = {}; Object.entries(obj(p && p.days)).forEach(([d, n]) => { if (isDay(d)) out.days[d] = Math.max(0, num(n)); });
    const cards = {}; Object.entries(obj(out.cards)).filter(([id]) => okKey(id)).forEach(([id, c]) => { c = obj(c); cards[id] = Object.assign({}, c, { first: isDay(c.first) ? c.first : undefined, box: Math.min(3, Math.max(0, Math.round(num(c.box)))), seen: num(c.seen), correct: num(c.correct), wrong: num(c.wrong), last: when(c.last) || null, due: isDay(c.due) ? c.due : todayStr() }); }); out.cards = cards;
    out.readingQuizzes = arr(out.readingQuizzes).map(r => Object.assign({}, r, { id: sv(r.id), articleId: sv(r.articleId), title: sv(r.title), date: when(r.date), score: num(r.score), total: num(r.total) || 1, secs: r.secs == null ? null : num(r.secs),
      answers: arr(r.answers).map(a => Object.assign({}, a, { qi: num(a.qi), chosen: idx(a.chosen), correct: num(a.correct), q: sv(a.q), chosenText: sv(a.chosenText), correctText: sv(a.correctText) })) }));
    out.vocabQuizzes = arr(out.vocabQuizzes).map(r => Object.assign({}, r, { id: sv(r.id), type: ['choice', 'choiceRev', 'spell'].includes(r.type) ? r.type : 'choice', date: when(r.date), score: num(r.score), total: num(r.total) || 1, wrong: arr(r.wrong).map(w => Object.assign({}, w, { vocabId: str(w.vocabId), word: sv(w.word), zh: sv(w.zh), given: sv(w.given) })).filter(w => okKey(w.vocabId)) }));
    // one record per question: 選擇題 and 克漏字 blanks (mcq), 翻譯 (translate), 文法 questions (gq: "g-passive:q3", "g-passive:s0.1")
    ['mcq', 'translate', 'gq'].forEach(k => { if (out[k] === undefined) return; const m = {}; Object.entries(obj(out[k])).filter(([id]) => okKey(id)).forEach(([id, r]) => { r = obj(r); m[id] = Object.assign({}, r, { tries: num(r.tries), ok: num(r.ok), lastOk: !!r.lastOk, last: when(r.last) || null }, k === 'translate' ? { answer: sv(r.answer) } : { chosen: idx(r.chosen) }, k === 'gq' ? { h: sv(r.h) } : {}); }); out[k] = m; });
    if (out.myWords !== undefined) out.myWords = cleanItems(out.myWords, 'vocab');
    if (out.cities !== undefined) { const m = {}; Object.entries(obj(out.cities)).filter(([id]) => okKey(id) && SAFE_ID.test(id)).forEach(([id, r]) => { r = obj(r); m[id] = { visited: isDay(r.visited) ? r.visited : null, best: Math.min(3, Math.max(0, Math.round(num(r.best)))) }; }); out.cities = m; }
    if (out.mcqTests !== undefined) out.mcqTests = arr(out.mcqTests).map(r => Object.assign({}, r, { type: typeof r.type === 'string' && SAFE_ID.test(r.type) ? r.type : '', mode: r.mode === 'test' ? 'test' : 'practice', date: when(r.date), score: num(r.score), total: num(r.total) || 1, secs: r.secs == null ? null : num(r.secs) }));
    const b = obj(out.bookmarks); out.bookmarks = { vocab: arr0(b.vocab), articles: arr0(b.articles) };
    if (out.resetAt !== undefined) { if (when(out.resetAt)) out.resetAt = when(out.resetAt); else delete out.resetAt; }
    // { v: 'B2', at: time chosen }; v '' = the student skipped the question
    if (out.level !== undefined) { const l = obj(out.level); if (when(l.at) && (l.v === '' || LEVELS.includes(l.v))) out.level = { v: l.v, at: when(l.at) }; else delete out.level; }
    // { v: 'exam' | 'general', at }
    if (out.goal !== undefined) { const g = obj(out.goal); if (when(g.at) && GOALS.includes(g.v)) out.goal = { v: g.v, at: when(g.at) }; else delete out.goal; }
    // a grammar chapter's best 小測驗 score and the day: { 'g-passive': { best: 7, at: '2026-10-20' } }
    if (out.grammar !== undefined) { const m = {}; Object.entries(obj(out.grammar)).filter(([id]) => okKey(id) && SAFE_ID.test(id)).forEach(([id, r]) => { r = obj(r); m[id] = { best: Math.min(99, Math.max(0, Math.round(num(r.best)))), at: isDay(r.at) ? r.at : null }; }); out.grammar = m; }
    // what was opened and when (已瀏覽): 'r:a14' a passage, 'g:g-passive' a grammar chapter
    if (out.opened !== undefined) { const m = {}; Object.entries(obj(out.opened)).filter(([k, d]) => okKey(k) && SAFE_ID.test(k) && isDay(d)).forEach(([k, d]) => { m[k] = d; }); out.opened = m; }
    // where a saved word was met (at most 3): { L123: [{ k: 'read'|'news'|'city', ref: 'a14' | link | city, p: paragraph, s: sentence, at }] }
    if (out.wordSrc !== undefined) { const m = {}; Object.entries(obj(out.wordSrc)).filter(([id]) => okKey(id) && SAFE_ID.test(id)).forEach(([id, list]) => { const l = arr(list).map(x => ({ k: ['read', 'news', 'city'].includes(x.k) ? x.k : 'read', ref: srcRef(x.ref), p: x.p == null || x.p === '' ? null : Math.max(0, Math.round(num(x.p))), s: str(x.s == null ? '' : x.s).slice(0, 300), at: when(x.at) })).filter(x => x.ref && x.s).slice(-3); if (l.length) m[id] = l; }); out.wordSrc = m; }
    return out;
  }
  const arr0 = x => Array.isArray(x) ? x.filter(y => typeof y === 'string') : [];
  // a word source points at a passage or city id, or a news link
  const srcRef = r => typeof r === 'string' && (SAFE_ID.test(r) || /^https?:\/\/\S{1,500}$/.test(r)) ? r : '';
  // Ids end up in HTML attributes and lookups, so anything from outside this device (files, the cloud) is checked.
  const SAFE_ID = /^[A-Za-z0-9_.:-]{1,80}$/;
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const cleanIds = list => Array.isArray(list) ? list.filter(id => typeof id === 'string' && SAFE_ID.test(id)) : [];
  function cleanItems(list, kind) {
    return (Array.isArray(list) ? list : []).filter(isObj).map(x => {
      x = Object.assign({}, x);
      // an unsafe id gets a replacement derived from it, so importing the same file twice gives the same id
      if (typeof x.id !== 'string' || !SAFE_ID.test(x.id)) { const raw = str(x.id); let h = 5381; for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) | 0; x.id = (kind === 'article' ? 'art_' : 'v_') + (raw ? (h >>> 0).toString(36) : uid('n').slice(2)); }
      const text = keys => keys.forEach(k => { if (x[k] != null) x[k] = str(x[k]); });
      if (kind === 'article') {
        x.title = str(x.title); x.passage = str(x.passage); x.tags = Array.isArray(x.tags) ? x.tags.map(str) : []; text(['title_zh', 'passage_zh', 'level']);
        x.questions = (Array.isArray(x.questions) ? x.questions : []).filter(q => isObj(q) && Array.isArray(q.options))
          .map(q => Object.assign({}, q, { q: str(q.q), options: q.options.map(str), answer: Number.isInteger(q.answer) ? q.answer : 0 }, q.explain != null ? { explain: str(q.explain) } : {}));
      } else { x.word = str(x.word); text(['pos', 'zh', 'syn', 'example', 'unit', 'type', 'level', 'cefr']); }
      return x;
    });
  }
  const SETTING_KEYS = ['examName', 'examNameEn', 'examDate', 'studentName', 'motto', 'teacherCode', 'teacherEmail', 'ownExamDate'];
  function cleanSettings(st) {
    const out = {}; if (isObj(st)) SETTING_KEYS.forEach(k => { if (typeof st[k] === 'string') out[k] = st[k]; });
    if (out.examDate && !/^\d{4}-\d{2}-\d{2}$/.test(out.examDate)) delete out.examDate;
    if (out.ownExamDate && !/^\d{4}-\d{2}-\d{2}$/.test(out.ownExamDate)) delete out.ownExamDate;
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
    if (typeof data.progressBase !== 'string') data.progressBase = null;
    if (!isObj(data.progressSnap) || !['bv', 'ba', 'mw'].every(k => Array.isArray(data.progressSnap[k]))) data.progressSnap = null;
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
  const CEFR = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B1', 5: 'B2', 6: 'B2', 7: 'B2+', 8: 'C1', 9: 'C2' };
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
    if (u === 'c1' || u === 'c2') return t(u === 'c1' ? 'unitC1' : 'unitC2');
    let m = /^lv(\d)$/.exec(u); if (m) return tf('unitLv', { n: m[1], c: CEFR[m[1]] || '' });
    m = /^ph(\d+)$/.exec(u); if (m) return `${t('unitPh')} · ${t('phCat' + m[1]) === 'phCat' + m[1] ? '' : t('phCat' + m[1])}`.replace(/ · $/, '');
    const map = t('seedUnits'); return (map && typeof map === 'object' && map[u]) || u;
  }
  // Built-in reading library (reading-library.js) + the teacher's own and edited passages (state.articles)
  const READ_LIB = (window.READING_LIBRARY || []).map(a => Object.assign({ lib: true }, a));
  const CITIES = window.CITY_CARDS || [];
  const cityById = id => CITIES.find(c => c.id === id);
  const cityName = c => ui.lang === 'zh' ? c.name_zh : c.name;
  let ARTICLES = [];
  function rebuildArticles() {
    // passages cannot be removed any more, so every built-in one is listed (an old hiddenArticles list is ignored)
    const own = new Set(state.articles.map(a => a.id));
    ARTICLES = state.articles.concat(READ_LIB.filter(a => !own.has(a.id)));
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
  let ui = Object.assign({ lang: 'zh', font: 'hand', theme: 'navy', user: null },
    (() => { try { return JSON.parse(localStorage.getItem(LS_UI) || '{}'); } catch (e) { return {}; } })());
  // tour: once the invitation is answered in any tab it stays answered (another open tab must not write it back)
  const saveUi = () => { try { if (!ui.tour && (JSON.parse(localStorage.getItem(LS_UI) || '{}') || {}).tour) ui.tour = 1; localStorage.setItem(LS_UI, JSON.stringify({ lang: ui.lang, font: ui.font, theme: ui.theme, user: ui.user, uiv: 4, tour: ui.tour ? 1 : 0, voice: ui.voice === 'f' ? 'f' : 'm', rate: [0.75, 0.9, 1].includes(ui.rate) ? ui.rate : 0.9, voiceURI: typeof ui.voiceURI === 'string' ? ui.voiceURI.slice(0, 200) : '' })); } catch (e) { } };
  // the old site saved English as its default on every device; switch those to Chinese once (a later English choice sticks)
  if (!(ui.uiv >= 2)) { if (ui.lang === 'en') ui.lang = 'zh'; }
  // 手寫風 is the default again (2026-10-21). The one-time switch to 標準字體 (uiv 3) is undone; a device that never got
  // that switch keeps its own pick, and a later pick of either typeface sticks
  if (ui.uiv !== 4) { if (ui.uiv === 3 || (ui.font !== 'clean' && ui.font !== 'hand')) ui.font = 'hand'; ui.uiv = 4; saveUi(); }
  // 老師: a cloud account counts as a teacher only once the server has said so in this visit (profiles.role, decided by the
  // database); a role cached on the device or edited in localStorage never opens the teacher pages by itself
  const cloudCfg = () => !!(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url);
  Object.defineProperty(ui, 'teacher', { get: () => !!(ui.user && ui.user.role === 'teacher' && (!ui.user.cloud || !cloudCfg() || (cloud.roleOk && cloud.roleFor === ui.user.id))) });

  // volatile view state
  const view = { page: 'home', articleId: null, answers: {}, submitted: false, editing: null, flash: null, flashSetup: { mode: 'due', unit: '', shuffle: true, limit: 30 } /* cards are always shuffled (no 洗牌 option) */, quiz: null, quizSetup: { type: 'choice', count: 10, unit: '' }, vocabSearch: '', vocabUnit: '', vocabEdit: null, bulkOpen: false, studentSource: 'local', cloudStudents: [], authMode: 'login', vocabBm: false, lastIn: {}, readPos: {} };

  /* ---------------- i18n ---------------- */
  const missingKeys = new Set();
  const t = (k) => {
    if (I18N[ui.lang] && I18N[ui.lang][k] !== undefined) return I18N[ui.lang][k];
    if (I18N.zh[k] !== undefined) return I18N.zh[k];
    if (!missingKeys.has(k)) { missingKeys.add(k); console.warn('i18n missing', k); }
    return k;
  };
  const tf = (k, o) => t(k).replace(/\{(\w+)\}/g, (_, n) => o[n]);
  function applyI18n() {
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.documentElement.lang = ui.lang === 'zh' ? 'zh-Hant-TW' : 'en';
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg, ms = 2200) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  /* ---------------- Motion + navigation map (UX v2) ---------------- */
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth = () => reduceMotion() ? 'auto' : 'smooth';
  const flashEl = el => { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1200); };
  const PAGE_META = { home: ['🏠', 'tabHome'], reading: ['📖', 'tabReading'], news: ['📰', 'tabNews'], flashcards: ['🃏', 'tabFlash'], vocab: ['📚', 'tabVocab'], phrases: ['🧩', 'tabPhrases'], grammar: ['📐', 'tabGrammar'],
    mcq: ['📝', 'tabMcq'], translate: ['✍️', 'tabTranslate'], progress: ['📈', 'tabProgress'], wrong: ['📕', 'tabWrong'], students: ['🧑‍🏫', 'tabStudents'], settings: ['⚙️', 'tabSettings'] };
  // phone bottom bar: 首頁 · 學習 · 練習 · 紀錄 · 更多 (更多 opens the sheet with 設定, the tour, the account and 外觀)
  const GROUPS = [{ id: 'home', pages: ['home'] }, { id: 'learn', pages: ['reading', 'news', 'flashcards', 'vocab', 'phrases', 'grammar'] },
    { id: 'practice', pages: ['mcq', 'translate'] }, { id: 'record', pages: ['progress', 'wrong', 'students'] }, { id: 'more', pages: ['settings'] }];
  // 學習 and 練習 have three categories each; 克漏字 is the 選擇題 page with cloze passages
  const CATS = [{ id: 'read', grp: 'learn', key: 'grpRead', ico: '📖', pages: ['reading', 'news'] }, { id: 'words', grp: 'learn', key: 'grpWords', ico: '🃏', pages: ['flashcards', 'vocab', 'phrases'] },
    { id: 'grammar', grp: 'learn', key: 'grpGrammar', ico: '📐', pages: ['grammar'] }, { id: 'mcq', grp: 'practice', key: 'tabMcq', ico: '📝', pages: ['mcq'] },
    { id: 'cloze', grp: 'practice', key: 'tabCloze', ico: '📄', pages: ['mcq'] }, { id: 'translate', grp: 'practice', key: 'grpTranslate', ico: '✍️', pages: ['translate'] }];
  // desktop folder tabs: 首頁, the six categories (under the captions 學習 and 練習), 紀錄 and 設定
  const DESK_GROUPS = [GROUPS[0]].concat(CATS, [GROUPS[3], { id: 'settings', pages: ['settings'] }]);
  const clozeOn = () => view.mc ? view.mc.kind === 'cloze' : !!view.mcf && view.mcf.type === 'cloze';
  const catOf = page => page === 'mcq' ? (clozeOn() ? 'cloze' : 'mcq') : ((CATS.find(c => c.pages.includes(page)) || {}).id || '');
  const groupOf = (page, list = GROUPS) => (list === DESK_GROUPS && catOf(page)) || (list.find(g => g.pages.includes(page)) || list[0]).id;
  const pagesOf = (gid, list) => ((list.find(g => g.id === gid) || list[0]).pages).filter(p => p !== 'students' || ui.teacher);
  // the page a group opens on the first time: 紀錄 opens 學生狀況 for a teacher
  const firstOf = (gid, list) => { const p = pagesOf(gid, list); return ui.teacher && p.includes('students') ? 'students' : p[0]; };
  const SUB_GROUPS = [['reading', 'news'], ['flashcards', 'vocab', 'phrases'], ['progress', 'wrong', 'students']];
  // the rows above a page: on phones the group's three categories (閱讀 · 單字 · 文法), then the category's pages as pills
  // (閱讀測驗 · 每日新聞 …); on desktops the categories are the tabs, so only the pills show
  function subtabs(page) {
    const cat = catOf(page), c = CATS.find(x => x.id === cat), live = liveCats();
    const seg = c ? `<div class="cat-seg" role="group" aria-label="${esc(t(c.grp === 'learn' ? 'grpLearn' : 'grpPractice'))}">${CATS.filter(x => x.grp === c.grp).map(x => `<button type="button" class="cat-btn${x.id !== cat && live.includes(x.id) ? ' has-session' : ''}" data-action="goCat" data-to="${x.id}"${x.id === cat ? ' aria-current="page"' : ''}><span aria-hidden="true">${x.ico}</span> ${t(x.key)}</button>`).join('')}</div>` : '';
    const g = SUB_GROUPS.find(x => x.includes(page));
    // 單字 also leads to the 字根字首字尾 page (roots.html, a page of its own in the same look)
    const more = g && g.includes('vocab') ? `<a class="subtab" href="roots.html"><span aria-hidden="true">🌱</span> ${t('rootsNav')}</a>` : '';
    const pages = g ? g.filter(p => p !== 'students' || ui.teacher) : [];
    const pills = pages.length + (more ? 1 : 0) < 2 ? '' : `<nav class="subtabs" aria-label="${esc(t('subNavLabel'))}">${pages.map(p => `<button class="subtab" data-action="nav" data-page="${p}"${p === page ? ' aria-current="page"' : ''}><span aria-hidden="true">${PAGE_META[p][0]}</span> ${t(PAGE_META[p][1])}</button>`).join('')}${more}</nav>`;
    return seg + pills;
  }
  // one page title per page: the tab's emoji and name, with the longer description underneath
  function pageHead(page, sub) {
    const [ic, key] = PAGE_META[page];
    return `<header class="page-head"><h1 tabindex="-1"><span aria-hidden="true">${ic}</span> ${t(key)}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;
  }
  // a practice session's top bar: ✕ end · what and how far · timer or score
  // (kind = 選擇題, count = 第 1 / 10 題; on narrow phones only the count is shown, so the progress never gets cut off)
  function sessionTop(exit, kind, count, done, total, extra = '') {
    const pct = total ? Math.min(100, Math.round(done / total * 100)) : 0;
    return `<div class="session-top"><button class="st-end" data-action="${exit}" aria-label="${esc(t('endSession'))}">✕<span class="st-end-txt"> ${t('endSession')}</span></button>
      <div class="st-mid"><div class="st-label" tabindex="-1"><span class="st-kind">${esc(kind)} · </span>${esc(count)}</div><div class="st-bar" role="progressbar" aria-label="${esc(kind + ' · ' + count)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${pct}%"></i></div></div>${extra}</div>`;
  }
  // scroll up to the question (never down), e.g. after 下一題
  function scrollToApp() { const top = Math.max(0, $('#app').getBoundingClientRect().top + window.scrollY); if (window.scrollY > top + 2) window.scrollTo({ top, behavior: smooth() }); }
  // a new page or screen starts at once: no smooth scroll through the old page (html has scroll-behavior: smooth)
  function jumpTo(y) { try { window.scrollTo({ top: y || 0, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y || 0); } }
  // headwords like salesperson/salesman/saleswoman may wrap after each "/"
  const wordBreaks = w => esc(w).replace(/\//g, '/<wbr>');
  // a long headword (telecommunications …) gets a smaller size until it fits its card; the typeface stays the same
  function fitWords() {
    $$('#app .flash-word, #app .quiz-word').forEach(el => {
      el.style.fontSize = '';
      if (!el.clientWidth || el.scrollWidth <= el.clientWidth + 1) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = Math.max(18, Math.floor(fs * el.clientWidth / el.scrollWidth)) + 'px';
    });
  }

  /* ---------------- Progress helpers ---------------- */
  const INTERVALS = [0, 1, 3, 7]; // days until next review for box 0..3
  function card(id) { return state.progress.cards[id] || (state.progress.cards[id] = { box: 0, seen: 0, correct: 0, wrong: 0, last: null, due: todayStr() }); }
  function bumpDay() { const d = todayStr(); state.progress.days[d] = (state.progress.days[d] || 0) + 1; }
  function markCard(id, known) {
    const c = card(id);
    if (!c.seen) c.first = todayStr(); // the day this word was first studied (for 今天的新字)
    c.seen++; c.last = new Date().toISOString();
    if (known) { c.correct++; c.box = Math.min(3, c.box + 1); }
    else { c.wrong++; c.box = 0; }
    c.due = addDays(todayStr(), INTERVALS[c.box]);
    bumpDay();
  }
  function dueCards() { const td = todayStr(); return VOCAB.filter(v => { const c = state.progress.cards[v.id]; return c && c.seen > 0 && c.due <= td; }); }
  function newCards() { return VOCAB.filter(v => !state.progress.cards[v.id] || state.progress.cards[v.id].seen === 0); }
  // a word's state in three steps, read from its card (no second record): 未學 (never shown) · 待複習 (seen, not yet at the
  // top box) · 已熟悉 (top box); a card that is due today says so
  const wordState = c => !c || !c.seen ? 'new' : c.box >= 3 ? 'known' : 'review';
  const stateChip = c => { const s = wordState(c); return `<span class="chip ws-${s} ${s === 'known' ? 'ok' : s === 'review' ? 'warn' : ''}">${t('ws_' + s)}${s === 'review' && c.due <= todayStr() ? ' · ' + t('wsDue') : ''}</span>`; };
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
  // Records are synced by MERGING, never by blindly replacing them. Each upload is written only on top of the cloud
  // version this device already includes (updated_at works as a version number); if another device wrote in between,
  // the upload reads the newer copy, merges it in and tries again.
  // epoch: bumped by every login and logout, so a slow, older request can never apply its result.
  // busy: an account is loading, so nothing is uploaded yet. dirty: this tab has practice that was not uploaded.
  const cloud = { configured: false, enabled: false, ready: null, sb: null, syncTimer: null, seq: 0, epoch: 0, busy: 0, dirty: false, lastPush: 0, lock: Promise.resolve(),
    contentOk: false, lastContent: '', teacherCode: '', warned: false };
  const LS_UNSYNCED = 'tve_exam_unsynced_v1'; // id of the account whose latest practice has not reached the cloud
  const LS_STASH = 'tve_exam_stash_v1'; // { accountId: { progress, base } } practice set aside when that account signed out before uploading
  const LS_CONTENT = 'tve_exam_content_v1'; // { owner, base, dirty } this device's copy of the class material
  const readJSON = k => { try { const s = JSON.parse(localStorage.getItem(k) || '{}'); return isObj(s) ? s : {}; } catch (e) { return {}; } };
  const readStash = () => readJSON(LS_STASH);
  const writeStash = (s) => { if (Object.keys(s).length) localStorage.setItem(LS_STASH, JSON.stringify(s)); else localStorage.removeItem(LS_STASH); };
  const stashOf = (s, id) => { const x = s[id]; return !x ? null : isObj(x.progress) ? x : { progress: x, base: null, snap: null }; };
  const stashEntry = () => ({ progress: state.progress, base: state.progressBase || null, snap: state.progressSnap || null });
  const readCS = () => readJSON(LS_CONTENT);
  const writeCS = (s) => localStorage.setItem(LS_CONTENT, JSON.stringify(s));
  const persist = () => localStorage.setItem(LS_DATA, JSON.stringify(state));
  const withLock = fn => (cloud.lock = cloud.lock.then(fn, fn));
  async function sha(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return 'x' + (h >>> 0).toString(16);
  }
  const loadScript = (src) => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => { el.remove(); rej(new Error('cannot load ' + src)); }; document.head.appendChild(el); });
  const sbCheck = ({ data, error }) => { if (error) throw error; return data; };

  // does a record hold any practice at all? (an empty record must never replace real practice)
  const hasPractice = p => isObj(p) && ['cards', 'days', 'mcq', 'translate', 'cities', 'gq', 'grammar', 'opened', 'wordSrc'].some(k => isObj(p[k]) && Object.keys(p[k]).length) || isObj(p) && ['readingQuizzes', 'vocabQuizzes', 'mcqTests', 'myWords'].some(k => Array.isArray(p[k]) && p[k].length) || isObj(p) && isObj(p.bookmarks) && ['vocab', 'articles'].some(k => Array.isArray(p.bookmarks[k]) && p.bookmarks[k].length) || isObj(p) && (isObj(p.level) || isObj(p.goal));
  const hash36 = x => { const t = JSON.stringify(x) || ''; let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  // what this device last saw in the cloud, for the lists where removing something must stick (bookmarks, own words)
  const progressSnap = p => ({ bv: p.bookmarks.vocab.slice(), ba: p.bookmarks.articles.slice(), mw: (p.myWords || []).map(w => w.id) });
  // three-way set merge: keep what both have, plus what either side added since the base; removals on either side stick
  const merge3 = (L, R, B) => { const l = new Set(L), r = new Set(R), base = B ? new Set(B) : null;
    return Array.from(new Set(R.concat(L))).filter(x => (l.has(x) && r.has(x)) || !base || (l.has(x) ? !base.has(x) : !base.has(x))); };
  // Combine two copies of one person's record (a = this device, b = the cloud) without losing practice from either.
  // snap: what this device last saw in the cloud (null when unknown, e.g. practice done before logging in).
  function mergeProgress(a, b, snap) {
    a = cleanProgress(a); b = cleanProgress(b);
    // "start over" on one device wins over older practice from the other
    const cut = String(a.resetAt || '') > String(b.resetAt || '') ? a.resetAt : b.resetAt || '';
    if (cut) [a, b].forEach(x => { if (String(x.resetAt || '') >= cut) return;
      Object.keys(x.cards).forEach(id => { if (String(x.cards[id].last || '') < cut) delete x.cards[id]; });
      Object.keys(x.days).forEach(d => { if (d < cut.slice(0, 10)) delete x.days[d]; });
      ['readingQuizzes', 'vocabQuizzes', 'mcqTests'].forEach(k => { if (x[k]) x[k] = x[k].filter(r => String(r.date || '') >= cut); });
      ['mcq', 'translate', 'cities', 'gq', 'grammar', 'opened', 'wordSrc'].forEach(k => { if (x[k]) x[k] = {}; });
      x.bookmarks = { vocab: [], articles: [] }; if (x.myWords) x.myWords = []; });
    const out = Object.assign({}, b, a);
    if (cut) out.resetAt = cut;
    out.cards = Object.assign({}, b.cards);
    Object.entries(a.cards).forEach(([id, c]) => { const o = b.cards[id]; out.cards[id] = !o ? c : (c.last || '') !== (o.last || '') ? ((c.last || '') > (o.last || '') ? c : o) : (c.seen >= o.seen ? c : o); });
    out.days = Object.assign({}, b.days); Object.entries(a.days).forEach(([d, n]) => { out.days[d] = Math.max(n, b.days[d] || 0); });
    const union = (x, y, key) => { const seen = new Set(); return (y || []).concat(x || []).filter(r => { const k = key(r); return !seen.has(k) && seen.add(k); }).sort((p, q) => String(p.date || '').localeCompare(String(q.date || ''))); };
    const quizKey = r => r.id || [r.date, r.title, r.type, r.score, r.total].join('|');
    out.readingQuizzes = union(a.readingQuizzes, b.readingQuizzes, quizKey);
    out.vocabQuizzes = union(a.vocabQuizzes, b.vocabQuizzes, quizKey);
    if (a.mcqTests || b.mcqTests) out.mcqTests = union(a.mcqTests, b.mcqTests, r => [r.date, r.type, r.mode, r.score, r.total].join('|')).slice(-50);
    ['mcq', 'translate', 'gq'].forEach(k => { if (!a[k] && !b[k]) return; const m = Object.assign({}, b[k]); Object.entries(a[k] || {}).forEach(([id, r]) => { const o = m[id]; m[id] = !o || r.tries > o.tries || (r.tries === o.tries && String(r.last || '') >= String(o.last || '')) ? r : o; }); out[k] = m; });
    if (a.cities || b.cities) { const m = Object.assign({}, b.cities); Object.entries(a.cities || {}).forEach(([id, r]) => { const o = m[id]; m[id] = !o ? r : { visited: String(r.visited || '') > String(o.visited || '') ? r.visited : o.visited, best: Math.max(r.best, o.best) }; }); out.cities = m; }
    // the level chosen last, on whichever device; a real choice always beats "skip for now"
    const lvRank = l => !l ? 0 : l.v ? 2 : 1;
    if (a.level || b.level) out.level = lvRank(a.level) !== lvRank(b.level) ? (lvRank(a.level) > lvRank(b.level) ? a.level : b.level) : String(a.level.at) >= String(b.level.at) ? a.level : b.level;
    if (a.goal || b.goal) out.goal = !a.goal ? b.goal : !b.goal ? a.goal : String(a.goal.at) >= String(b.goal.at) ? a.goal : b.goal;
    if (a.grammar || b.grammar) { const m = Object.assign({}, b.grammar); Object.entries(a.grammar || {}).forEach(([id, r]) => { const o = m[id]; m[id] = !o ? r : { best: Math.max(r.best, o.best), at: String(r.at || '') > String(o.at || '') ? r.at : o.at }; }); out.grammar = m; }
    if (a.opened || b.opened) { const m = Object.assign({}, b.opened); Object.entries(a.opened || {}).forEach(([k, d]) => { if (!m[k] || d > m[k]) m[k] = d; }); out.opened = m; }
    if (a.wordSrc || b.wordSrc) { const m = {}; new Set(Object.keys(a.wordSrc || {}).concat(Object.keys(b.wordSrc || {}))).forEach(id => { const seen = new Set();
      m[id] = ((b.wordSrc || {})[id] || []).concat((a.wordSrc || {})[id] || []).filter(x => { const k = x.k + '|' + x.ref + '|' + x.s; return !seen.has(k) && seen.add(k); }).sort((x, y) => String(x.at).localeCompare(String(y.at))).slice(-3); }); out.wordSrc = m; }
    const sn = cut ? null : snap;
    out.bookmarks = { vocab: merge3(a.bookmarks.vocab, b.bookmarks.vocab, sn && sn.bv), articles: merge3(a.bookmarks.articles, b.bookmarks.articles, sn && sn.ba) };
    if (a.myWords || b.myWords) { const all = new Map((b.myWords || []).concat(a.myWords || []).map(w => [w.id, w])), keep = new Set(merge3((a.myWords || []).map(w => w.id), (b.myWords || []).map(w => w.id), sn && sn.mw)); out.myWords = Array.from(all.values()).filter(w => keep.has(w.id)); }
    return out;
  }

  function initCloud() {
    const cfg = window.SUPABASE_CONFIG;
    if (!cfg || !/^https:\/\/[^\s/]+/.test(cfg.url || '') || !cfg.anonKey) { releaseHash(); return; }
    cloud.configured = true;
    const ep = cloud.epoch;
    cloud.ready = (async () => {
      if (!window.supabase) await loadScript('vendor/supabase.js');
      if (!cloud.sb) {
        cloud.sb = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
        // another tab (or the server) signed this browser out or into another account
        cloud.sb.auth.onAuthStateChange((event, session) => {
          // only after start-up has settled; this tab's own login and logout are not "elsewhere"
          if (event === 'INITIAL_SESSION' || !cloud.enabled || cloud.busy || !ui.user || !ui.user.cloud) return;
          const sid = session && session.user && session.user.id;
          if (event === 'SIGNED_OUT' || (sid && sid !== ui.user.id)) setTimeout(() => { if (ui.user && ui.user.cloud && (!sid || sid !== ui.user.id)) accountChangedElsewhere(); }, 0);
        });
      }
      const { data, error } = await cloud.sb.auth.getSession();
      // offline: keep the saved account and try again when the connection is back
      if (error && window.supabase.isAuthRetryableFetchError && window.supabase.isAuthRetryableFetchError(error)) throw error;
      releaseHash(); // supabase-js has read any sign-in link in the address by now
      const u = data && data.session && data.session.user;
      if (u && ep !== cloud.epoch && !ui.user) dropSession(); // logged out while this was loading
      else if (u) await cloudAfterLogin(u, ep);
      else if (ui.user && ep === cloud.epoch) { if (ui.user.cloud) leaveCloudAccount(ui.user); ui.user = null; saveUi(); }
      cloud.enabled = true;
      try { await pullContent(); } catch (e) { console.warn(e); }
      if (ui.user && ui.user.cloud && localStorage.getItem(LS_UNSYNCED) === ui.user.id) syncNow().catch(e => console.warn(e));
      applyUi(); render();
    })().catch(e => {
      console.warn('Supabase init failed', e); cloud.enabled = false; toast('☁️ ' + t('cloudDown'));
      // a sign-in token in the address cannot be used by this page any more: drop it (and turn page addresses back on),
      // unless the device is offline and will try again when the connection is back
      const retry = window.supabase ? !!(window.supabase.isAuthRetryableFetchError && window.supabase.isAuthRetryableFetchError(e)) : !navigator.onLine;
      if (!retry) releaseHash();
    });
  }
  // back online after starting offline: connect again and upload what was practised meanwhile
  window.addEventListener('online', () => {
    if (!cloud.configured) return;
    if (!cloud.enabled) initCloud();
    else if (ui.user && ui.user.cloud && localStorage.getItem(LS_UNSYNCED) === ui.user.id) syncNow().catch(e => console.warn(e));
  });
  // another tab logged out or switched account: keep this tab's unsent practice for its owner, then start again
  function accountChangedElsewhere() {
    if (!ui.user || !ui.user.cloud) return;
    if (cloud.dirty && state.progressOwner === ui.user.id) {
      const s = readStash(), prev = stashOf(s, ui.user.id);
      s[ui.user.id] = prev ? Object.assign(stashEntry(), { progress: mergeProgress(state.progress, prev.progress) }) : stashEntry(); writeStash(s);
    }
    cloud.epoch++; location.reload();
  }
  window.addEventListener('storage', e => {
    if (e.key !== LS_UI || !cloud.configured) return;
    let nu = null; try { nu = (JSON.parse(e.newValue || '{}') || {}).user || null; } catch (x) { }
    if ((nu && nu.id) !== (ui.user && ui.user.id)) accountChangedElsewhere();
  });
  async function refreshRole() {
    if (!cloud.sb || !cloud.enabled || cloud.busy || !ui.user || !ui.user.cloud || Date.now() - (cloud.roleAt || 0) < 5 * 60 * 1000) return;
    const id = ui.user.id; cloud.roleAt = Date.now();
    try {
      const prof = sbCheck(await cloud.sb.from('profiles').select('role').eq('id', id).maybeSingle()) || {};
      if (!ui.user || ui.user.id !== id) return;
      const role = prof.role === 'teacher' ? 'teacher' : 'student';
      cloud.roleOk = true; cloud.roleFor = id;
      if (role !== ui.user.role) { ui.user.role = role; saveUi(); applyUi(); if (view.page === 'students' && role !== 'teacher') view.page = 'progress'; render(); }
    } catch (e) { }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshRole(); });
  async function cloudAfterLogin(u, ep) {
    cloud.busy++;
    try {
      const prof = sbCheck(await cloud.sb.from('profiles').select('name, role').eq('id', u.id).maybeSingle()) || {};
      const user = { id: u.id, email: u.email, name: prof.name || u.email, role: prof.role === 'teacher' ? 'teacher' : 'student', cloud: true };
      cloud.roleOk = true; cloud.roleFor = u.id; cloud.roleAt = Date.now();
      const teacherCode = user.role === 'teacher' ? sbCheck(await cloud.sb.rpc('get_teacher_code')) || '' : '';
      const row = sbCheck(await cloud.sb.from('progress').select('data, updated_at').eq('user_id', u.id).maybeSingle());
      if (ep !== cloud.epoch) return false; // someone logged in or out meanwhile
      // whose practice is on this device? (decided after loading, so practice done while loading counts)
      const owner = state.progressOwner || null, flag = localStorage.getItem(LS_UNSYNCED), stash = readStash();
      if (owner && owner !== u.id && flag === owner) { const prev = stashOf(stash, owner); stash[owner] = prev ? Object.assign(stashEntry(), { progress: mergeProgress(state.progress, prev.progress) }) : stashEntry(); writeStash(stash); }
      const remote = row ? cleanProgress(row.data) : null;
      let local = null, base = null, snap = null;
      const mine = stashOf(stash, u.id);
      if (mine) { local = mine.progress; base = mine.base; snap = mine.snap; if (owner === u.id && flag === u.id) local = mergeProgress(state.progress, local); delete stash[u.id]; writeStash(stash); }
      else if (owner === u.id && flag === u.id) { local = state.progress; base = state.progressBase || null; snap = state.progressSnap || null; }
      else if (!owner && hasPractice(state.progress)) local = state.progress; // practised on this device before logging in
      if (local) {
        // keep this device's practice: merge with the cloud copy unless the cloud has nothing newer than what it already includes
        state.progress = cleanProgress(row && hasPractice(remote) && row.updated_at !== base ? mergeProgress(local, remote, base ? snap : null) : local);
        localStorage.setItem(LS_UNSYNCED, u.id); // protected until it is uploaded
      } else state.progress = remote || emptyProgress();
      state.progressBase = row ? row.updated_at : null;
      state.progressSnap = progressSnap(remote || emptyProgress());
      state.progressOwner = u.id;
      if (user.role !== 'teacher' && (owner !== u.id || !state.settings.studentName)) state.settings.studentName = user.name;
      persist();
      if (local) {
        const seq = cloud.seq;
        if (await pushProgress(u.id, ep) && seq === cloud.seq && localStorage.getItem(LS_UNSYNCED) === u.id) localStorage.removeItem(LS_UNSYNCED);
      }
      if (ep !== cloud.epoch) return false;
      ui.user = user; saveUi(); cloud.teacherCode = teacherCode; cloud.dirty = false;
      // the invite code typed at sign-up is only needed once, by the database
      if (u.user_metadata && u.user_metadata.teacher_code) cloud.sb.auth.updateUser({ data: { teacher_code: null } }).catch(() => {});
      return true;
    } finally { cloud.busy--; }
  }
  // Upload this device's record on top of the cloud version it already includes; if someone else wrote in between, merge and retry.
  async function pushProgress(id, ep = cloud.epoch) {
    if (!cloud.sb || !id || state.progressOwner !== id) return false;
    const stale = () => ep !== cloud.epoch || state.progressOwner !== id;
    for (let tries = 0; tries < 4; tries++) {
      const data = state.progress, base = state.progressBase || null;
      const res = base ? await cloud.sb.from('progress').update({ data }).eq('user_id', id).eq('updated_at', base).select('updated_at')
        : await cloud.sb.from('progress').insert({ user_id: id, data }).select('updated_at');
      if (res.error && res.error.code === '54000') { await new Promise(r => setTimeout(r, 3300)); continue; } // the database asks for a short pause
      if (res.error && res.error.code !== '23505') throw res.error;
      if (stale()) return false;
      if (!res.error && res.data && res.data.length) { state.progressBase = res.data[0].updated_at; state.progressSnap = progressSnap(cleanProgress(data)); persist(); return true; }
      const row = sbCheck(await cloud.sb.from('progress').select('data, updated_at').eq('user_id', id).maybeSingle());
      if (stale()) return false;
      const remote = row ? cleanProgress(row.data) : emptyProgress();
      if (row && hasPractice(remote)) state.progress = mergeProgress(state.progress, remote, base ? state.progressSnap : null);
      state.progressBase = row ? row.updated_at : null; state.progressSnap = progressSnap(remote); persist();
    }
    throw new Error(t('syncBusy'));
  }

  // ---- class material (teachers write it, everyone reads it) ----
  const CONTENT_SETTINGS = ['examName', 'examNameEn', 'examDate', 'motto', 'teacherEmail'];
  function contentPayload() {
    const settings = {}; CONTENT_SETTINGS.forEach(k => { settings[k] = state.settings[k] || ''; });
    return { articles: state.articles, vocab: state.vocab, hiddenVocab: state.hiddenVocab || [], hiddenArticles: state.hiddenArticles || [], settings };
  }
  const hasContent = c => isObj(c) && Object.keys(c).length > 0;
  const contentFrom = c => ({ articles: cleanItems(c.articles, 'article'), vocab: cleanItems(c.vocab, 'vocab'), hiddenVocab: cleanIds(c.hiddenVocab), hiddenArticles: cleanIds(c.hiddenArticles), settings: cleanSettings(c.settings) });
  function applyContent(c) {
    state.articles = c.articles; state.vocab = c.vocab; state.hiddenVocab = c.hiddenVocab; state.hiddenArticles = c.hiddenArticles;
    // an empty teacher setting never wipes what the student typed (e.g. the teacher email); a student who picked
    // their own exam date keeps it (until it matches the teacher's date again)
    if (!ui.teacher && state.settings.ownExamDate && c.settings.examDate === state.settings.ownExamDate) delete state.settings.ownExamDate;
    CONTENT_SETTINGS.forEach(k => { if (c.settings[k] && !(k === 'examDate' && !ui.teacher && state.settings.ownExamDate)) state.settings[k] = c.settings[k]; });
    rebuildVocab(); rebuildArticles(); persist();
  }
  // what this device last saw in the cloud: a fingerprint of every item, the settings and the hidden lists
  const contentSnap = c => { const i = {}; c.articles.forEach(x => { i['a:' + x.id] = hash36(x); }); c.vocab.forEach(x => { i['v:' + x.id] = hash36(x); }); return { s: Object.assign({}, c.settings), i, ha: c.hiddenArticles.slice(), hv: c.hiddenVocab.slice() }; };
  // a device that never synced counts the built-in material as its starting point
  const seedSnap = () => contentSnap(contentFrom({ articles: SEED_DATA.articles, vocab: SEED_DATA.vocab, settings: SEED_DATA.settings }));
  // Three-way merge of the class material: for every item and setting, take this device's version only if it changed
  // here since the last sync, otherwise the cloud's. Removing an item sticks unless the other side edited it meanwhile.
  function mergeContent(local, remote, snap) {
    const pick = (L, R, k) => {
      const lm = new Map(L.map(x => [x.id, x])), rm = new Map(R.map(x => [x.id, x])), out = [];
      R.map(x => x.id).concat(L.map(x => x.id).filter(id => !rm.has(id))).forEach(id => {
        const l = lm.get(id), r = rm.get(id), b = snap.i[k + ':' + id];
        const lChanged = b === undefined ? !!l : (!l || hash36(l) !== b), rChanged = b === undefined ? !!r : (!r || hash36(r) !== b);
        const v = lChanged && !(!l && rChanged && r) ? l : r;
        if (v) out.push(v);
      });
      return out;
    };
    const settings = {}; CONTENT_SETTINGS.forEach(k => { const lv = local.settings[k] || '', rv = remote.settings[k] || ''; settings[k] = lv !== (snap.s[k] || '') ? lv : rv; });
    return { articles: pick(local.articles, remote.articles, 'a'), vocab: pick(local.vocab, remote.vocab, 'v'), hiddenVocab: merge3(local.hiddenVocab, remote.hiddenVocab, snap.hv), hiddenArticles: merge3(local.hiddenArticles, remote.hiddenArticles, snap.ha), settings };
  }
  async function pullContent() {
    if (!cloud.sb || !ui.user || !ui.user.cloud) return;
    const ep = cloud.epoch, me = ui.user.id;
    const row = sbCheck(await cloud.sb.from('content').select('data, updated_at').eq('id', 'main').maybeSingle());
    if (ep !== cloud.epoch || !ui.user || ui.user.id !== me) return;
    const remote = row && hasContent(row.data) ? contentFrom(row.data) : null, cs = readCS();
    cloud.contentOk = true;
    if (!ui.teacher) { if (remote) applyContent(remote); writeCS({ owner: me, base: row ? row.updated_at : null, dirty: false }); cloud.lastContent = JSON.stringify(contentPayload()); return; }
    const first = cs.owner !== me, dirty = !first && !!cs.dirty;
    if (!remote) { writeCS({ owner: me, base: row ? row.updated_at : null, dirty: true, snap: seedSnap() }); cloud.lastContent = ''; await pushContent(ep); return; } // nothing shared yet: this device creates it
    if (first || (dirty && cs.base !== row.updated_at)) applyContent(mergeContent(contentFrom(contentPayload()), remote, first || !cs.snap ? seedSnap() : cs.snap)); // keep this teacher's unsent work
    else if (!dirty) applyContent(remote);
    const rs = {}; CONTENT_SETTINGS.forEach(k => { rs[k] = remote.settings[k] || ''; });
    const same = JSON.stringify(contentFrom(contentPayload())) === JSON.stringify(Object.assign({}, remote, { settings: rs }));
    writeCS({ owner: me, base: row.updated_at, dirty: !same, snap: contentSnap(remote) });
    cloud.lastContent = same ? JSON.stringify(contentPayload()) : '';
    if (!same) await pushContent(ep);
  }
  function markContentDirty() {
    if (!ui.teacher || !ui.user || !ui.user.cloud) return;
    if (JSON.stringify(contentPayload()) === cloud.lastContent) return;
    const cs = readCS(); if (cs.owner !== ui.user.id) return; // not synced on this device yet: the next pull merges it
    if (!cs.dirty) writeCS(Object.assign(cs, { dirty: true }));
  }
  async function pushContent(ep = cloud.epoch) {
    if (!cloud.sb || !ui.user || !ui.teacher || !ui.user.cloud) return true;
    // never write the class material from a device that could not read it first; the edits stay here and are merged later
    if (!cloud.contentOk) { if (!cloud.warned) { cloud.warned = true; toast(t('contentNotLoaded')); } return false; }
    const me = ui.user.id;
    for (let tries = 0; tries < 4; tries++) {
      const cs = readCS(), data = contentPayload(), json = JSON.stringify(data);
      if (json === cloud.lastContent && !cs.dirty) return true;
      const res = cs.base ? await cloud.sb.from('content').update({ data }).eq('id', 'main').eq('updated_at', cs.base).select('updated_at')
        : await cloud.sb.from('content').insert({ id: 'main', data }).select('updated_at');
      if (res.error && res.error.code !== '23505') throw res.error;
      if (ep !== cloud.epoch || !ui.user || ui.user.id !== me) return false;
      if (!res.error && res.data && res.data.length) { writeCS({ owner: me, base: res.data[0].updated_at, dirty: JSON.stringify(contentPayload()) !== json, snap: contentSnap(contentFrom(data)) }); cloud.lastContent = json; return true; }
      // another device changed the material since this one read it: combine and try again
      const row = sbCheck(await cloud.sb.from('content').select('data, updated_at').eq('id', 'main').maybeSingle());
      if (ep !== cloud.epoch || !ui.user || ui.user.id !== me) return false;
      const remote = row && hasContent(row.data) ? contentFrom(row.data) : null;
      if (remote) { applyContent(mergeContent(contentFrom(contentPayload()), remote, cs.snap || seedSnap())); toast(t('contentMerged')); }
      writeCS({ owner: me, base: row ? row.updated_at : null, dirty: true, snap: remote ? contentSnap(remote) : cs.snap || seedSnap() });
    }
    throw new Error(t('syncBusy'));
  }
  async function syncNow() {
    if (!cloud.enabled || cloud.busy || !ui.user || !ui.user.cloud) return;
    const id = ui.user.id, ep = cloud.epoch;
    return withLock(async () => {
      if (ep !== cloud.epoch || !ui.user || ui.user.id !== id) return;
      const seq = cloud.seq;
      const [okP] = await Promise.all([pushProgress(id, ep), pushContent(ep)]);
      cloud.lastPush = Date.now();
      // the flag is cleared only when the record really reached the cloud
      if (okP && seq === cloud.seq) { cloud.dirty = false; if (localStorage.getItem(LS_UNSYNCED) === id) localStorage.removeItem(LS_UNSYNCED); }
      if (okP) { cloud.st = { s: 'ok', at: Date.now() }; updateSync(); }
    });
  }
  // where the record is and whether the last upload worked (shown on 學習紀錄 and in 設定; a failure keeps everything on this device)
  function syncState() {
    if (!ui.user) return { k: 'device' };
    if (!ui.user.cloud || !cloud.configured) return { k: 'local' };
    if (navigator.onLine === false) return { k: 'offline' };
    if (cloud.st && cloud.st.s === 'saving') return { k: 'saving' };
    if (cloud.st && cloud.st.s === 'error') return { k: 'error' };
    if (cloud.dirty || !cloud.enabled) return { k: 'pending' };
    return { k: 'ok', at: cloud.st && cloud.st.at };
  }
  function syncBox() {
    const st = syncState(), tm = st.at ? new Date(st.at).toLocaleTimeString(ui.lang === 'en' ? 'en-US' : 'zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
    return `<div class="sync-box sync-${st.k}" role="status"><span class="sync-dot" aria-hidden="true"></span><span>${esc(tf('sync_' + st.k, { t: tm }))}</span>${st.k === 'error' ? `<button type="button" class="btn sm" data-action="syncRetry">${t('syncRetry')}</button>` : ''}</div>`;
  }
  function updateSync() { $$('.sync-box').forEach(e => { e.outerHTML = syncBox(); }); }
  window.addEventListener('online', () => { updateSync(); if (cloud.dirty) scheduleSync(); });
  window.addEventListener('offline', updateSync);
  function syncFailed(e) { cloud.st = { s: 'error', err: e && e.message, at: Date.now() }; updateSync(); toast('☁️ ' + t('syncFailToast'), 6000); }
  function scheduleSync() {
    if (!ui.user || !ui.user.cloud) return;
    // remembered even offline or while the account is still loading, so the practice is uploaded later
    cloud.seq++; cloud.dirty = true; localStorage.setItem(LS_UNSYNCED, ui.user.id);
    markContentDirty();
    if (!cloud.enabled || cloud.busy) return;
    clearTimeout(cloud.syncTimer);
    // the database refuses large records rewritten within 3 seconds, so uploads are spaced out
    cloud.syncTimer = setTimeout(() => { syncNow().catch(syncFailed); }, Math.max(1500, 3300 - (Date.now() - cloud.lastPush)));
    updateSync();
  }
  // the list holds names only; a student's record is downloaded when the teacher opens it
  async function loadCloudStudents() {
    const [profs, rows] = await Promise.all([
      cloud.sb.from('profiles').select('id, email, name').eq('role', 'student').order('name').then(sbCheck),
      cloud.sb.from('progress').select('user_id, updated_at').then(sbCheck)]);
    const when = new Map(rows.map(r => [r.user_id, r.updated_at]));
    view.cloudStudents = profs.map(p => ({ id: 'cloud_' + p.id, uid: p.id, name: p.name || p.email || t('roleStudent'), email: p.email || '', exportedAt: when.get(p.id) || null, progress: null }));
  }
  // every account in the project (teachers can read all profiles), newest first, with the last practice time
  async function loadCloudAccounts() {
    const [profs, rows] = await Promise.all([
      cloud.sb.from('profiles').select('id, email, name, role, created_at').order('created_at', { ascending: false }).then(sbCheck),
      cloud.sb.from('progress').select('user_id, updated_at').then(sbCheck)]);
    const when = new Map(rows.map(r => [r.user_id, r.updated_at]));
    view.cloudAccounts = profs.map(p => ({ id: p.id, name: p.name || '', email: p.email || '', role: p.role === 'teacher' ? 'teacher' : 'student', created: p.created_at || '', last: when.get(p.id) || '' }));
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
    cloud.epoch++;
    if (localStorage.getItem(LS_UNSYNCED) === me.id && state.progressOwner === me.id) {
      const s = readStash(), prev = stashOf(s, me.id);
      s[me.id] = prev ? Object.assign(stashEntry(), { progress: mergeProgress(state.progress, prev.progress) }) : stashEntry(); writeStash(s);
    }
    if (localStorage.getItem(LS_UNSYNCED) === me.id) localStorage.removeItem(LS_UNSYNCED);
    state.progress = emptyProgress(); state.progressOwner = null; state.progressBase = null; state.progressSnap = null; state.settings.studentName = '';
    persist(); cloud.dirty = false;
  }
  // tell the server (waiting at most 2 s), then forget the login on this device in any case,
  // even if the Supabase library never loaded
  async function dropSession() {
    if (cloud.sb) await Promise.race([cloud.sb.auth.signOut({ scope: 'local' }).catch(() => {}), new Promise(r => setTimeout(r, 2000))]);
    Object.keys(localStorage).filter(k => /^sb-.+-auth-token/.test(k)).forEach(k => localStorage.removeItem(k));
  }
  async function logoutUser() {
    if (ui.user && ui.user.cloud) {
      const me = ui.user;
      clearTimeout(cloud.syncTimer);
      // upload first, but never keep the person waiting more than a few seconds
      try { await Promise.race([syncNow(), new Promise(r => setTimeout(r, 4000))]); } catch (e) { }
      leaveCloudAccount(me);
      // 'local' signs out this device only, so a student's phone stays signed in
      await dropSession();
      cloud.lastContent = ''; cloud.teacherCode = ''; cloud.contentOk = false; cloud.warned = false;
    } else cloud.epoch++;
    ui.user = null; saveUi(); view.cloudStudents = []; view.cloudAccounts = null;
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
  const TP_TOTAL = TIME_PLAN.reduce((a, x) => a + x[1], 0);
  // the 100-minute bar with the 30′ and 50′ marks (home card and the guide window)
  function timePlanBar() {
    const segs = TIME_PLAN.map(([k, m, c]) => `<div class="tp-seg" style="flex:${m};background:${c}" title="${esc(t(k))} ${m} ${t('min')}"><span>${m}</span></div>`).join('');
    const mark = (min, key) => `<div class="tp-mark" style="left:${min / TP_TOTAL * 100}%"><span>${esc(t(key))}</span></div>`;
    return `<div class="tp-bar">${segs}</div><div class="tp-marks">${mark(30, 'tpMark30')}${mark(50, 'tpMark50')}</div>`;
  }
  function timePlanCard() {
    const legend = TIME_PLAN.map(([k, m, c]) => `<span class="tp-leg"><i style="background:${c}"></i>${esc(t(k))} <b>${m}′</b></span>`).join('');
    return `<div class="card timeplan">
      <div class="row" style="justify-content:space-between"><b>${TP_TOTAL} ${t('min')}</b><span class="small muted">${t('tpScore')}</span></div>
      ${timePlanBar()}
      <div class="tp-legend">${legend}</div>
      <ul class="tp-tips"><li>${t('tpTip1')}</li><li>${t('tpTip2')}</li><li>${t('tpTip3')}</li></ul>
      <button type="button" class="btn sm ghost tp-guide" data-action="openGuide" aria-haspopup="dialog" aria-controls="guideModal">${t('guideOpen')}</button>
    </div>`;
  }
  /* ---- 題型與時間分配: the whole guide in a window with a ✕ (the PDF opened on its own left phones with no way back) ---- */
  const guideModal = $('#guideModal');
  let guideOpener = null;
  function guideHTML() {
    const I = t('examInfo'), zh = ui.lang === 'zh', colon = zh ? '：' : ': ', dot = zh ? '・' : ' · ';
    const [cCount, cMarks] = I.cols.slice(1, 3).map(c => c.replace(/\s*[（(].*?[）)]/, '')); // 題數（近年） → 題數
    return `<div class="guide-head"><h2 id="guideTitle">📄 ${t('guideTitle')}</h2><button type="button" class="modal-close" data-guide="close" aria-label="${t('close')}">✕</button></div>
      <div class="guide-body">
        <h3>📋 ${t('structureTitle')}</h3>
        <div class="gd-parts">${I.rows.map(r => `<div class="gd-part"><b>${esc(r[0])}</b><div class="gd-meta">${esc(cCount)}${colon}${esc(r[1])}${dot}${esc(cMarks)}${colon}${esc(r[2])}</div><div>${esc(r[3])}</div></div>`).join('')}</div>
        <h3>🧮 ${t('guideSplitTitle')}</h3>
        <div class="gd-split">${I.split.map(([n, x]) => `<div class="gd-num"><b>${esc(n)}</b><span>${esc(x)}</span></div>`).join('')}</div>
        <h3>⏱️ ${t('timePlanTitle')}</h3>
        ${timePlanBar()}
        <ul class="gd-tips">${TIME_PLAN.map(([k, m, c]) => `<li><i style="background:${c}" aria-hidden="true"></i><span><b>${esc(t(k))} ${m}′</b>　${esc(t('tip' + k.slice(3)))}</span></li>`).join('')}</ul>
        <h3>📈 ${t('trendTitle')}</h3>
        <div class="list">${I.trends.map((x, i) => `<div class="list-item"><span class="gd-no">0${i + 1}</span><div class="grow"><div class="title">${esc(x[0])}</div><div class="meta">${esc(x[1])}</div></div></div>`).join('')}</div>
        <h3>✅ ${t('rulesTitle')}</h3>
        <div class="list">${I.rules.map(x => `<div class="list-item"><span aria-hidden="true">${x[0]}</span><div class="grow"><div class="title">${esc(x[1])}</div><div class="meta">${esc(x[2])}</div></div></div>`).join('')}</div>
        <p class="gd-line">「${t('oneLine')}」</p>
        <p class="gd-src">${t('guideSrc')}</p>
        <div class="gd-foot"><a class="btn sm ghost" href="docs/tve-english-exam-guide.pdf" download>${t('pdfLink')}</a><button type="button" class="btn" data-guide="close">✕ ${t('close')}</button></div>
      </div>`;
  }
  function openGuide(opener) {
    if (!guideModal.classList.contains('hidden')) return;
    guideOpener = opener || null;
    const box = $('#guideSheet'); box.innerHTML = guideHTML();
    guideModal.classList.remove('hidden'); document.body.classList.add('guide-open'); box.scrollTop = 0;
    requestAnimationFrame(() => { const x = $('#guideSheet .modal-close'); if (x) x.focus({ preventScroll: true }); });
  }
  function closeGuide(leaving) {
    if (guideModal.classList.contains('hidden')) return;
    guideModal.classList.add('hidden'); document.body.classList.remove('guide-open');
    if (!leaving && guideOpener && document.contains(guideOpener)) guideOpener.focus({ preventScroll: true });
  }
  guideModal.addEventListener('click', e => { if (e.target === guideModal || e.target.closest('[data-guide="close"]')) closeGuide(); });

  /* ---------------- 📐 文法 chapters (grammar.html) a grammar point belongs to ---------------- */
  // the titles for the links (grammar.html has the chapters themselves); the first pattern that matches an MCQ topic
  // ("present perfect", "inversion (little)") or a news lesson's point ("現在完成式 (Present Perfect Tense)") wins
  const GRAM_CH = {
    'g-sentence': ['句子的基本結構', 'Sentence patterns'], 'g-question': ['疑問句與附加問句', 'Questions and question tags'], 'g-noun': ['名詞、冠詞與數量詞', 'Nouns, articles and quantifiers'],
    'g-pronoun': ['代名詞', 'Pronouns'], 'g-preposition': ['介系詞', 'Prepositions'], 'g-agree': ['主詞與動詞一致', 'Subject–verb agreement'],
    'g-present': ['現在簡單式與現在進行式', 'Present simple and present continuous'], 'g-past': ['過去簡單式與過去進行式', 'Past simple and past continuous'], 'g-future': ['未來式', 'Talking about the future'],
    'g-perfect': ['完成式', 'Perfect tenses'], 'g-modal': ['助動詞', 'Modal verbs'], 'g-passive': ['被動語態', 'The passive voice'], 'g-causative': ['使役動詞與感官動詞', 'Causative and sense verbs'],
    'g-infinitive': ['不定詞 to V', 'Infinitives'], 'g-gerund': ['動名詞與不定詞的選擇', 'Gerunds vs infinitives'], 'g-participle': ['分詞當形容詞', 'Participles as adjectives'],
    'g-participle-clause': ['分詞構句', 'Participle clauses'], 'g-adj-adv': ['形容詞與副詞', 'Adjectives and adverbs'], 'g-compare': ['比較級與最高級', 'Comparatives and superlatives'],
    'g-conj': ['連接詞', 'Conjunctions'], 'g-relative': ['關係代名詞', 'Relative pronouns'], 'g-relative-adv': ['關係副詞與複合關係詞', 'Relative adverbs and what / -ever'],
    'g-noun-clause': ['名詞子句與間接問句', 'Noun clauses and indirect questions'], 'g-conditional': ['條件句與假設語氣', 'Conditionals and the subjunctive'], 'g-inversion': ['倒裝句', 'Inversion'],
    'g-emphasis': ['強調句與常用句型', 'Cleft sentences and useful patterns'],
  };
  const GRAM_FIND = [
    [/conditional|wish|subjunctive|as if|were to|lest|but for|if only|it's time|假設|條件句/i, 'g-conditional'],
    [/inver|no sooner|hardly|not until|nowhere|rarely|fronting|ellipsis|倒裝/i, 'g-inversion'],
    [/cleft|強調|分裂句/i, 'g-emphasis'],
    [/question tag|附加問句|疑問句/i, 'g-question'],
    [/agreement|there is|一致/i, 'g-agree'],
    [/participle clause|participial (construction|clause)|absolute|with \+ o|dangling|negative participle|perfect passive participle|分詞構句/i, 'g-participle-clause'],
    [/reduced relative|participial adj|participle modifier|-ed\/-ing|分詞/i, 'g-participle'],
    [/relative adverb|noun clause with what|whatever|關係副詞|複合關係/i, 'g-relative-adv'],
    [/relative|whom|whose|of which|non-defining|關係|形容詞子句/i, 'g-relative'], // before 名詞子句: 關係代名詞子句 contains it
    [/noun clause|whether|indirect question|名詞子句|同位語|間接問句/i, 'g-noun-clause'],
    [/causative|passive of make|let \+ o|使役|感官動詞/i, 'g-causative'],
    [/passive|被動/i, 'g-passive'],
    [/perfect|完成/i, 'g-perfect'],
    [/modal|must|\bcan\b(?!'t)|had better|would rather|used to|could have|needn't|may as well|have p\.p|助動詞/i, 'g-modal'],
    [/gerund|v-ing|avoid|can't help|difficulty|spend|no use|forget to|decide \+ to|prefer a to b|動名詞/i, 'g-gerund'],
    [/infinitive|too\.\.\.to|不定詞/i, 'g-infinitive'],
    [/compar|superlative|as\.\.\.as|twice|multiples|比較|最高級/i, 'g-compare'],
    [/present continuous|present simple|現在簡單|現在進行/i, 'g-present'],
    [/past simple|simple past|past continuous|過去簡單|過去進行/i, 'g-past'],
    [/future|going to|time clauses|未來/i, 'g-future'],
    [/conjunction|although|despite|unless|so\.\.\.that|such\.\.\.that|so that|in case|as long as|concession|連接詞|副詞子句/i, 'g-conj'],
    [/preposition|different from|介系詞/i, 'g-preposition'],
    [/pronoun|one\.\.\.the other|reciprocal|dummy|代名詞/i, 'g-pronoun'],
    [/quantifier|determiner|some \/ any|how many|article|冠詞|數量|可數/i, 'g-noun'],
    [/adjective|adverb|enough|形容詞|副詞/i, 'g-adj-adv'],
  ];
  // every key the news grammar detector (GRAMMAR, below) can find, in its order
  const GRAM_KEY = { passive: 'g-passive', perfect: 'g-perfect', relative: 'g-relative', compare: 'g-compare', modal: 'g-modal', future: 'g-future', ifClause: 'g-conditional', whTo: 'g-infinitive', thereBe: 'g-agree', gerund: 'g-gerund', question: 'g-question' };
  const gramChapter = text => { const hit = GRAM_FIND.find(([re]) => re.test(String(text || ''))); return hit ? hit[1] : ''; };
  const gramLink = id => GRAM_CH[id] ? `<p class="small gram-ch">📐 <a href="#/grammar/${id}">${esc(tf('grammarReview', { t: GRAM_CH[id][ui.lang === 'en' ? 1 : 0] }))}</a></p>` : '';

  /* ---------------- Bookmarks ---------------- */
  const bm = () => { const p = state.progress; if (!p.bookmarks) p.bookmarks = { vocab: [], articles: [] }; return p.bookmarks; };
  const isBm = (kind, id) => bm()[kind].includes(id);
  function toggleBm(kind, id) { const l = bm()[kind]; const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.push(id); save(); toast(i >= 0 ? t('bookmarkRemoved') : t('bookmarkAdded')); }
  const bmBtn = (kind, id, sm = true) => `<button class="btn ${sm ? 'sm' : ''} bm-btn ${isBm(kind, id) ? 'on' : ''}" data-action="toggleBm" data-kind="${kind}" data-id="${esc(id)}" title="${t('bookmark')}">${isBm(kind, id) ? t('removeBookmark') : t('addBookmark')}</button>`;

  /* ---------------- Speech: speech.js, shared with roots.html ---------------- */
  const SP = window.TVESpeech;
  SP.setup({ kind: () => ui.voice, toast, text: k => t(k), changed: () => refreshVoiceCard(), rate: () => ui.rate || 0.9, voice: () => ui.voiceURI || '', state: on => ttsState(on) });
  // while something is being read, a 停止朗讀 button stays on screen (every 🔊 can be stopped from anywhere)
  function ttsState(on) { const b = document.getElementById('ttsStop'); if (b) b.hidden = !on; }
  const { hasTTS, sysVoice, isIOS, voiceFor, voiceKnown, say, speak } = SP, speakStop = SP.stop;

  /* ---------------- Pages ---------------- */
  const GOAL = { new: 10 };   // new words a day (the cap of a 高頻 round started from the home bookmarks)
  function newToday() { const td = todayStr(); return Object.values(state.progress.cards).filter(c => c.first === td).length; }
  const PRACTICAL_TAGS = ['Notice', 'Advertisement', 'Email', 'Letter', 'Schedule', 'Instructions'];
  const practicalText = a => a.level === 'Reading · Practical' || (a.tags || []).some(x => PRACTICAL_TAGS.includes(x));
  /* ---- My level (the 🎯 drawer): where reading, 選擇題, 克漏字, 翻譯 and 單字卡 start ---- */
  const lvOf = p => { const l = p && p.level; return l && LEVELS.includes(l.v) ? l.v : ''; };
  const myLevel = () => lvOf(state.progress);
  const levelAsked = () => !!(state.progress.level && state.progress.level.at);
  const LV_PRESET = { A2: '@A2', B1: '@B1', B2: '@B2', C1: '@C1', C2: '@C2' };
  const LV_TEST = ['B1', 'B2'];  // the 統測 range: starred as recommended
  // a new level (chosen here or on another device) moves the starting filters with it; a filter changed by hand stays until then
  function applyLevel() {
    const lv = myLevel(); if (view.lvApplied === lv) return;
    const first = view.lvApplied === undefined; view.lvApplied = lv;
    if (first && !lv) return;
    if (view.mcf) view.mcf.level = lv;
    if (view.trf) { view.trf.level = lv; view.trf.page = 0; }
    view.flashSetup.unit = LV_PRESET[lv] || ''; view.quizSetup.unit = LV_PRESET[lv] || '';
  }
  // the five choices with what each level means; B1 and B2 carry the ⭐ 統測生推薦 tag
  function levelOptions() {
    const cur = myLevel();
    return `<div class="level-grid" role="group" aria-label="${esc(t('lvPickTitle'))}">${LEVELS.map(lv => `<button type="button" class="level-opt${cur === lv ? ' on' : ''}${LV_TEST.includes(lv) ? ' rec' : ''}" data-action="setLevel" data-v="${lv}" aria-pressed="${cur === lv}">
        <span class="lv-top"><span class="lv-badge">${lv}</span><b class="lv-name">${t('lvName' + lv)}</b>${cur === lv ? `<span class="lv-check" aria-hidden="true">✓</span>` : ''}</span>
        ${LV_TEST.includes(lv) ? `<span class="lv-star">⭐ ${t('lvRecommended')}</span>` : ''}
        <span class="lv-desc">${t('lvDesc' + lv)}</span></button>`).join('')}</div>`;
  }
  // a passage with answers chosen but not handed in, also after a back swipe to the list (view.answers belong to lastArticle)
  function readOpen() {
    const id = view.articleId || view.lastArticle;
    return id && !view.submitted && Object.keys(view.answers).length && articleById(id) ? id : null;
  }
  // a passage's length and an estimate of the time it takes (the line above each passage)
  const wordCount = a => String(a.passage || '').split(/\s+/).filter(Boolean).length;
  const readMinutes = a => Math.max(5, Math.round(wordCount(a) / 100) + 4); // a learner reads about 100 words a minute, plus about 4 minutes for 5 questions
  const levelShort = a => String(a.level || '').replace('Reading · ', '').replace('Practical', t('practicalShort'));
  function pageHome() {
    const dl = daysLeft();
    const recent = state.progress.readingQuizzes.slice(-5).reverse();
    return `
      <h1 class="sr-only" tabindex="-1">${t('tabHome')}</h1>
      <div class="banner"><picture><source srcset="img/banner-static.svg" media="(prefers-reduced-motion: reduce)"><img src="img/banner.svg" alt="" class="banner-img" width="1400" height="220"></picture></div>
      <div class="home-daily">${dailyCard()}</div>
      <div style="margin-top:24px">${worldMapCard(dl)}</div>
      <h2 class="section-title">⏱️ ${t('timePlanTitle')}</h2><p class="section-sub">${t('timePlanSub')}</p>${timePlanCard()}
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
    const [tx, ty] = xy(121, 23.5), [lx, ly] = xy(-118, 34);
    // tap a city (or its chip below the map) to fly there and open its card; keyboards and screen readers use the chips, so each city is in the tab order once
    // where a city's name sits: right of the dot (default), left ('end'), or under it, ending at the dot ('below': where neighbours leave no room on either side)
    const ANCHOR = { london: 'end', toronto: 'end', singapore: 'end', sydney: 'end', seoul: 'end', bangkok: 'end', mumbai: 'below', auckland: 'below' };
    // plain labels when the city cards are not available
    const MAP_LABELS = [{ id: 'losangeles', name: 'Los Angeles', lon: -118, lat: 34 }, { id: 'newyork', name: 'New York', lon: -74, lat: 40.7 }, { id: 'london', name: 'London', lon: -0.1, lat: 51.5 }, { id: 'sydney', name: 'Sydney', lon: 151, lat: -33.9 }, { id: 'toronto', name: 'Toronto', lon: -79.4, lat: 43.7 }];
    const pin = c => { const [x, y] = xy(c.lon, c.lat), a = ANCHOR[c.id] || 'start', lx = a === 'below' ? x + 8 : x + (a === 'end' ? -12 : 12), ly = a === 'below' ? y + 28 : y + 6;
      return `<g class="map-city" data-action="openCity" data-id="${esc(c.id)}"><circle cx="${x}" cy="${y}" r="26" fill="transparent"/><circle class="map-pulse" cx="${x}" cy="${y}" r="7" fill="none" stroke="#fff" stroke-width="2"/><circle cx="${x}" cy="${y}" r="7" fill="#ff6b81" stroke="#fff" stroke-width="2"/><text x="${lx}" y="${ly}" class="map-pin-label desk-only" text-anchor="${a === 'below' ? 'end' : a}">${esc(c.name)}</text></g>`; };
    const home = cityById('taipei');
    const arc = tx < lx ? `M${tx},${ty} Q${(tx + lx) / 2},${Math.min(ty, ly) - 140} ${lx},${ly}` : `M${tx},${ty} Q${tx + 300},${ty - 160} ${cols * step},${ly - 60}`;
    const done = state.progress.cities || {};
    // reduced motion: CSS cannot stop SMIL, so the plane is drawn still at the middle of its route and the star does not pulse
    const RM = reduceMotion();
    const mid = (() => { const m = /^M([\d.-]+),([\d.-]+) Q([\d.-]+),([\d.-]+) ([\d.-]+),([\d.-]+)$/.exec(arc); if (!m) return { x: tx, y: ty, a: 0 }; const [x0, y0, cx, cy, x2, y2] = m.slice(1).map(Number);
      return { x: .25 * x0 + .5 * cx + .25 * x2, y: .25 * y0 + .5 * cy + .25 * y2, a: Math.atan2(y2 - y0, x2 - x0) * 180 / Math.PI }; })();
    return `<div class="map-card"><span class="map-count"><span aria-hidden="true">📅</span> ${state.settings.examDate.replace(/-/g, '/')} · ${dl > 0 ? tf('daysLeftShort', { n: dl }) : dl === 0 ? t('today') : t('examChipPassed')}</span>
      <h3>🌍 ${t('mapTitle')}</h3><p>${t('mapSub')}</p>
      <svg viewBox="0 0 ${cols * step} ${rows * step}" data-full="0 0 ${cols * step} ${rows * step}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${dots}
        <path d="${arc}" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 10" opacity=".85"/>
        <path d="M0,${ly - 60} Q${lx / 2},${ly - 160} ${lx},${ly}" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 10" opacity=".85"/>
        <g${RM ? ` transform="translate(${mid.x.toFixed(1)},${mid.y.toFixed(1)}) rotate(${mid.a.toFixed(1)})"` : ''}><g transform="scale(1.5)"><path d="M14 0 4 -2.4 -2 -12 -6 -12 -2.6 -2.4 -10 -2.4 -13 -6.5 -15.5 -6.5 -13.5 0 -15.5 6.5 -13 6.5 -10 2.4 -2.6 2.4 -6 12 -2 12 4 2.4Z" fill="#ffffff" stroke="#1f3b73" stroke-width="1.2" stroke-linejoin="round"/></g>${RM ? '' : `<animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="${arc}"/>`}</g>
        ${(CITIES.length ? CITIES : MAP_LABELS).filter(c => c.id !== 'taipei').map(c => CITIES.length ? pin(c) : `<circle cx="${xy(c.lon, c.lat)[0]}" cy="${xy(c.lon, c.lat)[1]}" r="7" fill="#ff6b81" stroke="#fff" stroke-width="2"/><text x="${xy(c.lon, c.lat)[0] + (ANCHOR[c.id] ? -12 : 12)}" y="${xy(c.lon, c.lat)[1] + 6}" class="map-pin-label desk-only" text-anchor="${ANCHOR[c.id] || 'start'}">${esc(c.name)}</text>`).join('')}
        <g transform="translate(${tx},${ty})"${home ? ' class="map-city" data-action="openCity" data-id="taipei"' : ''}><circle r="30" fill="transparent"/><g><polygon points="0,-16 5,-5 16,-4 8,4 10,15 0,9 -10,15 -8,4 -16,-4 -5,-5" fill="#ff6b81" stroke="#fff" stroke-width="2"/>${RM ? '' : '<animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="1.6s" repeatCount="indefinite"/>'}</g>
        <text x="20" y="6" class="map-pin-label desk-only">Taiwan · ${esc(t('youAreHere'))}</text><text x="60" y="-110" class="map-pin-label mobile-only" text-anchor="end">Taiwan · ${esc(t('youAreHere'))}</text></g>
      </svg>
      ${CITIES.length ? `<div class="city-hint">👆 ${t('cityHint')}</div><div class="city-chips">${CITIES.map(c => `<button class="city-chip${done[c.id] ? ' done' : ''}" data-action="openCity" data-id="${esc(c.id)}">${done[c.id] ? '✓' : '📍'} ${esc(cityName(c))}</button>`).join('')}</div>` : ''}</div>`;
  }
  /* ---------------- City cards (tap a city on the world map) ---------------- */
  const SCENE_ICON = { airport: '✈️', transport: '🚆', food: '🍜', directions: '🧭', shopping: '🛍️', hotel: '🏨', signs: '🪧', sightseeing: '📸', emergency: '🆘' };
  const cityTime = (tz, d = new Date()) => new Date(d.toLocaleString('en-US', { timeZone: tz }));
  function cityClock(c) {
    let time = '', diff = 0;
    try {
      const now = new Date();
      time = new Intl.DateTimeFormat(ui.lang === 'zh' ? 'zh-TW' : 'en-GB', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false }).format(now);
      diff = Math.round((cityTime(c.tz, now) - cityTime('Asia/Taipei', now)) / 1800000) / 2;
    } catch (e) { return ''; }
    const rel = diff === 0 ? t('citySameTime') : tf(diff > 0 ? 'cityAhead' : 'cityBehind', { n: Math.abs(diff) });
    return `🕒 ${esc(time)} · ${rel}`;
  }
  // fly the map into the city (or back out); skipped when the user prefers less motion
  function zoomMap(c, zoomIn, done) {
    const svg = $('.map-card svg'), full = svg && (svg.dataset.full || '').split(' ').map(Number);
    if (!svg || full.length !== 4 || matchMedia('(prefers-reduced-motion: reduce)').matches) { if (svg && full.length === 4) svg.setAttribute('viewBox', full.join(' ')); done && done(); return; }
    const W = window.WORLD_DOTS, x = ((c.lon + 180) / W.step) * 10, y = ((W.lat0 - c.lat) / W.step) * 10 + 5;
    const w = full[2] / 5, h = full[3] / 5, box = [Math.min(Math.max(x - w / 2, 0), full[2] - w), Math.min(Math.max(y - h / 2, 0), full[3] - h), w, h];
    const from = zoomIn ? full : box, to = zoomIn ? box : full, t0 = performance.now(), dur = zoomIn ? 750 : 500;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      svg.setAttribute('viewBox', k < 1 ? from.map((v, i) => (v + (to[i] - v) * e).toFixed(1)).join(' ') : to.join(' '));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    };
    requestAnimationFrame(step);
  }
  let cityTimer = null, cityOpener = null;
  const cityModal = $('#cityModal');
  function openCity(id, opener) {
    const c = cityById(id); if (!c || view.city) return;
    cityOpener = opener || null; view.city = id; view.cityQuiz = {}; view.cityZh = false;
    const p = state.progress; p.cities = p.cities || {};
    const rec = p.cities[id] || (p.cities[id] = { visited: null, best: 0 });
    rec.visited = todayStr(); save();
    if (news.status === 'idle') loadNews().then(() => { if (view.city === id) renderCity(); }, () => {});
    zoomMap(c, true, () => {
      if (view.city !== id) return;
      renderCity(); cityModal.classList.remove('hidden'); document.body.classList.add('city-open');
      const box = $('#citySheet'); if (box) box.scrollTop = 0;
      requestAnimationFrame(() => { const btn = $('#cityClose'); if (btn && view.city === id) btn.focus({ preventScroll: true }); });
      clearInterval(cityTimer); cityTimer = setInterval(() => { const el = $('#cityClock'); if (el) el.innerHTML = cityClock(c); }, 20000);
    });
  }
  function closeCity(leaving) {
    const c = cityById(view.city); if (!c) return;
    view.city = null; speakStop(); clearInterval(cityTimer);
    cityModal.classList.add('hidden'); document.body.classList.remove('city-open');
    if (leaving) return;
    render(); // the map shows the new ✓ on the chip
    zoomMap(c, false);
    const back = cityOpener && document.querySelector(`[data-action="openCity"][data-id="${c.id}"]`); if (back) back.focus();
  }
  function cityHTML(c) {
    const zh = view.cityZh, q = view.cityQuiz || {}, answered = c.quiz.filter((_, i) => q[i] != null).length;
    const score = c.quiz.filter((x, i) => q[i] === x.answer).length;
    const sp = (text, cls = '') => `<button class="icon-btn speak-btn ${cls}" data-action="citySpeak" data-word="${esc(text)}" aria-label="${t('listen')}">🔊</button>`;
    const vocabBtn = w => { const v = vocabEntry(w.word), on = v && isBm('vocab', v.id);
      return `<button class="btn sm save-word ${on ? 'on' : ''}" data-action="citySaveWord" data-id="${v ? esc(v.id) : ''}" data-word="${esc(v ? v.word : w.word)}" data-pos="${esc(w.pos)}" data-zh="${esc(w.zh)}" data-ex="${esc(w.example)}" aria-pressed="${!!on}" title="${t(on ? 'removeBookmark' : 'addBookmark')}">${on ? '★' : '☆'}</button>`; };
    const keys = (c.keywords || []).map(k => k.toLowerCase());
    const nots = (c.not || []).map(k => k.toLowerCase()); // phrases with a keyword in them that are about something else (The New York Times, Romeo …)
    const hit = text => { let s = (text || '').toLowerCase(); nots.forEach(n => { s = s.split(n).join(' '); }); return keys.some(k => s.includes(k)); };
    const reads = (c.related || []).map(articleById).filter(Boolean);
    // today's news about this place that has a full article with translation
    const lessonLinks = new Set(newsLessons().map(l => l.link));
    const todays = ((news.data && news.data.items) || []).filter(it => lessonLinks.has(it.link) && (hit(it.title) || hit(it.summary))).slice(0, 3);
    const signLines = String(c.sign.en).split('\n');
    return `<button class="city-close" id="cityClose" data-action="closeCity" aria-label="${t('close')}">✕</button>
      <div class="city-hero"><img src="img/city/${esc(c.id)}.svg" alt="${esc(c.landmark)}" width="800" height="340">
        <div class="city-head"><h2 id="cityTitle">${esc(c.name_zh)} <span class="en">${esc(c.name)}</span></h2><div class="city-sub">${esc(c.country_zh)} · ${esc(ui.lang === 'zh' ? c.landmark_zh : c.landmark)}</div><div class="city-clock" id="cityClock">${cityClock(c)}</div></div></div>
      <div class="city-body">
        <div class="row city-tools"><div class="seg"><button class="seg-btn ${zh ? '' : 'on'}" data-action="cityZh" data-v="0" aria-pressed="${!zh}">English</button><button class="seg-btn ${zh ? 'on' : ''}" data-action="cityZh" data-v="1" aria-pressed="${zh}">${t('withChinese')}</button></div></div>
        <p class="en city-intro">${esc(c.intro)} ${sp(c.intro)}</p>${zh ? `<p class="city-zh">${esc(c.intro_zh)}</p>` : ''}
        <h3>🗣️ ${t('cityPhrases')}</h3>
        <div class="city-phrases">${c.phrases.map(ph => `<div class="city-phrase"><span class="scene" title="${esc(ph.scene)}">${SCENE_ICON[ph.scene] || '💬'}</span><div class="grow"><div class="en">${esc(ph.en)}</div><div class="city-zh">${esc(ph.zh)}</div>${ph.tip ? `<div class="small muted">💡 ${esc(ph.tip)}</div>` : ''}</div>${sp(ph.en)}</div>`).join('')}</div>
        <h3>💬 ${esc(c.dialogue.title)} <span class="small muted">${esc(c.dialogue.title_zh)}</span> <button class="btn sm" data-action="cityPlay">▶ ${t('playAll')}</button></h3>
        <div class="city-dialogue">${c.dialogue.lines.map((l, i) => `<div class="city-line ${l.who === 'You' ? 'me' : ''}" data-line="${i}"><b>${esc(l.who === 'You' ? t('cityYou') : l.who)}</b><div class="grow"><div class="en">${esc(l.en)}</div>${zh ? `<div class="city-zh">${esc(l.zh)}</div>` : ''}</div>${sp(l.en)}</div>`).join('')}</div>
        <h3>🪧 ${t('citySign')}</h3>
        <div class="city-signbox"><div class="city-sign sign-${esc(c.sign.style)}">${signLines.map((x, i) => `<div class="${i ? 'sub' : 'main'}">${esc(x)}</div>`).join('')}</div>
          <div class="grow"><div class="city-zh"><b>${esc(c.sign.zh)}</b></div><div class="small">${esc(c.sign.note)}</div>${sp(signLines.join('. '))}</div></div>
        <h3>🔤 ${t('cityWords')}</h3>
        <div class="city-words">${c.words.map(w => `<div class="city-word"><div class="row"><b class="en">${esc(w.word)}</b><span class="small muted">${esc(w.pos)}</span>${sp(w.word)}<span class="spacer"></span>${vocabBtn(w)}</div><div>${esc(w.zh)}${w.us ? ` <span class="chip info">${t('cityUS')} ${esc(w.us)}</span>` : ''}</div><div class="small en muted">${esc(w.example)}</div></div>`).join('')}</div>
        <div class="city-note"><b>💡 ${t('cityNote')}</b><p class="en">${esc(c.english_note.en)}</p><p class="city-zh">${esc(c.english_note.zh)}</p></div>
        <h3>📝 ${t('cityQuiz')} ${answered === c.quiz.length ? `<span class="chip ${score === c.quiz.length ? 'ok' : score ? 'warn' : 'bad'}">${score} / ${c.quiz.length}</span>` : ''}</h3>
        ${c.quiz.map((x, i) => `<div class="city-q"><div class="en"><b>${i + 1}.</b> ${esc(x.q)}</div><div class="city-opts">${x.options.map((o, oi) => { const picked = q[i] === oi, done = q[i] != null;
          return `<button class="city-opt en ${done && oi === x.answer ? 'right' : ''} ${picked && oi !== x.answer ? 'wrong' : ''}" data-action="cityAnswer" data-q="${i}" data-o="${oi}" ${done ? 'disabled' : ''}>(${'ABCD'[oi]}) ${esc(o)}</button>`; }).join('')}</div>${q[i] != null ? `<div class="small city-explain">${esc(x.explain)}</div>` : ''}</div>`).join('')}
        ${reads.length || todays.length ? `<h3>📖 ${t('cityMore')}</h3><div class="list">${reads.map(a => `<button class="list-item city-link" data-action="cityRead" data-id="${esc(a.id)}"><span>📖</span><div class="grow"><div class="title en">${esc(a.title)}</div>${a.title_zh ? `<div class="meta">${esc(a.title_zh)}</div>` : ''}</div></button>`).join('')}${todays.map(it => `<button class="list-item city-link" data-action="cityNews" data-link="${esc(it.link)}"><span>📰</span><div class="grow"><div class="title en">${esc(it.title)}</div><div class="meta">${esc(it.source || '')} · ${t('todayNews')}</div></div></button>`).join('')}</div>` : ''}
        <button type="button" class="btn ghost city-back" data-action="closeCity">🗺️ ${t('backToMap')}</button>
      </div>`;
  }
  function renderCity() {
    const c = cityById(view.city), box = $('#citySheet'); if (!c || !box) return;
    // redraw in place: keep the scroll position and the keyboard focus on the same control
    const a = document.activeElement, key = a && box.contains(a) && a.dataset ? ['action', 'q', 'o', 'v', 'word'].map(k => a.dataset[k] || '').join('|') : null;
    const top = box.scrollTop; box.innerHTML = cityHTML(c); box.scrollTop = top;
    if (key !== null) { const same = $$('#citySheet [data-action]').find(el => ['action', 'q', 'o', 'v', 'word'].map(k => el.dataset[k] || '').join('|') === key); (same && !same.disabled ? same : box).focus({ preventScroll: true }); }
  }
  // speak a list of lines one after another in the city's accent
  function speakLines(lines, lang) { say(lines, lang, true); }
  cityModal.addEventListener('click', e => {
    if (e.target === cityModal) { closeCity(); return; }
    const el = e.target.closest('[data-action]'); if (!el || !cityModal.contains(el)) return;
    const fn = actions[el.dataset.action]; if (fn) { e.preventDefault(); fn(el); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && view.city) { e.stopPropagation(); closeCity(); } });
  cityModal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return; // keep focus inside the card
    const f = $$('#citySheet button:not([disabled])'); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

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
    clozeSets().forEach(c => c.blanks.forEach((b, k) => u.push({ id: `${c.id}-${k + 1}`, type: 'cloze', level: c.level, set: c.id, title: c.title, q: clozeLine(c, k + 1), options: b.options, answer: b.answer, explain: b.explain })));
    return u;
  }
  // the sentence around a cloze blank, with that blank as ______ and the other blanks filled in with their answers
  function clozeLine(c, n) {
    const text = c.passage.replace(/__(\d)__/g, (m, k) => +k === n ? '______' : c.blanks[k - 1] ? c.blanks[k - 1].options[c.blanks[k - 1].answer] : m);
    const sents = text.replace(/\s*\n\s*/g, ' ').split(/(?<=[.!?]["']?)\s+/), j = sents.findIndex(x => x.includes('______'));
    return j < 0 ? `${c.title} (${n})` : sents[j];
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
  // One answer option as a real button. Once the answer is shown, ✓ marks the right option and ✗ the wrong pick,
  // so right and wrong never depend on colour alone.
  // o.en === false: the option text is not marked as English (reading questions keep their current typeface)
  function optionHTML(o) {
    const { i, chosen, answer, reveal } = o;
    let cls = 'option', mark = '';
    if (reveal) {
      if (i === answer) { cls += ' correct'; mark = `<span class="opt-mark" aria-hidden="true">✓</span><span class="sr-only">${t('srCorrect')}</span>`; }
      else if (i === chosen) { cls += ' wrong'; mark = `<span class="opt-mark" aria-hidden="true">✗</span><span class="sr-only">${t('srYours')}</span>`; }
    } else if (i === chosen) cls += ' selected';
    const data = Object.entries(o.data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
    return `<button type="button" class="${cls}" data-action="${o.action}"${data} aria-pressed="${i === chosen}"${reveal ? ' aria-disabled="true"' : ''}><span class="letter">${L4[i]}</span><span${o.en === false ? '' : ' class="en"'}>${esc(o.text)}</span>${mark}</button>`;
  }
  // the explanation starts with the verdict and, when wrong, the right letter
  const explainHTML = (chosen, answer, options, explain) => `<div class="explain"><span class="explain-head">${chosen === answer ? t('explainRight') : esc(tf('explainWrong', { L: L4[answer], w: options[answer] }))}</span>${explain ? esc(explain) : ''}</div>`;
  // feedback with the reviewed notes of practice-notes.js (window.PRACTICE_NOTES: { M101: { p: 考點, c: kind, ch: chapter, w: why, x: { B: why (B) is wrong … } } }):
  // the verdict and the right answer, 考點 (with its grammar chapter), why, then one line per other option (the student's pick first).
  // An item without a note shows its full explanation as before.
  const NOTES = window.PRACTICE_NOTES || {};
  function fbHTML(id, chosen, answer, options, explain, fallbackCh) {
    const n = NOTES[id], head = `<span class="explain-head">${chosen === answer ? t('explainRight') : esc(tf('explainWrong', { L: L4[answer], w: options[answer] }))}</span>`;
    const ch = n ? n.ch : fallbackCh, link = ch && grById.has(ch) ? ` <a class="fb-ch" href="#/grammar/${ch}">${esc(tf('fbChapter', { t: grById.get(ch).title }))}</a>` : '';
    if (!n) return `<div class="explain">${head}${explain ? esc(explain) : ''}${link ? `<p class="fb-point">${link}</p>` : ''}</div>`;
    const others = Object.entries(n.x || {}).map(([L, r]) => [L4.indexOf(L), r]).filter(([i]) => i >= 0 && i !== answer && i < options.length).sort((a, b) => (b[0] === chosen) - (a[0] === chosen) || a[0] - b[0]);
    return `<div class="explain fb">${head}
      <p class="fb-point"><b>${t('fbPoint')}</b> ${esc(n.p)}${link}</p>
      <p class="fb-why"><b>${t('fbWhy')}</b> ${esc(n.w)}</p>
      ${others.length ? `<p class="fb-oh"><b>${t('fbOthers')}</b></p><ul class="fb-opts">${others.map(([i, r]) => `<li${i === chosen ? ' class="mine"' : ''}><span class="en">(${L4[i]}) ${esc(options[i])}</span>${i === chosen ? `<span class="fb-mine">${t('fbYourPick')}</span>` : ''}<span class="fb-r">${esc(r)}</span></li>`).join('')}</ul>` : ''}</div>`;
  }
  /* ---- 選擇題 / 翻譯: one tidy setup card — a line of stats, one labelled row per choice, then the hint and 開始 ---- */
  const PX_LEVELS = () => [['', t('newsAll')], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']];
  const pxStats = list => `<div class="px-stats">${list.map(([k, v, s]) => `<span class="px-stat"><span class="k">${k}</span> <span class="v"><b>${v}</b>${s ? ` <small>${s}</small>` : ''}</span></span>`).join('')}</div>`;
  // forId: the row holds a form control (a <label for>); otherwise the label names a group of chips
  const pxRow = (id, label, body, forId) => `<div class="px-row">${forId ? `<label class="px-lbl" id="${id}" for="${forId}">${label}</label>` : `<span class="px-lbl" id="${id}">${label}</span>`}<div class="px-ctl">${body}</div></div>`;
  // cols: how many chips share a row on phones (an even grid there; they simply wrap on wider screens)
  const pxChips = (lbl, action, cur, opts, cols = opts.length) => `<div class="px-chips" style="--cols:${cols}" role="group" aria-labelledby="${lbl}">${opts.map(([v, l, n]) => `<button type="button" class="px-chip ${cur === v ? 'on' : ''}" data-action="${action}" data-v="${v}" aria-pressed="${cur === v}">${l}${n != null ? ` <span class="px-n">${n}</span>` : ''}</button>`).join('')}</div>`;
  function pageMcq() {
    if (!mcItems().length && !clozeSets().length) return `${subtabs('mcq')}${pageHead('mcq', t('mcTitle'))}<div class="card"><p class="muted" style="margin:0">${t('mcNoItems')}</p></div>`;
    if (view.mc) return view.mc.done ? mcResults() : (view.mc.kind === 'cloze' ? mcClozeStage() : mcStage());
    const f = mcfOf();
    f.status = ''; if (f.mode !== 'test') f.mode = 'practice'; // 題型 · 程度 · 題數 · 模式: 練習 explains each answer, 測驗 is timed and explains everything at the end
    const S = mcStats(state.progress);
    const count = f.type === 'cloze' ? mcClozeFiltered().length : mcFiltered().length;
    // 選擇題 and 克漏字 are two categories of 練習: each shows its own numbers
    const cloze = f.type === 'cloze', kinds = MC_TYPES.filter(([k]) => cloze ? k === 'cloze' : k !== 'cloze').map(([k]) => S.byType[k]);
    const sum = key => kinds.reduce((a, b) => a + b[key], 0), done = sum('done'), right = sum('right');
    const wrongN = S.wrong.filter(u => (u.type === 'cloze') === cloze).length, pct = done ? Math.round(right / done * 100) + '%' : '—';
    return `${subtabs('mcq')}${cloze ? `<header class="page-head"><h1 tabindex="-1">${t('tabCloze')}</h1><p>${tf('clozeSub', { c: clozeSets().length })}</p></header>` : pageHead('mcq', tf('mcSubItems', { n: mcItems().length }))}
      <div class="card px-card">
        ${pxStats([[t('mcAnswered'), done, `/ ${sum('total')}`], [t('accShort'), pct, done ? `${right} / ${done}` : ''], [t('trToReview'), wrongN]])}
        <div class="px-rows">
          ${cloze ? '' : pxRow('pxType', t('pxType'), pxChips('pxType', 'mcType', f.type, [['', '🎯 ' + t('mcMixed'), mcItems().length]].concat(MC_TYPES.filter(([k]) => k !== 'cloze').map(([k, l, ic]) => [k, `${ic} ${t(l)}`, S.byType[k].total + (S.byType[k].done ? ` · ${Math.round(S.byType[k].right / S.byType[k].done * 100)}%` : '')])), 2))}
          ${pxRow('pxLevel', t('pxLevel'), pxChips('pxLevel', 'mcLevel', f.level, PX_LEVELS()))}
          ${pxRow('pxCount', t(cloze ? 'pxCountP' : 'pxCount'), pxChips('pxCount', 'mcCount', f.count, (cloze ? [1, 2, 4] : [10, 20, 30]).map(n => [n, tf(cloze ? 'mcNPassages' : 'mcNQ', { n })])))}
          ${pxRow('pxMode', t('pxMode'), pxChips('pxMode', 'mcMode', f.mode, [['practice', t('modeLearn')], ['test', t('modeTest')]]))}
        </div>
        <div class="px-go"><p class="small muted">${t(f.mode === 'test' ? 'mcTestHint' : 'mcPracticeHint')} · ${tf('mcAvailable', { n: count })}</p>
          <button class="btn accent block-cta" data-action="mcStart" ${count ? '' : 'disabled'}>▶ ${t('mcStart')}</button></div>
      </div>
      ${(state.progress.mcqTests || []).some(r => (r.type === 'cloze') === cloze) ? `<div class="card"><h3 style="margin-top:0">${t('mcRecent')}</h3><div class="list">${state.progress.mcqTests.filter(r => (r.type === 'cloze') === cloze).slice(-8).reverse().map(r => `<div class="list-item"><span class="small muted">${fmtDate(r.date)}</span><span>${esc(r.type ? t((MC_TYPES.find(x => x[0] === r.type) || [0, 'mcMixed'])[1]) : t('mcMixed'))} · ${t(r.mode === 'test' ? 'mcTest' : 'mcPractice')}</span><span class="spacer"></span><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span>${r.secs != null ? `<span class="small muted">${fmtDur(r.secs)}</span>` : ''}</div>`).join('')}</div></div>` : ''}`;
  }
  const mcfOf = () => view.mcf || (view.mcf = { type: '', level: myLevel(), status: '', mode: 'practice', count: 10 });
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
  function mcTimer(s) { return s.mode === 'test' ? `<span class="st-chip" id="mcTimer">⏱️ ${fmtDur(Math.round((Date.now() - s.start) / 1000))}</span>` : ''; }
  function mcStage() {
    const s = view.mc, it = mcItems().find(x => x.id === s.ids[s.i]);
    const chosen = s.answers[it.id], revealed = s.mode === 'practice' && chosen != null;
    const right = s.ids.filter(id => { const x = mcItems().find(y => y.id === id); return x && s.answers[id] === x.answer; }).length;
    return `${subtabs('mcq')}${sessionTop('mcExit', t('sessionMc'), tf('trProgress', { i: s.i + 1, n: s.ids.length }), s.i + (chosen != null ? 1 : 0), s.ids.length, s.mode === 'test' ? mcTimer(s) : `<span class="st-chip" aria-label="${t('correct')} ${right}">✓ ${right}</span>`)}
      <div class="card mc-card">
        <div class="news-meta"><span class="chip">${(MC_TYPES.find(x => x[0] === it.type) || [])[2] || ''} ${esc(t((MC_TYPES.find(x => x[0] === it.type) || [0, 'mcMixed'])[1]))}</span><span class="chip">${esc(it.level || '')}</span><span class="small muted">${esc(it.id)}</span></div>
        <div class="mc-q en">${mcQ(it.q)}</div>
        <div class="mc-opts">${it.options.map((o, oi) => optionHTML({ action: 'mcChoose', data: { o: oi }, i: oi, text: o, chosen, answer: it.answer, reveal: revealed })).join('')}</div>
        ${revealed ? fbHTML(it.id, chosen, it.answer, it.options, it.explain, it.type === 'grammar' ? gramChapter(it.topic) : '') : ''}
      </div>
      <div class="action-bar">${s.i > 0 && s.mode === 'test' ? `<button class="btn ghost" data-action="mcPrev">‹ ${t('pgPrev')}</button>` : ''}
        <button class="btn accent" data-action="mcNext" ${chosen == null ? 'disabled' : ''}>${s.i < s.ids.length - 1 ? t('next') + ' ›' : t(s.mode === 'test' ? 'mcSubmit' : 'mcFinish')}</button></div>`;
  }
  function mcClozeStage() {
    const s = view.mc, c = clozeSets().find(x => x.id === s.ids[s.i]);
    const checked = s.checked && s.checked[c.id];
    const filled = c.blanks.filter((b, k) => s.answers[`${c.id}-${k + 1}`] != null).length;
    // each blank is a button that jumps to its question; after checking it carries ✓ or ✗
    const passage = esc(c.passage).replace(/__(\d)__/g, (m, n) => { const a = s.answers[`${c.id}-${n}`]; const b = c.blanks[n - 1];
      const txt = a != null ? esc(b.options[a]) : ''; const cls = checked ? (a === b.answer ? 'ok' : 'bad') : (a != null ? 'filled' : '');
      return `<button type="button" class="cz-blank ${cls}" data-action="czJump" data-n="${n}"><b>${n}</b>${txt ? ' ' + txt : ''}</button>`; }).replace(/\n\s*\n/g, '<br><br>');
    return `${subtabs('mcq')}${sessionTop('mcExit', t('sessionCloze'), tf('mcPassageN', { i: s.i + 1, n: s.ids.length }), s.i + (checked ? 1 : 0), s.ids.length, s.mode === 'test' ? mcTimer(s) : `<span class="st-chip">${filled}/${c.blanks.length}</span>`)}
      <div class="card mc-card">
        <div class="news-meta"><span class="chip">🧩 ${t('mcCloze')}</span><span class="chip">${esc(c.level || '')}</span><span class="small muted">${esc(c.id)}</span></div>
        <h3 class="en" style="margin:2px 0">${esc(c.title)}</h3>
        <div class="passage cz-passage${ui.font === 'clean' ? ' clean' : ''}">${passage}</div>
        ${c.blanks.map((b, k) => { const id = `${c.id}-${k + 1}`, a = s.answers[id]; return `<div class="question" id="czq-${k + 1}"><div class="q">${k + 1}. <button type="button" class="cz-back" data-action="czBack" data-n="${k + 1}">${tf('backToBlank', { n: k + 1 })}</button></div>
          <div class="mc-opts row-opts">${b.options.map((o, oi) => optionHTML({ action: 'czChoose', data: { id, o: oi }, i: oi, text: o, chosen: a, answer: b.answer, reveal: !!checked })).join('')}</div>
          ${checked ? fbHTML(id, a, b.answer, b.options, b.explain) : ''}</div>`; }).join('')}
        ${checked && c.passage_zh ? `<details class="cz-zh"><summary>${t('mcShowZh')}</summary><p>${esc(c.passage_zh).replace(/\n\s*\n/g, '<br><br>')}</p></details>` : ''}
      </div>
      <div class="action-bar">${!checked && s.mode === 'practice' ? `<button class="btn accent" data-action="czCheck">${t('mcCheck')} (${filled}/${c.blanks.length})</button>` : `<button class="btn accent" data-action="czNext">${s.i < s.ids.length - 1 ? t('mcNextPassage') + ' ›' : t(s.mode === 'test' ? 'mcSubmit' : 'mcFinish')}</button>`}</div>`;
  }
  // what a session is scored on: each item, or each blank of its cloze passages; a session ended early (✕) counts only what was answered
  function mcSessionUnits(s) {
    const all = s.kind === 'cloze'
      ? s.ids.flatMap(cid => { const c = clozeSets().find(x => x.id === cid); return c.blanks.map((b, k) => ({ id: `${cid}-${k + 1}`, type: 'cloze', q: clozeLine(c, k + 1), options: b.options, answer: b.answer, explain: b.explain })); })
      : s.ids.map(id => mcItems().find(x => x.id === id));
    return s.early ? all.filter(u => s.answers[u.id] != null) : all;
  }
  function mcResults() {
    const s = view.mc;
    const units = mcSessionUnits(s);
    const right = units.filter(u => s.answers[u.id] === u.answer).length;
    const wrongs = units.filter(u => s.answers[u.id] !== u.answer), rights = units.filter(u => s.answers[u.id] === u.answer);
    const review = u => `<div class="card mc-review"><div class="mc-q en">${mcQ(u.q)}</div>
        <div class="small">${t('studentChose')}：<span class="chip ${s.answers[u.id] === u.answer ? 'ok' : 'bad'} en">${s.answers[u.id] != null ? L4[s.answers[u.id]] + '. ' + esc(u.options[s.answers[u.id]]) : '—'}</span>${s.answers[u.id] === u.answer ? '' : ` → ${t('correctIs')}：<span class="chip ok en">${L4[u.answer]}. ${esc(u.options[u.answer])}</span>`}</div>
        ${fbHTML(u.id, s.answers[u.id], u.answer, u.options, u.explain || '', u.type === 'grammar' ? gramChapter(u.topic) : '')}</div>`;
    return `${subtabs('mcq')}<div class="card center mc-card"><div class="big-icon" aria-hidden="true">${right / units.length >= .8 ? '🎉' : '💪'}</div><h2>${t('mcResult')}</h2><p class="big">${right} / ${units.length}</p>
        ${s.secs != null ? `<p class="muted">⏱️ ${fmtDur(s.secs)}</p>` : ''}
        <div class="row" style="justify-content:center">${s.redo ? `<a class="btn accent" href="#/wrong" data-action="mcLeave">${t('wbBack')}</a>` : `<button class="btn accent" data-action="mcStart">${t('trAgain')}</button>`}${wrongs.length ? `<button class="btn" data-action="mcRedo">${t('trRedoWrong')}</button>` : ''}<button class="btn ghost" data-action="mcExit">${t('back')}</button></div></div>
      ${wrongs.length ? `<h3 class="section-title">❌ ${t('mcWrongReview')}</h3>${wrongs.map(review).join('')}<p class="small muted">${t('wbSavedNote')} <a href="#/wrong">${t('tabWrong')}</a></p>` : ''}
      ${s.mode === 'test' && rights.length ? `<details class="mc-all"><summary>${tf('mcRightReview', { n: rights.length })}</summary>${rights.map(review).join('')}</details>` : ''}`;
  }
  function mcFinish() {
    const s = view.mc, units = mcSessionUnits(s);
    s.secs = Math.round((Date.now() - s.start) / 1000);
    // in a mock test, answers are recorded at the end; a practice cloze passage ended before 對答案 is recorded now
    // (either way only blanks that were answered: an early end never stores empty blanks as wrong)
    if (s.mode === 'test') units.forEach(u => mcRecord(u.id, s.answers[u.id], u.answer));
    else if (s.kind === 'cloze') units.forEach(u => { if (!s.checked[u.id.replace(/-\d+$/, '')] && s.answers[u.id] != null) mcRecord(u.id, s.answers[u.id], u.answer); });
    const p = state.progress; p.mcqTests = (p.mcqTests || []).concat([{ date: new Date().toISOString(), type: s.type, mode: s.mode, score: units.filter(u => s.answers[u.id] === u.answer).length, total: units.length, secs: s.secs }]).slice(-50);
    s.done = true; bumpDay(); save(); render(); jumpTo(0);
  }

  /* ---- 錯題本: every question whose last answer was wrong, straight from the records (nothing extra is stored) ----
     選擇題 and 克漏字 (progress.mcq), 翻譯 marked wrong (progress.translate), 文法 (progress.gq), 閱讀 (the latest try of each passage).
     A question answered right again leaves the list. */
  const WB_SRC = [['mcq', 'tabMcq'], ['cloze', 'tabCloze'], ['tr', 'tabTranslate'], ['gram', 'grpGrammar'], ['read', 'grpRead']];
  // reading questions by what they ask (judged from the wording of the question)
  const READ_TYPES = [['main', /main(ly)? (idea|about|purpose|point)|best title|purpose of (the|this) (passage|article|text|notice|email|letter|message)|why (did|does) the (writer|author) (write|post)|what is the (passage|article|notice|email|letter|text) (mainly )?about/i],
    ['word', /closest in meaning|meaning of the (word|phrase)|the (word|phrase) "|underlined|"[^"]+" (means|is|are|refers)|this means that/i], ['ref', /refers? to/i],
    ['infer', /infer|impl(y|ied)|suggests?|most likely|probably|can be concluded|would (the writer|the author)|agree with/i], ['tone', /tone|attitude|feels? about|opinion/i],
    ['not', /\bNOT\b|EXCEPT|\btrue\b|\bfalse\b/], ['detail', /./]];
  const readType = q => READ_TYPES.find(x => x[1].test(q))[0];
  const grQ = x => { const c = grById.get(x.id); return !c ? null : x.s != null ? ((c.sections[x.s] || {}).practice || [])[x.p] : c.quiz[x.i]; };
  const grQid = x => x.s != null ? `${x.id}:s${x.s}.${x.p}` : `${x.id}:q${x.i}`;
  const grRef = id => { const m = /^(g-[a-z-]+):(?:q(\d+)|s(\d+)\.(\d+))$/.exec(id); return !m ? null : m[2] != null ? { id: m[1], i: +m[2] } : { id: m[1], s: +m[3], p: +m[4] }; };
  // a grammar answer: one record per question; h = the question's text, so an edited question starts fresh
  function gqRecord(x, chosen) {
    const q = grQ(x); if (!q) return;
    const p = state.progress; p.gq = p.gq || {};
    const id = grQid(x), h = hash36(q.q), r0 = p.gq[id], r = r0 && r0.h === h ? r0 : { tries: 0, ok: 0 }, ok = chosen === q.answer;
    p.gq[id] = { tries: r.tries + 1, ok: r.ok + (ok ? 1 : 0), lastOk: ok, chosen, last: new Date().toISOString(), h };
    bumpDay(); save();
  }
  function wrongBook(P = state.progress) {
    const out = [], MC = new Map(mcItems().map(x => [x.id, x])), CZ = new Map(clozeSets().map(c => [c.id, c])), TR = new Map(trItems().map(x => [x.id, x]));
    const base = (id, r) => ({ id, tries: r.tries, wrong: Math.max(1, r.tries - r.ok), last: r.last || '' });
    Object.entries(P.mcq || {}).forEach(([id, r]) => {
      if (r.lastOk) return;
      const it = MC.get(id), m = /^(C\d+)-(\d+)$/.exec(id);
      if (it) { const n = NOTES[id]; out.push(Object.assign(base(id, r), { src: 'mcq', q: it.q, mine: r.chosen != null ? it.options[r.chosen] : '', right: it.options[it.answer], point: n ? n.p : t(MC_TYPES.find(x => x[0] === it.type)[1]), ch: n ? n.ch : it.type === 'grammar' ? gramChapter(it.topic) : '' })); return; }
      const c = m && CZ.get(m[1]), b = c && c.blanks[+m[2] - 1];
      if (b) { const n = NOTES[id]; out.push(Object.assign(base(id, r), { src: 'cloze', set: c.id, q: clozeLine(c, +m[2]), title: c.title, mine: r.chosen != null ? b.options[r.chosen] : '', right: b.options[b.answer], point: n ? n.p : t('tabCloze'), ch: n ? n.ch : '' })); }
    });
    Object.entries(P.translate || {}).forEach(([id, r]) => { const it = TR.get(id); if (!it || r.lastOk) return; const ch = gramChapter(it.point || '');
      out.push(Object.assign(base(id, r), { src: 'tr', q: it.zh, mine: r.answer || '', right: it.en, point: ch ? grById.get(ch).title : t('tabTranslate'), ch })); });
    Object.entries(P.gq || {}).forEach(([id, r]) => { const x = grRef(id), q = x && grQ(x); if (!q || r.lastOk || (r.h && r.h !== hash36(q.q))) return;
      const c = grById.get(x.id); out.push(Object.assign(base(id, r), { src: 'gram', ref: x, q: q.q, mine: r.chosen != null ? q.options[r.chosen] : '', right: q.options[q.answer], point: c.title + (x.s != null ? ' · ' + grPlainH(c.sections[x.s].h) : ''), ch: c.id })); });
    // reading: the latest try of each passage; a question missed there, with how many tries missed it
    const byArt = {}; (P.readingQuizzes || []).forEach(r => { (byArt[r.articleId] = byArt[r.articleId] || []).push(r); });
    Object.entries(byArt).forEach(([aid, list]) => { const a = articleById(aid); if (!a) return; const last = list[list.length - 1];
      (last.answers || []).forEach(x => { if (x.chosen === x.correct) return; const q = (a.questions || [])[x.qi]; if (!q) return;
        out.push({ src: 'read', id: `${aid}#${x.qi}`, art: aid, title: a.title, q: q.q, mine: x.chosenText || '', right: x.correctText || q.options[q.answer], point: t('rt_' + readType(q.q)), ch: '', tries: list.length, wrong: list.filter(r => (r.answers || []).some(y => y.qi === x.qi && y.chosen !== y.correct)).length, last: last.date || '' }); }); });
    return out.sort((a, b) => String(b.last).localeCompare(String(a.last)));
  }
  const grPlainH = h => String(h || '').replace(/\*\*|\[\[|\]\]/g, '');
  function pageWrong() {
    const all = wrongBook(), f = view.wbf || (view.wbf = { src: '' });
    if (f.src && !all.some(x => x.src === f.src)) f.src = ''; // that source is all done: back to 全部
    const list = all.filter(x => !f.src || x.src === f.src);
    const count = k => all.filter(x => x.src === k).length;
    const chips = [['', t('newsAll'), all.length]].concat(WB_SRC.map(([k, l]) => [k, t(l), count(k)]).filter(x => x[2]));
    const redo = f.src && list.length ? `<button type="button" class="btn accent" data-action="wbRedo" data-src="${f.src}">${tf(f.src === 'read' ? 'wbRedoRead' : 'wbRedoN', { n: f.src === 'read' ? new Set(list.map(x => x.art)).size : f.src === 'cloze' ? new Set(list.map(x => x.set)).size : Math.min(list.length, 20) })}</button>` : '';
    const card = x => `<li class="wb-item"><div class="wb-top"><span class="chip">${t(WB_SRC.find(y => y[0] === x.src)[1])}</span><span class="wb-point">${esc(x.point)}</span><span class="small muted wb-n">${tf('wbTimes', { w: x.wrong, n: x.tries })}${x.last ? ' · ' + fmtDate(x.last) : ''}</span></div>
      ${x.title ? `<div class="small muted en">${esc(x.title)}</div>` : ''}
      <div class="wb-q${x.src === 'tr' ? '' : ' en'}">${x.src === 'tr' ? esc(x.q) : mcQ(x.q)}</div>
      <div class="small wb-ans">${x.mine ? `${t('wbMine')}：<span class="chip bad en">${esc(x.mine)}</span> ` : ''}${t('correctIs')}：<span class="chip ok en">${esc(x.right)}</span></div>
      <div class="wb-acts"><button type="button" class="btn sm" data-action="wbRedoOne" data-src="${x.src}" data-id="${esc(x.id)}">${t('wbRedo')}</button>${wbBack(x)}</div></li>`;
    return `${subtabs('wrong')}${pageHead('wrong', t('wbSub'))}
      ${all.length ? `<div class="card wb-bar"><div class="px-chips" role="group" aria-label="${esc(t('wbFilter'))}">${chips.map(([k, l, n]) => `<button type="button" class="px-chip ${f.src === k ? 'on' : ''}" data-action="wbSrc" data-v="${k}" aria-pressed="${f.src === k}">${l} <span class="px-n">${n}</span></button>`).join('')}</div>
        <div class="wb-go">${redo || `<p class="small muted">${t('wbPickToRedo')}</p>`}</div>${f.src === 'read' ? `<p class="small muted">${t('wbReadNote')}</p>` : ''}</div>
        <ol class="wb-list">${list.slice(0, view.wbMore ? 400 : 40).map(card).join('')}</ol>${list.length > 40 && !view.wbMore ? `<button type="button" class="btn ghost" data-action="wbMore">${tf('wbShowAll', { n: list.length })}</button>` : ''}`
      : `<div class="card"><p>${t('wbEmpty')}</p><p class="small muted">${t('wbEmptyHow')}</p></div>`}`;
  }
  // back to the material: the grammar chapter, the passage, the cloze passage (a new round), or the word in the word bank
  function wbBack(x) {
    if (x.ch && grById.has(x.ch)) return `<a class="btn sm ghost" href="#/grammar/${x.ch}">${esc(tf('fbChapter', { t: grById.get(x.ch).title }))}</a>`;
    if (x.src === 'read') return `<a class="btn sm ghost" href="#/reading/${encodeURIComponent(x.art)}">${t('wbBackRead')}</a>`;
    if (x.src === 'mcq') { const it = mcItems().find(y => y.id === x.id); if (it && it.type === 'vocab' && findWord(x.right)) return `<button type="button" class="btn sm ghost" data-action="wbWord" data-w="${esc(x.right)}">${t('wbBackWord')}</button>`; }
    return '';
  }
  // a redo round from the 錯題本 (a round already open is finished or ended first)
  function wbStart(src, items) {
    if (!items.length) return;
    const busy = src === 'tr' ? view.tr && view.tr.i < view.tr.ids.length : (src === 'mcq' || src === 'cloze') && view.mc && !view.mc.done;
    if (busy) { toast(t('wbBusy')); return actions.resume({ dataset: { page: src === 'tr' ? 'translate' : 'mcq', kind: view.mc ? view.mc.kind : '' } }); }
    if (src === 'mcq' || src === 'cloze') {
      mcKind(src === 'cloze' ? 'cloze' : 'items');
      const ids = src === 'cloze' ? [...new Set(items.map(x => x.set))].slice(0, 4) : items.slice(0, 20).map(x => x.id);
      view.mc = { kind: src === 'cloze' ? 'cloze' : 'items', type: src === 'cloze' ? 'cloze' : '', ids, i: 0, answers: {}, checked: {}, mode: 'practice', start: Date.now(), redo: true };
      view.page = 'mcq'; jumpTo(0); return render({ focusHeading: true });
    }
    if (src === 'tr') { view.tr = { ids: items.slice(0, 20).map(x => x.id), i: 0, right: 0, wrong: [] }; view.page = 'translate'; jumpTo(0); return render({ focusHeading: true }); }
    if (src === 'gram') { const g = view.gr; g.mix = { range: '', qs: items.slice(0, 20).map(x => x.ref), i: 0, chosen: null, right: 0, wrong: [], redo: true }; g.sub = 'quiz'; g.id = ''; view.page = 'grammar'; jumpTo(0); return render({ focusHeading: true }); }
    if (src === 'read') openArticleId(items[0].art);
  }

  /* ---- Translation practice (中譯英): window.TRANSLATION_ITEMS from translate.js ---- */
  const TR_GROUPS = ['trG1', 'trG2', 'trG3', 'trG4', 'trG5', 'trG6', 'trG7', 'trG8', 'trG9', 'trG10', 'trG11']; // 9: A2 starter (T201-T225), 10: C1 challenge (T226-T250), 11: C2 expert (T251-T275)
  const trItems = () => window.TRANSLATION_ITEMS || [];
  const trGroupOf = it => Math.min(TR_GROUPS.length, Math.max(1, Math.ceil((parseInt(String(it.id).replace(/\D/g, ''), 10) || 1) / 25)));
  const trRec = id => (state.progress.translate || {})[id];
  function trFiltered() {
    const f = view.trf || (view.trf = { group: 0, level: myLevel(), status: '' });
    return trItems().filter(it => (!f.group || trGroupOf(it) === f.group) && (!f.level || it.level === f.level)
      && (!f.status || (f.status === 'todo' ? !trRec(it.id) : (trRec(it.id) && !trRec(it.id).lastOk))));
  }
  function trKeyHits(it, answer) { return (it.keys || []).map(k => ({ k, hit: noteRe(k.en).test(answer || '') })); }
  const TR_PAGE = 20;
  // after changing page, bring the start of the list (not the top of the page) into view
  const trScrollTop = () => { const el = $('#trListTop'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: smooth() }); };
  function pageTranslate() {
    const items = trItems();
    if (!items.length) return `${subtabs('translate')}${pageHead('translate', t('trTitle'))}<div class="card"><p class="muted" style="margin:0">${t('trNoItems')}</p></div>`;
    if (view.tr) return view.tr.i >= view.tr.ids.length ? trSummary() : trStage();
    const f = view.trf || (view.trf = { group: 0, level: myLevel(), status: '' });
    f.status = ''; // the setup is just 主題 · 程度
    const S = trStats(state.progress), list = trFiltered();
    // 20 questions per page, with page numbers above and below the list
    const pages = Math.max(1, Math.ceil(list.length / TR_PAGE)), cur = f.page = Math.min(f.page || 0, pages - 1);
    const shown = list.slice(cur * TR_PAGE, cur * TR_PAGE + TR_PAGE);
    const pager = pagerHTML(cur, pages, 'trGo');
    const mark = it => { const r = trRec(it.id); return r ? (r.lastOk ? '<span class="tr-mark ok">✓</span>' : '<span class="tr-mark bad">✗</span>') : '<span class="tr-mark">·</span>'; };
    const groupSel = `<select class="input px-sel" id="trGroupSel">${[0].concat(TR_GROUPS.map((_, i) => i + 1)).map(g => `<option value="${g}" ${f.group === g ? 'selected' : ''}>${g ? t(TR_GROUPS[g - 1]) : t('pxAllTopics')}${ui.lang === 'en' ? ' (' : '（'}${g ? items.filter(it => trGroupOf(it) === g).length : items.length}${ui.lang === 'en' ? ')' : '）'}</option>`).join('')}</select>`;
    return `${subtabs('translate')}${pageHead('translate', tf('trSub', { n: items.length }))}
      <div class="card px-card">
        ${pxStats([[t('trPractised'), S.done, `/ ${items.length}`], [t('trRight'), S.right, S.done ? Math.round(S.right / S.done * 100) + '%' : ''], [t('trToReview'), S.wrong.length]])}
        <div class="px-rows">
          ${pxRow('pxTopic', t('pxTopic'), groupSel, 'trGroupSel')}
          ${pxRow('pxLevel', t('pxLevel'), pxChips('pxLevel', 'trLevel', f.level, PX_LEVELS()))}
        </div>
        <div class="px-go"><p class="small muted">${tf('mcAvailable', { n: list.length })}</p>
          <button class="btn accent block-cta" data-action="trStart" ${list.length ? '' : 'disabled'}>✍️ ${tf('trStartN', { n: Math.min(10, list.length) })}</button></div>
      </div>
      ${list.length ? `<p class="small muted tr-range" id="trListTop">${tf('trRange', { a: cur * TR_PAGE + 1, b: cur * TR_PAGE + shown.length, n: list.length })}</p>` : ''}${pager}
      <div class="tr-list">${shown.map(it => `<button class="tr-row" data-action="trOne" data-id="${esc(it.id)}">${mark(it)}<span class="tr-zh">${esc(it.zh)}</span><span class="chip">${esc(it.level || '')}</span></button>`).join('') || `<p class="muted">${t('trNoMatch')}</p>`}</div>${pager}`;
  }
  function trStage() {
    const s = view.tr, it = trItems().find(x => x.id === s.ids[s.i]);
    if (!it) { view.tr = null; return pageTranslate(); }
    if (s.i >= s.ids.length) return '';
    const hits = s.checked ? trKeyHits(it, s.answer) : [];
    return `${subtabs('translate')}${sessionTop('trExit', t('sessionTr'), tf('trProgress', { i: s.i + 1, n: s.ids.length }), s.i + (s.checked ? 1 : 0), s.ids.length, `<span class="st-chip">✓ ${s.right}</span>`)}<div class="card tr-card">
      <div class="news-meta"><span class="chip">${esc(t(TR_GROUPS[trGroupOf(it) - 1]))}</span><span class="chip">${esc(it.level || '')}</span><span class="small muted">${esc(it.id)}</span></div>
      <div class="tr-q" id="trQ">${esc(it.zh)}</div>
      ${s.checked ? '' : `<div class="tr-hint">${s.hint ? `💡 ${(it.keys || []).map(k => `<span class="chip"><span class="en">${esc(k.en)}</span> ${esc(k.zh)}</span>`).join(' ')}` : `<button class="btn sm ghost" data-action="trHint">💡 ${t('trShowHint')}</button>`}</div>`}
      <textarea id="trInput" class="tr-input en" rows="2" aria-labelledby="trQ" placeholder="${t('trPlaceholder')}" ${s.checked ? 'readonly' : ''} autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="done">${esc(s.answer || '')}</textarea>
      ${s.checked ? `<div class="tr-result">
          <div class="tr-keys"><p class="small muted tr-keys-note">${t('trKeysNote')}</p>${hits.map(h => `<span class="chip ${h.hit ? 'ok' : 'info'}">${h.hit ? t('trKeyFound') : t('trKeyNotFound')}：<span class="en">${esc(h.k.en)}</span> ${esc(h.k.zh)}</span>`).join(' ')}</div>
          <div class="tr-model"><b>${t('trModel')}</b><p class="en">${esc(it.en)} <button class="icon-btn" data-action="speak" data-word="${esc(it.en)}" aria-label="${t('speak')}">🔊</button></p>
            ${(it.alt || []).length ? `<b>${t('trAlso')}</b>${it.alt.map(a => `<p class="en">${esc(a)}</p>`).join('')}` : ''}</div>
          ${it.point ? `<div class="tr-point"><b>${t('fbPoint')}</b> ${esc(it.point)}${gramChapter(it.point) ? ` <a class="fb-ch" href="#/grammar/${gramChapter(it.point)}">${esc(tf('fbChapter', { t: grById.get(gramChapter(it.point)).title }))}</a>` : ''}</div>` : ''}
          <div class="tr-self"><b>${t('trSelfTitle')}</b><ul>${['trChk1', 'trChk2', 'trChk3', 'trChk4'].map(k => `<li>${t(k)}</li>`).join('')}</ul><p class="small muted">${t('trSelfCheck')}</p></div>
        </div>` : `<p class="small muted kbd-hint" style="margin:0">${t('trCtrlEnter')}</p>`}
    </div>
    <div class="action-bar">${s.checked ? `<button class="btn accent" data-action="trMark" data-ok="1">✅ ${t('trSelfRight')}</button><button class="btn" data-action="trMark" data-ok="0">❌ ${t('trSelfWrong')}</button>`
      : `<button class="btn accent" data-action="trCheck">${t('trCheck')}</button>`}</div>`;
  }
  function trSummary() {
    const s = view.tr;
    return `${subtabs('translate')}<div class="card center tr-card"><div class="big-icon">🎉</div><h2>${t('trDone')}</h2><p class="big">${s.right} / ${s.ids.length}</p>
      <div class="row" style="justify-content:center"><button class="btn accent" data-action="trStart">${t('trAgain')}</button>${s.right < s.ids.length ? `<button class="btn" data-action="trRedo">${t('trRedoWrong')}</button>` : ''}<button class="btn ghost" data-action="trExit">${t('back')}</button></div></div>
      ${s.wrong.length ? `<h3 class="section-title">${t('trMarkedWrong')}</h3><div class="list">${s.wrong.map(id => trItems().find(x => x.id === id)).filter(Boolean).map(it => `<div class="list-item"><div class="grow"><div>${esc(it.zh)}</div><div class="small en">${t('trModel')}：${esc(it.en)}</div>${it.point ? `<div class="small muted">${esc(it.point)}</div>` : ''}</div></div>`).join('')}</div><p class="small muted">${t('wbSavedNote')} <a href="#/wrong">${t('tabWrong')}</a></p>` : ''}`;
  }

  /* ---- Phrases tab: the 3,000+ built-in phrases by category (library.js keeps each category A1 → C2) ---- */
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
      <select class="input pager-sel" data-pager="${action}" aria-label="${t('pgJump')}">${Array.from({ length: pages }, (_, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${tf('pgPageN', { n: i + 1 })}${labelOf ? ' · ' + esc(labelOf(i)) : ''}</option>`).join('')}</select>
    </div>`;
  }
  const PHR_PAGE = 24;
  // a phrase in dictionary form → the regexes that find it in its example sentence: V, V-ing, adj, A and B are gaps like sth;
  // "too much/too many" and "there is/are" give one regex per choice; oneself is any -self word; a/an/the may be my, his …;
  // and a leading "be" may be a contraction ("I'm bad at"), so the phrase without it is tried too
  const SELF = 'myself yourself himself herself itself ourselves yourselves themselves'.split(' ');
  const DETS = 'a an the my your his her our their its'.split(' ');
  function phraseExRes(word) {
    const w = word.replace(/\([^)]*\)/g, ' ').replace(/…|\.\.\./g, ' ').replace(/(^|\s)(?:V|v|V-ing|v-ing|adj|A|B)(?=\s|$)/g, '$1sth').replace(/\s+/g, ' ').trim();
    const sides = w.split(/\/(?!(?:sb|sth)\b)/), notes = sides.length > 1 && sides.every(x => x.trim().includes(' ')) ? sides.map(x => x.trim()) : [w];
    const out = new Set();
    const walk = (toks, i, acc) => {
      if (out.size >= 40) return;
      if (i === toks.length) { out.add(acc.join(' ')); return; }
      const x = toks[i];
      const opts = x.includes('/') && !/^(sb|sth)\/(sb|sth)$/.test(x) ? x.split('/').filter(Boolean) : x === 'oneself' ? SELF : i > 0 && /^(a|an|the)$/.test(x) ? DETS : [x];
      opts.forEach(o => walk(toks, i + 1, acc.concat(o)));
    };
    notes.forEach(n => { const toks = n.split(' '); walk(toks, 0, []); if (toks[0] === 'be' && toks.length > 2) walk(toks.slice(1), 0, []); });
    // whole-phrase choices are matched word for word: noteRe's gaps would let "too much" reach across "too many people and too much"
    return [...out].map(notes.length > 1 ? termRe : noteRe);
  }
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
    const exampleHTML = v => v.example ? markTerms(v.example, phraseExRes(v.word).map(re => ({ re, cls: 'lp' }))) : '';
    const pager = pagerHTML(cur, pages, 'phrGo', i => (list[i * PHR_PAGE] || {}).word || '');
    const fmtN = n => n.toLocaleString('en-US'), catName = c => t('phCat' + String(c).slice(2));
    const from = list.length ? cur * PHR_PAGE + 1 : 0, to = Math.min(list.length, cur * PHR_PAGE + PHR_PAGE);
    // the same tidy filter card as the word bank: search · 類別 · 程度, then bookmarks, the count and a compact pager, then practice
    const mini = pages > 1 ? `<div class="wb-mini">
      <button class="pg-btn" data-action="phrGo" data-p="${cur - 1}" ${cur === 0 ? 'disabled' : ''} aria-label="${t('pgPrev')}">‹</button>
      <select class="input pager-sel" data-pager="phrGo" aria-label="${t('pgJump')}">${Array.from({ length: pages }, (_, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${tf('pgPageN', { n: i + 1 })} · ${esc((list[i * PHR_PAGE] || {}).word || '')}</option>`).join('')}</select>
      <button class="pg-btn" data-action="phrGo" data-p="${cur + 1}" ${cur >= pages - 1 ? 'disabled' : ''} aria-label="${t('pgNext')}">›</button></div>` : '';
    return `${subtabs('phrases')}${pageHead('phrases', tf('phrSub', { n: fmtN(all.length) }))}
      <div class="card wb-tools phr-tools">
        <div class="wb-filters">
          <label class="sr-only" for="phrSearch">${t('phrSearch')}</label><input type="search" id="phrSearch" class="wb-search" placeholder="🔍 ${t('phrSearch')}" value="${esc(f.q)}" enterkeyhint="search" autocapitalize="off" autocorrect="off" spellcheck="false">
          <div class="wb-sel"><label class="sr-only" for="phrCatSel">${t('phrCatLbl')}</label><select class="input" id="phrCatSel"><option value="">${t('phrAllCats')}（${fmtN(all.length)}）</option>${cats.map(c => { const n = all.filter(v => v.unit === c).length; return n ? `<option value="${c}" ${f.cat === c ? 'selected' : ''}>${esc(catName(c))}（${fmtN(n)}）</option>` : ''; }).join('')}</select></div>
          <div class="wb-sel"><label class="sr-only" for="phrLevelSel">${t('phrLevelLbl')}</label><select class="input" id="phrLevelSel">${[['', t('phrAllLevels')], ['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']].map(([v, l]) => `<option value="${v}" ${f.level === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        </div>
        <div class="wb-meta">
          <button class="btn sm ${f.bm ? 'accent' : 'ghost'}" data-action="phrBm" aria-pressed="${!!f.bm}">🔖 ${t('onlyBookmarks')}</button>
          <span class="small muted wb-count">${list.length ? tf('phrRange', { a: fmtN(from), b: fmtN(to), n: fmtN(list.length) }) : t('phrNoneShort')} · ${tf('phrMastered', { n: fmtN(mastered), t: fmtN(inCat.length) })}</span>
          <span class="spacer"></span>${mini}
        </div>
        <div class="phr-practice"><span class="small phr-prac-lbl">${t('phrPracticeA')}<span class="phr-prac-cat">${tf('phrPracticeCat', { c: esc(f.cat ? catName(f.cat) : t('phrAllCats')) })}</span>：</span>
          <button class="btn sm accent" data-action="phrFlash">🃏 ${t('phrFlashBtn')}</button><button class="btn sm" data-action="phrQuiz">📝 ${t('phrQuizBtn')}</button></div>
      </div>
      ${list.length ? `<div class="phr-grid">${shown.map(v => { const on = isBm('vocab', v.id); return `<article class="phr-card">
        <div class="phr-head"><div class="phr-title"><span class="phr-word en">${esc(v.word)}</span> <span class="chip">${esc(v.cefr || '')}</span>${box(v.id) === 3 ? ` <span class="chip ok">✓ ${t('level3')}</span>` : ''}</div>
          <div class="phr-icons"><button class="icon-btn phr-say" data-action="speak" data-word="${esc(v.example || v.word)}" aria-label="${esc(t('speak') + '：' + v.word)}">🔊</button><button class="icon-btn bm-star ${on ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${esc(v.id)}" aria-pressed="${on}" aria-label="${esc(t('bookmark') + '：' + v.word)}">${on ? '★' : '☆'}</button></div></div>
        <div class="phr-zh">${esc(v.zh)}</div>
        ${v.example ? `<div class="phr-ex en">${exampleHTML(v)}</div>` : ''}
        ${v.syn ? `<div class="phr-syn en"><span aria-hidden="true">≈ </span><span class="sr-only">${t('synonyms')}：</span>${esc(v.syn)}</div>` : ''}
        ${!f.cat ? `<div class="phr-cat-lbl">${esc(catName(v.unit))}</div>` : ''}
      </article>`; }).join('')}</div>${pager}` : `<div class="card"><p class="muted" style="margin:0">${t('phrNone')}</p></div>`}`;
  }

  /* ---- 📐 文法 tab: the chapters by unit, one chapter with its 小測驗, and the 綜合測驗 (#/grammar, #/grammar/g-passive, #/grammar/quiz) ---- */
  const GR = window.GRAMMAR_DATA || { units: [], chapters: [] }, GR_CH = GR.chapters;
  // the 7 units: [id, name, icon, what is in it, short name]; a chapter is numbered by its unit and its place there (2-1 = 第二單元第 1 章)
  const GR_UNITS = GR.units.map(([id, name, icon, desc, short], i) => ({ id, name, icon, desc, short: short || name, n: i + 1 }));
  const GR_UNIT = new Map(GR_UNITS.map(u => [u.id, u]));
  const grById = new Map(GR_CH.map(c => [c.id, c]));
  const grUnitLabel = u => `第${'一二三四五六七八九十'[u.n - 1]}單元`;
  const grCode = c => { const u = GR_UNIT.get(c.unit); return `${u ? u.n : 0}-${GR_CH.filter(x => x.unit === c.unit).indexOf(c) + 1}`; };
  const GR_TITLE = new Map(GR_CH.map(c => [c.title, c.id]));
  const GR_BANDS = [['', '全部'], ['A', '基礎 A1–A2'], ['B1', '統測核心 B1'], ['B2', '進階 B2']];
  const grBand = c => /^A/.test(c.level) ? 'A' : c.level;
  const GR_LEVEL_NAME = { A1: '入門', A2: '基礎', B1: '統測核心', B2: '進階' };
  const GR_QN = 8, GR_PASS = 6, GR_MIXN = 10; // a chapter's 小測驗 counts as done from 6 of 8; a 綜合測驗 has 10 questions
  // the text marks: **key term**, [[the words that show the point]], 〈another chapter〉 (a link to it)
  const grRich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[\[(.+?)\]\]/g, '<mark class="gr-hl">$1</mark>')
    .replace(/〈([^〉]+)〉/g, (m, x) => GR_TITLE.has(x) ? `<a href="#/grammar/${GR_TITLE.get(x)}">〈${esc(x)}〉</a>` : m);
  const grNoLinks = h => h.replace(/<a [^>]*>|<\/a>/g, '');
  const grPlain = s => String(s).replace(/\[\[|\]\]/g, '');
  const grBlank = (q, fill) => esc(q).replace('______', fill == null ? '<span class="gr-blank"><span class="sr-only" lang="zh-Hant-TW">空格</span></span>' : `<span class="gr-blank filled">${esc(fill)}</span>`);
  // this device's progress: { ch: { 'g-passive': { best: 7, at: '2026-10-19' } }, mix: { all: 8 }, last: 'g-passive' }
  const LS_GR = 'tve_grammar_v1';
  const grStore = (() => { try { const o = JSON.parse(localStorage.getItem(LS_GR) || '{}') || {}; return { ch: o.ch && typeof o.ch === 'object' ? o.ch : {}, mix: o.mix && typeof o.mix === 'object' ? o.mix : {}, last: o.last || '' }; } catch (e) { return { ch: {}, mix: {}, last: '' }; } })();
  const grSave = () => { try { localStorage.setItem(LS_GR, JSON.stringify(grStore)); } catch (e) { } };
  // a chapter's best 小測驗 score: the synced record (progress.grammar), or this device's older one (tve_grammar_v1)
  const grStatus = c => { const a = (state.progress.grammar || {})[c.id], b = grStore.ch[c.id], r = !a ? b : !b || a.best >= (b.best || 0) ? a : b; return r && r.best != null ? r : null; };
  const grDone = list => list.filter(c => (grStatus(c) || {}).best >= GR_PASS).length;
  view.gr = { sub: 'list', id: '', q: '', unit: '', band: '', picks: {}, mix: null, range: '' };
  const GR_HAY = new Map(GR_CH.map(c => [c.id, [c.title, c.en, c.lead,
    ...c.sections.flatMap(s => [s.h, ...s.text, s.formula || '', ...(s.table ? [...s.table.cols, ...s.table.rows.flat()] : []), ...s.ex.flatMap(x => [x.en, x.zh])]),
    ...c.mistakes.flatMap(m => [m.wrong, m.right, m.why]), ...c.tips].join('\n').replace(/\*\*|\[\[|\]\]/g, '').toLowerCase()]));
  // 📖 章節 (how many are done) · 🎯 綜合測驗 (a dot while one waits to be finished)
  function grKinds() {
    const g = view.gr, going = g.mix && g.mix.i < g.mix.qs.length && g.sub !== 'quiz', onQuiz = g.sub === 'quiz';
    const tab = (quiz, href, label, sub) => `<a class="gr-kind${quiz && going ? ' has-session' : ''}" href="${href}"${onQuiz === quiz ? ' aria-current="page"' : ''}><span>${label}</span><small>${sub}${quiz && going ? '<span class="sr-only">（尚未完成）</span>' : ''}</small></a>`;
    return `<nav class="gr-kinds" aria-label="章節、綜合測驗">${tab(false, '#/grammar', '📖 章節', `${GR_CH.length} 章 · 完成 ${grDone(GR_CH)}`)}${tab(true, '#/grammar/quiz', '🎯 綜合測驗', 'Quiz')}</nav>`;
  }
  function grCard(c) {
    const r = grStatus(c);
    const st = !r ? '<span class="gr-st">尚未進行小測驗</span>' : r.best >= GR_PASS ? `<span class="gr-st ok">✓ 小測驗 ${r.best} / ${GR_QN}</span>` : `<span class="gr-st">小測驗 ${r.best} / ${GR_QN}</span>`;
    return `<a class="card gr-ch${r && r.best >= GR_PASS ? ' is-done' : ''}" href="#/grammar/${c.id}"><span class="gr-no" aria-hidden="true">${grCode(c)}</span>
      <span class="gr-ch-body"><span class="gr-ch-t"><b>${esc(c.title)}</b><span class="chip">${esc(c.level)}</span></span><span class="gr-ch-en" lang="en">${esc(c.en)}</span>
      <span class="gr-ch-lead">${grNoLinks(grRich(c.lead))}</span>${st}</span></a>`;
  }
  function grList() {
    const g = view.gr, q = g.q.trim(), ql = q.toLowerCase();
    const list = GR_CH.filter(c => (!g.unit || c.unit === g.unit) && (!g.band || grBand(c) === g.band) && (!ql || GR_HAY.get(c.id).includes(ql)));
    const upill = (u, name, n) => `<button type="button" class="subtab" data-action="grUnit" data-v="${u}" aria-pressed="${g.unit === u}">${name}<b>${n}</b></button>`;
    const bpill = (b, name) => `<button type="button" class="subtab" data-action="grBand" data-v="${b}" aria-pressed="${g.band === b}">${name}<b>${GR_CH.filter(c => !b || grBand(c) === b).length}</b></button>`;
    const last = grById.get(grStore.last);
    let body = '';
    GR_UNITS.forEach(u => {
      const run = list.filter(c => c.unit === u.id); if (!run.length) return;
      const all = GR_CH.filter(c => c.unit === u.id), done = grDone(all);
      body += `<section class="gr-unit" aria-labelledby="gu-${u.id}"><h2 class="gr-unit-h" id="gu-${u.id}"><span class="gr-unit-ic" aria-hidden="true">${u.icon}</span><span class="gr-unit-t"><small>${grUnitLabel(u)}</small>${esc(u.name)}</span><span class="gr-unit-n">${all.length} 章${done ? `・完成 ${done}` : ''}</span></h2>
        <p class="gr-unit-d">${esc(u.desc)}</p><div class="gr-grid">${run.map(grCard).join('')}</div></section>`;
    });
    // the whole list needs no count line: the 章節 tab already counts it
    const count = !list.length ? (q ? `查無「${q}」的相關章節。` : '此分類中沒有該程度的章節。') : q || g.band || g.unit ? `${q ? '找到' : '共'} ${list.length} 章` : '';
    return `<div class="card gr-tools">
        <div class="gr-search"><label class="sr-only" for="grQ">搜尋文法章節</label><input type="search" id="grQ" value="${esc(g.q)}" placeholder="搜尋：被動、現在完成、which…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></div>
        <div class="gr-frow"><span class="gr-flbl" id="grUnitsLbl">分類</span><nav class="subtabs gr-pills units" aria-labelledby="grUnitsLbl">${upill('', '全部', GR_CH.length)}${GR_UNITS.map(u => upill(u.id, `${u.icon} ${esc(u.short)}`, GR_CH.filter(c => c.unit === u.id).length)).join('')}</nav></div>
        <div class="gr-frow"><span class="gr-flbl" id="grBandsLbl">程度</span><nav class="subtabs gr-pills gr-bands" aria-labelledby="grBandsLbl">${GR_BANDS.map(([b, n]) => bpill(b, n)).join('')}</nav></div>
        ${last ? `<p class="gr-last">📌 上次閱讀：<a href="#/grammar/${last.id}">${grCode(last)}　${esc(last.title)} →</a></p>` : ''}
      </div><p class="gr-count" role="status">${esc(count)}</p>
      ${list.length ? body : `<div class="card gr-empty"><p>${q ? '請嘗試輸入中文或英文，例如：被動、現在完成、which、if。' : '請嘗試選擇其他程度或分類。'}</p></div>`}`;
  }
  // 結構圖解: the sentence split into its parts, each with a fixed colour AND a text label (S 主詞 …); modifiers and linking words grey
  const GR_ROLE = { S: '主詞', V: '動詞', O: '受詞', C: '補語', M: '修飾', J: '連接' };
  const grParse = P => `<figure class="gr-parse"><div class="gp-row">${P.parts.map(([w, r, note]) => `<span class="gp-chunk r-${r}"><span class="gp-txt" lang="en">${esc(w)}</span><span class="gp-tag">${r} ${GR_ROLE[r] || ''}${note ? `<small>${esc(note)}</small>` : ''}</span></span>`).join('')}</div>
      <figcaption>${esc(P.zh)} <button type="button" class="icon-btn gr-say" data-action="speak" data-word="${esc(P.en)}" aria-label="${t('listen')}">🔊</button></figcaption></figure>`;
  // a 待審 note: content that could not be confirmed is shown as such, never as a firm rule
  const grPending = (c, where) => (c.pending || []).filter(x => x.where === where).map(x => `<p class="gr-pending"><span class="chip warn">待審</span> ${grRich(x.note)}</p>`).join('');
  const grMisItem = m => `<li><p class="gr-wrong" lang="en"><span class="gr-mk" aria-hidden="true">✘</span><span class="sr-only" lang="zh-Hant-TW">錯誤：</span><s>${esc(m.wrong)}</s></p><p class="gr-right" lang="en"><span class="gr-mk" aria-hidden="true">✔</span><span class="sr-only" lang="zh-Hant-TW">正確：</span>${grRich(m.right)}</p><p class="gr-why">${grRich(m.why)}</p></li>`;
  // one section: 核心規則 (進階補充 folded) → 結構圖解 → 例句 → 常見錯誤 → 小練習
  function grSection(s, i, c) {
    const table = s.table ? `<div class="gr-table-wrap" tabindex="0" role="region" aria-label="${esc(s.h)}（表格）"><table class="gr-table"><thead><tr>${s.table.cols.map(x => `<th scope="col">${grRich(x)}</th>`).join('')}</tr></thead>
      <tbody>${s.table.rows.map(r => `<tr>${r.map((x, k) => k ? `<td>${grRich(x)}</td>` : `<th scope="row">${grRich(x)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
    const mis = (c.mistakes || []).map((m, k) => [m, k]).filter(([m]) => m.sec === i);
    return `<section class="card gr-sec" id="gs-${i + 1}" tabindex="-1" aria-labelledby="gsh-${i + 1}">
      <h2 id="gsh-${i + 1}"><span class="gr-sn" aria-hidden="true">${i + 1}</span>${grRich(s.h)}</h2>
      <div class="gr-part gr-rule"><h3 class="gr-k">核心規則</h3>${s.text.map(p => `<p>${grRich(p)}</p>`).join('')}${grPending(c, `sections[${i}]`)}
        ${s.adv ? `<details class="gr-adv"><summary>進階補充</summary>${s.adv.map(p => `<p>${grRich(p)}</p>`).join('')}${grPending(c, `sections[${i}].adv`)}</details>` : ''}</div>
      <div class="gr-part"><h3 class="gr-k">結構圖解</h3>${s.formula ? `<p class="gr-formula">${grRich(s.formula)}</p>` : ''}${s.parse ? grParse(s.parse) : ''}${table}</div>
      <div class="gr-part"><h3 class="gr-k">例句</h3>
      <ul class="gr-ex">${s.ex.map(x => `<li><p class="gr-ex-en"><span lang="en">${grRich(x.en)}</span><button type="button" class="icon-btn gr-say" data-action="speak" data-word="${esc(grPlain(x.en))}" aria-label="${t('listen')}">🔊</button></p><p class="gr-ex-zh">${esc(x.zh)}</p></li>`).join('')}</ul></div>
      ${mis.length ? `<div class="gr-part gr-mis-in"><h3 class="gr-k">常見錯誤</h3><ul>${mis.map(([m, k]) => grMisItem(m) + grPending(c, `mistakes[${k}]`)).join('')}</ul></div>` : ''}
      ${(s.practice || []).length ? `<div class="gr-part gr-prac"><h3 class="gr-k">小練習</h3><ol class="gr-qs">${s.practice.map((q, p) => grPracItem(c, i, p)).join('')}</ol></div>` : ''}
    </section>`;
  }
  // a section's 小練習: answered once, explained at once, kept as a grammar answer (錯題本)
  function grPracItem(c, si, p) {
    const q = c.sections[si].practice[p], key = `${c.id}:${si}.${p}`, pick = (view.gr.sp || {})[key], done = pick != null;
    return `<li class="gr-qi" id="gp-${si}-${p}"><p class="gr-qq" lang="en">${grBlank(q.q, done ? q.options[q.answer] : null)}</p>
      <div class="gr-opts" role="group" aria-label="第 ${si + 1} 節小練習 ${p + 1} 的選項">${q.options.map((_, n) => grOpt(q, n, pick, `data-action="grSecAnswer" data-s="${si}" data-p="${p}" data-o="${n}"`)).join('')}</div>
      ${done ? `<div class="gr-exp ${pick === q.answer ? 'ok' : 'bad'}">${grVerdict(q, pick, `gpv-${si}-${p}`)}</div>` : ''}${grPending(c, `sections[${si}].practice[${p}]`)}</li>`;
  }
  function grOpt(q, n, picked, attrs, big) {
    const done = picked != null, cls = !done ? '' : n === q.answer ? ' is-right' : n === picked ? ' is-wrong' : '';
    return `<button type="button" class="gr-opt${big ? ' big' : ''}${cls}" ${attrs}${done ? ' disabled' : ''} lang="en"><span class="gr-l" aria-hidden="true">${L4[n]}</span><span>${esc(q.options[n])}</span>${done && n === q.answer ? '<span class="sr-only" lang="zh-Hant-TW">（正確答案）</span>' : done && n === picked ? '<span class="sr-only" lang="zh-Hant-TW">（所選答案）</span>' : ''}</button>`;
  }
  const grVerdict = (q, picked, id) => `<p class="gr-verdict" id="${id}" tabindex="-1">${picked === q.answer ? '✔ 答案正確' : `✘ 正確答案：(${L4[q.answer]}) <span lang="en">${esc(q.options[q.answer])}</span>`}</p><p>${esc(q.explain)}</p>`;
  function grQItem(c, i) {
    const q = c.quiz[i], pick = (view.gr.picks[c.id] || [])[i], done = pick != null;
    return `<li class="gr-qi" id="gq-${i}"><p class="gr-qq" lang="en"><span class="gr-qn">${i + 1}.</span> ${grBlank(q.q, done ? q.options[q.answer] : null)}</p>
      <div class="gr-opts" role="group" aria-label="第 ${i + 1} 題的選項">${q.options.map((_, n) => grOpt(q, n, pick, `data-action="grAnswer" data-q="${i}" data-o="${n}"`)).join('')}</div>
      ${done ? `<div class="gr-exp ${pick === q.answer ? 'ok' : 'bad'}">${grVerdict(q, pick, 'gv-' + i)}</div>` : ''}${grPending(c, `quiz[${i}]`)}</li>`;
  }
  function grQSum(c) {
    const picks = view.gr.picks[c.id] || [], n = picks.filter(x => x != null).length, right = picks.filter((x, i) => x === c.quiz[i].answer).length, r = grStatus(c);
    if (n < c.quiz.length) return `<p class="gr-qsum">已答 ${n} / ${c.quiz.length} 題・答對 ${right} 題${r ? `・最佳成績 ${r.best} / ${GR_QN}` : ''}</p>`;
    return `<div class="gr-qdone"><p class="gr-score"><b>${right} / ${c.quiz.length}</b> ${right === c.quiz.length ? '全部答對！🎉' : right >= GR_PASS ? '表現良好！請再複習答錯題目的解析。' : '請先複習上方說明，再重新作答。'}</p>
      <p class="small muted">最佳成績：${r ? r.best : right} / ${GR_QN}</p><button type="button" class="btn" data-action="grRedo">↻ 重新作答</button></div>`;
  }
  function grChapter(c) {
    const n = GR_CH.indexOf(c), prev = GR_CH[n - 1], next = GR_CH[n + 1], u = GR_UNIT.get(c.unit) || { icon: '', name: '', n: 0 };
    const toc = [...c.sections.map((s, i) => [`gs-${i + 1}`, s.h]), ...((c.mistakes || []).some(m => m.sec == null) ? [['gs-mis', '⚠️ 常見錯誤']] : []), ['gs-tips', '🎯 統測重點'], ['gs-quiz', '📝 章末小測驗']];
    const pre = (c.prereq || []).map(id => grById.get(id)).filter(Boolean);
    return `<nav class="gr-crumb" aria-label="位置"><a href="#/grammar">← 文法目錄</a><span>${u.icon} ${grUnitLabel(u)}・${esc(u.name)}・${grCode(c)}</span></nav>
      <header class="page-head gr-head"><h1 tabindex="-1">${esc(c.title)}</h1><p><span lang="en">${esc(c.en)}</span><span class="chip">${esc(c.level)}</span></p></header>
      <p class="gr-lead">💡 ${grRich(c.lead)}</p>${grPending(c, 'lead')}
      <div class="card gr-about">${(c.goals || []).length ? `<div><h2 class="gr-k">學習目標</h2><ul>${c.goals.map(g => `<li>${grRich(g)}</li>`).join('')}</ul></div>` : ''}
        <div><h2 class="gr-k">先備章節</h2>${pre.length ? `<p>${pre.map(x => `<a href="#/grammar/${x.id}">${grCode(x)} ${esc(x.title)}</a>`).join('、')}</p>` : '<p class="muted">無須先修其他章節，可直接開始。</p>'}
          <h2 class="gr-k">難度</h2><p>${esc(c.level)}（${esc(GR_LEVEL_NAME[c.level] || '')}）</p></div></div>
      <nav class="gr-toc" aria-label="本章內容">${toc.map(([id, h]) => `<button type="button" class="gr-toc-b" data-action="grJump" data-to="${id}">${grNoLinks(grRich(h))}</button>`).join('')}</nav>
      ${c.sections.map((s, i) => grSection(s, i, c)).join('')}
      ${(c.mistakes || []).some(m => m.sec == null) ? `<section class="card gr-mis" id="gs-mis" tabindex="-1" aria-labelledby="gsh-mis"><h2 id="gsh-mis">⚠️ 常見錯誤</h2>
        <ul>${c.mistakes.filter(m => m.sec == null).map(grMisItem).join('')}</ul></section>` : ''}
      <section class="card gr-tips" id="gs-tips" tabindex="-1" aria-labelledby="gsh-tips"><h2 id="gsh-tips">🎯 統測重點</h2><ul>${c.tips.map((x, k) => `<li>${grRich(x)}${grPending(c, `tips[${k}]`)}</li>`).join('')}</ul></section>
      <section class="card gr-quiz" id="gs-quiz" tabindex="-1" aria-labelledby="gsh-quiz"><h2 id="gsh-quiz">📝 章末小測驗</h2>
        <ol class="gr-qs">${c.quiz.map((_, i) => grQItem(c, i)).join('')}</ol>
        <div id="grQsum" role="status">${grQSum(c)}</div></section>
      <nav class="gr-pn" aria-label="上一章、下一章">${prev ? `<a class="btn ghost" href="#/grammar/${prev.id}">← ${grCode(prev)} ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn accent" href="#/grammar/${next.id}">${grCode(next)} ${esc(next.title)} →</a>` : `<a class="btn accent" href="#/grammar/quiz">🎯 綜合測驗 →</a>`}</nav>`;
  }
  // 綜合測驗 ranges: '' (all), 'u:tense' (a unit) or a level band ('A', 'B1', 'B2')
  const grInRange = (c, r) => !r || (r.startsWith('u:') ? c.unit === r.slice(2) : grBand(c) === r);
  const grRangeName = r => !r ? '全部' : r.startsWith('u:') ? (GR_UNIT.get(r.slice(2)) || {}).name : (GR_BANDS.find(x => x[0] === r) || [0, ''])[1];
  function grMix() {
    const g = view.gr, s = g.mix;
    if (!s) {
      const best = grStore.mix[g.range || 'all'], pick = (r, l) => `<button type="button" class="gr-pick" data-action="grRange" data-v="${r}" aria-pressed="${g.range === r}">${esc(l)}</button>`;
      return `<section class="card gr-mix-set" aria-labelledby="qsTitle"><h2 id="qsTitle" style="margin-top:0">🎯 綜合測驗</h2>
        <p class="muted">從各章題目中隨機抽出 ${GR_MIXN} 題，作答後可查看解析，並可直接回到答錯題目所屬的章節。</p>
        <h3 class="small gr-rh" id="grRu">依單元</h3><div class="gr-ranges units" role="group" aria-labelledby="grRu">${pick('', '全部')}${GR_UNITS.map(u => pick('u:' + u.id, `${u.icon} ${u.short}`)).join('')}</div>
        <h3 class="small gr-rh" id="grRb">依程度</h3><div class="gr-ranges" role="group" aria-labelledby="grRb">${GR_BANDS.slice(1).map(([b, l]) => pick(b, l)).join('')}</div>
        <p class="gr-best">${best != null ? `「${esc(grRangeName(g.range))}」的最佳成績：${best} / ${GR_MIXN}` : `「${esc(grRangeName(g.range))}」尚無成績。`}</p>
        <button type="button" class="btn accent gr-go" data-action="grStart">開始測驗 ▶</button></section>`;
    }
    const n = s.qs.length;
    if (s.i >= n) {
      const wrongCh = [...new Set(s.wrong)].map(id => grById.get(id));
      return `<section class="card gr-result" aria-labelledby="rTitle"><div class="big-icon" aria-hidden="true">${s.right / n >= .8 ? '🎉' : '💪'}</div>
        <h2 id="rTitle" tabindex="-1">${s.redo ? '錯題重做完成' : '綜合測驗完成'}</h2><p class="gr-rscore">${s.right} / ${n}</p>
        <p class="muted">${s.right === n ? '全部答對，表現優異！' : s.right / n >= .7 ? '表現良好！請再複習答錯的章節。' : '請回到答錯的章節複習後，再挑戰一次！'}</p>
        ${wrongCh.length ? `<div class="gr-review"><h3>建議複習的章節</h3><ul>${wrongCh.map(c => `<li><a href="#/grammar/${c.id}">${grCode(c)}　${esc(c.title)}</a></li>`).join('')}</ul></div>` : ''}
        <div class="row" style="justify-content:center;margin-top:16px">${s.redo ? `<a class="btn accent" href="#/wrong">${t('wbBack')}</a><button type="button" class="btn ghost" data-action="grSetup">綜合測驗</button>` : `<button type="button" class="btn accent" data-action="grStart" data-v="again">再測一次</button><button type="button" class="btn ghost" data-action="grSetup">換範圍</button>`}</div></section>`;
    }
    const x = s.qs[s.i], c = grById.get(x.id), q = grQ(x), done = s.chosen != null;
    return `<section class="card gr-mq" aria-labelledby="qTitle">
      <div class="gr-mq-top"><span>第 ${s.i + 1} / ${n} 題</span><span class="gr-bar" aria-hidden="true"><i style="width:${Math.round((s.i + (done ? 1 : 0)) / n * 100)}%"></i></span><span>✓ ${s.right}</span></div>
      <h2 id="qTitle" tabindex="-1" lang="en">${grBlank(q.q, done ? q.options[q.answer] : null)}</h2>
      <div class="gr-opts two">${q.options.map((_, k) => grOpt(q, k, s.chosen, `data-action="grMixAnswer" data-o="${k}"`, true)).join('')}</div>
      ${done ? `<div class="gr-exp ${s.chosen === q.answer ? 'ok' : 'bad'}">${grVerdict(q, s.chosen, 'grVerdict')}<p class="gr-from">出自 <a href="#/grammar/${c.id}">${grCode(c)}〈${esc(c.title)}〉→</a></p></div>
        <div class="gr-next"><button type="button" class="btn accent" data-action="grNext" aria-describedby="grVerdict">${s.i + 1 < n ? '下一題 →' : '查看成績 🎉'}</button></div>` : ''}
    </section>`;
  }
  function pageGrammar() {
    const g = view.gr, c = g.sub === 'ch' ? grById.get(g.id) : null;
    if (c && grStore.last !== c.id) { grStore.last = c.id; grSave(); }
    if (c) markOpened('g:' + c.id);
    if (c) return subtabs('grammar') + grKinds() + grChapter(c);
    return `${subtabs('grammar')}${pageHead('grammar', g.sub === 'quiz' ? '' : t('grammarSub'))}${grKinds()}${g.sub === 'quiz' ? grMix() : grList()}`;
  }
  // a chapter's question answered: redraw only that question and the count (the page stays where it is); the 8th saves the score
  function grAnswer(i, n) {
    const g = view.gr, c = grById.get(g.id); if (!c || !c.quiz[i]) return;
    const picks = g.picks[c.id] || (g.picks[c.id] = []); if (picks[i] != null) return;
    picks[i] = n; gqRecord({ id: c.id, i }, n);
    if (c.quiz.every((_, k) => picks[k] != null)) {
      const right = picks.filter((x, k) => x === c.quiz[k].answer).length, r = grStore.ch[c.id] || {};
      grStore.ch[c.id] = { best: Math.max(r.best || 0, right), at: todayStr() }; grSave();
      const P = state.progress, o = (P.grammar || (P.grammar = {}))[c.id] || {}; P.grammar[c.id] = { best: Math.max(o.best || 0, r.best || 0, right), at: todayStr() }; save();
      const k = $('#app .gr-kinds'); if (k) k.outerHTML = grKinds(); // the 完成 count on the 📖 章節 tab
    }
    const li = $(`#gq-${i}`); if (li) li.outerHTML = grQItem(c, i);
    const sum = $('#grQsum'); if (sum) sum.innerHTML = grQSum(c);
    const v = $(`#gv-${i}`); if (v) v.focus({ preventScroll: true });
  }
  // a section's 小練習 answered: only that question is redrawn
  function grSecAnswer(si, p, n) {
    const g = view.gr, c = grById.get(g.id), q = c && ((c.sections[si] || {}).practice || [])[p]; if (!q) return;
    const sp = g.sp || (g.sp = {}), key = `${c.id}:${si}.${p}`; if (sp[key] != null) return;
    sp[key] = n; gqRecord({ id: c.id, s: si, p }, n);
    const li = $(`#gp-${si}-${p}`); if (li) li.outerHTML = grPracItem(c, si, p);
    const v = $(`#gpv-${si}-${p}`); if (v) v.focus({ preventScroll: true });
  }
  // 綜合測驗: 1–4 (or A–D) picks an answer
  document.addEventListener('keydown', e => {
    const s = view.page === 'grammar' && view.gr.sub === 'quiz' && view.gr.mix;
    if (!s || s.chosen != null || s.i >= s.qs.length || e.altKey || e.ctrlKey || e.metaKey || e.key.length !== 1 || (e.target.closest && e.target.closest('input, textarea, select')) || !$('#moreSheet').classList.contains('hidden')) return;
    const k = /^[1-4]$/.test(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase()); if (k < 0) return;
    e.preventDefault(); actions.grMixAnswer({ dataset: { o: String(k) } });
  });
  function grMixGo(focusSel) {
    render(); const f = $(focusSel); if (f) f.focus({ preventScroll: true });
    const top = $('#app .gr-mq, #app .gr-result, #app .gr-mix-set'); if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: 'start' });
  }

  /* ---- Daily English news (news.json is refreshed every morning by a GitHub Action) ---- */
  const news = { status: 'idle', data: null, source: '' };
  async function loadNews() {
    news.status = 'loading';
    try {
      const r = await fetch('news.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      news.data = await r.json();
      // only web links: a story or lesson with any other kind of link is dropped
      const web = x => isObj(x) && typeof x.link === 'string' && /^https?:\/\//i.test(x.link);
      news.data.items = (news.data.items || []).filter(web); news.data.lessons = (news.data.lessons || []).filter(web);
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
  const IRREG = { be: "am is are was were been being isn't aren't wasn't weren't", lend: 'lent', can: "can't cannot could couldn't", will: "won't would wouldn't", understand: 'understood', become: 'became', sleep: 'slept', wake: 'woke woken', have: 'has had having', do: 'does did done doing', go: 'goes went gone going', get: 'gets got gotten getting', make: 'made', take: 'took taken', give: 'gave given', come: 'came', keep: 'kept', bring: 'brought', find: 'found', hold: 'held', stand: 'stood', catch: 'caught', think: 'thought', run: 'ran running', put: 'putting', set: 'setting', cut: 'cutting', let: 'letting', break: 'broke broken', fall: 'fell fallen', grow: 'grew grown', show: 'shown', see: 'saw seen', know: 'knew known', tell: 'told', say: 'said', pay: 'paid', lead: 'led', leave: 'left', sit: 'sat sitting', wear: 'wore worn', throw: 'threw thrown', draw: 'drew drawn', write: 'wrote written', drive: 'drove driven', eat: 'ate eaten', begin: 'began begun beginning', deal: 'dealt', feel: 'felt', hang: 'hung', lay: 'laid', lie: 'lay lain lying', lose: 'lost', mean: 'meant', meet: 'met', send: 'sent', sell: 'sold', spend: 'spent', stick: 'stuck', strike: 'struck', teach: 'taught', buy: 'bought', fight: 'fought', win: 'won winning', speak: 'spoke spoken', wake: 'woke woken', rise: 'rose risen', ride: 'rode ridden', fly: 'flew flown', shake: 'shook shaken', choose: 'chose chosen', forget: 'forgot forgotten', hide: 'hid hidden', build: 'built', light: 'lit', shoot: 'shot', blow: 'blew blown', dig: 'dug digging', swim: 'swam swum swimming', stop: 'stopped stopping', drop: 'dropped dropping', plan: 'planned planning', shut: 'shutting', hit: 'hitting', step: 'stepped stepping', carry: 'carried carries', try: 'tried tries', rely: 'relied relies', apply: 'applied applies', worry: 'worried worries' };
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
      if (PHRASE_SKIP.has(v.word) || v.level === 'A1') return; // A1 phrases (a lot of, every day) are too basic to point out in the news
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
  // src: where the word was met { k: 'read' | 'news' | 'city', ref, p } — kept with the sentence when the word is saved
  function saveWordBtn(word, pos, zh, ex, src) {
    src = src || (view.page === 'news' && view.newsArticle ? { k: 'news', ref: view.newsArticle } : null);
    const v = vocabEntry(word), on = v && isBm('vocab', v.id);
    return `<button class="btn sm save-word ${on ? 'on' : ''}" data-action="saveNewsWord" data-id="${v ? esc(v.id) : ''}" data-word="${esc(v ? v.word : word)}" data-pos="${esc(pos || '')}" data-zh="${esc(zh || '')}" data-ex="${esc(ex || '')}"${src ? ` data-src-k="${src.k}" data-src-ref="${esc(src.ref)}"${src.p != null ? ` data-src-p="${src.p}"` : ''}` : ''} title="${t(on ? 'removeBookmark' : 'addBookmark')}" aria-pressed="${!!on}">${on ? '★' : '☆'}</button>`;
  }
  const wordSrcOf = id => { const l = (state.progress.wordSrc || {})[id]; return l && l.length ? l[l.length - 1] : null; };
  const srcPlace = x => x.k === 'read' ? (articleById(x.ref) ? `〈${articleById(x.ref).title}〉` : t('grpRead')) : x.k === 'city' ? t('srcCity') : t('tabNews');
  const srcLine = (id, word) => { const x = wordSrcOf(id); if (!x) return ''; const re = noteRe(word);
    return `<div class="src-line"><span class="small muted">${t('srcFrom')} ${esc(srcPlace(x))}</span><span class="en">${esc(x.s).replace(new RegExp(re.source, re.flags.replace('g', '')), m => `<b>${m}</b>`)}</span></div>`; };
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
        <div class="news-meta"><span class="news-src ${SRC_CLASS[les.source] || ''}">${esc(les.source)}</span>${les.topic ? `<span class="chip">${esc(les.topic)}</span>` : ''}<span class="small muted">${tf('lessonWords', { n: Number(les.words) || full.split(/\s+/).filter(Boolean).length })}${item.date ? ' · ' + ago(item.date) : ''}</span></div>
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
          <section class="lesson-box lb-grammar"><h4>📐 ${t('lessonGrammar')}</h4>${(les.grammar || []).map(g => `<div class="gram-item"><b>${esc(g.point)}</b><p class="small">${esc(g.explain)}</p><p class="gram-ex en">“${g.focus ? markTerms(g.example, [{ re: new RegExp(escRe(g.focus.trim()).replace(/\s+/g, '\\s+'), 'gi'), cls: 'gram-focus' }]) : esc(g.example)}”</p>${gramLink(gramChapter(g.point))}</div>`).join('')}</section>
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
      ${a.grammar.length ? `<div class="study-sec"><b>📐 ${t('lessonGrammar')}</b>${a.grammar.map(g => { const w = clipAround(g.sentence, g.s, g.e); return `<div class="gram-item"><b>${esc(g.point)}</b><p class="small">${esc(g.explain)}</p><p class="gram-ex en">“${w.pre}${esc(g.sentence.slice(w.a, g.s))}<mark>${esc(g.sentence.slice(g.s, g.e))}</mark>${esc(g.sentence.slice(g.e, w.b))}${w.post}”</p>${gramLink(GRAM_KEY[g.k])}</div>`; }).join('')}</div>` : ''}
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
    const lessons = newsLessons(), lessonOf = Object.create(null); lessons.forEach(l => { lessonOf[l.link] = l; }); // no inherited keys: #/news/constructor is not a story
    if (view.newsArticle && lessonOf[view.newsArticle]) return newsReader(lessonOf[view.newsArticle]);
    const sources = Array.from(new Set(items.map(i => i.source)));
    // stories with a full article come first, then the others; newest first within each group
    const shown = items.map((it, i) => [it, i]).filter(([it]) => !news.source || it.source === news.source).sort((a, b) => (lessonOf[a[0].link] ? 0 : 1) - (lessonOf[b[0].link] ? 0 : 1) || a[1] - b[1]);
    const open = view.newsOpen || (view.newsOpen = {});
    const upd = news.data && news.data.updated ? news.data.updated.slice(0, 16).replace('T', ' ').replace(/-/g, '/') : '';
    let body;
    if (news.status === 'loading' || news.status === 'idle') body = `<p class="muted" role="status">${t('newsLoading')}</p>`;
    else if (news.status === 'error') body = `<div class="card news-empty" role="alert">📡 ${t('newsError')} <button class="btn sm accent" data-action="newsRetry">🔄 ${t('retryLoad')}</button></div>`;
    else if (!items.length) body = `<div class="card news-empty">📭 ${t('newsEmpty')}</div>`;
    else body = `<div class="chip-scroll" role="group" style="margin:0 0 6px"><button class="fchip" data-action="newsSource" data-src="" aria-pressed="${!news.source}">${t('newsAll')} <span class="n">${items.length}</span></button>${sources.map(s => `<button class="fchip" data-action="newsSource" data-src="${esc(s)}" aria-pressed="${news.source === s}">${esc(s)}</button>`).join('')}</div>${upd ? `<p class="small muted" style="margin:0 0 10px">${t('newsUpdated')} ${esc(upd)} UTC</p>` : ''}
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
    return `${subtabs('news')}${pageHead('news', t('newsSub'))}
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
    // the student's own level comes first
    const mine = myLevel() ? 'Reading · ' + myLevel() : '';
    const RG = [['Reading · A2', 'grpA2', '📒', 'A2'], ['Reading · B1', 'grpB1', '📗', 'B1'], ['Reading · B2', 'grpB2', '📘', 'B2'], ['Reading · C1', 'grpC1', '📕', 'C1'], ['Reading · C2', 'grpC2', '📓', 'C2'], ['Reading · Practical', 'grpPractical', '✉️', t('grpPracticalShort')]]
      .sort((x, y) => (y[0] === mine) - (x[0] === mine));
    const groupOfA = a => RG.some(g => g[0] === a.level) ? a.level : '_other';
    const topics = Array.from(new Set(ARTICLES.flatMap(a => a.tags || [])));
    const q = rf.q.trim().toLowerCase();
    const visible = ARTICLES.filter(a => (!rf.topic || (a.tags || []).includes(rf.topic)) && (!rf.status || (rf.status === 'done') === done(a))
      && (!q || a.title.toLowerCase().includes(q) || (a.title_zh || '').includes(rf.q.trim())));
    // one mini-sticker row per passage: status tile · title · ☆ · 開始
    const row = a => {
      const hist = histOf(a.id), isDone = hist.length > 0, g = RG.find(x => x[0] === a.level);
      const best = isDone ? Math.max(...hist.map(r => Math.round(r.score / r.total * 100))) : null;
      const on = isBm('articles', a.id), here = view.lastArticle === a.id;
      return `<div class="list-item read-item ${isDone ? 'is-done' : ''}" data-id="${esc(a.id)}" data-action="openArticle">
        <span class="li-tile" title="${isDone ? t('readDone') : t('readTodo')}" aria-hidden="true">${isDone ? '✓' : (g ? g[2] : '📄')}</span>
        <button type="button" class="ri-main" data-action="openArticle" data-id="${esc(a.id)}"><span class="sr-only">${isDone ? t('readDoneTag') + '：' : ''}</span><div class="title">${esc(a.title)}</div>${a.title_zh ? `<div class="zh">${esc(a.title_zh)}</div>` : ''}</button>
        <button type="button" class="icon-btn ri-bm" data-action="toggleBm" data-kind="articles" data-id="${esc(a.id)}" aria-pressed="${on}" aria-label="${esc(t('bookmark') + '：' + a.title)}">${on ? '★' : '☆'}</button>
        <div class="ri-meta">${here ? `<span class="chip here">📍 ${t('lastRead')}</span>` : ''}${best !== null ? `<span class="chip ${best >= 80 ? 'ok' : best >= 60 ? 'warn' : 'bad'}">${t('best')} ${best}%</span>` : ''}<span>${a.questions.length} ${t('questions')} · ${tf('wordsCount', { n: (a.passage || '').split(/\s+/).filter(Boolean).length })}</span>${(a.tags || []).map(x => `<span class="chip ri-tag">${esc(unitLabel(x))}</span>`).join('')}</div>
        <button type="button" class="btn sm ghost ri-go" data-action="openArticle" data-id="${esc(a.id)}" aria-label="${esc((isDone ? t('retry') : t('go')) + '：' + a.title)}"><span class="ri-go-txt">${isDone ? t('retry') : t('go')}</span><span class="ri-go-chev" aria-hidden="true">›</span></button>
      </div>`;
    };
    const filtering = rf.topic || rf.status || q;
    const groups = RG.map(g => g[0]).concat(['_other']).map(key => {
      const all = ARTICLES.filter(a => groupOfA(a) === key), list = visible.filter(a => groupOfA(a) === key);
      if (!all.length) return '';
      const g = RG.find(x => x[0] === key) || ['_other', 'grpOther', '📄'];
      const nd = all.filter(done).length;
      // keep the passage just read on screen when coming back to the list
      if (view.lastArticle && list.slice(READ_SHOW).some(a => a.id === view.lastArticle)) rf.more[key] = true;
      const shown = rf.more[key] || filtering ? list : list.slice(0, READ_SHOW);
      return `<section class="read-group" id="grp-${g[1]}"><h2 class="read-group-title">${g[2]} ${t(g[1])}${key === mine ? ` <span class="chip lv-mine">🎯 ${t('lvMine')}</span>` : ''} <span class="read-progress"><span class="bar"><i style="width:${all.length ? nd / all.length * 100 : 0}%"></i></span>${nd} / ${all.length} ${t('readDoneShort')}</span></h2>
        ${list.length ? `<div class="list">${shown.map(row).join('')}</div>${shown.length < list.length ? `<div class="center" style="margin-top:10px"><button class="btn ghost" data-action="readMore" data-v="${esc(key)}">${tf('readShowMore', { n: list.length - shown.length })}</button></div>` : ''}` : `<p class="small muted">${t('readNoneHere')}</p>`}</section>`;
    }).join('');
    const totalDone = ARTICLES.filter(done).length;
    const toc = `<div class="card read-toc">
        <div class="read-tools"><label class="sr-only" for="readSearch">${t('readSearch')}</label><input type="search" id="readSearch" placeholder="🔍 ${t('readSearchShort')}" value="${esc(rf.q)}" enterkeyhint="search" autocapitalize="off" autocorrect="off" spellcheck="false">
          <div class="seg" role="group" aria-label="${t('readStatus')}">${[['', t('newsAll')], ['todo', t('readTodoShort')], ['done', '✓ ' + t('readDoneShort')]].map(([v, l]) => `<button class="seg-btn ${rf.status === v ? 'on' : ''}" data-action="readStatus" data-v="${v}" aria-pressed="${rf.status === v}">${l}</button>`).join('')}</div></div>
        <div class="chip-scroll" role="group" aria-label="${t('readTopic')}"><button class="fchip" data-action="readTopic" data-v="" aria-pressed="${!rf.topic}">${t('newsAll')}</button>${topics.map(x => `<button class="fchip" data-action="readTopic" data-v="${esc(x)}" aria-pressed="${rf.topic === x}">${esc(unitLabel(x))}</button>`).join('')}</div>
        <div class="read-jump"><span class="chip ok">✓ ${totalDone} / ${ARTICLES.length}</span><span>${t('jumpTo')}</span>${RG.filter(g => ARTICLES.some(a => a.level === g[0])).map(g => `<button type="button" data-action="jumpGroup" data-target="grp-${g[1]}">${g[2]} ${esc(g[3])}</button>`).join('')}</div>
      </div>`;
    return `${subtabs('reading')}${pageHead('reading', t('readingSub'))}
      ${ui.teacher ? `<div class="teacher-only block" style="margin-bottom:12px"><button class="btn accent" data-action="newArticle">${t('newArticle')}</button></div>` : ''}
      ${ARTICLES.length ? toc + groups : `<p class="muted">${t('noArticles')}</p>`}`;
  }

  // Chinese translation of a reading passage: the teacher's own (passage_zh) or the built-in one (reading-zh.js)
  function readingZh(a) {
    const en = String(a.passage || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
    if (a.passage_zh) { const zh = String(a.passage_zh).split(/\n\s*\n/).map(x => x.trim()).filter(Boolean); return zh.length ? { title: a.title_zh || '', en, zh } : null; }
    const b = !a.edited && (window.READING_ZH || {})[a.id];
    return b && b.paragraphs.length === en.length ? { title: b.title_zh || '', en, zh: b.paragraphs } : null;
  }
  const READ_TTS_SAMPLE = new Set(['a14', 'a15', 'a16']); // paragraph read-aloud, sample only
  function articleView() {
    const a = articleById(view.articleId);
    if (!a) { view.articleId = null; return pageReading(); }
    const Z = readingZh(a), showZh = !!Z && (view.readZh != null ? view.readZh : view.submitted);  // translation shows after answering, or on request
    const n = a.questions.length, k = Object.keys(view.answers).length;
    const qs = a.questions.map((q, qi) => `<div class="question" id="rq-${qi}"><div class="q">${qi + 1}. ${esc(q.q)}</div>
        ${q.options.map((o, oi) => optionHTML({ action: 'choose', data: { q: qi, o: oi }, i: oi, text: o, en: false, chosen: view.answers[qi], answer: q.answer, reveal: view.submitted })).join('')}
        ${view.submitted ? explainHTML(view.answers[qi], q.answer, q.options, q.explain) : ''}
      </div>`).join('');
    let scoreHtml = '';
    if (view.submitted) {
      const sc = a.questions.filter((q, i) => view.answers[i] === q.answer).length;
      scoreHtml = `<div class="score-banner"><div>${t('yourScore')}</div><div class="big">${sc} / ${n}</div><div>${Math.round(sc / n * 100)}%</div>${view.readSecs != null ? `<div class="pace ${view.readSecs <= 600 ? 'ok' : 'slow'}">${tf('paceLine', { t: fmtDur(view.readSecs), p: '10:00' })}</div>` : ''}<div class="row" style="margin-top:10px;justify-content:center"><button class="btn accent" data-action="retry">${t('retry')}</button><button class="btn ghost" data-action="backList">${t('back')}</button></div></div>`;
    }
    // real paragraphs; single line breaks (letters, notices) are kept. A small sample of passages has 🔊 per paragraph
    // (new read-aloud is tried on a few passages first, to be confirmed before it is added everywhere)
    const say = READ_TTS_SAMPLE.has(a.id) && hasTTS(), sayBtn = (p, i) => say ? `<button type="button" class="icon-btn ra-say" data-action="speak" data-word="${esc(p)}" aria-label="${esc(tf('sayPara', { n: i + 1 }))}">🔊</button>` : '';
    const paras = String(a.passage || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map((p, i) => `<p>${esc(p).replace(/\n/g, '<br>')}${sayBtn(p, i)}</p>`).join('');
    const top = view.submitted ? `<div class="row" style="margin:4px 0 12px"><button class="btn ghost sm" data-action="backList">${t('back')}</button></div>`
      : sessionTop('endRead', t('sessionRead'), tf('readAnswered', { k, n }), k, n,
        `<div class="st-jump" role="group"><button type="button" data-action="jump" data-to="passage">${t('jumpPassage')}</button><button type="button" data-action="jump" data-to="q">${t('jumpQs')}</button></div>`);
    return `${subtabs('reading')}${top}
      <article class="card art-card">
        <div class="art-head"><h1 tabindex="-1">${esc(a.title)}</h1>${bmBtn('articles', a.id)}</div>
        ${showZh && Z.title ? `<div class="reader-title-zh" style="margin:-2px 0 6px">${esc(Z.title)}</div>` : ''}
        ${say ? `<p class="small muted tts-sample">${t('ttsSample')}</p>` : ''}
        <div class="art-meta"><span class="chip info">${esc(levelShort(a))}</span>${(a.tags || []).map(x => `<span class="chip">${esc(unitLabel(x))}</span>`).join('')}<span class="small muted">${tf('artWords', { n: wordCount(a) })} · ${tf('artMin', { n: readMinutes(a) })}</span></div>
        ${Z ? `<div class="reader-tools" style="margin-bottom:10px"><div class="seg" role="group" aria-label="${t('newsTransLabel')}" style="margin-left:0"><button class="seg-btn ${showZh ? 'on' : ''}" data-action="readZh" data-v="1" aria-pressed="${showZh}">${t('newsBoth')}</button><button class="seg-btn ${!showZh ? 'on' : ''}" data-action="readZh" data-v="0" aria-pressed="${!showZh}">${t('newsEnOnly')}</button></div>${!view.submitted && !showZh ? `<span class="small muted">${t('readZhHint')}</span>` : ''}</div>` : ''}
        <div class="article-layout">
          <div class="art-left">${showZh ? `<div class="passage passage-zh${practicalText(a) ? '' : ' numbered'}${ui.font === 'clean' ? ' clean' : ''}" id="passage" tabindex="0">${Z.en.map((p, i) => `<div class="rp"><p class="rp-en en">${esc(p)}${sayBtn(p, i)}</p>${Z.zh[i] ? `<p class="rp-zh">${esc(Z.zh[i])}</p>` : ''}</div>`).join('')}</div>`
            : `<div class="passage${practicalText(a) ? '' : ' numbered'}${ui.font === 'clean' ? ' clean' : ''}" id="passage" tabindex="0">${paras}</div>`}
            ${readNotesBox(a)}</div>
          <div class="art-right" id="artQs">${qs}
            ${view.submitted ? scoreHtml : `<div class="action-bar"><button class="btn accent" data-action="submitQuiz">${t('submit')}（${k}/${n}）</button></div>`}</div>
        </div>
      </article>`;
  }

  /* ---- 學習筆記 under a passage, opened on demand: 段落重點 · 關鍵字 (☆ saves the word with its sentence) · 句子解析 ----
     reading-notes.js (window.READING_NOTES, about 700 KB) is loaded the first time a student opens the notes */
  const RN = { status: window.READING_NOTES ? 'ready' : 'idle' };
  function loadReadNotes() {
    if (RN.status !== 'idle') return;
    RN.status = 'loading';
    loadScript('reading-notes.js').then(() => { RN.status = window.READING_NOTES ? 'ready' : 'failed'; }, () => { RN.status = 'failed'; })
      .then(() => { const box = $('#readNotes'); if (box && view.page === 'reading' && view.articleId) { const a = articleById(view.articleId); if (a) { box.outerHTML = readNotesBox(a, true); } } });
  }
  function readNotesBox(a, open) {
    const isOpen = open || view.readNotesOpen === a.id;
    return `<details class="read-notes" id="readNotes"${isOpen ? ' open' : ''}><summary data-action="readNotes" data-id="${esc(a.id)}">${t('rnTitle')}</summary>${isOpen ? readNotesBody(a) : ''}</details>`;
  }
  function readNotesBody(a) {
    if (RN.status === 'idle') loadReadNotes();
    if (RN.status === 'loading') return `<p class="small muted">${t('rnLoading')}</p>`;
    const N = (window.READING_NOTES || {})[a.id], paras = String(a.passage || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const save = (w, zh, p) => saveWordBtn(w, '', zh, sentenceWith(paras[p] || '', w) || paras[p] || '', { k: 'read', ref: a.id, p });
    if (!N || a.edited) { // a teacher's passage: words picked from the 7000-word list, said so
      const words = analyzeStory({ title: '', summary: paras.join('\n') }).words.slice(0, 8);
      return `${RN.status === 'failed' ? `<p class="small muted">${t('rnLoadFail')}</p>` : ''}<p class="small muted">${t('rnAuto')}</p><ul class="rn-words">${words.map(({ v, form }) => `<li><span class="en"><b>${esc(form)}</b></span> <span>${esc(v.zh)}</span>${save(form, v.zh, Math.max(0, paras.findIndex(p => noteRe(form).test(p))))}</li>`).join('')}</ul>`;
    }
    return `<p class="small muted">${t('rnHow')}</p>
      <h3 class="gr-k">${t('rnPoints')}</h3><ol class="rn-points">${N.points.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      <h3 class="gr-k">${t('rnWords')}</h3><p class="small muted">${t('rnWordsHint')}</p>
      <ul class="rn-words">${N.words.map(x => `<li><span class="en"><b>${esc(x.w)}</b></span> <span>${esc(x.zh)}</span>${save(x.w, x.zh, x.p)}</li>`).join('')}</ul>
      <h3 class="gr-k">${t('rnSents')}</h3>${N.sents.map(x => `<div class="rn-sent">${grParse({ en: x.en, zh: x.zh, parts: x.parts })}<p>${esc(x.why)}${x.ch && grById.has(x.ch) ? ` <a class="fb-ch" href="#/grammar/${x.ch}">${esc(tf('fbChapter', { t: grById.get(x.ch).title }))}</a>` : ''}</p></div>`).join('')}`;
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
  // the word drop-down: by level first (A1–C2, with the 7000-word Level and the number of words), then 片語, 統測高頻 3000 and the
  // teacher's own words. The 統測高頻 sets of 100 come in a second drop-down beside it, only while 統測高頻 is chosen.
  const UNIT_LEVELS = [['@A1', 'A1', [1]], ['@A2', 'A2', [2]], ['@B1', 'B1', [3, 4]], ['@B2', 'B2', [5, 6, 7]], ['@C1', 'C1', [8]], ['@C2', 'C2', [9]]];
  function unitCounts() {
    const c = { lv: {}, phrase: 0, custom: 0, hf: 0 };
    for (const v of VOCAB) {
      if (v.type === 'word') c.lv[+v.level] = (c.lv[+v.level] || 0) + 1; else if (v.type === 'phrase') c.phrase++;
      if (!LIBMAP[v.id] || v.override) c.custom++;
      if (HF_RANK[v.id] !== undefined) c.hf++;
    }
    return c;
  }
  function unitSelect(id, val) {
    val = val || '';
    const c = unitCounts(), n = x => x.toLocaleString('en-US'), sum = lvs => lvs.reduce((s, l) => s + (c.lv[l] || 0), 0);
    const hfOn = val === '@hf' || /^@hf:\d+$/.test(val);
    const opt = (u, label) => `<option value="${esc(u)}" ${u === val || (u === '@hf' && hfOn) ? 'selected' : ''}>${label}</option>`;
    const levels = UNIT_LEVELS.filter(x => sum(x[2])).map(([u, cefr, lvs]) => opt(u, tf('unitCefr', { c: cefr, name: t('lvName' + cefr),
      lv: lvs[0] <= 7 ? tf('unitLvRange', { r: lvs.length > 1 ? `${lvs[0]}–${lvs[lvs.length - 1]}` : lvs[0] }) : '', n: n(sum(lvs)) })));
    const custom = units().filter(u => !LIBRARY.some(v => v.unit === u));  // units the teacher named
    const more = [c.phrase ? opt('@phrase', tf('unitPhrases', { n: n(c.phrase) })) : '', HF_SETS ? opt('@hf', '⭐ ' + esc(t('hfGroup'))) : ''].join('');
    // the teacher's words: all of them, then each unit the teacher named
    const own = c.custom || custom.length ? `<optgroup label="${esc(t('presetCustom'))}">${c.custom ? opt('@custom', tf('unitCustom', { n: n(c.custom) })) : ''}${custom.map(u => opt(u, esc(unitLabel(u)))).join('')}</optgroup>` : '';
    const known = ['', '@phrase', '@hf', '@custom'].concat(UNIT_LEVELS.map(x => x[0]), custom);
    // a phrase category sent from the 片語 page, or a choice saved before this list (a single Level, 7000 Level 1–2 …), still shows what it is
    const legacy = !hfOn && !known.includes(val) ? `<optgroup label="${esc(t(/^ph\d+$/.test(val) ? 'libPhrases' : 'unitEarlier'))}">${opt(val, esc(val === '@A' ? t('presetA') : unitLabel(val)))}</optgroup>` : '';
    const main = `<select class="input" id="${id}"><option value="">${t('allWords')}</option><optgroup label="${esc(t('unitByLevel'))}">${levels.join('')}</optgroup>`
      + `${more ? `<optgroup label="${esc(t('unitMore'))}">${more}</optgroup>` : ''}${own}${legacy}</select>`;
    const sets = hfOn && HF_SETS ? `<label class="sr-only" for="${id}Set">${t('hfSetLbl')}</label><select class="input unit-set" id="${id}Set"><option value="@hf" ${val === '@hf' ? 'selected' : ''}>${tf('hfAll', { n: n(c.hf) })}</option>`
      + Array.from({ length: HF_SETS }, (_, i) => `<option value="@hf:${i + 1}" ${val === '@hf:' + (i + 1) ? 'selected' : ''}>${tf('hfSet', { n: i + 1, a: n(i * 100 + 1), b: n(Math.min((i + 1) * 100, window.HIGH_FREQ.length)) })}</option>`).join('') + '</select>' : '';
    return `<div class="unit-pick${sets ? ' two' : ''}">${main}${sets}</div>`;
  }
  // 統測高頻 3000 (highfreq.js): ids in order, most frequent first, in sets of 100
  const HF_RANK = {}; (window.HIGH_FREQ || []).forEach((id, i) => { HF_RANK[id] = i; });
  const HF_SETS = Math.ceil((window.HIGH_FREQ || []).length / 100);
  function inUnit(v, unit) {
    if (!unit) return true;
    if (unit === '@hf') return HF_RANK[v.id] !== undefined;
    if (unit.startsWith('@hf:')) { const r = HF_RANK[v.id], n = +unit.slice(4); return r !== undefined && r >= (n - 1) * 100 && r < n * 100; }
    const lv = +v.level;  // library words edited by the teacher come back from storage with the level as text
    if (unit === '@B1') return v.type === 'word' && (lv === 3 || lv === 4);
    if (unit === '@B2') return v.type === 'word' && (lv === 5 || lv === 6 || lv === 7);
    if (unit === '@A') return v.type === 'word' && (lv === 1 || lv === 2);
    if (unit === '@A1') return v.type === 'word' && lv === 1;
    if (unit === '@A2') return v.type === 'word' && lv === 2;
    if (unit === '@C1') return v.type === 'word' && lv === 8;
    if (unit === '@C2') return v.type === 'word' && lv === 9;
    if (unit === '@phrase') return v.type === 'phrase';
    if (unit === '@custom') return !LIBMAP[v.id] || v.override;
    return v.unit === unit;
  }
  function poolFor(mode, unit) {
    let pool = VOCAB.filter(v => inUnit(v, unit));
    // a broad set (all words, or a level band such as the one picked as 我的程度) only chooses the NEW cards: reviews, missed and
    // bookmarked cards come from everywhere. A narrow set (a Level, a phrase group, a 高頻 set, the teacher's unit) keeps everything inside it.
    const src = !unit || /^@(A[12]?|B1|B2|C1|C2)$/.test(unit) ? VOCAB : pool;
    const td = todayStr(), isDue = v => { const c = state.progress.cards[v.id]; return c && c.seen > 0 && c.due <= td; };
    if (mode === 'due') pool = src.filter(isDue).concat(pool.filter(v => { const c = state.progress.cards[v.id]; return !c || c.seen === 0; }));
    else if (mode === 'dueOnly') pool = src.filter(isDue);
    // new words in 統測高頻 order (most frequent first); words without a rank go last
    else if (mode === 'newHF') pool = pool.filter(v => { const c = state.progress.cards[v.id]; return !c || !c.seen; }).sort((a, b) => (HF_RANK[a.id] ?? 1e9) - (HF_RANK[b.id] ?? 1e9));
    else if (mode === 'unknown') pool = src.filter(v => { const c = state.progress.cards[v.id]; return c && c.wrong > 0 && c.box < 2; });
    else if (mode === 'new') pool = pool.filter(v => !state.progress.cards[v.id] || state.progress.cards[v.id].seen === 0);
    else if (mode === 'bookmark') pool = src.filter(v => isBm('vocab', v.id));
    return pool;
  }

  function pageFlash() {
    if (view.flash) return flashStage();
    if (view.quiz) return quizStage();
    const fs = view.flashSetup, qsu = view.quizSetup;
    fs.mode = 'due'; // the setup is just 單元 · 每輪張數: today's reviews first, then new words from the unit
    const count = poolFor(fs.mode, fs.unit).length;
    return `${subtabs('flashcards')}${pageHead('flashcards', t('flashSub'))}
      <div class="card setup">
        <div class="grid-2">
          <div class="field"><label for="fsUnit">${t('unit')}</label>${unitSelect('fsUnit', fs.unit)}</div>
          <div class="field"><label for="fsLimit">${t('perRound')}</label><select class="input" id="fsLimit">${[10, 20, 30, 50, 100, 0].map(n => `<option value="${n}" ${(fs.limit ?? 30) === n ? 'selected' : ''}>${n ? n : t('allCards')}</option>`).join('')}</select></div>
        </div>
        <div class="row"><span class="muted">${count} ${t('statDueS')}${fs.limit ? ` · ${t('perRound')} ${Math.min(count, fs.limit)}` : ''}</span><span class="spacer"></span><button class="btn accent block-cta" data-action="startFlash" ${count ? '' : 'disabled'} style="font-size:18px;padding:12px 30px">▶ ${t('startPractice')}</button></div>
      </div>
      <h2 class="section-title" id="quizSetup" style="scroll-margin-top:12px">${t('vocabQuiz')}</h2><p class="section-sub">${t('svcQuizP')}</p>
      <div class="card setup">
        <div class="grid-3">
          <div class="field"><label for="qsType">${t('quizType')}</label><select class="input" id="qsType">
            <option value="choice" ${qsu.type === 'choice' ? 'selected' : ''}>${t('quizChoice')}</option>
            <option value="choiceRev" ${qsu.type === 'choiceRev' ? 'selected' : ''}>${t('quizChoiceRev')}</option>
            <option value="spell" ${qsu.type === 'spell' ? 'selected' : ''}>${t('quizSpell')}</option></select></div>
          <div class="field"><label for="qsUnit">${t('unit')}</label>${unitSelect('qsUnit', qsu.unit)}</div>
          <div class="field"><label for="qsCount">${t('quizCount')}</label><input type="number" id="qsCount" min="3" max="50" value="${qsu.count}"></div>
        </div>
        <div class="row"><span class="spacer"></span><button class="btn block-cta" data-action="startQuiz" ${VOCAB.length >= 4 ? '' : 'disabled'} style="font-size:18px;padding:12px 30px">${t('startQuiz')}</button></div>
      </div>`;
  }

  function flashStage() {
    const f = view.flash;
    if (f.idx >= f.queue.length) {
      return `${subtabs('flashcards')}<div class="card center"><h2 tabindex="-1">🎉 ${t('roundDone')}</h2><p style="font-size:20px">${tf('roundStats', { k: f.known.length, d: f.missed.length })}</p>
        <div class="row" style="justify-content:center"><button class="btn accent" data-action="flashAgain">${t('again')}</button>${f.missed.length ? `<button class="btn" data-action="flashMissed">${t('practiceUnknown')}</button>` : ''}<button class="btn ghost" data-action="flashExit">${t('back')}</button></div></div>`;
    }
    const v = VOCAB.find(x => x.id === f.queue[f.idx]);
    if (!v) { f.idx++; return flashStage(); }
    const c = state.progress.cards[v.id] || { box: 0 };
    const ex = v.example ? esc(v.example).replace(new RegExp('(' + v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'i'), '<b>$1</b>') : '';
    const nb = Math.min(3, (c.box || 0) + 1), when = INTERVALS[nb] === 1 ? t('flashTomorrow') : tf('flashInDays', { n: INTERVALS[nb] });
    const onBm = isBm('vocab', v.id);
    return `${subtabs('flashcards')}${sessionTop('flashExit', t('sessionFlash'), `${f.idx + 1} / ${f.queue.length}`, f.idx, f.queue.length, `<span class="st-chip">✓ ${f.known.length}</span>`)}
      <div class="flash-stage">
      <div class="flash-card ${f.flipped ? 'flipped' : ''}" data-action="flip">
        <div class="flash-inner">
          <div class="flash-face flash-front" aria-hidden="${!!f.flipped}"><span class="flash-state">${stateChip(c)}</span><button class="icon-btn flash-bm ${onBm ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${esc(v.id)}" aria-pressed="${onBm}" aria-label="${esc(t('bookmark') + ' ' + v.word)}">${onBm ? '★' : '☆'}</button>
            <div class="flash-word en">${wordBreaks(v.word)}</div><div class="flash-pos">${esc(v.pos || '')}</div>
            <button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}" style="margin-top:14px">${t('speak')}</button>
            <button type="button" class="flash-hint" data-action="flip" aria-expanded="${!!f.flipped}">${t('tapToFlip')}</button></div>
          <div class="flash-face flash-back" aria-hidden="${!f.flipped}"><div class="flash-zh">${esc(v.zh)}</div><div class="flash-pos" style="color:#fff;opacity:.85">${wordBreaks(v.word)} ${esc(v.pos || '')}${v.cefr ? ` · ${esc(v.cefr)}` : ''}</div>${v.syn ? `<div class="flash-syn">≈ ${esc(v.syn)}</div>` : ''}${wordSrcOf(v.id) ? `<div class="flash-example flash-src">${srcLine(v.id, v.word)}</div>` : ex ? `<div class="flash-example">${ex}</div>` : ''}</div>
        </div>
      </div>
      <p class="small muted kbd-hint" style="margin:0">${t('flashKbd')}</p>
      <div class="action-bar"><button class="btn danger two-line" data-action="flashMark" data-known="0">${t('dontKnow')}<small>${t('flashAgainSoon')}</small></button><button class="btn ok two-line" data-action="flashMark" data-known="1">${t('know')}<small>${when}</small></button></div>
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
      let dpool = VOCAB.filter(x => x.type === v.type && x.id !== v.id && x.zh !== v.zh && (v.type !== 'word' || !v.level || Math.abs((x.level || 3) - v.level) <= 1));
      if (dpool.length < 3) dpool = VOCAB.filter(x => x.id !== v.id && x.zh !== v.zh);
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
      return `${subtabs('flashcards')}<div class="card center"><h2 tabindex="-1">📝 ${t('quizDone')}</h2><div class="score-banner"><div class="big">${tf('quizResult', { c: q.correct, t: q.qs.length })}</div></div>
        ${q.wrong.length ? `<div class="list" style="margin-top:14px;text-align:left">${q.wrong.map(w => `<div class="list-item"><div class="grow"><div class="title en">${esc(w.word)}</div><div class="meta">${esc(w.zh)}${w.given ? ` · ${t('typed')}「${esc(w.given)}」` : ''}</div></div></div>`).join('')}</div>` : ''}
        <div class="row" style="justify-content:center;margin-top:14px"><button class="btn accent" data-action="quizAgain">${t('again')}</button><button class="btn ghost" data-action="quizExit">${t('back')}</button></div></div>`;
    }
    const cur = q.qs[q.idx], v = byId(cur.id);
    if (!v) { q.idx++; return quizStage(); }
    const head = subtabs('flashcards') + sessionTop('quizExit', t('sessionQuiz'), `${q.idx + 1} / ${q.qs.length}`, q.idx + (q.answered ? 1 : 0), q.qs.length, `<span class="st-chip">✓ ${q.correct}</span>`);
    let body = '', bar = '';
    if (q.type === 'spell') {
      body = `<div class="quiz-word" style="font-family:var(--font-body)">${esc(v.zh)} <span class="muted" style="font-size:18px">${esc(v.pos || '')}</span></div>
        <input type="text" class="spell-input" id="spellInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${q.answered ? 'disabled' : ''} value="${esc(q.chosen || '')}">
        ${q.answered ? `<div class="center" style="margin-top:12px;font-size:20px">${q.lastOk ? '✅' : '❌'} ${t('answerIs')}<b class="en" style="font-size:26px">${esc(v.word)}</b>${v.syn ? `<div class="muted en">≈ ${esc(v.syn)}</div>` : ''}<div class="muted en">${esc(v.example || '')}</div></div>` : ''}`;
      bar = q.answered ? `<button class="btn accent" data-action="quizNext">${t('next')} ›</button>` : `<button class="btn ghost" data-action="spellSkip">${t('skip')}</button><button class="btn accent" data-action="spellCheck">${t('check')}</button>`;
    } else {
      const rev = q.type === 'choiceRev';
      body = `<div class="quiz-word" ${rev ? 'style="font-family:var(--font-body)"' : ''}>${rev ? esc(v.zh) : wordBreaks(v.word)} ${!rev ? `<button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}">🔊</button>` : `<span class="muted" style="font-size:18px">${esc(v.pos || '')}</span>`}</div>
        <div class="quiz-options">${cur.opts.map(oid => { const o = byId(oid); if (!o) return ''; let cls = 'quiz-opt'; if (q.answered) { if (oid === v.id) cls += ' correct'; else if (q.chosen === oid) cls += ' wrong'; } return `<button class="${cls}" data-action="quizChoose" data-id="${esc(oid)}" ${q.answered ? 'disabled' : ''}><span class="${rev ? 'en' : ''}">${esc(rev ? o.word : o.zh)}</span></button>`; }).join('')}</div>
        ${q.answered ? `<div class="center" style="margin-top:14px"><div class="muted en">${esc(v.word)} ${esc(v.pos || '')}${v.syn ? ` ≈ ${esc(v.syn)}` : ''} — ${esc(v.example || '')}</div></div>` : ''}`;
      bar = q.answered ? `<button class="btn accent" data-action="quizNext">${t('next')} ›</button>` : '';
    }
    return `${head}<div class="card" style="max-width:800px;margin:0 auto">${body}</div>${bar ? `<div class="action-bar">${bar}</div>` : ''}`;
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
    const list = VOCAB.filter(v => inUnit(v, view.vocabUnit) && (!view.vocabBm || isBm('vocab', v.id)) && (!s || v.word.toLowerCase().includes(s) || (v.zh || '').includes(s) || (v.syn || '').toLowerCase().includes(s) || (v.example || '').toLowerCase().includes(s)));
    if (String(view.vocabUnit).startsWith('@hf')) list.sort((a, b) => HF_RANK[a.id] - HF_RANK[b.id]);  // most frequent first
    const PAGE = window.innerWidth <= 640 ? 20 : 50, pages = Math.max(1, Math.ceil(list.length / PAGE));
    view.vocabPage = Math.min(Math.max(0, view.vocabPage || 0), pages - 1);
    const pageList = list.slice(view.vocabPage * PAGE, view.vocabPage * PAGE + PAGE);
    const cur = view.vocabPage, from = list.length ? cur * PAGE + 1 : 0, to = Math.min(list.length, cur * PAGE + PAGE);
    const fmtN = n => n.toLocaleString('en-US');
    // top: a compact ‹ [第 n 頁 ▾] ›; bottom: the full row of page numbers
    const mini = pages > 1 ? `<div class="wb-mini">
      <button class="pg-btn" data-action="vocabGo" data-p="${cur - 1}" ${cur === 0 ? 'disabled' : ''} aria-label="${t('pgPrev')}">‹</button>
      <select class="input pager-sel" aria-label="${t('pgJump')}">${Array.from({ length: pages }, (_, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${tf('pgPageN', { n: i + 1 })} · ${esc((list[i * PAGE] || {}).word || '')}</option>`).join('')}</select>
      <button class="pg-btn" data-action="vocabGo" data-p="${cur + 1}" ${cur >= pages - 1 ? 'disabled' : ''} aria-label="${t('pgNext')}">›</button></div>` : '';
    const pager = pagerHTML(cur, pages, 'vocabGo', i => (list[i * PAGE] || {}).word || '');
    const T = ui.teacher;
    const row = v => {
      if (view.vocabEdit && view.vocabEdit.id === v.id) return vocabEditRow(view.vocabEdit);
      const c = state.progress.cards[v.id] || { box: 0, seen: 0 }, on = isBm('vocab', v.id);
      const sub = [v.pos, v.cefr].filter(Boolean).map(esc).join(' · ');
      return `<tr><td class="bm-cell"><button class="icon-btn bm-star ${on ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${esc(v.id)}" aria-pressed="${on}" aria-label="${esc(t('bookmark') + '：' + v.word)}">${on ? '★' : '☆'}</button></td>
        <td class="word"><span class="wb-w">${esc(v.word)}</span> <button class="icon-btn wb-say" data-action="speak" data-word="${esc(v.word)}" aria-label="${esc(t('listen') + ' ' + v.word)}">🔊</button>${sub ? `<div class="wb-sub">${sub}</div>` : ''}</td>
        <td class="zh">${esc(v.zh)}${v.syn ? `<div class="wb-syn en"><span aria-hidden="true">≈ </span><span class="sr-only">${t('synonyms')}：</span>${esc(v.syn)}</div>` : ''}</td>
        <td class="example">${wordSrcOf(v.id) ? srcLine(v.id, v.word) : esc(v.example || '')}</td>
        <td class="unit">${esc(unitLabel(v.unit))}</td>
        <td class="box">${stateChip(state.progress.cards[v.id])}</td>
        ${T ? `<td class="acts"><button class="btn sm ghost" data-action="editVocab" data-id="${esc(v.id)}" aria-label="${esc(t('edit') + '：' + v.word)}">${t('edit')}</button><button class="btn sm danger" data-action="deleteVocab" data-id="${esc(v.id)}" aria-label="${esc(t('del') + '：' + v.word)}">${t('del')}</button></td>` : ''}</tr>`;
    };
    return `${subtabs('vocab')}${pageHead('vocab', t('vocabSub'))}
      <div class="card wb-tools">
        <div class="wb-filters">
          <label class="sr-only" for="vocabSearch">${t('search')}</label><input type="search" id="vocabSearch" class="wb-search" placeholder="🔍 ${t('search')}" value="${esc(view.vocabSearch)}" enterkeyhint="search" autocapitalize="off" autocorrect="off" spellcheck="false">
          <div class="wb-sel"><label class="sr-only" for="vocabUnit">${t('unit')}</label>${unitSelect('vocabUnit', view.vocabUnit)}</div>
        </div>
        <div class="wb-meta">
          <button class="btn sm ${view.vocabBm ? 'accent' : 'ghost'}" data-action="toggleVocabBm" aria-pressed="${!!view.vocabBm}">🔖 ${t('onlyBookmarks')}</button>
          <span class="small muted wb-count">${list.length ? tf('wbRange', { a: fmtN(from), b: fmtN(to), n: fmtN(list.length) }) : t('wbNone')}</span>
          <span class="spacer"></span>${mini}
          ${T ? `<span class="wb-teach"><button class="btn accent sm" data-action="addVocab">${t('addVocab')}</button><button class="btn sm" data-action="toggleBulk">${t('bulkImport')}</button></span>` : ''}
        </div>
      </div>
      ${view.bulkOpen && ui.teacher ? `<div class="card teacher-only block" style="margin-bottom:12px"><b>${t('bulkTitle')}</b><p class="small muted">${t('bulkHint')}</p>
        <div class="grid-2"><div class="field"><label>${t('unit')}</label><input type="text" id="bulkUnit" placeholder="Unit 5 ..." value="${esc(String(view.vocabUnit).startsWith('@') ? '' : view.vocabUnit)}"></div></div>
        <textarea id="bulkText" placeholder="adventure, n., 冒險, Life is an adventure.&#10;brave | adj. | 勇敢的"></textarea>
        <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn ghost" data-action="toggleBulk">${t('cancel')}</button><button class="btn accent" data-action="bulkImport">${t('importBtn')}</button></div></div>` : ''}
      ${list.length ? `<table class="vocab-table wb-table${T ? ' wb-t' : ''}"><colgroup><col class="c-bm"><col class="c-word"><col class="c-zh"><col class="c-ex"><col class="c-unit"><col class="c-box">${T ? '<col class="c-acts">' : ''}</colgroup>
        <thead><tr><th><span class="sr-only">${t('bookmark')}</span></th><th>${t('word')}</th><th>${t('meaning')}</th><th>${t('example')}</th><th>${t('unit')}</th><th>${t('box')}</th>${T ? `<th>${t('actions')}</th>` : ''}</tr></thead>
        <tbody>${view.vocabEdit && !view.vocabEdit.id ? vocabEditRow(view.vocabEdit) : ''}${pageList.map(row).join('')}</tbody></table>${pager}`
        : `${view.vocabEdit && !view.vocabEdit.id ? `<table class="vocab-table wb-table wb-t"><tbody>${vocabEditRow(view.vocabEdit)}</tbody></table>` : ''}<p class="muted">${t('wbNone')}</p>`}`;
  }
  function vocabEditRow(v) {
    // the same seven columns as a word row: word + 詞性, 中文 + 同義字, 例句, 單元, —, save / cancel
    return `<tr class="wb-edit"><td></td>
      <td><label class="sr-only" for="veWord">${t('word')}</label><input type="text" id="veWord" value="${esc(v.word)}" placeholder="word"><label class="sr-only" for="vePos">${t('pos')}</label><input type="text" id="vePos" value="${esc(v.pos || '')}" placeholder="${t('pos')} (n. / v.)"></td>
      <td><label class="sr-only" for="veZh">${t('meaning')}</label><input type="text" id="veZh" value="${esc(v.zh)}" placeholder="中文"><label class="sr-only" for="veSyn">${t('synonyms')}</label><input type="text" id="veSyn" value="${esc(v.syn || '')}" placeholder="${t('synonyms')}"></td>
      <td><label class="sr-only" for="veEx">${t('example')}</label><input type="text" id="veEx" value="${esc(v.example || '')}" placeholder="example"></td>
      <td><label class="sr-only" for="veUnit">${t('unit')}</label><input type="text" id="veUnit" value="${esc(v.unit || '')}" placeholder="Unit"></td><td></td>
      <td class="acts"><button class="btn sm ok" data-action="saveVocab">${t('save')}</button><button class="btn sm ghost" data-action="cancelVocab">${t('cancel')}</button></td></tr>`;
  }

  /* ---- Progress (student) ---- */
  function masteryBars(progress, vocab) {
    const K = ['new', 'review', 'known'], counts = [0, 0, 0];
    vocab.forEach(v => { counts[K.indexOf(wordState(progress.cards[v.id]))]++; });
    const colors = ['#c9d2e3', '#f2b84b', '#2e9e5b'];
    return [0, 1, 2].map(i => `<div class="bar-row"><div class="lbl">${t('ws_' + K[i])}</div><div class="bar"><div style="width:${vocab.length ? counts[i] / vocab.length * 100 : 0}%;background:${colors[i]}"></div></div><div class="num">${counts[i]}</div></div>`).join('');
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
    return `<h3>${t('quizHistory')}</h3>${rq.length ? `<div class="table-scroll"><table class="vocab-table"><thead><tr><th>${t('date')}</th><th>${t('article')}</th><th>${t('score')}</th></tr></thead><tbody>${rq.map(r => `<tr><td class="small">${fmtDate(r.date)}</td><td>${esc(r.title)}</td><td><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span></td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${t('noData')}</p>`}
      <h3>${t('vocabQuizHistory')}</h3>${vq.length ? `<div class="table-scroll"><table class="vocab-table"><thead><tr><th>${t('date')}</th><th>${t('vocabQuiz')}</th><th>${t('score')}</th></tr></thead><tbody>${vq.map(r => `<tr><td class="small">${fmtDate(r.date)}</td><td>${esc(typeName[r.type] || r.type)}</td><td><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span></td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${t('noData')}</p>`}`;
  }
  /* ---- 學習紀錄: what was opened (已瀏覽), practised (已練習) and mastered (已掌握), accuracy by 考點, mistakes and what is due ---- */
  function studyOverview(P) {
    const op = P.opened || {}, rq = P.readingQuizzes || [], best = {};
    rq.forEach(r => { best[r.articleId] = Math.max(best[r.articleId] || 0, r.total ? r.score / r.total : 0); });
    const arts = ARTICLES.filter(a => !(state.hiddenArticles || []).includes(a.id));
    const readDone = arts.filter(a => best[a.id] != null), readSeen = arts.filter(a => op['r:' + a.id] || best[a.id] != null);
    const gqCh = new Set(Object.keys(P.gq || {}).map(k => k.split(':')[0])), gPract = GR_CH.filter(c => gqCh.has(c.id) || grStatus(c));
    const cards = Object.values(P.cards).filter(c => c.seen > 0), MC = new Set(mcItems().map(x => x.id)), mcq = P.mcq || {}, tr = P.translate || {};
    const mcIds = Object.keys(mcq).filter(id => MC.has(id)), czIds = Object.keys(mcq).filter(id => /^C\d+-\d+$/.test(id));
    return [
      [t('grpRead'), readSeen.length, readDone.length, readDone.filter(a => best[a.id] >= .8).length, arts.length, '#/reading'],
      [t('grpGrammar'), GR_CH.filter(c => op['g:' + c.id] || gqCh.has(c.id) || grStatus(c)).length, gPract.length, GR_CH.filter(c => ((grStatus(c) || {}).best || 0) >= GR_PASS).length, GR_CH.length, '#/grammar'],
      [t('grpWords'), null, cards.length, cards.filter(c => c.box >= 3).length, VOCAB.length, '#/flashcards'],
      [t('tabMcq'), null, mcIds.length, mcIds.filter(id => mcq[id].lastOk).length, mcItems().length, '#/mcq'],
      [t('tabCloze'), null, czIds.length, czIds.filter(id => mcq[id].lastOk).length, clozeSets().reduce((a, c) => a + c.blanks.length, 0), '#/cloze'],
      [t('tabTranslate'), null, Object.keys(tr).length, Object.values(tr).filter(r => r.lastOk).length, trItems().length, '#/translate']];
  }
  // accuracy by 考點: the reviewed notes say what each 選擇題 / 克漏字 item tests; grammar answers by chapter; reading by question type
  function pointStats(P) {
    const cats = {}, chs = {}, add = (m, k, label, n, ok) => { const c = m[k] || (m[k] = { label, n: 0, ok: 0, k }); c.n += n; c.ok += ok; };
    const MCT = new Map(mcItems().map(x => [x.id, x.type]));
    Object.entries(P.mcq || {}).forEach(([id, r]) => {
      const n = NOTES[id], c = n ? n.c : MCT.get(id) === 'dialogue' ? 'dialogue' : MCT.get(id) === 'grammar' ? 'grammar' : 'vocab';
      add(cats, c, t('pc_' + c), r.tries, r.ok);
      if (n && n.ch && grById.has(n.ch)) add(chs, n.ch, grById.get(n.ch).title, r.tries, r.ok);
    });
    Object.entries(P.gq || {}).forEach(([id, r]) => { const x = grRef(id); if (!x || !grById.has(x.id)) return; add(cats, 'grammar', t('pc_grammar'), r.tries, r.ok); add(chs, x.id, grById.get(x.id).title, r.tries, r.ok); });
    Object.values(P.translate || {}).forEach(r => add(cats, 'translate', t('pc_translate'), r.tries, r.ok));
    (P.readingQuizzes || []).forEach(q => (q.answers || []).forEach(a => { const art = articleById(q.articleId), qq = art && art.questions[a.qi]; if (!qq) return; const k = 'rt_' + readType(qq.q); add(cats, k, t(k), 1, a.chosen === a.correct ? 1 : 0); }));
    const pct = c => c.n ? Math.round(c.ok / c.n * 100) : 0;
    return { cats: Object.values(cats).sort((a, b) => b.n - a.n), chs: Object.values(chs).filter(c => c.n >= 2).sort((a, b) => pct(a) - pct(b)), pct };
  }
  function recordsTop(P) {
    const ov = studyOverview(P), ps = pointStats(P), wb = wrongBook(P), due = dueCards().length;
    const bar = (c, pct) => `<span class="pt-bar" aria-hidden="true"><i class="${pct >= 80 ? 'ok' : pct >= 60 ? 'warn' : 'bad'}" style="width:${pct}%"></i></span>`;
    const row = c => { const p = ps.pct(c); return `<tr><th scope="row">${esc(c.label)}</th><td>${c.n}</td><td>${bar(c, p)} ${p}%</td></tr>`; };
    const wbBy = WB_SRC.map(([k, l]) => [t(l), wb.filter(x => x.src === k).length]).filter(x => x[1]);
    const maxW = Math.max(1, ...wbBy.map(x => x[1]));
    return `${syncBox()}
      <div class="card rec-ov"><h2 class="rec-h">${t('recOverview')}</h2>
        <div class="table-scroll"><table class="rec-table"><thead><tr><th scope="col"></th><th scope="col">${t('recSeen')}</th><th scope="col">${t('recDone')}</th><th scope="col">${t('recMastered')}</th><th scope="col">${t('recTotal')}</th></tr></thead>
        <tbody>${ov.map(([l, a, b, c, n, href]) => `<tr><th scope="row"><a href="${href}">${esc(l)}</a></th><td>${a == null ? '—' : a}</td><td>${b}</td><td>${c}</td><td class="muted">${n}</td></tr>`).join('')}</tbody></table></div>
        <p class="small muted">${t('recDefs')}</p></div>
      <div class="rec-grid">
        <div class="card"><h2 class="rec-h">${t('recByPoint')}</h2>${ps.cats.length ? `<table class="rec-table pt"><thead><tr><th scope="col">${t('fbPoint')}</th><th scope="col">${t('recAnswers')}</th><th scope="col">${t('accShort')}</th></tr></thead><tbody>${ps.cats.map(row).join('')}</tbody></table>
          ${ps.chs.length ? `<h3 class="gr-k">${t('recWeakCh')}</h3><table class="rec-table pt"><tbody>${ps.chs.slice(0, 6).map(c => { const p = ps.pct(c); return `<tr><th scope="row"><a href="#/grammar/${c.k}">${esc(c.label)}</a></th><td>${c.n}</td><td>${bar(c, p)} ${p}%</td></tr>`; }).join('')}</tbody></table>` : ''}` : `<p class="muted">${t('recNoAnswers')}</p>`}</div>
        <div class="card"><h2 class="rec-h">${t('recMistakes')}</h2>${wbBy.length ? `<div class="wb-dist">${wbBy.map(([l, n]) => `<div class="bar-row"><div class="lbl">${esc(l)}</div><div class="bar"><div style="width:${n / maxW * 100}%;background:var(--bad)"></div></div><div class="num">${n}</div></div>`).join('')}</div><p><a class="btn sm" href="#/wrong">${t('tabWrong')} →</a></p>` : `<p class="muted">${t('wbEmpty')}</p>`}
          <h2 class="rec-h">${t('homeReview')}</h2><ul class="rec-due"><li>${tf('recDueWords', { n: due })}${due ? ` <button type="button" class="btn sm ghost" data-action="goFlash" data-mode="dueOnly">${t('startPractice')}</button>` : ''}</li><li>${tf('recDueWrong', { n: wb.length })}</li><li>${tf('recDueGram', { n: GR_CH.filter(c => { const r = grStatus(c); return r && r.best < GR_PASS; }).length })}</li></ul></div>
      </div>`;
  }
  function pageProgress() {
    const p = state.progress;
    const total = Object.values(p.days).reduce((a, b) => a + b, 0);
    return `${subtabs('progress')}${pageHead('progress', t('progressSub'))}
      ${recordsTop(p)}
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
  // 單字卡 and 單字小考 for the report: words studied, how many the student remembered last time, the latest quizzes
  const QUIZ_NAME = { choice: 'quizChoice', choiceRev: 'quizChoiceRev', spell: 'quizSpell' };
  function wordStats(progress) {
    const seen = Object.values(progress.cards).filter(c => c.seen > 0), known = seen.filter(c => c.box > 0).length;
    return { seen: seen.length, known, learning: seen.length - known, quizzes: progress.vocabQuizzes.slice(-5).reverse() };
  }
  function reportHTML(progress, name) {
    const A = analyzeReport(progress, name), T = trStats(progress), W = wordStats(progress);
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
      <h2>${t('reportWords')}</h2>
      ${W.seen || W.quizzes.length ? `<div class="pr-words"><span><b>${t('reportCardsSeen')}</b> ${W.seen}</span><span><b>${t('reportCardsKnown')}</b> ${W.known}</span><span><b>${t('reportCardsLearning')}</b> ${W.learning}</span></div>
        ${W.quizzes.length ? `<table class="pr-table"><tr><th>${t('reportWhen')}</th><th>${t('reportQuizzes')}</th><th>${t('reportScore')}</th></tr>${W.quizzes.map(r => `<tr><td>${fmtDate(r.date)}</td><td>${t(QUIZ_NAME[r.type] || 'quizChoice')}</td><td>${r.score} / ${r.total}</td></tr>`).join('')}</table>` : ''}` : `<p class="pr-none">${t('noData')}</p>`}
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
    const A = analyzeReport(progress, name), T = trStats(progress), W = wordStats(progress);
    const mastered = VOCAB.filter(v => (progress.cards[v.id] || {}).box === 3).length;
    return [
      `${t('reportTitle')} — ${name} (${todayStr()})`,
      `${t('streak')}: ${streak(progress)} ${t('streakDays')} · ${t('totalActivity')} ${A.total} · ${t('lastActive')}: ${A.last || t('never')}`,
      `${t('avgReading')}: ${A.avg === null ? '—' : A.avg + '%'} (${t('readingDone')} ${A.rq.length})`,
      `${t('statMastered')}: ${mastered} / ${VOCAB.length}`,
      W.seen ? `${t('reportWords')}: ${t('reportCardsSeen')} ${W.seen} · ${t('reportCardsKnown')} ${W.known} · ${t('reportCardsLearning')} ${W.learning}` : '',
      W.quizzes.length ? `${t('reportQuizzes')}: ` + W.quizzes.map(r => `${r.score}/${r.total}`).join(', ') : '',
      T.done ? `${t('reportTranslate')}: ${T.right} / ${T.done}` : '',
      (() => { const M = mcStats(progress); return M.done ? `${t('tabMcq')}: ${M.right} / ${M.done}` : ''; })(),
      A.wrongs.length ? `${t('wrongAnalysis')}: ` + A.wrongs.slice(0, 5).map(w => w.q).join(' | ') : '',
      A.weakList.length ? `${t('weakWords')}: ` + A.weakList.slice(0, 10).map(w => w.word).join(', ') : '',
    ].filter(Boolean).join('\n');
  }
  // a drawn report is blank when (almost) every sampled pixel is white
  function blankCanvas(c) {
    if (!c || !c.width || !c.height) return true;
    try {
      const w = 60, h = Math.max(1, Math.round(60 * c.height / c.width)), s = document.createElement('canvas'); s.width = w; s.height = h;
      const g = s.getContext('2d'); g.drawImage(c, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data;
      let ink = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && d[i] + d[i + 1] + d[i + 2] < 690) ink++;
      return ink < 20;
    } catch (e) { return false; } // cannot look: trust it
  }
  async function makeReportPDF(name) {
    const lib = await loadPdfLib();
    const stage = document.createElement('div'); stage.className = 'pdf-stage'; stage.innerHTML = reportHTML(state.progress, name);
    document.body.appendChild(stage);
    const y = window.scrollY;
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      for (const [i, scale] of [2, 1.5].entries()) {
        if (i) window.scrollTo(0, 0);
        const w = lib().set({
          margin: [10, 10, 12, 10], image: { type: 'jpeg', quality: 0.92 },
          html2canvas: { scale, backgroundColor: '#ffffff', useCORS: true, scrollX: 0, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.pr-item', 'tr', '.pr-stats', '.pr-bars'] },
        }).from(stage.firstElementChild).toCanvas();
        if (blankCanvas(await w.get('canvas'))) continue;
        return await w.toPdf().outputPdf('blob');
      }
      throw new Error('blank');
    } finally { stage.remove(); if (window.scrollY !== y) window.scrollTo(0, y); }
  }
  const canShareFiles = () => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] })); } catch (e) { return false; } };
  function reportCard() {
    if (view.reportBusy) return `<div class="card report-card"><p style="margin:0">⏳ ${t('pdfMaking')}</p></div>`;
    const r = view.report; if (!r) return '';
    const share = canShareFiles();
    const direct = cloud.configured, inBox = direct && ui.user && ui.user.cloud; // logged in: both emails sit in the 直接寄給老師 box
    return `<div class="card report-card" id="reportCard"><h3 style="margin-top:0">📄 ${t('pdfReady')}</h3>
      ${inBox ? '' : teacherEmailField()}
      ${direct ? mailBoxHTML() : ''}
      ${direct ? `<p class="small muted mail-other">${t('mailOther')}</p>` : ''}
      <div class="row">
        ${share ? `<button class="btn ${direct ? '' : 'accent'}" data-action="sharePdf">📤 ${t('sharePdf')}</button>` : ''}
        <button class="btn ${share || direct ? '' : 'accent'}" data-action="mailPdf">📧 ${t(direct ? 'emailTeacherApp' : 'emailTeacher')}</button>
        <a class="btn ghost" href="${r.url}" download="${esc(r.name)}">⬇️ ${t('downloadPdf')}</a>
        <a class="btn ghost" href="${r.url}" target="_blank" rel="noopener">👀 ${t('previewPdf')}</a>
        <button class="btn ghost sm" data-action="exportJson">${t('exportJson')}</button>
      </div>
      <p class="small muted" style="margin:8px 0 0">${t(share ? 'shareHintPdf' : direct ? 'mailHintPdfApp' : 'mailHintPdf')}</p></div>`;
  }
  // 📨 直接寄給老師 (cloud mode): the student's own email for the teacher's reply, an optional message, and one button.
  // supabase/functions/send-report sends it, only to a teacher account of this site and a few times a day.
  function mailBoxHTML() {
    const m = view.mail || {};
    if (!ui.user || !ui.user.cloud) return `<div class="mail-box" id="mailBox"><p class="small" style="margin:0">📨 ${t('mailLoginFirst')}</p>
      <button type="button" class="btn sm accent" data-action="openAuth">👤 ${t('login')}</button></div>`;
    const status = m.sending ? `⏳ ${t('mailSending')}` : m.sentTo ? tf('mailSent', { e: esc(m.sentTo) }) : m.err ? `⚠️ ${tf('mailErr_' + (MAIL_ERRS.includes(m.err) ? m.err : 'other'), { n: m.limit || 5 })}` : '';
    return `<div class="mail-box" id="mailBox"><h4>📨 ${t('mailDirectTitle')}</h4>
      ${teacherEmailField(view.mailTo)}
      <div class="field"><label for="myEmailInput">${t('mailMyEmail')}</label><input type="email" id="myEmailInput" value="${esc(view.mailFrom != null ? view.mailFrom : (ui.user.email || ''))}" autocomplete="email" inputmode="email"></div>
      <div class="field"><label for="mailMsg">${t('mailMsgLbl')}</label><textarea id="mailMsg" rows="2" maxlength="500">${esc(view.mailMsg || '')}</textarea></div>
      <div class="row"><button type="button" class="btn accent" data-action="mailDirect" ${m.sending ? 'aria-disabled="true"' : ''}>📨 ${t(m.sending ? 'mailSending' : 'mailSend')}</button>
        <span class="small mail-status ${m.err ? 'bad' : m.sentTo ? 'ok' : ''}" role="status">${status}</span></div></div>`;
  }
  const teacherEmailField = v => `<div class="field"><label for="teacherEmailInput">${t('teacherEmail')}</label><input type="email" id="teacherEmailInput" value="${esc(v != null ? v : state.settings.teacherEmail || '')}" placeholder="teacher@example.com" autocomplete="off" inputmode="email"></div>`;
  const MAIL_ERRS = ['not_configured', 'not_teacher', 'rate_user', 'rate_site', 'login', 'bad_to', 'bad_reply', 'bad_pdf'];
  // only the mail box is redrawn, so nothing typed elsewhere on the page is lost
  function refreshMailBox() {
    const box = $('#mailBox'); if (!box) return;
    const a = document.activeElement, had = a && box.contains(a) ? a.id || a.dataset.action : null;
    const val = (id, keep) => { const el = $('#' + id); return el ? el.value : keep; };
    view.mailTo = val('teacherEmailInput', view.mailTo); view.mailFrom = val('myEmailInput', view.mailFrom); view.mailMsg = val('mailMsg', view.mailMsg);
    box.outerHTML = mailBoxHTML();
    const back = had && ($('#' + had) || $(`#mailBox [data-action="${had}"]`)); if (back) back.focus({ preventScroll: true });
  }
  const blobToB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });
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
    // a teacher account whose role the server has not confirmed yet in this visit (offline, or still loading)
    if (ui.user && ui.user.role === 'teacher') return `${pageHead('students')}<div class="card gate"><h2>${t('teacherChecking')}</h2><p class="muted">${t('teacherCheckingSub')}</p></div>`;
    return `${pageHead('students')}<div class="card gate"><div class="big-icon">🔒</div><h2>${t('teacherOnly')}</h2><p class="muted">${t('teacherOnlySub')}</p><button class="btn accent" data-action="openAuth" style="font-size:18px;padding:12px 30px">${t('loginNow')}</button></div>`;
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
    return `${subtabs('students')}${pageHead('students', t('studentsSub'))}
      <div class="card"><div class="row">
        <div class="field" style="margin:0;min-width:260px"><label>${t('source')}</label><select class="input" id="studentSource"><option value="local" ${src === 'local' ? 'selected' : ''}>${t('localDevice')}</option>${view.cloudStudents.map(r => `<option value="${esc(r.id)}" ${src === r.id ? 'selected' : ''}>☁️ ${esc(r.name)}${r.exportedAt ? ' · ' + fmtDate(r.exportedAt) : ''}</option>`).join('')}${reports.map(r => `<option value="${esc(r.id)}" ${src === r.id ? 'selected' : ''}>📄 ${esc(r.name)} · ${fmtDate(r.exportedAt)}</option>`).join('')}</select></div>
        <span class="spacer"></span>
        ${cloud.enabled ? `<button class="btn" data-action="loadCloud">${t('loadCloud')}</button>` : `<span class="small muted">${t('cloudOff')}</span>`}
        <label class="btn"><span>${t('importReport')}</span><input type="file" id="reportFile" accept="application/json" style="display:none"></label>
        ${src !== 'local' && !src.startsWith('cloud_') ? `<button class="btn danger sm" data-action="deleteReport" data-id="${esc(src)}">${t('deleteReport')}</button>` : ''}
      </div></div>
      <div class="stat-grid">
        <div class="stat-card"><div class="k">${t('reportFrom')}</div><div class="v" style="font-size:22px">${esc(rep.name)}</div><div class="s">🎯 ${t('lvStudent')} ${lvOf(rep.progress) || '—'}${rep.exportedAt ? ' · ' + t('exportedAt') + ' ' + fmtDate(rep.exportedAt) : ''}</div></div>
        <div class="stat-card"><div class="k">${t('lastActive')}</div><div class="v" style="font-size:22px">${A.last || t('never')}</div><div class="s">🔥 ${t('streak')} ${streak(rep.progress)} ${t('streakDays')} · ${t('totalActivity')} ${A.total}</div></div>
        <div class="stat-card"><div class="k">${t('avgReading')}</div><div class="v">${A.avg === null ? '—' : A.avg + '%'}</div><div class="s">${t('readingDone')} ${A.rq.length}</div></div>
        <div class="stat-card"><div class="k">${t('statMastered')}</div><div class="v">${mastered} <span class="small muted">/ ${VOCAB.length}</span></div><div class="s">${t('notYetStudied')} ${A.notStudied.length}</div></div>
      </div>
      <div class="card" style="margin-top:14px"><h3 style="margin-top:0">❌ ${t('wrongAnalysis')}</h3>
        ${A.wrongs.length ? `<div class="list">${A.wrongs.map(w => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="meta">${esc(w.title)}</div><div class="title" style="font-size:16px">${esc(w.q)}</div>
          <div class="small">${t('studentChose')}：<span class="chip bad">${w.chosen.map(esc).join('</span> <span class="chip bad">')}</span> → ${t('correctIs')}：<span class="chip ok">${esc(w.correct)}</span></div>${w.explain ? `<div class="small muted">${esc(w.explain)}</div>` : ''}</div><span class="chip bad">${tf('wrongTimes', { n: w.n })}</span></div>`).join('')}</div>` : `<p class="muted">${t('noWrong')}</p>`}
      </div>
      <div class="card"><h3 style="margin-top:0">🧠 ${t('weakWords')}</h3>
        ${A.weakList.length ? `<ul class="weak-list">${A.weakList.map(w => `<li><div class="wl-word"><b class="en">${esc(w.word)}</b><span class="wl-zh">${esc(w.zh)}</span></div>
          <div class="wl-info">${w.missed ? `<span class="chip bad">${t('flashRound')} · ${tf('missedTimes', { n: w.missed })}</span>` : ''}${w.quiz ? `<span class="chip warn">${tf('quizWrongTimes', { n: w.quiz })}</span>` : ''}${stateChip({ seen: 1, box: w.box || 0, due: '9999' })}${w.typed.length ? `<span class="small muted">${t('typed')} <span class="en">${w.typed.map(esc).join(', ')}</span></span>` : ''}</div></li>`).join('')}</ul>` : `<p class="muted">${t('noWeak')}</p>`}
      </div>
      ${(() => { const M = mcStats(rep.progress); return M.done ? `<div class="card"><h3 style="margin-top:0">📝 ${t('tabMcq')} <span class="small muted">${M.right} / ${M.done}</span></h3>
        <div class="row">${MC_TYPES.map(([k, l, ic]) => { const b = M.byType[k]; return b.done ? `<span class="chip ${b.right / b.done >= .8 ? 'ok' : b.right / b.done >= .6 ? 'warn' : 'bad'}">${ic} ${t(l)} ${b.right}/${b.done}</span>` : ''; }).join('')}</div>
        ${M.wrong.length ? `<div class="list" style="margin-top:10px">${M.wrong.slice(0, 20).map(u => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="title en" style="font-size:15px">${mcQ(u.q)}</div><div class="small">${t('studentChose')}：<span class="chip bad en">${u.chosenIdx != null ? esc(u.options[u.chosenIdx]) : '—'}</span> → ${t('correctIs')}：<span class="chip ok en">${esc(u.options[u.answer])}</span></div></div><span class="chip bad">${tf('wrongTimes', { n: u.wrongTimes })}</span></div>`).join('')}</div>` : ''}</div>` : ''; })()}
      ${(() => { const T = trStats(rep.progress); return T.done ? `<div class="card"><h3 style="margin-top:0">✍️ ${t('reportTranslate')} <span class="small muted">${T.right} / ${T.done} · ${tf('trDoneOf', { n: T.done, t: T.total })}</span></h3>${T.wrong.length ? `<div class="list">${T.wrong.slice(0, 20).map(x => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="title" style="font-size:16px">${esc(x.zh)}</div><div class="small en">${t('trYours')}：<span class="chip bad">${esc(x.answer || '—')}</span></div><div class="small en">${t('trModel')}：<span class="chip ok">${esc(x.en)}</span></div></div><span class="chip bad">${tf('wrongTimes', { n: x.tries - x.ok })}</span></div>`).join('')}</div>` : `<p class="muted">${t('trAllRight')}</p>`}</div>` : ''; })()}
      ${(() => { const b = rep.progress.bookmarks || { vocab: [], articles: [] }; const ws = b.vocab.map(id => VOCAB.find(v => v.id === id)).filter(Boolean); const as = b.articles.map(articleById).filter(Boolean); return (ws.length || as.length) ? `<div class="card bookmark-card"><span class="ribbon">🔖</span><h3 style="margin-top:0">${t('bookmarks')}</h3>${as.length ? `<div class="bm-group"><b>📖 ${t('bookmarkedArticles')}</b><div class="bm-list">${as.map(a => `<span class="bm-tag">${esc(a.title)}</span>`).join('')}</div></div>` : ''}${ws.length ? `<div class="bm-group"><b>🔤 ${t('bookmarkedWords')}</b><div class="bm-list">${ws.map(v => `<span class="bm-tag word en">${esc(v.word)}<small>${esc(v.zh)}</small></span>`).join('')}</div></div>` : ''}</div>` : ''; })()}
      <div class="card"><h3 style="margin-top:0">${t('mastery')}</h3>${masteryBars(rep.progress, VOCAB)}<h3>${t('activity')}</h3>${heatmap(rep.progress)}
        <h3>${t('timeline')}</h3>${A.timeline.length ? `<div class="list">${A.timeline.map(x => `<div class="list-item"><span class="small muted">${fmtDate(x.date)}</span><span>${esc(x.text)}</span></div>`).join('')}</div>` : `<p class="muted">${t('noData')}</p>`}</div>`;
  }

  function cloudAccountsCard() {
    const list = view.cloudAccounts;
    const head = `<h3 style="margin-top:0">👥 ${t('accountsAll')} <span class="cloud-badge">☁️ Supabase</span></h3>`;
    if (!list) return `<div class="card">${head}<p class="small muted">${t('accountsAllSub')}</p><button class="btn" data-action="loadAccounts">${t('loadAccounts')}</button></div>`;
    const nT = list.filter(a => a.role === 'teacher').length;
    return `<div class="card">${head}<div class="row"><span class="small">${tf('accountsCount', { n: list.length, s: list.length - nT, t: nT })}</span><span class="spacer"></span><button class="btn sm" data-action="loadAccounts">🔄</button></div>
      ${list.length ? `<div class="list acct-list">${list.map(a => `<div class="list-item"><div class="grow"><div class="title">${esc(a.name || a.email)} <span class="chip ${a.role === 'teacher' ? 'warn' : 'info'}">${a.role === 'teacher' ? t('roleTeacher') : t('roleStudent')}</span></div><div class="meta en">${esc(a.email)}</div><div class="meta">${t('registeredAt')} ${fmtDate(a.created)} · ${t('lastPractice')} ${a.last ? fmtDate(a.last) : t('never')}</div></div></div>`).join('')}</div>` : `<p class="muted">${t('noAccounts')}</p>`}
      <p class="small muted" style="margin-bottom:0">${t('accountsAllNote')}</p></div>`;
  }

  /* ---- Settings ---- */
  // 🔊 發音聲音: 男聲 / 女聲 for this device, a 試聽 button, and which voice the device will actually use
  function voiceCard() {
    const has = hasTTS(), v = has ? voiceFor('en-US') : null, en = has ? speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang || '')) : [];
    const known = voiceKnown(), phoneOnly = sysVoice && !known; // Android: the phone decides, so no 男聲/女聲 buttons
    const note = !has ? t('voiceNone') : v ? tf('voiceUsing', { v: esc(v.name.replace(/\s+-\s+.*$/, '') || v.name), l: esc(v.lang) })
      : sysVoice ? t('voiceAndroid') : !en.length ? t(SP.voicesSeen() ? 'voiceNone' : 'voiceDefault') : !known ? t('voiceUnknown') : t(ui.voice === 'f' ? 'voiceNoF' : 'voiceNoM');
    return `<div class="card voice-set"><h3 style="margin-top:0">🔊 ${t('voiceTitle')}</h3><p class="small muted">${t('voiceSub')}</p>
      <div class="voice-row">${phoneOnly ? '' : `<div class="px-chips" role="group" aria-label="${t('voiceTitle')}">${[['m', '👨 ' + t('voiceMale')], ['f', '👩 ' + t('voiceFemale')]].map(([k, l]) => `<button type="button" class="px-chip ${(ui.voice === 'f' ? 'f' : 'm') === k ? 'on' : ''}" data-action="setVoice" data-v="${k}" aria-pressed="${(ui.voice === 'f' ? 'f' : 'm') === k}">${l}</button>`).join('')}</div>`}
        <button type="button" class="btn sm ghost" data-action="voiceTest" ${has ? '' : 'disabled'}>▶ ${t('voiceTest')}</button></div>
      ${has ? `<div class="voice-row"><span class="px-lbl" id="vRate">${t('voiceRate')}</span><div class="px-chips" role="group" aria-labelledby="vRate">${[[0.75, t('rateSlow')], [0.9, t('rateNormal')], [1, t('rateFast')]].map(([r, l]) => `<button type="button" class="px-chip ${(ui.rate || 0.9) === r ? 'on' : ''}" data-action="setRate" data-v="${r}" aria-pressed="${(ui.rate || 0.9) === r}">${l}</button>`).join('')}</div></div>` : ''}
      ${has && !sysVoice && SP.englishVoices().length > 1 ? `<div class="voice-row"><label class="px-lbl" for="voicePick">${t('voicePick')}</label><select id="voicePick" class="input voice-pick"><option value="">${t('voicePickAuto')}</option>${SP.englishVoices().map(x => `<option value="${esc(SP.vkey(x))}"${ui.voiceURI === SP.vkey(x) ? ' selected' : ''}>${esc(x.name)} (${esc(x.lang)})${x.localService === false ? ' · ' + esc(t('voiceOnline')) : ''}</option>`).join('')}</select></div>` : ''}
      ${note ? `<p class="small muted voice-note">${note}</p>` : ''}${isIOS && has ? `<p class="small muted voice-note voice-ios">${t('voiceIOSNote')}</p>` : ''}</div>`;
  }
  function refreshVoiceCard(focusV) {
    const c = $('#app .voice-set'); if (!c) return;
    const a = document.activeElement, keep = a && c.contains(a) ? a.dataset.v || a.dataset.action : null;
    c.outerHTML = voiceCard();
    const k = focusV || keep, b = k && ($(`#app .voice-set [data-v="${k}"]`) || $(`#app .voice-set [data-action="${k}"]`)); if (b) b.focus({ preventScroll: true });
  }
  function pageSettings() {
    const s = state.settings, T = ui.teacher, me = (ui.user && ui.user.email) || '';
    // the exam name is the teacher's to set; students still choose their exam date
    return `${pageHead('settings', t(T ? 'settingsSubT' : 'settingsSub'))}${syncBox()}
      <div class="card level-set"><h3 style="margin-top:0">🎯 ${t('lvMine')}</h3><p class="small muted">${t('lvPickSub')}</p>${levelOptions()}</div>
      ${voiceCard()}
      <div class="card tour-again"><div><h3 style="margin:0">🧭 ${t('tourAgain')}</h3><p class="small muted" style="margin:4px 0 0">${t('tourAgainSub')}</p></div><button type="button" class="btn" data-action="tourStart">${t('tourStart')}</button></div>
      <div class="card">
        <div class="grid-2">
          ${T ? `<div class="field"><label for="stExamName">${t('examName')}</label><input type="text" id="stExamName" value="${esc(s.examName)}"></div>
          <div class="field"><label for="stExamNameEn">${t('examNameEn')}</label><input type="text" id="stExamNameEn" value="${esc(s.examNameEn || '')}"></div>` : ''}
          <div class="field"><label for="stExamDate">${t('examDate')}</label><input type="date" id="stExamDate" value="${esc(s.examDate)}"></div>
          ${T ? `<div class="field"><label for="stTeacherEmail">${t('teacherEmailMine')}</label><input type="email" id="stTeacherEmail" value="${esc(s.teacherEmail || '')}" placeholder="${esc(me || 'teacher@example.com')}" inputmode="email" aria-describedby="stTeacherEmailNote"><p class="small muted field-note" id="stTeacherEmailNote">${t(!cloud.configured ? 'teacherEmailLocal' : s.teacherEmail ? 'teacherEmailMineNote' : 'teacherEmailUnsaved')}</p>${!s.teacherEmail && me ? `<button type="button" class="btn sm ghost" data-action="useMyEmail">✉️ ${t('useMyEmail')}</button>` : ''}</div>`
            : `<div class="field"><label for="stStudent">${t('studentName')}</label><input type="text" id="stStudent" value="${esc(s.studentName || '')}"></div>
          <div class="field"><label for="stTeacherEmail">${t('teacherEmail')}</label><input type="email" id="stTeacherEmail" value="${esc(s.teacherEmail || '')}" placeholder="teacher@example.com" inputmode="email"></div>`}
        </div>
        ${T ? '' : `<p class="small muted" style="margin:0 0 12px">🔒 ${t('teacherSetsNote')}</p>`}
        ${T ? `<div class="field teacher-only block"><label>${t('inviteCodeLbl')}</label><input type="text" id="stCode" value="${esc(cloud.configured ? cloud.teacherCode : (s.teacherCode || ''))}" autocomplete="off"${cloud.configured ? ` placeholder="${t('inviteCodeCloudPh')}"` : ''}></div>` : ''}
        <div class="row">${T ? '' : `<span class="muted small">${t('teacherHint')}</span>`}<span class="spacer"></span><button class="btn accent" data-action="saveSettings">${t('save')}</button></div>
      </div>
      <div class="card"><h3 style="margin-top:0">${t('dataTitle')}</h3><p class="small muted">${t('dataSub')}</p>
        <div class="row">
          <button class="btn" data-action="exportAll">${t('exportAll')}</button>
          <button class="btn" data-action="exportContent">${t('exportContent')}</button>
          <label class="btn ghost"><span>${t('importData')}</span><input type="file" id="importFile" accept="application/json" style="display:none"></label>
          <span class="small">${t('importMode')}</span><select class="input" id="importMode" style="width:auto" aria-label="${esc(t('importMode'))}"><option value="merge">${t('importMerge')}</option><option value="replace">${t('importReplace')}</option></select>
        </div>
        ${ui.teacher ? `<div class="row teacher-only flex" style="margin-top:12px"><button class="btn danger sm" data-action="resetAll">${t('resetAll')}</button></div>` : ''}
      </div>
      ${ui.teacher && cloud.configured ? cloudAccountsCard() : ''}
      ${ui.teacher && !cloud.configured ? `<div class="card"><h3 style="margin-top:0">👥 ${t('accountsTitle')} <span class="cloud-badge">${t('localOnly')}</span></h3>
        ${state.accounts.length ? `<div class="table-scroll"><table class="vocab-table"><thead><tr><th>${t('email')}</th><th>${t('displayName')}</th><th>${t('role')}</th><th></th></tr></thead><tbody>${state.accounts.map(a => `<tr><td>${esc(a.email)}</td><td>${esc(a.name)}</td><td><span class="chip ${a.role === 'teacher' ? 'warn' : 'info'}">${a.role === 'teacher' ? t('roleTeacher') : t('roleStudent')}</span></td><td>${ui.user && ui.user.id === a.id ? '' : `<button class="btn sm danger" data-action="deleteAccount" data-id="${esc(a.id)}">${t('deleteAccount')}</button>`}</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${t('noAccounts')}</p>`}</div>` : ''}`;
  }

  /* ---------------- Render ---------------- */
  const PAGES = { home: pageHome, reading: pageReading, flashcards: pageFlash, vocab: pageVocab, phrases: pagePhrases, translate: pageTranslate, mcq: pageMcq, grammar: pageGrammar, news: pageNews, progress: pageProgress, wrong: pageWrong, students: pageStudents, settings: pageSettings };
  // a practice session is on screen: on phones the header, tabs and bottom bar step aside (focus mode)
  function inSessionNow() {
    const p = view.page;
    return (p === 'flashcards' && !!((view.flash && view.flash.idx < view.flash.queue.length) || (!view.flash && view.quiz && view.quiz.idx < view.quiz.qs.length)))
      || (p === 'mcq' && !!view.mc && !view.mc.done)
      || (p === 'translate' && !!view.tr && view.tr.i < view.tr.ids.length)
      || (p === 'reading' && !!view.articleId && !view.submitted && !view.editing);
  }
  // [page, category] of each unfinished session the student has stepped away from (its tab and category get a dot);
  // 選擇題 and 克漏字 share a page, so the round of the one not on screen waits in view.mcPark
  function livePlaces() {
    const out = [], un = s => !!s && !s.done, park = view.mcPark || {};
    if (un(view.mc)) out.push(['mcq', view.mc.kind === 'cloze' ? 'cloze' : 'mcq']);
    if (un(park.items)) out.push(['mcq', 'mcq']);
    if (un(park.cloze)) out.push(['mcq', 'cloze']);
    if (view.tr && view.tr.i < view.tr.ids.length) out.push(['translate', 'translate']);
    if ((view.flash && view.flash.idx < view.flash.queue.length) || (view.quiz && view.quiz.idx < view.quiz.qs.length)) out.push(['flashcards', 'words']);
    if (readOpen()) out.push(['reading', 'read']);
    const here = catOf(view.page);
    return out.filter(([p, c]) => p !== view.page || c !== here);
  }
  const sessionPages = () => [...new Set(livePlaces().map(x => x[0]))];
  const liveCats = () => livePlaces().map(x => x[1]);
  // 選擇題 ⇄ 克漏字: park the round of the one being left, bring back the other's
  function mcKind(kind) {
    const f = mcfOf(), cur = view.mc ? view.mc.kind : f.type === 'cloze' ? 'cloze' : 'items';
    if (cur !== kind) { const park = view.mcPark || (view.mcPark = {}); if (view.mc) park[view.mc.kind] = view.mc; view.mc = park[kind] || null; delete park[kind]; }
    if (kind === 'cloze') { if (f.type !== 'cloze') { f.type = 'cloze'; f.count = 1; } }
    else if (f.type === 'cloze') { f.type = ''; f.count = 10; }
  }
  // the open session of a page (a new round is a new object)
  const sessionOf = p => p === 'flashcards' ? (view.flash || view.quiz) : p === 'mcq' ? view.mc : p === 'translate' ? view.tr : p === 'reading' ? view.articleId : null;
  function syncNav() {
    const live = livePlaces();
    const mark = (sel, list) => $$(sel).forEach(b => {
      const g = b.dataset.group, on = g === groupOf(view.page, list), isCat = list === DESK_GROUPS && CATS.some(c => c.id === g);
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      b.classList.toggle('has-session', !on && live.some(([p, c]) => isCat ? c === g : pagesOf(g, list).includes(p)));
    });
    mark('#tabs .tab', DESK_GROUPS); mark('#bnav .bnav-btn', GROUPS);
    const due = dueCards().length, badge = $('#bnavBadge');
    if (badge) { badge.hidden = !due; badge.textContent = due > 99 ? '99+' : String(due); }
  }
  // Each page has an address (#/reading/a14 …) so the iPhone back swipe, reloads and shared links work.
  // Only addresses that start with "#/" belong to this router. Supabase sign-in links (email confirmation,
  // password recovery) arrive as #access_token=…&type=signup or #error=…: supabase-js reads them when it starts
  // (detectSessionInUrl), so any other hash is left exactly as it is until Supabase has finished with it.
  const isRouteHash = h => /^#\/[a-z]/.test(h || '');
  let hashReleased = false; // true once nothing else needs a non-route hash (Supabase has read it, or is not used)
  const hashIsOurs = () => !location.hash || location.hash === '#' || isRouteHash(location.hash) || hashReleased;
  function releaseHash() {
    if (hashReleased) return;
    hashReleased = true;
    // a sign-in link that failed (expired or already used) says why in the hash; show it before the address changes
    // (only our own wording: the free text in the link is never shown, so a crafted link cannot put words on the page)
    const h = location.hash;
    if (cloud.configured && h && !isRouteHash(h) && /(?:^#|&)error=/.test(h) && /(?:^#|&)error_code=/.test(h)) toast('☁️ ' + t(/(?:^#|&)error_code=otp_expired(?:&|$)/.test(h) ? 'linkExpired' : 'linkFailed'));
    syncRoute();
  }
  function routeOf() {
    if (view.page === 'reading' && view.articleId && !view.editing) return '#/reading/' + encodeURIComponent(view.articleId);
    if (view.page === 'news' && view.newsArticle) return '#/news/' + encodeURIComponent(view.newsArticle);
    if (view.page === 'grammar' && view.gr.sub !== 'list') return '#/grammar/' + (view.gr.sub === 'quiz' ? 'quiz' : encodeURIComponent(view.gr.id));
    if (view.page === 'mcq' && clozeOn()) return '#/cloze';
    return '#/' + view.page;
  }
  let routeReady = false;
  // the app puts the scroll position back itself (a list where it was left, a new page at the top); the browser's own
  // restoring would arrive afterwards and smooth-scroll the page somewhere else
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { }
  function syncRoute() {
    if (!hashIsOurs()) return;
    const r = routeOf(); if (location.hash === r) { routeReady = true; return; }
    // a hash Supabase has finished with is replaced, not kept as a step in the history
    const foreign = !!location.hash && location.hash !== '#' && !isRouteHash(location.hash);
    // each step remembers the address it came from, so closing a passage opened from its list can step back instead
    try { if (routeReady && !foreign) history.pushState({ from: location.hash }, '', r); else history.replaceState(null, '', r); } catch (e) { }
    routeReady = true;
  }
  function applyRoute(h) {
    const m = /^#\/([a-z]+)(?:\/(.+))?$/.exec(h || ''); if (!m) return false;
    // #/cloze is the 選擇題 page with cloze passages
    if (m[1] === 'cloze') { mcKind('cloze'); view.page = 'mcq'; return true; }
    if (!Object.prototype.hasOwnProperty.call(PAGES, m[1])) return false;
    let rest = null; try { rest = m[2] ? decodeURIComponent(m[2]) : null; } catch (e) { rest = null; }
    const page = m[1];
    if (page === 'reading') {
      if (rest && articleById(rest)) enterArticle(rest);
      else view.articleId = null;
      view.editing = null;
    }
    if (page === 'news') view.newsArticle = rest || null;
    if (page === 'mcq') mcKind('items');
    if (page === 'grammar') { const g = view.gr; g.sub = rest === 'quiz' ? 'quiz' : rest && grById.has(rest) ? 'ch' : 'list'; g.id = g.sub === 'ch' ? rest : ''; }
    view.page = page;
    return true;
  }
  // keyboard or pointer, for the drop-down focus below: on an iPhone, focusing a drop-down opens its list again
  let kbdUse = false;
  document.addEventListener('keydown', () => { kbdUse = true; }, true);
  document.addEventListener('pointerdown', () => { kbdUse = false; }, true);
  const focusKeyOf = el => ['action', 'page', 'group', 'o', 'q', 'id', 'p', 'v', 'kind', 'known', 'ok', 'mode', 'to', 'n', 'src', 'target'].map(k => el.dataset[k] || '').join('|');
  function render(opts = {}) {
    updateExamChip(); readClock(); applyLevel(); renderLvHandle();
    const app = $('#app'), a = document.activeElement;
    // remember which control had keyboard focus, so a re-render does not drop it back to the top of the page
    const fkey = !opts.focusHeading && a && a !== app && app.contains(a) && a.dataset && a.dataset.action && !/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) ? focusKeyOf(a) : null;
    // a drop-down that changed the page (主題, 類別, 單元…) keeps the focus after the re-render, for keyboard users only
    const fsel = kbdUse && !opts.focusHeading && a && a.tagName === 'SELECT' && a.id && app.contains(a) ? a.id : null;
    app.innerHTML = (PAGES[view.page] || pageHome)();
    const inSession = inSessionNow();
    document.body.classList.toggle('in-session', inSession);
    // a paused session reopened from the menu or the back swipe keeps its group's pills on phones (focus mode hides them otherwise)
    document.body.classList.toggle('pills-on', inSession && !!view.pillsFor && view.pillsFor === sessionOf(view.page));
    document.body.dataset.page = view.page;
    document.body.classList.toggle('teacher', ui.teacher); // the server-confirmed role (see ui.teacher)
    syncTourInvite();
    // the page last used in each bottom-bar group and each desktop tab (a category is a desktop tab)
    view.lastIn[groupOf(view.page)] = view.page; view.lastIn['d:' + groupOf(view.page, DESK_GROUPS)] = view.page;
    syncNav();
    // English text is read with an English voice; Chinese with a Chinese one when the interface is English
    $$('#app .en:not([lang])').forEach(e => { e.lang = 'en'; });
    if (ui.lang === 'en') $$('#app .rp-zh, #app .daily-zh, #app .flash-zh, #app td.zh, #app .tr-zh, #app .tr-q').forEach(e => { e.lang = 'zh-Hant'; });
    const grCh = view.page === 'grammar' && view.gr.sub === 'ch' && grById.get(view.gr.id);
    document.title = `${grCh ? grCh.title + ' · ' : ''}${t(view.page === 'mcq' && clozeOn() ? 'tabCloze' : PAGE_META[view.page] ? PAGE_META[view.page][1] : 'tabHome')} · ${t('siteName')}`;
    syncRoute();
    if (opts.focusHeading) { const h = $('#app .st-label, #app h1'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    else if (fkey) { const same = $$('#app [data-action]').find(el => el.tabIndex >= 0 && focusKeyOf(el) === fkey); if (same && !same.disabled) same.focus({ preventScroll: true }); }
    else if (fsel) { const same = document.getElementById(fsel); if (same && app.contains(same) && !same.disabled) same.focus({ preventScroll: true }); }
    const sp = $('#spellInput'); if (sp && !sp.disabled) sp.focus();
    fitWords();
    updateToTop();
  }
  function nav(page) { speakStop(); if (page === 'news' && view.page === 'news') view.newsArticle = null; view.page = page; jumpTo(0); render({ focusHeading: true }); }
  // a tab, bottom-bar button or category: back to the page last used there
  function goGroup(gid, list, pfx) {
    const pages = pagesOf(gid, list); let target = view.lastIn[pfx + gid];
    if (!pages.includes(target)) target = firstOf(gid, list);
    if (list === DESK_GROUPS && (gid === 'mcq' || gid === 'cloze')) mcKind(gid === 'cloze' ? 'cloze' : 'items');
    // an article with answers in progress is kept (or reopened after a back swipe to the list); otherwise the group opens on the list
    if (target === 'reading' && view.articleId && (view.submitted || !Object.keys(view.answers).length)) { view.articleId = null; view.editing = null; }
    else if (target === 'reading' && !view.articleId && view.page !== 'reading' && readOpen()) view.articleId = view.lastArticle;
    if (target === 'news' && view.page === 'news') view.newsArticle = null;
    if (target === 'grammar' && view.page === 'grammar') { view.gr.sub = 'list'; view.gr.id = ''; }
    view.pillsFor = sessionOf(target) || null;
    nav(target);
  }
  // back to the reading list where the student left it, with the passage just read outlined
  function showReadingList() {
    view.articleId = null; view.editing = null; render({ focusHeading: true });
    jumpTo(view.readScroll || 0);
    const row = view.lastArticle && $$('.read-item').find(r => r.dataset.id === view.lastArticle);
    if (row) { row.classList.add('just-read'); setTimeout(() => row.classList.remove('just-read'), 2500); const b = $('.ri-main', row); if (b) b.focus({ preventScroll: true }); }
  }
  // ← 返回 / ✕ on a passage or story opened from its list: step back in the history instead of adding a step,
  // so a back swipe afterwards does not reopen what was just closed (popstate then shows the list)
  function backToList(list) {
    if (!(history.state && history.state.from === list) || location.hash === list) return false;
    history.back(); return true;
  }
  // open a passage: reopening the same one keeps answers that were not handed in yet (and the reading time so far)
  function enterArticle(id) {
    if (view.articleId === id) return;
    if (!(view.lastArticle === id && !view.submitted && Object.keys(view.answers).length)) { view.answers = {}; view.submitted = false; view.readZh = null; view.readAcc = 0; view.readOn = false; }
    view.articleId = id; view.lastArticle = id; markOpened('r:' + id);
  }
  // 已瀏覽: a passage or grammar chapter opened (once a day is enough)
  function markOpened(k) { const P = state.progress, m = P.opened || (P.opened = {}), td = todayStr(); if (m[k] === td || !SAFE_ID.test(k)) return; m[k] = td; save(); }
  // reading time counts only while the passage is on screen: leaving it (another page, a back swipe) pauses the clock
  function readClock() {
    const on = view.page === 'reading' && !!view.articleId && !view.submitted && !view.editing;
    if (on && !view.readOn) view.readStart = Date.now();
    else if (!on && view.readOn) view.readAcc = (view.readAcc || 0) + (Date.now() - view.readStart);
    view.readOn = on;
  }
  function openArticleId(id) {
    if (view.page === 'reading' && !view.articleId) view.readScroll = window.scrollY;
    enterArticle(id); view.readPos = {};
    nav('reading');
  }

  /* ---------------- Confirm dialog (bottom sheet on phones) ---------------- */
  const askEl = $('#askModal');
  let askResolve = null, askOpener = null;
  function askConfirm({ title, body = '', ok, cancel, danger = false }) {
    if (askResolve) askResolve(false);
    return new Promise(res => {
      askOpener = document.activeElement;
      $('#askTitle').textContent = title; $('#askBody').textContent = body; $('#askBody').hidden = !body;
      $('#askYes').textContent = ok || t('save'); $('#askNo').textContent = cancel || t('cancel');
      $('#askYes').className = 'btn ' + (danger ? 'danger' : 'accent');
      askEl.classList.remove('hidden'); askResolve = res;
      setTimeout(() => $('#askNo').focus(), 30);
    });
  }
  function closeAsk(v) {
    if (!askResolve) return;
    askEl.classList.add('hidden'); const r = askResolve; askResolve = null;
    if (askOpener && askOpener.focus && document.contains(askOpener)) askOpener.focus({ preventScroll: true });
    r(v);
  }
  $('#askYes').addEventListener('click', () => closeAsk(true));
  $('#askNo').addEventListener('click', () => closeAsk(false));
  askEl.addEventListener('click', e => { if (e.target === askEl) closeAsk(false); });
  async function endSessionAsk(n, body) { return n ? askConfirm({ title: t('endAskTitle'), body, ok: t('endAndSee'), cancel: t('keepGoing') }) : true; }
  // 🌱 字根字首 is a page of its own: going there ends a practice still open here, so ask first (a new tab is fine)
  document.addEventListener('click', async e => {
    const a = e.target.closest && e.target.closest('a[href="roots.html"]');
    if (!a || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || (!inSessionNow() && !sessionPages().length)) return;
    e.preventDefault();
    if (await askConfirm({ title: t('leaveAskTitle'), body: t('leaveAskBody'), ok: t('leaveAskOk'), cancel: t('keepGoing') })) location.href = a.href;
  });

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
      const keepCode = state.settings.teacherCode;
      state = { settings: Object.assign(clone(SEED_DATA.settings), cleanSettings(obj.settings)), articles: cleanItems(obj.articles, 'article'), vocab: cleanItems(obj.vocab, 'vocab'), hiddenVocab: cleanIds(obj.hiddenVocab), hiddenArticles: cleanIds(obj.hiddenArticles), seedArticles: state.seedArticles, progress: cleanProgress(obj.progress), progressOwner: state.progressOwner || null, progressBase: state.progressBase || null, studentReports: cleanReports(obj.studentReports), accounts: Array.isArray(obj.accounts) && ui.teacher && !(ui.user && ui.user.cloud) ? cleanAccounts(obj.accounts) : state.accounts };
      if (!ui.teacher) state.settings.teacherCode = keepCode; // a file never sets the local invite code for a student
    } else {
      if (obj.settings) { const ns = cleanSettings(obj.settings); delete ns.teacherCode; delete ns.teacherEmail; delete ns.studentName; Object.assign(state.settings, ns); }
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

  // the 單字卡 page holds an unfinished round or word quiz with progress (a card marked, a question answered)
  const wordsBusy = () => !!((view.flash && view.flash.idx > 0 && view.flash.idx < view.flash.queue.length) || (view.quiz && view.quiz.idx < view.quiz.qs.length && (view.quiz.idx > 0 || view.quiz.answered)));
  // another task was asked for while one with progress is open: go back to the open one and say why, never wipe it
  function resumeBusy(page) { toast(t('sessionOpenFirst')); nav(page); }
  function startPlanFlash(mode) {
    if (view.flash && view.flash.idx < view.flash.queue.length && view.flash.mode === mode) { nav('flashcards'); return; }
    if (wordsBusy()) return resumeBusy('flashcards');
    const own = view.flashSetup;
    view.flashSetup = Object.assign({}, own, { mode, unit: '' });
    jumpTo(0);
    actions.startFlash({ plan: true });
    view.flashSetup = own;
  }

  /* ---------------- Actions ---------------- */
  const actions = {
    tourStart() { startTour(); },
    setVoice(el) { ui.voice = el.dataset.v === 'f' ? 'f' : 'm'; saveUi(); refreshVoiceCard(ui.voice); speak(t('voiceSample')); },
    // 試聽 says so when the device cannot read at all (a normal cancel or a second click is not an error)
    voiceTest() { speak(t('voiceSample'), true); },
    setRate(el) { const r = +el.dataset.v; ui.rate = [0.75, 0.9, 1].includes(r) ? r : 0.9; saveUi(); refreshVoiceCard(String(ui.rate)); speak(t('voiceSample')); },
    tourNo() { ui.tour = 1; saveUi(); render(); toast(t('tourLater')); jumpTo(0); const h = $('#app h1'); if (h) h.focus({ preventScroll: true }); },
    tourYes() { invEl.classList.add('hidden'); document.body.classList.remove('tour-invited'); startTour(); },
    setLevel(el) {
      const v = el.dataset.v || '';
      state.progress.level = { v: LEVELS.includes(v) ? v : '', at: new Date().toISOString() }; save();
      toast(v ? tf('lvSaved', { lv: v + ' ' + t('lvName' + v) }) : t('lvSkipped'));
      // from the drawer: close it (focus goes back to the 🎯 tab) and redraw the page with the new starting filters
      if (el.closest('#lvDrawer')) {
        closeLvDrawer();
        // a page with a form being filled in (Settings, a new passage, a word being edited) is not redrawn; the filters follow on the next page
        if (view.page === 'settings' || view.editing || view.vocabEdit || view.bulkOpen) { const g = $('.level-set .level-grid'); if (g) g.outerHTML = levelOptions(); renderLvHandle(); }
        else render();
        return;
      }
      // in Settings only the five buttons are redrawn, so nothing typed into the form below is lost (the filters follow on the next page)
      const grid = view.page === 'settings' && el.closest('.level-grid');
      if (grid) { grid.outerHTML = levelOptions(); renderLvHandle(); const b = $(`.level-set .level-opt[data-v="${v}"]`); if (b) b.focus({ preventScroll: true }); return; }
      render();
    },
    goCat(el) { goGroup(el.dataset.to, DESK_GROUPS, 'd:'); },
    // back to an unfinished round (the 錯題本 sends a student there when a round is still open)
    resume(el) {
      const p = el.dataset.page;
      if (p === 'reading' && !view.articleId && readOpen()) view.articleId = view.lastArticle;
      if (p === 'mcq') mcKind(el.dataset.kind === 'cloze' ? 'cloze' : 'items');
      view.pillsFor = sessionOf(p) || null; nav(p);
    },
    nav(el) { if (el.dataset.page === 'reading' && view.page !== 'reading' && view.articleId && (view.submitted || !Object.keys(view.answers).length)) view.articleId = null; nav(el.dataset.page); },
    // home: 開始 starts the practice itself (a running session is resumed, never wiped)
    goFlash(el) { startPlanFlash(el.dataset.mode); },
    goQuiz() { if (view.quiz && view.quiz.idx < view.quiz.qs.length) return nav('flashcards'); if (wordsBusy()) return resumeBusy('flashcards'); view.flash = null; view.quiz = null; nav('flashcards'); setTimeout(() => { const h = $('#quizSetup'); if (h) h.scrollIntoView({ behavior: smooth() }); }, 50); },
    newsRetry() { news.status = 'idle'; render(); },
    czJump(el) { const q = document.getElementById('czq-' + el.dataset.n); if (!q) return; q.scrollIntoView({ block: 'center', behavior: smooth() }); flashEl(q); const f = $('.option', q); if (f) f.focus({ preventScroll: true }); },
    czBack(el) { const b = $$('.cz-blank').find(x => x.dataset.n === el.dataset.n); if (!b) return; b.scrollIntoView({ block: 'center', behavior: smooth() }); flashEl(b); b.focus({ preventScroll: true }); },
    // phone article: jump between the passage and the first unanswered question
    jump(el) {
      const a = articleById(view.articleId), pas = $('#passage'), qs = $('#artQs'); if (!a || !pas || !qs) return;
      const off = 76, inQs = qs.getBoundingClientRect().top < window.innerHeight * .5;
      view.readPos = view.readPos || {};
      if (!inQs) view.readPos.passage = window.scrollY;
      let y;
      if (el.dataset.to === 'passage') y = inQs && view.readPos.passage != null ? view.readPos.passage : pas.getBoundingClientRect().top + window.scrollY - off;
      else { const k = a.questions.findIndex((q, i) => view.answers[i] == null), tq = document.getElementById('rq-' + (k < 0 ? 0 : k)); y = tq.getBoundingClientRect().top + window.scrollY - off; }
      window.scrollTo({ top: Math.max(0, y), behavior: smooth() });
    },
    speak(el) { speak(el.dataset.word); },
    // 📐 文法
    grUnit(el) { view.gr.unit = el.dataset.v; render(); },
    grBand(el) { view.gr.band = el.dataset.v; render(); },
    grJump(el) { const x = document.getElementById(el.dataset.to); if (x) { x.scrollIntoView({ block: 'start', behavior: smooth() }); x.focus({ preventScroll: true }); } },
    grAnswer(el) { grAnswer(+el.dataset.q, +el.dataset.o); },
    grSecAnswer(el) { grSecAnswer(+el.dataset.s, +el.dataset.p, +el.dataset.o); },
    grRedo() { const c = grById.get(view.gr.id); if (!c) return; view.gr.picks[c.id] = []; render(); const q = $('#gs-quiz'); if (q) { q.scrollIntoView({ block: 'start' }); q.focus({ preventScroll: true }); } },
    grRange(el) { view.gr.range = el.dataset.v; render(); },
    grStart(el) {
      const g = view.gr; if (el.dataset.v === 'again' && g.mix) g.range = g.mix.range;
      // ten questions, at most two from one chapter unless the range has too few chapters for that
      const pool = shuffleArr(GR_CH.filter(c => grInRange(c, g.range)).flatMap(c => c.quiz.map((_, i) => ({ id: c.id, i })))), per = {}, qs = [];
      for (const x of pool) { if (qs.length === GR_MIXN) break; if ((per[x.id] = (per[x.id] || 0) + 1) <= 2) qs.push(x); }
      for (const x of pool) { if (qs.length === GR_MIXN) break; if (!qs.includes(x)) qs.push(x); }
      g.mix = { range: g.range, qs, i: 0, chosen: null, right: 0, wrong: [] }; jumpTo(0); grMixGo('#qTitle');
    },
    grMixAnswer(el) {
      const s = view.gr.mix; if (!s || s.chosen != null || s.i >= s.qs.length) return;
      const x = s.qs[s.i], q = grQ(x); s.chosen = +el.dataset.o; gqRecord(x, s.chosen);
      if (s.chosen === q.answer) s.right++; else s.wrong.push(x.id);
      grMixGo('#app [data-action=grNext]');
    },
    grNext() {
      const s = view.gr.mix; if (!s || s.chosen == null) return;
      s.i++; s.chosen = null;
      if (s.i >= s.qs.length && !s.redo) { const k = s.range || 'all'; grStore.mix[k] = Math.max(grStore.mix[k] || 0, s.right); grSave(); }
      grMixGo(s.i < s.qs.length ? '#qTitle' : '#rTitle');
    },
    grSetup() { view.gr.mix = null; jumpTo(0); grMixGo('#qsTitle'); },
    newsSource(el) { news.source = el.dataset.src; render(); },
    newsStudy(el) { const o = view.newsOpen || (view.newsOpen = {}); o[el.dataset.i] = !o[el.dataset.i]; render(); },
    openNewsArticle(el) { view.newsArticle = el.dataset.link; view.newsScroll = window.scrollY; const p = state.progress; p.newsDays = Object.assign({}, p.newsDays, { [todayStr()]: 1 }); save(); speakStop(); jumpTo(0); render({ focusHeading: true }); },
    closeNewsArticle() { speakStop(); if (backToList('#/news')) return; view.newsArticle = null; render(); jumpTo(view.newsScroll || 0); },
    newsZh(el) { view.newsZh = el.dataset.v === '1'; render(); },
    speakStop() { speakStop(); },
    saveNewsWord(el) {
      // Words not in the word bank go to the student's own list (progress), not to the teacher's shared content
      const d = el.dataset; let id = d.id && VMAP[d.id] ? d.id : null;
      if (!id) { const p = state.progress; p.myWords = p.myWords || []; id = uid('v'); p.myWords.push({ id, word: d.word, pos: d.pos, zh: d.zh, syn: '', example: d.ex, unit: d.srcK === 'read' ? 'read' : 'news' }); rebuildVocab(); }
      const adding = !isBm('vocab', id);
      // the sentence it came from goes with it (also for a word already in the word bank), at most 3 places per word
      if (adding && d.ex && srcRef(d.srcRef)) { const P = state.progress, m = P.wordSrc || (P.wordSrc = {}), x = { k: ['read', 'news', 'city'].includes(d.srcK) ? d.srcK : 'read', ref: d.srcRef, p: d.srcP != null && d.srcP !== '' ? +d.srcP : null, s: String(d.ex).slice(0, 300), at: new Date().toISOString() };
        m[id] = (m[id] || []).filter(y => !(y.k === x.k && y.ref === x.ref && y.s === x.s)).concat([x]).slice(-3); }
      toggleBm('vocab', id); render();
    },
    // 學習筆記 open/close: the summary toggles the <details>; the body is drawn when it opens
    readNotes(el) { const d = el.closest('details'); if (!d) return; const open = !d.open; view.readNotesOpen = open ? el.dataset.id : null; const a = articleById(el.dataset.id); if (a) { d.outerHTML = readNotesBox(a); const s = $('#readNotes summary'); if (s) s.focus({ preventScroll: true }); } },
    readTopic(el) { view.readFilter.topic = el.dataset.v; render(); },
    readStatus(el) { view.readFilter.status = el.dataset.v; render(); },
    readMore(el) { view.readFilter.more[el.dataset.v] = true; render(); },
    jumpGroup(el) { const g = document.getElementById(el.dataset.target); if (g) g.scrollIntoView({ behavior: smooth(), block: 'start' }); },
    toggleBm(el) { toggleBm(el.dataset.kind, el.dataset.id); if (view.flash && view.page === 'flashcards' && view.flash.idx < view.flash.queue.length) { const b = $('.flash-bm'), on = isBm('vocab', el.dataset.id); if (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '★' : '☆'; } } else render(); },
    toggleVocabBm() { view.vocabBm = !view.vocabBm; view.vocabPage = 0; render(); },
    vocabPage(el) { view.vocabPage = (view.vocabPage || 0) + (+el.dataset.d); render(); },
    vocabGo(el) { view.vocabPage = +el.dataset.p; render(); const tb = $('.wb-tools'); if (tb) tb.scrollIntoView({ block: 'start' }); },
    mcType(el) { view.mcf.type = el.dataset.v; view.mcf.count = el.dataset.v === 'cloze' ? 1 : (view.mcf.count > 4 ? view.mcf.count : 10); render(); },
    mcLevel(el) { view.mcf.level = el.dataset.v; render(); },
    mcCount(el) { view.mcf.count = +el.dataset.v; render(); },
    // 錯題本
    wbSrc(el) { view.wbf = { src: el.dataset.v || '' }; view.wbMore = false; render(); },
    wbMore() { view.wbMore = true; render(); },
    wbRedo(el) { const src = el.dataset.src; wbStart(src, wrongBook().filter(x => x.src === src)); },
    wbRedoOne(el) { const x = wrongBook().find(y => y.src === el.dataset.src && y.id === el.dataset.id); if (x) wbStart(x.src, [x]); },
    wbWord(el) { view.vocabSearch = el.dataset.w; view.vocabUnit = ''; view.vocabBm = false; nav('vocab'); },
    // 回錯題本 after a redo round: the finished round is put away, then the link goes on to #/wrong
    mcLeave() { if (view.mc && view.mc.done) view.mc = null; location.hash = '#/wrong'; },
    // 同步失敗 → 重試: the record never left this device, so a retry just uploads it again
    syncRetry() { cloud.st = { s: 'saving' }; updateSync(); syncNow().then(() => { if (cloud.st && cloud.st.s === 'saving') { cloud.st = null; } updateSync(); }).catch(syncFailed); },
    mcMode(el) { view.mcf.mode = el.dataset.v === 'test' ? 'test' : 'practice'; render(); },
    mcStart() {
      const f = view.mcf, cloze = f.type === 'cloze';
      const ids = shuffleArr((cloze ? mcClozeFiltered() : mcFiltered()).map(x => x.id)).slice(0, f.count || (cloze ? 1 : 10));
      if (!ids.length) { toast(t('trNoMatch')); view.mc = null; render(); return; }
      view.mc = { kind: cloze ? 'cloze' : 'items', type: f.type, ids, i: 0, answers: {}, checked: {}, mode: f.mode, start: Date.now() };
      view.page = 'mcq'; jumpTo(0); render({ focusHeading: true });
    },
    mcRedo() {
      const s = view.mc, wrong = s.kind === 'cloze' ? s.ids.filter(cid => clozeSets().find(x => x.id === cid).blanks.some((b, k) => s.answers[`${cid}-${k + 1}`] !== b.answer)) : s.ids.filter(id => s.answers[id] !== mcItems().find(x => x.id === id).answer);
      view.mc = Object.assign({}, s, { ids: wrong, i: 0, answers: {}, checked: {}, done: false, early: false, start: Date.now(), secs: null }); render();
    },
    // ✕ 結束: ask first when answers exist; ending shows the results of what was answered
    async mcExit() {
      const s = view.mc;
      if (s && !s.done) {
        const n = Object.keys(s.answers).length;
        if (n) {
          if (!await endSessionAsk(n, tf('endAskBody', { n }))) return;
          if (view.mc !== s) return;
          s.ids = s.kind === 'cloze' ? s.ids.filter(cid => Object.keys(s.answers).some(k => k.startsWith(cid + '-'))) : s.ids.filter(id => s.answers[id] != null);
          s.i = Math.min(s.i, s.ids.length - 1); s.early = true; mcFinish(); return;
        }
      }
      view.mc = null; render({ focusHeading: true });
    },
    mcChoose(el) {
      const s = view.mc, it = mcItems().find(x => x.id === s.ids[s.i]);
      if (s.mode === 'practice' && s.answers[it.id] != null) return;
      s.answers[it.id] = +el.dataset.o;
      if (s.mode === 'practice') { mcRecord(it.id, s.answers[it.id], it.answer); bumpDay(); save(); }
      render();
      // keep the explanation on screen, just above the 下一題 bar
      if (s.mode === 'practice') requestAnimationFrame(() => { const ex = $('.explain'); if (ex) ex.scrollIntoView({ block: 'nearest', behavior: smooth() }); });
    },
    mcPrev() { view.mc.i = Math.max(0, view.mc.i - 1); render(); scrollToApp(); },
    mcNext() { const s = view.mc; if (s.i < s.ids.length - 1) { s.i++; render({ focusHeading: true }); scrollToApp(); } else mcFinish(); },
    czChoose(el) { const s = view.mc, cid = s.ids[s.i]; if (s.checked[cid]) return; s.answers[el.dataset.id] = +el.dataset.o; render(); },
    czCheck() {
      const s = view.mc, c = clozeSets().find(x => x.id === s.ids[s.i]);
      const miss = c.blanks.findIndex((b, k) => s.answers[`${c.id}-${k + 1}`] == null);
      if (miss >= 0) { toast(t('pleaseAnswerAll')); actions.czJump({ dataset: { n: String(miss + 1) } }); return; }
      c.blanks.forEach((b, k) => mcRecord(`${c.id}-${k + 1}`, s.answers[`${c.id}-${k + 1}`], b.answer));
      s.checked[c.id] = true; bumpDay(); save(); render();
    },
    czNext() {
      const s = view.mc, c = clozeSets().find(x => x.id === s.ids[s.i]);
      if (s.mode === 'test' && c.blanks.some((b, k) => s.answers[`${c.id}-${k + 1}`] == null)) { toast(t('pleaseAnswerAll')); return; }
      if (s.i < s.ids.length - 1) { s.i++; render({ focusHeading: true }); scrollToApp(); } else mcFinish();
    },
    trGroup(el) { view.trf.group = +el.dataset.v; view.trf.page = 0; render(); },
    trLevel(el) { view.trf.level = el.dataset.v; view.trf.page = 0; render(); },
    trStatus(el) { view.trf.status = el.dataset.v; view.trf.page = 0; render(); },
    trGo(el) { view.trf.page = +el.dataset.p; render(); trScrollTop(); },
    trStart(el) { const n = el && el.n ? el.n : 10; const ids = shuffleArr(trFiltered().map(x => x.id)).slice(0, n); if (!ids.length) { view.tr = null; render(); return; } if (view.page === 'translate' && !view.tr) view.trScroll = window.scrollY; view.tr = { ids, i: 0, right: 0, wrong: [] }; view.page = 'translate'; jumpTo(0); render({ focusHeading: true }); },
    trOne(el) { view.trScroll = window.scrollY; view.tr = { ids: [el.dataset.id], i: 0, right: 0, wrong: [] }; jumpTo(0); render({ focusHeading: true }); },
    trRedo() { const ids = view.tr.wrong.slice(); view.tr = { ids, i: 0, right: 0, wrong: [] }; render({ focusHeading: true }); },
    async trExit() {
      const s = view.tr;
      if (s && s.i > 0 && s.i < s.ids.length) { if (!await endSessionAsk(s.i, tf('endAskBody', { n: s.i }))) return; if (view.tr !== s) return; s.ids = s.ids.slice(0, s.i); render({ focusHeading: true }); return; }
      view.tr = null; render({ focusHeading: true }); jumpTo(view.trScroll || 0);
    },
    trHint() { view.tr.hint = true; view.tr.answer = ($('#trInput') || {}).value || ''; render(); const i = $('#trInput'); if (i) i.focus(); },
    trCheck() { const v = (($('#trInput') || {}).value || '').trim(); if (!v) { toast(t('trTypeFirst')); return; } Object.assign(view.tr, { answer: v, checked: true }); render(); requestAnimationFrame(() => { const i = $('#trInput'); if (i) i.scrollIntoView({ block: 'start', behavior: smooth() }); }); },
    trMark(el) {
      const s = view.tr, id = s.ids[s.i], ok = el.dataset.ok === '1', p = state.progress;
      p.translate = p.translate || {};
      const r = p.translate[id] || { tries: 0, ok: 0 };
      p.translate[id] = { tries: r.tries + 1, ok: r.ok + (ok ? 1 : 0), lastOk: ok, answer: s.answer, last: new Date().toISOString() };
      if (ok) s.right++; else s.wrong.push(id);
      Object.assign(s, { i: s.i + 1, answer: '', checked: false, hint: false });
      bumpDay(); save(); render({ focusHeading: true }); scrollToApp();
    },
    phrGo(el) { view.phr.page = +el.dataset.p; render(); window.scrollTo({ top: 0, behavior: smooth() }); },
    phrBm() { Object.assign(view.phr, { bm: !view.phr.bm, page: 0 }); render(); },
    phrFlash() { if (wordsBusy()) return resumeBusy('flashcards'); Object.assign(view.flashSetup, { mode: 'due', unit: view.phr.cat || '@phrase' }); view.flash = null; view.quiz = null; nav('flashcards'); },
    phrQuiz() { if (wordsBusy()) return resumeBusy('flashcards'); view.quizSetup.unit = view.phr.cat || '@phrase'; view.flash = null; view.quiz = null; nav('flashcards'); setTimeout(() => { const h = $('#quizSetup'); if (h) h.scrollIntoView({ behavior: smooth() }); }, 50); },
    openArticleHome(el) { openArticleId(el.dataset.id); },
    // reading
    openArticle(el) { openArticleId(el.dataset.id); },
    backList() { if (!backToList('#/reading')) showReadingList(); },
    // ✕ 結束 on a passage: ask before dropping chosen answers
    async endRead() {
      const n = Object.keys(view.answers).length;
      if (n && !view.submitted) { if (!await askConfirm({ title: t('endAskTitle'), body: tf('readEndBody', { n }), ok: t('endNow'), cancel: t('keepGoing'), danger: true })) return; }
      view.answers = {}; view.submitted = false; if (!backToList('#/reading')) showReadingList();
    },
    readZh(el) { view.readZh = el.dataset.v === '1'; render(); },
    choose(el) { if (view.submitted) return; view.answers[+el.dataset.q] = +el.dataset.o; render(); },
    submitQuiz() {
      const a = articleById(view.articleId);
      if (Object.keys(view.answers).length < a.questions.length) { toast(t('pleaseAnswerAll')); return; }
      view.submitted = true;
      view.readSecs = Math.round(((view.readAcc || 0) + (view.readOn ? Date.now() - view.readStart : 0)) / 1000);
      const answers = a.questions.map((q, i) => ({ qi: i, q: q.q, chosen: view.answers[i], chosenText: q.options[view.answers[i]], correct: q.answer, correctText: q.options[q.answer] }));
      const score = answers.filter(x => x.chosen === x.correct).length;
      state.progress.readingQuizzes.push({ id: uid('rq'), articleId: a.id, title: a.title, score, total: a.questions.length, date: new Date().toISOString(), secs: view.readSecs, answers });
      bumpDay(); save(); render();
      setTimeout(() => { const s = $('.score-banner'); if (s) s.scrollIntoView({ behavior: smooth(), block: 'center' }); }, 50);
    },
    retry() { view.answers = {}; view.submitted = false; view.readZh = null; view.readAcc = 0; view.readOn = false; jumpTo(0); render({ focusHeading: true }); },
    newArticle() { if (!ui.teacher) return; view.editing = { id: uid('a'), title: '', level: 'Reading · B1', tags: [], passage: '', questions: [{ q: '', options: ['', '', '', ''], answer: 0, explain: '' }] }; render(); },
    cancelEdit() { view.editing = null; render(); },
    addQ() { collectEditor(); view.editing.questions.push({ q: '', options: ['', '', '', ''], answer: 0, explain: '' }); render(); },
    removeQ(el) { collectEditor(); view.editing.questions.splice(+el.dataset.qi, 1); render(); },
    saveArticle() { if (!ui.teacher) return;
      collectEditor(); const a = view.editing;
      if (!a.title || !a.passage.trim()) { toast(t('needTitle')); return; }
      if (!a.questions.length || a.questions.some(q => !q.q || q.options.some(o => !o))) { toast(t('needQ')); return; }
      a.edited = true;
      const i = state.articles.findIndex(x => x.id === a.id); if (i >= 0) state.articles[i] = a; else state.articles.push(a);
      save(); view.editing = null; toast(t('articleSaved')); render();
    },
    // flashcards
    startFlash(el) {
      const fs = view.flashSetup, fromPlan = !!(el && el.plan);
      let pool = poolFor(fs.mode, fs.unit);
      if (fs.mode === 'newHF') { // most frequent first; from the home plan only today's goal; shuffled inside that slice
        const cap = fromPlan ? Math.max(0, GOAL.new - newToday()) : (fs.limit || pool.length);
        if (fromPlan && !cap) { toast(t('newDoneToday')); return; }
        pool = pool.slice(0, cap); if (fs.shuffle) pool = shuffleArr(pool);
      } else if (fs.mode === 'due') { // due (reviewed before) first, then new words
        const td = todayStr();
        let due = pool.filter(v => { const c = state.progress.cards[v.id]; return c && c.seen > 0 && c.due <= td; }), fresh = pool.filter(v => !due.includes(v));
        if (fs.shuffle) { due = shuffleArr(due); fresh = shuffleArr(fresh); }
        pool = due.concat(fresh);
      } else if (fs.shuffle) pool = shuffleArr(pool);
      pool = pool.map(v => v.id);
      if (fs.limit && fs.mode !== 'newHF') pool = pool.slice(0, fs.limit);
      if (!pool.length) { toast(t('noCards')); return; }
      view.flash = { queue: pool, idx: 0, flipped: false, known: [], missed: [], requeued: [], mode: fs.mode }; view.quiz = null; view.page = 'flashcards'; render({ focusHeading: true });
    },
    flip() {
      const f = view.flash; f.flipped = !f.flipped;
      $('.flash-card').classList.toggle('flipped', f.flipped);
      const fr = $('.flash-front'), bk = $('.flash-back'), h = $('.flash-hint');
      if (fr) fr.setAttribute('aria-hidden', f.flipped); if (bk) bk.setAttribute('aria-hidden', !f.flipped); if (h) h.setAttribute('aria-expanded', f.flipped);
    },
    flashMark(el) {
      const f = view.flash, known = el.dataset.known === '1', id = f.queue[f.idx];
      markCard(id, known);
      if (!f.known.includes(id) && !f.missed.includes(id)) (known ? f.known : f.missed).push(id);
      // a missed card comes back once more before the round ends
      f.requeued = f.requeued || [];
      if (!known && !f.requeued.includes(id)) { f.queue.push(id); f.requeued.push(id); }
      // focus goes to the session label, not onto the next card's buttons, so Space flips the new card as the hint says
      f.idx++; f.flipped = false; save(); render({ focusHeading: true });
    },
    flashAgain() { actions.startFlash(); },
    flashMissed() { view.flash = { queue: shuffleArr(view.flash.missed), idx: 0, flipped: false, known: [], missed: [], requeued: [], mode: 'missed' }; render({ focusHeading: true }); },
    async flashExit() {
      const f = view.flash;
      if (f && f.idx > 0 && f.idx < f.queue.length) { if (!await endSessionAsk(f.idx, tf('flashSavedBody', { n: f.idx }))) return; if (view.flash !== f) return; f.queue = f.queue.slice(0, f.idx); render({ focusHeading: true }); return; }
      view.flash = null; render({ focusHeading: true });
    },
    // quiz
    startQuiz() { buildQuiz(); jumpTo(0); render({ focusHeading: true }); },
    quizChoose(el) { const q = view.quiz; if (q.answered) return; q.chosen = el.dataset.id; quizAnswer(q.chosen === q.qs[q.idx].id); save(); render(); },
    spellCheck() { const q = view.quiz; const given = ($('#spellInput').value || '').trim(); if (!given) return; q.chosen = given; const v = VOCAB.find(x => x.id === q.qs[q.idx].id); quizAnswer(given.toLowerCase() === v.word.toLowerCase(), given); save(); render(); },
    spellSkip() { const q = view.quiz; q.chosen = ''; quizAnswer(false, '(skip)'); save(); render(); },
    quizNext() { const q = view.quiz; q.idx++; q.answered = false; q.chosen = null; if (q.idx >= q.qs.length) finishQuiz(); render({ focusHeading: true }); scrollToApp(); },
    quizAgain() { buildQuiz(); render({ focusHeading: true }); },
    async quizExit() {
      const q = view.quiz;
      if (q && q.idx < q.qs.length && (q.idx > 0 || q.answered)) {
        const n = q.idx + (q.answered ? 1 : 0);
        if (!await endSessionAsk(n, tf('endAskBody', { n }))) return; if (view.quiz !== q) return;
        q.qs = q.qs.slice(0, n); q.idx = q.qs.length; q.answered = false; finishQuiz(); render({ focusHeading: true }); return;
      }
      view.quiz = null; render({ focusHeading: true });
    },
    // vocab
    addVocab() { if (!ui.teacher) return; view.vocabEdit = { id: '', word: '', pos: '', zh: '', example: '', unit: String(view.vocabUnit).startsWith('@') ? '' : view.vocabUnit }; render(); setTimeout(() => $('#veWord') && $('#veWord').focus(), 30); },
    editVocab(el) { if (!ui.teacher) return; view.vocabEdit = clone(VOCAB.find(x => x.id === el.dataset.id)); render(); },
    cancelVocab() { view.vocabEdit = null; render(); },
    saveVocab() { if (!ui.teacher) return;
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
    deleteVocab(el) { if (!ui.teacher) return;
      if (!confirm(t('confirmDel'))) return;
      const id = el.dataset.id;
      if (state.vocab.some(x => x.id === id)) state.vocab = state.vocab.filter(x => x.id !== id);
      if (state.progress.myWords) state.progress.myWords = state.progress.myWords.filter(x => x.id !== id);
      if (LIBMAP[id]) { state.hiddenVocab = state.hiddenVocab || []; if (!state.hiddenVocab.includes(id)) state.hiddenVocab.push(id); }
      save(); render();
    },
    toggleBulk() { view.bulkOpen = !view.bulkOpen; render(); },
    bulkImport() { if (!ui.teacher) return;
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
        view.report = { blob, name: `${t('reportFile')}-${name}-${todayStr()}.pdf`.replace(/[\\/:*?"<>|]/g, '_'), url: URL.createObjectURL(blob) }; view.mail = null; view.mailTo = null;
      } catch (e) { if (view.report) { URL.revokeObjectURL(view.report.url); view.report = null; } toast(t('pdfFail')); } // never leave an older report looking like the new one
      view.reportBusy = false; render();
      const c = $('#reportCard'); if (c) c.scrollIntoView({ behavior: smooth(), block: 'center' });
    },
    async mailDirect() {
      if (!view.report || (view.mail && view.mail.sending)) return;
      const to = saveTeacherEmail(); if (to === null) return;
      if (!to) { toast(t('needEmail')); const el = $('#teacherEmailInput'); if (el) el.focus(); return; }
      const meEl = $('#myEmailInput'), me = meEl ? meEl.value.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(me)) { toast(t('badMyEmail')); if (meEl) meEl.focus(); return; }
      view.mailFrom = me; view.mailMsg = ($('#mailMsg') || {}).value || '';
      view.mail = { sending: true }; refreshMailBox();
      try {
        const pdf = await blobToB64(view.report.blob);
        const { error } = await cloud.sb.functions.invoke('send-report', { body: { to, replyTo: me, pdf, fileName: view.report.name, summary: reportText(state.progress, reportName()), message: view.mailMsg } });
        if (error) {
          let j = null; try { j = error.context && typeof error.context.json === 'function' ? await error.context.json() : null; } catch (e) { }
          const st = error.context && error.context.status;
          // a missing function (not deployed yet) answers 404 without our error code
          throw { code: j && j.error ? j.error : st === 404 ? 'not_configured' : 'other', limit: j && j.limit };
        }
        view.mail = { sentTo: to }; toast(tf('mailSent', { e: to }));
      } catch (e) { view.mail = { err: (e && e.code) || 'other', limit: e && e.limit }; }
      refreshMailBox();
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
    async resetProgress() { if (!await askConfirm({ title: t('resetProgress'), body: t('confirmReset'), ok: t('resetProgress'), danger: true })) return; state.progress = Object.assign(emptyProgress(), { resetAt: new Date().toISOString() }, state.progress.level ? { level: state.progress.level } : {}); save(); render(); },  // the chosen level is a setting, not a record: it stays
    deleteReport(el) { if (!confirm(t('confirmDel'))) return; state.studentReports = state.studentReports.filter(r => r.id !== el.dataset.id); view.studentSource = 'local'; save(); render(); },
    // settings
    useMyEmail() { const el = $('#stTeacherEmail'); if (el && ui.user && ui.user.email) { el.value = ui.user.email; el.focus(); } },
    saveSettings() {
      const s = state.settings, em = $('#stTeacherEmail'), ev = em ? em.value.trim() : '';
      // every refusal comes first, so a refused save changes nothing; an address left as it was (e.g. from the class material) is not checked again
      if (ev && ev !== (s.teacherEmail || '') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev)) { toast(t('badEmail')); em.focus(); return; }
      const code = ui.teacher && $('#stCode') ? $('#stCode').value.trim() : '';
      // in cloud mode the invite code lives only in the database, never in the shared material
      const newCode = cloud.configured && ui.teacher && code !== cloud.teacherCode;
      if (newCode && code && code.length < 8) { toast(t('inviteTooShort')); return; }
      if (newCode && !code && !confirm(t('inviteClearConfirm'))) return;
      if (ui.teacher && $('#stExamName')) { s.examName = $('#stExamName').value.trim() || s.examName; s.examNameEn = $('#stExamNameEn').value.trim(); }
      const d = $('#stExamDate').value; if (d && d !== s.examDate) setExamDate(d);
      if ($('#stStudent')) s.studentName = $('#stStudent').value.trim();
      if (em) s.teacherEmail = ev;
      if (newCode) { if (cloud.enabled && ui.user.cloud) cloud.sb.rpc('set_teacher_code', { new_code: code }).then(sbCheck).then(() => { cloud.teacherCode = code; toast(t(code ? 'inviteSaved' : 'inviteCleared')); }, e => toast('☁️ ' + e.message)); }
      else if (!cloud.configured && code) s.teacherCode = code;
      save(); toast(t('saved')); render();
    },
    exportAll() { download(`tve-exam-all-${todayStr()}.json`, state); },
    exportContent() { shareOrDownload(`tve-exam-material-${todayStr()}.json`, { settings: { examName: state.settings.examName, examNameEn: state.settings.examNameEn, examDate: state.settings.examDate, motto: state.settings.motto }, articles: state.articles, vocab: state.vocab, hiddenVocab: state.hiddenVocab || [], hiddenArticles: state.hiddenArticles || [] }, t('exportContent')); },
    resetAll() { if (!ui.teacher) return; if (!confirm(t('confirmResetAll'))) return; const p = state.progress, code = state.settings.teacherCode; state = { settings: Object.assign(clone(SEED_DATA.settings), { teacherCode: code }), articles: clone(SEED_DATA.articles), vocab: clone(SEED_DATA.vocab), hiddenVocab: [], hiddenArticles: [], seedArticles: state.seedArticles, progress: p, progressOwner: state.progressOwner || null, progressBase: state.progressBase || null, studentReports: state.studentReports, accounts: state.accounts }; save(); render(); },
    deleteAccount(el) { if (!ui.teacher) return; if (!confirm(t('confirmDel'))) return; state.accounts = state.accounts.filter(a => a.id !== el.dataset.id); save(); render(); },
    openAuth() { openAuth('login'); },
    openCity(el) { openCity(el.dataset.id, el); },
    closeCity() { closeCity(); },
    openGuide(el) { openGuide(el); },
    citySpeak(el) { const c = cityById(view.city); speakLines([el.dataset.word], c ? c.lang : 'en-US'); },
    cityPlay() { const c = cityById(view.city); if (c) speakLines(c.dialogue.lines.map(l => l.en), c.lang); },
    cityZh(el) { view.cityZh = el.dataset.v === '1'; renderCity(); },
    cityAnswer(el) {
      const c = cityById(view.city), q = view.cityQuiz, i = +el.dataset.q; if (!c || q[i] != null) return;
      q[i] = +el.dataset.o;
      if (c.quiz.every((_, k) => q[k] != null)) { const rec = state.progress.cities[c.id]; rec.best = Math.max(rec.best || 0, c.quiz.filter((x, k) => q[k] === x.answer).length); bumpDay(); save(); }
      renderCity();
    },
    citySaveWord(el) { actions.saveNewsWord(el); renderCity(); },
    cityRead(el) { closeCity(true); actions.openArticleHome(el); },
    cityNews(el) { closeCity(true); view.newsArticle = el.dataset.link; nav('news'); },
    async loadAccounts() { if (!ui.teacher) return; try { await loadCloudAccounts(); render(); } catch (e) { toast('☁️ ' + e.message); } },
    async loadCloud() { if (!ui.teacher) return; try { await loadCloudStudents(); toast(tf('cloudLoaded', { n: view.cloudStudents.length })); if (view.cloudStudents.length && view.studentSource === 'local') view.studentSource = view.cloudStudents[0].id; render(); } catch (e) { toast('☁️ ' + e.message); } }
  };

  /* ---------------- Events ---------------- */
  $('#app').addEventListener('click', e => {
    const el = e.target.closest('[data-action]'); if (!el || !$('#app').contains(el)) return;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
    const fn = actions[el.dataset.action]; if (fn) { e.preventDefault(); flushSearch(); fn(el); }
  });
  $('#app').addEventListener('change', e => {
    if (!SEARCH_IDS.test(e.target.id)) flushSearch();
    const id = e.target.id;
    if (id === 'voicePick') { ui.voiceURI = e.target.value; saveUi(); refreshVoiceCard(); const v = $('#voicePick'); if (v) v.focus({ preventScroll: true }); speak(t('voiceSample')); return; }
    if (id === 'fsUnit' || id === 'fsUnitSet') view.flashSetup.unit = e.target.value, render();
    else if (id === 'fsLimit') view.flashSetup.limit = +e.target.value, render();
    else if (id === 'trGroupSel') Object.assign(view.trf, { group: +e.target.value, page: 0 }), render();
    else if (id === 'phrCatSel') Object.assign(view.phr, { cat: e.target.value, page: 0 }), render();
    else if (id === 'phrLevelSel') Object.assign(view.phr, { level: e.target.value, page: 0 }), render();
    else if (e.target.classList.contains('pager-sel') && e.target.dataset.pager === 'phrGo') view.phr.page = +e.target.value, render();
    else if (e.target.classList.contains('pager-sel') && e.target.dataset.pager === 'trGo') view.trf.page = +e.target.value, render(), trScrollTop();
    else if (e.target.classList.contains('pager-sel')) view.vocabPage = +e.target.value, render();
    else if (id === 'qsType') view.quizSetup.type = e.target.value;
    else if (id === 'qsUnit' || id === 'qsUnitSet') view.quizSetup.unit = e.target.value, render();
    else if (id === 'qsCount') view.quizSetup.count = +e.target.value;
    else if (id === 'vocabUnit' || id === 'vocabUnitSet') view.vocabUnit = e.target.value, view.vocabPage = 0, render();
    else if (id === 'studentSource') view.studentSource = e.target.value, render();
    else if (id === 'importFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { try {
      // in cloud mode a teacher's import changes the material of the whole class: say what will change first
      if (cloud.configured && ui.teacher && obj && obj.type !== 'student-report' && !confirm(tf('importClassConfirm', { a: Array.isArray(obj.articles) ? obj.articles.length : 0, v: Array.isArray(obj.vocab) ? obj.vocab.length : 0 }))) return; const r = importJSON(obj, $('#importMode').value); toast(r === 'report' ? t('reportImported') : t('imported')); if (r === 'report' && ui.teacher) view.page = 'students'; render(); } catch (x) { toast(t('importFail')); } }); }
    else if (id === 'reportFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { if (obj && obj.type === 'student-report') { addReport(obj); toast(t('reportImported')); render(); } else toast(t('notReport')); }); }
  });
  // Search boxes re-render the page, which would throw away a Zhuyin/IME word still being composed:
  // wait for the composition to end, and for a short pause in typing.
  const SEARCH_IDS = /^(readSearch|phrSearch|vocabSearch|grQ)$/;
  let composing = false, searchT = null, searchId = null;
  function applySearch(el) {
    if (el.id === 'readSearch') view.readFilter.q = el.value;
    else if (el.id === 'phrSearch') { view.phr.q = el.value; view.phr.page = 0; }
    else if (el.id === 'vocabSearch') { view.vocabSearch = el.value; view.vocabPage = 0; }
    else if (el.id === 'grQ') view.gr.q = el.value;
    else return false;
    return true;
  }
  function onSearch(el) {
    if (!applySearch(el)) return;
    const id = el.id, pos = el.selectionStart; render();
    const i = document.getElementById(id); if (i) { i.focus({ preventScroll: true }); try { i.setSelectionRange(pos, pos); } catch (x) { } }
  }
  // a tap or a menu change right after typing applies the waiting search first, so it acts on what the box shows
  function flushSearch() { if (!searchT) return; clearTimeout(searchT); searchT = null; const el = document.getElementById(searchId); if (el) applySearch(el); }
  $('#app').addEventListener('compositionstart', () => { composing = true; });
  $('#app').addEventListener('compositionend', e => { composing = false; if (SEARCH_IDS.test(e.target.id)) { clearTimeout(searchT); searchT = null; onSearch(e.target); } });
  $('#app').addEventListener('input', e => {
    if (!SEARCH_IDS.test(e.target.id) || composing || e.isComposing) return;
    const id = e.target.id; clearTimeout(searchT); searchId = id;
    searchT = setTimeout(() => { searchT = null; const el = document.getElementById(id); if (el) onSearch(el); }, 180);
  });
  $('#app').addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-action]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; } // SVG elements have no .click()
    if (e.target.id === 'trInput' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); actions.trCheck(); }
    // on a phone keyboard the return key (labelled 完成) checks the answer
    else if (e.target.id === 'trInput' && e.key === 'Enter' && !e.shiftKey && !e.isComposing && matchMedia('(pointer: coarse)').matches) { e.preventDefault(); actions.trCheck(); }
    if (e.target.id === 'spellInput' && e.key === 'Enter') { e.preventDefault(); if (view.quiz && view.quiz.answered) actions.quizNext(); else actions.spellCheck(); }
  });
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || !askEl.classList.contains('hidden') || !$('#moreSheet').classList.contains('hidden') || !$('#lvDrawer').classList.contains('hidden') || !$('#tour').classList.contains('hidden') || !$('#tourInvite').classList.contains('hidden')) return;
    const onControl = e.target.closest && e.target.closest('button, a, input, textarea, select, [role=button]');
    const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
    if (view.page === 'flashcards' && !view.flash && view.quiz && view.quiz.answered && e.key === 'Enter' && view.quiz.idx < view.quiz.qs.length && !onControl) { e.preventDefault(); actions.quizNext(); return; }
    // ← / → (k / d) work even when a button has focus; Space and Enter on a focused button keep pressing that button
    if (!view.flash || view.page !== 'flashcards' || view.flash.idx >= view.flash.queue.length || typing || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'Enter') { if (onControl) return; e.preventDefault(); actions.flip(); }
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
      <div class="cal-head"><button type="button" data-cal="-12" aria-label="${t('calPrevYear')}">«</button><button type="button" data-cal="-1" aria-label="${t('calPrevMonth')}">‹</button>
        <div class="cal-title"><span class="cal-month">${t('monthsLong')[cal.m]}</span> <span class="cal-year">${cal.y}</span></div>
        <button type="button" data-cal="1" aria-label="${t('calNextMonth')}">›</button><button type="button" data-cal="12" aria-label="${t('calNextYear')}">»</button></div>
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
  // a student's own exam date stays theirs: the class material from the cloud no longer overwrites it
  function setExamDate(d) { state.settings.examDate = d; if (ui.teacher) delete state.settings.ownExamDate; else state.settings.ownExamDate = d; }
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
    if (day && !day.disabled) { setExamDate(day.dataset.date); save(); closeCal(); toast(t('saved')); render(); }
  });
  setInterval(() => { const el = document.getElementById('mcTimer'); if (el && view.mc && view.mc.mode === 'test' && !view.mc.done) el.textContent = '⏱️ ' + fmtDur(Math.round((Date.now() - view.mc.start) / 1000)); }, 1000);
  document.addEventListener('click', () => { if (cal.open) closeCal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cal.open) closeCal(); });
  window.addEventListener('resize', () => { if (cal.open) placeCal(); fitWords(); });
  if (document.fonts) { document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', fitWords); if (document.fonts.ready) document.fonts.ready.then(fitWords); }
  window.addEventListener('scroll', () => { if (cal.open) placeCal(); }, { passive: true });
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) goGroup(b.dataset.group, DESK_GROUPS, 'd:'); });
  // the phone's category row (閱讀 · 單字 · 文法 / 選擇題 · 克漏字 · 翻譯) works like the desktop tabs
  $('#bnav').addEventListener('click', e => { const b = e.target.closest('.bnav-btn'); if (!b) return; if (b.dataset.group === 'more') openMore(); else goGroup(b.dataset.group, GROUPS, ''); });
  // the iPhone back swipe (and the browser back button) moves between pages; sessions stay open and can be resumed
  window.addEventListener('popstate', () => {
    // only "#/…" addresses; Supabase sign-in hashes (and the empty hash it leaves behind) are not page changes
    if (!isRouteHash(location.hash)) return;
    const fromArticle = view.page === 'reading' && !!view.articleId, fromNews = view.page === 'news' && !!view.newsArticle;
    // a dialog or sheet left open would act on the new page: close them all (an open 要結束嗎？ counts as 繼續作答)
    closeAsk(false); closeAuth(); closeMore(); closeGuide(true); closeLvDrawer(true); endTour(false); if (cal.open) closeCal(); if (view.city) closeCity(true);
    if (!applyRoute(location.hash)) return;
    speakStop();
    view.pillsFor = sessionOf(view.page) || null;
    if (fromArticle && view.page === 'reading' && !view.articleId) showReadingList();
    else if (fromNews && view.page === 'news' && !view.newsArticle) { render({ focusHeading: true }); jumpTo(view.newsScroll || 0); }
    else { render({ focusHeading: true }); jumpTo(0); }
  });

  /* ---- 更多 sheet (phone): 設定, 使用導覽, account, appearance ---- */
  const THEMES = [['navy', '#1f3b73', '#f6c445'], ['forest', '#1f4d3a', '#f2d388'], ['plum', '#4b2353', '#ffd27a'], ['sakura', '#b83f73', '#fff0a6'], ['mint', '#227a6e', '#ffe08a'], ['sunset', '#b84a2c', '#ffe27a']];
  const moreEl = $('#moreSheet');
  let moreOpener = null;
  function renderMore() {
    const cur = groupOf(view.page) === 'more' ? view.page : '';
    const tile = (key, ico, label, sub) => `<button type="button" class="more-tile" data-more="${key}"${cur === key ? ' aria-current="page"' : ''}><span class="mt-ico" aria-hidden="true">${ico}</span><span class="mt-txt">${label}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
    const seg = (kind, val, opts, label) => `<div class="seg" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" class="seg-btn ${val === v ? 'on' : ''}" data-more-${kind}="${v}" aria-pressed="${val === v}">${l}</button>`).join('')}</div>`;
    // only settings: the study pages are under 學習 and 練習 (字根字首 is a pill of 單字)
    $('.modal-card', moreEl).innerHTML = `<div class="sheet-grab" aria-hidden="true"></div>
      <div class="sheet-head"><h2 id="moreTitle">${t('grpMore')}</h2><button type="button" class="modal-close" data-more="close" aria-label="${t('close')}">✕</button></div>
      <h3 class="sheet-sec sheet-sec-first">⚙️ ${t('moreAccount')}</h3>
      <div class="more-tiles three">${tile('settings', '⚙️', t('tabSettings'))}${tile('tour', '🧭', t('tourAgain'))}${tile('account', ui.user ? (ui.teacher ? '🧑‍🏫' : '🎓') : '👤', ui.user ? esc(ui.user.name) : `${t('login')} / ${t('register')}`, ui.user ? t('logout') : '')}</div>
      <h3 class="sheet-sec">🎨 ${t('appearance')}</h3>
      <div class="ap-row"><span class="ap-lbl">${t('langLabel')}</span>${seg('lang', ui.lang, [['zh', '中文'], ['en', 'English']], t('langLabel'))}</div>
      <div class="ap-row"><span class="ap-lbl">${t('fontLabel')}</span>${seg('font', ui.font, [['hand', t('fontHand')], ['clean', t('fontClean')]], t('fontLabel'))}</div>
      <div class="ap-row"><span class="ap-lbl">${t('voiceShort')}</span>${sysVoice && !voiceKnown() ? `<span class="small muted">${t('voiceAndroidShort')}</span>` : seg('voice', ui.voice === 'f' ? 'f' : 'm', [['m', '👨 ' + t('voiceMale')], ['f', '👩 ' + t('voiceFemale')]], t('voiceTitle'))}</div>
      <div class="swatches" role="group" aria-label="${t('swatchLabel')}">${THEMES.map(([id, c, ac]) => `<button type="button" class="swatch" data-more-theme="${id}" aria-pressed="${ui.theme === id}" style="--sw:${c};--sw-a:${ac}"><i aria-hidden="true"></i><span>${t('theme' + id[0].toUpperCase() + id.slice(1))}</span></button>`).join('')}</div>`;
  }
  function openMore() { moreOpener = document.activeElement; renderMore(); moreEl.classList.remove('hidden'); setTimeout(() => { const b = $('.more-tile', moreEl); if (b) b.focus({ preventScroll: true }); }, 30); }
  function closeMore() { if (moreEl.classList.contains('hidden')) return; moreEl.classList.add('hidden'); if (moreOpener && document.contains(moreOpener)) moreOpener.focus({ preventScroll: true }); }
  moreEl.addEventListener('click', async e => {
    if (e.target === moreEl) { closeMore(); return; }
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.more === 'close') closeMore();
    else if (d.more === 'account') { closeMore(); if (ui.user) logoutFlow(); else openAuth('login'); }
    else if (d.more === 'tour') { closeMore(); startTour(); }
    else if (d.more) { moreEl.classList.add('hidden'); nav(d.more); }
    else if (d.moreVoice) { ui.voice = d.moreVoice === 'f' ? 'f' : 'm'; saveUi(); refreshVoiceCard(); renderMore(); const same = $(`[data-more-voice="${ui.voice}"]`, moreEl); if (same) same.focus({ preventScroll: true }); speak(t('voiceSample')); }
    else if (d.moreLang || d.moreFont || d.moreTheme) {
      if (d.moreLang) ui.lang = d.moreLang; if (d.moreFont) ui.font = d.moreFont; if (d.moreTheme) ui.theme = d.moreTheme;
      saveUi(); applyUi(); render(); renderMore();
      const key = d.moreLang ? `[data-more-lang="${d.moreLang}"]` : d.moreFont ? `[data-more-font="${d.moreFont}"]` : `[data-more-theme="${d.moreTheme}"]`;
      const same = $(key, moreEl); if (same) same.focus({ preventScroll: true });
    }
  });

  /* ---- 我的程度: a drawer pulled out from the left edge (tap the 🎯 tab, or drag it to the right) ---- */
  const lvDrawer = $('#lvDrawer'), lvHandle = $('#lvHandle'), lvCard = $('.modal-card', lvDrawer);
  let lvOpener = null, lvDrag = null, lvTipDone = false, lvTipWho = null;
  function renderLvHandle() {
    // the "先選你的程度" tip shows for a few seconds, once per account (a new account without a level gets it again)
    const who = ui.user ? ui.user.id : ''; if (who !== lvTipWho) { lvTipWho = who; lvTipDone = false; }
    const lv = myLevel(), html = `<span class="sr-only">${esc(t(lv ? 'lvMine' : 'lvPickTitle'))}：</span><span class="lvh-ico" aria-hidden="true">🎯</span><span class="lvh-txt">${lv ? esc(lv) : t('lvHandleShort')}</span>`
      + (levelAsked() || lvTipDone ? '' : `<span class="lvh-tip" aria-hidden="true">${t('lvTip')}</span>`);
    if (lvHandle.dataset.html !== html) { lvHandle.innerHTML = html; lvHandle.dataset.html = html; }
    lvHandle.classList.toggle('ask', !levelAsked());
  }
  function renderLvDrawer() {
    lvCard.innerHTML = `<div class="sheet-head"><h2 id="lvDrawerTitle">🎯 ${t(levelAsked() ? 'lvMine' : 'lvPickTitle')}</h2><button type="button" class="modal-close" data-lv="close" aria-label="${t('close')}">✕</button></div>
      <p class="small muted lv-sub">${t('lvPickSub')}</p>${levelOptions()}
      <div class="lv-foot"><p class="small muted">${t('lvLaterNote')}</p>${levelAsked() ? '' : `<button type="button" class="btn sm ghost" data-action="setLevel" data-v="">${t('lvSkip')}</button>`}</div>`;
  }
  function openLvDrawer(dragging) {
    if (!lvDrawer.classList.contains('hidden')) return;
    lvOpener = document.activeElement; renderLvDrawer();
    lvDrawer.classList.toggle('dragging', !!dragging); lvDrawer.classList.remove('hidden'); lvHandle.setAttribute('aria-expanded', 'true');
    if (!dragging) setTimeout(() => { const b = $('.level-opt.on', lvDrawer) || $('.level-opt', lvDrawer); if (b) b.focus({ preventScroll: true }); }, 30);
  }
  function closeLvDrawer(quiet) {
    if (lvDrawer.classList.contains('hidden')) return;
    lvDrawer.classList.add('hidden'); lvDrawer.classList.remove('dragging'); lvCard.style.transform = ''; lvDrawer.style.removeProperty('--dim');
    lvHandle.setAttribute('aria-expanded', 'false');
    if (!quiet) (lvOpener && document.contains(lvOpener) && lvOpener !== document.body ? lvOpener : lvHandle).focus({ preventScroll: true });
  }
  // follow the finger: dx > 0 pulls the drawer out from the edge, dx < 0 pushes it back
  const lvFollow = x => { const w = lvCard.offsetWidth || 320; const pos = Math.max(-w, Math.min(0, x)); lvCard.style.transform = `translateX(${pos}px)`; lvDrawer.style.setProperty('--dim', String(1 + pos / w)); };
  lvHandle.addEventListener('animationend', e => { if (e.animationName !== 'lvTipOut') return; lvTipDone = true; const tip = $('.lvh-tip', lvHandle); if (tip) tip.remove(); lvHandle.dataset.html = lvHandle.innerHTML; });
  lvHandle.addEventListener('pointerdown', e => { if (e.button) return; lvDrag = { x: e.clientX, from: 'handle', moved: false }; lvHandle.setPointerCapture(e.pointerId); });
  lvHandle.addEventListener('pointermove', e => {
    if (!lvDrag || lvDrag.from !== 'handle') return; const dx = e.clientX - lvDrag.x;
    if (!lvDrag.moved && dx > 16) { lvDrag.moved = true; openLvDrawer(true); }
    if (lvDrag.moved) lvFollow(dx - (lvCard.offsetWidth || 320));
  });
  // a drag ends: past 60 px it opens (from the tab) or closes (on the drawer); otherwise it snaps back. The click that follows a drag is not a tap.
  const lvRelease = (e, cancel) => {
    if (!lvDrag) return; const d = lvDrag; lvDrag = null; if (!d.moved) return;
    const dx = e.clientX - d.x, el = d.from === 'handle' ? lvHandle : lvDrawer;
    el.dataset.dragged = '1'; setTimeout(() => { delete el.dataset.dragged; }, 0);
    lvCard.style.transform = ''; lvDrawer.style.removeProperty('--dim');
    if (d.from === 'handle') {
      if (cancel || dx < 60) closeLvDrawer(true);
      else { const b = $('.level-opt.on', lvDrawer) || $('.level-opt', lvDrawer); if (b) b.focus({ preventScroll: true }); }
    } else if (!cancel && dx < -60) closeLvDrawer();
  };
  lvHandle.addEventListener('pointerup', e => lvRelease(e)); lvHandle.addEventListener('pointercancel', e => lvRelease(e, true));
  const lvToggle = () => { if (lvDrawer.classList.contains('hidden')) openLvDrawer(); else closeLvDrawer(); };
  lvHandle.addEventListener('click', () => { if (lvHandle.dataset.dragged) return; lvToggle(); });
  lvHandle.addEventListener('touchend', e => { if (!e.cancelable) return; e.preventDefault(); if (!lvHandle.dataset.dragged) lvToggle(); });
  // swipe the open drawer back to the left to close it (vertical scrolling inside still works)
  lvCard.addEventListener('pointerdown', e => { if (e.button || e.pointerType === 'mouse') return; lvDrag = { x: e.clientX, from: 'card', moved: false }; });
  lvCard.addEventListener('pointermove', e => {
    if (!lvDrag || lvDrag.from !== 'card') return; const dx = e.clientX - lvDrag.x;
    if (!lvDrag.moved && dx < -12) { lvDrag.moved = true; lvDrawer.classList.add('dragging'); }
    if (lvDrag.moved) lvFollow(Math.min(0, dx));
  });
  lvCard.addEventListener('pointerup', e => { if (lvDrag && lvDrag.from === 'card') lvRelease(e); });
  lvCard.addEventListener('pointercancel', e => { if (lvDrag && lvDrag.from === 'card') lvRelease(e, true); });
  lvDrawer.addEventListener('click', e => {
    if (lvDrawer.dataset.dragged) return;
    if (e.target === lvDrawer) { closeLvDrawer(); return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.lv === 'close') closeLvDrawer();
    else if (b.dataset.action === 'setLevel') actions.setLevel(b);
  });

  /* ---- First visit: a big see-through card floats in the middle of the home page and offers the tour ---- */
  const invEl = $('#tourInvite'), invCard = $('.ti-card', invEl); let invLang = '';
  // shown on the home page until it is answered (開始導覽 / 不用了 / Esc / a tap outside); the 👈 level tip waits for it
  function syncTourInvite() {
    const want = view.page === 'home' && !ui.tour && tour.i < 0 && !inSessionNow(), was = !invEl.classList.contains('hidden');
    if (want && (!was || invLang !== ui.lang)) {
      invLang = ui.lang;
      invCard.innerHTML = `<div class="ti-wave" aria-hidden="true">👋</div><h2 id="tourInviteH">${t('tourInviteT')}</h2><p id="tourInviteB">${t('tourInviteB')}</p>
        <div class="ti-btns"><button type="button" class="btn accent" data-inv="yes">🧭 ${t('tourStart')}</button><button type="button" class="btn ghost" data-inv="no">${t('tourNo')}</button></div>`;
      setTimeout(() => { const b = $('[data-inv=yes]', invCard); if (b && !invEl.classList.contains('hidden')) b.focus({ preventScroll: true }); }, 30);
    }
    invEl.classList.toggle('hidden', !want); document.body.classList.toggle('tour-invited', want);
  }
  // a tap outside the card answers 不用了 only when it starts and ends outside (a press that slides off a button does not);
  // the second tap of a double-tap must not land on the page underneath
  let invDown = false, invUp = false;
  invEl.addEventListener('pointerdown', e => { invDown = e.target === invEl; });
  invEl.addEventListener('pointerup', e => { invUp = e.target === invEl; });
  const invNo = () => {
    actions.tourNo();
    const eat = ev => { ev.stopPropagation(); ev.preventDefault(); };
    document.addEventListener('click', eat, true); setTimeout(() => document.removeEventListener('click', eat, true), 350);
  };
  invEl.addEventListener('click', e => {
    const b = e.target.closest('[data-inv]');
    if (b) b.dataset.inv === 'yes' ? actions.tourYes() : invNo();
    else if (e.target === invEl && invDown && invUp) invNo();
  });

  /* ---- First-visit tour: a dimmed walk-through with one spotlight per step (the 🎯 tab, the menu, the countdown, language, login, records) ---- */
  const tourEl = $('#tour'), tourSpot = $('.tour-spot', tourEl), tourCard = $('.tour-card', tourEl), tourLive = $('#tourLive');
  const tour = { i: -1, steps: [], opener: null, y: 0 };
  const shown = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  // false for anything inside a fixed or sticky bar (scrolling the page would not move it)
  const inFlow = el => { for (let e = el; e && e !== document.body; e = e.parentElement) if (/fixed|sticky/.test(getComputedStyle(e).position)) return false; return true; };
  function tourSteps() {
    const phone = matchMedia('(max-width: 760px)').matches;
    return [{ k: 'tour1' }, { sel: '#lvHandle', k: 'tour2' }, { sel: phone ? '#bnav' : '#tabs', k: 'tour3' }, { sel: '#examChip', k: 'tour4' },
      { sel: phone ? '#langSelectM' : '#langSelect', k: 'tour5' }, { sel: '#authBtn', k: 'tour6' },
      { sel: phone ? '.bnav-btn[data-group=record]' : '.tab[data-group=record]', k: phone ? 'tour7m' : 'tour7d' }, { k: 'tour8', last: true }]
      .filter(x => !x.sel || shown($(x.sel)));
  }
  function startTour() {
    if (inSessionNow()) return toast(t('sessionOpenFirst'));
    closeMore(); closeLvDrawer(true);
    tour.opener = document.activeElement; tour.steps = tourSteps(); tour.i = 0; tour.y = scrollY;
    jumpTo(0);
    tourEl.classList.remove('hidden'); document.body.classList.add('touring');
    showTourStep();
  }
  function showTourStep(announce) {
    const x = tour.steps[tour.i], n = tour.steps.length;
    const body = x.last ? t(myLevel() ? 'tour8B2' : 'tour8B') : t(x.k + 'B');
    tourCard.innerHTML = `<p class="tour-count" aria-hidden="true">${tour.steps.map((_, j) => `<i class="${j === tour.i ? 'on' : ''}"></i>`).join('')}<span>${tour.i + 1} / ${n}</span></p>
      <h2 id="tourTitle">${t(x.k + 'T')}</h2><p id="tourText">${body}</p>
      <div class="tour-btns">${tour.i ? `<button type="button" class="btn sm ghost" data-tour="prev">‹ ${t('tourPrev')}</button>` : `<button type="button" class="btn sm ghost" data-tour="skip">${t('tourSkip')}</button>`}<span class="spacer"></span>
        <span class="tour-go">${x.last ? `${myLevel() ? '' : `<button type="button" class="btn sm" data-tour="level">🎯 ${t('tourPickLevel')}</button>`}<button type="button" class="btn sm accent" data-tour="done">${t('tourDone')}</button>` : `<button type="button" class="btn sm accent" data-tour="next">${t('tourNext')} ›</button>`}</span></div>`;
    placeTour();
    const b = $('[data-tour=next], [data-tour=level], [data-tour=done]', tourCard); if (b) b.focus({ preventScroll: true });
    // focus lands on a new button inside the same dialog, so screen readers hear the new step from a live region
    tourLive.textContent = announce ? [t('tourStepOf').replace('{i}', tour.i + 1).replace('{n}', n), t(x.k + 'T'), body].join(ui.lang === 'en' ? '. ' : '。') : '';
  }
  // the spotlight hugs the step's element; the card sits below or above it, else beside it, else (short screens, e.g. a phone held
  // sideways) a wider card below/above, else at the screen edge that hides less of it. The card never leaves the screen.
  function placeTour(again) {
    const x = tour.steps[tour.i]; if (!x) return;
    const vw = document.documentElement.clientWidth, vh = innerHeight, M = 12, pad = 6, gap = 14, cap = Math.max(0, vh - 2 * M);
    // the card's full height at width w (on a very short screen it is capped and only its text scrolls; the buttons stay)
    const size = w => { tourCard.style.width = w + 'px'; tourCard.style.maxHeight = 'none'; const h = tourCard.offsetHeight; tourCard.style.maxHeight = cap + 'px'; return h; };
    const tx0 = $('#tourText', tourCard), keep = tx0 ? tx0.scrollTop : 0; // re-placing must not lose where a long text was scrolled to
    const put = (l, t, w) => {
      const h = Math.min(size(w), cap), tx = tx0; if (tx) tx.scrollTop = keep;
      Object.assign(tourCard.style, { left: Math.max(M, Math.min(l, vw - w - M)) + 'px', top: Math.max(M, Math.min(t, vh - h - M)) + 'px' });
      tourCard.classList.toggle('scroll', tourCard.scrollHeight > tourCard.clientHeight + 1 || (!!tx && tx.scrollHeight > tx.clientHeight + 1));
    };
    const cw = Math.max(0, Math.min(360, vw - 2 * M)), el = x.sel && $(x.sel);
    if (!shown(el)) {
      Object.assign(tourSpot.style, { left: vw / 2 + 'px', top: vh / 2 + 'px', width: '0px', height: '0px' }); tourSpot.classList.add('none');
      const h = size(cw); put((vw - cw) / 2, (vh - h) / 2, cw); return;
    }
    tourSpot.classList.remove('none');
    { const q = el.getBoundingClientRect(); if (q.bottom < 0 || q.top > vh || (inFlow(el) && (q.top < 0 || q.bottom > vh))) el.scrollIntoView({ block: 'center' }); } // (partly) scrolled away: bring it back
    const r = el.getBoundingClientRect(), L = Math.max(2, r.left - pad), T = Math.max(2, r.top - pad), R = Math.min(vw - 2, r.right + pad), B = Math.min(vh - 2, r.bottom + pad);
    Object.assign(tourSpot.style, { left: L + 'px', top: T + 'px', width: Math.max(0, R - L) + 'px', height: Math.max(0, B - T) + 'px' });
    const upper = (T + B) / 2 < vh / 2;
    const vert = w => {
      const h = size(w), fitsBelow = B + gap + h <= vh - M, fitsAbove = T - gap - h >= M;
      if (!fitsBelow && !fitsAbove) return false;
      put((L + R) / 2 - w / 2, (upper ? fitsBelow : !fitsAbove) ? B + gap : T - gap - h, w); return true;
    };
    if (vert(cw)) return;
    // beside it, on the wider side, when that side is roomy enough to read
    const roomR = vw - R - gap - M, roomL = L - gap - M, side = Math.min(cw, Math.max(roomR, roomL));
    if (side >= 200) { const h = size(side); if (h <= vh - 2 * M) { put(roomR >= roomL ? R + gap : L - gap - side, (T + B) / 2 - h / 2, side); return; } }
    const wide = Math.max(cw, Math.min(560, vw - 2 * M));
    if (wide > cw && vert(wide)) return;
    // still nothing: a target in the page flow (the tabs of the computer layout on a phone held sideways) scrolls up near the top
    if (!again && r.top > M + pad && inFlow(el)) { jumpTo(scrollY + r.top - pad - M); return placeTour(true); }
    // nothing fits: the screen edge that covers less of the highlighted thing
    const h = size(wide), over = t => Math.max(0, Math.min(B, t + h) - Math.max(T, t));
    put((vw - wide) / 2, over(M) <= over(vh - M - h) ? M : vh - M - h, wide);
  }
  function tourGo(d) { const j = tour.i + d; if (j < 0 || j >= tour.steps.length) return; tour.i = j; showTourStep(true); }
  // seen = the tour was finished or skipped (the invitation goes away); a back swipe only hides it
  function endTour(seen) {
    if (tour.i < 0) return;
    tour.i = -1; tourEl.classList.add('hidden'); document.body.classList.remove('touring'); tourLive.textContent = '';
    if (seen) { ui.tour = 1; saveUi(); if (view.page === 'home') render(); }
    const o = tour.opener; if (seen) { const back = !!o && o !== document.body && shown(o), h = back ? o : $('#app h1'); jumpTo(back ? tour.y : 0); if (h) h.focus({ preventScroll: true }); }
  }
  tourEl.addEventListener('click', e => {
    const b = e.target.closest('[data-tour]'); if (!b) return; const d = b.dataset.tour;
    if (d === 'next') tourGo(1); else if (d === 'prev') tourGo(-1);
    else if (d === 'skip' || d === 'done') endTour(true);
    else if (d === 'level') { endTour(true); openLvDrawer(); }
  });
  // rotating a phone (or resizing past 760px) swaps the bottom bar for the tabs: rebuild the steps and keep the place
  window.addEventListener('resize', () => {
    if (tour.i < 0) return;
    const fresh = tourSteps(), sig = s => s.map(x => x.k + (x.sel || '')).join(), base = k => k.replace(/(\d)[md]$/, '$1');
    if (sig(fresh) === sig(tour.steps)) { placeTour(); return; }
    const j = fresh.findIndex(x => base(x.k) === base(tour.steps[tour.i].k));
    tour.steps = fresh; tour.i = j >= 0 ? j : Math.min(tour.i, fresh.length - 1); showTourStep();
  });
  // the page must not scroll away under the spotlight (a swipe on the dim layer, the wheel); a long card scrolls by itself
  const tourKeepPage = e => {
    if (e.ctrlKey || (e.touches && e.touches.length > 1)) return; // pinch / Ctrl+wheel zoom
    const over = el => !!el && el.scrollHeight > el.clientHeight + 1, tx = e.target.closest && e.target.closest('#tourText');
    if (!(tourCard.contains(e.target) && (over(tourCard) || over(tx)))) e.preventDefault();
  };
  tourEl.addEventListener('wheel', tourKeepPage, { passive: false });
  tourEl.addEventListener('touchmove', tourKeepPage, { passive: false });
  window.addEventListener('scroll', () => { if (tour.i >= 0) placeTour(); }, { passive: true });
  // answered in another tab: the invitation goes away here too
  // the theme and font chosen in another tab, or on the 字根字首 page: follow them, so this page does not write the old ones back
  function followLook(o) {
    let ch = false;
    if (THEMES.some(x => x[0] === o.theme) && o.theme !== ui.theme) { ui.theme = o.theme; ch = true; }
    if ((o.font === 'hand' || o.font === 'clean') && o.uiv !== 3 && o.font !== ui.font) { ui.font = o.font; ch = true; }
    if (ch) { applyUi(); if (!moreEl.classList.contains('hidden')) renderMore(); }
  }
  // back from the 字根字首 page with the browser's Back (the old page is kept as it was): read the choices again
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    let o = {}; try { o = JSON.parse(localStorage.getItem(LS_UI) || '{}') || {}; } catch (x) { }
    followLook(o);
    if ((o.voice === 'f' || o.voice === 'm') && o.voice !== (ui.voice === 'f' ? 'f' : 'm')) { ui.voice = o.voice; refreshVoiceCard(); }
  });
  window.addEventListener('storage', e => {
    if (e.key !== LS_UI) return;
    let o = {}; try { o = JSON.parse(e.newValue || '{}') || {}; } catch (x) { }
    if (o.tour && !ui.tour) { ui.tour = 1; syncTourInvite(); }
    followLook(o);
    // another tab changed the reading voice: follow it, so this tab does not write the old one back
    if ((o.voice === 'f' || o.voice === 'm') && o.voice !== (ui.voice === 'f' ? 'f' : 'm')) { ui.voice = o.voice; refreshVoiceCard(); if (!moreEl.classList.contains('hidden')) renderMore(); }
  });
  // a click on the dim layer or the card text keeps focus on the card's buttons
  tourEl.addEventListener('mousedown', e => { if (!e.target.closest('button')) e.preventDefault(); });

  /* ---- back to top ---- */
  $('#ttsStop').addEventListener('click', () => speakStop());
  // offline / a new version: one quiet line at the top (the practice stays on this device either way)
  const netBar = $('#netBar');
  function netState() {
    const upd = !!window.__swUpdated, off = navigator.onLine === false;
    netBar.hidden = !upd && !off; netBar.className = 'net-bar' + (upd ? ' upd' : off ? ' off' : '');
    netBar.innerHTML = upd ? `<span>${t('netUpdated')}</span><button type="button" class="btn sm accent" id="netReload">${t('netReload')}</button>` : off ? `<span>${t('netOffline')}</span>` : '';
    const b = $('#netReload'); if (b) b.addEventListener('click', () => { if (inSessionNow() || sessionPages().length) { if (!confirm(t('netReloadAsk'))) return; } location.reload(); });
  }
  window.addEventListener('online', netState); window.addEventListener('offline', netState); window.addEventListener('sw-updated', netState);
  netState();
  const toTopBtn = $('#toTop');
  function updateToTop() { if (toTopBtn) toTopBtn.hidden = window.scrollY < window.innerHeight * 1.5; }
  window.addEventListener('scroll', updateToTop, { passive: true });
  toTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: smooth() }); const h = $('#app h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } });
  // the on-screen keyboard: keep the bottom action bar above it
  if (window.visualViewport) {
    const kb = () => { const v = window.visualViewport; document.documentElement.style.setProperty('--kb', Math.max(0, Math.round(window.innerHeight - v.height - v.offsetTop)) + 'px'); };
    visualViewport.addEventListener('resize', kb); visualViewport.addEventListener('scroll', kb);
  }
  $('.skip-link').addEventListener('click', e => { e.preventDefault(); $('#app').focus(); });
  // a chip or pill reached with Tab in a sideways-scrolling row is brought fully into view (not left half under the fade)
  $('#app').addEventListener('focusin', e => { const el = e.target, row = el.parentElement; if (row && row.matches('.chip-scroll, .phr-cats, .subtabs') && row.scrollWidth > row.clientWidth) el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });

  // header controls
  const langSel = $('#langSelect'), fontSel = $('#fontSelect'), themeSel = $('#themeSelect'), authBtn = $('#authBtn');
  function updateExamChip() {
    const chip = $('#examChip'); if (!chip) return;
    chip.title = t('chipHint');
    const dl = daysLeft(), ex = new Date(state.settings.examDate + 'T00:00:00');
    $('#miniCalMon').textContent = t('monthsShort')[ex.getMonth()];
    $('#miniCalDay').textContent = ex.getDate();
    $('#examChipDate').textContent = `${state.settings.examDate.replace(/-/g, '/')} (${t('weekdays')[ex.getDay()]})`;
    // English on phones drops the word "left" (see .ecd-left) to leave room for the language drop-down
    $('#examChipDays').innerHTML = dl > 0 ? (ui.lang === 'en' ? `${dl} days<span class="ecd-left"> left</span>` : esc(tf('daysLeftShort', { n: dl }))) : esc(dl === 0 ? t('headerToday') : t('examChipPassed'));
    chip.classList.toggle('soon', dl >= 0 && dl <= 30);
  }
  // today's date and the time under the site title; refreshed on the minute and whenever the page comes back into view
  function updateNow() {
    const el = $('#nowClock'); if (!el) return;
    const d = new Date(), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), wd = t('weekdays')[d.getDay()];
    // phones hide the "今天" / "Today ·" prefix (.now-pre) so the date and the time always fit next to the header controls
    el.innerHTML = ui.lang === 'zh' ? `<span class="now-pre">今天 </span>${d.getMonth() + 1}/${d.getDate()}（${wd}）${hm}` : `<span class="now-pre">Today · </span>${wd}, ${t('monthsShort')[d.getMonth()].charAt(0)}${t('monthsShort')[d.getMonth()].slice(1).toLowerCase()} ${d.getDate()} · ${hm}`;
    el.setAttribute('datetime', `${todayStr()}T${hm}`);
  }
  (function tick() { updateNow(); setTimeout(tick, 60000 - Date.now() % 60000 + 50); })();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { updateNow(); updateExamChip(); } });
  function applyUi() {
    document.body.dataset.font = ui.font; document.body.dataset.theme = ui.theme;
    updateNow();
    document.body.classList.toggle('teacher', ui.teacher);
    authBtn.classList.toggle('logged', !!ui.user);
    updateExamChip();
    $('#authBtnIco').textContent = ui.user ? (ui.user.role === 'teacher' ? '🧑‍🏫' : '🎓') : '👤';
    $('#authBtnText').textContent = ui.user ? `${ui.user.name} · ${t('logout')}` : `${t('login')} / ${t('register')}`;
    langSel.value = ui.lang; fontSel.value = ui.font; themeSel.value = ui.theme;
    $('#langSelectM').value = ui.lang;  // phones: the language drop-down at the top of the header
    const tc = { navy: '#1f3b73', forest: '#1f4d3a', plum: '#4b2353', sakura: '#b83f73', mint: '#227a6e', sunset: '#b84a2c' }[ui.theme] || '#1f3b73';
    const m = $('meta[name=theme-color]'); if (m) m.content = tc;
    applyI18n();
    if (!moreEl.classList.contains('hidden')) renderMore();
  }
  langSel.addEventListener('change', () => { ui.lang = langSel.value; saveUi(); applyUi(); render(); });
  $('#langSelectM').addEventListener('change', e => { ui.lang = e.target.value; saveUi(); applyUi(); render(); });
  fontSel.addEventListener('change', () => { ui.font = fontSel.value; saveUi(); applyUi(); render(); });
  themeSel.addEventListener('change', () => { ui.theme = themeSel.value; saveUi(); applyUi(); render(); });
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
    setAuthErr('');
    const wasOpen = !modal.classList.contains('hidden'); modal.classList.remove('hidden'); if (!wasOpen) setTimeout(() => { if (!modal.contains(document.activeElement)) $('#auEmail').focus(); }, 50);
  }
  function closeAuth() { if (modal.classList.contains('hidden')) return; modal.classList.add('hidden'); $('#authForm').reset(); setAuthErr(''); authBtn.focus({ preventScroll: true }); }
  function setAuthErr(msg) {
    const el = $('#authErr'); el.textContent = msg || ''; el.hidden = !msg;
    ['#auEmail', '#auPass'].forEach(id => { const i = $(id); if (msg) { i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', 'authErr'); } else { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); } });
  }
  async function logoutFlow() {
    if (!ui.user) return;
    if (!await askConfirm({ title: t('logoutAsk'), body: ui.user.name, ok: t('logout'), danger: true })) return;
    authBtn.disabled = true; try { await logoutUser(); } finally { authBtn.disabled = false; }
    toast(t('loggedOut')); applyUi(); render();
  }
  authBtn.addEventListener('click', () => { if (ui.user) logoutFlow(); else openAuth('login'); });
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
      setAuthErr(map[err.code] ? t(map[err.code]) : err.message);
      const bad = $('#auPass'); if (bad) bad.focus();
    } finally { btn.disabled = false; }
  });

  // dialogs: Escape closes, Tab stays inside
  function trapTab(e, box) {
    if (e.key !== 'Tab') return;
    const f = $$('button:not([disabled]), [href], input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', box).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (!box.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); }
    else if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  document.addEventListener('keydown', e => {
    if (!askEl.classList.contains('hidden')) { if (e.key === 'Escape') { e.preventDefault(); closeAsk(false); } else trapTab(e, askEl); return; }
    if (!moreEl.classList.contains('hidden')) { if (e.key === 'Escape') closeMore(); else trapTab(e, moreEl); return; }
    if (!guideModal.classList.contains('hidden')) { if (e.key === 'Escape') { e.preventDefault(); closeGuide(); } else trapTab(e, guideModal); return; }
    if (!lvDrawer.classList.contains('hidden')) { if (e.key === 'Escape') closeLvDrawer(); else trapTab(e, lvDrawer); return; }
    if (!invEl.classList.contains('hidden')) { if (e.key === 'Escape') { e.preventDefault(); actions.tourNo(); } else trapTab(e, invCard); return; }
    if (tour.i >= 0) {
      if (e.key === 'Escape') { e.preventDefault(); endTour(true); } else if (e.key === 'ArrowRight') { e.preventDefault(); tourGo(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); tourGo(-1); }
      else if (e.key === 'Tab' && !tourCard.contains(document.activeElement)) { e.preventDefault(); const f = $$('button', tourCard), b = e.shiftKey ? f[f.length - 1] : f[0]; if (b) b.focus({ preventScroll: true }); }
      else if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End)$/.test(e.key) || (e.key === ' ' && !(e.target.closest && e.target.closest('button')))) {
        e.preventDefault();
        const tx = $('#tourText', tourCard), k = e.key; if (!tx || tx.scrollHeight <= tx.clientHeight + 1) return;
        if (k === 'Home') tx.scrollTop = 0; else if (k === 'End') tx.scrollTop = tx.scrollHeight;
        else if (k !== ' ') tx.scrollTop += (/Up/.test(k) ? -1 : 1) * (/Page/.test(k) ? tx.clientHeight - 16 : 40);
      }
      else trapTab(e, tourCard);
      return;
    }
    if (!modal.classList.contains('hidden')) { if (e.key === 'Escape') closeAuth(); else trapTab(e, modal); }
  }, true);

  // midnight refresh of countdown
  let lastDay = todayStr();
  setInterval(() => { updateExamChip(); if (todayStr() !== lastDay) { lastDay = todayStr(); if (view.page === 'home') render(); } }, 60000);

  applyUi();
  if (isRouteHash(location.hash)) applyRoute(location.hash);
  render();
  initCloud();
})();
