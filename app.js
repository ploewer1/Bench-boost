"use strict";
/*
 * app.js - shared helpers, the student home screen, and the start-up call.
 * Loaded LAST so every other file's functions exist before boot() runs.
 */
/* ---------- helpers ---------- */
const app = document.getElementById('app');
const canSpeak = 'speechSynthesis' in window;
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function unitInfo(id){ return UNITS.find(u=>u.id===id) || MIX.find(m=>m.id===id); }
function unitsFor(id){
  if(id==='mix-pe') return UNITS.filter(u=>u.cat==='PE');
  if(id==='mix-health') return UNITS.filter(u=>u.cat==='Health');
  if(id==='mix-all') return UNITS;
  return UNITS.filter(u=>u.id===id);
}
function speak(text){
  if(!canSpeak) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,''));
    u.rate = settings && settings.band==='k2' ? 0.9 : 1;
    speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeak(){ if(canSpeak){ try{ speechSynthesis.cancel(); }catch(e){} } }
function bestKey(){ return 'best_'+settings.band+'_'+settings.unit; }
function topBar(studentMode){
  return `<div class="top"><div class="brand"><span class="spotlogo" aria-hidden="true"></span>Bench Boost</div>${
    studentMode ? `<button class="iconbtn" id="gear" aria-label="Teacher settings (PIN required)">⚙️</button>` : `<span class="toptag">Teacher setup</span>`}</div>`;
}
function bindGear(){ const g=document.getElementById('gear'); if(g) g.onclick=()=>{ stopSpeak(); renderPin(renderSetup); }; }
function go(fn){ stopSpeak(); clearTimers(); fn(); window.scrollTo(0,0); }


/* ---------- student home ---------- */
function renderHome(){
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
      <button class="mode rep" id="mRep"><span class="big">📝</span><span class="t">Sideline Reporter</span><span class="d">Watch your class and report what you see.</span></button>
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
