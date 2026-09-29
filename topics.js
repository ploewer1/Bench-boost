/*
 * Student-facing topics for Student Explore (Phase 2A).
 *
 * A topic is what a student taps on. It points at one or more existing UNITS (data/units.js), which own the question
 * bank and generators. NOTHING here contains questions, so no question bank can be orphaned or duplicated:
 * tests/explore.test.js proves that every unit (and therefore every written question) is reachable from a topic.
 *
 *   id        stable key used in the address (#/t/fitness). Never reuse or rename.
 *   subject   "PE" | "Health"
 *   units     unit ids whose questions and generators this topic plays (more than one = played together)
 *   name      what the student sees
 *   icon      one emoji
 *   blurb     one sentence for grades 3-12          blurbK2   a few simple words for K-2
 *
 * A topic with no content for the student's grade band is not shown, so future topics (for example Digital Wellness)
 * can be listed here before their questions exist without ever appearing as an empty card.
 *
 * The Teacher Kiosk does NOT use topics: it still lets the teacher pick any single unit or a review mix.
 */
const SUBJECTS = {
  PE:     { name:'Physical Education', icon:'🏃', blurb:'Move, play, build skills, and understand fitness.', blurbK2:'Move and play.' },
  Health: { name:'Health',             icon:'❤️', blurb:'Learn how to keep your body and mind healthy.',     blurbK2:'Stay healthy.' }
};

const TOPICS = [
  /* ---- Physical Education ---- */
  { id:'movement',      subject:'PE', units:['move'],           name:'Movement Skills',              icon:'🏃', blurb:'Learn how your body moves: traveling, balancing, and using space and effort.', blurbK2:'How your body moves.' },
  { id:'fitness',       subject:'PE', units:['fitness'],        name:'Fitness',                      icon:'💪', blurb:'Learn how your heart, lungs, and muscles work together to keep you active.',    blurbK2:'Get strong and stay active.' },
  { id:'teamwork',      subject:'PE', units:['coop','rules'],   name:'Teamwork & Sportsmanship',     icon:'🤝', blurb:'Play fair, work as a team, and stay safe in the gym.',                          blurbK2:'Play fair. Work together.' },
  { id:'throwing',      subject:'PE', units:['throw'],          name:'Throwing, Catching & Kicking', icon:'⚾', blurb:'Build the skills for throwing, catching, kicking, and dribbling.',               blurbK2:'Throw, catch, and kick.' },
  { id:'sports',        subject:'PE', units:['sports'],         name:'Sports & Game Strategy',       icon:'🏆', blurb:'Learn how games work and how to play smart.',                                    blurbK2:'How games work.' },
  { id:'dance',         subject:'PE', units:['dance'],          name:'Dance, Rhythm & Gymnastics',   icon:'🤸', blurb:'Move to the beat and learn balance, rolling, and creative movement.',            blurbK2:'Dance, roll, and balance.' },
  { id:'testing',       subject:'PE', units:['testing'],        name:'Fitness Testing & Goals',      icon:'📊', blurb:'Learn how fitness is measured and how to set goals for yourself.',              blurbK2:'Try, practice, and grow.' },
  { id:'active',        subject:'PE', units:['active'],         name:'Active Lifestyle',             icon:'🚴', blurb:'Find ways to be active every day at school, at home, and in your community.',    blurbK2:'Move every day.' },

  /* ---- Health ---- */
  { id:'habits',        subject:'Health', units:['habits','hygiene'], name:'Healthy Habits',                 icon:'🧼', blurb:'Sleep, screens, checkups, and staying clean and germ-free.',               blurbK2:'Sleep well. Wash up.' },
  { id:'nutrition',     subject:'Health', units:['nutrition'],        name:'Nutrition & Hydration',          icon:'🍎', blurb:'Learn what foods and drinks give your body the fuel it needs.',            blurbK2:'Foods that help you grow.' },
  { id:'body',          subject:'Health', units:['body'],             name:'Human Body',                     icon:'🦴', blurb:'Explore your heart, lungs, bones, and muscles and how they work.',         blurbK2:'How your body works.' },
  { id:'mental',        subject:'Health', units:['mental'],           name:'Mental & Emotional Wellness',    icon:'🧠', blurb:'Understand your feelings and learn healthy ways to handle stress.',        blurbK2:'Feelings and calm-down tools.' },
  { id:'safety',        subject:'Health', units:['safety'],           name:'Safety & First Aid',             icon:'⛑️', blurb:'Learn how to stay safe and what to do when someone is hurt.',              blurbK2:'Stay safe. Get help.' },
  { id:'relationships', subject:'Health', units:['violence'],         name:'Relationships & Social Health',  icon:'🤗', blurb:'Learn about respect, bullying, and healthy ways to treat each other.',     blurbK2:'Be kind. Get help.' },
  { id:'substances',    subject:'Health', units:['substance'],        name:'Medicine & Substance Safety',    icon:'💊', blurb:'Use medicine safely and make smart choices about tobacco, vaping, alcohol, and drugs.', blurbK2:'Medicine safety.' },
  { id:'community',     subject:'Health', units:['community'],        name:'Community & Environmental Health', icon:'🌎', blurb:'See how clean air, clean water, and healthy communities help everyone stay well.', blurbK2:'Keep our world clean.' }
];

/* The id the game engines use for a topic: a single-unit topic plays that unit directly (so a device's
   "questions already seen" list is shared with the Teacher Kiosk); a multi-unit topic uses "topic:<id>". */
function topicPlayId(t){ return t.units.length === 1 ? t.units[0] : 'topic:' + t.id; }
function topicById(id){ return TOPICS.find(t => t.id === id) || null; }

if (typeof module !== 'undefined' && module.exports) { module.exports = { SUBJECTS, TOPICS, topicPlayId, topicById }; }
