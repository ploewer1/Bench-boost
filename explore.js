"use strict";
/*
 * explore.js - Student Explore (Phase 2A)
 *
 * The student-directed way to use Bench Boost:
 *     Grade band  ->  Physical Education or Health  ->  Topic  ->  Topic page  ->  Activity
 *
 * It sits NEXT TO the Teacher Kiosk (renderHome in app.js), not instead of it. Both play the same question bank
 * through the same game engines (quiz.js / games.js); Explore just hands the engines a different `play` context.
 *
 * What Explore stores on the device (localStorage, never sent anywhere):
 *     sq_explore_band   the grade band the student picked ("k2" | "g35" | "g68" | "g912")
 *     sq_mode           "explore" | "kiosk"  - which experience this device opens in
 * No name, no email, no account, no progress. Nothing about Explore is written to the database.
 *
 * Navigation uses the browser's own history (history.pushState + one popstate listener), so the browser Back button
 * walks up the same map the on-screen Back button does and never drops a student out of the app mid-way.
 *
 * ACTIVITIES (below) is where Phase 2B adds Learn / Quick 10 / Challenge 20 / Mastery. Each activity carries a
 * `tier` and goes through activityState(), so a future free/pro lock is a one-line change, not a redesign.
 */

let exploreOn = false;                 /* true while a Student Explore screen (or an activity opened from one) is showing */
let exploreNow = { s:'home' };         /* the Explore screen showing now: { s:'home'|'grade'|'subject'|'topic'|'play'|'tool', subj, topic } */

const EXPLORE_BANDS = [
  ['k2',   'K–2',  'Kindergarten to 2nd grade'],
  ['g35',  '3–5',  '3rd to 5th grade'],
  ['g68',  '6–8',  '6th to 8th grade'],
  ['g912', '9–12', '9th to 12th grade']
];

/* ---------- which experience does this device open in? ---------- */
function settingsValid(){ return !!(settings && unitInfo(settings.unit) && BANDS[settings.band]); }
/* A device that already has a teacher kiosk configured keeps opening in kiosk mode (nothing changes for existing
   classrooms). A device the teacher explicitly switched to Explore, or one with no kiosk configured, opens in Explore. */
function currentMode(){
  const m = store.get('mode', null);
  if(m === 'explore') return 'explore';
  if(m === 'kiosk' && settingsValid()) return 'kiosk';
  return settingsValid() ? 'kiosk' : 'explore';
}
function exploreBand(){ const b = store.get('explore_band', null); return BANDS[b] ? b : null; }
function bandShort(b){ const e = EXPLORE_BANDS.find(x => x[0] === b); return e ? e[1] : b; }
function setBandClass(band){ document.body.className = band ? 'band-' + band : ''; }

/* ---------- topics ---------- */
function topicHasContent(t, band){ return t.units.some(function(u){ return bankFor(u, band).length > 0 || !!((GEN[u] || {})[band]); }); }
function topicsFor(subject, band){ return TOPICS.filter(function(t){ return t.subject === subject && topicHasContent(t, band); }); }

/* The play context Explore hands to the game engines. Timer and questions-per-round come from the teacher's saved
   settings on this device (so the timer accessibility option still applies); read-aloud is on for K-2. */
function exploreCtx(unitId){
  const band = exploreBand(), saved = settings || {};
  return { band:band, unit:unitId, rounds:saved.rounds || 10, speak:band === 'k2', timer:saved.timer || 'normal', explore:true };
}

/* ---------- activities offered on a topic page ----------
   role "primary" is shown large; "practice" tiles sit under "More ways to practice".
   tier is "free" for everything today. Phase 2B adds entries here (learn, quick10, challenge20, mastery). */
const ACTIVITIES = [
  { id:'quiz',      role:'primary',  el:'mQuiz', icon:'🎯', name:'Quiz',            tier:'free', desc:'Answer questions and learn why each answer is right.', descK2:'Answer questions.', available:function(){ return true; },                              start:function(){ startQuiz(); } },
  { id:'lightning', role:'practice', el:'mLr',   icon:'⚡', name:'Lightning Round', tier:'free', desc:'Answer as many as you can before time runs out.',       descK2:'Race the clock.',   available:function(){ return true; },                              start:function(){ startLightning(); } },
  { id:'fact',      role:'practice', el:'mFact', icon:'🕵️', name:'Fact Check',      tier:'free', desc:'Someone gave an answer. Is it right or wrong?',         descK2:'Right or wrong?',   available:function(){ return true; },                              start:function(){ startFact(); } },
  { id:'sort',      role:'practice', el:'mSort', icon:'🗂️', name:'Sort It',         tier:'free', desc:'Put each one in the right group.',                      descK2:'Put it in a group.', available:function(){ return sortSetsFor(play.band).length > 0; }, start:function(){ startSort(); } }
];
/* "open" today. Later: return "locked" for pro-only activities and the buttons render with a lock and explanation. */
function activityState(a){ return 'open'; }

/* ---------- navigation state (browser history) ---------- */
function hashFor(st){
  if(st.s === 'subject') return st.subj === 'PE' ? '#/pe' : '#/health';
  if(st.s === 'topic' || st.s === 'play') return '#/t/' + st.topic;
  return '#/';
}
function stampState(st, deeper){
  const cur = history.state && history.state.bb ? history.state.d : 0;
  return Object.assign({}, st, { bb:1, d:deeper ? cur + 1 : cur });
}
function pushExplore(st){ const s = stampState(st, true);  try{ history.pushState(s, '', hashFor(s)); }catch(e){} exploreNow = s; return s; }
function replaceExplore(st){ const s = stampState(st, false); try{ history.replaceState(s, '', hashFor(s)); }catch(e){} exploreNow = s; return s; }
function parseRoute(h){
  const m = /^#\/(pe|health|t\/([a-z]+))$/.exec(h || '');
  if(!m) return null;
  if(m[1] === 'pe') return { s:'subject', subj:'PE' };
  if(m[1] === 'health') return { s:'subject', subj:'Health' };
  return topicById(m[2]) ? { s:'topic', topic:m[2] } : null;
}

/* Draw the Explore screen described by a state. A "play" state cannot be resumed, so it shows its topic page. */
function showExplore(st){
  exploreOn = true;
  if(!exploreBand() && st.s !== 'grade'){ exploreNow = { s:'home' }; renderGradePicker(true); return; }
  if(st.s === 'play') st = Object.assign({}, st, { s:'topic' });
  exploreNow = st;
  if(st.s === 'grade') renderGradePicker(false);
  else if(st.s === 'subject') renderSubject(st.subj);
  else if(st.s === 'topic') renderTopicPage(st.topic);
  else renderExploreHome();
}
function exploreGo(st){ pushExplore(st); go(function(){ showExplore(exploreNow); }); }

/* Going back / home. Prefer the browser's own history so the Back button and our buttons always agree. */
function parentState(st){
  if((st.s === 'topic' || st.s === 'play') && topicById(st.topic)) return { s:'subject', subj:topicById(st.topic).subject };
  return { s:'home' };
}
function exploreBack(){
  const st = history.state;
  if(st && st.bb && st.d > 0){ history.back(); return; }
  go(function(){ showExplore(parentState(exploreNow)); });
}
function exploreHome(){
  const st = history.state;
  if(st && st.bb && st.d > 0){ history.go(-st.d); return; }
  go(function(){ showExplore({ s:'home' }); });
}
/* Called by the "More activities" / "Home" buttons on result screens (see renderHub in this file). */
function exploreReturn(){
  const st = history.state;
  if(st && st.bb && (st.s === 'play' || st.s === 'tool')){ history.back(); return; }
  go(function(){ showExplore(exploreNow.topic ? { s:'topic', topic:exploreNow.topic } : { s:'home' }); });
}
/* Where a "Home" / "More activities" button on an activity screen should land, in either experience. */
function renderHub(){ if(play && play.explore) exploreReturn(); else renderHome(); }

/* Leaving the PIN pad without entering a PIN. */
function returnToStudent(){
  if(exploreOn || currentMode() === 'explore'){ exploreOn = true; go(function(){ showExplore(exploreNow); }); }
  else go(settingsValid() ? renderHome : renderSetup);
}

window.addEventListener('popstate', function(e){
  if(!exploreOn) return;
  userActed = true;                                       /* pressing Back is a deliberate action: let focus move */
  const st = e.state && e.state.bb ? e.state : { s:'home', d:0, bb:1 };
  go(function(){ showExplore(st); });
});

/* ---------- header (replaces the kiosk header while Explore is active) ---------- */
function exploreTop(){
  const head = `<div class="top"><button class="brandbtn" id="homeBtn" aria-label="Bench Boost home"><span class="spotlogo" aria-hidden="true"></span>Bench Boost</button><button class="iconbtn" id="gear" aria-label="Teacher settings (PIN required)">⚙️</button></div>`;
  const s = exploreNow.s;
  if(s === 'home' || s === 'grade') return head;
  let back = 'Home', showHome = true;
  if(s === 'subject'){ showHome = false; }
  else if(s === 'topic'){ back = SUBJECTS[topicById(exploreNow.topic).subject].name; }
  else if(s === 'play'){ back = topicById(exploreNow.topic).name; }
  else { showHome = false; }                              /* tool (Reporter): back goes Home */
  return head + `<div class="navrow"><button class="navbtn" id="navBack" aria-label="Back to ${esc(back)}"><span aria-hidden="true">←</span> Back</button>${showHome ? `<button class="navbtn push-right" id="navHome"><span aria-hidden="true">🏠</span> Home</button>` : ''}</div>`;
}
function bindExploreNav(){
  const h = document.getElementById('homeBtn'); if(h) h.onclick = exploreHome;
  const b = document.getElementById('navBack'); if(b) b.onclick = exploreBack;
  const n = document.getElementById('navHome'); if(n) n.onclick = exploreHome;
}

/* ---------- small helpers for the screens ---------- */
function hubSpeakBtn(){ return canSpeak && exploreBand() === 'k2' ? `<button class="speak hubspeak" id="hubSay" aria-label="Read this screen aloud">🔊</button>` : ''; }
function bindHubSpeak(text){ const b = document.getElementById('hubSay'); if(b) b.onclick = function(){ speak(text); }; }
function gradeLine(band){
  return `<p class="gradeline"><span>${esc(BANDS[band])}</span><span aria-hidden="true">·</span><button class="linkbtn inline" id="changeGrade">Change<span class="sr-only"> grade band</span></button></p>`;
}
function bindGradeLine(){ const c = document.getElementById('changeGrade'); if(c) c.onclick = function(){ exploreGo({ s:'grade' }); }; }

/* ---------- screen 1: choose a grade band ---------- */
function renderGradePicker(first){
  exploreOn = true;
  const cur = exploreBand();
  setBandClass(null);
  view.html = topBar(true) + `<div class="wrap explore">
    <p class="eyebrow">${first ? 'Welcome to Bench Boost' : 'Bench Boost'}</p>
    <h1>${first ? 'What grade are you in?' : 'Choose your grade'}</h1>
    <div class="gradegrid" role="group" aria-label="Grade bands">${EXPLORE_BANDS.map(function(b){
      const on = cur === b[0];
      return `<button class="gradebtn" data-g="${b[0]}" aria-pressed="${on}"><span class="glabel">${b[1]}</span><span class="gsub">${b[2]}</span>${on ? '<span class="gcur">✓ Your grade</span>' : ''}</button>`; }).join('')}</div>
    <p class="hint center">Only saved on this device. No name or account needed.</p>
    ${!first && cur ? '<p class="center"><button class="linkbtn" id="gradeCancel">Never mind</button></p>' : ''}
  </div>`;
  bindGear();
  app.querySelectorAll('[data-g]').forEach(function(b){ b.onclick = function(){
    store.set('explore_band', b.dataset.g);
    announce('Grade band set to ' + BANDS[b.dataset.g] + '.');
    if(first){ replaceExplore({ s:'home' }); go(renderExploreHome); } else exploreBack();
  }; });
  const c = document.getElementById('gradeCancel'); if(c) c.onclick = exploreBack;
}

/* ---------- screen 2: Student Explore home ---------- */
function renderExploreHome(){
  exploreOn = true;
  const band = exploreBand(); if(!band){ renderGradePicker(true); return; }
  exploreNow = { s:'home' };
  setBandClass(band);
  const k2 = band === 'k2', P = SUBJECTS.PE, H = SUBJECTS.Health;
  view.html = topBar(true) + `<div class="wrap explore">
    <div class="hubhead"><div><p class="eyebrow">Health &amp; PE Learning Games</p>
    <h1>${k2 ? 'What do you want to learn?' : 'What do you want to learn today?'}</h1></div>${hubSpeakBtn()}</div>
    ${gradeLine(band)}
    <div class="subjects">
      <button class="subject pe" id="sPE"><span class="sicon" aria-hidden="true">${P.icon}</span><span class="stext"><span class="stitle">${P.name}</span><span class="sdesc">${esc(k2 ? P.blurbK2 : P.blurb)}</span></span></button>
      <button class="subject health" id="sHealth"><span class="sicon" aria-hidden="true">${H.icon}</span><span class="stext"><span class="stitle">${H.name}</span><span class="sdesc">${esc(k2 ? H.blurbK2 : H.blurb)}</span></span></button>
    </div>
    <h2 class="minor">Student tools</h2>
    <button class="tool" id="mRep"><span class="ticon2" aria-hidden="true">📝</span><span class="ttext2"><span class="tname2">Bench Reporter</span>${k2 ? '' : '<span class="tdesc2">Watch your class and write what you see.</span>'}</span></button>
    <p class="center teacherline"><button class="linkbtn" id="teacherMode"><span aria-hidden="true">🔒</span> Teacher Mode</button></p>
  </div>`;
  bindGear(); bindGradeLine(); bindHubSpeak('What do you want to learn? Physical Education. ' + P.blurbK2 + ' Health. ' + H.blurbK2);
  document.getElementById('sPE').onclick = function(){ exploreGo({ s:'subject', subj:'PE' }); };
  document.getElementById('sHealth').onclick = function(){ exploreGo({ s:'subject', subj:'Health' }); };
  document.getElementById('mRep').onclick = launchReporter;
  document.getElementById('teacherMode').onclick = function(){ stopSpeak(); renderPin(renderSetup); };
}

/* ---------- screen 3: topics for a subject ---------- */
function renderSubject(subj){
  exploreOn = true;
  const band = exploreBand(); if(!band){ renderGradePicker(true); return; }
  const S = SUBJECTS[subj], k2 = band === 'k2', topics = topicsFor(subj, band);
  exploreNow = { s:'subject', subj:subj };
  setBandClass(band);
  view.html = topBar(true) + `<div class="wrap explore wide">
    <div class="hubhead ${subj === 'PE' ? 'pe' : 'health'}"><div><p class="eyebrow">${subj === 'PE' ? 'Physical Education' : 'Health'}</p>
    <h1>${k2 ? 'Pick a topic' : 'Choose a topic'}</h1></div>${hubSpeakBtn()}</div>
    ${gradeLine(band)}
    <div class="topics">${topics.map(function(t){
      return `<button class="topic ${subj === 'PE' ? 'pe' : 'health'}" id="t_${t.id}" data-t="${t.id}"><span class="ticon" aria-hidden="true">${t.icon}</span><span class="ttext"><span class="tname">${esc(t.name)}</span><span class="tdesc">${esc(k2 ? t.blurbK2 : t.blurb)}</span></span></button>`; }).join('')}</div>
  </div>`;
  bindGear(); bindGradeLine(); bindHubSpeak(S.name + '. ' + topics.map(function(t){ return t.name; }).join('. '));
  app.querySelectorAll('[data-t]').forEach(function(b){ b.onclick = function(){ exploreGo({ s:'topic', topic:b.dataset.t }); }; });
}

/* ---------- screen 4: a topic page ---------- */
function activityHTML(a, k2){
  const state = activityState(a), text = k2 ? a.descK2 : a.desc;
  if(a.role === 'primary'){
    return `<button class="actmain" id="${a.el}" data-act="${a.id}" data-state="${state}"><span class="aicon" aria-hidden="true">${a.icon}</span><span class="atext"><span class="atitle">${esc(a.name)}</span><span class="adesc">${esc(text)}</span></span><span class="agot" aria-hidden="true">▶</span></button>`;
  }
  return `<button class="act ${a.id}" id="${a.el}" data-act="${a.id}" data-state="${state}"><span class="aicon" aria-hidden="true">${a.icon}</span><span class="ttext"><span class="tname">${esc(a.name)}</span><span class="tdesc">${esc(text)}</span></span></button>`;
}
function renderTopicPage(topicId){
  exploreOn = true;
  const band = exploreBand(); if(!band){ renderGradePicker(true); return; }
  const t = topicById(topicId);
  if(!t || !topicHasContent(t, band)){ showExplore({ s:'home' }); return; }
  exploreNow = Object.assign({}, exploreNow, { s:'topic', topic:t.id, subj:t.subject });
  play = exploreCtx(topicPlayId(t));                       /* so availability checks (e.g. Sort It) use this topic */
  setBandClass(band);
  const k2 = band === 'k2', acts = ACTIVITIES.filter(function(a){ return a.available(); });
  const primary = acts.filter(function(a){ return a.role === 'primary'; }), practice = acts.filter(function(a){ return a.role === 'practice'; });
  view.html = topBar(true) + `<div class="wrap explore wide">
    <div class="court topichero">
      <div class="uic" aria-hidden="true">${t.icon}</div>
      <h1>${esc(t.name)}</h1>
      <p class="tblurb">${esc(k2 ? t.blurbK2 : t.blurb)}</p>
      <div class="band">${esc(BANDS[band])}</div>
      ${hubSpeakBtn()}
    </div>
    ${primary.map(function(a){ return activityHTML(a, k2); }).join('')}
    ${practice.length ? `<h2 class="minor">${k2 ? 'More games' : 'More ways to practice'}</h2><div class="acts">${practice.map(function(a){ return activityHTML(a, k2); }).join('')}</div>` : ''}
  </div>`;
  bindGear(); bindHubSpeak(t.name + '. ' + t.blurbK2);
  app.querySelectorAll('[data-act]').forEach(function(b){ b.onclick = function(){ launchActivity(t, ACTIVITIES.find(function(a){ return a.id === b.dataset.act; })); }; });
}

/* ---------- launching activities ---------- */
function launchActivity(t, a){
  if(!a || activityState(a) !== 'open') return;
  play = exploreCtx(topicPlayId(t));
  pushExplore({ s:'play', topic:t.id, subj:t.subject, act:a.id });
  go(a.start);
}
function launchReporter(){
  play = exploreCtx(null);                                 /* Reporter has no topic */
  pushExplore({ s:'tool', tool:'reporter' });
  go(startReporter);
}

/* ---------- entry point ---------- */
function startExplore(){
  exploreOn = true;
  store.set('mode', 'explore');
  const route = parseRoute(location.hash);
  replaceExplore({ s:'home' });
  if(!exploreBand()){ renderGradePicker(true); return; }
  /* opening a saved link (#/t/fitness): rebuild the trail so Back walks up Home > subject > topic */
  if(route && route.s === 'subject') pushExplore(route);
  else if(route && route.s === 'topic'){ pushExplore({ s:'subject', subj:topicById(route.topic).subject }); pushExplore(route); }
  showExplore(exploreNow);
}
