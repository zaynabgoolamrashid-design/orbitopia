/* Orbitopia — screens, interaction, voice, live NASA data. Plain JS, no frameworks, no emoji. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const D = window.ORB_DATA, C = window.ORB_CONTENT, E = window.ENGINE, A = window.ART, V = window.VOICE, I = window.ICON;

  const store = {
    get(k, d) { try { const v = localStorage.getItem("orb_" + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem("orb_" + k, JSON.stringify(v)); } catch (_) { } }
  };
  const S = {
    lang: store.get("lang", (navigator.language || "en").startsWith("fr") ? "fr" : "en"),
    muted: store.get("muted", false), classroom: store.get("classroom", false),
    screen: "title", site: null, weekChoice: "surprise", g: null,
    live: { status: "checking", flares: [], seps: 0 },
    badges: store.get("badges", []), howSeen: store.get("how", false), quizIdx: 0
  };
  V.setMuted(S.muted);
  // On the Moon, some words change ("Night" becomes "Shadow time"): use the key + "_moon" when it exists.
  const T = (k, ...a) => {
    const d = I18N[S.lang] || I18N.en;
    const moon = S.g && S.g.site === "moon" && (S.screen === "game" || S.screen === "end" || S.screen === "impact") && d[k + "_moon"] != null;
    const v = moon ? d[k + "_moon"] : d[k];
    return typeof v === "function" ? v(...a) : (v == null ? k : v);
  };
  const L = (o) => (o && (o[S.lang] || o.en)) || "";
  const fr = () => S.lang === "fr";
  const G = window.GUIDE;
  const PIC = { air: "oxygen", battery: "power", power: "power", shield: "shield", explore: "flask", alarm: "sensor", rad: "rad", star: "star", sun: "sun", trophy: "trophy", plant: "greenhouse", ice: "drop", flask: "flask", leaf: "greenhouse", food: "apple", satellite: "dishic" };
  const P = (n, c = "") => (n === "moon" || n === "mars") ? `<span class="pic art-ic ${c}">${A[n]()}</span>` : I(PIC[n] || n, "pic " + c);
  const sunPic = (level = 0, unknown = false, c = "") => `<div class="sunpic lvl${unknown ? "u" : level} ${c}">${A.sunSoft()}${unknown ? `<b class="sp-badge q">?</b>` : level > 0 ? `<b class="sp-badge">${level}</b>` : ""}</div>`;
  const seen = store.get("seen", {});
  const once = (k) => { if (seen[k]) return false; seen[k] = 1; store.set("seen", seen); return true; };

  /* ---------- sound effects ---------- */
  let ac = null;
  function beep(type) {
    if (S.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const seq = { tap: [[660, .06]], add: [[520, .05], [780, .08]], no: [[220, .12]], storm: [[110, .35]], win: [[523, .1], [659, .1], [784, .1], [1046, .22]], night: [[392, .12], [330, .18]], lose: [[392, .15], [330, .15], [262, .3]] }[type] || [[600, .05]];
      let t = ac.currentTime;
      seq.forEach(([f, d]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type === "storm" ? "sawtooth" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
      });
    } catch (_) { }
  }
  function say(text, who = "kiko", onend) { V.speak(text, S.lang, who, onend); }
  function teach(text, target, opts = {}) { return G.say(text, { target, lang: S.lang, ...opts }); }
  function toast(msg, ms = 2600) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms); }

  /* ---------- live NASA DONKI (falls back to saved snapshot) ---------- */
  const DONKI = "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/";
  const ymd = d => d.toISOString().slice(0, 10);
  const rankFlare = c => { const f = E.parseFlare(c); return f ? ({ A: 1, B: 2, C: 3, M: 4, X: 5 }[f.letter]) * 100 + f.mag : 0; };
  async function getJSON(url, ms = 7000) {
    const ctl = new AbortController(); const id = setTimeout(() => ctl.abort(), ms);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); const t = await r.text(); return t.trim() ? JSON.parse(t) : []; }
    finally { clearTimeout(id); }
  }
  async function checkLive() {
    const end = new Date(), start = new Date(Date.now() - 6 * 864e5);
    try {
      const [fl, sep] = await Promise.all([getJSON(`${DONKI}FLR?startDate=${ymd(start)}&endDate=${ymd(end)}`), getJSON(`${DONKI}SEP?startDate=${ymd(start)}&endDate=${ymd(end)}`)]);
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = ymd(new Date(start.getTime() + i * 864e5));
        const best = (fl || []).filter(f => (f.peakTime || f.beginTime || "").startsWith(d)).sort((a, b) => rankFlare(b.classType) - rankFlare(a.classType))[0];
        const sp = (sep || []).filter(s => (s.eventTime || "").startsWith(d));
        days.push({ date: d, flare: best ? best.classType : null, peak: best ? (best.peakTime || "").slice(11, 16) : null, cme: null, sep: sp.length > 0, sepTime: sp[0] ? sp[0].eventTime.slice(11, 16) : null });
      }
      const big = (fl || []).map(f => f.classType).sort((a, b) => rankFlare(b) - rankFlare(a))[0] || "-";
      S.live = { status: "live", flares: fl || [], seps: (sep || []).length, big, fetchedAt: new Date(),
        week: { id: "live", emoji: "sun0", live: true, title: { en: "The real Sun, last 7 days", fr: "Le vrai Soleil, 7 derniers jours" }, range: `${ymd(start)} – ${ymd(end)}`, story: { en: "This week's Sun, fetched live from NASA DONKI when you opened the game.", fr: "Le Soleil de cette semaine, récupéré en direct sur NASA DONKI à l’ouverture du jeu." }, days } };
    } catch (e) { S.live = { status: "archived", flares: D.snapshot.flares, seps: D.snapshot.sepCount, big: "M3.5" }; }
    updateLiveChip();
  }
  function updateLiveChip() {
    const el = $("#liveChip"); if (!el) return;
    if (S.live.status === "checking") { el.className = "live-chip"; el.innerHTML = `<span class="dot"></span>${T("checking")}`; return; }
    const live = S.live.status === "live";
    el.className = "live-chip " + (live ? "on" : "arch");
    el.innerHTML = `${I("satellite")}<span>${live ? T("liveChip", S.live.flares.length, S.live.big) : T("archChip")}</span><b class="${live ? "tag-live" : "tag-arch"}">${live ? T("live") : T("archived")}</b>`;
  }

  /* ---------- chrome ---------- */
  function bindStatic() {
    document.documentElement.lang = S.lang;
    $("#langEn").classList.toggle("on", S.lang === "en"); $("#langFr").classList.toggle("on", S.lang === "fr");
    $("#soundBtn").innerHTML = I(S.muted ? "mute" : "sound");
    $("#soundBtn").setAttribute("aria-label", S.muted ? T("soundOff") : T("soundOn"));
    $("#menuBtn").setAttribute("aria-label", T("menu"));
    $("#askBtn").innerHTML = `${I("question")}<span>${T("ask")}</span>`;
  }
  function go(screen) { S.screen = screen; V.stop(); closeModal(true); render(); window.scrollTo(0, 0); }
  function render() {
    bindStatic(); $("#menuBtn").innerHTML = I("menu");
    const el = $("#screen"); el.className = "screen-" + S.screen;
    G.hush(); G.show(S.screen === "game"); if (S.screen === "game") { G.dock(); G.peek(true); }
    ({ title: rTitle, story: rStory, site: rSite, game: rGame, end: rEnd, impact: rImpact }[S.screen] || rTitle)(el);
  }
  const micBtn = (cls = "") => `<button class="mic ${cls}" id="micBtn" aria-label="${T("mic")}">${I("mic")}<span class="mic-t">${T("mic")}</span></button>`;

  /* ---------- title ---------- */
  function rTitle(el) {
    el.innerHTML = `
      <section class="title-wrap">
        <div class="orbit-hero">
          <div class="orbit-ring"></div>
          <div class="orbiter o-moon stk">${A.moon()}</div>
          <div class="orbiter o-mars stk">${A.mars()}</div>
          <span class="tw-star s1">${I("star")}</span><span class="tw-star s2">${I("star")}</span><span class="tw-star s3">${I("star")}</span>
          <button class="hero-astro stk" id="heroAstro" aria-label="Nova">${A.nova("wave")}</button>
        </div>
        <h1 class="logo" aria-label="Orbitopia"><span>ORBIT</span><span class="o2">OPIA</span></h1>
        <p class="tagline">${T("tagline")}</p>
        <button class="btn btn-play" id="playBtn">${I("play")}<span>${T("play")}</span></button>
        <div id="liveChip" class="live-chip"></div>
        <nav class="title-links">
          <button class="link-card" id="tlSci">${I("telescope")}<span>${T("science")}</span></button>
          <button class="link-card" id="tlAdult">${I("family")}<span>${T("grownups")}</span></button>
        </nav>
      </section>`;
    updateLiveChip();
    $("#playBtn").onclick = () => { beep("add"); S.taleIdx = 0; go(store.get("storySeen", false) ? "site" : "story"); };
    $("#tlSci").onclick = openScience; $("#tlAdult").onclick = openAdults;
    $("#heroAstro").onclick = () => { beep("tap"); const n = $("#heroAstro .nova2"); n.classList.remove("wave"); n.classList.add("talk"); say(T("hello"), "kiko", () => { const m = $("#heroAstro .nova2"); if (m) { m.classList.remove("talk"); m.classList.add("wave"); } }); };
  }

  /* ---------- choose base ---------- */
  function rSite(el) {
    const weeks = [...(S.live.week ? [S.live.week] : []), ...D.weeks];
    const card = (site) => `
      <button class="site-card ${site} ${S.site === site ? "sel" : ""}" data-site="${site}" aria-pressed="${S.site === site}">
        <span class="pill ${site === "moon" ? "easy" : "hard"}">${T(site + "Sub")}</span>
        <div class="site-planet stk">${A[site]()}</div>
        <h2>${T(site)}</h2>
        <ul class="site-facts">
          <li>${P("satellite")}<span>${T("msgDelay")}</span><b>${T(site + "Delay")}</b></li>
          <li>${P("sun")}<span>${T("sunPower")}</span><b>${T(site + "Sun")}</b></li>
          <li>${P("rad")}<span>${T("radDay")}</span><b>${T(site + "Rad")}</b></li>
        </ul>
        <span class="sel-check">${I("check")}</span>
      </button>`;
    el.innerHTML = `
      <section class="site-wrap">
        <div class="guide-row"><span class="guide-astro stk">${A.nova("talk")}</span><div class="speech"><span class="kiko-line">${T("chooseBase")}</span></div></div>
        <div class="site-cards">${card("moon")}${card("mars")}</div>
        <button class="text-btn story-link" id="storyAgain">${I("book")}<span>${T("watchStory")}</span></button>
        <details class="week-pick">
          <summary>${I("calendar")}<span>${T("weekLink")}</span></summary>
          <div class="weeks">
            <button class="week ${S.weekChoice === "surprise" ? "sel" : ""}" data-week="surprise">${I("star")}<b>${T("surprise")}</b></button>
            ${weeks.map(w => `<button class="week ${S.weekChoice === w.id ? "sel" : ""}" data-week="${w.id}"><span class="wk-sun">${sunPic(+String(w.emoji).replace("sun", "") || 0)}</span><b>${L(w.title)}</b><small>${w.range} <i class="${w.live ? "tag-live" : "tag-arch"}">${w.live ? T("live") : T("archived")}</i></small></button>`).join("")}
          </div>
        </details>
        <div class="action-row">${micBtn()}<button class="btn btn-go" id="startBtn" ${S.site ? "" : "disabled"}>${I("play")}<span>${T("start")}</span></button></div>
      </section>`;
    $$(".site-card").forEach(b => b.onclick = () => pickSite(b.dataset.site));
    $$(".week").forEach(b => b.onclick = () => { S.weekChoice = b.dataset.week; beep("tap"); $$(".week").forEach(x => x.classList.toggle("sel", x === b)); });
    $("#startBtn").onclick = startMission;
    $("#storyAgain").onclick = () => { beep("tap"); S.taleIdx = 0; go("story"); };
    wireMic(cmds => {
      const s = cmds.find(c => c.cmd === "moon" || c.cmd === "mars"); if (s) pickSite(s.cmd);
      if (cmds.some(c => ["go", "play", "yes"].includes(c.cmd)) && S.site) startMission();
    });
    setTimeout(() => S.screen === "site" && say(T("chooseBase")), 250);
  }
  function pickSite(site) {
    S.site = site; beep("add");
    const line = $(".kiko-line");
    $$(".site-card").forEach(c => { c.classList.toggle("sel", c.dataset.site === site); c.setAttribute("aria-pressed", c.dataset.site === site); });
    $("#startBtn").disabled = false;
    const t = site === "moon"
      ? (fr() ? "La Lune ! Les messages arrivent en une seconde. Mais les rayons sont forts." : "The Moon! Messages arrive in one second. But space rays are strong here.")
      : (fr() ? "Mars ! Moins de soleil, et les messages mettent des minutes. Plus difficile !" : "Mars! Less sunlight, and messages take minutes. Harder!");
    if (line) line.textContent = t; const nv = $(".guide-astro .nova2"); if (nv) nv.classList.add("talk"); say(t, "kiko", () => { const m = $(".guide-astro .nova2"); if (m) m.classList.remove("talk"); });
  }
  function startMission() {
    const weeks = [...(S.live.week ? [S.live.week] : []), ...D.weeks];
    let week = weeks.find(w => w.id === S.weekChoice);
    if (!week) week = weeks[Math.floor(Math.random() * weeks.length)];
    S.g = E.newGame(S.site, week, C.events);
    S.quizIdx = Math.floor(Math.random() * C.quiz.length);
    beep("win"); S.screen = "game"; newSol();
  }

  /* ---------- game helpers ---------- */
  const period = () => S.g.site === "mars" ? T("sol") : T("day");
  function forecastText(t) {
    const f = t.forecast;
    if (!f.known) return T("fc_unknown");
    if (f.level > 0) return T("fc_storm", f.level);
    if (t.kind === "flash") return T("fc_flash", t.day.flare);
    return T("fc_calm");
  }
  const delayText = () => S.g.site === "moon" ? (fr() ? "1,3 seconde" : "1.3 seconds") : `${S.g.delayMin} minutes`;
  function fmtDate(d) {
    if (!d) return "";
    return new Date(d + "T12:00:00Z").toLocaleDateString(fr() ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function preview() {
    const g = S.g, t = g.today;
    const clone = JSON.parse(JSON.stringify({ ...g, rnd: null, events: null }));
    clone.today.level = t.forecast.known ? t.forecast.level : 0;
    clone.today.event = t.event; clone.rnd = () => 0; clone.events = [];
    E.endSol(clone); return clone;
  }

  /* ---------- a new day: morning card ---------- */
  function newSol() {
    E.startSol(S.g);
    render(); window.scrollTo(0, 0);
    showMorning();
  }
  function showMorning() {
    const g = S.g, t = g.today, fc = t.forecast;
    const first = g.sol === 1;
    const how = first ? `
      <div class="how">
        <h3>${T("howTitle")}</h3>
        <ol>
          <li>${P("sun")}<span>${T("how1")}</span></li>
          <li>${P("power")}<span>${T("how2")}</span></li>
          <li>${I("night")}<span>${T("how3")}</span></li>
        </ol>
        <p class="goal">${P("star")}<span>${T("goal")}</span></p>
      </div>` : "";
    openModal(`
      <div class="morning">
        <div class="mo-head">
          ${sunPic(fc.known ? fc.level : 0, !fc.known, "mo-sun")}
          <div>
            <p class="eyebrow">${S.g.site === "mars" ? T("solOf", g.sol, E.RULES.days) : T("dayOf", g.sol, E.RULES.days)}</p>
            <h2>${T("morning")}</h2>
            <p class="big-line">${P("power")}<span>${T("sunGave", t.solar)}${t.battStart ? " " + T("battGave", t.battStart) : ""}</span></p>
          </div>
        </div>
        <div class="earth-msg ${fc.known && fc.level > 0 ? "warn" : ""} ${!fc.known ? "fuzzy" : ""}">
          <div class="em-ic">${P("satellite")}</div>
          <div><p class="em-lab">${T("fromEarth")} <small>${T("arrivesIn", delayText())}</small></p><p class="em-text">${forecastText(t)}</p>
          ${!fc.known ? `<button class="text-btn" id="whyFuzzy">${T("why")}</button>` : ""}</div>
        </div>
        <p class="real-date">${I("calendar")}<span>${T("realSun")}: <b>${fmtDate(t.day.date)}</b></span> <i class="${g.week.live ? "tag-live" : "tag-arch"}">${g.week.live ? T("live") : T("archived")}</i></p>
        ${how}
        <div class="action-row"><button class="btn btn-go" id="planBtn"><span>${T("plan")}</span>${I("next")}</button></div>
      </div>`);
    const lines = `${T("morning")} ${T("sunGave", t.solar)} ${forecastText(t)}`;
    V.speak(first ? `${lines} ${T("goal")}` : lines, S.lang, "kiko");
    const wf = $("#whyFuzzy"); if (wf) wf.onclick = () => V.speak(T("fc_unknownWhy"), S.lang, "kiko");
    $("#planBtn").onclick = () => { beep("tap"); closeModal(); if (t.event) showEvent(); else afterMorning(); };
    wireMic(cmds => { if (cmds.some(c => ["go", "yes", "play"].includes(c.cmd))) $("#planBtn").click(); }, "#modal");
  }

  async function afterMorning() {
    const t = S.g.today, fc = t.forecast;
    if (S.g.sol === 1 && once("tutorial")) { await runTutorial(); return; }
    if (fc.known && fc.level > 0 && once("storm")) { await teach(T("ex_storm"), ".stage-sun", { next: T("gotIt") }); return; }
    if (!fc.known && once("fuzzy")) { await teach(T("ex_fuzzy"), ".msg-bar", { next: T("gotIt") }); return; }
    teach(`${forecastText(t)} ${T("tapToAdd")}`, null, { hideAfter: true });
  }
  async function runTutorial() {
    const steps = [["t1", ".stage-sun"], ["t2", ".tray"], ["t3", ".machines"], ["t4", ".meters"], ["t5", "#endBtn"]];
    for (let i = 0; i < steps.length; i++) {
      if (S.screen !== "game") return;
      await teach(T(steps[i][0]), steps[i][1], { next: i < steps.length - 1 ? T("next") : T("gotIt"), stay: i < steps.length - 1 });
    }
    const t = S.g.today;
    if (t.forecast.known && t.forecast.level > 0 && once("storm")) await teach(T("ex_storm"), ".stage-sun", { next: T("gotIt") });
  }

  /* ---------- plan screen ---------- */
  function meter(key, icon, val, max, next, danger) {
    const pct = Math.max(0, Math.min(100, (val / max) * 100));
    const diff = next - val;
    const tonight = diff > 0 ? `<span class="tn up">+${diff}</span>` : diff < 0 ? `<span class="tn down">${diff}</span>` : `<span class="tn same">=</span>`;
    return `<button class="meter m-${key} ${danger ? "danger" : ""}" data-info="${key}Info" aria-label="${T(key)}: ${val}">
      <span class="m-ic">${P(icon)}</span>
      <span class="m-main"><span class="m-top"><span class="m-lab">${T(key)}</span><span class="m-val">${val}</span>${tonight}</span>
      <span class="m-bar"><span class="m-fill" style="width:${pct}%"></span><span class="m-ghost" style="left:${Math.max(0, Math.min(100, next / max * 100))}%"></span></span></span>
    </button>`;
  }
  function rGame(el) {
    const g = S.g, t = g.today, p = preview(), left = E.left(g), R = E.RULES, fc = t.forecast;
    const radPrev = fc.known ? p.rad : g.rad;
    const cost = { air: 1, plants: 1, shield: 2, science: 2, alarm: 3 };
    const effect = {
      air: `${P("air")}<b>+1</b>`, plants: `${P("air")}<b>+2</b><small>${fr() ? "demain" : "tomorrow"}</small>`,
      shield: `${P("shield")}<b>+1</b>`, science: `${P("star")}<b>+1</b><small>−1 ${T("air").toLowerCase()}</small>`, alarm: `${I("check")}<small>${fr() ? "alertes claires" : "clear warnings"}</small>`
    };
    const icon = { air: "air", plants: "plant", shield: "shield", science: "explore", alarm: "alarm" };
    const m = (k) => {
      const n = t.alloc[k];
      return `<div class="machine mc-${k} ${n ? "on" : ""}">
        <button class="mc-main" data-m="${k}" aria-label="${T("m_" + k)}">
          <span class="mc-ic">${P(icon[k])}</span><span class="mc-name">${T("m_" + k)}</span>
          <span class="mc-rule"><span class="mc-cost">${Array.from({ length: cost[k] }, () => P("power", "tiny")).join("")}</span>${I("next", "arrow")}<span class="mc-eff">${effect[k]}</span></span>
        </button>
        ${n ? `<span class="mc-count">${n}</span><button class="mc-minus" data-minus="${k}" aria-label="−">−</button>` : ""}
        <button class="mc-help" data-help="${k}" aria-label="${T("why")}">?</button>
      </div>`;
    };
    const showAlarm = g.site === "mars" && !g.alarm;
    el.innerHTML = `
      <section class="game ${g.site}">
        <div class="hud">
          <button class="day-pill" id="dayPill"><span>${g.site === "mars" ? T("solOf", g.sol, R.days) : T("dayOf", g.sol, R.days)}</span>
            <span class="dots">${Array.from({ length: R.days }, (_, i) => `<i class="${i < g.sol - 1 ? "done" : i === g.sol - 1 ? "now" : ""}"></i>`).join("")}</span></button>
          <div class="hud-right"><button class="stat teach" id="teachBtn" aria-label="${T("teach")}"><span class="teach-ic">${A.nova("idle")}</span><span>${T("teach")}</span></button>
            <button class="stat sci" data-info="starsInfo" aria-label="${T("stars")}">${P("star")}<b>${g.stars}</b><small>/${R.starsGoal}</small></button>
            <button class="stat rad" data-info="radInfo" aria-label="${T("rad")}">${P("rad")}<span class="rdots">${Array.from({ length: R.radMax }, (_, i) => `<i class="${i < g.rad ? "on" : ""} ${i >= g.rad && i < radPrev ? "warn" : ""}"></i>`).join("")}</span></button>
          </div>
        </div>
        <div class="meters">
          ${meter("air", "air", g.air, R.airMax, p.air, p.air <= 2)}
          ${meter("power", "battery", t.battStart, R.battMax, p.batt, false)}
          ${meter("shield", "shield", g.shield, R.shieldMax, p.shield, false)}
        </div>
        <div class="cols">
          <div class="col-l">
            <div class="stage ${g.site}">
              ${buildStage(g, t)}
              ${sunPic(fc.known ? fc.level : 0, !fc.known, "stage-sun")}
              <button class="date-chip" id="realBtn">${I("calendar")}<span>${fmtDate(t.day.date)}</span></button>
            </div>
            <button class="msg-bar" id="msgBar"><span class="mb-ic">${P("satellite")}</span><span><small>${T("fromEarth")}</small><span class="kiko-line">${forecastText(t)}</span></span></button>
          </div>
          <div class="col-r">
            <div class="tray"><div class="tray-l"><span class="tray-lab">${T("cellsLeft")}</span>
              <div class="cells">${Array.from({ length: t.pool }, (_, i) => `<span class="cell ${i < left ? "on" : ""}">${P("power")}</span>`).join("")}</div></div>
              <button class="tonight ${Math.min(left, R.battMax) ? "" : "empty"}" id="tonightBtn" aria-label="${T("tonight")}: ${Math.min(left, R.battMax)}">
                <span class="tn-lab">${T("tonight")}</span><span class="tn-box">${P(Math.min(left, R.battMax) ? "battery" : "cold")}<b>${Math.min(left, R.battMax)}</b></span></button></div>
            <div class="machines ${showAlarm ? "five" : ""}">${m("air")}${m("plants")}${m("shield")}${m("science")}${showAlarm ? m("alarm") : ""}</div>
            <div class="action-row bottom">${micBtn("round")}<button class="btn btn-night ${left === 0 ? "pulse" : ""}" id="endBtn">${I("night")}<span>${T("endSol")}</span></button></div>
          </div>
        </div>
      </section>`;
    $$(".mc-main").forEach(b => b.onclick = () => tapMachine(b.dataset.m));
    $$(".mc-minus").forEach(b => b.onclick = () => { if (E.remove(S.g, b.dataset.minus)) { beep("tap"); refreshGame(); } });
    $$(".mc-help").forEach(b => b.onclick = () => teach(T("h_" + b.dataset.help), b.closest(".machine")));
    $$("[data-info]").forEach(b => b.onclick = () => { beep("tap"); teach(T(b.dataset.info), b); });
    $("#dayPill").onclick = () => teach(S.g.site === "mars" ? T("solInfo") : T("dayInfo"), $("#dayPill"));
    $("#msgBar").onclick = () => teach(t.forecast.known ? forecastText(t) : T("fc_unknownWhy"), $("#msgBar"));
    $("#teachBtn").onclick = () => runTutorial();
    G.setOnTap(() => teach(`${forecastText(t)} ${T("tapToAdd")}`, null, { hideAfter: true }));
    $("#realBtn").onclick = () => showRealDay(t.day);
    $("#endBtn").onclick = endSol;
    $("#tonightBtn").onclick = () => { beep("tap"); teach(T("tonightInfo"), $("#tonightBtn")); };
    wireMic(handleGameVoice);
  }
  function refreshGame() { rGame($("#screen")); }
  function buildStage(g, t) {
    return A.landscape(g.site, { shield: g.shield + t.alloc.shield, plants: t.alloc.plants, alarm: g.alarm || t.alloc.alarm, rover: t.alloc.science > 0, dim: t.solar < E.SITES[g.site].solar, earthLabel: fr() ? "Terre" : "Earth" });
  }
  function tapMachine(k) {
    const r = E.add(S.g, k);
    if (r.ok) {
      beep("add"); refreshGame(); const b = $(`.mc-${k}`); b && b.classList.add("pop");
      const t = S.g.today, lf = E.left(S.g);
      if (lf === 0 && !t.toldAll) { t.toldAll = true; teach(T("allUsed"), $("#endBtn"), { hideAfter: true }); }
      else if (lf === 1 && !t.toldKeep && !t.toldAll) { t.toldKeep = true; teach(T("keepOne"), $("#tonightBtn"), { hideAfter: true }); }
      else if (k === "plants" && once("plants")) teach(T("ex_plants"), $(".st-green") || b, { hideAfter: true });
    }
    else { beep("no"); toast(T(r.reason)); say(T(r.reason)); }
  }
  function handleGameVoice(cmds) {
    if (!$("#modal").hidden) return;
    for (const c of cmds) {
      if (["air", "plants", "shield", "science", "alarm"].includes(c.cmd)) for (let i = 0; i < c.n; i++) tapMachine(c.cmd);
      else if (c.cmd === "undo") { const a = S.g.today.alloc; const k = Object.keys(a).reverse().find(x => a[x] > 0); if (k) { E.remove(S.g, k); refreshGame(); } }
      else if (c.cmd === "go") { endSol(); return; }
      else if (c.cmd === "help") say(`${forecastText(S.g.today)} ${T("say")}`);
    }
  }

  /* ---------- events ---------- */
  function showEvent() {
    const t = S.g.today, ev = t.event; if (!ev || t.eventShown) return; t.eventShown = true;
    const tx = L(ev), choice = ev.kind === "choice";
    openModal(`
      <div class="event">
        <p class="eyebrow">${T("ev_title")}</p>
        <div class="ev-ic">${P(ev.icon)}</div>
        <h2>${tx.t}</h2><p class="ev-d">${tx.d}</p>
        <div class="fact">${I("bulb")}<p>${L(ev.fact)}${ev.src ? ` <a href="${C.sources[ev.src].url}" target="_blank" rel="noopener" class="src">${C.sources[ev.src].name}</a>` : ""}</p></div>
        ${choice ? `<div class="action-row"><button class="btn btn-alt" id="evNo">${T("notNow")}</button><button class="btn btn-go" id="evYes">${T("doIt")} <small>(${T("costs", ev.cost)})</small></button></div>${micBtn("small")}`
        : `<div class="action-row"><button class="btn btn-go" id="evOk"><span>${T("ok")}</span>${I("next")}</button></div>`}
      </div>`);
    say(`${tx.t} ${tx.d}`, "silent");
    const done = (yes) => {
      if (choice) { const r = E.answerEvent(S.g, yes); if (!r.ok) { toast(T(r.reason)); say(T(r.reason), "silent"); return; } }
      closeModal(); beep(yes ? "add" : "tap"); refreshGame(); afterMorning();
    };
    if (choice) { $("#evYes").onclick = () => done(true); $("#evNo").onclick = () => done(false); wireMic(cmds => { if (cmds.some(c => c.cmd === "yes")) done(true); else if (cmds.some(c => c.cmd === "no")) done(false); }, "#modal"); }
    else $("#evOk").onclick = () => done(false);
  }

  /* ---------- night ---------- */
  function endSol() {
    const g = S.g, t = g.today;
    if (t.event && !t.eventShown) { showEvent(); return; }
    beep("night");
    const stage = $(".stage"); stage && stage.classList.add("night");
    const entry = E.endSol(g);
    if (entry.level > 0) setTimeout(() => { beep("storm"); const fx = $(".storm-fx"); if (fx) fx.innerHTML = A.stormParticles(); stage && stage.classList.add(entry.dmg > 0 ? "hit" : "blocked"); }, 500);
    setTimeout(() => showReport(entry), entry.level > 0 ? 2300 : 900);
  }
  const RP_ICON = { plants: "plant", planted: "plant", airmade: "air", used: "crew", sciAir: "crew", star: "star", shield: "shield", alarm: "alarm", fixPenalty: "wrench", saved: "battery", lost: "lost", heater: "heater", cold: "cold", stormOk: "shield", stormHit: "rad", stormEva: "rad", flash: "sun", calm: "night" };
  function reportText(r) {
    const [k, a, b] = r, sh = S.g.shield;
    return ({ plants: T("rp_plants", a), planted: T("rp_planted", a), airmade: T("rp_airmade", a), used: T("rp_used"), sciAir: T("rp_sciAir", a), star: T("rp_star", a), shield: T("rp_shield", a), alarm: T("rp_alarm"), fixPenalty: T("rp_fix"), saved: T("rp_saved", a), lost: T("rp_lost", a), heater: T("rp_heater"), cold: T("rp_cold"), stormOk: T("rp_storm_ok", a, sh), stormHit: T("rp_storm_hit", a, sh, b), stormEva: T("rp_storm_eva"), flash: T("rp_flash"), calm: T("rp_calm") })[k] || k;
  }
  // The science stars found on a night = the next real NASA discoveries for this base (they repeat after the last one).
  function findsOf(site, from, n) { const list = C.finds[site]; return Array.from({ length: n }, (_, i) => list[(from + i) % list.length]); }
  const findCard = (f) => `<div class="find-card"><span class="find-ic">${I(f.icon)}</span><div><p class="find-eyebrow">${P("star")}<span>${T("found")}</span></p><h3>${L(f.title)}</h3><p>${fr() ? f.fr : f.en}</p>${f.src && C.sources[f.src] ? `<a class="src" href="${C.sources[f.src].url}" target="_blank" rel="noopener">${C.sources[f.src].name}</a>` : ""}</div></div>`;
  function showReport(entry) {
    const g = S.g; G.hush();
    const mainKeys = ["stormOk", "stormHit", "flash", "calm"];
    const main = entry.report.find(r => mainKeys.includes(r[0]));
    const rest = entry.report.filter(r => !mainKeys.includes(r[0]));
    const bad = ["stormHit", "cold", "lost", "stormEva", "fixPenalty"], good = ["stormOk", "star", "plants"];
    const quizNow = !g.over && (g.sol === 2 || g.sol === 4 || g.sol === 6);
    const nFound = entry.alloc.science || 0, finds = findsOf(g.site, entry.stars - nFound, nFound);
    const rank = r => bad.includes(r[0]) ? 0 : good.includes(r[0]) ? 1 : ["airmade", "shield", "alarm", "saved", "heater"].includes(r[0]) ? 2 : 3;
    const sorted = [...rest].sort((x, y) => rank(x) - rank(y)), top = sorted.slice(0, 3), more = sorted.slice(3);
    const li = r => `<li class="${bad.includes(r[0]) ? "bad" : good.includes(r[0]) ? "good" : ""}">${I(RP_ICON[r[0]] || "info")}<span>${reportText(r)}</span></li>`;
    const vs = entry.level > 0 ? `<div class="versus"><div class="vs-box storm"><span>${T("stormIn")}</span><b>${entry.level}</b></div><div class="vs-mid">VS</div><div class="vs-box shield"><span>${T("shieldNow")}</span><b>${entry.shield}</b></div></div>` : "";
    openModal(`
      <div class="report">
        <p class="eyebrow">${T("nightTitle")} · ${period()} ${entry.sol}</p>
        <div class="rep-head ${entry.dmg ? "bad" : "good"}">${sunPic(entry.level, false, "rep-sun")}<h2>${reportText(main)}</h2></div>
        ${vs}
        ${finds.map(findCard).join("")}
        <ul class="rep-list">${top.map(li).join("")}</ul>
        ${more.length ? `<details class="rep-more"><summary>+ ${more.length} ${fr() ? "autres détails" : "more details"}</summary><ul class="rep-list">${more.map(li).join("")}</ul></details>` : ""}
        <details class="real-more"><summary>${I("satellite")}<span>${T("seeData")}</span></summary>${realDayCard(entry.day, entry.level)}</details>
        <div class="action-row"><button class="btn btn-go" id="repNext"><span>${T("next")}</span>${I("next")}</button></div>
      </div>`);
    let lesson = null;
    if (entry.report.some(r => r[0] === "stormHit") && once("hit")) lesson = T("ex_hit");
    else if (entry.report.some(r => r[0] === "stormOk") && once("block")) lesson = T("ex_block");
    else if (entry.report.some(r => r[0] === "cold") && once("cold")) lesson = T("ex_cold");
    if (lesson) $(".rep-head").insertAdjacentHTML("afterend", `<div class="nova-tip"><span class="tip-nova">${A.nova(entry.dmg ? "talk" : "cheer")}</span><p>${lesson}</p></div>`);
    say(`${reportText(main)} ${lesson || ""} ${finds.length ? `${T("found")} ${L(finds[0].title)} ${fr() ? finds[0].fr : finds[0].en}` : ""}`);
    $("#repNext").onclick = () => { closeModal(); if (g.over) { finish(); return; } if (quizNow) showQuiz(newSol); else newSol(); };
    wireMic(cmds => { if (cmds.some(c => c.cmd === "go" || c.cmd === "yes")) $("#repNext").click(); }, "#modal");
  }
  const gapTxt = m => m >= 90 ? `~${Math.round(m / 60)} h` : `${m} min`;
  function realDayCard(day, level) {
    const g = S.g; if (!day) return "";
    const h = E.cmeHours(day.cme, g.site), gap = E.minutesBetween(day.peak, day.sepTime);
    const lines = [];
    lines.push(day.flare ? (fr() ? `Éruption <b>${day.flare}</b> à ${day.peak} UTC.` : `<b>${day.flare}</b> flare at ${day.peak} UTC.`) : (fr() ? "Aucune grosse éruption ce jour-là." : "No big flare that day."));
    if (day.sep) lines.push(fr() ? `Tempête de particules détectée${day.sepTime ? ` à ${day.sepTime} UTC` : ""}${gap != null && day.flare ? ` (${gapTxt(gap)} après le pic)` : ""}.` : `Particle storm detected${day.sepTime ? ` at ${day.sepTime} UTC` : ""}${gap != null && day.flare ? ` (${gapTxt(gap)} after the flare peak)` : ""}.`);
    else lines.push(fr() ? "Pas de tempête de particules détectée." : "No particle storm detected.");
    if (day.cme) lines.push(fr() ? `Nuage solaire (CME) à <b>${day.cme.toLocaleString("fr-FR")} km/s</b> : il pourrait atteindre ${g.site === "mars" ? "Mars" : "la Lune"} en ~${h} h (estimation en ligne droite).` : `Solar cloud (CME) at <b>${day.cme.toLocaleString("en-US")} km/s</b>: it could reach ${g.site === "mars" ? "Mars" : "the Moon"} in about ${h} hours (straight-line estimate).`);
    return `<div class="real-card">
      <p class="rc-head">${T("realData")} · ${fmtDate(day.date)} <i class="${g.week.live ? "tag-live" : "tag-arch"}">${g.week.live ? T("live") : T("archived")}</i></p>
      <p>${lines.join(" ")}</p>
      ${S.classroom ? `<p class="gr">${fr() ? "Force de la tempête dans le jeu" : "In-game storm strength"} = ${level} (${fr() ? "règle : SEP détecté + classe d’éruption" : "rule: SEP detected + flare class"}).</p>` : ""}
      <a class="src" href="${C.sources.donki.url}" target="_blank" rel="noopener">NASA DONKI · ${g.week.range}</a></div>`;
  }
  function showRealDay(day) {
    openModal(`<div class="report"><p class="eyebrow">${T("realSun")}</p>${realDayCard(day, S.g.today.forecast.known ? S.g.today.forecast.level : "?")}
      <p class="note">${fr() ? "Ce jour du jeu utilise le vrai Soleil de cette date." : "This game day uses the real Sun from this date."}</p>
      <div class="action-row"><button class="btn btn-go" id="closeM">${T("close")}</button></div></div>`);
    $("#closeM").onclick = () => closeModal();
  }

  /* ---------- quiz ---------- */
  function showQuiz(after) {
    const q = C.quiz[S.quizIdx % C.quiz.length]; S.quizIdx++;
    const tx = L(q), order = Math.random() < .5 ? [0, 1] : [1, 0];
    openModal(`<div class="quiz"><p class="eyebrow">${T("quizTitle")}</p><h2>${tx.q}</h2>
      <div class="q-opts">${order.map(i => `<button class="q-opt" data-i="${i}"><span class="q-ic">${P(q.icons[i])}</span><span>${tx.a[i]}</span></button>`).join("")}</div>
      <div class="q-res" hidden></div>${micBtn("small")}</div>`);
    say(`${tx.q} ${tx.a[order[0]]}, ${fr() ? "ou" : "or"} ${tx.a[order[1]]}?`, "silent");
    let answered = false;
    const answer = (i) => {
      if (answered) return; answered = true;
      const ok = i === q.correct; beep(ok ? "win" : "no");
      $$(".q-opt").forEach(b => b.classList.add(+b.dataset.i === q.correct ? "right" : "wrong"));
      const res = $(".q-res"); res.hidden = false;
      res.innerHTML = `<div class="fact ${ok ? "ok" : ""}">${I(ok ? "check" : "bulb")}<p><b>${ok ? T("right") : T("wrong")}</b> ${tx.why}</p></div><div class="action-row"><button class="btn btn-go" id="qNext"><span>${T("next")}</span>${I("next")}</button></div>`;
      say(`${ok ? T("right") : T("wrong")} ${tx.why}`, "silent");
      $("#qNext").onclick = () => { closeModal(); after(); };
    };
    $$(".q-opt").forEach(b => b.onclick = () => answer(+b.dataset.i));
    wireMic((cmds, text) => { const idx = q.voice.findIndex(ws => ws.some(w => new RegExp("\\b" + w + "\\b").test(text || ""))); if (idx >= 0) answer(idx); }, "#modal");
  }

  /* ---------- end ---------- */
  function finish() {
    const g = S.g, sc = E.score(g); S.lastScore = sc;
    sc.badges.forEach(b => { if (!S.badges.includes(b)) S.badges.push(b); }); store.set("badges", S.badges);
    beep(g.over === "done" ? "win" : "lose"); S.taleIdx = 0; go("impact");
  }
  function rEnd(el) {
    const g = S.g, sc = S.lastScore || E.score(g);
    const title = g.over === "done" ? T("missionDone") : g.over === "air" ? T("missionAir") : T("missionRad");
    const other = g.site === "moon" ? "mars" : "moon";
    el.innerHTML = `
      <section class="end">
        <div class="end-head ${g.over}">
          <div class="end-nova stk">${A.nova(g.over === "done" ? "cheer" : "wave")}</div>
          <div class="end-txt"><h1>${title}</h1>${g.over !== "done" ? `<p>${T("crewSafe")}</p>` : ""}
            <div class="trophies">${[0, 1, 2].map(i => `<span class="${i < sc.trophies ? "on" : ""}">${P("trophy")}</span>`).join("")}</div>
            <div class="end-stats"><span>${P("star")}<b>${g.stars}</b></span><span>${P("rad")}<b>${g.rad}</b></span><span>${P("air")}<b>${g.air}</b></span><span>${P("shield")}<b>${g.shield}</b></span></div></div>
        </div>
        ${g.stars ? `<h2 class="sec">${P("star")}<span>${T("yourFinds")}</span></h2><div class="finds">${findsOf(g.site, 0, Math.min(g.stars, C.finds[g.site].length)).map(f => `<div class="find-chip">${I(f.icon)}<span>${L(f.title)}</span></div>`).join("")}</div>` : ""}
        <h2 class="sec">${I("calendar")}<span>${T("timeline")}</span></h2>
        <div class="timeline">${g.log.map(e => `
          <div class="tl ${e.dmg ? "hit" : e.level ? "ok" : ""}">${sunPic(e.level, false, "tl-sun")}<b>${period()} ${e.sol}</b><small>${fmtDate(e.day.date)}</small>
            <span class="tl-res">${e.dmg ? `${P("rad")}+${e.dmg}` : e.level ? I("check") : ""}</span></div>`).join("")}</div>
        <h2 class="sec">${I("bulb")}<span>${T("lessons")}</span></h2>
        <div class="lessons">${sc.lessons.map(l => `<div class="lesson">${I("check")}<p>${T(l)}</p></div>`).join("")}</div>
        <div class="reveal">${sunPic(Math.max(...g.week.days.map(E.stormLevel)), false, "rv-sun")}
          <div><p>${T("youPlayed")} <b>${g.week.range}</b> <i class="${g.week.live ? "tag-live" : "tag-arch"}">${g.week.live ? T("live") : T("archived")}</i></p>
          <h3>${L(g.week.title)}</h3><p>${L(g.week.story)}</p><a class="src" href="${C.sources.donki.url}" target="_blank" rel="noopener">NASA DONKI</a></div></div>
        ${sc.badges.length ? `<h2 class="sec">${P("trophy")}<span>${T("badges")}</span></h2><div class="badges">${sc.badges.map(b => `<span class="badge">${P("star")}${T(b)}</span>`).join("")}</div>` : ""}
        <div class="action-row wrap">
          <button class="btn btn-alt" id="impactBtn">${I("globe")}<span>${T("seeImpact")}</span></button>
          <button class="btn btn-go" id="againBtn">${I("replay")}<span>${T("playAgain")}</span></button>
          <button class="btn btn-alt" id="otherBtn">${P(other)}<span>${T("otherBase", T(other))}</span></button>
          <button class="btn btn-alt" id="sciBtn2">${I("telescope")}<span>${T("science")}</span></button>
        </div>
      </section>`;
    $("#againBtn").onclick = () => { S.weekChoice = "surprise"; startMission(); };
    $("#otherBtn").onclick = () => { S.site = other; S.weekChoice = "surprise"; startMission(); };
    $("#sciBtn2").onclick = openScience;
    $("#impactBtn").onclick = () => { S.taleIdx = 0; go("impact"); };
    say(`${title} ${sc.lessons.map(l => T(l)).join(" ")}`, "silent");
  }


  /* ---------- story (before) and impact (after): Nova tells the story with animated scenes ---------- */
  function storyScenes() {
    const lb = { sun: T("lb_sun"), earth: T("lb_earth"), moon: T("lb_moon"), mars: T("lb_mars"), air: T("lb_air"), shield: T("lb_shield"), science: T("lb_science") };
    const may = D.weeks.find(w => w.id === "may2024");
    const days = may.days.map(d => ({ level: E.stormLevel(d), top: d.flare || "-", sub: new Date(d.date + "T12:00:00Z").toLocaleDateString(fr() ? "fr-FR" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) }));
    return [
      { art: () => A.story("earth", { labels: lb }), text: T("st1"), pose: "wave" },
      { art: () => A.story("trip", { labels: lb }), text: T("st2"), pose: "point", right: true },
      { art: () => A.story("danger", { labels: lb, site: "moon" }), text: T("st3"), pose: "talk", danger: true },
      { art: () => A.story("choices", { labels: lb, question: T("q4") }), text: T("st4"), pose: "point" },
      { art: () => A.story("week", { days, title: T("wk_title"), caption: T("wk_caption") }), text: T("st5"), pose: "cheer" }
    ];
  }
  function impactScenes() {
    const g = S.g, faced = g.log.filter(e => e.level > 0).length, blocked = g.log.filter(e => e.level > 0 && !e.dmg).length;
    const days = g.log.map(e => ({ level: e.level, top: `${period()} ${e.sol}`, sub: new Date(e.day.date + "T12:00:00Z").toLocaleDateString(fr() ? "fr-FR" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }), mark: e.level ? (e.dmg ? "hit" : "ok") : null }));
    const lb = { hera: T("lb_hera"), veggie: T("lb_veggie"), solar: T("lb_solar"), reactor: T("lb_reactor") };
    return [
      { art: () => A.story("week", { days, title: T("im1_title"), caption: T("im1_cap") }), text: T("im1", faced, blocked), pose: "cheer" },
      { art: () => A.story("hera", { labels: lb }), text: T("im2"), pose: "point", src: "hera" },
      { art: () => A.story("plants", { labels: lb }), text: T("im3"), pose: "talk", src: "osdr", right: true },
      { art: () => A.story("power", { labels: lb }), text: T("im4"), pose: "point", src: "fission" },
      { art: () => A.story("future", {}), text: T("im5"), pose: "cheer" }
    ];
  }
  function rStory(el) { renderTale(el, storyScenes(), "story"); }
  function rImpact(el) { renderTale(el, impactScenes(), "impact"); }
  function renderTale(el, scenes, kind) {
    const i = Math.max(0, Math.min(scenes.length - 1, S.taleIdx || 0)), sc = scenes[i], last = i === scenes.length - 1;
    const doneLabel = kind === "story" ? T("startStory") : T("seeReport");
    el.innerHTML = `
      <section class="tale ${kind}">
        <div class="tale-top"><p class="eyebrow">${kind === "story" ? T("storyTitle") : T("impactTitle")}</p>
          <div class="tale-dots">${scenes.map((_, k) => `<i class="${k < i ? "done" : k === i ? "now" : ""}"></i>`).join("")}</div>
          <button class="text-btn skip" id="taleSkip">${T("skip")}</button></div>
        <div class="tale-stage ${sc.danger ? "danger" : ""}" id="taleStage">${sc.art()}
          <div class="tale-nova stk ${sc.right ? "right" : ""}">${A.nova(sc.pose)}</div></div>
        <div class="tale-bubble"><p id="taleText">${sc.text}</p>
          ${sc.src ? `<a class="src" href="${C.sources[sc.src].url}" target="_blank" rel="noopener">${C.sources[sc.src].name}</a>` : ""}</div>
        <div class="action-row">
          ${i > 0 ? `<button class="btn btn-alt" id="taleBack">${T("back")}</button>` : ""}
          <button class="icon-btn tale-replay" id="taleReplay" aria-label="${T("help")}">${I("sound")}</button>
          <button class="btn btn-go" id="taleNext"><span>${last ? doneLabel : T("next")}</span>${I("next")}</button>
        </div>
      </section>`;
    if (sc.danger) { const fx = $(".tale-stage .storm-fx"); if (fx) fx.innerHTML = A.stormParticles(30); }
    const nv = $(".tale-nova .nova2");
    const speak = () => { if (nv) { nv.classList.add("talk"); } V.speak(sc.text, S.lang, "kiko", () => { const n = $(".tale-nova .nova2"); if (n) n.classList.remove("talk"); }); };
    setTimeout(() => { if (S.screen === kind) speak(); }, 250);
    const finishTale = () => {
      S.taleIdx = 0;
      if (kind === "story") { store.set("storySeen", true); go("site"); } else go("end");
    };
    $("#taleNext").onclick = () => { beep("tap"); if (last) finishTale(); else { S.taleIdx = i + 1; render(); } };
    const b = $("#taleBack"); if (b) b.onclick = () => { beep("tap"); S.taleIdx = i - 1; render(); };
    $("#taleReplay").onclick = speak;
    $("#taleSkip").onclick = () => { beep("tap"); finishTale(); };
  }

  /* ---------- Ask Nova: kids ask by voice or by tapping a question (offline answers) ---------- */
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9' -]/g, " ");
  // Offline matching: strong phrases count 3, word starts (5+ letters) count 2, short words 1. Best score >= 2 wins.
  function findAnswer(text) {
    const t = " " + norm(text) + " ";
    let best = null, bestScore = 0;
    const hit = (k) => { const nk = norm(k).trim(); if (!nk) return false; return nk.includes(" ") ? t.includes(" " + nk) || t.includes(nk) : new RegExp("\\b" + nk + (nk.length >= 5 ? "" : "\\b")).test(t); };
    for (const f of C.faq) {
      if (f.need && !f.need.some(hit)) continue;
      let score = 0;
      for (const k of (f.strong || [])) if (hit(k)) score += 3;
      for (const k of f.keys) if (hit(k)) score += norm(k).length >= 5 ? 2 : 1;
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return bestScore >= 2 ? best : null;
  }
  function openAsk(pre) {
    V.stop(); G.hush();
    const layer = $("#askLayer");
    const inGame = S.screen === "game";
    const chips = [...C.faq.filter(f => f.game && inGame), ...C.faq.filter(f => !(f.game && inGame))].filter(f => f.id !== "lose").slice(0, 20);
    layer.innerHTML = `<div class="ask-card" role="dialog" aria-modal="true">
        <div class="panel-head">${I("question")}<h2>${T("askTitle")}</h2><button class="icon-btn" id="askX" aria-label="${T("close")}">${I("close")}</button></div>
        <div class="ask-main"><div class="ask-nova stk">${A.nova("idle")}</div>
          <div class="ask-bubble"><p id="askYou" class="ask-you" hidden></p><p id="askAns">${T("askHint")}</p><a id="askSrc" class="src" target="_blank" rel="noopener" hidden></a></div></div>
        <button class="btn btn-go ask-mic" id="askMic">${I("mic")}<span>${T("askMic")}</span></button>
        <div class="ask-chips">${chips.map(f => `<button class="chip-q" data-q="${f.id}">${L(f.chip)}</button>`).join("")}</div>
      </div>`;
    layer.hidden = false;
    const answer = (f, asked) => {
      const you = $("#askYou"), ans = $("#askAns"), src = $("#askSrc"), nv = $(".ask-nova .nova2");
      you.hidden = !asked; if (asked) you.textContent = `${T("youAsked")} “${asked}”`;
      const text = f ? (fr() ? f.fr : f.en) : T("askUnknown");
      ans.textContent = text;
      if (f && f.src && C.sources[f.src]) { src.hidden = false; src.href = C.sources[f.src].url; src.textContent = C.sources[f.src].name; } else src.hidden = true;
      if (nv) { nv.classList.remove("idle"); nv.classList.add("talk", f ? "wave" : "idle"); }
      V.speak(text, S.lang, "kiko", () => { const n = $(".ask-nova .nova2"); if (n) n.classList.remove("talk", "wave"); });
    };
    $$(".chip-q", layer).forEach(b => b.onclick = () => { beep("tap"); answer(C.faq.find(f => f.id === b.dataset.q), b.textContent); });
    $("#askX").onclick = closeAsk;
    layer.onclick = (e) => { if (e.target === layer) closeAsk(); };
    const mic = $("#askMic");
    if (!V.canListen()) mic.classList.add("nosupport");
    mic.onclick = () => {
      if (!V.canListen()) { toast(T("micNo")); return; }
      beep("tap");
      V.listen(S.lang, (alts) => {
        let f = null, said = alts[0] || "";
        for (const a of alts) { f = findAnswer(a); if (f) { said = a; break; } }
        answer(f, said);
      }, (state) => micState(state, mic, T("askMic"), $("span", mic)));
    };
    if (pre) answer(pre.f, pre.said);
  }
  function closeAsk() { V.stop(); const l = $("#askLayer"); l.hidden = true; l.innerHTML = ""; if (S.screen === "game" && $("#modal").hidden) wireMic(handleGameVoice); }

  /* ---------- modals ---------- */
  function openModal(html, wide = false) { const m = $("#modal"); m.innerHTML = `<div class="modal-card ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; const f = $(".modal-card .btn, .modal-card button", m); f && f.focus({ preventScroll: true }); }
  function closeModal(silent) { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; if (!silent && S.screen === "game") wireMic(handleGameVoice); }

  function issChart() {
    const W = 560, H = 170, pad = 30, max = 18;
    const pts = arr => arr.map((p, i) => `${(pad + i * (W - pad * 2) / (arr.length - 1)).toFixed(1)},${(H - pad - (p[1] / max) * (H - pad * 1.6)).toFixed(1)}`).join(" ");
    const ticks = [0, 5, 10, 15].map(v => { const y = H - pad - (v / max) * (H - pad * 1.6); return `<line x1="${pad}" x2="${W - pad}" y1="${y}" y2="${y}" class="grid"/><text x="6" y="${y + 4}" class="ax">${v}</text>`; }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" class="iss-chart" role="img" aria-label="ISS radiation chart">${ticks}<polyline points="${pts(D.iss.quiet)}" class="ln q"/><polyline points="${pts(D.iss.storm)}" class="ln s"/>
      <text x="${pad}" y="${H - 8}" class="ax">00:00 UTC</text><text x="${W - pad - 62}" y="${H - 8}" class="ax">03:00 UTC</text><text x="${W - 70}" y="16" class="ax">µGy/h</text></svg>
      <div class="legend"><span class="lq"></span>${fr() ? "20 avr. 2024 (calme)" : "20 Apr 2024 (quiet)"} <span class="ls"></span>${fr() ? "11 mai 2024 (tempête)" : "11 May 2024 (storm)"}</div>`;
  }
  function openScience() {
    V.stop();
    const live = S.live.status === "live";
    const liveLine = live
      ? `${fr() ? "Récupéré à" : "Fetched at"} ${S.live.fetchedAt.toLocaleTimeString()} — ${S.live.flares.length} ${fr() ? "éruptions sur 7 jours" : "flares in 7 days"}, ${S.live.seps} SEP.`
      : `${fr() ? "Le serveur DONKI n’a pas répondu depuis cet appareil, donc on utilise une copie enregistrée le 14 nov. 2026" : "DONKI did not answer from this device, so we use a copy saved on 14 Nov 2026"} (${D.snapshot.flares.length} ${fr() ? "éruptions" : "flares"}, ${D.snapshot.window}, 0 SEP).`;
    const facts = C.facts.filter((_, i) => i !== 1);
    openModal(`<div class="panel">
      <div class="panel-head">${I("telescope")}<h2>${T("science")}</h2><button class="icon-btn" id="closeX" aria-label="${T("close")}">${I("close")}</button></div>
      <p class="lead">${fr() ? "Tout dans Orbitopia vient de vraies données. Voici d’où." : "Everything in Orbitopia comes from real data. Here is where it comes from."}</p>
      <div class="block"><h3>${I("sun")}<span>${fr() ? "Le Soleil maintenant" : "The Sun right now"}</span></h3><p><i class="${live ? "tag-live" : "tag-arch"}">${live ? T("live") : T("archived")}</i> ${liveLine}</p></div>
      <div class="block"><h3>${I("satellite")}<span>${fr() ? "Radiation dans la Station spatiale" : "Radiation inside the Space Station"}</span></h3>${issChart()}<p>${L(C.facts[1]).k}</p>${S.classroom ? `<p class="gr">${L(C.facts[1]).g}</p>` : ""}<a class="src" href="${C.sources.radlab.url}" target="_blank" rel="noopener">${C.sources.radlab.name}</a> <i class="tag-arch">${T("archived")}</i></div>
      <div class="block"><h3>${I("calendar")}<span>${fr() ? "Les vraies semaines du Soleil" : "The real Sun weeks in the game"}</span></h3>
        <div class="wk-table">${D.weeks.map(w => `<div class="wk-row"><span><b>${L(w.title)}</b> <small>${w.range}</small></span><span class="wk-lv">${w.days.map(d => `<i class="lv lv${E.stormLevel(d)}" title="${d.date}: ${d.flare || "-"}${d.sep ? " + SEP" : ""}">${E.stormLevel(d)}</i>`).join("")}</span></div>`).join("")}</div>
        <p class="note">${fr() ? "Chiffre = force de la tempête de particules ce jour-là (0 = pas de particules)." : "Number = particle-storm strength that day (0 = no particles)."}</p></div>
      <div class="facts">${facts.map(f => `<div class="fact-card"><span class="fc-ic">${P(f.icon)}</span><div><p>${L(f).k}</p>${S.classroom ? `<p class="gr">${L(f).g}</p>` : ""}<a class="src" href="${C.sources[f.src].url}" target="_blank" rel="noopener">${C.sources[f.src].name}</a></div></div>`).join("")}</div>
      <div class="action-row"><button class="btn btn-go" id="closeM">${T("close")}</button></div></div>`, true);
    $("#closeM").onclick = $("#closeX").onclick = () => closeModal();
  }
  function openAdults() {
    V.stop();
    const rows = fr() ? [
      ["air", "Air", "Support de vie (O₂, eau, nourriture). L’équipage en consomme chaque jour."],
      ["battery", "Batterie", "Le solaire ne produit que le jour ; la nuit, le chauffage tire sur la batterie."],
      ["shield", "Bouclier", "Blindage en régolithe. Coûte de l’énergie (excavation) mais protège des particules solaires (SEP)."],
      ["rad", "Rayons", "Dosimétrie de l’équipage ; plein = retour anticipé (limites de dose)."],
      ["satellite", "Délai", "Lune 1,3 s : alertes fiables. Mars 3 à 22 min + autre point de vue : prévision floue sans capteur local."],
      ["star", "Science", "La raison d’être de la mission ; les sorties coûtent de l’air et exposent aux tempêtes."]
    ] : [
      ["air", "Air", "Life support (O₂, water, food). The crew uses it every day."],
      ["battery", "Battery", "Solar works only in daylight; at night heaters draw on the battery."],
      ["shield", "Shield", "Regolith shielding. Costs power (excavation) but blocks Solar Energetic Particles."],
      ["rad", "Rays", "Crew dosimetry; full = early return (dose limits)."],
      ["satellite", "Delay", "Moon 1.3 s: reliable warnings. Mars 3–22 min + a different view of the Sun: fuzzy forecast without a local sensor."],
      ["star", "Science", "Why missions go; spacewalks cost air and add exposure during storms."]
    ];
    const prompts = fr() ? ["Jouez la même semaine sur la Lune puis sur Mars. Qu’est-ce qui change ? Pourquoi ?", "Pourquoi couvrir une base de terre plutôt que d’un mur fin ?", "Le 10 sept. 2017, les particules sont arrivées 19 min après l’éruption. Un message vers Mars peut mettre 22 min. Que doit faire l’équipage ?", "« Tout pour la sécurité » est-il une bonne stratégie ? Et la science ?"]
      : ["Play the same week on the Moon, then on Mars. What changes? Why?", "Why cover a base with dirt instead of a thin wall?", "On 10 Sep 2017 particles arrived 19 minutes after the flare. A message to Mars can take 22 minutes. What should a Mars crew do?", "Is 'everything for safety' a good strategy? What about science?"];
    openModal(`<div class="panel">
      <div class="panel-head">${I("family")}<h2>${T("grownups")}</h2><button class="icon-btn" id="closeX" aria-label="${T("close")}">${I("close")}</button></div>
      <p class="lead">${fr() ? "Orbitopia transforme de vraies contraintes de mission en choix simples. Aucun choix n’est gratuit." : "Orbitopia turns real mission constraints into simple choices. No choice is free."}</p>
      <div class="map">${rows.map(r => `<div class="map-row">${I(r[0])}<b>${r[1]}</b><p>${r[2]}</p></div>`).join("")}</div>
      <div class="block"><h3>${I("book")}<span>${fr() ? "En classe" : "In the classroom"}</span></h3><ol class="prompts">${prompts.map(x => `<li>${x}</li>`).join("")}</ol></div>
      <div class="block"><h3>${I("sound")}<span>${T("voiceLabel")}</span></h3>
        <div class="voice-row"><select id="voiceSel" aria-label="${T("voiceLabel")}"><option value="">${T("voiceAuto")}</option>${V.listVoices(S.lang).map(n => `<option value="${n.replace(/"/g, "&quot;")}">${n}</option>`).join("")}</select>
        <button class="btn btn-alt small-btn" id="voiceTest">${T("voiceTest")}</button></div>
        <p class="note">${fr() ? "Voix utilisée maintenant" : "Voice in use now"}: <b id="voiceNow">${V.currentVoice(S.lang) || "-"}</b></p></div>
      <label class="toggle"><input type="checkbox" id="clsToggle" ${S.classroom ? "checked" : ""}><span>${fr() ? "Mode classe : montrer les détails scientifiques et les règles" : "Classroom mode: show science details and rules"}</span></label>
      <div class="block"><h3>${I("lock")}<span>${fr() ? "Vie privée" : "Privacy"}</span></h3><p>${fr() ? "Pas de compte, pas de pub, rien n’est envoyé à notre équipe. Les badges restent dans ce navigateur. Le micro est optionnel ; dans Chrome, la reconnaissance vocale est traitée par le service vocal du navigateur." : "No account, no ads, nothing is sent to our team. Badges stay in this browser. The microphone is optional; in Chrome, speech recognition is processed by the browser's speech service."}</p></div>
      <div class="block"><h3>${I("info")}<span>${fr() ? "Outils d’IA" : "AI tools"}</span></h3><p>${fr() ? "Code et textes rédigés avec l’aide de Claude (Anthropic), relus par l’équipe. Toutes les illustrations (Nova, planètes, base, icônes) sont des dessins vectoriels écrits en code avec cette aide IA, d’après le tableau d’inspiration de l’équipe. Aucun générateur d’images, aucune image de banque ni marque NASA ne sont utilisés." : "Code and text drafted with help from Claude (Anthropic) and reviewed by the team. All illustrations (Nova the astronaut, planets, base, icons) are vector drawings written in code with that AI assistance, based on the team's own mood board. No image generator, stock images or NASA branding are used."}</p></div>
      <div class="action-row"><button class="btn btn-go" id="closeM">${T("close")}</button></div></div>`, true);
    $("#clsToggle").onchange = (e) => { S.classroom = e.target.checked; store.set("classroom", S.classroom); };
    const vs = $("#voiceSel"); let saved = {}; try { saved = JSON.parse(localStorage.getItem("orb_voice") || "{}"); } catch (_) { }
    vs.value = saved[S.lang] || "";
    vs.onchange = () => { V.setVoice(S.lang, vs.value); $("#voiceNow").textContent = V.currentVoice(S.lang) || "-"; V.speak(T("voiceTestLine"), S.lang, "kiko"); };
    $("#voiceTest").onclick = () => V.speak(T("voiceTestLine"), S.lang, "kiko");
    $("#closeM").onclick = $("#closeX").onclick = () => closeModal();
  }
  function openMenu() {
    openModal(`<div class="menu-sheet">
      <div class="panel-head"><h2>${T("menu")}</h2><button class="icon-btn" id="closeX" aria-label="${T("close")}">${I("close")}</button></div>
      <button class="menu-item" id="mHome">${I("home")}<span>${T("home")}</span></button>
      <button class="menu-item" id="mSci">${I("telescope")}<span>${T("science")}</span></button>
      <button class="menu-item" id="mAdult">${I("family")}<span>${T("grownups")}</span></button></div>`);
    $("#closeX").onclick = () => closeModal();
    $("#mHome").onclick = () => go("title"); $("#mSci").onclick = openScience; $("#mAdult").onclick = openAdults;
  }

  /* ---------- mic ---------- */
  let micHandler = null;
  function micState(state, btn, idleLabel, labelEl) {
    btn.classList.toggle("listening", state === "listening");
    if (labelEl) labelEl.textContent = state === "listening" ? T("micListening") : idleLabel;
    if (state === "denied" || state === "unsupported") toast(T("micNo"));
    else if (state === "nohear") { toast(T("noHear")); say(T("noHear")); }
    else if (state === "network") toast(T("micNet"));
    else if (state === "nomic") toast(T("micNone"));
  }
  const QWORD = /^(can|could|why|what|whats|what's|how|when|where|who|which|is|are|do|does|did|will|would|should|tell me|explain|pourquoi|comment|quand|ou|qui|quel|quelle|quels|quelles|est-ce|est ce|c'est quoi|c est quoi|qu'est|qu est|combien|dis-moi|dis moi|explique|a quoi|que|qu'|tu es|are you)\b/;
  const ASKWORD = /^(can i|can we|could i|could we|may i|i want|i need|give me|je peux|on peut|je veux|est-ce que je peux|est ce que je peux)\b/;
  // A question goes to Ask Nova; a command (air, shield, night...) goes to the game.
  function routeSpeech(alts, cmdHandler) {
    const p = V.parse(alts);
    // "can I have two shields" is a request, not a question: let the game do it.
    if (p.cmds.length && alts.some(a => ASKWORD.test(norm(a).trim()))) { toast(`${T("heard")} “${p.text}”`); if (cmdHandler) cmdHandler(p.cmds, p.text); return; }
    const q = alts.find(a => QWORD.test(norm(a).trim()) || a.includes("?"));
    if (q) {
      for (const a of alts) { const f = findAnswer(a); if (f) { openAsk({ f, said: a }); return; } }
      openAsk({ f: null, said: q }); return;
    } else if (!p.cmds.length) {
      for (const a of alts) { const f = findAnswer(a); if (f) { openAsk({ f, said: a }); return; } }
    }
    toast(`${T("heard")} “${p.text}”`);
    if (cmdHandler) cmdHandler(p.cmds, p.text);
    if (!p.cmds.length && S.screen === "game") say(T("say"));
  }
  function wireMic(handler, scope) {
    micHandler = handler;
    const btn = scope ? $(`${scope} #micBtn`) : $("#screen #micBtn");
    if (!btn) return;
    if (!V.canListen()) btn.classList.add("nosupport");
    btn.onclick = () => {
      if (!V.canListen()) { toast(T("micNo")); return; }
      beep("tap");
      V.listen(S.lang, (alts) => routeSpeech(alts, micHandler), (state) => micState(state, btn, T("mic"), $(".mic-t", btn)));
    };
  }

  /* ---------- top bar ---------- */
  $("#homeBtn").onclick = () => go("title");
  $("#menuBtn").onclick = openMenu;
  $("#askBtn").onclick = openAsk;
  $("#soundBtn").onclick = () => { S.muted = !S.muted; V.setMuted(S.muted); store.set("muted", S.muted); bindStatic(); if (!S.muted) beep("add"); };
  const setLang = (l) => {
    S.lang = l; store.set("lang", l); V.stop();
    const kind = $("#modal").hidden ? null : $(".morning") ? "morning" : $("#clsToggle") ? "adults" : $(".panel") ? "science" : $(".menu-sheet") ? "menu" : "other";
    render();
    if (kind === "morning") showMorning(); else if (kind === "adults") openAdults(); else if (kind === "science") openScience(); else if (kind === "menu") openMenu();
  };
  $("#langEn").onclick = () => setLang("en"); $("#langFr").onclick = () => setLang("fr");
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" && $("#closeX")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden && $("#closeX")) closeModal(); });

  G.init(); render(); checkLive();
  if ("serviceWorker" in navigator && /^(https:|http:\/\/localhost|http:\/\/127)/.test(location.href)) navigator.serviceWorker.register("sw.js").catch(() => { });
})();
