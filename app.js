"use strict";
/*
 * app.js - shared helpers, the teacher-kiosk student home screen, and the start-up call.
 * Loaded LAST so every other file's functions exist before boot() runs.
 */
/* ---------- helpers ---------- */
const app = document.getElementById('app');
const canSpeak = 'speechSynthesis' in window;
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
/* A unit id, a review mix, or a Student Explore topic that combines several units (id "topic:<topic id>"). */
function unitInfo(id){
  const t = typeof id === 'string' && id.indexOf('topic:') === 0 ? TOPICS.find(x => 'topic:' + x.id === id) : null;
  if(t) return { id:id, name:t.name, icon:t.icon, cat:t.subject };
  return UNITS.find(u=>u.id===id) || MIX.find(m=>m.id===id);
}
function unitsFor(id){
  if(id==='mix-pe') return UNITS.filter(u=>u.cat==='PE');
  if(id==='mix-health') return UNITS.filter(u=>u.cat==='Health');
  if(id==='mix-all') return UNITS;
  if(typeof id === 'string' && id.indexOf('topic:') === 0){ const t = TOPICS.find(x => 'topic:' + x.id === id); return t ? UNITS.filter(u => t.units.indexOf(u.id) >= 0) : []; }
  return UNITS.filter(u=>u.id===id);
}
function speak(text){
  if(!canSpeak) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,''));
    u.rate = play && play.band==='k2' ? 0.9 : 1;
    speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeak(){ if(canSpeak){ try{ speechSynthesis.cancel(); }catch(e){} } }
function bestKey(){ return 'best_'+play.band+'_'+play.unit; }
/* The Bench Boost mark. lockup=true (Explore home and first use) adds the product line and the parent-brand attribution.
   "by Evolution PE" is ONE replaceable slot (.parentbrand): a future Evolution PE logo can replace that span without touching layout. */
function brandMark(lockup){
  return `<span class="spotlogo" aria-hidden="true"></span><span class="brandtext"><span class="brandname">Bench Boost</span>${lockup ? `<span class="brandline">Health &amp; PE Learning Games</span><span class="byline">by <span class="parentbrand">Evolution PE</span></span>` : ''}</span>`;
}
function topBar(studentMode){
  if(studentMode && exploreOn) return exploreTop();          /* Student Explore has its own header + Back/Home row (explore.js) */
  return `<div class="top"><div class="brand">${brandMark(false)}</div>${
    studentMode ? `<button class="iconbtn" id="gear" aria-label="Teacher settings (PIN required)">⚙️</button>` : `<span class="toptag">Teacher setup</span>`}</div>`;
}
function bindGear(){
  const g=document.getElementById('gear'); if(g) g.onclick=()=>{ stopSpeak(); renderPin(renderSetup); };
  if(typeof bindExploreNav === 'function') bindExploreNav();
}
function go(fn){ stopSpeak(); clearTimers(); fn(); window.scrollTo(0,0); }


/* ---------- student home ---------- */
/* Teacher kiosk home: the grade band and topic the teacher chose (unchanged from before Student Explore existed). */
function renderHome(){
  play = settings;                       /* the engines play whatever the teacher configured */
  document.body.className = 'band-'+settings.band;
  const u = unitInfo(settings.unit);
  const best = store.get(bestKey(), 0);
  view.html = topBar(true) + `<div class="wrap">
    <div class="court">
      <div class="uic">${u.icon}</div>
      <h1>${esc(u.name)}</h1>
      <div class="band">${BANDS[settings.band]}</div>
      ${best?`<div class="best">Your best: ${best} points</div>`:''}
    </div>
    <div class="modes">
      <button class="mode quiz" id="mQuiz"><span class="big">🎯</span><span class="t">Quiz Challenge</span><span class="d">Answer questions and build a streak.</span></button>
      <button class="mode lightning" id="mLr"><span class="big">⚡</span><span class="t">Lightning Round</span><span class="d">Answer as many as you can before time runs out.</span></button>
      <button class="mode fact" id="mFact"><span class="big">🕵️</span><span class="t">Fact Check</span><span class="d">Someone gave an answer. Is it right or wrong?</span></button>
      ${sortSetsFor(settings.band).length?`<button class="mode sort" id="mSort"><span class="big">🗂️</span><span class="t">Sort It</span><span class="d">Put each one in the right group.</span></button>`:''}
      <button class="mode rep" id="mRep"><span class="big">📝</span><span class="t">Bench Reporter</span><span class="d">Watch your class and report what you see.</span></button>
    </div>
  </div>`;
  bindGear();
  document.getElementById('mQuiz').onclick=()=>go(startQuiz);
  document.getElementById('mLr').onclick=()=>go(startLightning);
  document.getElementById('mFact').onclick=()=>go(startFact);
  const mS=document.getElementById('mSort'); if(mS) mS.onclick=()=>go(startSort);
  document.getElementById('mRep').onclick=()=>go(startReporter);
}


/* ---------- start ---------- */
boot();
