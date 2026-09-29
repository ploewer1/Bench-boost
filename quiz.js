"use strict";
/*
 * quiz.js - the question engine and Quiz Challenge.
 *
 * WRITTEN questions come from data/questions.js (permanent IDs, status "unreviewed").
 * GENERATED questions come from data/generators.js (template IDs, origin "generated").
 * draw() mixes them: unseen written questions first, then freshly generated ones. A written question
 * is only repeated after every written question for that topic and grade band has been used.
 */
const BANK_INDEX = {};   /* BANK_INDEX[topic][gradeBand] = [question records] */
QUESTION_BANK.forEach(function(r){
  BANK_INDEX[r.topic] = BANK_INDEX[r.topic] || {};
  BANK_INDEX[r.topic][r.gradeBand] = BANK_INDEX[r.topic][r.gradeBand] || [];
  if(r.status !== 'retired') BANK_INDEX[r.topic][r.gradeBand].push(r);
});
function bankFor(topic, band){ return (BANK_INDEX[topic] || {})[band] || []; }

function toQ(u, r, extra){
  return { id:r.id, templateId:null, q:r.question, correct:r.correctAnswer, opts:shuffle(r.choices.slice()), exp:r.explanation,
           unit:u.name, icon:u.icon, extra:!!extra, gen:false };
}
function toGenQ(u, t, x){
  return { id:null, templateId:t.id, q:x[0], correct:x[1], opts:shuffle([x[1]].concat(x[2])), exp:x[3],
           unit:u.name, icon:u.icon, extra:false, gen:true };
}

let seenMem = null;
function seenKey(){ return 'seen2_' + play.band + '_' + play.unit; }   /* stores question IDs */
function markSeen(q){
  if(q.gen || q.extra || !q.id) return;
  const k = seenKey();
  if(!seenMem || seenMem.k !== k) seenMem = { k:k, set:new Set(store.get(k, [])) };
  seenMem.set.add(q.id); store.set(k, Array.from(seenMem.set));
}
function genFor(){
  const out = [];
  unitsFor(play.unit).forEach(function(u){ ((GEN[u.id] || {})[play.band] || []).forEach(function(t){ out.push({ u:u, t:t }); }); });
  return out;
}
/* Draw n questions for the current unit and grade band. lazy=true delays "seen" marking until each is shown. */
function draw(n, lazy){
  const band = play.band, main = unitsFor(play.unit), stat = [];
  main.forEach(function(u){ bankFor(u.id, band).forEach(function(r){ stat.push(toQ(u, r, false)); }); });
  const gens = genFor(), k = seenKey();
  let seen = new Set(store.get(k, []));
  let unseen = stat.filter(function(q){ return !seen.has(q.id); });
  if(!unseen.length && stat.length){ seen = new Set(); store.set(k, []); unseen = stat.slice(); }
  seenMem = { k:k, set:seen };
  const wantGen = gens.length ? Math.round(n * 0.4) : 0;
  const chosen = [], texts = new Set();
  const add = function(q){ if(texts.has(q.q)) return false; texts.add(q.q); chosen.push(q); return true; };
  shuffle(unseen).slice(0, n - wantGen).forEach(add);
  let guard = 0;
  while(chosen.length < n && gens.length && guard++ < n * 30){ const g = pick(gens); add(toGenQ(g.u, g.t, g.t.fn())); }
  if(chosen.length < n) shuffle(stat).forEach(function(q){ if(chosen.length < n) add(q); });
  if(chosen.length < n && main.length === 1){
    const extra = [];
    UNITS.filter(function(u){ return u.cat === main[0].cat && u.id !== main[0].id; }).forEach(function(u){ bankFor(u.id, band).forEach(function(r){ extra.push(toQ(u, r, true)); }); });
    shuffle(extra).forEach(function(q){ if(chosen.length < n) add(q); });
  }
  if(!lazy) chosen.forEach(markSeen);
  return shuffle(chosen);
}

/* ---------- quiz ---------- */
function startQuiz(){
  const qs = draw(play.rounds);
  quiz = { qs, i:0, score:0, pts:0, streak:0, results:[], answered:false, pick:null, spoken:false };
  renderQuiz();
}
function readQuestion(cur){ speak(cur.q + '. ' + cur.opts.map((o,k)=>'ABCD'[k]+'. '+o).join('. ')); }
function renderQuiz(){
  const Q = quiz, cur = Q.qs[Q.i], mix = play.unit.startsWith('mix');
  const right = Q.answered && cur.opts[Q.pick]===cur.correct;
  const track = Q.qs.map((_,k)=>`<i class="${k<Q.results.length?(Q.results[k]?'ok':'no'):(k===Q.i?'now':'')}"></i>`).join('');
  const answers = cur.opts.map((o,k)=>{
    let c = '';
    if(Q.answered){ c = o===cur.correct ? 'right' : (k===Q.pick ? 'wrong' : 'dim'); }
    return `<button class="ans a${k%4} ${c}" data-k="${k}" ${Q.answered?'disabled':''}><span class="spot">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`;
  }).join('');
  const last = Q.i===Q.qs.length-1;
  view.html = topBar(true) + `<div class="wrap">
    <div class="qbar"><span>Question ${Q.i+1} of ${Q.qs.length}</span><span>${Q.pts} points${Q.streak>=2?` <span class="streak">🔥 ${Q.streak} in a row</span>`:''}</span></div>
    <div class="track">${track}</div>
    <div class="card qcard">
      <div class="qhead"><div>${(mix||cur.extra)?`<span class="qtag">${cur.extra?'Review: ':''}${cur.icon} ${esc(cur.unit)}</span>`:''}<p class="qtext" tabindex="-1"><span class="sr-only">Question ${Q.i+1} of ${Q.qs.length}. </span>${esc(cur.q)}</p></div>
      ${canSpeak?`<button class="speak" id="say" aria-label="Read question aloud">🔊</button>`:''}</div>
      <div class="answers">${answers}</div>
      ${Q.answered?`<div class="feedback ${right?'good':'bad'}"><strong>${right?['Nice!','You got it!','Great job!','Awesome!'][Q.i%4]:'Not quite.'}</strong>${right?'':'The answer is '+esc(cur.correct)+'. '}${esc(cur.exp)}</div>
        <div class="row nextrow"><button class="btn blue" id="next">${last?'See my results':'Next question'}</button></div>`:''}
    </div>
  </div>`;
  bindGear();
  const say = document.getElementById('say'); if(say) say.onclick=()=>readQuestion(cur);
  app.querySelectorAll('.ans').forEach(b=>b.onclick=()=>answer(+b.dataset.k));
  const nx = document.getElementById('next'); if(nx){ nx.onclick=nextQ; nx.focus({preventScroll:true}); }
  if(!Q.answered && play.speak && !Q.spoken){ Q.spoken = true; readQuestion(cur); }
}
function answer(k){
  const Q = quiz, cur = Q.qs[Q.i]; if(Q.answered) return;
  Q.answered = true; Q.pick = k;
  const ok = cur.opts[k]===cur.correct;
  Q.results.push(ok);
  if(ok){ Q.score++; Q.streak++; Q.pts += 10 + (Q.streak>=3?5:0); } else { Q.streak = 0; }
  renderQuiz();
  announce((ok ? 'Correct. ' : 'Not quite. The answer is ' + cur.correct + '. ') + cur.exp);
  if(play.speak) speak((ok?'Correct! ':'Not quite. The answer is '+cur.correct+'. ')+cur.exp);
}
function nextQ(){
  const Q = quiz; stopSpeak();
  Q.i++; Q.answered=false; Q.pick=null; Q.spoken=false;
  if(Q.i>=Q.qs.length) go(renderResult); else { renderQuiz(); window.scrollTo(0,0); }
}
function renderResult(){
  const Q = quiz, n = Q.qs.length, pct = Q.score/n;
  const stars = pct>=0.9?3:pct>=0.7?2:pct>=0.4?1:0;
  const prev = store.get(bestKey(), 0), isBest = Q.pts>prev;
  if(isBest) store.set(bestKey(), Q.pts);
  const msg = ["Every expert started somewhere. Try another round!","Nice effort! Play again to beat your score.","Great work! You're almost a pro.","Superstar! You really know your stuff."][stars];
  const u = unitInfo(play.unit);
  view.html = topBar(true) + `<div class="wrap"><div class="card center" style="padding:30px 20px">
    <div class="stars">${[0,1,2].map(i=>`<span class="${i<stars?'':'off'}">⭐</span>`).join('')}</div>
    <div class="scoreline" tabindex="-1">${Q.score} of ${n} correct</div>
    <p class="sub" style="margin:6px 0 0">${Q.pts} points. ${msg}</p>
    ${isBest?`<div class="newbest">New personal best!</div>`:''}
  </div>
  <div class="row"><button class="btn go" id="again">Play again</button>${play.explore?'':'<button class="btn blue" id="toRep">Bench Reporter</button>'}<button class="btn plain" id="home">${play.explore?'More activities':'Home'}</button></div>
  ${sendBoxHTML('qz','')}
  </div>`;
  bindGear();
  document.getElementById('again').focus({ preventScroll:true });
  announce('Round complete. ' + Q.score + ' of ' + n + ' correct. ' + stars + ' of 3 stars.');
  if(play.speak) speak(Q.score+' of '+n+' correct. '+msg);
  document.getElementById('again').onclick=()=>go(startQuiz);
  const toRep = document.getElementById('toRep'); if(toRep) toRep.onclick=()=>go(startReporter);
  document.getElementById('home').onclick=()=>go(renderHub);
  bindSendBox('qz',
    name => `Bench Boost results: ${name}`,
    name => [
      `Student: ${name}`,
      `Unit: ${u.name} (${BANDS[play.band]})`,
      `Score: ${Q.score} of ${n} correct`,
      `Points: ${Q.pts}`,
      `Date: ${new Date().toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}`
    ].join('\n')
  );
}

