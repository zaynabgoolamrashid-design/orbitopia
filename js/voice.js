/* Orbitopia — voice: characters talk (speech synthesis) and kids can talk back (speech recognition).
   Nothing is recorded or stored by Orbitopia. In Chrome, speech recognition is processed by the browser's speech service. */
window.VOICE = (() => {
  const synth = window.speechSynthesis;
  let voices = [];
  let muted = false;
  const load = () => { voices = synth ? synth.getVoices() : []; };
  if (synth) { load(); synth.onvoiceschanged = load; }

  // Smooth, friendly voices first: natural/neural voices (Edge, Windows 11, macOS/iOS), then Google voices.
  const RANK = {
    en: [/ana online|ana \(natural\)/i, /aria online|aria \(natural\)/i, /jenny online|jenny \(natural\)/i, /ava online|ava \(natural\)/i, /emma online|emma \(natural\)/i, /natural/i, /online/i,
         /^samantha/i, /ava \(premium|ava \(enhanced/i, /karen|moira|tessa/i, /google us english/i, /google uk english female/i, /zira/i],
    fr: [/eloise online|eloise \(natural\)/i, /denise online|denise \(natural\)/i, /vivienne/i, /coralie/i, /sylvie/i, /natural/i, /online/i,
         /^am[eé]lie/i, /audrey/i, /aurelie|aurélie/i, /google fran[cç]ais/i, /julie/i, /hortense/i]
  };
  let chosen = { en: null, fr: null };
  try { chosen = Object.assign(chosen, JSON.parse(localStorage.getItem("orb_voice") || "{}")); } catch (_) { }
  function langVoices(lang) {
    const pref = lang === "fr" ? "fr" : "en";
    return voices.filter(v => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(pref));
  }
  function pickVoice(lang) {
    const L = lang === "fr" ? "fr" : "en", list = langVoices(L);
    if (chosen[L]) { const c = list.find(v => v.name === chosen[L]); if (c) return c; }
    for (const re of RANK[L]) { const hit = list.find(v => re.test(v.name) && !/male\b/i.test(v.name.replace(/female/i, ""))); if (hit) return hit; }
    for (const re of RANK[L]) { const hit = list.find(v => re.test(v.name)); if (hit) return hit; }
    const local = list.filter(v => /US|GB|FR/i.test(v.lang));
    return local[0] || list[0] || null;
  }
  function setVoice(lang, name) { chosen[lang === "fr" ? "fr" : "en"] = name || null; try { localStorage.setItem("orb_voice", JSON.stringify(chosen)); } catch (_) { } }
  function listVoices(lang) { return langVoices(lang).map(v => v.name); }
  function currentVoice(lang) { const v = pickVoice(lang); return v ? v.name : ""; }
  function isNatural(v) { return v && /natural|online|premium|enhanced|neural/i.test(v.name); }

  function clean(text) {
    return String(text)
      .replace(/⚡/g, " power ").replace(/🫧/g, " air ").replace(/🛡️/g, " shield ").replace(/⭐/g, " star ")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " ").replace(/\s+/g, " ").trim();
  }
  function cleanFr(text) {
    return String(text)
      .replace(/⚡/g, " énergie ").replace(/🫧/g, " air ").replace(/🛡️/g, " bouclier ").replace(/⭐/g, " étoile ")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " ").replace(/\s+/g, " ").trim();
  }

  function speak(text, lang = "en", who = "kiko", onend) {
    if (!synth || muted || !text) { onend && onend(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(lang === "fr" ? cleanFr(text) : clean(text));
    u.lang = lang === "fr" ? "fr-FR" : "en-US";
    const v = pickVoice(lang); if (v) u.voice = v;
    // Natural voices already sound warm: keep them close to normal. Basic voices get a gentle lift so Nova sounds young and friendly.
    const nat = isNatural(v);
    u.rate = who === "sun" ? 0.9 : (nat ? 0.95 : 0.92);
    u.pitch = who === "sun" ? 0.8 : (nat ? 1.08 : 1.18);
    u.onstart = () => document.body.classList.add("speaking");
    u.onend = u.onerror = () => { document.body.classList.remove("speaking"); onend && onend(); };
    synth.speak(u);
  }
  function stop() { if (synth) synth.cancel(); document.body.classList.remove("speaking"); }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, listening = false;
  function canListen() { return !!SR; }
  function listen(lang, onText, onState) {
    if (!SR) { onState && onState("unsupported"); return; }
    if (listening && rec) { rec.stop(); return; }
    stop();
    rec = new SR();
    rec.lang = lang === "fr" ? "fr-FR" : "en-US";
    rec.interimResults = false; rec.maxAlternatives = 3; rec.continuous = false;
    rec.onstart = () => { listening = true; onState && onState("listening"); };
    rec.onend = () => { listening = false; onState && onState("idle"); };
    rec.onerror = (e) => {
      listening = false;
      const map = { "not-allowed": "denied", "service-not-allowed": "denied", "no-speech": "nohear", "audio-capture": "nomic", "network": "network" };
      onState && onState(map[e.error] || "error");
    };
    rec.onresult = (e) => {
      const alts = Array.from(e.results[0]).map(a => a.transcript.toLowerCase());
      onText(alts);
    };
    try { rec.start(); } catch (_) { onState && onState("error"); }
  }

  // Parse kid speech into game commands. Returns [{cmd, n}]
  const NUM = { one: 1, un: 1, une: 1, two: 2, deux: 2, three: 3, trois: 3, four: 4, quatre: 4, "1": 1, "2": 2, "3": 3, "4": 4 };
  const CMDS = [
    ["air", /\b(air|oxygen|oxyg[eè]ne|breath|respire)\b/],
    ["plants", /\b(plant|plants|plantes?|green ?house|garden|serre|jardin|salade|lettuce|grow|pousse)\b/],
    ["shield", /\b(shields?|boucliers?|protect|prot[eè]ge|dirt|terre)\b/],
    ["science", /\b(science|explore|exploring|explorer|discover|d[eé]couvr|recherche)\b/],
    ["alarm", /\b(alarms?|alarmes?|sensors?|capteurs?)\b/],
    ["undo", /\b(undo|remove|take back|annule|enl[eè]ve|reprend)\b/],
    ["go", /\b(go|next|night|shadow|done|end|finish|suivant|nuit|ombre|termin|fini|allez|c'est parti)\b/],
    ["yes", /\b(yes|yeah|yep|ok|okay|do it|oui|d'accord|vas-y)\b/],
    ["no", /\b(no|nope|not now|non|pas maintenant)\b/],
    ["help", /\b(help|aide|what|quoi|repeat|r[eé]p[eè]te)\b/],
    ["moon", /\b(moon|lune)\b/], ["mars", /\b(mars)\b/], ["play", /\b(play|start|jouer|commence|lance)\b/]
  ];
  function parse(alts) {
    for (const t of alts) {
      const out = [];
      const words = t.split(/\s+/);
      for (const [cmd, re] of CMDS) if (re.test(t)) {
        let n = 1;
        words.forEach((w, i) => { if (NUM[w] && words.slice(i, i + 3).some(x => re.test(x))) n = NUM[w]; });
        out.push({ cmd, n });
      }
      if (out.length) return { text: t, cmds: out };
    }
    return { text: alts[0] || "", cmds: [] };
  }

  return { speak, stop, listen, canListen, parse, setVoice, listVoices, currentVoice, setMuted: m => { muted = m; if (m) stop(); }, isMuted: () => muted };
})();
