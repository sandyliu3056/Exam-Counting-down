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
  const fmtDate = (iso) => iso ? iso.replace('T', ' ').slice(0, 16) : '';
  const shuffleArr = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- State ---------------- */
  const emptyProgress = () => ({ cards: {}, readingQuizzes: [], vocabQuizzes: [], days: {}, bookmarks: { vocab: [], articles: [] } });

  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { data = null; }
    if (!data) data = { settings: clone(SEED_DATA.settings), articles: clone(SEED_DATA.articles), vocab: clone(SEED_DATA.vocab), progress: emptyProgress(), studentReports: [], accounts: [] };
    data.settings = Object.assign(clone(SEED_DATA.settings), data.settings || {});
    data.articles = data.articles || [];
    data.vocab = data.vocab || [];
    data.progress = Object.assign(emptyProgress(), data.progress || {});
    data.progress.bookmarks = Object.assign({ vocab: [], articles: [] }, data.progress.bookmarks || {});
    data.studentReports = data.studentReports || [];
    data.accounts = data.accounts || [];
    data.hiddenVocab = data.hiddenVocab || [];
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
  function save() { rebuildVocab(); localStorage.setItem(LS_DATA, JSON.stringify(state)); scheduleSync(); }

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

  /* ---------------- Auth (local or Firebase) ---------------- */
  const cloud = { enabled: false, ready: null, auth: null, db: null, syncTimer: null };
  async function sha(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return 'x' + (h >>> 0).toString(16);
  }
  const loadScript = (src) => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
  function initCloud() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.projectId) return;
    const V = '10.12.0';
    cloud.ready = (async () => {
      await loadScript(`https://www.gstatic.com/firebasejs/${V}/firebase-app-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${V}/firebase-auth-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore-compat.js`);
      firebase.initializeApp(cfg); cloud.auth = firebase.auth(); cloud.db = firebase.firestore(); cloud.enabled = true;
      await new Promise(res => { const off = cloud.auth.onAuthStateChanged(async u => { off(); if (u) await cloudAfterLogin(u); else if (ui.user && ui.user.cloud) { ui.user = null; saveUi(); } res(); }); });
      try { await pullContent(); } catch (e) { console.warn(e); }
      applyUi(); render();
    })().catch(e => { console.warn('Firebase init failed', e); cloud.enabled = false; toast('Firebase: ' + e.message); });
  }
  async function cloudAfterLogin(u) {
    const snap = await cloud.db.collection('users').doc(u.uid).get();
    const prof = snap.exists ? snap.data() : { name: u.email, role: 'student' };
    ui.user = { id: u.uid, email: u.email, name: prof.name || u.email, role: prof.role || 'student', cloud: true }; saveUi();
    if (ui.user.role === 'student') {
      const ps = await cloud.db.collection('progress').doc(u.uid).get();
      if (ps.exists && ps.data().progress) state.progress = Object.assign(emptyProgress(), ps.data().progress);
      if (!state.settings.studentName) state.settings.studentName = ui.user.name;
      localStorage.setItem(LS_DATA, JSON.stringify(state));
    }
  }
  async function pullContent() {
    if (!cloud.enabled) return;
    const snap = await cloud.db.collection('content').doc('main').get();
    if (snap.exists) {
      const c = snap.data();
      if (c.articles) state.articles = c.articles; if (c.vocab) state.vocab = c.vocab; if (c.hiddenVocab) state.hiddenVocab = c.hiddenVocab; rebuildVocab();
      if (c.settings) state.settings = Object.assign(state.settings, c.settings);
      localStorage.setItem(LS_DATA, JSON.stringify(state));
    } else if (ui.teacher) { await pushContent(); }
  }
  async function pushContent() {
    if (!cloud.enabled || !ui.teacher) return;
    const { examName, examNameEn, examDate, motto, teacherCode } = state.settings, teacherEmail = state.settings.teacherEmail || '';
    await cloud.db.collection('content').doc('main').set({ articles: state.articles, vocab: state.vocab, hiddenVocab: state.hiddenVocab || [], settings: { examName, examNameEn, examDate, motto, teacherCode, teacherEmail }, updatedAt: new Date().toISOString() });
  }
  async function pushProgress() {
    if (!cloud.enabled || !ui.user || !ui.user.cloud) return;
    await cloud.db.collection('progress').doc(ui.user.id).set({ name: ui.user.name, progress: state.progress, updatedAt: new Date().toISOString() });
  }
  function scheduleSync() {
    if (!cloud.enabled || !ui.user || !ui.user.cloud) return;
    clearTimeout(cloud.syncTimer);
    cloud.syncTimer = setTimeout(() => { Promise.all([pushProgress(), pushContent()]).catch(e => toast('☁️ ' + e.message)); }, 1500);
  }
  async function loadCloudStudents() {
    const qs = await cloud.db.collection('users').where('role', '==', 'student').get();
    const list = [];
    for (const d of qs.docs) {
      const ps = await cloud.db.collection('progress').doc(d.id).get();
      list.push({ id: 'cloud_' + d.id, name: d.data().name || d.data().email || d.id, email: d.data().email || '', exportedAt: ps.exists ? ps.data().updatedAt : null, progress: Object.assign(emptyProgress(), ps.exists ? ps.data().progress : {}) });
    }
    view.cloudStudents = list;
  }

  async function registerUser({ email, pass, name, role, code }) {
    if (!email || !pass || !name) throw new Error(t('needFields'));
    if (role === 'teacher' && code !== (state.settings.teacherCode || '')) throw new Error(t('badCode'));
    if (cloud.enabled) {
      const cred = await cloud.auth.createUserWithEmailAndPassword(email, pass);
      await cloud.db.collection('users').doc(cred.user.uid).set({ name, role, email, createdAt: new Date().toISOString() });
      await cloudAfterLogin(cred.user); await pullContent();
      return;
    }
    const key = email.trim().toLowerCase();
    if (state.accounts.some(a => a.email === key)) throw new Error(t('userExists'));
    const acc = { id: uid('u'), email: key, name, role, hash: await sha(key + ':' + pass), createdAt: new Date().toISOString() };
    state.accounts.push(acc); save();
    ui.user = { id: acc.id, email: key, name, role, cloud: false }; saveUi();
    if (role === 'student' && !state.settings.studentName) { state.settings.studentName = name; save(); }
  }
  async function loginUser({ email, pass }) {
    if (!email || !pass) throw new Error(t('needFields'));
    if (cloud.enabled) {
      const cred = await cloud.auth.signInWithEmailAndPassword(email, pass);
      await cloudAfterLogin(cred.user); await pullContent();
      return;
    }
    const key = email.trim().toLowerCase();
    const acc = state.accounts.find(a => a.email === key);
    if (!acc || acc.hash !== await sha(key + ':' + pass)) throw new Error(t('loginFail'));
    ui.user = { id: acc.id, email: key, name: acc.name, role: acc.role, cloud: false }; saveUi();
    if (acc.role === 'student' && !state.settings.studentName) { state.settings.studentName = acc.name; save(); }
  }
  async function logoutUser() {
    if (cloud.enabled && cloud.auth.currentUser) { try { await Promise.all([pushProgress(), pushContent()]); } catch (e) { } await cloud.auth.signOut(); }
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
  const bmBtn = (kind, id, sm = true) => `<button class="btn ${sm ? 'sm' : ''} bm-btn ${isBm(kind, id) ? 'on' : ''}" data-action="toggleBm" data-kind="${kind}" data-id="${id}" title="${t('bookmark')}">${isBm(kind, id) ? t('removeBookmark') : t('addBookmark')}</button>`;

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
        <div class="stat-card"><span class="ribbon">📖</span><div class="k">${t('statArticles')}</div><div class="v">${state.articles.length}</div><div class="s">${t('statArticlesS')}</div></div>
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
        <div class="list-item"><span>📖</span><div class="grow"><div class="title">${t('taskRead')}</div><div class="meta">${state.articles.length} ${t('statArticlesS')}</div></div><button class="btn sm accent" data-action="nav" data-page="reading">${t('go')}</button></div>
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
        <g><text x="0" y="0" font-size="34" dominant-baseline="middle" text-anchor="middle">✈️<animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="${arc}"/></text></g>
        ${pin(lx, ly, 'Los Angeles')}${pin(nx, ny, 'New York')}${pin(ux, uy, 'London', 'end')}${pin(sx, sy, 'Sydney')}${pin(cx, cy, 'Toronto', 'end')}
        <g transform="translate(${tx},${ty})"><g><polygon points="0,-16 5,-5 16,-4 8,4 10,15 0,9 -10,15 -8,4 -16,-4 -5,-5" fill="#ff6b81" stroke="#fff" stroke-width="2"/><animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="1.6s" repeatCount="indefinite"/></g>
        <text x="20" y="6" class="map-pin-label desk-only">Taiwan · ${esc(t('youAreHere'))}</text><text x="-26" y="-26" class="map-pin-label mobile-only" text-anchor="end">Taiwan · ${esc(t('youAreHere'))}</text></g>
      </svg></div>`;
  }
  function homeBookmarks() {
    const b = bm();
    const words = b.vocab.map(id => VOCAB.find(v => v.id === id)).filter(Boolean);
    const arts = b.articles.map(id => state.articles.find(a => a.id === id)).filter(Boolean);
    if (!words.length && !arts.length) return `<div class="card bookmark-card"><span class="ribbon">🔖</span><p class="muted" style="margin:0">${t('noBookmarks')}</p></div>`;
    return `<div class="card bookmark-card"><span class="ribbon">🔖</span>
      ${arts.length ? `<div class="bm-group"><b>📖 ${t('bookmarkedArticles')}</b><div class="bm-list">${arts.map(a => `<button class="bm-tag" data-action="openArticleHome" data-id="${a.id}">${esc(a.title)}</button>`).join('')}</div></div>` : ''}
      ${words.length ? `<div class="bm-group"><b>🔤 ${t('bookmarkedWords')}</b> <span class="small muted">(${words.length})</span><div class="bm-list">${words.map(v => `<span class="bm-tag word en" title="${esc(v.zh)}">${esc(v.word)}<small>${esc(v.zh)}</small></span>`).join('')}</div>
        <div style="margin-top:8px"><button class="btn sm accent" data-action="goFlash" data-mode="bookmark">${t('startPractice')} · ${t('modeBookmark')}</button></div></div>` : ''}
    </div>`;
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
  const IRREG = { be: 'am is are was were been being', have: 'has had having', do: 'does did done doing', go: 'goes went gone going', get: 'gets got gotten getting', make: 'made', take: 'took taken', give: 'gave given', come: 'came', keep: 'kept', bring: 'brought', find: 'found', hold: 'held', stand: 'stood', catch: 'caught', think: 'thought', run: 'ran running', put: 'putting', set: 'setting', cut: 'cutting', let: 'letting', break: 'broke broken', fall: 'fell fallen', grow: 'grew grown', show: 'shown', see: 'saw seen', know: 'knew known', tell: 'told', say: 'said', pay: 'paid', lead: 'led', leave: 'left', sit: 'sat sitting', wear: 'wore worn', throw: 'threw thrown', draw: 'drew drawn', write: 'wrote written', drive: 'drove driven', eat: 'ate eaten', begin: 'began begun beginning', deal: 'dealt', feel: 'felt', hang: 'hung', lay: 'laid', lie: 'lay lain lying', lose: 'lost', mean: 'meant', meet: 'met', send: 'sent', sell: 'sold', spend: 'spent', stick: 'stuck', strike: 'struck', teach: 'taught', buy: 'bought', fight: 'fought', win: 'won winning', speak: 'spoke spoken', wake: 'woke woken', rise: 'rose risen', ride: 'rode ridden', fly: 'flew flown', shake: 'shook shaken', choose: 'chose chosen', forget: 'forgot forgotten', hide: 'hid hidden', build: 'built', light: 'lit', shoot: 'shot', blow: 'blew blown', dig: 'dug digging', swim: 'swam swum swimming', stop: 'stopped stopping', drop: 'dropped dropping', plan: 'planned planning', shut: 'shutting', hit: 'hitting', step: 'stepped stepping', carry: 'carried carries', try: 'tried tries', rely: 'relied relies', apply: 'applied applies', worry: 'worried worries' };
  const NOT_VERB = new Set('a an the in on at by for of to as from with out up off over under into onto all so no not and or but than more most less least very too much many such what how when where who which one each every this that these those it its after before about around'.split(' '));
  const POSS = "(?:my|your|his|her|its|our|their|one's|[a-z]+'s)";
  const PARTICLES = new Set('on up off out down in over away back around about through along apart aside'.split(' '));
  const PHRASE_SKIP = new Set(['come to sth', 'come to']);
  function verbForms(v) {
    const f = new Set([v, v + 's', v + 'ed', v + 'd', v + 'ing']);
    if (/e$/.test(v)) { f.add(v.slice(0, -1) + 'ing'); f.add(v + 'd'); }
    if (/(s|x|z|ch|sh|o)$/.test(v)) f.add(v + 'es');
    if (/[^aeiou]y$/.test(v)) { f.add(v.slice(0, -1) + 'ies'); f.add(v.slice(0, -1) + 'ied'); }
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
    let src = '\\b';
    toks.forEach((x, i) => {
      if (gap(x)) { src += "(?:[\\w'’-]+[\\s,]+){1,3}"; return; }
      let w;
      if (/^(one's|sb's)$/.test(x)) w = POSS;
      else if ((i === 0 || toks.length === 1) && /^[a-z]+$/.test(x) && !NOT_VERB.has(x)) w = `(?:${verbForms(x).join('|')})`;
      else w = escRe(x);
      src += w + (i < toks.length - 1 ? '[\\s,]+' : '');
    });
    return new RegExp(src + '\\b', 'gi');
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
  function pageReading() {
    if (view.editing) return articleEditor();
    if (view.articleId) return articleView();
    const rf = view.readFilter || (view.readFilter = { topic: '', status: '' });
    const histOf = id => state.progress.readingQuizzes.filter(r => r.articleId === id);
    const done = a => histOf(a.id).length > 0;
    const GROUPS = [['Reading · B1', 'grpB1', '📗'], ['Reading · B2', 'grpB2', '📘'], ['Reading · Practical', 'grpPractical', '✉️']];
    const groupOf = a => GROUPS.some(g => g[0] === a.level) ? a.level : '_other';
    const topics = Array.from(new Set(state.articles.flatMap(a => a.tags || [])));
    const visible = state.articles.filter(a => (!rf.topic || (a.tags || []).includes(rf.topic)) && (!rf.status || (rf.status === 'done') === done(a)));
    const card = a => {
      const hist = histOf(a.id), isDone = hist.length > 0;
      const best = isDone ? Math.max(...hist.map(r => Math.round(r.score / r.total * 100))) : null;
      return `<div class="list-item read-item ${isDone ? 'is-done' : ''}">
        <span class="read-check" title="${isDone ? t('readDone') : t('readTodo')}">${isDone ? '✓' : ''}</span>
        <div class="grow" data-action="openArticle" data-id="${a.id}" style="cursor:pointer">
          <div class="title">${esc(a.title)}</div>
          <div class="meta">${a.questions.length} ${t('questions')} · ${tf('wordsCount', { n: (a.passage || '').split(/\s+/).filter(Boolean).length })} ${(a.tags || []).map(x => `<span class="chip">${esc(unitLabel(x))}</span>`).join('')}</div>
        </div>
        ${best !== null ? `<span class="chip ${best >= 80 ? 'ok' : best >= 60 ? 'warn' : 'bad'}">${t('best')} ${best}%</span><span class="chip">${t('attempts')} ${hist.length} ${t('times')}</span>` : ''}
        ${bmBtn('articles', a.id)}
        <button class="btn sm" data-action="openArticle" data-id="${a.id}">${isDone ? t('retry') : t('go')}</button>
        <span class="teacher-only"><button class="btn sm ghost" data-action="editArticle" data-id="${a.id}">${t('editArticle')}</button> <button class="btn sm danger" data-action="deleteArticle" data-id="${a.id}">${t('deleteArticle')}</button></span>
      </div>`;
    };
    const groups = GROUPS.map(g => g[0]).concat(['_other']).map(key => {
      const all = state.articles.filter(a => groupOf(a) === key), list = visible.filter(a => groupOf(a) === key);
      if (!all.length) return '';
      const g = GROUPS.find(x => x[0] === key) || ['_other', 'grpOther', '📄'];
      const nd = all.filter(done).length;
      return `<section class="read-group" id="grp-${g[1]}"><h3 class="read-group-title">${g[2]} ${t(g[1])} <span class="read-progress"><span class="bar"><i style="width:${all.length ? nd / all.length * 100 : 0}%"></i></span>${nd} / ${all.length} ${t('readDoneShort')}</span></h3>
        ${list.length ? `<div class="list">${list.map(card).join('')}</div>` : `<p class="small muted">${t('readNoneHere')}</p>`}</section>`;
    }).join('');
    const totalDone = state.articles.filter(done).length;
    const toc = `<div class="card read-toc">
        <div class="row"><b>📑 ${t('readToc')}</b><span class="chip ok">✓ ${totalDone} / ${state.articles.length}</span><span class="spacer"></span>
          ${GROUPS.filter(g => state.articles.some(a => a.level === g[0])).map(g => `<a class="btn sm ghost" href="#grp-${g[1]}" data-action="jumpGroup" data-target="grp-${g[1]}">${g[2]} ${t(g[1])}</a>`).join('')}</div>
        <div class="row" style="margin-top:8px"><span class="small muted">${t('readTopic')}</span>
          <button class="btn sm ${!rf.topic ? 'accent' : 'ghost'}" data-action="readTopic" data-v="">${t('newsAll')}</button>
          ${topics.map(x => `<button class="btn sm ${rf.topic === x ? 'accent' : 'ghost'}" data-action="readTopic" data-v="${esc(x)}">${esc(unitLabel(x))}</button>`).join('')}</div>
        <div class="row" style="margin-top:8px"><span class="small muted">${t('readStatus')}</span>
          ${[['', t('newsAll')], ['todo', t('readTodo')], ['done', '✓ ' + t('readDone')]].map(([v, l]) => `<button class="btn sm ${rf.status === v ? 'accent' : 'ghost'}" data-action="readStatus" data-v="${v}">${l}</button>`).join('')}</div>
      </div>`;
    return `<h2 class="section-title" style="margin-top:8px">${t('readingTitle')}</h2><p class="section-sub">${t('readingSub')}</p>
      <div class="teacher-only block" style="margin-bottom:12px"><button class="btn accent" data-action="newArticle">${t('newArticle')}</button></div>
      ${state.articles.length ? toc + groups : `<p class="muted">${t('noArticles')}</p>`}`;
  }

  function articleView() {
    const a = state.articles.find(x => x.id === view.articleId);
    if (!a) { view.articleId = null; return pageReading(); }
    const L = 'ABCD';
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
        <div class="muted small" style="margin-bottom:12px">${esc(unitLabel(a.level || ''))} ${(a.tags || []).map(x => `<span class="chip">${esc(unitLabel(x))}</span>`).join('')}</div>
        <div class="passage ${ui.font === 'clean' ? 'clean' : ''}">${esc(a.passage)}</div>
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
    return `<select class="input" id="${id}"><option value="">${t('allUnits')}</option>${presets.map(p => `<option value="${p[0]}" ${p[0] === val ? 'selected' : ''}>${p[1]}</option>`).join('')}${grp(t('presetCustom'), custom)}${grp(t('libWords'), words)}${grp(t('libPhrases'), phrases)}</select>`;
  }
  function inUnit(v, unit) {
    if (!unit) return true;
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
          <div class="flash-face flash-front"><span class="ribbon ribbon-l ribbon-${['new', 'info', 'warn', 'ok'][c.box]}" title="${t('box')}">${['🌱', '📘', '⭐', '🏆'][c.box]}</span><button class="flash-bm ${isBm('vocab', v.id) ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${v.id}" title="${t('bookmark')}">🔖</button>
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
        <div class="quiz-options">${cur.opts.map(oid => { const o = byId(oid); if (!o) return ''; let cls = 'quiz-opt'; if (q.answered) { if (oid === v.id) cls += ' correct'; else if (q.chosen === oid) cls += ' wrong'; } return `<button class="${cls}" data-action="quizChoose" data-id="${oid}" ${q.answered ? 'disabled' : ''}><span class="${rev ? 'en' : ''}">${esc(rev ? o.word : o.zh)}</span></button>`; }).join('')}</div>
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
      return `<tr><td class="bm-cell"><button class="bm-star ${isBm('vocab', v.id) ? 'on' : ''}" data-action="toggleBm" data-kind="vocab" data-id="${v.id}" title="${t('bookmark')}">🔖</button></td><td class="word">${esc(v.word)} <button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}" style="padding:2px 6px">🔊</button>${v.cefr ? `<div class="small muted" style="font-weight:400">${esc(v.cefr)}</div>` : ''}</td><td>${esc(v.pos || '')}</td><td>${esc(v.zh)}</td><td class="syn en">${esc(v.syn || '')}</td><td class="example">${esc(v.example || '')}</td><td class="small muted">${esc(unitLabel(v.unit))}</td>
        <td><span class="chip ${['', 'info', 'warn', 'ok'][c.box]}">${c.seen ? t('level' + c.box) : t('level0')}</span></td>
        <td class="teacher-only"><button class="btn sm ghost" data-action="editVocab" data-id="${v.id}">${t('edit')}</button> <button class="btn sm danger" data-action="deleteVocab" data-id="${v.id}">${t('del')}</button></td></tr>`;
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
        <div class="grid-2"><div class="field"><label>${t('unit')}</label><input type="text" id="bulkUnit" placeholder="Unit 5 ..." value="${esc(view.vocabUnit)}"></div></div>
        <textarea id="bulkText" placeholder="adventure, n., 冒險, Life is an adventure.&#10;brave | adj. | 勇敢的"></textarea>
        <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn ghost" data-action="toggleBulk">${t('cancel')}</button><button class="btn accent" data-action="bulkImport">${t('importBtn')}</button></div></div>` : ''}
      ${pager}
      <div style="overflow-x:auto"><table class="vocab-table"><thead><tr><th></th><th>${t('word')}</th><th>${t('pos')}</th><th>${t('meaning')}</th><th>${t('synonyms')}</th><th>${t('example')}</th><th>${t('unit')}</th><th>${t('box')}</th><th class="teacher-only">${t('actions')}</th></tr></thead>
      <tbody>${view.vocabEdit && !view.vocabEdit.id ? vocabEditRow(view.vocabEdit) : ''}${pageList.map(row).join('')}</tbody></table></div>${pager}`;
  }
  function vocabEditRow(v) {
    return `<tr class="teacher-only" style="display:table-row;background:#fff8df"><td></td><td><input type="text" id="veWord" value="${esc(v.word)}" placeholder="word"></td><td><input type="text" id="vePos" value="${esc(v.pos || '')}" placeholder="n."></td><td><input type="text" id="veZh" value="${esc(v.zh)}" placeholder="中文"></td><td><input type="text" id="veSyn" value="${esc(v.syn || '')}" placeholder="synonyms"></td><td><input type="text" id="veEx" value="${esc(v.example || '')}" placeholder="example"></td><td><input type="text" id="veUnit" value="${esc(v.unit || '')}" placeholder="Unit"></td><td></td>
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
      <div class="card">${quizTables(p, state.articles)}<div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn danger sm" data-action="resetProgress">${t('resetProgress')}</button></div></div>`;
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
    const wrongMap = {};
    progress.readingQuizzes.forEach(r => (r.answers || []).forEach(a => {
      if (a.chosen === a.correct) return;
      const key = r.articleId + '|' + a.qi;
      const art = state.articles.find(x => x.id === r.articleId);
      const q = art && art.questions[a.qi];
      if (!wrongMap[key]) wrongMap[key] = { title: r.title, q: a.q || (q && q.q) || ('Q' + (a.qi + 1)), n: 0, chosen: [], correct: a.correctText || (q && q.options[q.answer]) || '', explain: q && q.explain };
      wrongMap[key].n++; wrongMap[key].chosen.push(a.chosenText || (q && q.options[a.chosen]) || '—');
    }));
    const wrongs = Object.values(wrongMap).sort((a, b) => b.n - a.n);
    const weak = {};
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
    const rep = src === 'local' ? { name: state.settings.studentName || t('localDevice'), progress: state.progress, exportedAt: null } : (reports.find(r => r.id === src) || view.cloudStudents.find(r => r.id === src));
    if (!rep) { view.studentSource = 'local'; return pageStudents(); }
    const A = analyzeReport(rep.progress, rep.name);
    const mastered = VOCAB.filter(v => (rep.progress.cards[v.id] || {}).box === 3).length;
    return `<h2 class="section-title" style="margin-top:8px">${t('studentsTitle')}</h2><p class="section-sub">${t('studentsSub')}</p>
      <div class="card"><div class="row">
        <div class="field" style="margin:0;min-width:260px"><label>${t('source')}</label><select class="input" id="studentSource"><option value="local" ${src === 'local' ? 'selected' : ''}>${t('localDevice')}</option>${view.cloudStudents.map(r => `<option value="${r.id}" ${src === r.id ? 'selected' : ''}>☁️ ${esc(r.name)}${r.exportedAt ? ' · ' + fmtDate(r.exportedAt) : ''}</option>`).join('')}${reports.map(r => `<option value="${r.id}" ${src === r.id ? 'selected' : ''}>📄 ${esc(r.name)} · ${fmtDate(r.exportedAt)}</option>`).join('')}</select></div>
        <span class="spacer"></span>
        ${cloud.enabled ? `<button class="btn" data-action="loadCloud">${t('loadCloud')}</button>` : `<span class="small muted">${t('cloudOff')}</span>`}
        <label class="btn"><span>${t('importReport')}</span><input type="file" id="reportFile" accept="application/json" style="display:none"></label>
        ${src !== 'local' && !src.startsWith('cloud_') ? `<button class="btn danger sm" data-action="deleteReport" data-id="${src}">${t('deleteReport')}</button>` : ''}
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
      ${(() => { const b = rep.progress.bookmarks || { vocab: [], articles: [] }; const ws = b.vocab.map(id => VOCAB.find(v => v.id === id)).filter(Boolean); const as = b.articles.map(id => state.articles.find(a => a.id === id)).filter(Boolean); return (ws.length || as.length) ? `<div class="card bookmark-card"><span class="ribbon">🔖</span><h3 style="margin-top:0">${t('bookmarks')}</h3>${as.length ? `<div class="bm-group"><b>📖 ${t('bookmarkedArticles')}</b><div class="bm-list">${as.map(a => `<span class="bm-tag">${esc(a.title)}</span>`).join('')}</div></div>` : ''}${ws.length ? `<div class="bm-group"><b>🔤 ${t('bookmarkedWords')}</b><div class="bm-list">${ws.map(v => `<span class="bm-tag word en">${esc(v.word)}<small>${esc(v.zh)}</small></span>`).join('')}</div></div>` : ''}</div>` : ''; })()}
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
        <div class="field teacher-only block"><label>${t('inviteCodeLbl')}</label><input type="text" id="stCode" value="${esc(s.teacherCode || '')}" autocomplete="off"></div>
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
      ${ui.teacher && !cloud.enabled ? `<div class="card"><h3 style="margin-top:0">👥 ${t('accountsTitle')} <span class="cloud-badge">${t('localOnly')}</span></h3>
        ${state.accounts.length ? `<table class="vocab-table"><thead><tr><th>${t('email')}</th><th>${t('displayName')}</th><th>${t('role')}</th><th></th></tr></thead><tbody>${state.accounts.map(a => `<tr><td>${esc(a.email)}</td><td>${esc(a.name)}</td><td><span class="chip ${a.role === 'teacher' ? 'warn' : 'info'}">${a.role === 'teacher' ? t('roleTeacher') : t('roleStudent')}</span></td><td>${ui.user && ui.user.id === a.id ? '' : `<button class="btn sm danger" data-action="deleteAccount" data-id="${a.id}">${t('deleteAccount')}</button>`}</td></tr>`).join('')}</tbody></table>` : `<p class="muted">${t('noAccounts')}</p>`}</div>` : ''}`;
  }

  /* ---------------- Render ---------------- */
  function render() {
    updateExamChip();
    const pages = { home: pageHome, reading: pageReading, flashcards: pageFlash, vocab: pageVocab, news: pageNews, progress: pageProgress, students: pageStudents, settings: pageSettings };

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
      state = { settings: Object.assign(clone(SEED_DATA.settings), obj.settings || {}), articles: obj.articles || [], vocab: obj.vocab || [], hiddenVocab: obj.hiddenVocab || [], progress: Object.assign(emptyProgress(), obj.progress || {}), studentReports: obj.studentReports || [], accounts: obj.accounts || state.accounts };
    } else {
      if (obj.settings) { const keep = state.settings.teacherCode; state.settings = Object.assign(state.settings, obj.settings); if (!obj.settings.teacherCode) state.settings.teacherCode = keep; }
      (obj.articles || []).forEach(a => { const i = state.articles.findIndex(x => x.id === a.id); if (i >= 0) state.articles[i] = a; else state.articles.push(a); });
      (obj.vocab || []).forEach(v => { const i = state.vocab.findIndex(x => x.id === v.id || (!v.override && x.word.toLowerCase() === v.word.toLowerCase())); if (i >= 0) state.vocab[i] = Object.assign({}, state.vocab[i], v); else state.vocab.push(v); });
      if (Array.isArray(obj.hiddenVocab)) state.hiddenVocab = Array.from(new Set((state.hiddenVocab || []).concat(obj.hiddenVocab)));
    }
    save(); return 'data';
  }
  function addReport(obj) {
    const rep = { id: uid('rep'), name: obj.studentName || t('roleStudent'), exportedAt: obj.exportedAt || new Date().toISOString(), progress: Object.assign(emptyProgress(), obj.progress || {}) };
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
    jumpGroup(el) { const g = document.getElementById(el.dataset.target); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    toggleBm(el) { toggleBm(el.dataset.kind, el.dataset.id); if (view.flash) { const b = $('.flash-bm'); if (b) b.classList.toggle('on', isBm('vocab', el.dataset.id)); } else render(); },
    toggleVocabBm() { view.vocabBm = !view.vocabBm; view.vocabPage = 0; render(); },
    vocabPage(el) { view.vocabPage = (view.vocabPage || 0) + (+el.dataset.d); render(); },
    vocabGo(el) { view.vocabPage = +el.dataset.p; render(); },
    openArticleHome(el) { view.articleId = el.dataset.id; view.answers = {}; view.submitted = false; view.readStart = Date.now(); nav('reading'); },
    // reading
    openArticle(el) { view.articleId = el.dataset.id; view.answers = {}; view.submitted = false; view.readStart = Date.now(); window.scrollTo({ top: 0 }); render(); },
    backList() { view.articleId = null; render(); },
    choose(el) { if (view.submitted) return; view.answers[+el.dataset.q] = +el.dataset.o; render(); },
    submitQuiz() {
      const a = state.articles.find(x => x.id === view.articleId);
      if (Object.keys(view.answers).length < a.questions.length) { toast(t('pleaseAnswerAll')); return; }
      view.submitted = true;
      view.readSecs = view.readStart ? Math.round((Date.now() - view.readStart) / 1000) : null;
      const answers = a.questions.map((q, i) => ({ qi: i, q: q.q, chosen: view.answers[i], chosenText: q.options[view.answers[i]], correct: q.answer, correctText: q.options[q.answer] }));
      const score = answers.filter(x => x.chosen === x.correct).length;
      state.progress.readingQuizzes.push({ id: uid('rq'), articleId: a.id, title: a.title, score, total: a.questions.length, date: new Date().toISOString(), secs: view.readSecs, answers });
      bumpDay(); save(); render();
      setTimeout(() => { const s = $('.score-banner'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
    },
    retry() { view.answers = {}; view.submitted = false; view.readStart = Date.now(); window.scrollTo({ top: 0 }); render(); },
    newArticle() { view.editing = { id: uid('a'), title: '', level: 'Reading · B1', tags: [], passage: '', questions: [{ q: '', options: ['', '', '', ''], answer: 0, explain: '' }] }; render(); },
    editArticle(el) { view.editing = clone(state.articles.find(x => x.id === el.dataset.id)); render(); },
    deleteArticle(el) { if (!confirm(t('confirmDel'))) return; state.articles = state.articles.filter(x => x.id !== el.dataset.id); save(); render(); },
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
    addVocab() { view.vocabEdit = { id: '', word: '', pos: '', zh: '', example: '', unit: view.vocabUnit }; render(); setTimeout(() => $('#veWord') && $('#veWord').focus(), 30); },
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
      if (ui.teacher && $('#stCode')) s.teacherCode = $('#stCode').value.trim() || s.teacherCode;
      save(); toast(t('saved')); render();
    },
    exportAll() { download(`tve-exam-all-${todayStr()}.json`, state); },
    exportContent() { shareOrDownload(`tve-exam-material-${todayStr()}.json`, { settings: { examName: state.settings.examName, examNameEn: state.settings.examNameEn, examDate: state.settings.examDate, motto: state.settings.motto }, articles: state.articles, vocab: state.vocab, hiddenVocab: state.hiddenVocab || [] }, t('exportContent')); },
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
    else if (e.target.classList.contains('pager-sel')) view.vocabPage = +e.target.value, render();
    else if (id === 'qsType') view.quizSetup.type = e.target.value;
    else if (id === 'qsUnit') view.quizSetup.unit = e.target.value;
    else if (id === 'qsCount') view.quizSetup.count = +e.target.value;
    else if (id === 'vocabUnit') view.vocabUnit = e.target.value, view.vocabPage = 0, render();
    else if (id === 'studentSource') view.studentSource = e.target.value, render();
    else if (id === 'importFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { try { const r = importJSON(obj, $('#importMode').value); toast(r === 'report' ? t('reportImported') : t('imported')); if (r === 'report' && ui.teacher) view.page = 'students'; render(); } catch (x) { toast(t('importFail')); } }); }
    else if (id === 'reportFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { if (obj && obj.type === 'student-report') { addReport(obj); toast(t('reportImported')); render(); } else { try { importJSON(obj, 'merge'); toast(t('imported')); render(); } catch (x) { toast(t('importFail')); } } }); }
  });
  $('#app').addEventListener('input', e => {
    if (e.target.id === 'vocabSearch') { view.vocabSearch = e.target.value; view.vocabPage = 0; const pos = e.target.selectionStart; render(); const i = $('#vocabSearch'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
  });
  $('#app').addEventListener('keydown', e => {
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
    $('#authMode').textContent = cloud.enabled ? t('authCloudNote') : t('authLocalNote');
    $('#auPass').autocomplete = view.authMode === 'login' ? 'current-password' : 'new-password';
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
      if (view.authMode === 'login') await loginUser({ email, pass });
      else await registerUser({ email, pass, name: $('#auName').value.trim(), role: $('#auRole').value, code: $('#auCode').value.trim() });
      closeAuth(); toast(tf('welcome', { n: ui.user.name }));
      if (ui.teacher && view.page === 'home') view.page = 'students';
      applyUi(); render();
    } catch (err) {
      const map = { 'auth/email-already-in-use': t('userExists'), 'auth/invalid-credential': t('loginFail'), 'auth/user-not-found': t('loginFail'), 'auth/wrong-password': t('loginFail'), 'auth/invalid-email': t('needFields'), 'auth/weak-password': t('needFields') };
      toast(map[err.code] || err.message);
    } finally { btn.disabled = false; }
  });

  // midnight refresh of countdown
  let lastDay = todayStr();
  setInterval(() => { updateExamChip(); if (todayStr() !== lastDay) { lastDay = todayStr(); if (view.page === 'home') render(); } }, 60000);

  applyUi();
  render();
  initCloud();
})();
