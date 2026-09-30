"use strict";
/*
 * auth.js - teacher accounts (Supabase): sign in, create account, password reset, free-trial check, settings sync.
 * Only the TEACHER has an account. Students never sign in and no student names are ever sent to the database.
 * The Supabase library is served from /vendor (not a CDN). The publishable key below is designed to be public;
 * access is controlled by the row-level-security rules in the database.
 */
/* ---------- teacher accounts (Supabase) ---------- */
const SUPABASE_URL = 'https://otnqmobsvgueiqvgbtcy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6pmSCLBXzkrMdl3H518BCg_oJ1ILf7G';
const DEFAULTS = { band:'k2', unit:'rules', rounds:10, speak:false, pin:'1234' };
let sb = null, sessionUser = null, account = null, recovering = false;

function authTop(){ return `<div class="top"><div class="brand">${brandMark(false)}</div><span class="toptag">Teacher account</span></div>`; }
function show(html){ stopSpeak(); clearTimers(); document.body.className=''; view.html = html; window.scrollTo(0,0); }
function field(id,label,type,extra){ return `<label for="${id}" style="font-weight:700;display:block;margin:12px 0 6px">${label}</label><input class="text" id="${id}" type="${type}" ${extra||''}>`; }
function redirectUrl(){ return /^https?:$/.test(location.protocol) ? location.origin + location.pathname : undefined; }
function isNetworkErr(e){ return /fetch|network|timeout|load failed/i.test((e && e.message) || ''); }
function friendly(err){
  const m = (err && err.message) || String(err || '');
  if(err && (err.code==='PGRST205' || /Could not find the table|schema cache/i.test(m))) return "The database tables aren't set up yet. Run the setup SQL in Supabase, then refresh.";
  if(err && err.code==='NOPROFILE') return "Your account exists but its profile record is missing. Contact support.";
  if(/invalid api key|no api key|apikey/i.test(m)) return "The app's connection key is wrong or missing. Check SUPABASE_KEY at the top of the app code.";
  if(/Invalid login credentials/i.test(m)) return "That email and password don't match.";
  if(/already registered|already been registered/i.test(m)) return 'That email already has an account. Try signing in.';
  if(/Email not confirmed/i.test(m)) return 'Check your email and tap the confirmation link first.';
  if(/rate limit|too many/i.test(m)) return 'Too many tries. Wait a few minutes and try again.';
  if(/fetch|network|load failed/i.test(m)) return "Can't reach the sign-in service. Check your internet connection.";
  return m || 'Something went wrong. Try again.';
}
function entitled(a){
  if(!a) return false;
  if(a.status==='active' || a.status==='trialing') return true;
  return !!a.trialEnds && new Date(a.trialEnds) > new Date();
}
function trialLine(){
  if(!account) return '';
  if(account.status==='active') return 'Subscription: active';
  if(account.status==='trialing') return 'Subscription: in trial';
  const days = account.trialEnds ? Math.ceil((new Date(account.trialEnds) - new Date()) / 864e5) : 0;
  return days > 0 ? `Free trial: ${days} day${days===1?'':'s'} left` : 'Free trial ended';
}
function routeIntoApp(){
  /* Devices that already have a teacher kiosk configured keep opening in kiosk mode; everyone else starts in Student Explore. */
  if(currentMode() === 'kiosk') renderHome(); else startExplore();
}

async function pushSettings(s, p){
  store.set('dirty', true);
  const { error } = await sb.from('teacher_settings').upsert(
    { user_id: sessionUser.id, band:s.band, unit:s.unit, rounds:s.rounds, speak:s.speak, pin:p, updated_at:new Date().toISOString() },
    { onConflict:'user_id' });
  if(error) throw error;
  store.set('dirty', false);
}

async function loadAccount(){
  const uid = sessionUser.id;
  const p = await sb.from('profiles').select('email,subscription_status,trial_ends_at').eq('id', uid).maybeSingle();
  if(p.error) throw p.error;
  if(!p.data){ const e = new Error('missing-profile'); e.code = 'NOPROFILE'; throw e; }
  const s = await sb.from('teacher_settings').select('band,unit,rounds,speak,pin').eq('user_id', uid).maybeSingle();
  if(s.error) throw s.error;
  account = { email: p.data.email || sessionUser.email, status: p.data.subscription_status, trialEnds: p.data.trial_ends_at };
  store.set('acct', { uid, at: Date.now(), account });
  const remote = Object.assign({}, DEFAULTS, s.data || {});
  const localSettings = store.get('settings', null);
  if(store.get('dirty', false) && localSettings){
    settings = localSettings; pin = store.get('pin', remote.pin);
    try{ await pushSettings(settings, pin); }catch(e){ /* stays dirty, retried next time */ }
    return;
  }
  pin = remote.pin; store.set('pin', pin);
  const untouched = !s.data || (remote.band===DEFAULTS.band && remote.unit===DEFAULTS.unit && remote.rounds===DEFAULTS.rounds && remote.speak===DEFAULTS.speak && remote.pin===DEFAULTS.pin);
  if(untouched){ settings = null; store.set('settings', null); }
  else { settings = { band:remote.band, unit:remote.unit, rounds:remote.rounds, speak:remote.speak, timer:(localSettings && localSettings.timer) || 'normal' }; store.set('settings', settings); }
}

async function enterApp(){
  renderLoading('Loading your account...');
  try{ await loadAccount(); }
  catch(e){
    const c = store.get('acct', null);
    if(isNetworkErr(e) && c && sessionUser && c.uid===sessionUser.id && Date.now()-c.at < 7*864e5){
      account = c.account; settings = store.get('settings', null); pin = store.get('pin', '1234');
    } else { renderLoadError(e); return; }
  }
  if(!entitled(account)){ renderPaywall(); return; }
  routeIntoApp();
}

async function doSignOut(){
  try{ await sb.auth.signOut({ scope:'local' }); }catch(e){}
  try{ Object.keys(localStorage).filter(k=>k.indexOf('sq_')===0 && k!=='sq_theme').forEach(k=>localStorage.removeItem(k)); }catch(e){}
  settings = null; play = null; exploreOn = false; pin = '1234'; account = null; sessionUser = null; recovering = false;
  renderAuth('in');
}

function renderLoading(msg){ show(authTop()+`<div class="wrap center" style="padding-top:60px"><p class="sub">${esc(msg)}</p></div>`); }
function renderConfigError(msg){ show(authTop()+`<div class="wrap" style="max-width:540px"><div class="card"><h2>Can't start</h2><p>${esc(msg)}</p><div class="row"><button class="btn go" id="retry">Refresh</button></div></div></div>`); document.getElementById('retry').onclick=()=>location.reload(); }
function renderLoadError(e){
  show(authTop()+`<div class="wrap" style="max-width:540px"><div class="card"><h2>We couldn't load your account</h2><p>${esc(friendly(e))}</p><div class="row"><button class="btn go" id="again">Try again</button><button class="btn plain" id="out">Sign out</button></div></div></div>`);
  document.getElementById('again').onclick=enterApp;
  document.getElementById('out').onclick=doSignOut;
}
function renderPaywall(){
  show(authTop()+`<div class="wrap" style="max-width:540px"><div class="card center"><div style="font-size:52px">⏰</div><h1>Your free trial has ended</h1>
    <p class="sub">${esc(account && account.email || '')}</p>
    <p>Subscription checkout is being set up. Once it's open, you'll be able to subscribe here and pick up right where you left off.</p>
    <div class="row"><button class="btn go" id="again">Check again</button><button class="btn plain" id="out">Sign out</button></div></div></div>`);
  document.getElementById('again').onclick=enterApp;
  document.getElementById('out').onclick=doSignOut;
}
function renderCheckEmail(email){
  show(authTop()+`<div class="wrap" style="max-width:540px"><div class="card center"><div style="font-size:52px">📬</div><h1>Check your email</h1>
    <p>We sent a confirmation link to <strong>${esc(email)}</strong>. Tap it, then come back and sign in. It can take a few minutes, and it may land in spam.</p>
    <div class="row"><button class="btn go" id="back">Back to sign in</button></div></div></div>`);
  document.getElementById('back').onclick=()=>renderAuth('in');
}

function renderAuth(mode, notice){
  mode = mode || 'in';
  const signin = mode==='in';
  show(authTop()+`<div class="wrap" style="max-width:540px">
    <h1>${signin?'Welcome back':'Start your free trial'}</h1>
    <p class="sub">${signin?'Sign in to open Bench Boost on this device.':'Create a teacher account. Your 14-day trial starts right away.'}</p>
    <div class="card">
      <div class="chips"><button class="chip ${signin?'on':''}" data-m="in">Sign in</button><button class="chip ${!signin?'on':''}" data-m="up">Create account</button></div>
      ${notice?`<div class="sendok">${esc(notice)}</div>`:''}
      ${field('aEmail','Email','email','inputmode="email" autocomplete="email" placeholder="you@school.org"')}
      ${field('aPass','Password','password',`autocomplete="${signin?'current-password':'new-password'}" placeholder="${signin?'Your password':'At least 8 characters'}"`)}
      <p class="err" role="alert" id="aErr" style="display:none"></p>
      <div class="row" style="margin-top:16px"><button class="btn go" id="aGo">${signin?'Sign in':'Create account'}</button></div>
      ${signin?`<p class="hint"><button class="linkbtn" id="aForgot">Forgot your password?</button></p>`:''}
    </div></div>`);
  const err = document.getElementById('aErr'), go_ = document.getElementById('aGo');
  const showErr = m => { err.textContent = m; err.style.display = 'block'; };
  const busy = on => { go_.disabled = on; go_.textContent = on ? 'Working...' : (signin?'Sign in':'Create account'); };
  app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>renderAuth(b.dataset.m));
  const fg = document.getElementById('aForgot'); if(fg) fg.onclick=renderReset;
  async function submit(){
    const email = document.getElementById('aEmail').value.trim(), pass = document.getElementById('aPass').value;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr('Enter a valid email address.');
    if(signin && !pass) return showErr('Enter your password.');
    if(!signin && pass.length < 8) return showErr('Use a password with at least 8 characters.');
    err.style.display = 'none'; busy(true);
    try{
      if(signin){
        const { data, error } = await sb.auth.signInWithPassword({ email, password:pass });
        if(error) throw error;
        sessionUser = data.user || (data.session && data.session.user);
        await enterApp();
      } else {
        const opts = redirectUrl() ? { emailRedirectTo: redirectUrl() } : {};
        const { data, error } = await sb.auth.signUp({ email, password:pass, options:opts });
        if(error) throw error;
        if(data.user && data.user.identities && data.user.identities.length===0) throw new Error('User already registered');
        if(data.session){ sessionUser = data.session.user; await enterApp(); }
        else renderCheckEmail(email);
      }
    }catch(e){ busy(false); showErr(friendly(e)); }
  }
  go_.onclick = submit;
  ['aEmail','aPass'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } }));
  document.getElementById('aEmail').focus();
}

function renderReset(){
  show(authTop()+`<div class="wrap" style="max-width:540px"><h1>Reset your password</h1>
    <p class="sub">Enter your account email and we'll send a link to choose a new password.</p><div class="card">
    ${field('rEmail','Email','email','inputmode="email" autocomplete="email"')}
    <p class="err" role="alert" id="rErr" style="display:none"></p><div class="sendok" id="rOk" style="display:none"></div>
    <div class="row" style="margin-top:16px"><button class="btn go" id="rGo">Send reset link</button><button class="btn plain" id="rBack">Back to sign in</button></div></div></div>`);
  document.getElementById('rBack').onclick=()=>renderAuth('in');
  document.getElementById('rGo').onclick=async()=>{
    const email = document.getElementById('rEmail').value.trim(), err = document.getElementById('rErr'), ok = document.getElementById('rOk');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent='Enter a valid email address.'; err.style.display='block'; return; }
    err.style.display='none';
    try{
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
      if(error && (isNetworkErr(error) || /rate|too many/i.test(error.message))) throw error;
      ok.textContent = "If that email has an account, a reset link is on its way. It can take a few minutes."; ok.style.display='block';
    }catch(e){ err.textContent = friendly(e); err.style.display='block'; }
  };
}

function renderNewPassword(){
  show(authTop()+`<div class="wrap" style="max-width:540px"><h1>Choose a new password</h1><div class="card">
    ${field('nPass','New password','password','autocomplete="new-password" placeholder="At least 8 characters"')}
    ${field('nPass2','Type it again','password','autocomplete="new-password"')}
    <p class="err" role="alert" id="nErr" style="display:none"></p>
    <div class="row" style="margin-top:16px"><button class="btn go" id="nGo">Save password</button></div></div></div>`);
  document.getElementById('nGo').onclick=async()=>{
    const a = document.getElementById('nPass').value, b = document.getElementById('nPass2').value, err = document.getElementById('nErr');
    const bad = m => { err.textContent = m; err.style.display='block'; };
    if(a.length < 8) return bad('Use a password with at least 8 characters.');
    if(a !== b) return bad("The two passwords don't match.");
    try{
      const { error } = await sb.auth.updateUser({ password:a });
      if(error) throw error;
      recovering = false;
      const { data } = await sb.auth.getSession();
      if(data && data.session){ sessionUser = data.session.user; await enterApp(); } else renderAuth('in', 'Password updated. Sign in with your new password.');
    }catch(e){ bad(friendly(e)); }
  };
}

function accountCardHTML(confirmOut){
  if(!account) return '';
  return `<div class="card"><h2>Account</h2><p style="margin:0;font-weight:700">${esc(account.email||'')}</p><p class="hint" style="margin-top:4px">${esc(trialLine())}</p>
    <div class="row" style="margin-top:12px">${confirmOut
      ? `<button class="btn warn" id="signoutYes">Sign out and clear this device</button><button class="btn plain" id="signoutNo">Stay signed in</button>`
      : `<button class="btn plain" id="signout">Sign out</button>`}</div>
    <p class="hint">Signing out removes your settings and any saved reports from this device.</p></div>`;
}

async function boot(){
  if(!window.supabase || !window.supabase.createClient){ renderConfigError("Couldn't load the sign-in service. Check your internet connection and refresh."); return; }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });
  sb.auth.onAuthStateChange((event, session)=>{
    if(event==='PASSWORD_RECOVERY'){ sessionUser = session && session.user; recovering = true; renderNewPassword(); }
  });
  renderLoading('Loading...');
  let res;
  try{ res = await sb.auth.getSession(); }catch(e){ res = { data:{ session:null } }; }
  if(recovering) return;
  const session = res && res.data && res.data.session;
  if(session){ sessionUser = session.user; await enterApp(); } else renderAuth('in');
}

