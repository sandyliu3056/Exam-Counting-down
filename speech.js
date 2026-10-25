/* =====================================================
   🔊 Read-aloud, shared by the site's pages (app.js on index.html, roots.js on roots.html)
   ===================================================== */
window.TVESpeech = (() => {
  // With no voice set, each device reads in its own default voice (an iPhone: Samantha, a woman; Windows: often David, a man).
  // So the site picks one: a man's voice unless 女聲 is chosen (設定 / 更多 → 外觀). Browsers do not say which voices are male,
  // so it goes by the well-known voice names; a device without one keeps its own default. The robotic novelty voices are skipped.
  const VOICE_M = /\b(david|mark|guy|andrew|brian|christopher|eric|roger|steffan|davis|tony|jason|ryan|thomas|george|daniel|alex|aaron|arthur|gordon|rishi|evan|nathan|tom|oliver|james|william|liam|connor|mitchell|luke|ken|neil|duncan|brandon|jacob|noah|ethan|elliot|alfie|prabhat|ravi|wayne|sam|chilemba|abeo|elimu|male)\b|-x-(iol|iom|tpd|gbb|gbd|rjs|aub|aud|end)-|\+m\d\b/i; // the codes: Android's Google voices (en-us-x-iom-local …), espeak's +m1…
  const VOICE_F = /\b(samantha|zira|aria|jenny|michelle|emma|ava|allison|susan|karen|moira|tessa|fiona|victoria|kate|serena|martha|catherine|sonia|libby|hazel|heera|neerja|natasha|clara|sara|nicky|zoe|joelle|veena|isha|emily|linda|heather|nancy|jane|elizabeth|amy|salli|kimberly|ivy|joanna|kendra|luna|molly|leah|yan|asilia|ezinne|rosa|imani|female|google us english)\b|-x-(iob|iog|tpc|tpf|sfg|gba|gbc|gbg|fis|aua|auc|ahp|ene)-|\+f\d\b/i;
  const VOICE_ODD = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|princess|grandpa|grandma|rocko|eddy|reed|shelley|sandy|flo|ana|maisie)\b/i; // + Edge's child voices
  const hasTTS = () => !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  // browsers on Android read with the phone's own text-to-speech voice for each language; a page cannot choose one
  const sysVoice = /Android/i.test(navigator.userAgent);
  const isIPad = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPads say Macintosh
  const isIOS = isIPad || /iP(hone|od)/.test(navigator.userAgent);
  // what the page supplies: the chosen kind ('m' / 'f'), a way to show a message, its wording, and what to redraw
  // when the voice list loads or a voice turns out to be silent
  // rate: reading speed (0.75 / 0.9 / 1); voice: a voiceURI picked in 設定 ('' = choose by kind); state(on): reading started / stopped
  const cfg = { kind: () => 'm', toast: () => { }, text: k => k, changed: () => { }, rate: () => 0.9, voice: () => '', state: () => { } };
  let voicesSeen = false; // the voice list has (re)loaded at least once
  const badVoices = new Set(); // voices that said nothing during this visit (an iPhone can list a voice that is not installed)
  const vkey = v => v.voiceURI || v.name;
  const normLang = l => String(l || '').replace('_', '-').toLowerCase();
  const todayStr = (d = new Date()) => { const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; };
  // any English voice whose name tells a man's from a woman's voice (without one, 男聲/女聲 cannot change anything)
  const voiceKnown = () => hasTTS() && speechSynthesis.getVoices().some(x => /^en/i.test(x.lang || '') && (n => VOICE_M.test(n) || VOICE_F.test(n))(`${x.name || ''} ${x.voiceURI || ''}`));
  // strict (the city dialogues): this exact accent first, in the chosen kind if there is one, else any voice of it;
  // otherwise, and when the device has no voice of that accent (Nairobi, Manila …), an English voice of the chosen kind.
  // local: only voices on the device (Edge's Online (Natural) voices need the internet)
  function voiceFor(lang, strict, local) {
    if (!hasTTS()) return null;
    // a voice picked by name in 設定 (an English one, still working, and on the device when offline) comes first
    const want = !strict && cfg.voice();
    if (want) { const v = speechSynthesis.getVoices().find(x => vkey(x) === want); if (v && /^en/i.test(v.lang || '') && !badVoices.has(want) && !((local || navigator.onLine === false) && v.localService === false)) return v; }
    const L = normLang(lang), base = L.split('-')[0];
    const [kind, other] = cfg.kind() === 'f' ? [VOICE_F, VOICE_M] : [VOICE_M, VOICE_F];
    let best = null, top = -1;
    for (const v of speechSynthesis.getVoices()) {
      const vl = normLang(v.lang), n = `${v.name || ''} ${v.voiceURI || ''}`, mine = kind.test(n) && !other.test(n);
      if (VOICE_ODD.test(n) || badVoices.has(vkey(v)) || ((local || navigator.onLine === false) && v.localService === false)) continue;
      // (of the other accents, American and then British English first)
      let s = vl === L ? (mine ? 400 : !strict ? -1 : other.test(n) ? 200 : 300) : mine && vl.split('-')[0] === base ? (vl === 'en-us' ? 100 : vl === 'en-gb' ? 90 : 80) : -1; if (s < 0) continue;
      if (/natural|neural|online/i.test(n)) s += 20; if (/enhanced|premium/i.test(n)) s += 15; if (v.localService) s += 2;
      if (s > top) { top = s; best = v; }
    }
    return best;
  }
  let starts = 0; // utterances that began to speak (say() checks that one did)
  function utter(text, lang, strict, local, plain) {
    const u = new SpeechSynthesisUtterance(text), v = plain ? null : voiceFor(lang, strict, local), all = speechSynthesis.getVoices();
    // no voice picked: the device's default for this accent, or American English when it has none (not its own language)
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = !all.length || all.some(x => !badVoices.has(vkey(x)) && normLang(x.lang) === normLang(lang)) ? lang : 'en-US';
    u.rate = rate(); u.pitch = 1; // natural pitch
    u.onstart = () => { starts++; };
    return u; // say() handles errors: a cloud voice that fails reads the rest again with voices on the device
  }
  if (hasTTS()) {
    speechSynthesis.getVoices(); // most browsers load the list lazily
    const vc = () => { voicesSeen = true; cfg.changed(); };
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', vc); else speechSynthesis.onvoiceschanged = vc;
  }
  // iPhone / iPad: Silent mode (the side switch) mutes web speech but not a playing video. A silent sound looping while
  // the voice speaks puts the page in playback mode like a video, so the voice is heard (audioSession says so on iOS 17+).
  let bridge = null, bridgeTimer = 0;
  function silentWav() { // 0.25 s of 16-bit mono silence
    const n = 5512, d = new DataView(new ArrayBuffer(44 + n * 2)), str = (o, x) => [...x].forEach((c, i) => d.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF'); d.setUint32(4, 36 + n * 2, true); str(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
    d.setUint32(24, 22050, true); d.setUint32(28, 44100, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); str(36, 'data'); d.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([d.buffer], { type: 'audio/wav' }));
  }
  function bridgeOn() {
    if (!isIOS) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
    try {
      if (!bridge) { bridge = new Audio(); bridge.loop = true; bridge.setAttribute('playsinline', ''); bridge.setAttribute('x-webkit-airplay', 'deny'); bridge.src = silentWav(); }
      const p = bridge.play(); if (p && p.catch) p.catch(() => { });
    } catch (e) { }
    // stop once nothing has been speaking for a second (after giving the voice 3 s to begin), or after 15 minutes
    clearInterval(bridgeTimer); let ticks = 0, idle = 0;
    bridgeTimer = setInterval(() => { ticks++; idle = speechSynthesis.speaking || speechSynthesis.pending ? 0 : idle + 1; if ((ticks > 6 && idle > 1) || ticks > 1800) bridgeOff(); }, 500);
  }
  function bridgeOff() {
    clearInterval(bridgeTimer); bridgeTimer = 0;
    try { if (bridge && !bridge.paused) bridge.pause(); if (isIOS && navigator.audioSession && navigator.audioSession.type === 'playback') navigator.audioSession.type = 'auto'; } catch (e) { }
  }
  // leaving the page or switching tabs stops reading (on an iPhone it would be muted anyway)
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  // …and a reminder about Silent mode, once a day on an iPhone or iPad (and on every 試聽)
  const LS_HINT = 'tve_exam_mutehint_v1';
  let hintDay = (() => { try { return localStorage.getItem(LS_HINT); } catch (e) { return null; } })();
  function muteHint(force) {
    if (!isIOS || (!force && hintDay === todayStr())) return;
    hintDay = todayStr(); try { localStorage.setItem(LS_HINT, hintDay); } catch (e) { }
    cfg.toast(cfg.text(isIPad ? 'voiceMuteHintPad' : 'voiceMuteHint'), 7000);
  }
  // say these lines one after another. iPhone Safari can drop a speak() made right after cancel(): say() cancels only
  // when something is playing (stop() always does) and speaks at least 150 ms after the last cancel().
  // Chrome, Edge and Android send "start" reliably: no start after 4 s (6 s for a cloud voice) → that voice is silent,
  // try the next one (a voice on the device after a silent cloud voice), then the device's default, and say so if that
  // does not start either.
  // Safari (iPhone, iPad, Mac) may send no event at all while it reads, and its speaking flag stays on from speak() until
  // the reading is reported finished, so it cannot tell sound from silence. There a voice is replaced only on clear
  // evidence (a reading that "ends" at once, or the device not reading anything), never just because no event came:
  // replacing it would read the same text again. A reading still "speaking" long after it should be over is let go
  // (停止朗讀 hides), and cleared later still, so the next 🔊 is not stuck behind it.
  const webkit = isIOS || (/Safari\//.test(navigator.userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|Android/.test(navigator.userAgent));
  let speakSeq = 0, last = null; // last: the latest try, to tell whether its voice was heard
  let live = []; // the lines being read, kept referenced so the browser does not drop them (and their events) early
  let cancelAt = -1e9, cutAt = -1e9; // when cancel() was last called, and when it last stopped something being read
  const cancel = () => { const n = performance.now(); cancelAt = n; if (speechSynthesis.speaking || speechSynthesis.pending) cutAt = n; speechSynthesis.cancel(); };
  const silentMs = new Map(); // voice → time it has stayed silent over taps that came too soon to judge it
  const rate = () => Math.min(1.1, Math.max(0.6, +cfg.rate() || 0.9));
  // about how long a text takes to read (some 150 words a minute at normal speed)
  const readMs = t => String(t).split(/\s+/).filter(Boolean).length / (2.5 * rate()) * 1000;
  const waitFor = v => v && v.localService === false ? 6000 : 4000; // a cloud voice may take longer to start
  function say(lines, lang, strict, test) {
    if (!hasTTS() || !lines.length) return;
    // Chrome's online voices stop after about 15 seconds of one line, so a long text goes sentence by sentence there,
    // in shorter parts at slower speeds. Safari reads a next line only once the last is reported finished: one piece.
    const max = Math.round(200 * Math.min(1, rate()));
    if (!webkit) lines = lines.flatMap(x => String(x).length > max ? speechChunks(x, max) : [x]);
    // tapped again while the last voice was still silent: that silence counts, so 4 s in all (6 s for a cloud voice)
    // marks the voice (taps every 2–3 s would otherwise restart its wait each time and never move on). Not on Safari.
    if (last && last.v && !webkit) {
      const k = vkey(last.v);
      if (last.heard()) silentMs.delete(k);
      else {
        const now = performance.now(), ms = (silentMs.get(k) || 0) + now - last.t0; silentMs.set(k, ms); last.t0 = now; // counted once
        if (ms >= waitFor(last.v)) { badVoices.add(k); cfg.changed(); }
      }
    }
    const ss = speechSynthesis, my = ++speakSeq;
    bridgeOn(); muteHint(test); // both inside the tap, which iPhone Safari requires
    if (ss.speaking || ss.pending) cancel();
    if (ss.paused) ss.resume();
    const run = (tries, local, from) => {
      if (my !== speakSeq) return;
      const part = lines.slice(from);
      const us = part.map(text => utter(text, lang, strict, local, tries >= 2)), v = us[0].voice, s0 = starts, t0 = performance.now();
      live = us;
      // a Safari reading begun within a second of cancelling another can be "finished" at once by the cancelled one's
      // late notice while it is really being read: that is no sign of a silent voice
      const late = webkit && t0 - cutAt < 1000;
      let gone = false, watch = 0, ended = false, quick = false, marks = 0, letGo = false;
      const heard = () => ended || marks > 0 || starts > s0;
      if (v) { const os = us[0].onstart; us[0].onstart = e => { os(e); silentMs.delete(vkey(v)); }; } // heard: its silent time starts again from 0
      last = { v, t0, heard };
      const stopWatch = () => { gone = true; clearInterval(watch); };
      const done = () => { stopWatch(); if (my === speakSeq) cfg.state(false); };
      const clear = () => { stopWatch(); if (my !== speakSeq) return; if (ss.speaking || ss.pending) cancel(); bridgeOff(); cfg.state(false); }; // stuck: no retry
      const fail = () => {
        if (gone || my !== speakSeq || heard()) return; stopWatch();
        if (v) { badVoices.add(vkey(v)); cfg.changed(); }
        cancel();
        if (tries >= 2 || (!v && tries >= 1)) { bridgeOff(); last = null; cfg.state(false); cfg.toast(cfg.text(voicesSeen && !ss.getVoices().length ? 'voiceNone' : isIOS ? 'voiceStuckIOS' : 'voiceStuck'), 7000); return; }
        // a silent cloud voice most likely means no internet: go on with voices on the device
        bridgeOn(); setTimeout(() => run(tries + 1, local || (!!v && v.localService === false), from), 150);
      };
      us.forEach((u, i) => {
        u.onboundary = () => { marks++; }; // word by word while it speaks (where the browser says so)
        // errors of our own cancel() are ignored through gone / speakSeq (Safari reports every error as "canceled")
        u.onerror = e => {
          if (gone || my !== speakSeq || (!webkit && /interrupted|canceled/.test((e && e.error) || ''))) return;
          // a cloud voice that fails (no internet, the service down): the rest again, in order, with voices on the device
          if (u.voice && u.voice.localService === false && !local) { stopWatch(); cancel(); setTimeout(() => run(tries, true, from + i), 150); return; }
          if (i === 0 && !heard() && !late) fail();
        };
      });
      // a browser that never says "start": a line that ends normally counts as heard; one that "ends" at once (well
      // before even a short word could be said) does not
      let prev = t0;
      us.forEach(u => { const min = Math.min(400, readMs(u.text) * 0.25); u.onend = () => { const n = performance.now(); if (n - prev > min) ended = true; else quick = true; prev = n; }; });
      const lastU = us[us.length - 1], oe = lastU.onend; lastU.onend = e => { oe(e); if (!gone && my === speakSeq && (heard() || (quick && late))) done(); }; // ending at once: judged below
      cfg.state(true);
      us.forEach(u => { if (!gone) ss.speak(u); }); // an error inside speak() may already have moved on
      // every 0.1 s: finished and heard → done. After 4 s (6 s for a cloud voice) with nothing heard: on Chrome, Edge and
      // Android, or when the device is not reading anything at all → silent, try the next voice; on Safari while it is
      // "speaking" → leave it. Long past the time the text needs: let go (停止朗讀 hides), later cleared, never retried.
      // A heard reading that stops reporting (Chrome cuts its online voices after about 15 s) is cleared after a while.
      const wait = waitFor(v), limit = Math.max(6000, readMs(part.join(' ')) * 1.5 + 4000), limitAll = limit * 2 + 10000;
      const longest = Math.max(...part.map(readMs));
      watch = setInterval(() => {
        if (gone || my !== speakSeq) { clearInterval(watch); return; }
        const on = ss.speaking || ss.pending, ms = performance.now() - t0;
        if (!on && heard()) { done(); return; }
        if (heard()) { if (on && performance.now() - prev > Math.max(6000, longest * 2 + 10000)) clear(); return; }
        if (ms < wait) return;
        if (!webkit) { fail(); return; }
        if (!on) { if (late) done(); else fail(); return; }
        if (ms > limitAll) clear();
        else if (ms > limit && !letGo) { letGo = true; cfg.state(false); }
      }, 100);
    };
    const gap = 150 - (performance.now() - cancelAt);
    if (gap > 0) setTimeout(() => run(0, false, 0), gap); else run(0, false, 0);
  }
  // sentence by sentence, at most max characters a part. A sentence ends at . ! or ? before a capital, a digit or a
  // quote, not inside U.S., a.m., Dr. or 2.5; a sentence longer than a part is split at a comma, semicolon or colon
  const sentences = t => String(t).replace(/([.!?]+["'\u201D\u2019)\]]*)(\s+)(?=["\u201C\u2018(]?[A-Z0-9])/g, (m, p, sp, i, all) => /(?:^|[\s.("\u201C\u2018])(?:[A-Za-z]|Mr|Mrs|Ms|Dr|St|Mt|Jr|Sr|No|vs|Prof|Gen|Gov|Sen|Rep|Inc|Ltd|Capt|Col|Lt|Co)\.$/.test(all.slice(Math.max(0, i - 5), i) + p) ? m : p + sp + '\u0001').split('\u0001');
  const speechChunks = (text, max = 200) => { const out = []; let cur = ''; sentences(text).flatMap(x => x.length > max ? x.replace(/([,;:])\s+/g, '$1 \u0001').split('\u0001') : [x]).forEach(x => { if (cur && (cur + x).length > max) { out.push(cur); cur = ''; } cur += x; }); if (cur.trim()) out.push(cur); return out; };
  // English only: any Chinese in the text (a teacher's own example, a note) is left out, never read with the English voice
  function speak(text, test) { const en = String(text).replace(/[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u3000-\u303F]+/g, ' ').replace(/\s{2,}/g, ' ').trim(); if (!/[A-Za-z]/.test(en)) return; say([en], 'en-US', false, test); }
  function stop() { speakSeq++; last = null; live = []; bridgeOff(); if (hasTTS()) cancel(); cfg.state(false); } // cancel() even when it looks idle: Safari can lose the finish of a reading
  // the English voices this device offers, for the 設定 list
  const englishVoices = () => hasTTS() ? speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang || '') && !VOICE_ODD.test(`${v.name || ''} ${v.voiceURI || ''}`)) : [];
  return {
    setup: o => Object.assign(cfg, o), hasTTS, sysVoice, isIOS, voicesSeen: () => voicesSeen,
    voiceFor, voiceKnown, say, speak, stop, englishVoices, vkey,
  };
})();
