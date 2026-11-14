# Orbitopia — Junior Astronaut Mission Trainer

**2026 NASA Space Apps Challenge · "Build a Junior Astronaut Mission Trainer"**

Orbitopia is a browser game (installable PWA) for kids aged 7–12. The player runs a Moon or Mars base for 7 days, and each game day is a **real day of the Sun** taken from NASA's DONKI space-weather database. Every morning the Sun gives the base a little power. The player taps (or *says*) where it goes: **Air**, **Greenhouse**, **Dirt shield**, **Explore** (each science star is a real NASA discovery card), or the **battery** for the night. No choice is free. *Saving power today might cost air tomorrow.*

- Bilingual: **English / Français** (one tap)
- Nova, a cartoon space-cat teacher, **walks across the screen to what he is explaining**, points at it and talks (speech synthesis); kids can **talk back** with the microphone button (no typing needed)
- Real NASA data, labelled **LIVE** or **SAVED** inside the app
- No account, no download, no ads, no tracking

## How the experience flows
1. **The story (before):** Nova the space cat explains the problem in 5 animated scenes: Earth's magnetic shield, NASA's Artemis plan, why the Moon and Mars are dangerous (no air, no magnetic shield, solar particle storms), why every power choice has a cost, and that the game uses the **real** Sun.
2. **The mission:** 7 real days of the Sun on a Moon or Mars base (below).
3. **The impact (after):** 5 scenes connect what the player did to real missions: their own 7-day result, NASA's HERA radiation sensor on Orion, lettuce grown on the Space Station, and NASA's planned lunar nuclear reactor (2030).
4. **Ask Nova (anytime):** kids tap a question or ask out loud; Nova answers from 22 ready answers (science and how-to-play), offline. Any mic button works: a question ("why is the Sun dangerous?") opens Nova's answer, a command ("two shields", "night") plays the game.

## How to play (30 seconds)
1. Press **Play**, pick **Moon** (easier) or **Mars** (harder), pick a real Sun week or "Surprise me".
2. Read Nova's morning message: how much power the Sun gave, and Earth's storm forecast.
3. Tap machines to spend power. The marks on the meters show what will happen at the end of the day.
4. Press **Night** (Mars) or **Shadow time** (Moon): the crew breathes, life support uses the battery, and the *real* Sun hits. A green **For tonight** box shows how many bolts will be saved; it turns red when nothing is left for the heaters. Nova warns when 1 bolt is left, and when all power is used she points at the Night button, which pulses.
5. After 7 days, see your timeline, what you learned, and which real week of the Sun you survived.

## The trade-offs (what kids actually learn)
| Mechanic | Real constraint it mirrors |
|---|---|
| Air drops by 2 every day; exploring uses 1 more | Life support is consumed continuously; EVAs cost consumables |
| Greenhouse: cheaper air, but only tomorrow (max 2/day) | Bioregenerative life support is efficient but slow |
| Dirt shield: 2 power per layer, blocks particle storms | Regolith shielding; excavation costs energy |
| Leftover power → battery; life support needs 1 every day. Moon: shadow time (south pole), Mars: real night | Solar panels stop in shadow and at night. At the lunar south pole the Sun stays low and mountain shadows cover the panels for part of each day; a Mars sol has a real night every 24 h 40 min |
| Particle-storm power = real DONKI flare class + whether an SEP was detected that day | Solar Energetic Particle events are the acute radiation risk |
| Moon: exact forecast (1.3 s delay). Mars: fuzzy unless you build a radiation sensor (like NASA's HERA), 3 power | Earth–Mars light time is 3–22 min, and Earth sees the Sun from a different angle |
| Ray badge: full = crew goes home early | Crew dosimetry and dose limits |
| ⭐ Science goal (3 discoveries) | Missions exist to do science, so "everything for safety" is not a win |

Balance check (`analysis/balance_sim.js`): doing nothing, putting everything into air, or putting everything into science all fail. A balanced plan wins. Mars is harder than the Moon.

## NASA data used (and why)
| Resource | How Orbitopia uses it | Live / archived |
|---|---|---|
| **DONKI** (Space Weather Database), `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/` — FLR, SEP, CMEAnalysis | 5 real 7-day "Sun weeks" (8–14 May 2024, 3–9 Oct 2024, 4–10 Sep 2017, 5–11 Nov 2025, 5–11 Nov 2026) drive every storm. Each night report shows the real flare class, peak time, SEP detection time, and CME speed, plus a straight-line estimate of how long the CME would take to reach the Moon or Mars. On start-up the app also tries to fetch the **last 7 days live** and offers them as a playable week. | Live if DONKI answers (7 s timeout), otherwise the embedded snapshot from 14 Nov 2026, labelled ARCHIVED |
| **OSDR RadLab** (ISS dosimetry), `https://visualization.osdr.nasa.gov/radlab/api/` | Real DosTel1 absorbed dose rate (µGy/h) for 3 hours on a quiet day (20 Apr 2024) and a storm day (11 May 2024), drawn as a chart in "Real NASA Science". Teaches that Earth's magnetic field shields the ISS, while the Moon and Mars have no global field. | Archived (embedded CSV in `data/`) |
| NASA **HERA** (Orion radiation sensor) — https://www.nasa.gov/general/artemis-i-space-radiation-research-to-help-moon-mars-explorers/ | Model for the in-game radiation sensor; impact scene | Reference |
| NASA & DOE lunar reactor by 2030 — https://www.nasa.gov/news-release/nasa-department-of-energy-to-develop-lunar-surface-reactor-by-2030 | "Did you know?" fact and impact scene | Reference |
| NASA **InSight** (solar-powered Mars lander) — https://www.nasa.gov/insight | Why solar panels on Mars work but dust is a risk | Reference |
| NASA **LCROSS**, **LRO** and Apollo regolith findings — https://science.nasa.gov/mission/lcross/ , https://science.nasa.gov/mission/lro/ | Moon science stars: water ice in Cabeus crater, a lava-tube cave, sharp sticky dust | Reference |
| NASA **Perseverance** and **Phoenix** — https://science.nasa.gov/mission/mars-2020-perseverance/ , https://science.nasa.gov/mission/phoenix/ | Mars science stars: Jezero's ancient lake and delta, ice under the soil, the "leopard spot" rock | Reference |
| **OSDR** (Open Science Data Repository) search API | Study IDs behind the "Did you know?" cards: OSD-269 (lettuce grown on the ISS), OSD-342 / OSD-326 (muscle and bone loss in mice), OSD-360 / OSD-334 (simulated space radiation), OSD-59 (Mizuna greens grown on the ISS) | Archived (curated) |
| **Mars Trek** | Base site (Jezero Crater) and Mars surface context | Reference |
| Curiosity **RAD** (NASA MSL; Hassler et al., *Science* 2014) | 0.64 mSv/day on the Mars surface | Published value |
| Chang'e-4 **LND** (Zhang et al., *Science Advances* 2020) | 1,369 µSv/day on the Moon's surface (≈2.6× the ISS) | Published value (non-NASA, cited) |
| **CSA partner resource**: Food production on the Moon | Greenhouse framing and teacher link | Reference |

Re-check every number with `analysis/orbitopia_data_check.ipynb` (it runs in Google Colab).

## Tech
Plain HTML + CSS + JavaScript (ES2020), no frameworks and no build step. Web Speech API (speech synthesis + speech recognition), WebAudio sound effects, a sticker-style SVG icon set and characters drawn in code, service worker for offline play, and `localStorage` for badges and settings only.

```
index.html  css/style.css  js/{i18n,data,content,icons,art,voice,guide,engine,app}.js  sw.js  manifest.webmanifest
data/       raw archived CSV/JSON pulled from NASA APIs
analysis/   Colab notebook that re-fetches and re-checks the data
```

Run locally: `python -m http.server` in this folder, then open `http://localhost:8000` (or copy the folder into WAMP's `www`).
Deploy: GitHub Pages (Settings → Pages → branch `main`, root) or Netlify Drop. Both give a public HTTPS link, and HTTPS is needed for the microphone and offline mode.

## Use of SI (synthetic intelligence) tools — disclosure
- **Claude (Anthropic)** helped write the code, the bilingual text, the data curation and this document. The team reviewed and tested all of it.
- **Illustrations:** Nova the astronaut, the Moon, Mars, Sun, Earth, base, greenhouse, solar panel, dish, rover and all icons are original vector drawings written in code (`js/art.js`, `js/icons.js`) with Claude's help, based on the team's own Pinterest mood board. **No AI image generator, no stock images and no NASA logos** are used, so no image watermark is needed; this AI assistance is declared here, in `index.html` metadata and in the in-app "For grown-ups" panel.

- File headers and the `<meta name="ai-assistance">` tag in `index.html` also state this.

## Credits and resources
- Nunito font, SIL Open Font License 1.1 (via @fontsource/nunito)
- Illustrations and icons: original vector SVG drawn in code (see Use of SI). No emoji, no stock images, no image generator.
- NASA DONKI, NASA OSDR, NASA OSDR RadLab, NASA Mars Trek, CSA youth resources
- Hassler, D.M. et al. (2014) *Mars' Surface Radiation Environment Measured with the MSL Curiosity Rover*, Science 343. doi:10.1126/science.1244797
- Zhang, S. et al. (2020) *First measurements of the radiation dose on the lunar surface*, Science Advances 6. doi:10.1126/sciadv.aaz1334

## Privacy
Nothing is sent to the team. The microphone is optional. In Chrome, speech recognition is processed by the browser's own speech service. No personal data is collected, which matters for an audience aged 7–12.
