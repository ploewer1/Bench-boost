/*
 * Learn cards for Student Explore (Phase 2B).
 *
 * WHAT THIS IS: short, one-idea-per-card explanations shown by the Learn button on a topic page. Cards are written for
 * each topic x grade band (k2, g35, g68, g912) and the wording DIFFERS by band (K-2: a few simple words; 3-5: short with
 * an example; 6-8: more academic terms; 9-12: more precise). They are derived from the concepts already taught by the
 * question bank (data/questions.js) for the units each topic plays (data/topics.js). No new curriculum was invented.
 *
 * STATUS: every card is "unreviewed". Nothing here has been checked by an educator or against a standards document,
 * and it must not be described as reviewed, verified, or standards-aligned. See docs/LEARN_CONTENT.md.
 *
 * CARD SHAPE (built by add() below):
 *   id        LRN-<TOPIC>-<BAND>-<NN>, permanent once used
 *   topic     a topic id from data/topics.js          gradeBand  k2 | g35 | g68 | g912
 *   order     position in the sequence                 icon       one emoji
 *   title     short heading (shown as the card's h1)   content    the text; "\n" starts a new line/paragraph
 *   source    where the wording came from             status     "unreviewed" | "reviewed" (only after a real review)
 *
 * TO EDIT: change the text in the add(...) lists below. TO ADD A CARD: append an [icon, title, content] row to the right
 * list. Keep K-2 cards to about 20 words. `npm test` checks the shape, the word limits and that no claims sneak in.
 * (Write content inside backticks; use \n for a line break. Do not put a backtick or ${ inside a card.)
 */
const LEARN = (function () {
  const out = [];
  const SOURCE = 'Written for Bench Boost from concepts in the question bank; not independently sourced or reviewed.';
  function add(topic, band, cards) {
    cards.forEach(function (c, i) {
      out.push({ id: 'LRN-' + topic.toUpperCase() + '-' + band.toUpperCase() + '-' + String(i + 1).padStart(2, '0'),
        topic: topic, gradeBand: band, order: i + 1, icon: c[0], title: c[1], content: c[2], source: SOURCE, status: 'unreviewed' });
    });
  }

  /* ============================== PHYSICAL EDUCATION ============================== */

  /* ---- Movement Skills (unit: move) ---- */
  add('movement', 'k2', [
    ['🦘', 'Hop and jump', `A hop uses one foot.\nA jump lands on two feet.`],
    ['🐎', 'Ways to travel', `Skip is a step and a hop.\nSlide moves sideways.\nGallop keeps one foot in front.`],
    ['📏', 'High and low', `High level: reach up tall.\nLow level: stay close to the floor.`],
    ['〰️', 'Pathways', `A pathway is the line you move along.\nIt can be straight, curved, or zigzag.`]
  ]);
  add('movement', 'g35', [
    ['🦘', 'Hop or jump?', `A hop takes off and lands on one foot. A jump uses both feet.\nLand softly with bent knees to protect your joints.`],
    ['🏃', 'Locomotor skills', `Locomotor skills move you from place to place: run, gallop, slide, skip, and leap.\nA leap pushes off one foot and lands on the other.`],
    ['🧍', 'Moving in place', `Non-locomotor movements happen in one spot, like twisting, bending, and stretching.\nGeneral space is all the open space everyone can use.`],
    ['🧭', 'Levels, directions, pathways', `Levels are high, medium, or low. Directions include forward, backward, and sideways.\nPathways can be straight, curved, or zigzag.`],
    ['💥', 'Force and speed', `Force is how strong or light a movement is. A stomp is strong force and a tiptoe is light.\nSpeed is how fast or slow you move.`]
  ]);
  add('movement', 'g68', [
    ['🧠', 'Movement concepts', `Movement concepts describe how the body moves: space (where), effort (time, force, and flow), and relationships (with people and objects).`],
    ['⚡', 'Effort: speed, force, flow', `Speed (time) is how fast you move. Force is how strong or light the movement is. Flow is whether movement is smooth or stop-and-start.`],
    ['🤝', 'Relationships', `Relationships describe how you move with others or objects. In leading and following, one partner moves and the other copies.`],
    ['🏃', 'Mature patterns', `A mature run swings the arms opposite the legs. A safe landing bends the knees to absorb force. Combining skills, like run, jump, and land, builds smooth sequences.`],
    ['🐢', 'Practice smartly', `Practice a skill slowly first to build correct form, then add speed. Agility, the ability to change direction quickly, helps you avoid defenders.`]
  ]);
  add('movement', 'g912', [
    ['⚖️', 'Stability', `A wider base of support, such as feet shoulder-width apart, makes you more stable. Bending your knees and widening your stance lowers your center of gravity.`],
    ['🔄', 'Opposition and follow-through', `Opposition means moving the arm opposite the leg, as in running or throwing. Follow-through adds accuracy and power and lowers injury risk.`],
    ['🦵', 'Absorbing force', `Bending your knees on landing spreads the force out over more time and more joints, which reduces the impact on any one of them.`],
    ['🎯', 'Open and closed skills', `A closed skill is done in a stable, predictable setting, like a free throw. An open skill is done in a changing setting, like dribbling past a defender.`],
    ['🔁', 'How skills are learned', `Game-like practice trains skills in conditions similar to real play. Feedback helps you correct errors. Sprinters lean forward at the start to move their center of gravity ahead.`]
  ]);

  /* ---- Fitness (unit: fitness) ---- */
  add('fitness', 'k2', [
    ['❤️', 'Your heart', `Your heart is a muscle.\nRunning makes it pump fast.`],
    ['💪', 'Strong muscles', `Climbing and wall push-ups make muscles stronger.`],
    ['🤸', 'Stretch', `Stretching helps your body be flexible (bendy).`],
    ['⏱️', 'Move every day', `Kids should be active about 60 minutes every day.\nDrink water when you play.`]
  ]);
  add('fitness', 'g35', [
    ['❤️', 'Cardiovascular endurance', `Your heart and lungs work together to deliver oxygen while you are active.\nRunning, swimming, biking, and jumping rope for several minutes build it.`],
    ['💪', 'Strength and endurance', `Muscular strength is how much force your muscles can produce, like in tug of war.\nMuscular endurance is how long they can keep working, like in a wall sit.`],
    ['🤸', 'Flexibility', `Flexibility is how far your joints can move. Yoga and stretching help build it.`],
    ['🖐️', 'The five parts of fitness', `The five health-related parts are cardio endurance, muscular strength, muscular endurance, flexibility, and body composition.`],
    ['🫀', 'Check your effort', `Your pulse shows how fast your heart is beating. Count your pulse or use the talk test to see how hard you are working.`]
  ]);
  add('fitness', 'g68', [
    ['🧩', 'Two kinds of fitness', `Health-related fitness: cardiorespiratory endurance, muscular strength, muscular endurance, flexibility, and body composition. Skill-related fitness includes reaction time, agility, balance, coordination, power, and speed.`],
    ['🧮', 'The FITT principle', `FITT helps you plan a workout: Frequency (how often), Intensity (how hard), Time (how long), and Type (what kind).`],
    ['📈', 'Overload and progression', `Overload means gradually doing more than your body is used to. Progression means increasing the difficulty step by step.`],
    ['🏋️', 'Building endurance', `Muscular endurance grows with many repetitions of a light load. The sit-and-reach test measures flexibility.`],
    ['⏰', 'How much activity', `Kids and teens ages 6-17 need at least 60 minutes of physical activity every day.`]
  ]);
  add('fitness', 'g912', [
    ['🫀', 'Heart rate and effort', `A common estimate of maximum heart rate is 220 minus your age. During vigorous activity, the talk test says you can say only a few words before pausing. Adults need at least 150 minutes of moderate aerobic activity a week.`],
    ['🔬', 'Aerobic and anaerobic', `Aerobic exercise uses oxygen to make energy for longer efforts. Anaerobic exercise is short, intense work that does not rely mainly on oxygen.`],
    ['📐', 'Training principles', `Specificity: train the component you want to improve. Reversibility: fitness gains fade when you stop training. Overload and progression: raise the demand gradually.`],
    ['💥', 'Power and body composition', `Plyometric exercises like box jumps develop power. Body composition is the proportion of fat mass to lean (fat-free) mass in the body.`],
    ['😴', 'Recovery', `Rest days let muscles repair and get stronger. Delayed onset muscle soreness (DOMS) is soreness that shows up after new or hard exercise.`]
  ]);

  /* ---- Teamwork & Sportsmanship (units: coop + rules) ---- */
  add('teamwork', 'k2', [
    ['🤝', 'Be a good partner', `Take turns and share.\nListen to your partner's idea.`],
    ['🎉', 'Cheer each other on', `Say, "Nice try! You can do it!"\nIf your team lost, say, "Good game!"`],
    ['🛑', 'Freeze and listen', `Freeze means stop and listen.\nUse equipment only when the teacher says.`],
    ['🩹', 'Play safe and fair', `Move carefully. Play fair.\nTell the teacher if you get hurt.`]
  ]);
  add('teamwork', 'g35', [
    ['🧩', 'Work as a team', `A cooperative challenge is won together. Make a plan first, share ideas, and try a new plan if the first one is not working.`],
    ['👂', 'Listen well', `Active listening means looking at the speaker and paying attention. Ask a quiet teammate for their idea to include them.`],
    ['🏅', 'Be a good sport', `A good sport plays fair and respects others. Winners say "good game" and stay humble. If you break a rule by accident, admit it and fix it.`],
    ['🚦', 'Gym safety', `A freeze signal lets everyone stop safely. Warm up before activity and drink water. Lift a heavy mat by bending your knees and lifting with your legs.`],
    ['🔁', 'Talk it over', `Teams talk about what worked so they can improve next time. If you disagree on a close call, stay calm and use rock-paper-scissors.`]
  ]);
  add('teamwork', 'g68', [
    ['👥', 'Group roles', `Roles such as planner, encourager, and timekeeper give everyone a clear job. Rotating roles lets everyone practice different skills.`],
    ['🗣️', 'Solve problems together', `Start by making sure everyone understands the problem. To settle a disagreement, listen to each side. Compromise means each side gives a little. Consensus is a decision everyone can accept.`],
    ['💬', 'Helpful feedback', `Helpful feedback is specific, kind, and useful, like "Try stepping toward the target." Trust matters because teammates rely on each other.`],
    ['🤝', 'Fair play', `Fair play means following the rules, being honest, and respecting opponents, such as shaking hands. Gamesmanship bends the rules or uses tricks to gain an edge.`],
    ['🦺', 'Safe play', `A cool-down gradually lowers your heart rate. Check equipment for damage and check your surroundings for space. Jewelry can catch on things, so take it off.`]
  ]);
  add('teamwork', 'g912', [
    ['👑', 'Leadership', `Inclusive leadership adapts a strategy so everyone can take part. Shared leadership means different members lead at different times. A captain builds a positive climate by encouraging effort and including everyone.`],
    ['📊', 'Stages of a team', `In Tuckman's model, teams go through forming (getting to know each other), storming (disagreements as roles are sorted out), norming (agreeing on roles and rules), then performing.`],
    ['🧠', 'Group pitfalls', `Social loafing is putting in less effort in a group. Groupthink is going along with an idea without questioning it. Address conflict calmly and focus on the problem.`],
    ['⚖️', 'Integrity', `Officials and rules make competition fair. Integrity means calling your own foul even when no one else sees it. Intrinsic motivation is playing because you enjoy it.`],
    ['🩺', 'Safe participation', `If you feel sharp pain, stop and tell the teacher. Heat exhaustion signs include heavy sweating and dizziness. Report concussion symptoms right away, because playing with a concussion risks more injury.`]
  ]);

  /* ---- Throwing, Catching & Kicking (unit: throw) ---- */
  add('throwing', 'k2', [
    ['👀', 'Eyes on target', `Look at your target before you throw.\nCheck that nobody is in the way.`],
    ['🥎', 'Underhand throw', `Step forward with the foot opposite your throwing arm.\nSwing low and follow through.`],
    ['🧤', 'Catch it', `Hands out in front and open.\nWatch the ball. Squeeze and pull it in.`],
    ['⚽', 'Kick and dribble', `Look at the ball when you kick.\nPass with the inside of your foot.\nDribble with your fingertips.`]
  ]);
  add('throwing', 'g35', [
    ['🎯', 'Overhand throw', `Stand with your side facing the target and point your other arm at it. Step with the opposite foot and follow through, letting your arm keep moving toward the target.`],
    ['🧤', 'Catch it', `Above your waist, point your thumbs together. Below your waist, point your pinkies together. Watch the ball all the way and pull your hands in to catch softly.`],
    ['⚽', 'Kick and dribble', `Plant your foot next to the ball. Hit it with your shoelaces to kick for distance. Dribble a soccer ball with small, soft touches and a basketball with your finger pads.`],
    ['🏀', 'Passing', `Aim a chest pass at your teammate's chest. Your thumbs point down after the pass. Pass to where a moving teammate is going.`]
  ]);
  add('throwing', 'g68', [
    ['🌀', 'Mature overhand throw', `Turn your side to the target, bring your arm back, step, then rotate your hips and shoulders toward the target and follow through.`],
    ['🏐', 'Volleyball basics', `In a forearm pass (bump), the ball hits the flat part of your forearms. Ready position: knees bent, weight forward. A volley hits the ball before it bounces. A spike hits it hard downward over the net.`],
    ['🏀', 'Basketball skills', `A bounce pass should hit the floor about two-thirds of the way to your partner. Pivot to protect the ball. Traveling means taking too many steps without dribbling. Keep your eyes up while dribbling.`],
    ['⚽', 'Receive and lead', `To trap a soccer ball, cushion it by giving with the ball. Look around before you receive a pass to spot defenders. Leading a teammate means throwing to the space where they are going.`],
    ['🥎', 'Accuracy', `With a racket or paddle, watch the ball and step toward your target. Fingers across the seams help you throw a softball accurately. Keep your knees bent when receiving.`]
  ]);
  add('throwing', 'g912', [
    ['💪', 'Power from the ground up', `Most of a throw's power comes from rotation that moves from the legs through the hips and trunk to the arm. Weight transfer shifts your weight from the back foot to the front foot as you stride toward the target.`],
    ['🏀', 'Shooting form (BEEF)', `BEEF stands for Balance, Eyes, Elbow, Follow-through. Keep your elbow under the ball. Backspin softens the bounce of a shot.`],
    ['⚽', 'Control the ball', `A soft first touch absorbs the ball's force. Trapping with the sole of your foot stops the ball completely. Strike it with your laces to drive it low and hard.`],
    ['🎾', 'Sweet spot and rotation', `The sweet spot is the area of a bat or racket that transfers the most energy. In a tennis forehand, rotating the hips and shoulders adds the most power.`],
    ['🧠', 'Smart decisions', `Good shot selection means taking high-percentage shots. Skilled passers disguise their passes, and a jab step fakes a move to create space. Follow-through helps the arm slow down safely.`]
  ]);

  /* ---- Sports & Game Strategy (unit: sports) ---- */
  add('sports', 'k2', [
    ['🏃', 'Tag smart', `Dodge and change direction so you do not get tagged.\nKeep your eyes up.`],
    ['🔁', 'Relay', `In a relay, go when your teammate tags you.\nYour team wins by working together.`],
    ['⚽', 'Sports and gear', `In soccer, you kick a ball into a goal.\nBasketball uses a hoop.\nBaseball uses a bat.`],
    ['🕹️', 'GaGa Ball', `GaGa Ball is played in a pit with a soft ball.\nWhen the whistle blows, stop and listen.`]
  ]);
  add('sports', 'g35', [
    ['🎮', 'Types of games', `Invasion games, like soccer, move a ball into the other team's area. Net games, like volleyball, send the ball over a net so the other side cannot return it. Kickball is a striking and fielding game.`],
    ['🔓', 'Offense', `On offense, move into open space so you can get open for a pass. Teammates spread out to create space and passing lanes.`],
    ['🛡️', 'Defense', `The goal of defense is to stop the other team from scoring. In basketball, dribbling means bouncing the ball while you move.`],
    ['🟦', 'Four Square', `In Four Square, the ball can bounce once in your square. The player in the highest square serves.`],
    ['⚾', 'GaGa Ball and kickball', `In GaGa Ball, you are out if the ball hits you on or below the knee. In kickball, run to first base after you kick.`]
  ]);
  add('sports', 'g68', [
    ['🗂️', 'Game categories', `Invasion games, net/wall games (like tennis), striking and fielding games (like softball and kickball), and target games (like golf) each have different goals and strategies.`],
    ['↔️', 'Offense: width and support', `Creating width means spreading out across the field. Support means moving to give the ball carrier a passing option.`],
    ['🛡️', 'Defense: marking and zones', `On defense in basketball, stay between your opponent and the basket. Marking in soccer means staying close to an opponent. In a zone defense, each player guards an area.`],
    ['⚡', 'Speed and space', `A fast break moves the ball up the court quickly, before the defense can set up. In a net game, aim at open spaces the opponent cannot reach.`]
  ]);
  add('sports', 'g912', [
    ['🔄', 'Transition', `Transition means switching quickly between offense and defense when possession changes.`],
    ['🎯', 'Tactics', `A tactic is a specific action used to carry out a strategy. A give-and-go is passing to a teammate and cutting to receive the ball back. A screen (pick) blocks a defender's path.`],
    ['🛡️', 'Defensive systems', `In man-to-man defense, each defender guards a specific opponent. In zone defense, each guards an area. Teams scout opponents to plan strategies around their strengths and weaknesses.`],
    ['⚽', 'Soccer ideas', `The offside rule prevents attackers from waiting behind defenders for the ball. Switching the field means passing to the opposite side, where there is more space.`],
    ['🏐', 'Volleyball and lifetime sports', `A volleyball team can use up to three contacts before sending the ball over the net. Lifetime sports are activities you can keep playing throughout your life.`]
  ]);

  /* ---- Dance, Rhythm & Gymnastics (unit: dance) ---- */
  add('dance', 'k2', [
    ['🥁', 'Feel the beat', `The beat is the steady pulse in music.\nMove your body in time with the beat.`],
    ['🐢', 'Move to the music', `Slow music: move slowly and smoothly.\nFreeze dance: freeze in a shape when the music stops.`],
    ['⭐', 'Body shapes', `Your body can make tall, wide, small, or twisty shapes.\nA star is a shape.`],
    ['🤸', 'Balance and mats', `To balance, look at one spot and hold still.\nTake turns on mats and check the mat is clear.`]
  ]);
  add('dance', 'g35', [
    ['🥁', 'Rhythm and tempo', `Rhythm is a pattern of beats. Tempo is how fast or slow the music is.`],
    ['🗺️', 'Dance words', `Level is how high or low your body is. A pathway is the line your body makes as you move. A formation is the pattern a group of dancers makes.`],
    ['📋', 'Build a routine', `A sequence is a set of moves done in order. Dancers practice many times to remember the steps. End with a pose you hold still.`],
    ['⚖️', 'Balance', `A static balance holds still, like a strong pose with tight muscles. A dynamic balance moves, like walking on a line.`],
    ['🤸', 'Gymnastics safety', `Before a forward roll, tuck your chin to your chest. Spread out so no one bumps into anyone. A weight transfer moves your body weight from one body part to another.`]
  ]);
  add('dance', 'g68', [
    ['🎼', 'Elements of dance', `Space is where you move, such as levels and pathways. Time is tempo, rhythm, and counts; steps are usually counted in groups of 8. Energy is how a movement is done, like sharp or smooth.`],
    ['✍️', 'Choreography', `Choreography is planning and arranging movements. A phrase is a short sequence of connected movements. An accent emphasizes a beat with extra energy.`],
    ['👯', 'Unison and canon', `In unison, everyone does the same movement at the same time. In canon, the same movement starts at different times. In a counterbalance, partners lean away from each other.`],
    ['🤸', 'Cartwheel and balance', `In a cartwheel the hands lead, and the order is hand, hand, foot, foot. A wide base of support improves stability. Tight muscles help control a balance, and focusing on a fixed point helps on a beam.`],
    ['🕺', 'A lifetime activity', `Dance builds fitness and can be enjoyed for life. Folk or square dancing follows set patterns, often with a caller.`]
  ]);
  add('dance', 'g912', [
    ['🧩', 'BEST elements', `The elements of dance can be remembered as BEST: Body, Energy, Space, Time. Energy is the quality of movement, such as sustained or sharp.`],
    ['🎶', 'Rhythm tools', `Syncopation accents a beat that is not normally emphasized. In canon, dancers perform the same movement beginning at different times.`],
    ['🧠', 'Choreographic devices', `A motif is a short movement phrase that returns through a dance. Motif development changes it, such as in size, tempo, or direction, to create variety.`],
    ['🛡️', 'Safe technique', `Warm up to raise muscle temperature. Land from jumps with soft, bent knees. Core strength stabilizes the body during skills, and a spotter provides safety and guidance. Spot a fixed point when turning to stay oriented.`],
    ['🌍', 'Benefits of dance', `Sustained aerobic or social dance builds cardiorespiratory endurance, and flexibility training improves range of motion. Dance can reduce stress and connect communities by preserving cultural traditions.`]
  ]);

  /* ---- Fitness Testing & Goals (unit: testing) ---- */
  add('testing', 'k2', [
    ['🔍', 'Why check fitness?', `We check our fitness to see how our bodies are doing.\nWe compare to ourselves.`],
    ['🎯', 'Set a goal', `A goal is something you want to get better at.\nExample: "I will jump rope 10 more times."`],
    ['🏃', 'Fitness checks', `PACER: run back and forth to the beeps.\nCurl-ups use your tummy muscles.`],
    ['😊', 'Do your best', `Try your best and be proud of your effort.\nIf it is too hard, try an easier version.`]
  ]);
  add('testing', 'g35', [
    ['📋', 'What the tests measure', `The PACER shows how long you can keep running (endurance). Push-ups test arm and chest strength. The curl-up tests core strength and endurance. The trunk lift tests back strength and flexibility. The back-saver sit and reach tests flexibility.`],
    ['🟢', 'Healthy Fitness Zone', `The Healthy Fitness Zone is a score range that shows healthy fitness. Needs Improvement means your score is below that range.`],
    ['🎯', 'SMART goals', `A SMART goal is Specific, Measurable, Attainable, Realistic, and Timely. Write your goal down and check your progress.`],
    ['🔁', 'Test again', `We test at the start and end of the year to see how much we improved. Practice regularly with good form, and stretch after tests to help your muscles recover.`],
    ['🛡️', 'Test safely', `Lift slowly in the trunk lift test to protect your back. In the cadence push-up test, keep pace with a steady beat.`]
  ]);
  add('testing', 'g68', [
    ['📏', 'Baselines and standards', `A criterion-referenced test compares you to a healthy standard, not to other people. A baseline is your starting score before you train. Later results are compared to it.`],
    ['📱', 'Fitness tools', `A heart rate monitor shows exercise intensity in real time. An accelerometer, like the one in a fitness watch, measures movement and activity level. Use trackers to set personal goals and follow your progress.`],
    ['❤️', 'Heart rate clues', `Resting heart rate tells you how efficiently your heart works. Heart rate recovery is how quickly your heart rate comes back down after exercise.`],
    ['🎯', 'SMART and process goals', `SMART goals are Specific, Measurable, Attainable, Realistic, and Timely. A process goal, like exercising 3 days a week, focuses on actions you control.`],
    ['🔧', 'Use your results', `If a score is below the Healthy Fitness Zone, add more activity in that area. If a score went down, look for the cause and adjust your plan. Self-monitoring means tracking your own activity.`]
  ]);
  add('testing', 'g912', [
    ['📊', 'Use more than one test', `Each assessment measures a different component, so use more than one. The PACER measures aerobic capacity. Cadence curl-ups check core muscular endurance. VO2 max is the most oxygen your body can use during exercise.`],
    ['⏰', 'Heart rate measures', `Measure resting heart rate right after waking, before you get up. To find a target heart rate range, multiply your maximum heart rate by a percentage.`],
    ['🗒️', 'A personal fitness plan', `A plan includes goals, FITT details, a timeline, and a way to track progress. Keep a training log to track progress and adjust.`],
    ['🔧', 'When progress stalls', `If you stop improving, change one FITT variable and test again. If you miss a deadline, review the plan and adjust it. Specificity means training the component you want to improve.`],
    ['📅', 'Timelines', `Reassess your fitness every few months to see if your plan is working. Noticeable strength gains usually take several weeks of consistent training.`]
  ]);

  /* ---- Active Lifestyle (unit: active) ---- */
  add('active', 'k2', [
    ['🏠', 'Active at home', `Dance, play tag, or jump rope at home.\nIf you sit a long time, get up and move.`],
    ['👨‍👩‍👧', 'Active together', `Go for a walk with your family.\nPlay at a park or playground with an adult.`],
    ['😀', 'Why move?', `Being active helps you feel happy and stay healthy.`],
    ['🎈', 'Recess fun', `Tag and hopscotch are active games.\nA jump rope helps you be active.`]
  ]);
  add('active', 'g35', [
    ['⏱️', '60 minutes a day', `Kids need at least 60 minutes of activity every day. Balance sitting-still screen time with active time.`],
    ['🚲', 'Everyday activity', `Walk or bike instead of riding, rake leaves, or take a family bike ride. Active chores count too.`],
    ['🌳', 'Find your fun', `You are more likely to keep doing activities you enjoy. Trying different activities works different muscles. Swimming and jumping rope use your whole body.`],
    ['🏟️', 'Community places', `Parks, trails, and rec centers help people stay active. Joining a rec soccer team is a physical activity outside of school.`]
  ]);
  add('active', 'g68', [
    ['🪑', 'Sedentary and active', `Sedentary means sitting or lying down with very little movement. Moderate activity raises your heart rate, like brisk walking. Vigorous activity, like running or fast swimming, raises it more.`],
    ['⚖️', 'Energy balance', `Energy balance compares the calories you eat with the calories you use.`],
    ['🧗', 'Lifetime activities', `Lifetime activities, like hiking or cycling, can be done at any age. Outdoor pursuits are activities done in nature, like hiking.`],
    ['🚧', 'Beat the barriers', `Short on time? Fit in short 10-minute bouts. Bad weather? Do an indoor workout. Invite friends to play a sport with you.`],
    ['📱', 'Track it', `Tracking your activity in a log or app helps you see patterns and stay motivated.`]
  ]);
  add('active', 'g912', [
    ['⚖️', 'Energy balance', `Energy balance compares the energy taken in from food with the energy used. If intake is regularly more than use, the body gains weight over time.`],
    ['💪', 'Weekly targets', `Teens should do muscle-strengthening activity at least 3 days a week. Jumping and other bone-strengthening activity builds bone density.`],
    ['🚶', 'Active transportation', `Active transportation means walking or biking to get places. If you have a desk job, take movement breaks.`],
    ['🩺', 'Health benefits', `Regular physical activity lowers the risk of chronic disease. It improves heart health, among other benefits.`],
    ['🤝', 'Sticking with it', `Enjoyment and social support help adults stick with exercise. A community sports league offers social connection and motivation. After high school, choose activities you enjoy.`]
  ]);

  /* ============================== HEALTH ============================== */

  /* ---- Healthy Habits (units: habits + hygiene) ---- */
  add('habits', 'k2', [
    ['😴', 'Sleep', `Kids need 9 to 12 hours of sleep.\nA calm bedtime routine helps you fall asleep.`],
    ['🦷', 'Brush your teeth', `Brush two times a day.\nBrush for about two minutes.`],
    ['🧼', 'Wash up', `Wash your hands with soap and water for 20 seconds.\nCough or sneeze into your elbow.`],
    ['📺', 'Screens off', `Turn screens off before bedtime.\nDoctors and dentists help keep you healthy.`]
  ]);
  add('habits', 'g35', [
    ['😴', 'Sleep', `Kids ages 6-12 need 9 to 12 hours a night. Going to bed at the same time each night keeps your body on a schedule, and sleep helps you focus and remember at school.`],
    ['📱', 'Smart screen habits', `Bright light from screens before bed keeps your brain awake. Take breaks to move. Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.`],
    ['🧼', 'Stop the spread of germs', `Germs spread through touch, coughs, and sneezes. Wash your hands with soap and water, cover your coughs, and do not share water bottles.`],
    ['🛡️', 'Your immune system', `Your immune system protects your body from germs, and white blood cells fight germs. A fever usually means your body is fighting an infection, so stay home when you have one.`],
    ['🩺', 'Checkups and teeth', `A yearly checkup tracks your growth and catches problems early. Brush for two minutes each time, and wear a mouthguard in some sports to protect your teeth.`]
  ]);
  add('habits', 'g68', [
    ['🌙', 'Sleep science', `The body's natural 24-hour sleep-wake cycle is the circadian rhythm. Teens need 8 to 10 hours. A dark, quiet bedroom improves sleep quality, and trouble concentrating can be a sign you need more.`],
    ['📱', 'Healthy screen use', `Too much sedentary screen time is linked to less physical activity. Healthy habits include screens off during meals and keeping earbud volume low to protect your hearing.`],
    ['🦠', 'Pathogens', `Bacteria and viruses are both pathogens. Antibiotics work against bacteria, not viruses, and should be finished as prescribed. Vaccines train your immune system.`],
    ['🚿', 'Body care', `During puberty, sweat glands get more active, so shower daily and use deodorant. Athletes can prevent skin infections and athlete's foot by showering after practice and keeping feet clean and dry.`],
    ['🔎', 'Prevention', `Vision, hearing, and dental checkups catch problems early, and a dentist visit twice a year helps prevent cavities. A flu vaccine and handwashing help prevent the flu.`]
  ]);
  add('habits', 'g912', [
    ['🌗', 'Sleep hygiene', `Teens' natural sleep timing tends to shift later, which makes early starts hard. Good sleep hygiene includes avoiding caffeine late in the day. Consistent sleep and wake times improve mood, focus, and performance.`],
    ['📱', 'Screens and well-being', `Blue light at night can delay the release of melatonin. Doomscrolling can increase stress. Set time limits on social media and follow accounts that support your well-being.`],
    ['🦠', 'Communicable or not', `A communicable disease can spread from person to person. Noncommunicable diseases, like type 2 diabetes, do not. Physical inactivity is a risk factor for type 2 diabetes that you can change.`],
    ['💉', 'Community protection', `Herd (community) immunity happens when enough people are immune that a disease spreads less. Immunization means becoming protected from a disease. Using antibiotics when they are not needed makes antibiotic resistance worse.`],
    ['🩺', 'Prevention and screening', `Preventive care helps you stay healthy or find problems early. A screening test checks for disease before symptoms appear. Cook foods to safe temperatures to prevent foodborne illness, and use SPF 30+ sunscreen to reduce skin cancer risk.`]
  ]);

  /* ---- Nutrition & Hydration (unit: nutrition) ---- */
  add('nutrition', 'k2', [
    ['🍎', 'Five food groups', `MyPlate has five food groups.\nFruit, vegetable, grain, protein, and dairy.`],
    ['🥦', 'Eat many colors', `Eat fruits and veggies of different colors.\nEach color gives your body something different.`],
    ['💧', 'Water is best', `Water is the best drink when you are thirsty.\nEat breakfast for energy.`],
    ['🥕', 'Healthy snacks', `Carrot sticks and apples are healthy snacks.\nMilk and yogurt help build strong bones.`]
  ]);
  add('nutrition', 'g35', [
    ['🍽️', 'MyPlate', `About half your plate should be fruits and vegetables. The food groups are fruits, vegetables, grains, protein, and dairy. Beans, eggs, and chicken are in the protein group.`],
    ['🔋', 'Nutrients that help', `Carbohydrates are the body's main energy source. Protein helps build and repair muscles. Fiber helps digestion, and whole grains like brown rice give you fiber and lasting energy.`],
    ['🥤', 'Drinks matter', `Limit sugary drinks because they have lots of added sugar. Regular soda has the most. Water is the best choice.`],
    ['🍌', 'Fuel for the day', `Breakfast gives you energy to learn on school days. Apple slices with peanut butter make a healthy snack.`]
  ]);
  add('nutrition', 'g68', [
    ['⚡', 'The big three', `Carbohydrates provide energy. Fats store energy and help your body absorb some vitamins; unsaturated fats, in foods like avocado and nuts, are the healthy kind. Protein builds and repairs the body.`],
    ['🏷️', 'Read the label', `The serving size tells you the amount that all the nutrition facts are based on. A Daily Value of 20% or more means the food is high in that nutrient.`],
    ['🦴', 'Vitamins and minerals', `Calcium is important for strong bones. Sunlight helps your body make vitamin D.`],
    ['💧', 'Hydration and fuel', `Dehydration can cause headaches and tiredness. A banana or whole-grain toast makes a good pre-game snack.`],
    ['🚫', 'Empty calories', `Empty calories come from foods with few nutrients, like sugary snacks and drinks.`]
  ]);
  add('nutrition', 'g912', [
    ['🔢', 'Calories per gram', `Fat has 9 calories per gram. Carbohydrates and protein have 4 calories per gram each.`],
    ['🧂', 'Limit some things', `The Dietary Guidelines say added sugars should be less than 10% of daily calories. Too much sodium can raise blood pressure.`],
    ['💊', 'Vitamins and minerals', `Vitamins A, D, E, and K are fat-soluble. Iron deficiency can cause anemia, with tiredness and weakness.`],
    ['🥗', 'Spot the hype', `A warning sign of a fad diet is cutting out entire food groups. A balanced meal includes several food groups. Ultra-processed foods are made mostly from refined ingredients and additives.`],
    ['🏃', 'Refuel', `A good recovery meal after intense exercise has carbohydrates and protein.`]
  ]);

  /* ---- Human Body (unit: body) ---- */
  add('body', 'k2', [
    ['❤️', 'Your heart', `Your heart is a muscle that pumps blood around your body.\nIt beats faster when you run.`],
    ['🫁', 'Your lungs', `Your lungs help you breathe.\nYou breathe faster when you run.`],
    ['🦴', 'Bones and muscles', `Bones help your body stand up.\nMuscles help you move.`],
    ['🧠', 'Your brain', `Your brain helps you think.\nYour skull protects it.`]
  ]);
  add('body', 'g35', [
    ['🫀', 'Circulatory system', `Your heart and blood vessels make up the circulatory system. Blood picks up oxygen in the lungs. You can feel your pulse at your wrist or neck.`],
    ['🏃', 'Exercise and your heart', `Your heart beats faster during exercise because your muscles need more oxygen. Your lungs bring oxygen into your body.`],
    ['🦴', 'Muscles and bones', `An adult has 206 bones. The muscular and skeletal systems work together to help you move.`],
    ['🍽️', 'Digestion and filtering', `The digestive system breaks down food so your body can use it. Your kidneys filter your blood.`],
    ['⚡', 'Nervous system', `The nervous system sends messages between your brain and the rest of your body.`]
  ]);
  add('body', 'g68', [
    ['🫀', 'The heart', `The human heart has four chambers. Regular exercise makes the heart stronger, so it pumps more blood with each beat.`],
    ['🩸', 'Blood and vessels', `Arteries carry blood away from the heart. Veins carry blood back to it. Red blood cells carry oxygen, and platelets help blood clot.`],
    ['🫁', 'Breathing', `Gas exchange happens in the alveoli, tiny air sacs in the lungs. The diaphragm is the muscle that helps you breathe.`],
    ['💪', 'Moving and messaging', `Tendons connect muscles to bones. The endocrine system makes hormones.`]
  ]);
  add('body', 'g912', [
    ['🫀', 'How the heart works', `Cardiac output is the amount of blood the heart pumps each minute. Stroke volume is the amount pumped in one beat. The heart is made of cardiac muscle.`],
    ['📏', 'Resting heart rate', `A normal resting heart rate for most adults is 60 to 100 beats per minute. A lower resting rate in an athlete usually means a more efficient, well-trained heart.`],
    ['🩺', 'Blood pressure', `In a blood pressure reading, the systolic (top) number is the pressure when the heart beats. Regular aerobic exercise can help lower blood pressure.`],
    ['🧬', 'Vessels and tissue', `Capillaries have walls thin enough for exchange with body tissues. Ligaments connect bone to bone.`],
    ['⚠️', 'Heart health risks', `Atherosclerosis is a buildup of plaque in the arteries.`]
  ]);

  /* ---- Mental & Emotional Wellness (unit: mental) ---- */
  add('mental', 'k2', [
    ['😀', 'All feelings are okay', `All kinds of feelings are okay.\nA friend's face and body can show they feel sad.`],
    ['🌬️', 'Calm down', `Take slow, deep breaths.\nOr count to 10 slowly.`],
    ['🗣️', 'Ask for help', `If you feel sad or worried, talk to a trusted adult.`],
    ['🌟', 'Try again', `If you make a mistake, say, "I'll try again!"\nTrying something hard can make you proud.`]
  ]);
  add('mental', 'g35', [
    ['🌬️', 'Handle stress', `Signs of stress can be a tight stomach or a headache. Healthy ways to handle it include exercise and deep breathing. Exercise can also lift your mood.`],
    ['🌱', 'Growth mindset', `Growth mindset means believing you can get better with practice. Positive self-talk, like "I can do hard things," helps.`],
    ['💛', 'Empathy and kindness', `Empathy is understanding how someone else feels. You can show kindness by inviting someone new to join you.`],
    ['🧭', 'Self-control', `Self-control is choosing how to act even when you feel a strong emotion.`],
    ['🆘', 'Get help', `If a friend seems very sad for a long time, or someone is being bullied, tell a trusted adult.`]
  ]);
  add('mental', 'g68', [
    ['🔥', 'Triggers and coping', `An emotional trigger is something that causes a strong feeling. Healthy coping strategies include journaling or going for a walk. Regular physical activity can help reduce stress and anxiety.`],
    ['😟', 'Anxiety and self-esteem', `Anxiety is feelings of worry or fear. Self-esteem is how you feel about yourself.`],
    ['🧱', 'Friendships and boundaries', `Healthy friendships include respect, trust, and support. Setting a healthy boundary sounds like, "I need some space."`],
    ['💻', 'Cyberbullying', `If you are cyberbullied, do not respond, save the evidence, and tell a trusted adult.`],
    ['🤝', 'Signs someone needs help', `Pulling away from friends can be a sign someone needs help with their mental health. When you feel disappointed, talk about it and focus on what you can do next.`]
  ]);
  add('mental', 'g912', [
    ['💪', 'Resilience and mindfulness', `Resilience is the ability to bounce back from challenges. Mindfulness is paying attention to the present moment without judging it.`],
    ['🎚️', 'Emotional regulation', `Emotional regulation is managing your emotions in healthy ways. An I-message states your feeling without blame, such as, "I feel frustrated when..."`],
    ['🧠', 'Stress and the body', `Chronic stress can weaken the immune system. Physical activity can reduce stress and support mental health.`],
    ['🚨', 'Warning signs', `Ongoing sadness and loss of interest that lasts two weeks or more can be a sign of depression. Someone who controls who you see is a warning sign of an unhealthy relationship.`],
    ['📞', 'Where to get help', `In the U.S., you can call or text 988 if you or someone you know is in crisis. At school, talk to the school counselor or another trusted adult.`]
  ]);

  /* ---- Safety & First Aid (unit: safety) ---- */
  add('safety', 'k2', [
    ['📞', 'Call 911', `Call 911 in an emergency.\nIf you get lost, stay where you are and ask for help.`],
    ['🔥', 'Fire safety', `Stop, drop, and roll if your clothes catch fire.\nIn a fire drill, walk quietly to the exit.`],
    ['🚲', 'Ride safe', `Wear a helmet on a bike and a seatbelt in a car.\nLook left, right, and left before crossing the street.`],
    ['💊', 'Do not touch', `If you find pills or medicine, do not touch them. Tell an adult.\nAsk before petting a dog you do not know.`]
  ]);
  add('safety', 'g35', [
    ['🩹', 'First aid basics', `For a small cut, clean it with soap and water. For a bloody nose, lean forward and pinch your nose. If you get a splinter, tell an adult who can remove it.`],
    ['🧊', 'Sprains: RICE', `For a sprain, remember RICE: Rest, Ice, Compression, and Elevation.`],
    ['🚗', 'Ride safely', `Seatbelts keep you in place in a crash. Kids under 13 should sit in the back seat. On a bike, wear a helmet and follow the rules of the road.`],
    ['🌩️', 'Home and weather safety', `Have a family fire escape plan so everyone knows how to get out. During a thunderstorm, go indoors.`],
    ['🌐', 'Online safety', `If a stranger online asks for your address, do not share it. Tell a trusted adult.`]
  ]);
  add('safety', 'g68', [
    ['✅', 'Check, Call, Care', `First check the scene and the person. Make sure the scene is safe before you help. Then call 911 if needed, and care for the person.`],
    ['🩸', 'Bleeding and burns', `To stop bleeding, apply firm, direct pressure. Cool a minor burn under running water.`],
    ['🫁', 'Choking and allergies', `Hands clutched at the throat is the universal sign for choking. If someone has an allergic reaction and trouble breathing, call 911 and help them use their epinephrine auto-injector.`],
    ['🧠', 'Concussions', `Signs of a concussion include headache, dizziness, and confusion. After a hit to the head in sports, stop playing and tell an adult.`],
    ['🏈', 'Prevent injuries', `Warm up, wear proper gear, and use good technique to prevent sports injuries. Do not share your location publicly online, because strangers could find you.`]
  ]);
  add('safety', 'g912', [
    ['❤️', 'Hands-only CPR', `Push hard and fast in the center of the chest: 100 to 120 compressions per minute, at least 2 inches deep for an adult.`],
    ['⚡', 'AED and heart attack', `An AED delivers a shock to help restore a normal heart rhythm. Signs of a heart attack can include chest pain or pressure.`],
    ['🫁', 'Choking and seizures', `Abdominal thrusts (the Heimlich maneuver) treat choking in a conscious person. If someone has a seizure, protect their head and move hazards away.`],
    ['🌡️', 'Heat and cold', `Signs of heat stroke include very high body temperature. Hypothermia is dangerously low body temperature.`],
    ['📋', 'Be prepared', `Good Samaritan laws generally protect people who help in an emergency. A sports emergency action plan includes roles, contact numbers, and steps to follow.`]
  ]);

  /* ---- Relationships & Social Health (unit: violence) ---- */
  add('relationships', 'k2', [
    ['🙅', 'What is bullying?', `Bullying is hurting or teasing someone.\nIt is not okay.`],
    ['🗣️', 'Tell a trusted adult', `If someone is mean to you or pushes you, tell a trusted adult.`],
    ['🕊️', 'Use your words', `Do not hit.\nUse calm words like, "I don't like that."`],
    ['🛡️', 'Stay safe', `If something feels unsafe, say no, get away, and tell a trusted adult.\nBe kind and include others.`]
  ]);
  add('relationships', 'g35', [
    ['⚖️', 'Teasing or bullying?', `Bullying is repeated and meant to hurt. Cyberbullying is bullying online. Do not reply to a mean message. Save it and tell a trusted adult.`],
    ['🦸', 'Be an upstander', `An upstander is someone who safely speaks up or helps. Treating others the way you want to be treated shows respect.`],
    ['📣', 'Tattling or reporting?', `Reporting is getting help to keep someone safe. Tattling is trying to get someone in trouble.`],
    ['🕊️', 'Solve conflict peacefully', `During a conflict, take a break and breathe, then calmly talk it out. If a situation feels unsafe, tell a trusted adult.`]
  ]);
  add('relationships', 'g68', [
    ['👀', 'Bystanders', `A bystander is someone who sees bullying happen. "See something, say something" means reporting anything that seems unsafe. Harassment because of race, religion, or disability should be reported.`],
    ['🧊', 'De-escalation', `To de-escalate, stay calm and use a low voice. Relational aggression is hurting others socially, like spreading rumors or leaving people out.`],
    ['💻', 'Online safety', `Sharing someone's private photos without permission violates their privacy. If you see a threat of violence online, tell a trusted adult or report it.`],
    ['⚠️', 'Warning signs', `Talking about or threatening to hurt others is a warning sign. Gangs often recruit young people by offering belonging.`],
    ['💚', 'Healthy relationships', `In a healthy relationship, people respect each other's boundaries and feelings.`]
  ]);
  add('relationships', 'g912', [
    ['🧱', 'Hazing', `Hazing is forcing someone to do something humiliating or dangerous to join a group. It is still hazing when someone goes along because of pressure, and anyone can refuse to take part.`],
    ['🚩', 'Dating violence', `Warning signs of dating violence include extreme jealousy and control. In a healthy relationship, personal boundaries are respected.`],
    ['🪢', 'Coercion', `Coercion is pressuring someone into something. If a friend may be in an abusive relationship, listen without judging and help them find support.`],
    ['🛡️', 'Protective factors', `Strong connections to family, school, and community protect against violence. Restorative practices focus on repairing harm and rebuilding relationships.`],
    ['😤', 'Handle anger', `A healthy way to handle anger is to pause, name the feeling, and then choose a response.`]
  ]);

  /* ---- Medicine & Substance Safety (unit: substance) ---- */
  add('substances', 'k2', [
    ['💊', 'Medicine safety', `Only take medicine from a trusted adult.\nSome medicine looks like candy.`],
    ['🏷️', 'Read the label', `A medicine label tells you how to use it safely.\nKeep medicine away from little kids.`],
    ['🚭', 'Smoke is bad', `Cigarette smoke is bad for your lungs.\nCleaning products are only for adults.`],
    ['🙅', 'Say no', `If a friend offers you a pill, say no and tell an adult.\nSaying no is brave and smart.`]
  ]);
  add('substances', 'g35', [
    ['💊', 'Medicines', `A drug is a substance that changes how the body works. A prescription medicine is ordered by a doctor for one person, so it is not safe to take someone else's.`],
    ['🚭', 'Nicotine', `Nicotine, found in cigarettes and vapes, is addictive. Vapes are harmful because they contain nicotine and other chemicals. Secondhand smoke is smoke you breathe in from someone else.`],
    ['☎️', 'Poison help', `If someone may have swallowed poison, adults can call Poison Control at 1-800-222-1222.`],
    ['🙅', 'Refuse and choose', `A good way to refuse something unsafe is to say, "No thanks," and walk away. Drug-free means choosing not to use harmful drugs. Healthy ways to have fun include sports and music.`]
  ]);
  add('substances', 'g68', [
    ['🧠', 'Nicotine and the teen brain', `Nicotine can harm attention and learning in the teen brain.`],
    ['🍺', 'Alcohol and inhalants', `Alcohol is a depressant that slows the brain and body. An inhalant is a chemical vapor that is breathed in, and it is dangerous.`],
    ['🔗', 'Addiction and energy drinks', `Addiction means being unable to stop using something even when it causes harm. Energy drinks can have high levels of caffeine and sugar, so they are risky for teens.`],
    ['🧍', 'Peer pressure and refusal', `Peer pressure can be positive or negative. One refusal skill is suggesting a different activity. Healthy responses to stress include exercise or talking to someone.`],
    ['📚', 'Reliable information', `Get accurate information about drugs from trusted adults, doctors, and other reliable sources. Take over-the-counter medicine exactly as the label says.`]
  ]);
  add('substances', 'g912', [
    ['🧪', 'Opioids and fentanyl', `Fentanyl is so dangerous that a tiny amount can be deadly. Signs of an opioid overdose include slow or stopped breathing. Naloxone (Narcan) is used to reverse an opioid overdose.`],
    ['🍷', 'Alcohol', `The legal drinking age in the United States is 21. Blood alcohol concentration (BAC) depends on body size, the amount consumed, and time. Mixing alcohol with opioids can slow breathing to a dangerous level.`],
    ['🔁', 'Tolerance and withdrawal', `Tolerance means needing more of a substance to get the same effect. Withdrawal symptoms are uncomfortable effects when someone stops using.`],
    ['🌿', 'Risks for teens', `Marijuana use is risky for teens because it can affect memory, attention, and learning.`],
    ['🤝', 'Support a friend', `To support a friend who wants to quit vaping, encourage them and help them find support.`]
  ]);

  /* ---- Community & Environmental Health (unit: community) ---- */
  add('community', 'k2', [
    ['🗑️', 'Keep it clean', `Put trash in the trash can.\nRecycling helps keep the Earth clean.`],
    ['💧', 'Save water and energy', `Turn off the water while you brush your teeth.\nTurn off lights when you leave a room.`],
    ['🧑‍⚕️', 'Helpers', `Doctors, nurses, and firefighters help keep us healthy and safe.`],
    ['☀️', 'Protect yourself', `Wear sunscreen outside.\nVery loud noise can hurt your ears.\nTrees clean the air.`]
  ]);
  add('community', 'g35', [
    ['♻️', 'Reduce, reuse, recycle', `Reduce, reuse, and recycle means use less, use things again, and recycle. Reusing and recycling help the environment.`],
    ['🌫️', 'Pollution', `Air pollution can make it harder to breathe, especially for people with asthma. Dirty water can spread disease. Noise pollution can cause stress.`],
    ['🏥', 'Community helpers', `Health clinics and recreation centers help people stay healthy. Dentists and dental hygienists care for teeth.`],
    ['🧼', 'Handwashing helps everyone', `Handwashing matters for the whole community because it stops germs from spreading.`],
    ['📣', 'Be a health advocate', `A health advocate encourages friends to make healthy choices. Reliable health information comes from a trusted source.`]
  ]);
  add('community', 'g68', [
    ['🌬️', 'Air quality', `The Air Quality Index (AQI) tells you how clean or polluted the air is. On a high-AQI day, people with asthma should limit hard outdoor activity.`],
    ['🏛️', 'Public health', `A public health department works to prevent disease and protect the community. A school nurse cares for students' health.`],
    ['📢', 'Advocacy and ads', `Starting a campaign to promote healthy choices is a health advocacy action. Health product ads try to persuade you to buy something, so check who is behind them.`],
    ['📚', 'Reliable sources', `Reliable sources of health information include the CDC or a doctor's office.`],
    ['🌍', 'Your impact', `Using a reusable water bottle reduces your environmental impact. Secondhand vapor can expose others to harmful chemicals, which makes it a community health concern. An athletic trainer is one example of a health career.`]
  ]);
  add('community', 'g912', [
    ['🔎', 'Evaluate health claims', `To evaluate a health claim online, ask who wrote it and whether it is based on evidence. Health literacy is being able to find, understand, and use health information.`],
    ['☠️', 'Environmental risks', `Carbon monoxide is dangerous because it is colorless and odorless. Lead in old paint or pipes is an environmental health risk.`],
    ['🚗', 'Cleaner choices', `Walking, biking, or carpooling reduces vehicle air pollution. The Environmental Protection Agency (EPA) protects human health and the environment.`],
    ['🧩', 'Social determinants', `A social determinant of health is a condition, like where people are born, live, work, and age, that affects their health.`],
    ['💼', 'Careers and advocacy', `Some health careers, like physical therapist, require a state license. Advocacy at school can mean proposing a plan for healthier choices. Mental health is a community issue because it affects families, schools, and workplaces.`]
  ]);

  return out;
})();

/* Cards for one topic and grade band, in order. Returns [] if there are none (the topic page then hides Learn). */
function learnFor(topicId, band) {
  return LEARN.filter(function (c) { return c.topic === topicId && c.gradeBand === band; }).sort(function (a, b) { return a.order - b.order; });
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { LEARN, learnFor }; }
