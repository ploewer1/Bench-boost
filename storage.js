"use strict";
/*
 * storage.js - per-device storage and the app's saved state.
 * Everything here stays on the device (browser localStorage). Nothing is sent to a server.
 * Keys are prefixed "sq_" (kept from earlier versions so existing devices keep their settings).
 */
const store = {
  get(k, d){ try{ const v = localStorage.getItem('sq_'+k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('sq_'+k, JSON.stringify(v)); }catch(e){} }
};


/* ---------- state ---------- */
let settings = store.get('settings', null);
let pin = store.get('pin', '1234');
let quiz = null, rep = null;
/* play = the settings the game engines are using RIGHT NOW: { band, unit, rounds, speak, timer, explore? }.
   Teacher kiosk: play IS the teacher's saved settings. Student Explore: play is built from the student's grade band and topic.
   The saved teacher settings above are never changed by Student Explore. */
let play = null;

