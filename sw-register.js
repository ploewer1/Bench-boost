'use strict';
/* Registers the offline helper (sw.js). It only runs on the real web address, never when a file is opened from disk. */
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js', { updateViaCache:'none' }).catch(function(){ /* offline mode is a bonus; the app works without it */ });
  });
}
