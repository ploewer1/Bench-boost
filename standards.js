/*
 * Standards data.
 *
 * STANDARDS is intentionally EMPTY. No question is aligned to any standard yet.
 * When standards are added, each entry must be checked against the official document, and questions
 * link to entries by id through their "standards" array. Never add an entry that has not been verified.
 *
 *   { id:"", framework:"", code:"", text:"", sourceUrl:"", verifiedOn:"YYYY-MM-DD", verifiedBy:"" }
 */
const STANDARDS = [];

/*
 * UNIT_AREA_LABELS: the unit-level labels the app has always shown in teacher setup.
 * These are a rough grouping chosen by the developer. They are NOT a verified standards alignment and
 * should not be presented as one. They are also stored as each question's "domain" until real
 * standards mapping happens in the Content phase.
 */
const UNIT_AREA_LABELS = {
  "rules": "VA PE strand: Responsible Behaviors",
  "coop": "VA PE strand: Responsible Behaviors",
  "move": "VA PE strand: Movement Principles & Concepts",
  "throw": "VA PE strand: Skilled Movement",
  "dance": "VA PE strand: Skilled Movement",
  "sports": "VA PE strand: Movement Principles & Concepts",
  "fitness": "VA PE strand: Personal Fitness",
  "testing": "VA PE strand: Personal Fitness",
  "active": "VA PE strand: Physically Active Lifestyle",
  "nutrition": "VA Health topic: Nutrition",
  "body": "VA Health topic: Body Systems",
  "habits": "VA Health topic: Physical Health",
  "hygiene": "VA Health topic: Disease Prevention",
  "mental": "VA Health topic: Mental Wellness & SEL",
  "violence": "VA Health topic: Violence Prevention",
  "safety": "VA Health topic: Safety & Injury Prevention",
  "substance": "VA Health topic: Substance Abuse Prevention",
  "community": "VA Health topic: Community & Environmental Health"
};

if (typeof module !== 'undefined' && module.exports) { module.exports = { STANDARDS, UNIT_AREA_LABELS }; }
