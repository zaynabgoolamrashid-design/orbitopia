// Balance test: run with  node analysis/balance_sim.js  (from the analysis folder: cd analysis && node balance_sim.js)
global.window = {};
const E = require('../js/engine.js');
require('../js/data.js'); require('../js/content.js');
const D = window.ORB_DATA, C = window.ORB_CONTENT;
function play(site, week, policy, seed){
  const g = E.newGame(site, week, C.events, seed);
  while(!g.over){ E.startSol(g); if(g.today.event && g.today.event.kind==='choice') E.answerEvent(g, policy.event?policy.event(g):false); policy.act(g); E.endSol(g);} 
  return g;
}
const policies = {
  nothing: {act(g){}},
  allAir: {act(g){ while(E.add(g,'air').ok); }},
  allScience: {act(g){ while(E.add(g,'science').ok); }},
  balanced: {event:g=>E.left(g)>=4, act(g){
    const t=g.today;
    // keep 1 for heater
    const fc = t.forecast;
    const threat = fc.known ? fc.level : 2;
    while(g.shield + t.alloc.shield < Math.min(threat,4) && E.left(g)>=3) if(!E.add(g,'shield').ok) break;
    if (g.air < 5) { E.add(g,'air'); }
    E.add(g,'plants'); if(g.air<6) E.add(g,'plants');
    if (g.site==='mars' && !g.alarm && E.left(g)>=4) E.add(g,'alarm');
    if (E.left(g)>=3 && g.air>=4 && !(fc.known && fc.level>0)) E.add(g,'science');
  }},
};
for (const site of ['moon','mars']) for (const [pn,p] of Object.entries(policies)) {
  const res={done:0,air:0,rad:0,stars:0,n:0,rad_tot:0};
  for (const w of D.weeks) for (let s=1;s<=40;s++){ const g=play(site,w,p,s*7+w.id.length); res[g.over]++; res.stars+=g.stars; res.rad_tot+=g.rad; res.n++; }
  console.log(site.padEnd(5), pn.padEnd(11), 'done',res.done,'air',res.air,'rad',res.rad,'avgStars',(res.stars/res.n).toFixed(1),'avgRad',(res.rad_tot/res.n).toFixed(1));
}
for (const w of D.weeks) console.log(w.id, w.days.map(d=>E.stormLevel(d)).join(','));
