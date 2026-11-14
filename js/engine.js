/* Orbitopia — game rules (pure logic, no UI). Every action costs something; nothing is free. */
(function (root) {
  const SITES = {
    moon: { solar: 5, air: 6, batt: 2, shield: 1, delay: { en: "1.3 seconds", fr: "1,3 seconde" } },
    mars: { solar: 4, air: 6, batt: 2, shield: 1 }
  };
  const RULES = {
    days: 7, airMax: 10, battMax: 4, shieldMax: 4, radMax: 6, starsGoal: 3,
    breathe: 2, plantsMax: 2, plantYield: 2, shieldCost: 2, scienceCost: 2, alarmCost: 3, eventP: 0.45
  };

  function parseFlare(c) {
    if (!c) return null;
    const m = /^([ABCMX])(\d+(?:\.\d+)?)/.exec(c);
    return m ? { letter: m[1], mag: parseFloat(m[2]) } : null;
  }
  // Storm power 0–4 from REAL DONKI data: only a detected particle storm (SEP) can hurt the crew.
  function stormLevel(day) {
    if (!day || !day.sep) return 0;
    const f = parseFlare(day.flare);
    if (!f) return 1;
    if (f.letter === "X") return f.mag >= 5 ? 4 : f.mag >= 2 ? 3 : 2;
    if (f.letter === "M") return f.mag >= 5 ? 2 : 1;
    return 1;
  }
  function flareKind(day) {
    const f = parseFlare(day && day.flare);
    if (!f) return "calm";
    return (f.letter === "X" || f.letter === "M") ? "flash" : "calm";
  }
  // Straight-line travel time of a CME (hours), Sun→1 AU (Earth/Moon) or Sun→1.52 AU (Mars, average)
  function cmeHours(speed, site) {
    if (!speed) return null;
    const km = site === "mars" ? 1.52 * 149.6e6 : 149.6e6;
    return Math.round(km / speed / 3600);
  }
  function minutesBetween(a, b) {
    if (!a || !b) return null;
    const [h1, m1] = a.split(":").map(Number), [h2, m2] = b.split(":").map(Number);
    let d = (h2 * 60 + m2) - (h1 * 60 + m1); if (d < 0) d += 1440; return d;
  }

  function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function newGame(site, week, events, seed) {
    const rnd = mulberry(seed || (Date.now() & 0xffffffff));
    const S = SITES[site];
    return {
      site, week, rnd, events,
      sol: 0, air: S.air, batt: S.batt, shield: S.shield, rad: 0, stars: 0,
      alarm: false, dust: 0, plantsDue: 0,
      delayMin: site === "mars" ? 4 + Math.floor(rnd() * 19) : 0,
      usedEvents: [], log: [], over: null,
      totals: { plants: 0, cold: 0, stormDmg: 0, stormsFaced: 0, bigStormBlocked: 0, science: 0, airMade: 0 }
    };
  }

  function startSol(g) {
    g.sol += 1;
    const day = g.week.days[g.sol - 1] || { flare: null, sep: false };
    const S = SITES[g.site];
    let solar = S.solar, notes = [];
    if (g.dust > 0) { solar -= 2; g.dust -= 1; notes.push("dust"); }
    // random event (never on day 1, so kids learn the basics first)
    let ev = null;
    if (g.sol > 1 && g.rnd() < RULES.eventP) {
      const pool = g.events.filter(e => (e.site === g.site || e.site === "both") && !g.usedEvents.includes(e.id));
      if (pool.length) { ev = pool[Math.floor(g.rnd() * pool.length)]; g.usedEvents.push(ev.id); }
    }
    let airNow = 0;
    if (ev && ev.kind === "auto") {
      if (ev.effect.solar) solar += ev.effect.solar;
      if (ev.effect.dust) g.dust = ev.effect.dust - 1; // today counts as first dusty sol
      if (ev.effect.air) { airNow = ev.effect.air; g.air = Math.min(RULES.airMax, g.air + airNow); }
    }
    solar = Math.max(1, solar);
    const level = stormLevel(day);
    // What the crew KNOWS (forecast) vs what WILL happen (level)
    let forecast;
    if (g.site === "moon" || g.alarm) forecast = { known: true, level };
    else {
      const r = g.rnd();
      if (level > 0) forecast = r < 0.45 ? { known: true, level } : { known: false };
      else forecast = r < 0.25 ? { known: false } : { known: true, level: 0 };
    }
    g.today = {
      day, level, kind: flareKind(day), forecast, event: ev, eventDone: false, eventYes: null,
      solar, pool: solar + g.batt, battStart: g.batt,
      alloc: { air: 0, plants: 0, shield: 0, science: 0, alarm: 0 }, airNow, notes
    };
    g.batt = 0; // battery power is now in today's pool
    return g.today;
  }

  function used(t) { const a = t.alloc; return a.air + a.plants + a.shield * RULES.shieldCost + a.science * RULES.scienceCost + a.alarm * RULES.alarmCost + (t.eventYes ? t.event.cost : 0); }
  function left(g) { return g.today.pool - used(g.today); }

  // Try to add one unit to a machine. Returns {ok, reason}
  function add(g, m) {
    const t = g.today, a = t.alloc;
    const cost = { air: 1, plants: 1, shield: RULES.shieldCost, science: RULES.scienceCost, alarm: RULES.alarmCost }[m];
    if (m === "alarm" && (g.site !== "mars" || g.alarm || a.alarm)) return { ok: false, reason: "maxed" };
    if (m === "plants" && a.plants >= RULES.plantsMax) return { ok: false, reason: "plantsMax" };
    if (m === "shield" && g.shield + a.shield >= RULES.shieldMax) return { ok: false, reason: "maxed" };
    if (m === "air" && g.air + a.air >= RULES.airMax) return { ok: false, reason: "maxed" };
    if (left(g) < cost) return { ok: false, reason: "noCells" };
    a[m] += 1; return { ok: true };
  }
  function remove(g, m) { const a = g.today.alloc; if (a[m] > 0) { a[m] -= 1; return true; } return false; }

  function answerEvent(g, yes) {
    const t = g.today; if (!t.event || t.event.kind !== "choice" || t.eventDone) return { ok: false };
    if (yes && left(g) < t.event.cost) return { ok: false, reason: "noCells" };
    t.eventYes = !!yes; t.eventDone = true;
    if (yes && t.event.effect.air) g.air = Math.min(RULES.airMax, g.air + t.event.effect.air);
    return { ok: true };
  }

  function endSol(g) {
    const t = g.today, a = t.alloc, r = [];
    // greenhouse planted yesterday delivers today
    if (g.plantsDue) { g.air += g.plantsDue; r.push(["plants", g.plantsDue]); }
    g.plantsDue = a.plants * RULES.plantYield; g.totals.plants += a.plants;
    if (a.plants) r.push(["planted", g.plantsDue]);
    if (a.air) { g.air += a.air; r.push(["airmade", a.air]); g.totals.airMade += a.air; }
    g.air -= RULES.breathe; r.push(["used", RULES.breathe]);
    if (a.science) { g.air -= a.science; g.stars += a.science; g.totals.science += a.science; r.push(["sciAir", a.science]); r.push(["star", a.science]); }
    if (a.shield) { g.shield = Math.min(RULES.shieldMax, g.shield + a.shield); r.push(["shield", g.shield]); }
    if (a.alarm) { g.alarm = true; r.push(["alarm", 1]); }
    if (t.event && t.event.kind === "choice" && !t.eventYes && t.event.effect.penaltyIfNo) { g.air += t.event.effect.penaltyIfNo.air; r.push(["fixPenalty", -t.event.effect.penaltyIfNo.air]); }
    // leftover power → battery
    const lo = left(g); let saved = Math.min(lo, RULES.battMax), lost = lo - saved;
    g.batt = saved; if (saved) r.push(["saved", saved]); if (lost) r.push(["lost", lost]);
    // night heaters
    if (g.batt >= 1) { g.batt -= 1; r.push(["heater", 1]); } else { g.air -= 1; g.totals.cold += 1; r.push(["cold", 1]); }
    // the real Sun
    let dmg = 0;
    if (t.level > 0) {
      g.totals.stormsFaced += 1;
      dmg = Math.max(0, t.level - g.shield);
      if (dmg === 0) { r.push(["stormOk", t.level]); if (t.level >= 3) g.totals.bigStormBlocked += 1; }
      else r.push(["stormHit", t.level, dmg]);
      if (a.science) { dmg += 1; r.push(["stormEva", 1]); }
      g.rad += dmg; g.totals.stormDmg += dmg;
    } else r.push([t.kind === "flash" ? "flash" : "calm", 0]);
    g.air = Math.max(0, Math.min(RULES.airMax, g.air));
    const entry = { sol: g.sol, day: t.day, level: t.level, forecast: t.forecast, alloc: { ...a }, event: t.event && t.event.id, eventYes: t.eventYes, dmg, air: g.air, rad: g.rad, shield: g.shield, stars: g.stars, batt: g.batt, report: r };
    g.log.push(entry);
    if (g.air <= 0) g.over = "air";
    else if (g.rad >= RULES.radMax) g.over = "rad";
    else if (g.sol >= RULES.days) g.over = "done";
    return entry;
  }

  function score(g) {
    let trophies = g.over === "done" ? 1 : 0;
    if (g.over === "done" && g.stars >= RULES.starsGoal) trophies++;
    if (g.over === "done" && g.rad <= 1) trophies++;
    const badges = [];
    if (g.totals.bigStormBlocked > 0) badges.push("b_storm");
    if (g.over === "done" && g.rad === 0 && g.totals.stormsFaced > 0) badges.push("b_zero");
    if (g.stars >= 5) badges.push("b_sci");
    if (g.totals.plants >= 6) badges.push("b_green");
    if (g.over === "done") badges.push(g.site === "moon" ? "b_moon" : "b_mars");
    const lessons = [];
    if (g.over === "air") lessons.push("l_air");
    if (g.over === "rad" || g.totals.stormDmg > 0) lessons.push("l_shield");
    if (g.totals.cold > 0) lessons.push("l_night");
    if (g.site === "mars") lessons.push("l_delay");
    if (g.stars < RULES.starsGoal) lessons.push("l_science");
    if (g.totals.plants >= 3) lessons.push("l_plants");
    if (!lessons.length || (g.over === "done" && g.totals.stormDmg === 0 && g.stars >= 3)) lessons.unshift("l_good");
    return { trophies, badges, lessons: [...new Set(lessons)].slice(0, 3) };
  }

  const api = { SITES, RULES, stormLevel, flareKind, parseFlare, cmeHours, minutesBetween, newGame, startSol, add, remove, left, answerEvent, endSol, score };
  if (typeof module !== "undefined") module.exports = api; else root.ENGINE = api;
})(this);
