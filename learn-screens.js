"use strict";
/*
 * learn-screens.js - the Learn screens of Student Explore (Phase 2B): short one-idea cards with visible Previous / Next buttons
 * (never swipe-only), then a "ready to try Quick 10?" screen. The card TEXT lives in data/learn.js, not here.
 */
let learn = null;   /* { t: topic, cards: [...], i: index of the card showing } */

function startLearn(t){
  learn = { t:t, cards:learnFor(t.id, play.band), i:0 };
  if(!learn.cards.length){ renderHub(); return; }
  renderLearnCard();
}
function learnSpeech(c){ return c.title + '. ' + c.content.replace(/\n/g, ' '); }

function renderLearnCard(){
  const L = learn, c = L.cards[L.i], n = L.cards.length, first = L.i === 0, last = L.i === n - 1;
  const dots = L.cards.map(function(_, k){ return `<i class="${k < L.i ? 'ok' : k === L.i ? 'now' : ''}"></i>`; }).join('');
  const paras = c.content.split('\n').map(function(p){ return `<p>${esc(p)}</p>`; }).join('');
  view.html = topBar(true) + `<div class="wrap explore learn">
    <div class="qbar"><span>Learn</span><span>Card ${L.i + 1} of ${n}</span></div>
    <div class="track" aria-hidden="true">${dots}</div>
    <div class="card lcard">
      <div class="qhead"><div><div class="licon" aria-hidden="true">${c.icon}</div><h1 class="ltitle" tabindex="-1"><span class="sr-only">Card ${L.i + 1} of ${n}. </span>${esc(c.title)}</h1></div>
      ${canSpeak ? `<button class="speak" id="say" aria-label="Read this card aloud">🔊</button>` : ''}</div>
      <div class="lbody">${paras}</div>
    </div>
    <div class="row lnav"><button class="btn plain" id="lPrev" ${first ? 'disabled' : ''}>← Previous</button><button class="btn go" id="lNext">${last ? 'Finish' : 'Next →'}</button></div>
  </div>`;
  bindGear();
  const say = document.getElementById('say'); if(say) say.onclick = function(){ speak(learnSpeech(c)); };
  document.getElementById('lPrev').onclick = function(){ if(L.i > 0){ L.i--; go(renderLearnCard); } };
  document.getElementById('lNext').onclick = function(){ if(last) go(renderLearnEnd); else { L.i++; go(renderLearnCard); } };
  if(play.speak) speak(learnSpeech(c));
}

function renderLearnEnd(){
  const L = learn, k2 = play.band === 'k2';
  view.html = topBar(true) + `<div class="wrap explore">
    <div class="card center" style="padding:30px 20px">
      <div style="font-size:60px" aria-hidden="true">🎉</div>
      <h1>Ready to try Quick 10?</h1>
      <p class="sub">${k2 ? 'Ten questions about ' + esc(L.t.name) + '.' : `You read ${L.cards.length} cards about ${esc(L.t.name)}. Now see what stuck. Ten questions, with an explanation after each one.`}</p>
    </div>
    <div class="row"><button class="btn go" id="toQuick">Start Quick 10</button></div>
    <div class="row"><button class="btn plain" id="again">Read again</button><button class="btn plain" id="home">Back to topic</button></div>
  </div>`;
  bindGear();
  announce('You finished the Learn cards. Ready to try Quick 10?');
  document.getElementById('toQuick').focus({ preventScroll:true });
  document.getElementById('toQuick').onclick = function(){ chainTo('quick10'); };
  document.getElementById('again').onclick = function(){ L.i = 0; go(renderLearnCard); };
  document.getElementById('home').onclick = function(){ go(renderHub); };
  if(play.speak) speak('Ready to try Quick 10?');
}
