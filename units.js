/*
 * Units (topics) and shared UI lists.
 * "topic" in the question bank == unit id here.
 * Questions live in data/questions.js. Generated-question templates live in data/generators.js.
 */
const BANDS = {"k2":"Grades K–2","g35":"Grades 3–5","g68":"Grades 6–8","g912":"Grades 9–12"};

const UNITS = [
  { id:"rules", code:"RUL", cat:"PE", icon:"🤝", name:"Rules, Safety & Sportsmanship" },
  { id:"coop", code:"COP", cat:"PE", icon:"🧩", name:"Cooperation & Teamwork" },
  { id:"move", code:"MOV", cat:"PE", icon:"🏃", name:"Movement Skills & Concepts" },
  { id:"throw", code:"THR", cat:"PE", icon:"⚾", name:"Throwing, Catching & Kicking" },
  { id:"dance", code:"DAN", cat:"PE", icon:"🤸", name:"Dance, Rhythm & Gymnastics" },
  { id:"sports", code:"SPT", cat:"PE", icon:"🏆", name:"Sports & Game Strategy" },
  { id:"fitness", code:"FIT", cat:"PE", icon:"💪", name:"Fitness Components" },
  { id:"testing", code:"TST", cat:"PE", icon:"📊", name:"Fitness Testing & Goals" },
  { id:"active", code:"ACT", cat:"PE", icon:"🚴", name:"Active Lifestyle" },
  { id:"nutrition", code:"NUT", cat:"Health", icon:"🍎", name:"Nutrition" },
  { id:"body", code:"BOD", cat:"Health", icon:"❤️", name:"Body Systems & Heart Health" },
  { id:"habits", code:"HAB", cat:"Health", icon:"😴", name:"Healthy Habits: Sleep, Screens & Checkups" },
  { id:"hygiene", code:"HYG", cat:"Health", icon:"🧼", name:"Hygiene & Disease Prevention" },
  { id:"mental", code:"MEN", cat:"Health", icon:"🧠", name:"Mental & Emotional Health" },
  { id:"violence", code:"VIO", cat:"Health", icon:"🛡️", name:"Violence & Bullying Prevention" },
  { id:"safety", code:"SAF", cat:"Health", icon:"⛑️", name:"Safety & First Aid" },
  { id:"substance", code:"SUB", cat:"Health", icon:"🚭", name:"Medicine & Substance Safety" },
  { id:"community", code:"COM", cat:"Health", icon:"🌎", name:"Community & Environmental Health" }
];

const MIX = [
  { id:"mix-pe", icon:"🎲", name:"Mix: All PE Units" },
  { id:"mix-health", icon:"🎲", name:"Mix: All Health Units" },
  { id:"mix-all", icon:"🌟", name:"Mix: Everything" }
];

const PROMPTS = {
  k2:[
    { p:"Watch your class. What level are they moving at?", c:["⬆️ High","➡️ Medium","⬇️ Low"] },
    { p:"Find someone being a good sport. What are they doing?", c:["🤝 Kind words","🙌 Cheering","🔄 Taking turns"] },
    { p:"What pathway is your class moving in?", c:["➖ Straight","〰️ Curvy","⚡ Zigzag"] },
    { p:"How does your class look right now?", c:["😀 Having fun","💪 Working hard","😮‍💨 Tired"] },
    { p:"Is anyone helping a friend?", c:["👍 Yes!","👀 Still looking"] },
    { p:"What equipment is your class using?", c:["⚽ Balls","⭕ Hoops","🔶 Cones","🎽 Something else"] },
    { p:"How fast is your class moving?", c:["🐢 Slow","🐇 Medium","🚀 Fast"] }
  ],
  g35:[
    "Name one skill a classmate is doing well. What makes it good?",
    "Write down one example of good sportsmanship you saw.",
    "Which fitness component is the class working on right now? How can you tell?",
    "If you were playing, what strategy would you try?",
    "How is one team communicating? Write something they said or did.",
    "What's one rule of today's game, and why does it matter?"
  ],
  g68:[
    "Describe the movement pattern of one skill being practiced. What are the key cues?",
    "Which fitness component(s) does today's activity develop? Explain.",
    "Watch one team's strategy. What's working, and what would you change?",
    "Record one example of leadership or teamwork you saw.",
    "Is today's activity light, moderate, or vigorous? What evidence do you see?",
    "What safety rule matters most in this activity, and why?"
  ],
  g912:[
    "Analyze one skill: describe its preparation, execution, and follow-through.",
    "Which FITT variables (frequency, intensity, time, type) does today's activity target?",
    "Evaluate a team's offensive or defensive tactics. Suggest one improvement.",
    "Identify an example of effective communication or leadership. What impact did it have?",
    "How could this activity be modified to include a student with a different ability level?",
    "Design a warm-up that would prepare the class for today's activity."
  ]
};

if (typeof module !== 'undefined' && module.exports) { module.exports = { BANDS, UNITS, MIX, PROMPTS }; }
