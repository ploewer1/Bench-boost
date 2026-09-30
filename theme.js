"use strict";
/*
 * theme.js - the manual Light / Dark / System choice (Phase 2C).
 * "system" (the default) follows the device. "light" and "dark" set data-theme on <html>; css/app.css already defines both.
 * The choice is stored ONLY on this device (localStorage sq_theme) and is never sent to the database. It is a display
 * preference, not student data, so signing out keeps it. index.html applies a saved choice in <head> before first paint.
 */
const THEMES = ['system', 'light', 'dark'];
function getTheme(){ const t = store.get('theme', 'system'); return THEMES.indexOf(t) >= 0 ? t : 'system'; }
function applyTheme(t){
  const root = document.documentElement;
  if(t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
  const dark = t === 'dark' || (t !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', dark ? '#0A1220' : '#1B2A4A');
}
function setTheme(t){
  if(THEMES.indexOf(t) < 0) return;
  store.set('theme', t); applyTheme(t);
  announce({ system:'Theme: follows your device.', light:'Light theme on.', dark:'Dark theme on.' }[t]);
  document.querySelectorAll('[data-theme-opt]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.themeOpt === t ? 'true' : 'false'); });
}
/* the small three-way control shown at the bottom of the Explore home */
function themeControlHTML(){
  const cur = getTheme(), name = { system:'System', light:'Light', dark:'Dark' };
  return `<div class="themepick" role="group" aria-label="Color theme"><span class="themelabel" aria-hidden="true">Theme</span>${THEMES.map(function(t){
    return `<button class="themeopt" data-theme-opt="${t}" aria-pressed="${t === cur}">${name[t]}</button>`; }).join('')}</div>`;
}
function bindThemeControl(){ document.querySelectorAll('[data-theme-opt]').forEach(function(b){ b.onclick = function(){ setTheme(b.dataset.themeOpt); }; }); }
applyTheme(getTheme());
if(window.matchMedia){ try{ window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){ applyTheme(getTheme()); }); }catch(e){} }
