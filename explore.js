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
 * A topic page suggests a path (not enforced, nothing is locked): 1 Learn -> 2 Quick 10 -> 3 Challenge 20 -> 4 Mastery, then
 * More ways to practice (Lightning Round, Fact Check, Sort It). ACTIVITIES (below) defines them. Each carries a `tier` and
 * goes through activityState(), so a future free/pro lock is a one-line change, not a redesign.
 * Quick 10, Challenge 20 and Mastery are NOT separate engines: they call startQuiz() (quiz.js) with a question count.
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

/* Questions per round for the practice games in Student Explore. FIXED: Explore never inherits the round count a teacher
   saved for the kiosk. (Quick 10 / Challenge 20 / Mastery set their own counts, below.) */
const EXPLORE_ROUNDS = 10, QUICK_N = 10, CHALLENGE_N = 20;

/* The play context Explore hands to the game engines. Only the timer option (an accessibility setting) is taken from
   the teacher's saved settings on this device; read-aloud is on for K-2. */
function exploreCtx(unitId, topicId){
  const band = exploreBand(), saved = settings || {};
  return { band:band, unit:unitId, topic:topicId || null, rounds:EXPLORE_ROUNDS, speak:band === 'k2', timer:saved.timer || 'normal', explore:true };
}

/* ---------- activities offered on a topic page ----------
   role "learn" and "test" form the suggested path (step 1-4); role "practice" tiles sit under "More ways to practice".
   tier is "free" for everything today. text(t, band, k2) may build the description from the topic. */
const ACTIVITIES = [
  { id:'learn',     role:'learn',    step:1, el:'mLearn',     icon:'📖', name:'Learn',           tier:'free',
    text:function(t, band, k2){ const n = learnFor(t.id, band).length; return k2 ? 'Read and learn.' : n + ' short cards. Learn the key ideas first.'; },
    available:function(t, band){ return learnFor(t.id, band).length > 0; }, start:function(t){ startLearn(t); } },
  { id:'quick10',   role:'test',     step:2, el:'mQuick',     icon:'🎯', name:'Quick 10',        tier:'free', desc:'Ten questions. See why after each one.', descK2:'Ten questions.',
    available:function(){ return true; }, start:function(){ startQuiz({ kind:'quick10', n:QUICK_N, strict:true }); } },
  { id:'challenge', role:'test',     step:3, el:'mChallenge', icon:'🏅', name:'Challenge 20',    tier:'free', desc:'Twenty questions. A longer round.', descK2:'Twenty questions.',
    available:function(){ return true; }, start:function(){ startQuiz({ kind:'challenge', n:CHALLENGE_N, strict:true }); } },
  { id:'mastery',   role:'test',     step:4, el:'mMastery',   icon:'🏆', name:'Mastery', nameK2:'Master It', tier:'free', desc:'Score ' + MASTERY_PERCENT + '% to master this topic.', descK2:'Get 8 out of 10.',
    available:function(){ return true; }, start:function(t){ renderMasteryIntro(t); } },
  { id:'lightning', role:'practice', el:'mLr',   icon:'⚡', name:'Lightning Round', tier:'free', desc:'Answer as many as you can before time runs out.', descK2:'Race the clock.',   available:function(){ return true; },                              start:function(){ startLightning(); } },
  { id:'fact',      role:'practice', el:'mFact', icon:'🕵️', name:'Fact Check',      tier:'free', desc:'Someone gave an answer. Is it right or wrong?',   descK2:'Right or wrong?',   available:function(){ return true; },                              start:function(){ startFact(); } },
  { id:'sort',      role:'practice', el:'mSort', icon:'🗂️', name:'Sort It',         tier:'free', desc:'Put each one in the right group.',                descK2:'Put it in a group.', available:function(){ return sortSetsFor(play.band).length > 0; }, start:function(){ startSort(); } }
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
  const lock = exploreNow.s === 'home' || exploreNow.s === 'grade';       /* the full brand lockup shows on home and first use only */
  const head = `<div class="top${lock ? ' lockup' : ''}"><button class="brandbtn" id="homeBtn" aria-label="Bench Boost home">${brandMark(lock)}</button><button class="iconbtn" id="gear" aria-label="Teacher settings (PIN required)" title="Teacher settings">⚙️</button></div>`;
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
    <div class="hubhead"><div>
    <h1>${k2 ? 'What do you want to learn?' : 'What do you want to learn today?'}</h1></div>${hubSpeakBtn()}</div>
    ${gradeLine(band)}
    <div class="subjects">
      <button class="subject pe" id="sPE"><span class="sicon" aria-hidden="true">${P.icon}</span><span class="stext"><span class="stitle">${P.name}</span><span class="sdesc">${esc(k2 ? P.blurbK2 : P.blurb)}</span></span></button>
      <button class="subject health" id="sHealth"><span class="sicon" aria-hidden="true">${H.icon}</span><span class="stext"><span class="stitle">${H.name}</span><span class="sdesc">${esc(k2 ? H.blurbK2 : H.blurb)}</span></span></button>
    </div>
    <h2 class="minor">Student tools</h2>
    <button class="tool" id="mRep"><span class="ticon2" aria-hidden="true">📝</span><span class="ttext2"><span class="tname2">Bench Reporter</span>${k2 ? '' : '<span class="tdesc2">Watch your class and write what you see.</span>'}</span></button>
    <div class="homefoot">
      <p class="center teacherline"><button class="linkbtn" id="teacherMode"><span aria-hidden="true">🔒</span> Teacher Mode<span class="sr-only"> (teacher settings, PIN required)</span></button></p>
      ${themeControlHTML()}
    </div>
  </div>`;
  bindGear(); bindGradeLine(); bindThemeControl(); bindHubSpeak('What do you want to learn? Physical Education. ' + P.blurbK2 + ' Health. ' + H.blurbK2);
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
      return `<button class="topic ${subj === 'PE' ? 'pe' : 'health'}" id="t_${t.id}" data-t="${t.id}"><span class="ticon" aria-hidden="true">${t.icon}</span><span class="ttext"><span class="tname">${esc(t.name)}</span><span class="tdesc">${esc(k2 ? t.blurbK2 : t.blurb)}</span>${isMastered(band, t.id) ? '<span class="mbadge">✓ Mastered</span>' : ''}</span></button>`; }).join('')}</div>
  </div>`;
  bindGear(); bindGradeLine(); bindHubSpeak(S.name + '. ' + topics.map(function(t){ return t.name; }).join('. '));
  app.querySelectorAll('[data-t]').forEach(function(b){ b.onclick = function(){ exploreGo({ s:'topic', topic:b.dataset.t }); }; });
}

/* ---------- screen 4: a topic page ---------- */
/* Free / Pro / Locked visual states. Everything is free and open today, so this returns '' and NO badge or lock is shown.
   When activityState() starts returning "locked" (or an activity's tier becomes "pro") the badge appears with no redesign. */
function tierBadge(a, state){
  if(state === 'locked') return '<span class="tierbadge locked"><span aria-hidden="true">🔒</span> Locked</span>';
  return a.tier === 'pro' ? '<span class="tierbadge pro">Pro</span>' : '';
}
function activityHTML(a, t, band, k2){
  const state = activityState(a), text = a.text ? a.text(t, band, k2) : (k2 ? a.descK2 : a.desc), name = k2 && a.nameK2 ? a.nameK2 : a.name;
  if(a.role === 'learn'){
    return `<button class="actmain" id="${a.el}" data-act="${a.id}" data-state="${state}"><span class="aicon" aria-hidden="true">${a.icon}</span><span class="atext"><span class="atitle">${esc(name)}</span><span class="adesc">${esc(text)}</span></span><span class="agot" aria-hidden="true">▶</span></button>`;
  }
  const badge = (a.id === 'mastery' && isMastered(band, t.id) ? '<span class="mbadge">✓ Mastered</span>' : '') + tierBadge(a, state);
  return `<button class="act ${a.id}${a.id === 'mastery' && isMastered(band, t.id) ? ' is-mastered' : ''}${state === 'locked' ? ' is-locked' : ''}" id="${a.el}" data-act="${a.id}" data-state="${state}"><span class="aicon" aria-hidden="true">${a.icon}</span><span class="ttext"><span class="tname">${esc(name)}</span><span class="tdesc">${esc(text)}</span>${badge}</span></button>`;
}
function pathItem(a, t, band, k2){
  const done = a.id === 'mastery' && isMastered(band, t.id);                 /* only Mastery is remembered, so only it can show as done */
  return `<li class="pstep"><span class="pnum${done ? ' done' : ''}" aria-hidden="true">${done ? '✓' : a.step}</span>${activityHTML(a, t, band, k2)}</li>`;
}
function renderTopicPage(topicId){
  exploreOn = true;
  const band = exploreBand(); if(!band){ renderGradePicker(true); return; }
  const t = topicById(topicId);
  if(!t || !topicHasContent(t, band)){ showExplore({ s:'home' }); return; }
  exploreNow = Object.assign({}, exploreNow, { s:'topic', topic:t.id, subj:t.subject });
  play = exploreCtx(topicPlayId(t), t.id);                 /* so availability checks (e.g. Sort It) use this topic */
  setBandClass(band);
  const k2 = band === 'k2', acts = ACTIVITIES.filter(function(a){ return a.available(t, band); });
  const learnA = acts.filter(function(a){ return a.role === 'learn'; }), testA = acts.filter(function(a){ return a.role === 'test'; }), practice = acts.filter(function(a){ return a.role === 'practice'; });
  const mastered = isMastered(band, t.id);
  view.html = topBar(true) + `<div class="wrap explore wide">
    <div class="court topichero">
      <div class="uic" aria-hidden="true">${t.icon}</div>
      <h1>${esc(t.name)}</h1>
      <p class="tblurb">${esc(k2 ? t.blurbK2 : t.blurb)}</p>
      <div class="band">${esc(BANDS[band])}</div>${mastered ? '<div class="mbadge herobadge">✓ Mastered</div>' : ''}
      ${hubSpeakBtn()}
    </div>
    <p class="pathhint">${k2 ? 'Start with Learn!' : 'A suggested path: Learn, then Quick 10, Challenge 20 and Mastery. Jump in anywhere.'}</p>
    ${learnA.length ? `<h2 class="minor">Learn</h2><ol class="path">${learnA.map(function(a){ return pathItem(a, t, band, k2); }).join('')}</ol>` : ''}
    ${testA.length ? `<h2 class="minor">${k2 ? 'Show what you know' : 'Test yourself'}</h2><ol class="path" start="${testA[0].step}">${testA.map(function(a){ return pathItem(a, t, band, k2); }).join('')}</ol>` : ''}
    ${practice.length ? `<h2 class="minor">${k2 ? 'More games' : 'More ways to practice'}</h2><div class="acts">${practice.map(function(a){ return activityHTML(a, t, band, k2); }).join('')}</div>` : ''}
  </div>`;
  bindGear(); bindHubSpeak(t.name + '. ' + t.blurbK2);
  app.querySelectorAll('[data-act]').forEach(function(b){ b.onclick = function(){ launchActivity(t, ACTIVITIES.find(function(a){ return a.id === b.dataset.act; })); }; });
}

/* ---------- launching activities ---------- */
/* chained=true: moving from one activity straight to another (for example Learn -> Quick 10) replaces the current
   history entry instead of adding one, so the browser Back button still goes back to the topic page in one step. */
function launchActivity(t, a, chained){
  if(!a || activityState(a) !== 'open') return;
  play = exploreCtx(topicPlayId(t), t.id);
  const st = { s:'play', topic:t.id, subj:t.subject, act:a.id };
  if(chained) replaceExplore(st); else pushExplore(st);
  go(function(){ a.start(t); });
}
function chainTo(actId){
  const t = topicById(play.topic); if(!t) return;
  launchActivity(t, ACTIVITIES.find(function(a){ return a.id === actId; }), true);
}
function launchReporter(){
  play = exploreCtx(null);                                 /* Reporter has no topic */
  pushExplore({ s:'tool', tool:'reporter' });
  go(startReporter);
}
/* back to the subject's topic list (used by "Choose another topic") */
function exploreToSubject(){
  const st = history.state, t = topicById(play.topic);
  if(st && st.bb && st.d >= 2){ history.go(-2); return; }
  go(function(){ showExplore({ s:'subject', subj:t ? t.subject : 'PE' }); });
}

/* ---------- Mastery introduction ---------- */
function renderMasteryIntro(t){
  const band = play.band, k2 = band === 'k2', need = masteryNeeded(MASTERY_LENGTH), rec = getMastery(band, t.id);
  const hasLearn = learnFor(t.id, band).length > 0;
  view.html = topBar(true) + `<div class="wrap explore">
    <div class="card center" style="padding:28px 20px">
      <div style="font-size:60px" aria-hidden="true">🏆</div>
      <h1>${k2 ? 'Master ' + esc(t.name) + '!' : 'Mastery: ' + esc(t.name)}</h1>
      <p class="sub">${k2 ? `Get ${need} out of ${MASTERY_LENGTH} right.` : `Score ${MASTERY_PERCENT}% or better (${need} of ${MASTERY_LENGTH}) to master this topic.`}</p>
      <p class="sub">${k2 ? 'No clock. Take your time.' : `${MASTERY_LENGTH} questions. No timer. You will see an explanation after each answer.`}</p>
      ${rec && rec.mastered ? '<p><span class="mbadge">✓ Mastered</span> You can try again any time.</p>' : ''}
    </div>
    <div class="row"><button class="btn go" id="startM">Start Mastery</button>${hasLearn ? '<button class="btn plain" id="reviewL">Review Learn first</button>' : ''}</div>
  </div>`;
  bindGear();
  if(play.speak) speak((k2 ? 'Master ' + t.name + '. ' : 'Mastery. ') + `Get ${need} out of ${MASTERY_LENGTH} right.`);
  document.getElementById('startM').onclick = function(){ startMastery(); };
  const rl = document.getElementById('reviewL'); if(rl) rl.onclick = function(){ chainTo('learn'); };
}
function startMastery(){ go(function(){ startQuiz({ kind:'mastery', n:MASTERY_LENGTH, strict:true }); }); }

/* ---------- results for Quick 10 / Challenge 20 / Mastery ---------- */
function exploreResultText(Q, n, res){
  const k2 = play.band === 'k2', pct = n ? Q.score / n : 0;
  if(Q.kind === 'mastery'){
    return res.passed
      ? { icon:'🏆', head:'Topic Mastered!', msg:k2 ? 'You did it! You know a lot about this topic.' : 'Great work. You showed you understand this topic.' }
      : { icon:'💪', head:'Almost there!', msg:k2 ? "Let's learn a little more and try again." : 'Review the explanations and try again. You can do it.' };
  }
  const label = Q.kind === 'quick10' ? 'Quick 10' : 'Challenge ' + n;
  const msg = pct >= 0.9 ? 'Amazing work!' : pct >= 0.7 ? 'Great job!' : pct >= 0.4 ? 'Nice effort. Read the explanations and try again.' : 'Every expert started somewhere. Try Learn, then come back.';
  return { icon:Q.kind === 'quick10' ? '🎯' : '🏅', head:label + ' complete', msg:msg };
}
function renderExploreResult(){
  const Q = quiz, n = Q.qs.length, k2 = play.band === 'k2', t = topicById(play.topic);
  let res = null;
  if(Q.kind === 'mastery'){ if(!Q.saved) Q.saved = recordMastery(play.band, play.topic, Q.score, n); res = Q.saved; }
  const txt = exploreResultText(Q, n, res || {});
  let ask = '', primary = '', quiet = '';
  const hasLearn = learnFor(t.id, play.band).length > 0;
  if(Q.kind === 'quick10'){ ask = k2 ? 'Want a bigger game?' : 'Want a bigger challenge?'; primary = `<button class="btn go" id="nextA" data-next="challenge">Challenge 20</button>`; }
  else if(Q.kind === 'challenge'){ ask = k2 ? 'Ready to master it?' : "Think you've got it?"; primary = `<button class="btn go" id="nextA" data-next="mastery">Try Mastery</button>`; }
  else if(res.passed){ primary = `<button class="btn go" id="nextA" data-next="subject">Choose Another Topic</button>`; }
  else { primary = `<button class="btn go" id="nextA" data-next="mastery">Try Mastery Again</button>`; }
  quiet = (Q.kind === 'mastery' && !res.passed && hasLearn ? `<button class="btn plain" id="reviewA" data-next="learn">Review Learn</button>` : '')
        + (Q.kind !== 'mastery' ? `<button class="btn plain" id="again">Play again</button>` : '')
        + `<button class="btn plain" id="home">Back to topic</button>`;
  const cls = Q.kind === 'mastery' && res.passed ? ' mastered' : '';
  view.html = topBar(true) + `<div class="wrap explore"><div class="card center result${cls}">
    <div class="eyebrow">${esc(quizLabel(Q))} · ${esc(t.name)}</div>
    <div class="ricon" aria-hidden="true">${txt.icon}</div>
    <h1>${esc(txt.head)}</h1>
    <div class="scoreline" tabindex="-1">${Q.score} of ${n} correct</div>
    <p class="sub" style="margin:8px 0 0">${esc(txt.msg)}</p>
    ${Q.kind === 'mastery' ? `<p class="sub" style="margin:6px 0 0">${res.passed ? '<span class="mbadge">✓ Mastered</span>' : `You need ${masteryNeeded(n)} of ${n} to master this topic. ${res.record.mastered ? '<span class="mbadge">✓ Mastered</span> from before.' : ''}`}</p>` : ''}
    ${Q.qs.length < Q.want ? `<p class="sub shortnote">This topic has ${n} different questions for your grade, so this round had ${n}.</p>` : ''}
    ${ask ? `<p class="ask">${esc(ask)}</p>` : ''}
  </div>
  <div class="row primaryrow">${primary}</div>
  <div class="quietrow">${quiet}</div>
  <details class="emailmore"><summary>Share results with my teacher</summary>${sendBoxHTML('qz', '')}</details></div>`;
  bindGear();
  announce(quizLabel(Q) + ' complete. ' + Q.score + ' of ' + n + ' correct. ' + txt.head + '.');
  const first = document.getElementById('nextA'); if(first) first.focus({ preventScroll:true });
  if(play.speak) speak(txt.head + ' ' + Q.score + ' of ' + n + '. ' + txt.msg);
  app.querySelectorAll('[data-next]').forEach(function(b){ b.onclick = function(){ if(b.dataset.next === 'subject') exploreToSubject(); else chainTo(b.dataset.next); }; });
  const again = document.getElementById('again'); if(again) again.onclick = function(){ go(function(){ startQuiz(Q.opts); }); };
  document.getElementById('home').onclick = function(){ go(renderHub); };
  bindSendBox('qz',
    name => `Bench Boost results: ${name}`,
    name => [
      `Student: ${name}`,
      `Activity: ${quizLabel(Q)}`,
      `Topic: ${t.name} (${BANDS[play.band]})`,
      `Score: ${Q.score} of ${n} correct`,
      ...(Q.kind === 'mastery' ? [`Mastery: ${res.passed ? 'mastered' : 'not yet (needs ' + masteryNeeded(n) + ' of ' + n + ')'}`] : []),
      `Date: ${new Date().toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}`
    ].join('\n')
  );
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
