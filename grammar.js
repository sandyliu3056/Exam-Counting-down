/* =====================================================
   📐 文法 (grammar.html): the chapters by unit, each with its explanations, examples, 常見錯誤, 統測重點 and an
   8-question 小測驗; a 綜合測驗 mixes questions from many chapters.
   Data: grammar-data.js (window.GRAMMAR_DATA). Read-aloud: speech.js, shared with the main site.
   ===================================================== */
(() => {
  'use strict';
  const DATA = window.GRAMMAR_DATA || { units: [], chapters: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const app = $('#app');
  // jump without the page's smooth scrolling ('instant' is newer than some iPhones: fall back to a plain jump)
  const jumpTo = el => { try { el ? el.scrollIntoView({ block: 'start', behavior: 'instant' }) : window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { el ? el.scrollIntoView(true) : window.scrollTo(0, 0); } };

  /* ---------------- Look: the theme, font and voice chosen on the main site ---------------- */
  const LS_UI = 'tve_exam_ui_v1', LS_GR = 'tve_grammar_v1';
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
  const store = readJSON(LS_GR); // { ch: { 'g-passive': { best: 7, at: '2026-10-19' } }, mix: { all: 8 }, last: 'g-passive' }
  store.ch = store.ch && typeof store.ch === 'object' ? store.ch : {}; store.mix = store.mix && typeof store.mix === 'object' ? store.mix : {};
  const saveStore = () => { try { localStorage.setItem(LS_GR, JSON.stringify(store)); } catch (e) { } };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

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

  /* ---------------- Chapters ---------------- */
  const CH = DATA.chapters;
  // the 7 units: [id, name, icon, what is in it, short name]; a chapter is numbered by its unit and its place there (2-1 = 第二單元第 1 章)
  const UNITS = DATA.units.map(([id, name, icon, desc, short], i) => ({ id, name, icon, desc, short: short || name, n: i + 1 }));
  const UNIT = new Map(UNITS.map(u => [u.id, u]));
  const ZH_NUM = '一二三四五六七八九十';
  const unitLabel = u => `第${ZH_NUM[u.n - 1]}單元`;
  const byId = new Map(CH.map(c => [c.id, c]));
  const numOf = c => CH.indexOf(c) + 1;
  const codeOf = c => { const u = UNIT.get(c.unit); return `${u ? u.n : 0}-${CH.filter(x => x.unit === c.unit).indexOf(c) + 1}`; };
  const TITLE_ID = new Map(CH.map(c => [c.title, c.id]));
  // the level bands of the filter: A1–A2 together, then B1 (the 統測 core) and B2
  const BANDS = [['', '全部'], ['A', '基礎 A1–A2'], ['B1', '統測核心 B1'], ['B2', '進階 B2']];
  const bandOf = c => /^A/.test(c.level) ? 'A' : c.level;
  const QN = 8, PASS = 6; // a chapter's 小測驗 counts as done from 6 of 8
  const L4 = 'ABCD';
  // the text marks: **key term**, [[the words that show the point]], 〈another chapter〉 (a link to it)
  const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[\[(.+?)\]\]/g, '<mark class="gr-hl">$1</mark>')
    .replace(/〈([^〉]+)〉/g, (m, t) => TITLE_ID.has(t) ? `<a href="#ch/${TITLE_ID.get(t)}">〈${esc(t)}〉</a>` : m);
  const plain = s => String(s).replace(/\[\[|\]\]/g, '');
  const blank = (q, fill) => esc(q).replace('______', fill == null ? '<span class="gr-blank"><span class="sr-only" lang="zh-Hant-TW">空格</span></span>' : `<span class="gr-blank filled">${esc(fill)}</span>`);
  const status = c => { const r = store.ch[c.id]; return r && r.best != null ? r : null; };

  /* ---------------- State + address (#ch/g-passive, #quiz) ---------------- */
  const state = { view: 'list', id: '', q: '', unit: '', band: '', picks: {}, mix: null, range: '' };
  function readHash() {
    let raw = location.hash.replace(/^#\/?/, ''); try { raw = decodeURIComponent(raw); } catch (e) { }
    const [v, id] = raw.split('/');
    if (v === 'ch' && byId.has(id)) return { view: 'ch', id, known: true };
    if (v === 'quiz') return { view: 'quiz', id: '', known: true };
    // an unknown address (the skip link's #app, a mangled link) keeps the current view
    return { view: raw ? state.view : 'list', id: raw ? state.id : '', known: !raw };
  }

  /* ---------------- Top of every view ---------------- */
  // 📖 章節 (with how many are done) · 🎯 綜合測驗 (a dot while one waits to be finished)
  function kindsHTML() {
    const going = state.mix && state.mix.i < state.mix.qs.length && state.view !== 'quiz';
    const done = CH.filter(c => (status(c) || {}).best >= PASS).length;
    const tab = (v, href, label, sub) => `<a class="gr-kind${v === 'quiz' && going ? ' has-session' : ''}" href="${href}"${(state.view === 'quiz') === (v === 'quiz') ? ' aria-current="page"' : ''}><span>${label}</span><small>${sub}${v === 'quiz' && going ? '<span class="sr-only">（還沒做完）</span>' : ''}</small></a>`;
    return `<nav class="gr-kinds" aria-label="章節、綜合測驗">${tab('list', '#', '📖 章節', `${CH.length} 章 · 完成 ${done}`)}${tab('quiz', '#quiz', '🎯 綜合測驗', 'Quiz')}</nav>`;
  }
  function headHTML() {
    return `<nav class="subtabs" aria-label="題目">
        <a class="subtab" href="./#/mcq"><span aria-hidden="true">📝</span> 選擇題</a><a class="subtab" href="grammar.html" aria-current="page"><span aria-hidden="true">📐</span> 文法</a>
      </nav>
      ${state.view === 'ch' ? '' : `<header class="page-head"><h1 tabindex="-1"><span aria-hidden="true">📐</span> 文法</h1></header>`}
      ${kindsHTML()}`;
  }

  /* ---------------- 章節 list ---------------- */
  // everything on the chapter's page, tables and 常見錯誤 too, without the ** and [[ ]] marks
  function haystack(c) {
    return [c.title, c.en, c.lead,
      ...c.sections.flatMap(s => [s.h, ...s.text, s.formula || '', ...(s.table ? [...s.table.cols, ...s.table.rows.flat()] : []), ...s.ex.flatMap(x => [x.en, x.zh])]),
      ...c.mistakes.flatMap(m => [m.wrong, m.right, m.why]), ...c.tips].join('\n').replace(/\*\*|\[\[|\]\]/g, '').toLowerCase();
  }
  const HAY = new Map(CH.map(c => [c.id, haystack(c)]));
  function shownChapters() {
    const q = state.q.trim().toLowerCase();
    return CH.filter(c => (!state.unit || c.unit === state.unit) && (!state.band || bandOf(c) === state.band) && (!q || HAY.get(c.id).includes(q)));
  }
  function chCard(c) {
    const r = status(c);
    const st = !r ? '<span class="gr-st">還沒做小測驗</span>' : r.best >= PASS ? `<span class="gr-st ok">✓ 小測驗 ${r.best} / ${QN}</span>` : `<span class="gr-st">小測驗 ${r.best} / ${QN}</span>`;
    return `<a class="card gr-ch${r && r.best >= PASS ? ' is-done' : ''}" href="#ch/${c.id}"><span class="gr-no" aria-hidden="true">${codeOf(c)}</span>
      <span class="gr-ch-body"><span class="gr-ch-t"><b>${esc(c.title)}</b><span class="chip">${esc(c.level)}</span></span><span class="gr-ch-en" lang="en">${esc(c.en)}</span>
      <span class="gr-ch-lead">${rich(c.lead).replace(/<a [^>]*>|<\/a>/g, '')}</span>${st}</span></a>`;
  }
  function listParts() {
    const list = shownChapters(), q = state.q.trim();
    if (!list.length) return { count: q ? `找不到「${q}」。` : '這個分類沒有這個程度的章節。', html: `<div class="card gr-empty"><p>${q ? '試試輸入中文或英文，例如：被動、現在完成、which、if。' : '換一個程度或分類看看。'}</p></div>` };
    let html = '';
    UNITS.forEach(u => {
      const run = list.filter(c => c.unit === u.id); if (!run.length) return;
      const all = CH.filter(c => c.unit === u.id), done = all.filter(c => (status(c) || {}).best >= PASS).length;
      html += `<section class="gr-unit" aria-labelledby="gu-${u.id}"><h2 class="gr-unit-h" id="gu-${u.id}"><span class="gr-unit-ic" aria-hidden="true">${u.icon}</span><span class="gr-unit-t"><small>${unitLabel(u)}</small>${esc(u.name)}</span><span class="gr-unit-n">${all.length} 章${done ? `・完成 ${done}` : ''}</span></h2>
        <p class="gr-unit-d">${esc(u.desc)}</p><div class="gr-grid">${run.map(chCard).join('')}</div></section>`;
    });
    return { count: q || state.band || state.unit ? `${q ? '找到' : '共'} ${list.length} 章` : '', html }; // the whole list: the 章節 tab already counts it
  }
  // 分類 (the units) first, then 程度; each pill counts its chapters
  function filterPills() {
    const upill = (u, name, n) => `<button type="button" class="subtab" data-unit="${u}" aria-pressed="${state.unit === u}">${name}<b>${n}</b></button>`;
    const bpill = (b, name) => `<button type="button" class="subtab" data-band="${b}" aria-pressed="${state.band === b}">${name}<b>${CH.filter(c => !b || bandOf(c) === b).length}</b></button>`;
    return `<div class="gr-frow"><span class="gr-flbl" id="grUnitsLbl">分類</span><nav class="subtabs gr-pills units" aria-labelledby="grUnitsLbl">${upill('', '全部', CH.length)}${UNITS.map(u => upill(u.id, `${u.icon} ${esc(u.short)}`, CH.filter(c => c.unit === u.id).length)).join('')}</nav></div>
      <div class="gr-frow"><span class="gr-flbl" id="grBandsLbl">程度</span><nav class="subtabs gr-pills gr-bands" aria-labelledby="grBandsLbl">${BANDS.map(([b, n]) => bpill(b, n)).join('')}</nav></div>`;
  }
  function listHTML() {
    const last = byId.get(store.last);
    return `<div class="card gr-tools">
        <div class="gr-search"><input type="search" id="grQ" value="${esc(state.q)}" placeholder="搜尋：被動、現在完成、which…" aria-label="搜尋文法章節" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><button type="button" class="gr-clear" data-act="clear" aria-label="清除搜尋"${state.q ? '' : ' hidden'}>✕</button></div>
        <div id="grFilters">${filterPills()}</div>
        ${last ? `<p class="gr-last">📌 上次看到：<a href="#ch/${last.id}">${codeOf(last)}　${esc(last.title)} →</a></p>` : ''}
      </div>${(p => `<p class="gr-count" id="grCount" role="status">${esc(p.count)}</p><div id="grList">${p.html}</div>`)(listParts())}`;
  }
  function refreshList() {
    const p = listParts(); $('#grCount').textContent = p.count; $('#grList').innerHTML = p.html; $('#grFilters').innerHTML = filterPills();
    const c = $('.gr-clear', app); if (c) c.hidden = !state.q;
  }

  /* ---------------- One chapter ---------------- */
  function sectionHTML(s, i) {
    const table = s.table ? `<div class="gr-table-wrap" tabindex="0" role="region" aria-label="${esc(s.h)}（表格）"><table class="gr-table"><thead><tr>${s.table.cols.map(x => `<th scope="col">${rich(x)}</th>`).join('')}</tr></thead>
      <tbody>${s.table.rows.map(r => `<tr>${r.map((x, k) => k ? `<td>${rich(x)}</td>` : `<th scope="row">${rich(x)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
    return `<section class="card gr-sec" id="gs-${i + 1}" tabindex="-1" aria-labelledby="gsh-${i + 1}">
      <h2 id="gsh-${i + 1}"><span class="gr-sn" aria-hidden="true">${i + 1}</span>${rich(s.h)}</h2>
      ${s.text.map(p => `<p>${rich(p)}</p>`).join('')}
      ${s.formula ? `<p class="gr-formula">${rich(s.formula)}</p>` : ''}${table}
      <ul class="gr-ex">${s.ex.map(x => `<li><p class="gr-ex-en"><span lang="en">${rich(x.en)}</span><button type="button" class="icon-btn gr-say" data-say="${esc(plain(x.en))}" aria-label="唸這句">🔊</button></p><p class="gr-ex-zh">${esc(x.zh)}</p></li>`).join('')}</ul>
    </section>`;
  }
  function qItemHTML(c, i) {
    const q = c.quiz[i], pick = (state.picks[c.id] || [])[i], done = pick != null, ok = pick === q.answer;
    const opt = (o, n) => {
      const cls = !done ? '' : n === q.answer ? ' is-right' : n === pick ? ' is-wrong' : '';
      return `<button type="button" class="gr-opt${cls}" data-q="${i}" data-opt="${n}"${done ? ' disabled' : ''} lang="en"><span class="gr-l" aria-hidden="true">${L4[n]}</span><span>${esc(o)}</span>${done && n === q.answer ? '<span class="sr-only" lang="zh-Hant-TW">（正確答案）</span>' : done && n === pick ? '<span class="sr-only" lang="zh-Hant-TW">（你的答案）</span>' : ''}</button>`;
    };
    return `<li class="gr-qi" id="gq-${i}"><p class="gr-qq" lang="en"><span class="gr-qn">${i + 1}.</span> ${blank(q.q, done ? q.options[q.answer] : null)}</p>
      <div class="gr-opts" role="group" aria-label="第 ${i + 1} 題的選項">${q.options.map(opt).join('')}</div>
      ${done ? `<div class="gr-exp ${ok ? 'ok' : 'bad'}"><p class="gr-verdict" id="gv-${i}">${ok ? '✔ 答對了！' : `✘ 正確答案：(${L4[q.answer]}) <span lang="en">${esc(q.options[q.answer])}</span>`}</p><p>${esc(q.explain)}</p></div>` : ''}</li>`;
  }
  function quizSumHTML(c) {
    const picks = state.picks[c.id] || [], n = picks.filter(x => x != null).length, right = picks.filter((x, i) => x === c.quiz[i].answer).length, r = status(c);
    if (n < c.quiz.length) return `<p class="gr-qsum">已答 ${n} / ${c.quiz.length} 題・答對 ${right} 題${r ? `・最佳成績 ${r.best} / ${QN}` : ''}</p>`;
    return `<div class="gr-qdone"><p class="gr-score"><b>${right} / ${c.quiz.length}</b> ${right === c.quiz.length ? '全對！🎉' : right >= PASS ? '很不錯！把答錯的解析再看一次。' : '再讀一次上面的說明，然後重做一次！'}</p>
      <p class="small muted">最佳成績：${r ? r.best : right} / ${QN}</p><button type="button" class="btn" data-act="redo">↻ 再做一次</button></div>`;
  }
  function chapterHTML(c) {
    const n = numOf(c), prev = CH[n - 2], next = CH[n];
    const toc = [...c.sections.map((s, i) => [`gs-${i + 1}`, s.h]), ['gs-mis', '⚠️ 常見錯誤'], ['gs-tips', '🎯 統測重點'], ['gs-quiz', '📝 小測驗']];
    const u = UNIT.get(c.unit) || { icon: '', name: '', n: 0 };
    return `<nav class="gr-crumb" aria-label="位置"><a href="#">← 文法目錄</a><span>${u.icon} ${unitLabel(u)}・${esc(u.name)}・${codeOf(c)}</span></nav>
      <header class="page-head gr-head"><h1 tabindex="-1">${esc(c.title)}</h1><p><span lang="en">${esc(c.en)}</span><span class="chip">${esc(c.level)}</span></p></header>
      <p class="gr-lead">💡 ${rich(c.lead)}</p>
      <nav class="gr-toc" aria-label="本章內容">${toc.map(([id, h]) => `<button type="button" class="gr-toc-b" data-jump="${id}">${rich(h).replace(/<a [^>]*>|<\/a>/g, '')}</button>`).join('')}</nav>
      ${c.sections.map(sectionHTML).join('')}
      <section class="card gr-mis" id="gs-mis" tabindex="-1" aria-labelledby="gsh-mis"><h2 id="gsh-mis">⚠️ 常見錯誤</h2>
        <ul>${c.mistakes.map(m => `<li><p class="gr-wrong" lang="en"><span class="gr-mk" aria-hidden="true">✘</span><span class="sr-only" lang="zh-Hant-TW">錯誤：</span><s>${esc(m.wrong)}</s></p><p class="gr-right" lang="en"><span class="gr-mk" aria-hidden="true">✔</span><span class="sr-only" lang="zh-Hant-TW">正確：</span>${rich(m.right)}</p><p class="gr-why">${rich(m.why)}</p></li>`).join('')}</ul></section>
      <section class="card gr-tips" id="gs-tips" tabindex="-1" aria-labelledby="gsh-tips"><h2 id="gsh-tips">🎯 統測重點</h2><ul>${c.tips.map(x => `<li>${rich(x)}</li>`).join('')}</ul></section>
      <section class="card gr-quiz" id="gs-quiz" tabindex="-1" aria-labelledby="gsh-quiz"><h2 id="gsh-quiz">📝 小測驗</h2>
        <ol class="gr-qs">${c.quiz.map((_, i) => qItemHTML(c, i)).join('')}</ol>
        <div id="grQsum" role="status">${quizSumHTML(c)}</div></section>
      <nav class="gr-pn" aria-label="上一章、下一章">${prev ? `<a class="btn ghost" href="#ch/${prev.id}">← ${codeOf(prev)} ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn accent" href="#ch/${next.id}">${codeOf(next)} ${esc(next.title)} →</a>` : `<a class="btn accent" href="#quiz">🎯 綜合測驗 →</a>`}</nav>`;
  }
  // a chapter's question answered: redraw that question and the count, keep the place on the page; the 8th saves the score
  function answerCh(i, n) {
    const c = byId.get(state.id); if (!c || !c.quiz[i]) return;
    const picks = state.picks[c.id] || (state.picks[c.id] = []); if (picks[i] != null) return;
    picks[i] = n;
    if (c.quiz.every((_, k) => picks[k] != null)) {
      const right = picks.filter((x, k) => x === c.quiz[k].answer).length, r = store.ch[c.id] || {};
      store.ch[c.id] = { best: Math.max(r.best || 0, right), at: today() }; saveStore();
      const k = $('.gr-kinds', app); if (k) k.outerHTML = kindsHTML(); // the 完成 count on the 📖 章節 tab
    }
    const li = $(`#gq-${i}`); if (li) li.outerHTML = qItemHTML(c, i);
    $('#grQsum').innerHTML = quizSumHTML(c);
    const v = $(`#gv-${i}`); if (v) { v.tabIndex = -1; v.focus({ preventScroll: true }); }
  }

  /* ---------------- 綜合測驗 ---------------- */
  const MIXN = 10;
  // a 綜合測驗 range: '' (all), 'u:tense' (a unit) or a level band ('A', 'B1', 'B2')
  const inRange = (c, r) => !r || (r.startsWith('u:') ? c.unit === r.slice(2) : bandOf(c) === r);
  const rangeName = r => !r ? '全部' : r.startsWith('u:') ? (UNIT.get(r.slice(2)) || {}).name : (BANDS.find(x => x[0] === r) || [0, ''])[1];
  function startMix() {
    const chs = CH.filter(c => inRange(c, state.range)), per = {}, qs = [];
    // at most two questions from one chapter, unless the range has too few chapters for ten
    const pool = shuffle(chs.flatMap(c => c.quiz.map((_, i) => ({ id: c.id, i }))));
    for (const x of pool) { if (qs.length === MIXN) break; if ((per[x.id] = (per[x.id] || 0) + 1) <= 2) qs.push(x); }
    for (const x of pool) { if (qs.length === MIXN) break; if (!qs.includes(x)) qs.push(x); }
    state.mix = { range: state.range, qs, i: 0, chosen: null, right: 0, wrong: [] };
  }
  function mixSetHTML() {
    const best = store.mix[state.range || 'all'];
    return `<section class="card gr-mix-set" aria-labelledby="qsTitle"><h2 id="qsTitle" style="margin-top:0">🎯 綜合測驗</h2>
      <p class="muted">從各章的題目隨機抽 ${MIXN} 題，答完看解析，答錯可以直接回到那一章。</p>
      <h3 class="small gr-rh" id="grRu">依單元</h3>
      <div class="gr-ranges units" role="group" aria-labelledby="grRu">${[['', '全部'], ...UNITS.map(u => [`u:${u.id}`, `${u.icon} ${u.short}`])].map(([r, l]) => `<button type="button" class="gr-pick" data-range="${r}" aria-pressed="${state.range === r}">${esc(l)}</button>`).join('')}</div>
      <h3 class="small gr-rh" id="grRb">依程度</h3>
      <div class="gr-ranges" role="group" aria-labelledby="grRb">${BANDS.slice(1).map(([b, l]) => `<button type="button" class="gr-pick" data-range="${b}" aria-pressed="${state.range === b}">${l}</button>`).join('')}</div>
      <p class="gr-best">${best != null ? `「${esc(rangeName(state.range))}」的最佳成績：${best} / ${MIXN}` : `「${esc(rangeName(state.range))}」還沒有成績。`}</p>
      <button type="button" class="btn accent gr-go" data-act="start">開始測驗 ▶</button></section>`;
  }
  function mixQHTML() {
    const s = state.mix, x = s.qs[s.i], c = byId.get(x.id), q = c.quiz[x.i], done = s.chosen != null, ok = s.chosen === q.answer;
    const opt = (o, n) => {
      const cls = !done ? '' : n === q.answer ? ' is-right' : n === s.chosen ? ' is-wrong' : '';
      return `<button type="button" class="gr-opt big${cls}" data-mopt="${n}"${done ? ' disabled' : ''} lang="en"><span class="gr-l" aria-hidden="true">${L4[n]}</span><span>${esc(o)}</span>${done && n === q.answer ? '<span class="sr-only" lang="zh-Hant-TW">（正確答案）</span>' : done && n === s.chosen ? '<span class="sr-only" lang="zh-Hant-TW">（你的答案）</span>' : ''}</button>`;
    };
    return `<section class="card gr-mq" aria-labelledby="qTitle">
      <div class="gr-mq-top"><span>第 ${s.i + 1} / ${s.qs.length} 題</span><span class="gr-bar" aria-hidden="true"><i style="width:${Math.round((s.i + (done ? 1 : 0)) / s.qs.length * 100)}%"></i></span><span>✓ ${s.right}</span></div>
      <h2 id="qTitle" tabindex="-1" lang="en">${blank(q.q, done ? q.options[q.answer] : null)}</h2>
      <div class="gr-opts two">${q.options.map(opt).join('')}</div>
      ${done ? `<div class="gr-exp ${ok ? 'ok' : 'bad'}"><p class="gr-verdict" id="grVerdict">${ok ? '✔ 答對了！' : `✘ 正確答案：(${L4[q.answer]}) <span lang="en">${esc(q.options[q.answer])}</span>`}</p><p>${esc(q.explain)}</p>
        <p class="gr-from">出自 <a href="#ch/${c.id}">${codeOf(c)}〈${esc(c.title)}〉→</a></p></div>
        <div class="gr-next"><button type="button" class="btn accent" data-act="next" aria-describedby="grVerdict">${s.i + 1 < s.qs.length ? '下一題 →' : '看成績 🎉'}</button></div>` : ''}
    </section>`;
  }
  function mixResultHTML() {
    const s = state.mix, n = s.qs.length, wrongCh = [...new Set(s.wrong)].map(id => byId.get(id));
    return `<section class="card gr-result" aria-labelledby="rTitle"><div class="big-icon" aria-hidden="true">${s.right / n >= .8 ? '🎉' : '💪'}</div>
      <h2 id="rTitle" tabindex="-1">綜合測驗完成</h2><p class="gr-rscore">${s.right} / ${n}</p>
      <p class="muted">${s.right === n ? '全對！太厲害了。' : s.right / n >= .7 ? '很不錯！把答錯的章節再看一次。' : '回到答錯的章節讀一讀，再挑戰一次！'}</p>
      ${wrongCh.length ? `<div class="gr-review"><h3>要再看的章節</h3><ul>${wrongCh.map(c => `<li><a href="#ch/${c.id}">${codeOf(c)}　${esc(c.title)}</a></li>`).join('')}</ul></div>` : ''}
      <div class="row" style="justify-content:center;margin-top:16px"><button type="button" class="btn accent" data-act="again">再測一次</button><button type="button" class="btn ghost" data-act="setup">換範圍</button></div></section>`;
  }
  function answerMix(n) {
    const s = state.mix; if (!s || s.chosen != null || s.i >= s.qs.length) return;
    const x = s.qs[s.i], q = byId.get(x.id).quiz[x.i]; s.chosen = n;
    if (n === q.answer) s.right++; else s.wrong.push(x.id);
    render({ focus: '[data-act=next]' });
  }
  function nextMix() {
    const s = state.mix; if (!s || s.chosen == null) return;
    s.i++; s.chosen = null;
    if (s.i >= s.qs.length) { const k = s.range || 'all'; store.mix[k] = Math.max(store.mix[k] || 0, s.right); saveStore(); }
    render({ focus: s.i < s.qs.length ? '#qTitle' : '#rTitle' });
    const top = $('.gr-mq, .gr-result', app); if (top && top.getBoundingClientRect().top < 0) jumpTo(top);
  }

  /* ---------------- Page ---------------- */
  function render(opts = {}) {
    const { view, id } = readHash();
    state.view = view; state.id = id;
    const c = view === 'ch' ? byId.get(id) : null;
    if (c && store.last !== c.id) { store.last = c.id; saveStore(); }
    const body = c ? chapterHTML(c) : view === 'quiz' ? (state.mix ? (state.mix.i < state.mix.qs.length ? mixQHTML() : mixResultHTML()) : mixSetHTML()) : listHTML();
    app.innerHTML = headHTML() + body;
    document.title = `${c ? c.title + '｜' : view === 'quiz' ? '綜合測驗｜' : ''}文法｜英語學習站`;
    if (opts.top) jumpTo(null);
    if (opts.focus) { const f = $(opts.focus, app); if (f) f.focus({ preventScroll: !opts.top }); }
  }

  /* ---------------- Events ---------------- */
  app.addEventListener('click', e => {
    const say1 = e.target.closest('[data-say]'); if (say1) { say(say1.dataset.say); return; }
    const j = e.target.closest('[data-jump]'); if (j) { const t = document.getElementById(j.dataset.jump); if (t) { jumpTo(t); t.focus({ preventScroll: true }); } return; }
    const b = e.target.closest('[data-band]'); if (b) { state.band = b.dataset.band; refreshList(); const f = $(`[data-band="${state.band}"]`, app); if (f) f.focus({ preventScroll: true }); return; }
    const un = e.target.closest('[data-unit]'); if (un) { state.unit = un.dataset.unit; refreshList(); const f = $(`[data-unit="${state.unit}"]`, app); if (f) f.focus({ preventScroll: true }); return; }
    const r = e.target.closest('[data-range]'); if (r) { state.range = r.dataset.range; render({ focus: `[data-range="${state.range}"]` }); return; }
    const o = e.target.closest('[data-opt]'); if (o) { answerCh(+o.dataset.q, +o.dataset.opt); return; }
    const m = e.target.closest('[data-mopt]'); if (m) { answerMix(+m.dataset.mopt); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'clear') { state.q = ''; const i = $('#grQ'); i.value = ''; refreshList(); i.focus(); }
    else if (act === 'redo') { const c = byId.get(state.id); if (!c) return; state.picks[c.id] = []; $('.gr-qs', app).innerHTML = c.quiz.map((_, i) => qItemHTML(c, i)).join(''); $('#grQsum').innerHTML = quizSumHTML(c); const q = $('#gs-quiz'); jumpTo(q); q.focus({ preventScroll: true }); }
    else if (act === 'start' || act === 'again') { if (act === 'again') state.range = state.mix.range; startMix(); render({ focus: '#qTitle', top: true }); }
    else if (act === 'next') nextMix();
    else if (act === 'setup') { state.mix = null; render({ focus: '#qsTitle', top: true }); }
  });
  let typing = 0;
  app.addEventListener('input', e => {
    if (e.target.id !== 'grQ') return;
    state.q = e.target.value; clearTimeout(typing); typing = setTimeout(refreshList, 120);
  });
  // 綜合測驗: 1–4 (or A–D) picks an answer
  document.addEventListener('keydown', e => {
    if (state.view !== 'quiz' || !state.mix || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const s = state.mix, k = /^[1-4]$/.test(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase());
    if (s.chosen == null && s.i < s.qs.length && k >= 0 && e.key.length === 1) { e.preventDefault(); answerMix(k); }
  });
  window.addEventListener('hashchange', () => {
    const h = readHash(); if (!h.known) { app.focus(); return; }
    if (SP) SP.stop(); render({ top: true, focus: h.view === 'quiz' && state.mix ? (state.mix.i < state.mix.qs.length ? '#qTitle' : '#rTitle') : 'h1' });
  });
  $('.skip-link').addEventListener('click', e => { e.preventDefault(); app.focus(); });
  // back on this page from the main site (Back keeps the old page): it may have changed the look
  window.addEventListener('pageshow', e => { if (e.persisted) { ui = readJSON(LS_UI); applyLook(); } });
  const toTop = $('#toTop');
  window.addEventListener('scroll', () => { toTop.hidden = window.scrollY < 700; }, { passive: true });
  toTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); $('h1', app).focus({ preventScroll: true }); });

  render();
})();
