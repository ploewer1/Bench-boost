"use strict";
/* Loaded in <head>, before the page paints: applies a saved Light/Dark choice so there is no flash of the wrong theme.
   "System" (the default) sets nothing. The full theme logic is in theme.js. */
try{ var t = JSON.parse(localStorage.getItem('sq_theme')); if(t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); }catch(e){}
