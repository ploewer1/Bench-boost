"use strict";
/*
 * accessibility.js - screen-reader announcements, focus management, and timer preferences.
 *
 * view.html = "<markup>"   replaces the app screen (used instead of app.innerHTML) and then:
 *   - if this is a NEW screen (different main heading / question text) and the person has already interacted:
 *     focus moves to that heading or question (never during the first page load)
 *   - if it is the SAME screen redrawn (a chip was clicked, an answer was chosen): focus returns to the same
 *     control if it still exists, otherwise lands on the app container - never on the page body
 * announce("text")         speaks a message through a polite live region (announce(text, true) = assertive)
 * timerConfig()            the teacher's timer choice: normal / extended (+50%) / off
 */

/* ---- live announcements ---- */
function announce(msg, assertive){
  const el = document.getElementById(assertive ? 'live-assertive' : 'live-polite');
  if(!el) return;
  el.textContent = '';                      /* clear first so repeating the same message is still announced */
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.textContent = msg; }, 30);
}

/* ---- focus helpers ---- */
const FOCUS_TARGETS = '.qtext, .sortitem, .scoreline, h1';
function describeFocus(){
  const a = document.activeElement;
  if(!a || a === document.body || a === app || !app.contains(a)) return null;
  const d = { id: a.id || null, attrs: [] };
  for(let i = 0; i < a.attributes.length; i++){
    const at = a.attributes[i];
    if(at.name.indexOf('data-') === 0) d.attrs.push([at.name, at.value]);
  }
  return d;
}
function restoreFocus(d){
  let el = null;
  try{
    if(d.id) el = document.getElementById(d.id);
    if(!el && d.attrs.length) el = app.querySelector('[' + d.attrs.map(function(x){ return x[0] + '="' + x[1] + '"'; }).join('][') + ']');
  }catch(e){ el = null; }
  if(el && !el.disabled){ el.focus({ preventScroll:true }); return true; }
  return false;
}
function screenSignature(){
  const el = app.querySelector(FOCUS_TARGETS);
  return el ? el.className + '|' + el.textContent.trim() : null;
}
function focusScreen(){
  const t = app.querySelector(FOCUS_TARGETS) || app;
  t.setAttribute('tabindex', '-1');
  try{ t.focus({ preventScroll:true }); }catch(e){}
}

/* Focus only moves after the person has actually done something. On a fresh page load focus stays at the very top,
   so the first Tab stop is the "Skip to main content" link and screen readers start reading from the beginning. */
let userActed = false;
['pointerdown', 'touchstart', 'click', 'keydown'].forEach(function(ev){ document.addEventListener(ev, function(){ userActed = true; }, true); });

const view = {
  _sig: null,
  set html(markup){
    const prev = describeFocus();
    app.innerHTML = markup;
    const sig = screenSignature();
    const same = sig !== null && sig === this._sig;
    this._sig = sig;
    if(same){
      if(prev && restoreFocus(prev)) return;
      const a = document.activeElement;
      if(!a || a === document.body || !app.contains(a)) app.focus({ preventScroll:true });
      return;
    }
    if(userActed) focusScreen();
  },
  get html(){ return app.innerHTML; }
};

/* ---- timed activities ---- */
/* settings.timer: "normal" (default) | "extended" (+50% time) | "off" (no clock at all) */
function timerConfig(){
  const mode = (settings && settings.timer) || 'normal';
  const base = settings && settings.band === 'k2' ? 90 : 60;
  if(mode === 'off') return { mode:'off', secs:0 };
  if(mode === 'extended') return { mode:'extended', secs:Math.round(base * 1.5) };
  return { mode:'normal', secs:base };
}
