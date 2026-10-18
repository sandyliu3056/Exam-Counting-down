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
  const cfg = { kind: () => 'm', toast: () => { }, text: k => k, changed: () => { } };
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
    u.rate = 0.9;
    u.onstart = () => { starts++; };
    // a cloud voice that fails (no internet, the service down) says it again with a voice on the device
    if (v && v.localService === false && !local) u.onerror = e => { if (!/interrupted|canceled/.test((e && e.error) || '')) speechSynthesis.speak(utter(text, lang, strict, true)); };
    return u;
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
  // an iPhone leaving the page: stop reading (whatever played on afterwards would be muted again)
  document.addEventListener('visibilitychange', () => { if (document.hidden && isIOS) stop(); });
  // …and a reminder about Silent mode, once a day on an iPhone or iPad (and on every 試聽)
  const LS_HINT = 'tve_exam_mutehint_v1';
  let hintDay = (() => { try { return localStorage.getItem(LS_HINT); } catch (e) { return null; } })();
  function muteHint(force) {
    if (!isIOS || (!force && hintDay === todayStr())) return;
    hintDay = todayStr(); try { localStorage.setItem(LS_HINT, hintDay); } catch (e) { }
    cfg.toast(cfg.text(isIPad ? 'voiceMuteHintPad' : 'voiceMuteHint'), 7000);
  }
  // say these lines one after another. iPhone Safari can drop a speak() made right after cancel(), so cancel only when
  // something is playing and wait a moment after it. If nothing is heard (a listed voice that is not installed, a stuck
  // queue), try the next voice, then the device's default voice, and say so if that does not start either.
  let speakSeq = 0, last = null; // last: the latest try, to tell whether its voice was heard
  const silentMs = new Map(); // voice → time it has stayed silent over taps that came too soon to judge it
  function say(lines, lang, strict, test) {
    if (!hasTTS() || !lines.length) return;
    // tapped again while the last voice was still silent: that silence counts, so 4 s in all marks the voice
    // (taps every 2–3 s would otherwise restart its 4 s each time and never move on)
    if (last && last.v && !last.heard()) {
      const k = vkey(last.v), ms = (silentMs.get(k) || 0) + performance.now() - last.t0; silentMs.set(k, ms);
      if (ms >= 4000) { badVoices.add(k); cfg.changed(); }
    }
    const ss = speechSynthesis, my = ++speakSeq, busy = ss.speaking || ss.pending;
    bridgeOn(); muteHint(test); // both inside the tap, which iPhone Safari requires
    if (busy) ss.cancel();
    if (ss.paused) ss.resume();
    const run = tries => {
      if (my !== speakSeq) return;
      const us = lines.map(text => utter(text, lang, strict, false, tries >= 2)), v = us[0].voice, s0 = starts, t0 = performance.now();
      let gone = false, timer = 0, ended = false;
      const heard = () => ended || starts > s0;
      last = { v, t0, heard };
      const fail = () => {
        if (gone || my !== speakSeq || heard()) return; gone = true; clearTimeout(timer);
        if (v) { badVoices.add(vkey(v)); cfg.changed(); }
        ss.cancel();
        if (tries >= 2 || (!v && tries >= 1)) { bridgeOff(); last = null; cfg.toast(cfg.text(voicesSeen && !ss.getVoices().length ? 'voiceNone' : isIOS ? 'voiceStuckIOS' : 'voiceStuck'), 7000); return; }
        bridgeOn(); setTimeout(() => run(tries + 1), 150);
      };
      if (!us[0].onerror) us[0].onerror = e => { if (!/interrupted|canceled/.test((e && e.error) || '')) fail(); }; // a cloud voice retries on the device first
      // a browser that never says "start": a line that ends normally, not at once, counts as heard
      let prev = t0; us.forEach(u => { u.onend = () => { const n = performance.now(); if (n - prev > 400) ended = true; prev = n; }; });
      us.forEach(u => ss.speak(u));
      timer = setTimeout(fail, v && v.localService === false ? 6000 : 4000);
    };
    if (busy) setTimeout(() => run(0), 150); else run(0);
  }
  // a long text (a whole article) goes sentence by sentence: Chrome's online Google voices stop after about 15 seconds
  const speechChunks = text => { const out = []; let cur = ''; (String(text).match(/[^.!?]+[.!?]+["'”’)\]]*\s*|[^.!?]+$/g) || [String(text)]).forEach(s => { if (cur && (cur + s).length > 200) { out.push(cur); cur = ''; } cur += s; }); if (cur.trim()) out.push(cur); return out; };
  function speak(text, test) { say(String(text).length > 200 ? speechChunks(text) : [String(text)], 'en-US', false, test); }
  function stop() { speakSeq++; last = null; bridgeOff(); if (hasTTS() && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel(); }
  return {
    setup: o => Object.assign(cfg, o), hasTTS, sysVoice, isIOS, voicesSeen: () => voicesSeen,
    voiceFor, voiceKnown, say, speak, stop,
  };
})();
