"use strict";
/*
 * teacher.js - everything a teacher sees: setup, the classroom PIN pad, and saved Sideline reports.
 * The 4-digit PIN is a classroom convenience lock that keeps students out of setup. It is NOT authentication;
 * the teacher's account sign-in (auth.js) is what protects the account.
 */
/* ---------- teacher setup ---------- */
function renderSetup(){
  document.body.className = '';
  const draft = Object.assign({ band:'k2', unit:'rules', rounds:10, speak:true, timer:'normal' }, settings || {});
  let pinErr = '', pinDraft = pin, confirmOut = false;
  function tile(u){ return `<button class="unit ${draft.unit===u.id?'on':''}" data-unit="${u.id}" aria-pressed="${draft.unit===u.id}"><span class="ic">${u.icon}</span><span>${esc(u.name)}${UNIT_AREA_LABELS[u.id]?`<small class="sol">${UNIT_AREA_LABELS[u.id]}</small>`:''}</span></button>`; }
  function paint(){
    const reports = store.get('reports', []);
    view.html = topBar(false) + `<div class="wrap">
      <h1>Set up the sideline</h1>
      <p class="sub">Choose a grade band and the unit you're teaching. Each unit lists the Virginia SOL strand or topic it supports.</p>
      <div class="card"><h2>Grade band</h2><div class="chips">${
        Object.entries(BANDS).map(([k,v])=>`<button class="chip ${draft.band===k?'on':''}" data-band="${k}" aria-pressed="${draft.band===k}">${v}</button>`).join('')}</div></div>
      <div class="card"><h2>Unit</h2>
        <div class="group">Physical Education</div><div class="units">${UNITS.filter(u=>u.cat==='PE').map(tile).join('')}</div>
        <div class="group">Health</div><div class="units">${UNITS.filter(u=>u.cat==='Health').map(tile).join('')}</div>
        <div class="group">Review mix</div><div class="units">${MIX.map(tile).join('')}</div>
      </div>
      <div class="card"><h2>Options</h2>
        <div class="group" style="margin-top:0">Questions per round</div>
        <div class="chips">${[5,10,15].map(n=>`<button class="chip ${draft.rounds===n?'on':''}" data-rounds="${n}" aria-pressed="${draft.rounds===n}">${n}</button>`).join('')}</div>
        <p class="hint">Questions rotate so students see new ones each time, and many units create fresh questions on the fly.</p>
        <div class="group">Read questions aloud</div>
        <div class="chips"><button class="chip ${draft.speak?'on':''}" data-speak="1" aria-pressed="${!!draft.speak}">On</button><button class="chip ${!draft.speak?'on':''}" data-speak="0" aria-pressed="${!draft.speak}">Off</button></div>
        ${canSpeak?'':'<p class="hint">This browser doesn\'t support read-aloud.</p>'}
        <div class="group">Timed games</div>
        <div class="chips">${[['normal','Normal'],['extended','Extended (+50%)'],['off','Off']].map(([k,l])=>`<button class="chip ${(draft.timer||'normal')===k?'on':''}" data-timer="${k}" aria-pressed="${(draft.timer||'normal')===k}">${l}</button>`).join('')}</div>
        <p class="hint">Applies to Lightning Round. Normal is 60 seconds (90 for K–2). Extended adds 50% more time. Off removes the clock: students answer a set number of questions at their own pace.</p>
        <div class="group">Teacher PIN</div>
        <input class="text pinset" id="pinIn" inputmode="numeric" maxlength="4" value="${esc(pinDraft)}" aria-label="Four-digit teacher PIN">
        <p class="hint">Students need this PIN to get back to setup.</p>
        ${pinErr?`<p class="err" role="alert">${pinErr}</p>`:''}
      </div>
      ${accountCardHTML(confirmOut)}
      <div class="row">
        <button class="btn go" id="start">Start student mode</button>
        <button class="btn plain" id="reports">Sideline reports (${reports.length})</button>
      </div>
    </div>`;
    app.querySelectorAll('[data-band]').forEach(b=>b.onclick=()=>{ draft.band=b.dataset.band; draft.speak = draft.band==='k2'; paint(); });
    app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{ draft.unit=b.dataset.unit; paint(); });
    app.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{ draft.rounds=+b.dataset.rounds; paint(); });
    app.querySelectorAll('[data-timer]').forEach(b=>b.onclick=()=>{ draft.timer=b.dataset.timer; paint(); });
    app.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>{ draft.speak=b.dataset.speak==='1'; paint(); });
    document.getElementById('start').onclick=()=>{
      const p = document.getElementById('pinIn').value.trim(); pinDraft = p;
      if(!/^\d{4}$/.test(p)){ pinErr='Enter a 4-digit PIN.'; paint(); return; }
      pin = p; store.set('pin', pin);
      settings = draft; store.set('settings', settings);
      if(sb && sessionUser) pushSettings(settings, pin).catch(()=>{});
      go(renderHome);
    };
    document.getElementById('reports').onclick=()=>go(renderReports);
    document.getElementById('pinIn').oninput=e=>{ pinDraft = e.target.value; };
    const so=document.getElementById('signout'); if(so) so.onclick=()=>{ confirmOut=true; paint(); };
    const soy=document.getElementById('signoutYes'); if(soy) soy.onclick=doSignOut;
    const son=document.getElementById('signoutNo'); if(son) son.onclick=()=>{ confirmOut=false; paint(); };
  }
  paint();
}

/* ---------- PIN ---------- */
function renderPin(onOk){
  let entry = '';
  function paint(shake){
    view.html = topBar(false) + `<div class="wrap center">
      <h1>Teacher PIN</h1><p class="sub">Enter the 4-digit PIN to change settings.</p>
      <div class="dots ${shake?'shake':''}" role="img" aria-label="${entry.length} of 4 digits entered">${[0,1,2,3].map(i=>`<i class="${i<entry.length?'f':''}"></i>`).join('')}</div>
      <div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
        <button id="back" aria-label="Back to student mode">✕</button><button data-n="0">0</button><button id="del" aria-label="Delete">⌫</button></div>
    </div>`;
    app.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{
      if(entry.length>=4) return;
      entry += b.dataset.n;
      if(entry.length===4){
        if(entry===pin){ go(onOk); return; }
        entry=''; paint(true); announce('Incorrect PIN. Try again.', true); return;
      }
      paint(false);
    });
    document.getElementById('del').onclick=()=>{ entry=entry.slice(0,-1); paint(false); };
    document.getElementById('back').onclick=()=>go(settings?renderHome:renderSetup);
  }
  paint(false);
}


/* ---------- teacher: reports ---------- */
function renderReports(){
  let confirmClear = false;
  function paint(){
    const reports = store.get('reports', []);
    const list = reports.length ? reports.map(r=>`<div class="rep-item">
        <div class="who">${esc(r.name||'No name')}</div>
        <div class="meta">${new Date(r.t).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}. ${esc(BANDS[r.band]||'')}, ${esc(r.unit)}</div>
        <dl>${r.items.map(it=>`<dt>${esc(it.p)}</dt><dd>${esc(it.a)}</dd>`).join('')}</dl></div>`).join('')
      : `<div class="card"><p class="sub" style="margin:0">No reports yet. Reports appear here after a student finishes Sideline Reporter on this device.</p></div>`;
    view.html = topBar(false) + `<div class="wrap">
      <h1>Sideline reports</h1><p class="sub">Saved on this device only. Newest first.</p>
      ${list}
      <div class="row" style="margin-top:8px">
        <button class="btn plain" id="back">Back to setup</button>
        ${reports.length ? (confirmClear
          ? `<button class="btn warn" id="yes">Delete all ${reports.length} reports</button><button class="btn plain" id="no">Keep them</button>`
          : `<button class="btn plain" id="clear" style="color:var(--errtext)">Clear reports</button>`) : ''}
      </div></div>`;
    document.getElementById('back').onclick=()=>go(renderSetup);
    const c=document.getElementById('clear'); if(c) c.onclick=()=>{ confirmClear=true; paint(); };
    const y=document.getElementById('yes'); if(y) y.onclick=()=>{ store.set('reports', []); confirmClear=false; paint(); };
    const n=document.getElementById('no'); if(n) n.onclick=()=>{ confirmClear=false; paint(); };
  }
  paint();
}

