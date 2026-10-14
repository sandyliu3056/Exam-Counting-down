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
  const emptyProgress = () => ({ cards: {}, readingQuizzes: [], vocabQuizzes: [], days: {} });

  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { data = null; }
    if (!data) data = { settings: clone(SEED_DATA.settings), articles: clone(SEED_DATA.articles), vocab: clone(SEED_DATA.vocab), progress: emptyProgress(), studentReports: [], accounts: [] };
    data.settings = Object.assign(clone(SEED_DATA.settings), data.settings || {});
    data.articles = data.articles || [];
    data.vocab = data.vocab || [];
    data.progress = Object.assign(emptyProgress(), data.progress || {});
    data.studentReports = data.studentReports || [];
    data.accounts = data.accounts || [];
    if (!data.settings.teacherCode) data.settings.teacherCode = SEED_DATA.settings.teacherCode;
    return data;
  }
  function save() { localStorage.setItem(LS_DATA, JSON.stringify(state)); scheduleSync(); }

  let state = load();
  let ui = Object.assign({ lang: 'zh', font: 'hand', theme: 'navy', user: null },
    (() => { try { return JSON.parse(localStorage.getItem(LS_UI) || '{}'); } catch (e) { return {}; } })());
  const saveUi = () => localStorage.setItem(LS_UI, JSON.stringify({ lang: ui.lang, font: ui.font, theme: ui.theme, user: ui.user }));
  Object.defineProperty(ui, 'teacher', { get: () => !!(ui.user && ui.user.role === 'teacher') });

  // volatile view state
  const view = { page: 'home', articleId: null, answers: {}, submitted: false, editing: null, flash: null, flashSetup: { mode: 'due', unit: '', shuffle: true }, quiz: null, quizSetup: { type: 'choice', count: 10, unit: '' }, vocabSearch: '', vocabUnit: '', vocabEdit: null, bulkOpen: false, studentSource: 'local', cloudStudents: [], authMode: 'login' };

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
  function dueCards() { const td = todayStr(); return state.vocab.filter(v => { const c = state.progress.cards[v.id]; return c && c.seen > 0 && c.due <= td; }); }
  function newCards() { return state.vocab.filter(v => !state.progress.cards[v.id] || state.progress.cards[v.id].seen === 0); }
  function masteredCount() { return state.vocab.filter(v => (state.progress.cards[v.id] || {}).box === 3).length; }
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
      if (c.articles) state.articles = c.articles; if (c.vocab) state.vocab = c.vocab;
      if (c.settings) state.settings = Object.assign(state.settings, c.settings);
      localStorage.setItem(LS_DATA, JSON.stringify(state));
    } else if (ui.teacher) { await pushContent(); }
  }
  async function pushContent() {
    if (!cloud.enabled || !ui.teacher) return;
    const { examName, examNameEn, examDate, motto, teacherCode } = state.settings;
    await cloud.db.collection('content').doc('main').set({ articles: state.articles, vocab: state.vocab, settings: { examName, examNameEn, examDate, motto, teacherCode }, updatedAt: new Date().toISOString() });
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

  /* ---------------- Speech ---------------- */
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  /* ---------------- Banner SVG ---------------- */
  function bannerSVG() {
    const windows = (x, y, cols, rows, w = 16, h = 20, gx = 28, gy = 30) => {
      let s = '';
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<rect x="${x + c * gx}" y="${y + r * gy}" width="${w}" height="${h}" rx="2" fill="#fff6d6" stroke="#9c6b3a" stroke-width="1.5"/>`;
      return s;
    };
    return `<svg viewBox="0 0 1400 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6fb"/><stop offset="1" stop-color="#eaf4ff"/></linearGradient></defs>
<rect width="1400" height="220" fill="url(#sky)"/>
<circle cx="1230" cy="52" r="26" fill="#ffd34d"/><g stroke="#ffd34d" stroke-width="4" stroke-linecap="round">
<line x1="1230" y1="12" x2="1230" y2="20"/><line x1="1230" y1="84" x2="1230" y2="92"/><line x1="1190" y1="52" x2="1198" y2="52"/><line x1="1262" y1="52" x2="1270" y2="52"/>
<line x1="1202" y1="24" x2="1208" y2="30"/><line x1="1252" y1="74" x2="1258" y2="80"/><line x1="1258" y1="24" x2="1252" y2="30"/><line x1="1208" y1="74" x2="1202" y2="80"/></g>
<g fill="#fff"><ellipse cx="200" cy="48" rx="46" ry="18"/><ellipse cx="226" cy="40" rx="28" ry="16"/><ellipse cx="176" cy="42" rx="24" ry="14"/>
<ellipse cx="620" cy="36" rx="40" ry="15"/><ellipse cx="642" cy="30" rx="24" ry="13"/><ellipse cx="900" cy="58" rx="44" ry="16"/><ellipse cx="922" cy="50" rx="26" ry="14"/></g>
<path d="M0 150 Q 150 100 300 150 T 600 150 T 900 150 T 1200 150 T 1400 150 V220 H0Z" fill="#b9dba3"/>
<rect x="0" y="160" width="1400" height="60" fill="#8fbf74"/>
<!-- school -->
<rect x="470" y="60" width="300" height="100" fill="#d9603d" stroke="#8a3a22" stroke-width="2"/>
<rect x="560" y="30" width="120" height="30" fill="#d9603d" stroke="#8a3a22" stroke-width="2"/>
<polygon points="550,30 620,2 690,30" fill="#8a3a22"/>
<circle cx="620" cy="46" r="10" fill="#fff" stroke="#8a3a22" stroke-width="2"/><line x1="620" y1="46" x2="620" y2="39" stroke="#8a3a22" stroke-width="2"/><line x1="620" y1="46" x2="625" y2="46" stroke="#8a3a22" stroke-width="2"/>
${windows(485, 72, 3, 2)}${windows(685, 72, 3, 2)}
<rect x="595" y="110" width="50" height="50" fill="#5b3a21" stroke="#3a2412" stroke-width="2"/><rect x="605" y="118" width="30" height="20" fill="#fff6d6"/>
<rect x="470" y="150" width="300" height="10" fill="#8a3a22"/>
<rect x="560" y="64" width="120" height="30" rx="4" fill="#1f3b73" stroke="#fff" stroke-width="2"/>
<text x="620" y="85" text-anchor="middle" font-size="18" font-weight="700" fill="#f6c445" font-family="Noto Sans TC, sans-serif">統測 GO!</text>
<line x1="760" y1="20" x2="760" y2="60" stroke="#444" stroke-width="3"/><polygon points="760,20 790,28 760,36" fill="#f6c445"/>
<!-- trees -->
<g><rect x="400" y="120" width="10" height="40" fill="#6b4a2b"/><circle cx="405" cy="110" r="26" fill="#3f8a4a"/><circle cx="390" cy="122" r="18" fill="#4fa05a"/><circle cx="420" cy="122" r="18" fill="#4fa05a"/></g>
<g><rect x="830" y="120" width="10" height="40" fill="#6b4a2b"/><circle cx="835" cy="108" r="28" fill="#3f8a4a"/><circle cx="818" cy="122" r="18" fill="#4fa05a"/><circle cx="852" cy="122" r="18" fill="#4fa05a"/></g>
<g><rect x="1100" y="124" width="8" height="36" fill="#6b4a2b"/><polygon points="1104,70 1078,125 1130,125" fill="#2f7a3d"/><polygon points="1104,88 1072,145 1136,145" fill="#3f8a4a"/></g>
<!-- books & pencil -->
<g transform="translate(60,96)"><rect x="0" y="40" width="110" height="18" rx="3" fill="#2d6cdf"/><rect x="8" y="22" width="110" height="18" rx="3" fill="#e4a11b"/><rect x="2" y="4" width="110" height="18" rx="3" fill="#d6453d"/>
<rect x="135" y="-10" width="14" height="70" rx="3" fill="#f6c445" transform="rotate(20 142 25)"/><polygon points="142,60 135,60 142,74 149,60" fill="#f3c7a0" transform="rotate(20 142 25)"/></g>
<!-- road -->
<rect x="0" y="178" width="1400" height="42" fill="#5e6673"/>
<line x1="0" y1="199" x2="1400" y2="199" stroke="#fff" stroke-width="3" stroke-dasharray="30 22"/>
<!-- bus -->
<g transform="translate(220,140)"><rect x="0" y="0" width="190" height="52" rx="8" fill="#ffc62b" stroke="#8a6a00" stroke-width="2"/><rect x="12" y="10" width="34" height="22" fill="#cfe9ff" stroke="#8a6a00"/><rect x="56" y="10" width="34" height="22" fill="#cfe9ff" stroke="#8a6a00"/><rect x="100" y="10" width="34" height="22" fill="#cfe9ff" stroke="#8a6a00"/><rect x="148" y="10" width="32" height="22" fill="#cfe9ff" stroke="#8a6a00"/>
<rect x="0" y="38" width="190" height="6" fill="#222"/><circle cx="40" cy="54" r="12" fill="#222"/><circle cx="40" cy="54" r="5" fill="#999"/><circle cx="150" cy="54" r="12" fill="#222"/><circle cx="150" cy="54" r="5" fill="#999"/>
</g>
<!-- student -->
<g transform="translate(980,118)"><circle cx="20" cy="12" r="12" fill="#f3c7a0"/><path d="M8 12 Q20 -6 32 12" fill="#2b2b2b"/><rect x="8" y="24" width="24" height="30" rx="6" fill="#1f3b73"/><rect x="2" y="28" width="10" height="24" rx="4" fill="#1f3b73"/><rect x="28" y="28" width="10" height="24" rx="4" fill="#1f3b73"/><rect x="26" y="26" width="16" height="24" rx="4" fill="#d6453d"/><rect x="10" y="54" width="8" height="18" fill="#3b3b3b"/><rect x="22" y="54" width="8" height="18" fill="#3b3b3b"/></g>
</svg>`;
  }

  /* ---------------- Pages ---------------- */
  function pageHome() {
    const dl = daysLeft();
    let badge;
    if (dl > 0) badge = `<div class="label">${t('daysLeft')}</div><div class="days">${dl}<small>${t('days')}</small></div>`;
    else if (dl === 0) badge = `<div class="label">${t('daysLeft')}</div><div class="days">${t('today')}</div>`;
    else badge = `<div class="days">${t('examPassed')}</div>`;
    const ex = new Date(state.settings.examDate + 'T00:00:00');
    const dateLine = `${state.settings.examDate.replace(/-/g, '/')} (${t('weekdays')[ex.getDay()]})`;
    const due = dueCards().length, nw = newCards().length;
    const recent = state.progress.readingQuizzes.slice(-5).reverse();
    const name = state.settings.studentName ? `${esc(state.settings.studentName)}，` : '';
    return `
      <div class="banner">${bannerSVG()}
        <div class="countdown-badge ${dl <= 0 ? 'done' : ''}"><span class="mascot">${dl > 30 ? '🐣' : dl > 7 ? '🔥' : '🎯'}</span>${badge}<div class="date">${esc(ui.lang === 'zh' ? state.settings.examName : (state.settings.examNameEn || state.settings.examName))}<br>${dateLine}</div></div>
      </div>
      <div class="stat-grid">
        <div class="stat-card"><span class="ico">🔤</span><div class="k">${t('statVocab')}</div><div class="v">${state.vocab.length}</div><div class="s">${t('statVocabS')}</div></div>
        <div class="stat-card"><span class="ico">📖</span><div class="k">${t('statArticles')}</div><div class="v">${state.articles.length}</div><div class="s">${t('statArticlesS')}</div></div>
        <div class="stat-card"><span class="ico">🌟</span><div class="k">${t('statMastered')}</div><div class="v">${masteredCount()} <span class="small muted">/ ${state.vocab.length}</span></div><div class="s">${t('statMasteredS')}</div></div>
        <div class="stat-card"><span class="ico">⏰</span><div class="k">${t('statDue')}</div><div class="v">${due}</div><div class="s">${t('statDueS')}</div></div>
      </div>
      ${state.settings.motto ? `<div class="card" style="margin-top:14px;border-style:dashed"><b>💬 ${t('motto')}：</b> ${name}${esc(state.settings.motto)}</div>` : ''}
      <h2 class="section-title">🗓️ ${t('todayPlan')}</h2>
      <p class="section-sub">${t('todayPlanSub')} · 🔥 ${t('streak')} ${streak()} ${t('streakDays')}</p>
      <div class="list">
        <div class="list-item"><span>🃏</span><div class="grow"><div class="title">${t('taskReview')}</div><div class="meta">${due} ${t('statDueS')}</div></div><button class="btn sm accent" data-action="goFlash" data-mode="due">${t('go')}</button></div>
        <div class="list-item"><span>✨</span><div class="grow"><div class="title">${t('taskNew')}</div><div class="meta">${nw} ${t('statVocabS')}</div></div><button class="btn sm accent" data-action="goFlash" data-mode="new">${t('go')}</button></div>
        <div class="list-item"><span>📖</span><div class="grow"><div class="title">${t('taskRead')}</div><div class="meta">${state.articles.length} ${t('statArticlesS')}</div></div><button class="btn sm accent" data-action="nav" data-page="reading">${t('go')}</button></div>
      </div>
      <h2 class="section-title">🎒 ${t('servicesTitle')}</h2>
      <p class="section-sub">${t('servicesSub')}</p>
      <div class="service-grid">
        <div class="service-card" data-action="nav" data-page="reading"><div class="deco"></div><div class="icon">📖</div><h3>${t('svcReading')}</h3><p>${t('svcReadingP')}</p></div>
        <div class="service-card" data-action="nav" data-page="flashcards"><div class="deco"></div><div class="icon">🃏</div><h3>${t('svcFlash')}</h3><p>${t('svcFlashP')}</p></div>
        <div class="service-card" data-action="goQuiz"><div class="deco"></div><div class="icon">📝</div><h3>${t('svcQuiz')}</h3><p>${t('svcQuizP')}</p></div>
        <div class="service-card" data-action="nav" data-page="progress"><div class="deco"></div><div class="icon">📈</div><h3>${t('svcProgress')}</h3><p>${t('svcProgressP')}</p></div>
      </div>
      <h2 class="section-title">🏅 ${t('recentQuiz')}</h2>
      ${recent.length ? `<div class="list">${recent.map(r => `<div class="list-item"><div class="grow"><div class="title">${esc(r.title)}</div><div class="meta">${fmtDate(r.date)}</div></div><span class="chip ${r.score / r.total >= .8 ? 'ok' : r.score / r.total >= .6 ? 'warn' : 'bad'}">${r.score} / ${r.total}</span></div>`).join('')}</div>` : `<p class="muted">${t('noQuiz')}</p>`}
    `;
  }

  /* ---- Reading ---- */
  function pageReading() {
    if (view.editing) return articleEditor();
    if (view.articleId) return articleView();
    const items = state.articles.map(a => {
      const hist = state.progress.readingQuizzes.filter(r => r.articleId === a.id);
      const best = hist.length ? Math.max(...hist.map(r => Math.round(r.score / r.total * 100))) : null;
      return `<div class="list-item">
        <div class="grow" data-action="openArticle" data-id="${a.id}" style="cursor:pointer">
          <div class="title">${esc(a.title)}</div>
          <div class="meta">${esc(a.level || '')} · ${a.questions.length} ${t('questions')} ${(a.tags || []).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>
        </div>
        ${best !== null ? `<span class="chip ${best >= 80 ? 'ok' : best >= 60 ? 'warn' : 'bad'}">${t('best')} ${best}%</span><span class="chip">${t('attempts')} ${hist.length} ${t('times')}</span>` : ''}
        <button class="btn sm" data-action="openArticle" data-id="${a.id}">${t('go')}</button>
        <span class="teacher-only"><button class="btn sm ghost" data-action="editArticle" data-id="${a.id}">${t('editArticle')}</button> <button class="btn sm danger" data-action="deleteArticle" data-id="${a.id}">${t('deleteArticle')}</button></span>
      </div>`;
    }).join('');
    return `<h2 class="section-title" style="margin-top:8px">${t('readingTitle')}</h2><p class="section-sub">${t('readingSub')}</p>
      <div class="teacher-only block" style="margin-bottom:12px"><button class="btn accent" data-action="newArticle">${t('newArticle')}</button></div>
      ${items ? `<div class="list">${items}</div>` : `<p class="muted">${t('noArticles')}</p>`}`;
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
      scoreHtml = `<div class="score-banner"><div>${t('yourScore')}</div><div class="big">${sc} / ${a.questions.length}</div><div>${Math.round(sc / a.questions.length * 100)}%</div><div style="margin-top:8px"><button class="btn accent" data-action="retry">${t('retry')}</button></div></div>`;
    }
    return `<button class="btn ghost sm" data-action="backList">${t('back')}</button>
      <div class="card" style="margin-top:12px">
        <h2 style="margin:0 0 4px">${esc(a.title)}</h2>
        <div class="muted small" style="margin-bottom:12px">${esc(a.level || '')} ${(a.tags || []).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>
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
  function units() { return Array.from(new Set(state.vocab.map(v => v.unit || ''))).filter(Boolean); }
  function unitSelect(id, val) {
    return `<select class="input" id="${id}"><option value="">${t('allUnits')}</option>${units().map(u => `<option value="${esc(u)}" ${u === val ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select>`;
  }
  function poolFor(mode, unit) {
    let pool = state.vocab.filter(v => !unit || v.unit === unit);
    if (mode === 'due') pool = pool.filter(v => { const c = state.progress.cards[v.id]; return !c || c.seen === 0 || c.due <= todayStr(); });
    else if (mode === 'unknown') pool = pool.filter(v => { const c = state.progress.cards[v.id]; return c && c.wrong > 0 && c.box < 2; });
    else if (mode === 'new') pool = pool.filter(v => !state.progress.cards[v.id] || state.progress.cards[v.id].seen === 0);
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
          <div class="field"><label>${t('modeAll')} / ${t('modeDue')}</label><select class="input" id="fsMode">
            <option value="due" ${fs.mode === 'due' ? 'selected' : ''}>${t('modeDue')} + ${t('modeNew')}</option>
            <option value="all" ${fs.mode === 'all' ? 'selected' : ''}>${t('modeAll')}</option>
            <option value="unknown" ${fs.mode === 'unknown' ? 'selected' : ''}>${t('modeUnknown')}</option>
            <option value="new" ${fs.mode === 'new' ? 'selected' : ''}>${t('modeNew')}</option></select></div>
          <div class="field"><label>${t('unit')}</label>${unitSelect('fsUnit', fs.unit)}</div>
          <div class="field"><label>${t('shuffle')}</label><select class="input" id="fsShuffle"><option value="1" ${fs.shuffle ? 'selected' : ''}>✓ ${t('shuffle')}</option><option value="0" ${!fs.shuffle ? 'selected' : ''}>—</option></select></div>
        </div>
        <div class="row"><span class="muted">${count} ${t('statDueS')}</span><span class="spacer"></span><button class="btn accent" data-action="startFlash" ${count ? '' : 'disabled'} style="font-size:18px;padding:12px 30px">${t('startPractice')}</button></div>
      </div>
      <h2 class="section-title">${t('vocabQuiz')}</h2><p class="section-sub">${t('svcQuizP')}</p>
      <div class="card">
        <div class="grid-3">
          <div class="field"><label>${t('vocabQuiz')}</label><select class="input" id="qsType">
            <option value="choice" ${qsu.type === 'choice' ? 'selected' : ''}>${t('quizChoice')}</option>
            <option value="choiceRev" ${qsu.type === 'choiceRev' ? 'selected' : ''}>${t('quizChoiceRev')}</option>
            <option value="spell" ${qsu.type === 'spell' ? 'selected' : ''}>${t('quizSpell')}</option></select></div>
          <div class="field"><label>${t('unit')}</label>${unitSelect('qsUnit', qsu.unit)}</div>
          <div class="field"><label>${t('quizCount')}</label><input type="number" id="qsCount" min="3" max="50" value="${qsu.count}"></div>
        </div>
        <div class="row"><span class="spacer"></span><button class="btn" data-action="startQuiz" ${state.vocab.length >= 4 ? '' : 'disabled'} style="font-size:18px;padding:12px 30px">${t('startQuiz')}</button></div>
      </div>`;
  }

  function flashStage() {
    const f = view.flash;
    if (f.idx >= f.queue.length) {
      return `<div class="card center"><h2>🎉 ${t('roundDone')}</h2><p style="font-size:20px">${tf('roundStats', { k: f.known.length, d: f.missed.length })}</p>
        <div class="row" style="justify-content:center"><button class="btn accent" data-action="flashAgain">${t('again')}</button>${f.missed.length ? `<button class="btn" data-action="flashMissed">${t('practiceUnknown')}</button>` : ''}<button class="btn ghost" data-action="flashExit">${t('back')}</button></div></div>`;
    }
    const v = state.vocab.find(x => x.id === f.queue[f.idx]);
    if (!v) { f.idx++; return flashStage(); }
    const c = state.progress.cards[v.id] || { box: 0 };
    const ex = v.example ? esc(v.example).replace(new RegExp('(' + v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'i'), '<b>$1</b>') : '';
    return `<div class="flash-stage">
      <div class="row" style="width:min(640px,100%)"><button class="btn ghost sm" data-action="flashExit">${t('back')}</button><span class="spacer"></span><span class="muted">${f.idx + 1} / ${f.queue.length}</span></div>
      <div class="progress-bar"><div style="width:${f.idx / f.queue.length * 100}%"></div></div>
      <div class="flash-card ${f.flipped ? 'flipped' : ''}" data-action="flip">
        <div class="flash-inner">
          <div class="flash-face flash-front"><span class="flash-box chip ${['', 'info', 'warn', 'ok'][c.box]}">${t('box')}：${t('level' + c.box)}</span>
            <div class="flash-word">${esc(v.word)}</div><div class="flash-pos">${esc(v.pos || '')}</div>
            <button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}" style="margin-top:14px">${t('speak')}</button>
            <span class="flash-hint">${t('tapToFlip')}</span></div>
          <div class="flash-face flash-back"><div class="flash-zh">${esc(v.zh)}</div><div class="flash-pos" style="color:#fff;opacity:.8">${esc(v.word)} ${esc(v.pos || '')}</div>${ex ? `<div class="flash-example">${ex}</div>` : ''}</div>
        </div>
      </div>
      <div class="flash-actions"><button class="btn danger" data-action="flashMark" data-known="0">${t('dontKnow')}</button><button class="btn ok" data-action="flashMark" data-known="1">${t('know')}</button></div>
    </div>`;
  }

  function buildQuiz() {
    const s = view.quizSetup;
    let pool = state.vocab.filter(v => !s.unit || v.unit === s.unit);
    if (pool.length < 4) pool = state.vocab.slice();
    // prioritise weak/due words, then fill randomly
    const weak = shuffleArr(pool.filter(v => { const c = state.progress.cards[v.id]; return c && (c.box < 2); }));
    const rest = shuffleArr(pool.filter(v => !weak.includes(v)));
    const items = weak.concat(rest).slice(0, Math.max(3, Math.min(50, s.count | 0 || 10)));
    const qs = items.map(v => {
      const distract = shuffleArr(state.vocab.filter(x => x.id !== v.id)).slice(0, 3);
      const opts = shuffleArr([v, ...distract]);
      return { id: v.id, opts: opts.map(o => o.id) };
    });
    view.quiz = { type: s.type, qs, idx: 0, correct: 0, wrong: [], answered: false, chosen: null };
  }

  function quizStage() {
    const q = view.quiz;
    const byId = id => state.vocab.find(x => x.id === id);
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
        ${q.answered ? `<div class="center" style="margin-top:12px;font-size:20px">${q.lastOk ? '✅' : '❌'} ${t('answerIs')}<b class="en" style="font-size:26px">${esc(v.word)}</b><div class="muted en">${esc(v.example || '')}</div></div>
          <div class="center" style="margin-top:12px"><button class="btn accent" data-action="quizNext">${t('next')}</button></div>`
          : `<div class="center" style="margin-top:12px"><button class="btn accent" data-action="spellCheck">${t('check')}</button> <button class="btn ghost" data-action="spellSkip">${t('skip')}</button></div>`}`;
    } else {
      const rev = q.type === 'choiceRev';
      body = `<div class="quiz-word" ${rev ? 'style="font-family:var(--font-body)"' : ''}>${esc(rev ? v.zh : v.word)} ${!rev ? `<button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}">🔊</button>` : `<span class="muted" style="font-size:18px">${esc(v.pos || '')}</span>`}</div>
        <div class="quiz-options">${cur.opts.map(oid => { const o = byId(oid); if (!o) return ''; let cls = 'quiz-opt'; if (q.answered) { if (oid === v.id) cls += ' correct'; else if (q.chosen === oid) cls += ' wrong'; } return `<button class="${cls}" data-action="quizChoose" data-id="${oid}" ${q.answered ? 'disabled' : ''}><span class="${rev ? 'en' : ''}">${esc(rev ? o.word : o.zh)}</span></button>`; }).join('')}</div>
        ${q.answered ? `<div class="center" style="margin-top:14px"><div class="muted en">${esc(v.word)} ${esc(v.pos || '')} — ${esc(v.example || '')}</div><button class="btn accent" data-action="quizNext" style="margin-top:8px">${t('next')}</button></div>` : ''}`;
    }
    return `<div class="card" style="max-width:800px;margin:0 auto">${head}${body}</div>`;
  }
  function quizAnswer(ok, given) {
    const q = view.quiz, v = state.vocab.find(x => x.id === q.qs[q.idx].id);
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
    const list = state.vocab.filter(v => (!view.vocabUnit || v.unit === view.vocabUnit) && (!s || v.word.toLowerCase().includes(s) || (v.zh || '').includes(s) || (v.example || '').toLowerCase().includes(s)));
    const row = v => {
      if (view.vocabEdit && view.vocabEdit.id === v.id) return vocabEditRow(view.vocabEdit);
      const c = state.progress.cards[v.id] || { box: 0, seen: 0 };
      return `<tr><td class="word">${esc(v.word)} <button class="btn sm ghost" data-action="speak" data-word="${esc(v.word)}" style="padding:2px 6px">🔊</button></td><td>${esc(v.pos || '')}</td><td>${esc(v.zh)}</td><td class="example">${esc(v.example || '')}</td><td class="small muted">${esc(v.unit || '')}</td>
        <td><span class="chip ${['', 'info', 'warn', 'ok'][c.box]}">${c.seen ? t('level' + c.box) : t('level0')}</span></td>
        <td class="teacher-only"><button class="btn sm ghost" data-action="editVocab" data-id="${v.id}">${t('edit')}</button> <button class="btn sm danger" data-action="deleteVocab" data-id="${v.id}">${t('del')}</button></td></tr>`;
    };
    return `<h2 class="section-title" style="margin-top:8px">${t('vocabTitle')}</h2><p class="section-sub">${t('vocabSub')}</p>
      <div class="row" style="margin-bottom:12px">
        <input type="text" id="vocabSearch" placeholder="🔍 ${t('search')}" value="${esc(view.vocabSearch)}" style="max-width:320px">
        <div style="min-width:220px">${unitSelect('vocabUnit', view.vocabUnit)}</div>
        <span class="muted small">${t('total')} ${list.length} ${t('items')}</span><span class="spacer"></span>
        <span class="teacher-only"><button class="btn accent sm" data-action="addVocab">${t('addVocab')}</button> <button class="btn sm" data-action="toggleBulk">${t('bulkImport')}</button></span>
      </div>
      ${view.bulkOpen ? `<div class="card teacher-only block" style="margin-bottom:12px"><b>${t('bulkTitle')}</b><p class="small muted">${t('bulkHint')}</p>
        <div class="grid-2"><div class="field"><label>${t('unit')}</label><input type="text" id="bulkUnit" placeholder="Unit 5 ..." value="${esc(view.vocabUnit)}"></div></div>
        <textarea id="bulkText" placeholder="adventure, n., 冒險, Life is an adventure.\nbrave | adj. | 勇敢的"></textarea>
        <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn ghost" data-action="toggleBulk">${t('cancel')}</button><button class="btn accent" data-action="bulkImport">${t('importBtn')}</button></div></div>` : ''}
      <div style="overflow-x:auto"><table class="vocab-table"><thead><tr><th>${t('word')}</th><th>${t('pos')}</th><th>${t('meaning')}</th><th>${t('example')}</th><th>${t('unit')}</th><th>${t('box')}</th><th class="teacher-only">${t('actions')}</th></tr></thead>
      <tbody>${view.vocabEdit && !view.vocabEdit.id ? vocabEditRow(view.vocabEdit) : ''}${list.map(row).join('')}</tbody></table></div>`;
  }
  function vocabEditRow(v) {
    return `<tr class="teacher-only" style="display:table-row;background:#fff8df"><td><input type="text" id="veWord" value="${esc(v.word)}" placeholder="word"></td><td><input type="text" id="vePos" value="${esc(v.pos || '')}" placeholder="n."></td><td><input type="text" id="veZh" value="${esc(v.zh)}" placeholder="中文"></td><td><input type="text" id="veEx" value="${esc(v.example || '')}" placeholder="example"></td><td><input type="text" id="veUnit" value="${esc(v.unit || '')}" placeholder="Unit"></td><td></td>
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
        <button class="btn accent" data-action="sendTeacher">${t('sendToTeacher')}</button></div><p class="small muted" style="margin:6px 0 0">${t('sendHint')}</p></div>
      <div class="card"><h3 style="margin-top:0">${t('mastery')}</h3>${masteryBars(p, state.vocab)}<h3>${t('activity')}</h3>${heatmap(p)}</div>
      <div class="card">${quizTables(p, state.articles)}<div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn danger sm" data-action="resetProgress">${t('resetProgress')}</button></div></div>`;
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
    const weakList = Object.entries(weak).map(([id, w]) => { const v = state.vocab.find(x => x.id === id); return Object.assign({ id, word: v ? v.word : w.word, zh: v ? v.zh : w.zh }, w); }).filter(w => w.word).sort((a, b) => (b.missed + b.quiz) - (a.missed + a.quiz)).slice(0, 40);
    const rq = progress.readingQuizzes;
    const avg = rq.length ? Math.round(rq.reduce((s, r) => s + r.score / r.total, 0) / rq.length * 100) : null;
    const dates = Object.keys(progress.days).sort();
    const last = dates.length ? dates[dates.length - 1] : null;
    const total = Object.values(progress.days).reduce((a, b) => a + b, 0);
    const notStudied = state.vocab.filter(v => !progress.cards[v.id] || progress.cards[v.id].seen === 0);
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
    const mastered = state.vocab.filter(v => (rep.progress.cards[v.id] || {}).box === 3).length;
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
        <div class="stat-card"><div class="k">${t('statMastered')}</div><div class="v">${mastered} <span class="small muted">/ ${state.vocab.length}</span></div><div class="s">${t('notYetStudied')} ${A.notStudied.length}</div></div>
      </div>
      <div class="card" style="margin-top:14px"><h3 style="margin-top:0">❌ ${t('wrongAnalysis')}</h3>
        ${A.wrongs.length ? `<div class="list">${A.wrongs.map(w => `<div class="list-item" style="border-left-color:var(--bad)"><div class="grow"><div class="meta">${esc(w.title)}</div><div class="title" style="font-size:16px">${esc(w.q)}</div>
          <div class="small">${t('studentChose')}：<span class="chip bad">${w.chosen.map(esc).join('</span> <span class="chip bad">')}</span> → ${t('correctIs')}：<span class="chip ok">${esc(w.correct)}</span></div>${w.explain ? `<div class="small muted">${esc(w.explain)}</div>` : ''}</div><span class="chip bad">${tf('wrongTimes', { n: w.n })}</span></div>`).join('')}</div>` : `<p class="muted">${t('noWrong')}</p>`}
      </div>
      <div class="card"><h3 style="margin-top:0">🧠 ${t('weakWords')}</h3>
        ${A.weakList.length ? `<table class="vocab-table"><thead><tr><th>${t('word')}</th><th>${t('meaning')}</th><th>${t('flashRound')}</th><th>${t('vocabQuizLbl')}</th><th>${t('typed')}</th><th>${t('box')}</th></tr></thead><tbody>${A.weakList.map(w => `<tr><td class="word">${esc(w.word)}</td><td>${esc(w.zh)}</td><td>${w.missed ? `<span class="chip bad">${tf('missedTimes', { n: w.missed })}</span>` : ''}</td><td>${w.quiz ? `<span class="chip warn">${tf('quizWrongTimes', { n: w.quiz })}</span>` : ''}</td><td class="small muted en">${w.typed.map(esc).join(', ')}</td><td><span class="chip ${['', 'info', 'warn', 'ok'][w.box || 0]}">${t('level' + (w.box || 0))}</span></td></tr>`).join('')}</tbody></table>` : `<p class="muted">${t('noWeak')}</p>`}
      </div>
      <div class="card"><h3 style="margin-top:0">${t('mastery')}</h3>${masteryBars(rep.progress, state.vocab)}<h3>${t('activity')}</h3>${heatmap(rep.progress)}
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
    const pages = { home: pageHome, reading: pageReading, flashcards: pageFlash, vocab: pageVocab, progress: pageProgress, students: pageStudents, settings: pageSettings };

    $('#app').innerHTML = (pages[view.page] || pageHome)();
    $$('#tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.page === view.page));
    const sp = $('#spellInput'); if (sp && !sp.disabled) sp.focus();
  }
  function nav(page) { view.page = page; window.scrollTo({ top: 0 }); render(); }

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
      state = { settings: Object.assign(clone(SEED_DATA.settings), obj.settings || {}), articles: obj.articles || [], vocab: obj.vocab || [], progress: Object.assign(emptyProgress(), obj.progress || {}), studentReports: obj.studentReports || [], accounts: obj.accounts || state.accounts };
    } else {
      if (obj.settings) { const keep = state.settings.teacherCode; state.settings = Object.assign(state.settings, obj.settings); if (!obj.settings.teacherCode) state.settings.teacherCode = keep; }
      (obj.articles || []).forEach(a => { const i = state.articles.findIndex(x => x.id === a.id); if (i >= 0) state.articles[i] = a; else state.articles.push(a); });
      (obj.vocab || []).forEach(v => { const i = state.vocab.findIndex(x => x.id === v.id || x.word.toLowerCase() === v.word.toLowerCase()); if (i >= 0) state.vocab[i] = Object.assign({}, state.vocab[i], v); else state.vocab.push(v); });
    }
    save(); return 'data';
  }
  function addReport(obj) {
    const rep = { id: uid('rep'), name: obj.studentName || '學生', exportedAt: obj.exportedAt || new Date().toISOString(), progress: Object.assign(emptyProgress(), obj.progress || {}) };
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
    // reading
    openArticle(el) { view.articleId = el.dataset.id; view.answers = {}; view.submitted = false; window.scrollTo({ top: 0 }); render(); },
    backList() { view.articleId = null; render(); },
    choose(el) { if (view.submitted) return; view.answers[+el.dataset.q] = +el.dataset.o; render(); },
    submitQuiz() {
      const a = state.articles.find(x => x.id === view.articleId);
      if (Object.keys(view.answers).length < a.questions.length) { toast(t('pleaseAnswerAll')); return; }
      view.submitted = true;
      const answers = a.questions.map((q, i) => ({ qi: i, q: q.q, chosen: view.answers[i], chosenText: q.options[view.answers[i]], correct: q.answer, correctText: q.options[q.answer] }));
      const score = answers.filter(x => x.chosen === x.correct).length;
      state.progress.readingQuizzes.push({ id: uid('rq'), articleId: a.id, title: a.title, score, total: a.questions.length, date: new Date().toISOString(), answers });
      bumpDay(); save(); render();
      setTimeout(() => { const s = $('.score-banner'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
    },
    retry() { view.answers = {}; view.submitted = false; window.scrollTo({ top: 0 }); render(); },
    newArticle() { view.editing = { id: uid('a'), title: '', level: '統測 B 級', tags: [], passage: '', questions: [{ q: '', options: ['', '', '', ''], answer: 0, explain: '' }] }; render(); },
    editArticle(el) { view.editing = clone(state.articles.find(x => x.id === el.dataset.id)); render(); },
    deleteArticle(el) { if (!confirm(t('confirmDel'))) return; state.articles = state.articles.filter(x => x.id !== el.dataset.id); save(); render(); },
    cancelEdit() { view.editing = null; render(); },
    addQ() { collectEditor(); view.editing.questions.push({ q: '', options: ['', '', '', ''], answer: 0, explain: '' }); render(); },
    removeQ(el) { collectEditor(); view.editing.questions.splice(+el.dataset.qi, 1); render(); },
    saveArticle() {
      collectEditor(); const a = view.editing;
      if (!a.title || !a.passage.trim()) { toast(t('needTitle')); return; }
      if (!a.questions.length || a.questions.some(q => !q.q || q.options.some(o => !o))) { toast(t('needQ')); return; }
      const i = state.articles.findIndex(x => x.id === a.id); if (i >= 0) state.articles[i] = a; else state.articles.push(a);
      save(); view.editing = null; toast(t('articleSaved')); render();
    },
    // flashcards
    startFlash() {
      const fs = view.flashSetup;
      let pool = poolFor(fs.mode, fs.unit).map(v => v.id);
      if (fs.shuffle) pool = shuffleArr(pool);
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
    spellCheck() { const q = view.quiz; const given = ($('#spellInput').value || '').trim(); if (!given) return; q.chosen = given; const v = state.vocab.find(x => x.id === q.qs[q.idx].id); quizAnswer(given.toLowerCase() === v.word.toLowerCase(), given); save(); render(); },
    spellSkip() { const q = view.quiz; q.chosen = ''; quizAnswer(false, '(skip)'); save(); render(); },
    quizNext() { const q = view.quiz; q.idx++; q.answered = false; q.chosen = null; if (q.idx >= q.qs.length) finishQuiz(); render(); },
    quizAgain() { buildQuiz(); render(); },
    quizExit() { view.quiz = null; render(); },
    // vocab
    addVocab() { view.vocabEdit = { id: '', word: '', pos: '', zh: '', example: '', unit: view.vocabUnit }; render(); setTimeout(() => $('#veWord') && $('#veWord').focus(), 30); },
    editVocab(el) { view.vocabEdit = clone(state.vocab.find(x => x.id === el.dataset.id)); render(); },
    cancelVocab() { view.vocabEdit = null; render(); },
    saveVocab() {
      const v = { word: $('#veWord').value.trim(), pos: $('#vePos').value.trim(), zh: $('#veZh').value.trim(), example: $('#veEx').value.trim(), unit: $('#veUnit').value.trim() };
      if (!v.word || !v.zh) { toast(t('needTitle')); return; }
      if (view.vocabEdit.id) { const i = state.vocab.findIndex(x => x.id === view.vocabEdit.id); state.vocab[i] = Object.assign(state.vocab[i], v); }
      else state.vocab.push(Object.assign({ id: uid('v') }, v));
      view.vocabEdit = null; save(); toast(t('saved')); render();
    },
    deleteVocab(el) { if (!confirm(t('confirmDel'))) return; state.vocab = state.vocab.filter(x => x.id !== el.dataset.id); save(); render(); },
    toggleBulk() { view.bulkOpen = !view.bulkOpen; render(); },
    bulkImport() {
      const unit = $('#bulkUnit').value.trim(); let n = 0;
      $('#bulkText').value.split(/\n/).map(l => l.trim()).filter(Boolean).forEach(line => {
        const p = line.split(/\s*[|,，]\s*/); if (p.length < 2) return;
        let word, pos = '', zh, ex = '';
        if (p.length === 2) { [word, zh] = p; } else { [word, pos, zh, ...ex] = p; ex = ex.join(', '); }
        if (!word || !zh) return;
        const i = state.vocab.findIndex(x => x.word.toLowerCase() === word.toLowerCase());
        const v = { word, pos, zh, example: ex, unit };
        if (i >= 0) state.vocab[i] = Object.assign(state.vocab[i], v); else state.vocab.push(Object.assign({ id: uid('v') }, v));
        n++;
      });
      save(); view.bulkOpen = false; toast(`${t('imported')} +${n}`); render();
    },
    // progress
    sendTeacher() {
      const obj = { type: 'student-report', studentName: state.settings.studentName || '學生', exportedAt: new Date().toISOString(), progress: state.progress };
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
      if (ui.teacher && $('#stCode')) s.teacherCode = $('#stCode').value.trim() || s.teacherCode;
      save(); toast(t('saved')); render();
    },
    exportAll() { download(`tve-exam-all-${todayStr()}.json`, state); },
    exportContent() { shareOrDownload(`tve-exam-material-${todayStr()}.json`, { settings: { examName: state.settings.examName, examNameEn: state.settings.examNameEn, examDate: state.settings.examDate, motto: state.settings.motto }, articles: state.articles, vocab: state.vocab }, t('exportContent')); },
    resetAll() { if (!confirm(t('confirmResetAll'))) return; const p = state.progress, code = state.settings.teacherCode; state = { settings: Object.assign(clone(SEED_DATA.settings), { teacherCode: code }), articles: clone(SEED_DATA.articles), vocab: clone(SEED_DATA.vocab), progress: p, studentReports: state.studentReports, accounts: state.accounts }; save(); render(); },
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
    else if (id === 'qsType') view.quizSetup.type = e.target.value;
    else if (id === 'qsUnit') view.quizSetup.unit = e.target.value;
    else if (id === 'qsCount') view.quizSetup.count = +e.target.value;
    else if (id === 'vocabUnit') view.vocabUnit = e.target.value, render();
    else if (id === 'studentSource') view.studentSource = e.target.value, render();
    else if (id === 'importFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { try { const r = importJSON(obj, $('#importMode').value); toast(r === 'report' ? t('reportImported') : t('imported')); if (r === 'report' && ui.teacher) view.page = 'students'; render(); } catch (x) { toast(t('importFail')); } }); }
    else if (id === 'reportFile') { const f = e.target.files[0]; if (f) readFile(f, obj => { if (obj && obj.type === 'student-report') { addReport(obj); toast(t('reportImported')); render(); } else { try { importJSON(obj, 'merge'); toast(t('imported')); render(); } catch (x) { toast(t('importFail')); } } }); }
  });
  $('#app').addEventListener('input', e => {
    if (e.target.id === 'vocabSearch') { view.vocabSearch = e.target.value; const pos = e.target.selectionStart; render(); const i = $('#vocabSearch'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
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
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; if (b.dataset.page === 'reading') { view.articleId = null; view.editing = null; } nav(b.dataset.page); });

  // header controls
  const langSel = $('#langSelect'), fontSel = $('#fontSelect'), themeSel = $('#themeSelect'), authBtn = $('#authBtn');
  function applyUi() {
    document.body.dataset.font = ui.font; document.body.dataset.theme = ui.theme;
    document.body.classList.toggle('teacher', ui.teacher);
    authBtn.classList.toggle('logged', !!ui.user);
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
    modal.classList.remove('hidden'); setTimeout(() => $('#auEmail').focus(), 50);
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
  setInterval(() => { if (view.page === 'home') { const b = $('.countdown-badge .days'); if (b && daysLeft() > 0 && parseInt(b.textContent) !== daysLeft()) render(); } }, 60000);

  applyUi();
  render();
  initCloud();
})();
