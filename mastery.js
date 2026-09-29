"use strict";
/*
 * mastery.js - the Mastery rule and where a device remembers it (Phase 2B).
 *
 * A student "masters" a topic at their grade band by scoring MASTERY_PERCENT (80%) or better on a Mastery round.
 * The result is remembered ON THIS DEVICE ONLY, anonymously, under the localStorage key sq_mastery:
 *     { "<gradeBand>|<topicId>": { mastered: true|false, bestPct: 0-100, tries: n } }
 * No name, no account, and nothing is sent to the database. Different grade bands never share a record.
 * Signing out clears it with every other sq_ key. This file is the ONLY place that reads or writes it, so moving
 * progress to a parent/teacher system later means changing this file, not the screens.
 */
const MASTERY_PERCENT = 80;      /* score at or above this = mastered */
const MASTERY_LENGTH = 10;       /* questions in a Mastery round */

/* integer math on purpose: 8 of 10 passes, 7 of 10 does not, and there is no rounding to argue about */
function masteryPassed(correct, of){ return of > 0 && correct * 100 >= of * MASTERY_PERCENT; }
function masteryNeeded(of){ return Math.ceil(of * MASTERY_PERCENT / 100); }
function masteryKey(band, topicId){ return band + '|' + topicId; }
function getMastery(band, topicId){ return (store.get('mastery', {}))[masteryKey(band, topicId)] || null; }
function isMastered(band, topicId){ const r = getMastery(band, topicId); return !!(r && r.mastered); }

/* Save one finished Mastery round. Returns { passed, firstTime, record }. */
function recordMastery(band, topicId, correct, of){
  const all = store.get('mastery', {}), k = masteryKey(band, topicId);
  const prev = all[k] || { mastered:false, bestPct:0, tries:0 };
  const passed = masteryPassed(correct, of), pct = of ? Math.round(100 * correct / of) : 0;
  const rec = { mastered:prev.mastered || passed, bestPct:Math.max(prev.bestPct, pct), tries:prev.tries + 1 };
  all[k] = rec; store.set('mastery', all);
  return { passed:passed, firstTime:passed && !prev.mastered, record:rec };
}
