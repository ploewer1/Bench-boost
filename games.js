"use strict";
/*
 * games.js - the extra game modes (Lightning Round, Fact Check, Sort It), the Bench Reporter,
 * and the "email these results to my teacher" box shared by every mode.
 * All modes draw their questions from the engine in quiz.js.
 */
let lr = null, fact = null, sortG = null, gameTimer = null, advTimer = null;
function clearTimers(){ if(gameTimer){ clearInterval(gameTimer); gameTimer = null; } if(advTimer){ clearTimeout(advTimer); advTimer = null; } lr = null; }
function sortSetsFor(band){
  const out = [];
  unitsFor(play.unit).forEach(function(u){ CATSETS.filter(function(s){ return s.unit === u.id && s.bands.indexOf(band) >= 0; }).forEach(function(s){ out.push({ u:u, s:s }); }); });
  return out;
}
/* the topic being played, or a neutral label when Reporter is opened from Student Explore (it has no topic) */
function playUnitName(){ const u = play && play.unit ? unitInfo(play.unit) : null; return u ? u.name : 'Student Explore'; }
function starsFor(pct){ return pct>=0.9?3:pct>=0.7?2:pct>=0.4?1:0; }
function trackHTML(results, i, total){ let h = ''; for(let k=0;k<total;k++) h += `<i class="${k<results.length?(results[k]?'ok':'no'):(k===i?'now':'')}"></i>`; return h; }

/* ---------- email results to teacher (mailto, no backend, no accounts) ---------- */
function sendBoxHTML(prefix, prefillName){
  return `<div class="card sendbox">
    <h2>Email these results to your teacher</h2>
    <p class="hint" style="margin:0 0 10px">This opens an email on this device. Your name clears from here once it's sent.</p>
    <label for="${prefix}Name">Your name</label>
    <input class="text" id="${prefix}Name" placeholder="First and last name" value="${esc(prefillName||'')}">
    <label for="${prefix}Email">Teacher's email</label>
    <input class="text" id="${prefix}Email" type="email" inputmode="email" placeholder="teacher@school.org">
    <p class="err" role="alert" id="${prefix}Err" style="display:none"></p>
    <div class="row" style="margin-top:12px">
      <button class="btn blue" id="${prefix}Send">Email my results</button>
      <button class="btn plain" id="${prefix}Copy">Copy instead</button>
    </div>
    <div class="sendok" id="${prefix}Ok" style="display:none"></div>
  </div>`;
}
function bindSendBox(prefix, subjectFn, bodyFn, onSent){
  const nameEl = document.getElementById(prefix+'Name'), emailEl = document.getElementById(prefix+'Email'),
        errEl = document.getElementById(prefix+'Err'), okEl = document.getElementById(prefix+'Ok'),
        sendBtn = document.getElementById(prefix+'Send'), copyBtn = document.getElementById(prefix+'Copy');
  if(!sendBtn) return;
  function validated(){
    const name = nameEl.value.trim(), email = emailEl.value.trim();
    if(!name){ errEl.textContent = "Enter your name first."; errEl.style.display='block'; return null; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ errEl.textContent = "Enter a valid teacher email."; errEl.style.display='block'; return null; }
    errEl.style.display = 'none';
    return { name, email };
  }
  sendBtn.onclick = ()=>{
    const v = validated(); if(!v) return;
    const subject = subjectFn(v.name), body = bodyFn(v.name);
    window.location.href = 'mailto:'+encodeURIComponent(v.email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    nameEl.value=''; emailEl.value='';
    okEl.style.display='block'; okEl.textContent="Email opened below (or in your mail app) \u2014 tap send there to finish. Your name has been cleared from this device.";
    if(onSent) onSent();
  };
  copyBtn.onclick = ()=>{
    const v = validated(); if(!v) return;
    const text = subjectFn(v.name)+"\n\n"+bodyFn(v.name);
    const done = ()=>{ okEl.style.display='block'; okEl.textContent="Copied! Paste it into an email to your teacher. Your name has been cleared from this device."; nameEl.value=''; emailEl.value=''; if(onSent) onSent(); };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done).catch(()=>{ errEl.textContent="Couldn't copy automatically \u2014 try the email button instead."; errEl.style.display='block'; }); }
    else { errEl.textContent="Copy isn't available here \u2014 try the email button instead."; errEl.style.display='block'; }
  };
}


/* shared results screen for the extra modes */
function renderScore(c){
  const prev = store.get(c.bestKey, 0), isBest = c.bestVal > prev;
  if(isBest) store.set(c.bestKey, c.bestVal);
  const msg = ["Every expert started somewhere. Try another round!","Nice effort! Play again to beat your score.","Great work! You're almost a pro.","Superstar! You really know your stuff."][c.stars];
  const u = unitInfo(play.unit);
  view.html = topBar(true) + `<div class="wrap"><div class="card center" style="padding:30px 20px">
    <div class="stars">${[0,1,2].map(i=>`<span class="${i<c.stars?'':'off'}">⭐</span>`).join('')}</div>
    <div class="scoreline" tabindex="-1">${esc(c.headline)}</div>
    <p class="sub" style="margin:6px 0 0">${esc(c.sub)} ${msg}</p>
    ${isBest?`<div class="newbest">New personal best!</div>`:''}
  </div>
  <div class="row"><button class="btn go" id="again">Play again</button>${play.explore?'':'<button class="btn blue" id="toQuiz">Quiz Challenge</button>'}<button class="btn plain" id="home">${play.explore?'More activities':'Home'}</button></div>
  ${sendBoxHTML('gm','')}</div>`;
  bindGear(); window.scrollTo(0,0);
  document.getElementById('again').focus({ preventScroll:true });
  announce('Round complete. ' + c.headline + '. ' + c.stars + ' of 3 stars.');
  if(play.speak) speak(c.headline+'. '+msg);
  document.getElementById('again').onclick = ()=>go(c.again);
  const toQuiz = document.getElementById('toQuiz'); if(toQuiz) toQuiz.onclick = ()=>go(startQuiz);
  document.getElementById('home').onclick = ()=>go(renderHub);
  bindSendBox('gm',
    name => `Bench Boost ${c.mode} results: ${name}`,
    name => [`Student: ${name}`, `Game: ${c.mode}`, `Unit: ${u.name} (${BANDS[play.band]})`, `Result: ${c.headline}`, `Points: ${c.pts}`, `Date: ${new Date().toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}`].join('\n'));
}

/* ---- Lightning Round ---- */
/* Timer comes from the teacher's setting (accessibility.js timerConfig): normal, extended (+50%), or off. */
function startLightning(){
  const T = timerConfig(), n = T.secs ? 60 : play.rounds;
  lr = { qs:draw(n, true), i:0, correct:0, wrong:0, streak:0, answered:false, pick:null, secs:T.secs, mode:T.mode, total:n, said:{},
         end:T.secs ? Date.now() + T.secs*1000 : null };
  renderLightning();
  announce(T.secs ? 'Lightning Round. ' + T.secs + ' seconds on the clock.' : 'Lightning Round with no timer. ' + n + ' questions.');
  if(T.secs) gameTimer = setInterval(tickLightning, 250);
}
function renderLightning(){
  const L = lr; if(!L) return;
  const cur = L.qs[L.i];
  if(!cur){ endLightning(); return; }
  markSeen(cur);
  const answers = cur.opts.map((o,k)=>{ let c = ''; if(L.answered){ c = o===cur.correct ? 'right' : (k===L.pick ? 'wrong' : 'dim'); }
    return `<button class="ans a${k%4} ${c}" data-k="${k}" ${L.answered?'disabled':''}><span class="spot">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`; }).join('');
  const left = L.secs ? Math.max(0, Math.ceil((L.end-Date.now())/1000)) : 0;
  const head = L.secs ? `<span class="timer" id="tm">⏱ ${left}s</span>` : `<span>Question ${L.i+1} of ${L.total}</span>`;
  view.html = topBar(true) + `<div class="wrap"><div class="qbar">${head}<span>${L.correct} right${L.streak>=3?` <span class="streak">🔥 ${L.streak}</span>`:''}</span></div>
    <div class="card qcard"><p class="qtext" tabindex="-1">${L.secs?'':`<span class="sr-only">Question ${L.i+1} of ${L.total}. </span>`}${esc(cur.q)}</p><div class="answers">${answers}</div></div></div>`;
  bindGear(); window.scrollTo(0,0);
  app.querySelectorAll('.ans').forEach(b=>b.onclick=()=>lrAnswer(+b.dataset.k));
}
function lrAnswer(k){
  const L = lr; if(!L || L.answered) return;
  const cur = L.qs[L.i]; L.answered = true; L.pick = k;
  const ok = cur.opts[k] === cur.correct;
  if(ok){ L.correct++; L.streak++; } else { L.wrong++; L.streak = 0; }
  renderLightning();
  announce(ok ? 'Correct.' : 'Not quite. The answer is ' + cur.correct + '.');
  advTimer = setTimeout(()=>{
    if(!lr) return;
    lr.i++; lr.answered = false; lr.pick = null;
    if(!lr.secs && lr.i >= lr.total) endLightning(); else renderLightning();
  }, ok ? 450 : 1100);
}
function tickLightning(){
  const L = lr; if(!L || !L.secs) return;
  const ms = L.end - Date.now(), sec = Math.max(0, Math.ceil(ms/1000)), el = document.getElementById('tm');
  if(el) el.textContent = '⏱ ' + sec + 's';
  [30, 10].forEach(m=>{ if(sec <= m && L.secs > m && !L.said[m]){ L.said[m] = true; announce(m + ' seconds left.'); } });
  if(ms <= 0) endLightning();
}
function endLightning(){
  const L = lr; clearTimers(); if(!L) return;
  const answered = L.correct + L.wrong;
  let stars, headline, sub;
  if(L.secs){ const perMin = L.correct / L.secs * 60; stars = perMin>=15?3:perMin>=10?2:perMin>=5?1:0; headline = `${L.correct} right in ${L.secs} seconds`; sub = `${L.correct} correct, ${L.wrong} missed.`; }
  else { stars = starsFor(answered ? L.correct/answered : 0); headline = `${L.correct} of ${answered} correct`; sub = 'No timer this time.'; }
  renderScore({ mode:'Lightning Round', headline:headline, sub:sub, stars:stars, pts:L.correct*10,
    bestKey:'best_lightning_'+L.mode+'_'+play.band+'_'+play.unit, bestVal:L.correct, again:startLightning });
}

/* ---- Fact Check ---- */
function startFact(){
  const qs = draw(play.rounds).map(q=>{ const truth = Math.random() < 0.5; return Object.assign({}, q, { truth, claim: truth ? q.correct : pick(q.opts.filter(o=>o!==q.correct)) }); });
  fact = { qs, i:0, score:0, pts:0, streak:0, results:[], answered:false, pick:null, spoken:false };
  renderFact();
}
function renderFact(){
  const F = fact, cur = F.qs[F.i], done = F.answered, mix = play.unit.startsWith('mix');
  const right = done && F.pick === cur.truth, last = F.i === F.qs.length-1;
  const tCls = done ? (cur.truth ? 'right' : (F.pick===true ? 'wrong' : 'dim')) : '';
  const fCls = done ? (!cur.truth ? 'right' : (F.pick===false ? 'wrong' : 'dim')) : '';
  view.html = topBar(true) + `<div class="wrap">
    <div class="qbar"><span>Statement ${F.i+1} of ${F.qs.length}</span><span>${F.pts} points${F.streak>=2?` <span class="streak">🔥 ${F.streak} in a row</span>`:''}</span></div>
    <div class="track">${trackHTML(F.results, F.i, F.qs.length)}</div>
    <div class="card qcard"><div class="qhead"><div>${(mix||cur.extra)?`<span class="qtag">${cur.icon} ${esc(cur.unit)}</span>`:''}<p class="qtext" tabindex="-1"><span class="sr-only">Statement ${F.i+1} of ${F.qs.length}. </span>${esc(cur.q)}</p></div>
      ${canSpeak?`<button class="speak" id="say" aria-label="Read aloud">🔊</button>`:''}</div>
      <div class="claim"><small>A student says the answer is:</small><strong>${esc(cur.claim)}</strong></div>
      <div class="answers tf"><button class="ans a2 ${tCls}" id="tfT" aria-label="That answer is right" ${done?'disabled':''}><span>✅ That's right</span></button><button class="ans a1 ${fCls}" id="tfF" aria-label="That answer is wrong" ${done?'disabled':''}><span>❌ That's wrong</span></button></div>
      ${done?`<div class="feedback ${right?'good':'bad'}"><strong>${right?'You got it!':'Not quite.'}</strong>That answer was ${cur.truth?'right':'wrong'}. ${cur.truth?'':'The right answer is '+esc(cur.correct)+'. '}${esc(cur.exp)}</div>
        <div class="row nextrow"><button class="btn blue" id="next">${last?'See my results':'Next statement'}</button></div>`:''}
    </div></div>`;
  bindGear();
  const say = document.getElementById('say'); if(say) say.onclick = ()=>speak(cur.q+'. A student says the answer is: '+cur.claim+'. Is that right?');
  if(!done){
    document.getElementById('tfT').onclick = ()=>factPick(true);
    document.getElementById('tfF').onclick = ()=>factPick(false);
    if(play.speak && !F.spoken){ F.spoken = true; speak(cur.q+'. A student says the answer is: '+cur.claim+'. Is that right?'); }
  } else { const nx = document.getElementById('next'); nx.onclick = factNext; nx.focus({ preventScroll:true }); }
}
function factPick(v){
  const F = fact, cur = F.qs[F.i]; if(F.answered) return;
  F.answered = true; F.pick = v;
  const ok = v === cur.truth; F.results.push(ok);
  if(ok){ F.score++; F.streak++; F.pts += 10 + (F.streak>=3?5:0); } else F.streak = 0;
  renderFact();
  announce((ok ? 'Correct. ' : 'Not quite. ') + 'That answer was ' + (cur.truth ? 'right. ' : 'wrong. The right answer is ' + cur.correct + '. ') + cur.exp);
  if(play.speak) speak((ok?'Correct! ':'Not quite. ')+'That answer was '+(cur.truth?'right. ':'wrong. The right answer is '+cur.correct+'. ')+cur.exp);
}
function factNext(){
  const F = fact; stopSpeak(); F.i++; F.answered = false; F.pick = null; F.spoken = false;
  if(F.i >= F.qs.length){
    const n = F.qs.length;
    renderScore({ mode:'Fact Check', headline:`${F.score} of ${n} correct`, sub:`${F.pts} points.`, stars:starsFor(F.score/n), pts:F.pts, bestKey:'best_fact_'+play.band+'_'+play.unit, bestVal:F.pts, again:startFact });
  } else { renderFact(); window.scrollTo(0,0); }
}

/* ---- Sort It ---- */
function startSort(){
  const opts = sortSetsFor(play.band); if(!opts.length){ renderHub(); return; }
  const o = pick(opts), names = sample(Object.keys(o.s.cats), Math.min(3, Object.keys(o.s.cats).length));
  const lists = names.map(c=>shuffle(o.s.cats[c])), items = [];
  for(let i=0; items.length<8 && i<60; i++){ const l = lists[i%names.length]; if(l.length) items.push({ it:l.pop(), c:names[i%names.length] }); }
  sortG = { u:o.u, s:o.s, cats:names, items:shuffle(items), i:0, score:0, pts:0, streak:0, results:[], answered:false, pick:null };
  renderSort();
}
function renderSort(){
  const G = sortG, cur = G.items[G.i], done = G.answered, last = G.i === G.items.length-1;
  const ok = done && G.cats[G.pick] === cur.c;
  const btns = G.cats.map((c,k)=>{ let cls = ''; if(done){ cls = c===cur.c ? 'right' : (k===G.pick ? 'wrong' : 'dim'); }
    return `<button class="ans a${k%4} ${cls}" data-k="${k}" ${done?'disabled':''}><span>${esc(c)}</span></button>`; }).join('');
  view.html = topBar(true) + `<div class="wrap">
    <div class="qbar"><span>Item ${G.i+1} of ${G.items.length}</span><span>${G.pts} points${G.streak>=2?` <span class="streak">🔥 ${G.streak} in a row</span>`:''}</span></div>
    <div class="track">${trackHTML(G.results, G.i, G.items.length)}</div>
    <div class="card qcard"><p class="sub" style="margin:0">Where does this go?</p><div class="sortitem" tabindex="-1"><span class="sr-only">Item ${G.i+1} of ${G.items.length}. </span>${esc(cap(cur.it))}</div>
      <div class="answers ${G.cats.length===3?'three':''}">${btns}</div>
      ${done?`<div class="feedback ${ok?'good':'bad'}"><strong>${ok?'Yes!':'Not quite.'}</strong>${esc(G.s.exp(cur.it, cur.c))}</div>`:''}
      ${done && !ok?`<div class="row nextrow"><button class="btn blue" id="next">${last?'See my results':'Next'}</button></div>`:''}
    </div></div>`;
  bindGear();
  if(!done){ app.querySelectorAll('.ans').forEach(b=>b.onclick=()=>sortPick(+b.dataset.k)); }
  else if(!ok){ const nx = document.getElementById('next'); nx.onclick = sortNext; nx.focus({ preventScroll:true }); }
}
function sortPick(k){
  const G = sortG, cur = G.items[G.i]; if(G.answered) return;
  G.answered = true; G.pick = k;
  const ok = G.cats[k] === cur.c; G.results.push(ok);
  if(ok){ G.score++; G.streak++; G.pts += 10 + (G.streak>=3?5:0); } else G.streak = 0;
  renderSort();
  announce((ok ? 'Yes. ' : 'Not quite. It goes in ' + cur.c + '. ') + G.s.exp(cur.it, cur.c));
  if(ok) advTimer = setTimeout(sortNext, 900);
}
function sortNext(){
  const G = sortG; if(!G) return;
  G.i++; G.answered = false; G.pick = null;
  if(G.i >= G.items.length){
    const n = G.items.length;
    renderScore({ mode:'Sort It', headline:`${G.score} of ${n} sorted right`, sub:`${G.pts} points.`, stars:starsFor(G.score/n), pts:G.pts, bestKey:'best_sort_'+play.band+'_'+play.unit, bestVal:G.pts, again:startSort });
  } else { renderSort(); window.scrollTo(0,0); }
}


/* ---------- Bench Reporter (student tool) ---------- */
function startReporter(){
  const list = PROMPTS[play.band];
  rep = { step:-1, name:'', items:[], picks:shuffle(list).slice(0,3) };
  renderReporter();
}
function renderReporter(){
  const R = rep, k2 = play.band==='k2';
  if(R.step===-1){
    view.html = topBar(true) + `<div class="wrap"><div class="card">
      <h1>Bench Reporter</h1><p class="sub">You'll watch your class and answer 3 quick questions about what you see.</p>
      <label for="nm" style="font-weight:700">Your first name</label>
      <input class="text" id="nm" maxlength="30" autocomplete="off" style="margin-top:8px" placeholder="Type your first name">
      <div class="row" style="margin-top:16px"><button class="btn go" id="begin">Start reporting</button><button class="btn plain" id="home">Home</button></div>
    </div></div>`;
    bindGear();
    if(play.speak) speak("Bench Reporter. Type your first name, then start reporting.");
    document.getElementById('begin').onclick=()=>{ R.name=document.getElementById('nm').value.trim(); R.step=0; go(renderReporter); };
    document.getElementById('home').onclick=()=>go(renderHub);
    return;
  }
  if(R.step>=R.picks.length){
    const reportTime = Date.now();
    const reports = store.get('reports', []);
    reports.unshift({ t:reportTime, name:R.name, band:play.band, unit:playUnitName(), items:R.items });
    store.set('reports', reports.slice(0,200));
    view.html = topBar(true) + `<div class="wrap"><div class="card center" style="padding:30px 20px">
      <div style="font-size:60px">📝</div><h1>Report saved</h1><p class="sub">Great observing${R.name?', '+esc(R.name):''}! Your teacher can read it here on this device, or you can email it below.</p></div>
      <div class="row">${play.unit?'<button class="btn blue" id="toQuiz">Quiz Challenge</button>':''}<button class="btn go" id="again">New report</button><button class="btn plain" id="home">Home</button></div>
      ${sendBoxHTML('rep', R.name)}
      </div>`;
    bindGear();
    document.getElementById('again').focus({ preventScroll:true });
    announce('Report saved. Great observing.');
    if(play.speak) speak("Report saved. Great observing!");
    const tq = document.getElementById('toQuiz'); if(tq) tq.onclick=()=>go(startQuiz);
    document.getElementById('again').onclick=()=>go(startReporter);
    document.getElementById('home').onclick=()=>go(renderHub);
    bindSendBox('rep',
      name => `Bench Boost Reporter: ${name}`,
      name => [
        `Student: ${name}`,
        `Topic: ${playUnitName()} (${BANDS[play.band]})`,
        `Date: ${new Date(reportTime).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}`,
        '',
        ...R.items.flatMap(it => [it.p, it.a, ''])
      ].join('\n'),
      () => { store.set('reports', store.get('reports', []).filter(r => r.t !== reportTime)); }
    );
    return;
  }
  const P = R.picks[R.step];
  const promptText = k2 ? P.p : P;
  const dots = R.picks.map((_,i)=>`<i class="${i<R.step?'done':''}"></i>`).join('');
  view.html = topBar(true) + `<div class="wrap"><div class="card">
    <div class="stepdots">${dots}</div>
    <div class="qhead"><p class="qtext" tabindex="-1"><span class="sr-only">Prompt ${R.step+1} of ${R.picks.length}. </span>${esc(promptText)}</p>${canSpeak?`<button class="speak" id="say" aria-label="Read aloud">🔊</button>`:''}</div>
    ${k2 ? `<div class="choices">${P.c.map((c,i)=>`<button class="emo" data-i="${i}">${esc(c)}</button>`).join('')}</div>`
         : `<textarea id="obs" aria-label="Write what you see" style="margin-top:16px" placeholder="Write what you see..."></textarea>
            <div class="row" style="margin-top:14px"><button class="btn go" id="save">Save and continue</button><button class="btn plain" id="skip">Skip this one</button></div>`}
  </div></div>`;
  bindGear();
  const say = document.getElementById('say'); if(say) say.onclick=()=>speak(promptText + (k2 ? '. ' + P.c.join('. ') : ''));
  if(play.speak) speak(promptText + (k2 ? '. ' + P.c.join('. ') : ''));
  const advance = a=>{ R.items.push({ p:promptText, a }); R.step++; go(renderReporter); };
  if(k2){ app.querySelectorAll('.emo').forEach(b=>b.onclick=()=>advance(P.c[+b.dataset.i])); }
  else{
    document.getElementById('save').onclick=()=>{ const v=document.getElementById('obs').value.trim(); advance(v||'(no answer)'); };
    document.getElementById('skip').onclick=()=>advance('(skipped)');
  }
}

