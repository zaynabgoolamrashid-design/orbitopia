/* Orbitopia — original sticker-style illustrations drawn in code (vector SVG).
   Characters and props inspired by the team's mood board. Nova has separate arms, legs, eyes and mouth so he can really walk, wave, point and talk. */
window.ART = (() => {
  const O = "#1f2a5a";
  const S = (w = 3.2) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const emblem = (cx, cy, r) => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${O}" stroke="#fff" stroke-width="${r / 5}"/><circle cx="${cx}" cy="${cy}" r="${r * .42}" fill="#f07a45"/><ellipse cx="${cx}" cy="${cy}" rx="${r * .78}" ry="${r * .24}" fill="none" stroke="#ffd23f" stroke-width="${r / 6}"/><path d="M${cx - r * .42} ${cy} a${r * .42} ${r * .42} 0 0 1 ${r * .84} 0z" fill="#f07a45"/></g>`;

  /* ---------- Nova: a cartoon space cat. Separate parts: head, ears, eyes, mouth, body, front paws, back legs, tail ---------- */
  const NOVA_DEFS = `<defs>
    <radialGradient id="nvFur" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffc98f"/><stop offset=".6" stop-color="#ffa95e"/><stop offset="1" stop-color="#e8853a"/></radialGradient>
    <radialGradient id="nvMuz" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fbeee3"/></radialGradient>
    <radialGradient id="nvSuit" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f3f5fa"/><stop offset="1" stop-color="#d3d9e8"/></radialGradient>
    <linearGradient id="nvBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aa6ff"/><stop offset="1" stop-color="#2f6fd8"/></linearGradient>
    <radialGradient id="nvIris" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#b8f27a"/><stop offset=".6" stop-color="#4fbf5a"/><stop offset="1" stop-color="#1f7a3a"/></radialGradient>
  </defs>`;
  function nova(state = "idle", extra = "") {
    const L = "#4a2f22";
    const s = (w = 2.4) => `stroke="${L}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
    const paw = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nvFur)" ${s()}/>
        <path d="M${cx - 4} ${cy + r - 3} v-4 M${cx + 4} ${cy + r - 3} v-4" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="${cx}" cy="${cy + 1}" rx="${r * .38}" ry="${r * .3}" fill="#ff9fb2"/>`;
    const arm = (side) => {
      const x = side === "l" ? 45 : 133, gx = side === "l" ? 56 : 144;
      return `<g class="nv-arm ${side}">
        <rect x="${x}" y="140" width="22" height="44" rx="11" fill="url(#nvSuit)" ${s()}/>
        <rect x="${x + 1.2}" y="172" width="19.6" height="6" fill="url(#nvBlue)"/>
        ${paw(gx, 190)}</g>`;
    };
    const leg = (side) => {
      const x = side === "l" ? 75 : 103, fx = x + 11;
      return `<g class="nv-leg ${side}">
        <rect x="${x}" y="192" width="22" height="30" rx="10" fill="url(#nvSuit)" ${s()}/>
        <rect x="${x + 1.2}" y="212" width="19.6" height="6" fill="url(#nvBlue)"/>
        <ellipse cx="${fx}" cy="230" rx="15" ry="10" fill="url(#nvFur)" ${s()}/>
        <path d="M${fx - 5} 236 v-5 M${fx + 5} 236 v-5" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/></g>`;
    };
    const ear = (side) => side === "l"
      ? `<g class="nv-ear l"><path d="M58 70 C 50 46, 52 28, 60 18 C 74 26, 86 36, 92 50 Z" fill="url(#nvFur)" ${s()}/><path d="M63 56 C 60 42, 61 32, 64 27 C 72 33, 79 40, 82 48 Z" fill="#ffb3c2"/></g>`
      : `<g class="nv-ear r"><path d="M142 70 C 150 46, 148 28, 140 18 C 126 26, 114 36, 108 50 Z" fill="url(#nvFur)" ${s()}/><path d="M137 56 C 140 42, 139 32, 136 27 C 128 33, 121 40, 118 48 Z" fill="#ffb3c2"/></g>`;
    const spark = (x, y, r, d) => `<path style="animation-delay:${d}s" d="M${x} ${y - r} l${r * .3} ${r * .7} ${r * .7} ${r * .3} -${r * .7} ${r * .3} -${r * .3} ${r * .7} -${r * .3} -${r * .7} -${r * .7} -${r * .3} ${r * .7} -${r * .3}z" fill="#ffd23f" stroke="${L}" stroke-width="1.4"/>`;
    return `<svg class="nova2 cat ${state} ${extra}" viewBox="-14 -8 228 262" aria-hidden="true">${NOVA_DEFS}<g class="nv-all">
      <g class="nv-tail">
        <path d="M128 190 C 160 192, 176 170, 170 146 C 166 130, 178 118, 188 124" fill="none" stroke="${L}" stroke-width="17" stroke-linecap="round"/>
        <path d="M128 190 C 160 192, 176 170, 170 146 C 166 130, 178 118, 188 124" fill="none" stroke="#ffa95e" stroke-width="12" stroke-linecap="round"/>
        <path d="M150 188 l4 -9 M163 176 l8 -5 M168 156 l9 -2" stroke="#d9702a" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="187" cy="124" r="6" fill="#fff8f0"/>
      </g>
      ${leg("l")}${leg("r")}
      ${arm("l")}
      <g class="nv-body">
        <rect x="64" y="134" width="72" height="66" rx="26" fill="url(#nvSuit)" ${s()}/>
        <path d="M100 138 v58" stroke="#dbe0ee" stroke-width="2"/>
        <rect x="66" y="182" width="68" height="8" rx="4" fill="url(#nvBlue)"/>
        <rect x="84" y="148" width="32" height="22" rx="6" fill="#e6f0ff" ${s(2)}/>
        <circle cx="92" cy="157" r="3.2" fill="#ff5a7a"/><circle cx="100" cy="157" r="3.2" fill="#ffd23f"/><circle cx="108" cy="157" r="3.2" fill="#4f8cff"/>
        <path d="M90 164 q5 4 10 0 q5 4 10 0" stroke="#4f8cff" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${emblem(74, 150, 5.5)}
        <path d="M72 136 q28 10 56 0" fill="none" stroke="url(#nvBlue)" stroke-width="7" stroke-linecap="round"/>
      </g>
      ${arm("r")}
      <g class="nv-head">
        ${ear("l")}${ear("r")}
        <ellipse cx="100" cy="90" rx="54" ry="45" fill="url(#nvFur)" ${s(2.6)}/>
        <path d="M47 98 l-9 4 l10 2 M153 98 l9 4 l-10 2" fill="url(#nvFur)" ${s(2)}/>
        <path d="M92 50 q-2 10 0 16 M100 47 v19 M108 50 q2 10 0 16" stroke="#d9702a" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M50 84 h9 M50 92 h8 M150 84 h-9 M150 92 h-8" stroke="#d9702a" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="100" cy="112" rx="26" ry="18" fill="url(#nvMuz)"/>
        <g class="nv-eyes">
          <ellipse cx="78" cy="88" rx="12" ry="13.5" fill="#fff" ${s(2)}/>
          <ellipse cx="122" cy="88" rx="12" ry="13.5" fill="#fff" ${s(2)}/>
          <g class="nv-look">
            <ellipse cx="79" cy="89" rx="9.5" ry="11" fill="url(#nvIris)"/><ellipse cx="79" cy="90" rx="4" ry="7" fill="#1a1208"/><circle cx="83" cy="84" r="3.6" fill="#fff"/><circle cx="76" cy="95" r="1.6" fill="#fff"/>
            <ellipse cx="121" cy="89" rx="9.5" ry="11" fill="url(#nvIris)"/><ellipse cx="121" cy="90" rx="4" ry="7" fill="#1a1208"/><circle cx="125" cy="84" r="3.6" fill="#fff"/><circle cx="118" cy="95" r="1.6" fill="#fff"/>
          </g>
          <path d="M65 80 l-4 -3 M135 80 l4 -3" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>
        </g>
        <ellipse cx="62" cy="106" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/><ellipse cx="138" cy="106" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/>
        <path d="M94 103 h12 l-6 6 z" fill="#ff7f9a" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>
        <path class="m-closed" d="M100 109 v3 M90 112 q5 6 10 0 q5 6 10 0" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>
        <g class="m-open"><path d="M100 109 v2" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><path d="M91 112 q9 -2 18 0 q-2 13 -9 13 q-7 0 -9 -13z" fill="#b8445a" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><path d="M95 120 q5 4 10 0" fill="#ff9aac"/></g>
        <g class="nv-whisk" stroke="${L}" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M76 110 l-22 -4 M76 115 l-22 2 M124 110 l22 -4 M124 115 l22 2"/></g>
      </g>
      <g class="nv-spark">${spark(40, 60, 9, 0)}${spark(162, 50, 7, .2)}${spark(176, 96, 6, .4)}${spark(26, 104, 6, .3)}</g>
    </g></svg>`;
  }

  /* ---------- planets & sky ---------- */
  function moon() {
    const crater = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#aab0c2"/><path d="M${x - r * .8} ${y + r * .3} a${r} ${r} 0 0 0 ${r * 1.6} 0" fill="none" stroke="#e3e6ee" stroke-width="${Math.max(1.5, r / 4)}" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 120 120" class="art moon" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#d2d6e1" ${S(3.4)}/>
      <path d="M96 30 a54 54 0 0 1 -44 82 a60 60 0 0 0 44 -82z" fill="#bcc1d0"/>
      ${crater(40, 40, 12)}${crater(80, 74, 15)}${crater(82, 34, 7)}${crater(36, 82, 8)}${crater(60, 99, 5)}${crater(58, 62, 4)}
      <path d="M22 48 q8 -24 32 -32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="60" cy="60" r="54" fill="none" ${S(3.4)}/></svg>`;
  }
  function mars() {
    return `<svg viewBox="0 0 120 120" class="art mars" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#e2603a" ${S(3.4)}/>
      <path d="M98 32 a54 54 0 0 1 -46 80 a60 60 0 0 0 46 -80z" fill="#c94b2a"/>
      <ellipse cx="44" cy="40" rx="12" ry="8" fill="#b23f22"/><ellipse cx="78" cy="70" rx="16" ry="11" fill="#b23f22"/><ellipse cx="36" cy="76" rx="8" ry="6" fill="#b23f22"/>
      <ellipse cx="84" cy="34" rx="6" ry="4" fill="#b23f22"/><ellipse cx="60" cy="98" rx="10" ry="4" fill="#b23f22"/><circle cx="62" cy="54" r="4" fill="#b23f22"/>
      <path d="M22 48 q8 -24 32 -32" stroke="#ffd2c2" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="60" cy="60" r="54" fill="none" ${S(3.4)}/></svg>`;
  }
  function sun() {
    const rays = Array.from({ length: 16 }, (_, i) => {
      const a = i * Math.PI / 8, a1 = a - .2, a2 = a + .2, r1 = 40, r2 = i % 2 ? 56 : 62;
      const p = (r, t) => `${(60 + r * Math.cos(t)).toFixed(1)} ${(60 + r * Math.sin(t)).toFixed(1)}`;
      return `<path d="M${p(r1, a1)} L${p(r2, a)} L${p(r1, a2)}z" fill="${i % 2 ? "#ffb21e" : "#ff8f1e"}" ${S(2.8)}/>`;
    }).join("");
    return `<svg viewBox="0 0 120 120" class="art sun2" aria-hidden="true"><g class="sun-rays">${rays}</g>
      <circle cx="60" cy="60" r="42" fill="#ffc22e" ${S(3.2)}/><circle cx="60" cy="60" r="34" fill="#ffd84d"/>
      <path d="M36 46 q8 -16 26 -18" stroke="#fff6c2" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
  }
  function earth() {
    return `<svg viewBox="0 0 140 120" class="art earth" aria-hidden="true">
      <path d="M12 74 Q70 40 128 50" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M12 74 Q70 40 128 50" fill="none" stroke="#f2c94c" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="70" cy="64" r="42" fill="#3d8bfd" ${S(3.2)}/>
      <path d="M44 42 q14 -8 22 2 q-2 10 -12 10 q-4 10 -12 8 q-6 -10 2 -20z M78 56 q10 -6 18 2 q4 12 -6 18 q-6 10 -14 4 q-6 -12 2 -24z M52 86 q8 -2 10 6 q-4 6 -10 2z" fill="#5cc85c" ${S(2)}/>
      <path d="M40 48 q6 -12 20 -16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M128 50 Q100 96 30 100" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M128 50 Q100 96 30 100" fill="none" stroke="#f2c94c" stroke-width="4.5" stroke-linecap="round"/>
      <g transform="translate(112 18) rotate(30)"><rect x="-14" y="-5" width="10" height="10" fill="#4f8cff" ${S(2)}/><rect x="4" y="-5" width="10" height="10" fill="#4f8cff" ${S(2)}/><rect x="-5" y="-6" width="10" height="12" rx="3" fill="#dfe5f2" ${S(2)}/></g></svg>`;
  }

  /* ---------- base buildings ---------- */
  function base() {
    return `<svg viewBox="0 0 360 200" class="art base" aria-hidden="true">
      <ellipse cx="180" cy="186" rx="176" ry="12" fill="#b8b1a5" ${S(3)}/>
      <rect x="22" y="112" width="44" height="64" rx="18" fill="#fff" ${S()}/><rect class="win" x="32" y="128" width="24" height="18" rx="6" fill="#5fa8ff" ${S(2.6)}/>
      <rect x="54" y="122" width="66" height="48" rx="22" fill="#f4f6fc" ${S()}/><path d="M72 124 v44 M100 124 v44" stroke="#c9d1ee" stroke-width="3"/>
      <rect class="win" x="78" y="134" width="16" height="12" rx="4" fill="#5fa8ff" ${S(2.4)}/>
      <rect x="244" y="126" width="62" height="42" rx="20" fill="#f4f6fc" ${S()}/><path d="M262 128 v38 M286 128 v38" stroke="#c9d1ee" stroke-width="3"/>
      <rect x="296" y="72" width="40" height="106" rx="10" fill="#fff" ${S()}/><rect class="win" x="306" y="88" width="20" height="16" rx="4" fill="#5fa8ff" ${S(2.4)}/><rect class="win" x="306" y="120" width="20" height="16" rx="4" fill="#5fa8ff" ${S(2.4)}/>
      <path d="M300 64 q16 22 40 -6 z" fill="#e8ecf7" ${S()}/><path d="M320 52 v14" ${S(3)}/><path d="M320 54 l14 -22" ${S(3)}/><circle cx="335" cy="30" r="5" fill="#ff5a5a" ${S(2.4)}/>
      <rect x="104" y="108" width="152" height="74" rx="12" fill="#fff" ${S()}/>
      <rect x="166" y="128" width="28" height="54" rx="9" fill="#3a7be0" ${S()}/><rect class="win" x="172" y="136" width="16" height="14" rx="4" fill="#9fd0ff"/>
      <circle class="win" cx="132" cy="140" r="10" fill="#5fa8ff" ${S(2.6)}/><circle class="win" cx="228" cy="140" r="10" fill="#5fa8ff" ${S(2.6)}/>
      <rect x="114" y="160" width="20" height="5" rx="2.5" fill="#ffd23f"/><rect x="226" y="160" width="20" height="5" rx="2.5" fill="#ffd23f"/>
      <path d="M160 182 h40 l-6 -6 h-28z" fill="#c9d1ee" ${S(2.4)}/>
      <path d="M108 110 a72 64 0 0 1 144 0 z" fill="#5fa8ff" ${S()}/>
      <g stroke="#2f6fd8" stroke-width="2.4" fill="none"><path d="M180 46 v64"/><path d="M180 46 Q148 58 140 110"/><path d="M180 46 Q212 58 220 110"/><path d="M180 46 Q124 72 116 110"/><path d="M180 46 Q236 72 244 110"/><path d="M122 84 Q180 68 238 84"/><path d="M112 100 Q180 88 248 100"/></g>
      <path d="M128 92 q8 -30 40 -40" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/>
      ${emblem(180, 82, 12)}
      <rect x="100" y="104" width="160" height="10" rx="5" fill="#dfe5f2" ${S(2.8)}/>
      <rect x="166" y="34" width="28" height="14" rx="6" fill="#fff" ${S(2.8)}/><path d="M172 34 v-12 M188 34 v-16" ${S(2.6)}/><circle class="beacon" cx="188" cy="16" r="4" fill="#ff5a5a" ${S(2)}/>
      <ellipse cx="40" cy="184" rx="12" ry="6" fill="#8e8a82" ${S(2.4)}/><ellipse cx="320" cy="186" rx="14" ry="6" fill="#8e8a82" ${S(2.4)}/><ellipse cx="146" cy="188" rx="9" ry="4" fill="#8e8a82" ${S(2)}/></svg>`;
  }
  function greenhouse() {
    return `<svg viewBox="0 0 160 130" class="art greenhouse" aria-hidden="true">
      <rect x="6" y="100" width="148" height="20" rx="9" fill="#c9cfe0" ${S()}/>
      <path d="M14 102 a66 72 0 0 1 132 0 z" fill="#d7f3ff" ${S()}/>
      <g ${S(2.2)}><ellipse cx="40" cy="88" rx="14" ry="12" fill="#3fbf5f"/><ellipse cx="62" cy="80" rx="15" ry="16" fill="#5bd67a"/><ellipse cx="88" cy="84" rx="16" ry="14" fill="#3fbf5f"/><ellipse cx="114" cy="86" rx="14" ry="13" fill="#5bd67a"/><ellipse cx="76" cy="62" rx="12" ry="12" fill="#6fe08a"/></g>
      <g stroke="#7fb3d9" stroke-width="2.2" fill="none"><path d="M80 30 v72"/><path d="M80 30 Q50 40 40 102"/><path d="M80 30 Q110 40 120 102"/><path d="M24 70 Q80 54 136 70"/></g>
      <path d="M30 80 q8 -34 40 -46" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M14 102 a66 72 0 0 1 132 0" fill="none" ${S()}/>
      <rect x="62" y="94" width="36" height="22" rx="5" fill="#fff" ${S(2.6)}/><path d="M80 112 v-8 M80 106 q-6 -1 -7 -7 q6 0 7 7 M80 105 q6 -1 7 -7 q-6 0 -7 7" stroke="#2f9e55" stroke-width="2.4" fill="#5bd67a" stroke-linejoin="round"/></svg>`;
  }
  function solar() {
    return `<svg viewBox="0 0 130 120" class="art solar" aria-hidden="true">
      <ellipse cx="66" cy="110" rx="50" ry="7" fill="#b8b1a5" ${S(2.6)}/>
      <path d="M60 64 v44 M48 108 l12 -20 l12 20" ${S(5)} fill="none"/><path d="M60 64 v44 M48 108 l12 -20 l12 20" stroke="#c9d1ee" stroke-width="2" fill="none"/>
      <path d="M22 18 L120 30 L104 74 L6 62 Z" fill="#2f5fd0" ${S()}/>
      <g stroke="#8fb4ff" stroke-width="2"><path d="M46 21 L30 65"/><path d="M71 24 L55 68"/><path d="M96 27 L80 71"/><path d="M14 40 L112 52"/></g>
      <path d="M26 24 L52 27" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/></svg>`;
  }
  function dish() {
    return `<svg viewBox="0 0 110 140" class="art dish" aria-hidden="true">
      <ellipse cx="55" cy="132" rx="46" ry="6" fill="#b8b1a5" ${S(2.4)}/>
      <rect x="24" y="92" width="62" height="40" rx="12" fill="#fff" ${S()}/><rect x="44" y="104" width="22" height="14" rx="4" fill="#5fa8ff" ${S(2.4)}/>
      <path d="M55 92 v-18" ${S(5)}/><path d="M55 92 v-18" stroke="#c9d1ee" stroke-width="2"/>
      <path d="M14 30 Q20 86 92 70 Z" fill="#e8ecf7" ${S()}/><path d="M24 40 Q32 74 80 66" stroke="#c9d1ee" stroke-width="3" fill="none"/>
      <path d="M52 52 L82 22" ${S(3)}/><circle cx="84" cy="20" r="6" fill="#ff5a5a" ${S(2.4)}/></svg>`;
  }
  function rover() {
    const wheel = (x) => `<circle cx="${x}" cy="92" r="15" fill="#3a3f55" ${S()}/><circle cx="${x}" cy="92" r="6" fill="#c9d1ee" ${S(2)}/>`;
    return `<svg viewBox="0 0 180 112" class="art rover" aria-hidden="true">
      <path d="M38 76 l-10 16 M90 76 v16 M142 76 l10 16" ${S(4)}/>
      <rect x="24" y="52" width="130" height="30" rx="10" fill="#fff" ${S()}/>
      <rect x="34" y="60" width="38" height="14" rx="4" fill="#dfe5f2" ${S(2.4)}/>${emblem(96, 66, 9)}
      <path d="M126 52 v-26" ${S(5)}/><path d="M126 52 v-26" stroke="#c9d1ee" stroke-width="2"/>
      <rect x="112" y="10" width="34" height="18" rx="6" fill="#fff" ${S()}/><circle cx="137" cy="19" r="5" fill="#5fa8ff" ${S(2)}/>
      <path d="M154 64 l14 -12 l8 8" fill="none" ${S(4)}/><path d="M172 56 l6 -6 M172 56 l7 2" ${S(3)}/>
      ${wheel(36)}${wheel(90)}${wheel(144)}</svg>`;
  }


  /* ---------- the whole base as ONE smooth landscape ---------- */
  const inner = (svg) => svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  function rand(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function landscape(site, o = {}) {
    const moon = site === "moon", r = rand(moon ? 7 : 11);
    const P = moon
      ? { s1: "#05082a", s2: "#121a52", s3: "#2c3478", far: "#3a4170", mid1: "#8a90b0", mid2: "#6c7296", g1: "#b6bbd2", g2: "#878ca8", rock: "#6a6f8c", rim: "#d6d9e8" }
      : { s1: "#1a0f35", s2: "#4a2350", s3: "#c97a5c", far: "#6b2f35", mid1: "#c4603a", mid2: "#a3472c", g1: "#de7a4c", g2: "#b0502e", rock: "#7d3520", rim: "#f0a07c" };
    let stars = "";
    for (let i = 0; i < 46; i++) { const x = r() * 400, y = r() * (moon ? 120 : 80), rr = .5 + r() * 1.3; stars += `<circle class="${i % 3 ? "" : "tw"}" style="animation-delay:${(r() * 4).toFixed(1)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(2)}" fill="#fff" opacity="${(.45 + r() * .55).toFixed(2)}"/>`; }
    const crater = (x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * .32}" fill="${P.g2}"/><path d="M${x - w} ${y} a${w} ${w * .32} 0 0 0 ${w * 2} 0" fill="none" stroke="${P.rim}" stroke-width="1.6" opacity=".8"/><ellipse cx="${x + w * .15}" cy="${y - w * .05}" rx="${w * .7}" ry="${w * .2}" fill="${P.rock}" opacity=".35"/>`;
    const sky2 = moon
      ? `<g class="ls-earth"><circle cx="292" cy="56" r="27" fill="url(#lsAtmo)"/><circle cx="292" cy="56" r="20" fill="url(#lsOcean)"/>
          <path d="M280 46 q8 -6 14 0 q-2 8 -10 8 q-3 6 -8 4 q-2 -8 4 -12z M296 58 q8 -5 13 2 q2 9 -6 12 q-6 4 -9 -2 q-2 -8 2 -12z" fill="#5cc85c" opacity=".95"/>
          <circle cx="292" cy="56" r="20" fill="url(#lsNight)"/></g>`
      : `<circle cx="300" cy="36" r="5" fill="#d9c8b8" opacity=".9"/><circle cx="352" cy="24" r="3" fill="#cdbbaa" opacity=".8"/><circle cx="336" cy="62" r="2.2" fill="#9fd0ff"/><text x="341" y="66" font-size="8" font-weight="800" fill="#ffe7dc" font-family="Nunito, sans-serif">${o.earthLabel || "Earth"}</text>`;
    let shells = "";
    const cx = 199, cy = 166;
    for (let i = (o.shield || 0); i >= 1; i--) {
      const rx = 47 + i * 7, ry = 42 + i * 7, rx2 = rx - 7, ry2 = ry - 7;
      shells += `<path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy} L${cx + rx2} ${cy} A${rx2} ${ry2} 0 0 0 ${cx - rx2} ${cy}Z" fill="url(#lsRego${i % 2})" stroke="${P.rock}" stroke-width="1.2" class="shell"/>`;
      for (let k = 0; k < 5; k++) { const t = Math.PI * (.12 + k * .19), px = cx - Math.cos(t) * (rx - 3.5), py = cy - Math.sin(t) * (ry - 3.5); shells += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.6" fill="${P.rock}" opacity=".7"/>`; }
    }
    const dust = moon ? "" : Array.from({ length: 14 }, (_, i) => `<circle class="mote" style="animation-delay:${(i * .7).toFixed(1)}s" cx="${(i * 29) % 400}" cy="${150 + (i * 13) % 60}" r="${(.8 + (i % 3) * .5).toFixed(1)}" fill="#ffd2b0" opacity=".6"/>`).join("");
    return `<svg class="landscape ${site}" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.s1}"/><stop offset=".55" stop-color="${P.s2}"/><stop offset="1" stop-color="${P.s3}"/></linearGradient>
        <radialGradient id="lsNeb1" cx=".75" cy=".2" r=".45"><stop offset="0" stop-color="${moon ? "#7a5cff" : "#ff9a6a"}" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <radialGradient id="lsNeb2" cx=".2" cy=".35" r=".4"><stop offset="0" stop-color="${moon ? "#3fa0ff" : "#c04a7a"}" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <linearGradient id="lsGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.g1}"/><stop offset="1" stop-color="${P.g2}"/></linearGradient>
        <linearGradient id="lsMid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.mid1}"/><stop offset="1" stop-color="${P.mid2}"/></linearGradient>
        <linearGradient id="lsRego1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.rim}"/><stop offset="1" stop-color="${P.g1}"/></linearGradient>
        <linearGradient id="lsRego0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.g1}"/><stop offset="1" stop-color="${P.g2}"/></linearGradient>
        <radialGradient id="lsOcean" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#7cc0ff"/><stop offset="1" stop-color="#1f5fc4"/></radialGradient>
        <radialGradient id="lsAtmo" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#7fc4ff" stop-opacity=".55"/><stop offset="1" stop-color="#7fc4ff" stop-opacity="0"/></radialGradient>
        <linearGradient id="lsNight" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#020418" stop-opacity=".75"/></linearGradient>
        <linearGradient id="lsShoot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
        <radialGradient id="lsLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="400" height="230" fill="url(#lsSky)"/>
      <rect width="400" height="230" fill="url(#lsNeb1)"/><rect width="400" height="230" fill="url(#lsNeb2)"/>
      <g class="ls-stars">${stars}</g>
      <line class="shooting" x1="0" y1="0" x2="46" y2="10" stroke="url(#lsShoot)" stroke-width="2" stroke-linecap="round"/>
      ${sky2}
      <path d="M0 132 L30 118 L52 126 L84 104 L112 122 L140 114 L172 126 L206 108 L236 122 L268 110 L300 126 L332 106 L362 120 L400 112 V160 H0z" fill="${P.far}" opacity=".85"/>
      <path d="M0 146 Q50 128 102 140 T206 136 T300 132 T400 140 V230 H0z" fill="url(#lsMid)"/>
      <path d="M0 158 Q90 146 180 154 T400 150 V230 H0z" fill="url(#lsGround)"/>
      <path d="M0 158 Q90 146 180 154 T400 150" fill="none" stroke="${P.rim}" stroke-width="1.6" opacity=".55"/>
      ${crater(40, 196, 18)}${crater(338, 210, 22)}${crater(150, 220, 12)}${crater(262, 164, 9)}${crater(96, 168, 7)}
      ${shells}
      <ellipse cx="200" cy="211" rx="120" ry="9" fill="#000" opacity=".22"/>
      <g class="ls-solar" opacity="${o.dim ? .55 : 1}">
        <ellipse cx="38" cy="194" rx="34" ry="5" fill="#000" opacity=".2"/>
        <g transform="translate(4 118) scale(.5)">${inner(solar())}</g><g transform="translate(36 128) scale(.46)">${inner(solar())}</g>
        <path class="glint" d="M18 132 l12 2" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0"/>
      </g>
      <g transform="translate(88 96) scale(.62)">${inner(base())}</g>
      <ellipse class="lamp" cx="199" cy="170" rx="70" ry="22" fill="url(#lsLamp)" opacity="0"/>
      ${o.alarm ? `<g class="ls-sensor" transform="translate(252 108) scale(.46)">${inner(sensor())}</g>` : ""}
      <ellipse cx="346" cy="214" rx="46" ry="5" fill="#000" opacity=".2"/>
      <g class="ls-green ${o.plants ? "grow" : ""}" transform="translate(300 140) scale(.58)">${inner(greenhouse())}</g>
      ${o.rover ? `<g class="ls-rover"><ellipse cx="60" cy="219" rx="36" ry="4" fill="#000" opacity=".22"/><g transform="translate(22 170) scale(.44)">${inner(rover())}</g><circle class="puff" cx="22" cy="214" r="4" fill="${P.rim}"/><circle class="puff p2" cx="16" cy="210" r="3" fill="${P.rim}"/></g>` : ""}
      ${dust}
      <g class="storm-fx"></g>
    </svg>`;
  }
  function sunSoft() {
    const rays = Array.from({ length: 12 }, (_, i) => `<path d="M60 60 L${(60 + 58 * Math.cos(i * Math.PI / 6 - .07)).toFixed(1)} ${(60 + 58 * Math.sin(i * Math.PI / 6 - .07)).toFixed(1)} L${(60 + 58 * Math.cos(i * Math.PI / 6 + .07)).toFixed(1)} ${(60 + 58 * Math.sin(i * Math.PI / 6 + .07)).toFixed(1)}z" fill="#ffe28a" opacity=".45"/>`).join("");
    return `<svg viewBox="0 0 120 120" class="art sunsoft" aria-hidden="true"><defs>
      <radialGradient id="ssHalo" cx=".5" cy=".5" r=".5"><stop offset=".35" stop-color="#ffd25a" stop-opacity=".75"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>
      <radialGradient id="ssCore" cx=".42" cy=".4" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffe066"/><stop offset="1" stop-color="#ffa21e"/></radialGradient></defs>
      <circle cx="60" cy="60" r="60" fill="url(#ssHalo)"/><g class="sun-rays">${rays}</g><circle cx="60" cy="60" r="26" fill="url(#ssCore)"/></svg>`;
  }


  /* ---------- radiation sensor (like NASA's HERA on Orion): box on short legs, round detector, red warning light ---------- */
  function sensor() {
    return `<svg viewBox="0 0 110 140" class="art sensor" aria-hidden="true">
      <ellipse cx="55" cy="132" rx="44" ry="6" fill="#b8b1a5" ${S(2.4)}/>
      <path d="M30 126 l-6 6 M80 126 l6 6 M42 126 v6 M68 126 v6" ${S(4)}/>
      <rect x="22" y="76" width="66" height="52" rx="10" fill="#fff" ${S()}/>
      <rect x="22" y="112" width="66" height="8" fill="#4f8cff"/>
      <rect x="32" y="86" width="30" height="18" rx="4" fill="#dff1ff" ${S(2.4)}/>
      <path d="M35 99 l5 -6 l4 4 l6 -9 l5 7 l4 -3" fill="none" stroke="#2f6fd8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="75" cy="92" r="5" fill="#ffd23f" ${S(2)}/><circle cx="75" cy="106" r="3.4" fill="#4cd964" ${S(1.8)}/>
      <rect x="47" y="64" width="16" height="14" rx="3" fill="#dfe5f2" ${S(2.6)}/>
      <path d="M33 66 a22 22 0 0 1 44 0 z" fill="#c9d1ee" ${S()}/>
      <circle cx="55" cy="56" r="12" fill="#ffd23f" ${S(2.6)}/>
      <circle cx="55" cy="56" r="4" fill="${O}"/><path d="M55 56 l-6 -9 a11 11 0 0 1 12 0z M55 56 l11 1 a11 11 0 0 1 -6 10z M55 56 l-5 10 a11 11 0 0 1 -6 -10z" fill="${O}" opacity=".85"/>
      <path d="M85 74 v-14" ${S(3)}/><circle class="beacon" cx="85" cy="56" r="6" fill="#ff5a5a" ${S(2.2)}/>
      <path class="beacon" d="M95 50 a14 14 0 0 1 0 12 M100 45 a22 22 0 0 1 0 22" stroke="#ff5a5a" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`;
  }
  function reactor() {
    return `<svg viewBox="0 0 120 130" class="art reactor" aria-hidden="true">
      <ellipse cx="60" cy="122" rx="52" ry="7" fill="#b8b1a5" ${S(2.4)}/>
      <path d="M8 40 l28 10 v58 l-28 -10z M112 40 l-28 10 v58 l28 -10z" fill="#9aa6d8" ${S(2.6)}/>
      <path d="M12 50 l20 7 M12 62 l20 7 M12 74 l20 7 M12 86 l20 7 M108 50 l-20 7 M108 62 l-20 7 M108 74 l-20 7 M108 86 l-20 7" stroke="#e8ecf7" stroke-width="2"/>
      <rect x="36" y="30" width="48" height="90" rx="10" fill="#fff" ${S()}/>
      <rect x="36" y="94" width="48" height="8" fill="#4f8cff"/>
      <circle class="core" cx="60" cy="60" r="13" fill="#7ef0c0" ${S(2.4)}/>
      <path d="M44 30 q16 -14 32 0" fill="#dfe5f2" ${S(2.6)}/></svg>`;
  }
  function capsule() {
    return `<svg viewBox="0 0 160 150" class="art capsule" aria-hidden="true">
      <path d="M50 20 h60 l34 96 h-128 z" fill="#f4f6fc" ${S()}/>
      <path d="M16 116 h128 v16 a6 6 0 0 1 -6 6 h-116 a6 6 0 0 1 -6 -6z" fill="#c9d1ee" ${S()}/>
      <path d="M50 20 h60 v-6 a4 4 0 0 0 -4 -4 h-52 a4 4 0 0 0 -4 4z" fill="#9aa6d8" ${S(2.6)}/>
      <rect x="62" y="44" width="36" height="22" rx="6" fill="#2a3a7a" ${S(2.6)}/>
      <path d="M68 48 q8 -2 14 2" stroke="#9cc8ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <rect x="58" y="80" width="44" height="26" rx="5" fill="#fff" ${S(2.6)}/>
      <circle class="beacon" cx="70" cy="93" r="6" fill="#ff5a5a" ${S(2)}/>
      <path d="M80 98 l5 -6 l4 4 l6 -8" fill="none" stroke="#2f6fd8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${emblem(38, 104, 6)}</svg>`;
  }

  /* ---------- animated story scenes (viewBox 400x230) ---------- */
  const sky = (id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b30"/><stop offset="1" stop-color="#1b2470"/></linearGradient></defs><rect width="400" height="230" fill="url(#${id})"/>` +
    Array.from({ length: 40 }, (_, i) => `<circle class="${i % 3 ? "" : "tw"}" style="animation-delay:${(i * .37 % 4).toFixed(1)}s" cx="${(i * 97) % 400}" cy="${(i * 53) % 230}" r="${.6 + (i % 3) * .5}" fill="#fff" opacity=".8"/>`).join("");
  const glowSun = (x, y, r, angry) => `<defs><radialGradient id="gsH${x}" cx=".5" cy=".5" r=".5"><stop offset=".35" stop-color="${angry ? "#ff7a3a" : "#ffd25a"}" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>
      <radialGradient id="gsC${x}" cx=".42" cy=".4" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="${angry ? "#ffb04a" : "#ffe066"}"/><stop offset="1" stop-color="${angry ? "#ff5a2a" : "#ffa21e"}"/></radialGradient></defs>
      <circle class="sun-pulse" cx="${x}" cy="${y}" r="${r * 2}" fill="url(#gsH${x})"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gsC${x})"/>`;
  const label = (x, y, t) => t ? `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" stroke="#0d1442" stroke-width="4" paint-order="stroke" font-family="Nunito, sans-serif">${t}</text>` : "";
  const bigEarth = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3d8bfd" ${S(3)}/>
      <path d="M${cx - r * .6} ${cy - r * .5} q${r * .4} -${r * .25} ${r * .65} ${r * .05} q-${r * .05} ${r * .3} -${r * .35} ${r * .3} q-${r * .12} ${r * .3} -${r * .35} ${r * .22} q-${r * .18} -${r * .3} ${r * .05} -${r * .57}z M${cx + r * .1} ${cy - r * .1} q${r * .3} -${r * .18} ${r * .55} ${r * .06} q${r * .12} ${r * .36} -${r * .18} ${r * .55} q-${r * .18} ${r * .3} -${r * .42} ${r * .12} q-${r * .18} -${r * .36} ${r * .05} -${r * .73}z" fill="#5cc85c" ${S(2)}/>
      <path d="M${cx - r * .75} ${cy - r * .35} q${r * .2} -${r * .4} ${r * .6} -${r * .5}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;

  function story(name, o = {}) {
    const L = o.labels || {};
    if (name === "earth") {
      const particles = Array.from({ length: 9 }, (_, i) => {
        const y = 60 + i * 14, up = y < 115;
        const path = `M70 ${y} L${200 + Math.abs(y - 115) * .4} ${y} Q ${232} ${up ? y - 30 : y + 30} ${300 + (i % 3) * 20} ${up ? 10 : 220}`;
        return `<circle r="3" fill="#ff7aa8"><animateMotion dur="2.6s" begin="${(i * .29).toFixed(2)}s" repeatCount="indefinite" path="${path}"/></circle>`;
      }).join("");
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk1")}${glowSun(36, 115, 34)}
        <g fill="none" stroke="#7fd0ff" stroke-width="2.5" opacity=".75" class="shield-pulse">
          <path d="M290 40 Q 214 115 290 190"/><path d="M296 56 Q 236 115 296 174"/><path d="M302 72 Q 256 115 302 158"/>
          <path d="M290 40 Q 370 60 400 90 M290 190 Q 370 170 400 140"/></g>
        ${particles}${bigEarth(305, 115, 34)}${label(305, 172, L.earth)}${label(36, 172, L.sun)}</svg>`;
    }
    if (name === "trip") {
      const path = "M60 160 Q 110 60 170 90 Q 230 126 290 104";
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk2")}
        <path d="${path}" fill="none" stroke="#ffd23f" stroke-width="3" stroke-dasharray="6 7" opacity=".8"/>
        ${bigEarth(60, 160, 26)}<g transform="translate(152 72) scale(.3)">${inner(moon())}</g><g transform="translate(266 80) scale(.42)">${inner(mars())}</g>
        <g><g transform="translate(-14 -20) scale(.3)">${rocket()}</g><animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>
        ${label(60, 205, L.earth)}${label(170, 70, L.moon)}${label(291, 150, L.mars)}</svg>`;
    }
    if (name === "danger") {
      return `<div class="story-stack">${landscape(o.site || "moon", { shield: 0, earthLabel: L.earth })}<div class="story-sunpic">${sunSoft()}</div></div>`;
    }
    if (name === "choices") {
      const c = (x, ic, t) => `<circle cx="${x}" cy="110" r="40" fill="#fff" ${S(3.5)}/><use href="#i-${ic}" x="${x - 26}" y="84" width="52" height="52"/>${label(x, 176, t)}`;
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk3")}
        ${c(150, "oxygen", L.air)}${c(250, "shield", L.shield)}${c(350, "flask", L.science)}
        <g><use href="#i-power" x="-18" y="-18" width="36" height="36"/><animateMotion dur="3.6s" repeatCount="indefinite" path="M150 46 Q 200 6 250 46 Q 300 6 350 46 Q 250 -24 150 46"/></g>
        <text x="250" y="216" text-anchor="middle" font-size="15" font-weight="900" fill="#ffd23f" font-family="Nunito, sans-serif">${o.question || ""}</text></svg>`;
    }
    if (name === "week") {
      const days = o.days || [];
      const cards = days.map((d, i) => `<g class="pop-in" style="animation-delay:${(i * .35).toFixed(2)}s">
          <rect x="${92 + i * 43}" y="70" width="39" height="96" rx="11" fill="#fff" ${S(2.4)}/>
          <circle cx="${111.5 + i * 43}" cy="100" r="${10 + d.level * 1.6}" fill="${["#ffd84d", "#ffc23d", "#ffa133", "#ff7a2e", "#ff4d3d"][d.level]}" ${S(2)}/>
          ${d.level ? `<text x="${111.5 + i * 43}" y="105" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" font-family="Nunito, sans-serif">${d.level}</text>` : ""}
          <text x="${111.5 + i * 43}" y="138" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1f2a5a" font-family="Nunito, sans-serif">${d.top || ""}</text>
          <text x="${111.5 + i * 43}" y="154" text-anchor="middle" font-size="8.5" font-weight="800" fill="#5a648f" font-family="Nunito, sans-serif">${d.sub || ""}</text>
          ${d.mark ? `<circle cx="${127 + i * 43}" cy="74" r="9" fill="${d.mark === "ok" ? "#4cd964" : "#ff5a7a"}" ${S(2)}/><text x="${127 + i * 43}" y="78.5" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="Nunito, sans-serif">${d.mark === "ok" ? "✓" : "!"}</text>` : ""}</g>`).join("");
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk4")}${label(240, 44, o.title)}${cards}${label(240, 200, o.caption)}</svg>`;
    }
    if (name === "hera") {
      const p = Array.from({ length: 10 }, (_, i) => `<circle r="2.6" fill="#ff7aa8"><animateMotion dur="1.8s" begin="${(i * .18).toFixed(2)}s" repeatCount="indefinite" path="M${20 + i * 14} 0 L ${150 + i * 6} 120"/></circle>`).join("");
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk5")}${glowSun(30, 30, 22, true)}${p}
        <circle class="ring" cx="250" cy="130" r="40" fill="none" stroke="#ff5a5a" stroke-width="3"/><circle class="ring r2" cx="250" cy="130" r="40" fill="none" stroke="#ff5a5a" stroke-width="3"/>
        <g transform="translate(184 52) scale(.84)">${inner(capsule())}</g>${label(250, 215, L.hera)}</svg>`;
    }
    if (name === "plants") {
      const bub = Array.from({ length: 8 }, (_, i) => `<circle class="bubble-up" style="animation-delay:${(i * .45).toFixed(2)}s" cx="${150 + i * 14}" cy="120" r="${4 + (i % 3) * 2}" fill="#bff3ff" stroke="#7fd0ff" stroke-width="1.5"/>`).join("");
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk6")}
        <path d="M0 190 Q200 170 400 190 V230 H0z" fill="#9aa1bd"/>${bub}
        <g transform="translate(120 70) scale(1)">${inner(greenhouse())}</g>${label(200, 222, L.veggie)}</svg>`;
    }
    if (name === "power") {
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk7")}
        <path d="M0 120 L60 70 L110 110 L170 60 L230 120 V230 H0z" fill="#5a6090"/>
        <path d="M0 170 Q200 150 400 170 V230 H0z" fill="#b6bbd2"/>
        <g transform="translate(112 92) scale(.72)">${inner(solar())}</g>
        <g transform="translate(262 80) scale(.85)">${inner(reactor())}</g>
        <rect class="shadow-sweep" x="-200" y="0" width="200" height="230" fill="#000" opacity=".55"/>
        ${label(160, 215, L.solar)}${label(313, 215, L.reactor)}</svg>`;
    }
    if (name === "future") {
      return `<svg viewBox="0 0 400 230" class="story-art" aria-hidden="true">${sky("sk8")}
        <ellipse cx="200" cy="115" rx="160" ry="56" fill="none" stroke="#fff" stroke-dasharray="5 6" opacity=".4"/>
        ${bigEarth(200, 115, 30)}
        <g><g transform="translate(-18 -18) scale(.3)">${inner(moon())}</g><animateMotion dur="9s" repeatCount="indefinite" path="M40 115 A160 56 0 1 0 360 115 A160 56 0 1 0 40 115"/></g>
        <g><g transform="translate(-20 -20) scale(.34)">${inner(mars())}</g><animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" path="M40 115 A160 56 0 1 0 360 115 A160 56 0 1 0 40 115"/></g>
        ${Array.from({ length: 6 }, (_, i) => `<use class="tw" style="animation-delay:${i * .5}s" href="#i-star" x="${30 + i * 66}" y="${i % 2 ? 20 : 180}" width="22" height="22"/>`).join("")}</svg>`;
    }
    return "";
  }
  function rocket() {
    return `<svg viewBox="0 0 100 140" aria-hidden="true"><path d="M38 104 q12 34 12 34 q0 0 12 -34z" fill="#ffd23f" ${S(3)}/>
      <path d="M30 80 l-18 22 v8 l22 -10z" fill="#ff5a5a" ${S()}/><path d="M70 80 l18 22 v8 l-22 -10z" fill="#ff5a5a" ${S()}/>
      <path d="M50 6 c22 18 26 52 20 98 H30 c-6 -46 -2 -80 20 -98z" fill="#fff" ${S()}/><path d="M50 6 c9 7 15 16 18 26 H32 c3 -10 9 -19 18 -26z" fill="#ff5a5a" ${S()}/>
      <circle cx="50" cy="56" r="12" fill="#7fd6ff" ${S()}/></svg>`;
  }

  function stormParticles(n = 26) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 400, d = (Math.random() * 1.2).toFixed(2), len = 14 + Math.random() * 18;
      s += `<line class="pt" x1="${x}" y1="-20" x2="${x - len * .5}" y2="${-20 + len}" style="animation-delay:${d}s"/>`;
    }
    return s;
  }
  return { nova, moon, mars, sun, sunSoft, earth, base, greenhouse, solar, dish, sensor, reactor, capsule, rover, emblem, landscape, story, stormParticles };
})();
