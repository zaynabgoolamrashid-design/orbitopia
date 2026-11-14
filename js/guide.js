/* Orbitopia — Nova, the astronaut teacher. Walks (real steps) to the part of the screen it explains, turns to face it, points and talks. */
window.GUIDE = (() => {
  let el, nova, bubble, txt, nextBtn, arrow, focusEl = null, busy = 0;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const small = () => window.innerWidth < 700;

  function init() {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="guide" class="guide docked" aria-live="polite">
        <div class="g-bubble" hidden><p class="g-text"></p><button class="g-next btn btn-go" hidden></button></div>
        <button class="g-body" aria-label="Nova"><span class="g-img stk">${window.ART.nova("idle")}</span></button>
      </div>
      <div class="g-arrow" hidden aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 44V10M10 24 24 8l14 16" stroke="#ffd23f" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 44V10M10 24 24 8l14 16" stroke="#1f2a5a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`);
    el = document.getElementById("guide"); nova = el.querySelector(".nova2"); bubble = el.querySelector(".g-bubble");
    txt = el.querySelector(".g-text"); nextBtn = el.querySelector(".g-next"); arrow = document.querySelector(".g-arrow");
  }
  function pose(...p) { nova.classList.remove("idle", "walk", "talk", "wave", "point", "cheer"); p.forEach(x => nova.classList.add(x)); }
  function face(left) { el.classList.toggle("flip", !!left); }
  function unfocus() { if (focusEl) focusEl.classList.remove("g-focus"); focusEl = null; arrow.hidden = true; }
  function show(on) { el.hidden = !on; if (!on) { bubble.hidden = true; unfocus(); } }
  function setOnTap(fn) { el.querySelector(".g-body").onclick = fn; }
  function peek(on) { el.classList.toggle("peek", on && small()); }

  // walk to a viewport position with real steps; speed ~ 340 px per second
  async function walk(x, y) {
    const r = el.getBoundingClientRect();
    const dx = x - r.left, dy = y - r.top, dist = Math.hypot(dx, dy);
    if (dist < 8) return;
    const dur = Math.max(.5, Math.min(1.8, dist / 340));
    face(dx < 0);
    el.style.transitionDuration = dur + "s";
    pose("walk"); el.classList.add("walking");
    el.style.left = x + "px"; el.style.top = y + "px";
    await wait(dur * 1000 + 40);
    el.classList.remove("walking"); pose("idle");
  }
  async function dock() {
    unfocus(); el.classList.remove("peek");
    const vh = window.innerHeight, h = el.offsetHeight;
    const y = small() ? vh - h - 96 : vh - h - 14, x = small() ? 0 : 14;
    if (!el.classList.contains("docked")) { await walk(x, y); }
    el.classList.add("docked"); el.style.left = ""; el.style.top = ""; pose("idle"); face(false);
  }
  async function walkTo(target) {
    unfocus(); el.classList.remove("peek");
    if (!target) return;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    await wait(420);
    const cur = el.getBoundingClientRect();
    el.classList.remove("docked"); el.style.left = cur.left + "px"; el.style.top = cur.top + "px";
    await wait(20);
    const r = target.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    const gw = el.offsetWidth, gh = el.offsetHeight;
    let x, y, side;
    if (r.left - gw - 6 > 4) { x = r.left - gw - 6; side = "left"; }
    else if (r.right + gw + 6 < vw - 4) { x = r.right + 6; side = "right"; }
    else { x = Math.max(4, Math.min(vw - gw - 4, r.left + r.width / 2 - gw / 2)); side = "below"; }
    y = side === "below" ? r.bottom + 6 : r.top + r.height / 2 - gh / 2;
    y = Math.max(70, Math.min(vh - gh - 6, y));
    await walk(x, y);
    face(side === "right");               // turn to face the target
    pose("point");
    focusEl = target; target.classList.add("g-focus");
    const ar = target.getBoundingClientRect();
    arrow.style.left = Math.max(6, Math.min(vw - 50, ar.left + ar.width / 2 - 22)) + "px";
    arrow.style.top = Math.min(vh - 54, ar.bottom + 2) + "px";
    arrow.hidden = ar.bottom + 50 > vh;
  }

  /* say(text, {target, next, lang, speak, stay, keep, hideAfter, mood}) */
  async function say(text, o = {}) {
    const id = ++busy;
    show(true); el.classList.remove("peek");
    if (o.target) await walkTo(typeof o.target === "string" ? document.querySelector(o.target) : o.target);
    else if (o.dock !== false) await dock();
    if (id !== busy) return;
    txt.textContent = text; bubble.hidden = false;
    const r = el.getBoundingClientRect();
    bubble.classList.toggle("below", !el.classList.contains("docked") && r.top < 230);
    el.classList.toggle("bubble-left", r.left > window.innerWidth / 2);
    pose(o.target ? "point" : (o.mood || "wave"), "talk");
    const done = new Promise(res => {
      if (o.next) { nextBtn.hidden = false; nextBtn.textContent = o.next; nextBtn.onclick = () => { window.VOICE.stop(); res(); }; }
      else nextBtn.hidden = true;
      // The bubble stays until Nova has finished talking AND a child had time to read it (also when sound is off).
      let spoke = false, read = false;
      const stopTalk = () => { if (id === busy) pose(o.target ? "point" : "idle"); spoke = true; if (!o.next && read) res(); };
      if (o.speak !== false) window.VOICE.speak(text, o.lang || "en", "kiko", stopTalk);
      else setTimeout(stopTalk, 1800);
      if (!o.next) { setTimeout(() => { read = true; if (spoke) res(); }, Math.max(2500, text.length * 50)); setTimeout(res, Math.max(4500, text.length * 85)); }
      setTimeout(() => { if (id === busy && nova.classList.contains("talk") && window.speechSynthesis && !window.speechSynthesis.speaking) pose(o.target ? "point" : "idle"); }, Math.max(2500, text.length * 60));
    });
    await done;
    if (id !== busy) return;
    pose(o.target ? "point" : "idle");
    nextBtn.hidden = true;
    if (o.stay) return;
    unfocus();
    if (!o.keep && (o.next || o.hideAfter || o.target || small())) bubble.hidden = true;
    if (o.target) await dock();
    if (id === busy && bubble.hidden) peek(true);
  }
  function hush() { busy++; bubble.hidden = true; unfocus(); window.VOICE.stop(); if (nova) pose("idle"); }

  return { init, say, dock, show, hush, pose, setOnTap, small, peek };
})();
