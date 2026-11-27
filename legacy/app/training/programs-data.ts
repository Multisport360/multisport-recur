export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface ExerciseItem {
  name: string;
  detail?: string; // e.g. "3 × 8", "4 × 40 yds", "3 × 45 sec"
  isSection?: boolean; // renders as a group header (no detail shown)
}

export interface DayPlan {
  day: string;
  focus: string;
  isRest?: boolean;
  restNote?: string;
  exercises: ExerciseItem[];
}

export interface ProgramData {
  slug: string;
  sport: string;
  emoji: string;
  level: Level;
  name: string;
  tagline: string;
  weeks: number;
  focusAreas: string[];
  schedule: DayPlan[];
  equipment: string[];
  nutritionTip: string;
}

// ─── FOOTBALL ─────────────────────────────────────────────────────────────────

const footballBeginner: ProgramData = {
  slug: "football-beginner",
  sport: "Football",
  emoji: "🏈",
  level: "Beginner",
  name: "Foundation & Fundamentals",
  tagline: "Build the athletic base every football player needs before stepping up in intensity.",
  weeks: 8,
  focusAreas: ["Strength Foundation", "Basic Conditioning", "Injury Prevention"],
  equipment: ["Barbell", "Dumbbells", "Bench", "Squat Rack", "Cones", "Agility Ladder"],
  nutritionTip: "Eat 1 gram of protein per pound of bodyweight daily. At 155 lbs that means 155g of protein — spread it across 4–5 meals. Focus on chicken, eggs, Greek yogurt, and lean beef.",
  schedule: [
    {
      day: "Monday", focus: "Upper Body Strength", exercises: [
        { name: "Bench Press", detail: "3 × 8" },
        { name: "Shoulder Press", detail: "3 × 10" },
        { name: "Bent Over Row", detail: "3 × 10" },
        { name: "Push Ups", detail: "3 × 15" },
        { name: "Dumbbell Curl", detail: "3 × 12" },
        { name: "Tricep Dips", detail: "3 × 12" },
      ],
    },
    {
      day: "Tuesday", focus: "Lower Body & Speed", exercises: [
        { name: "Back Squat", detail: "3 × 10" },
        { name: "Lunges", detail: "3 × 12 each leg" },
        { name: "Leg Press", detail: "3 × 12" },
        { name: "Box Jumps", detail: "3 × 8" },
        { name: "Broad Jumps", detail: "3 × 8" },
        { name: "Sprint Drills", detail: "4 × 40 yds" },
      ],
    },
    {
      day: "Wednesday", focus: "Rest or Light Cardio",
      isRest: true, restNote: "20 min jog or bike — keep it easy. Focus on recovery, not intensity.",
      exercises: [],
    },
    {
      day: "Thursday", focus: "Full Body Power", exercises: [
        { name: "Deadlift", detail: "3 × 8" },
        { name: "Power Clean", detail: "3 × 6" },
        { name: "Push Press", detail: "3 × 8" },
        { name: "Core Circuit:", isSection: true },
        { name: "Plank", detail: "3 × 45 sec" },
        { name: "Russian Twist", detail: "3 × 20" },
        { name: "Leg Raises", detail: "3 × 15" },
      ],
    },
    {
      day: "Friday", focus: "Conditioning & Agility", exercises: [
        { name: "Ladder Drills", detail: "4 sets" },
        { name: "Cone Drills", detail: "4 sets" },
        { name: "40-Yard Dash", detail: "6 reps" },
        { name: "Bear Crawls", detail: "3 × 20 yds" },
        { name: "Sled Push", detail: "3 × 20 yds" },
      ],
    },
    {
      day: "Saturday", focus: "Active Recovery",
      isRest: true, restNote: "Stretching, foam rolling, light 20 min walk. Focus on hip flexors, hamstrings, and shoulders.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. Let your body rebuild. No training today.",
      exercises: [],
    },
  ],
};

const footballIntermediate: ProgramData = {
  slug: "football-intermediate",
  sport: "Football",
  emoji: "🏈",
  level: "Intermediate",
  name: "Strength & Explosion",
  tagline: "Turn your foundation into explosive power and position-specific dominance.",
  weeks: 10,
  focusAreas: ["Power Development", "Speed Improvement", "Position Specific Work"],
  equipment: ["Barbell", "Dumbbells", "Cable Machine", "Power Rack", "Sled", "Resistance Bands", "Pull Up Bar"],
  nutritionTip: "Carb load on training days — oatmeal, rice, and sweet potato are your fuel. Hit your protein within 30 minutes after every workout. Aim for 1.1g protein per lb of bodyweight.",
  schedule: [
    {
      day: "Monday", focus: "Heavy Upper Body", exercises: [
        { name: "Bench Press", detail: "4 × 6" },
        { name: "Incline Press", detail: "4 × 8" },
        { name: "Weighted Pull Ups", detail: "4 × 6" },
        { name: "Cable Row", detail: "4 × 10" },
        { name: "Face Pulls", detail: "3 × 15" },
        { name: "Tricep Pushdown", detail: "3 × 12" },
      ],
    },
    {
      day: "Tuesday", focus: "Heavy Lower Body & Power", exercises: [
        { name: "Back Squat", detail: "4 × 5" },
        { name: "Romanian Deadlift", detail: "4 × 8" },
        { name: "Bulgarian Split Squat", detail: "3 × 10 each" },
        { name: "Power Clean", detail: "4 × 4" },
        { name: "Box Jumps", detail: "4 × 6" },
        { name: "Broad Jump", detail: "4 × 5" },
      ],
    },
    {
      day: "Wednesday", focus: "Speed & Agility", exercises: [
        { name: "40-Yard Dash", detail: "8 reps" },
        { name: "Pro Agility Shuttle", detail: "6 reps" },
        { name: "Cone Drills", detail: "6 sets" },
        { name: "Hill Sprints", detail: "6 reps" },
        { name: "Resistance Band Sprints", detail: "6 × 40 yds" },
      ],
    },
    {
      day: "Thursday", focus: "Full Body Strength", exercises: [
        { name: "Deadlift", detail: "4 × 5" },
        { name: "Push Press", detail: "4 × 6" },
        { name: "Hang Clean", detail: "4 × 4" },
        { name: "Core Work:", isSection: true },
        { name: "Ab Wheel", detail: "3 × 15" },
        { name: "Cable Woodchop", detail: "3 × 12 each side" },
        { name: "Pallof Press", detail: "3 × 12 each side" },
      ],
    },
    {
      day: "Friday", focus: "Position Specific Conditioning", exercises: [
        { name: "QBs — Throwing drills, footwork, pocket movement", isSection: true },
        { name: "Skill Positions — Route running, catching, change of direction", isSection: true },
        { name: "Linemen — Hand fighting, leverage drills, sled work", isSection: true },
        { name: "All positions finish with:", isSection: true },
        { name: "Conditioning Sprints", detail: "8 × 40 yds with 30 sec rest" },
      ],
    },
    {
      day: "Saturday", focus: "Recovery & Mobility",
      isRest: true, restNote: "Foam rolling, dynamic stretching, 30 min yoga flow. Focus on thoracic spine, hips, and ankles.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. Sleep 8+ hours.",
      exercises: [],
    },
  ],
};

const footballElite: ProgramData = {
  slug: "football-elite",
  sport: "Football",
  emoji: "🏈",
  level: "Advanced",
  name: "Peak Performance",
  tagline: "Elite strength, explosive power, and game-ready conditioning for the serious recruit.",
  weeks: 12,
  focusAreas: ["Elite Strength", "Explosive Power", "Game-Ready Conditioning"],
  equipment: ["Full Power Rack", "Barbell", "Dumbbells", "Cables", "Resistance Bands", "Sled", "Medicine Ball", "Pull Up Bar"],
  nutritionTip: "Elite athletes need 4,000–5,000 calories on heavy training days. Track your macros: roughly 1.2g protein per lb, 2.5g carbs per lb, and 0.5g fat per lb. Prioritize sleep — 8–9 hours minimum. Recovery IS training.",
  schedule: [
    {
      day: "Monday", focus: "Max Effort Upper Body", exercises: [
        { name: "Bench Press", detail: "Work to 1RM, then 3 × 3 at 85%" },
        { name: "Weighted Dips", detail: "4 × 8" },
        { name: "DB Incline Press", detail: "4 × 10" },
        { name: "Cable Fly", detail: "3 × 15" },
        { name: "Weighted Pull Ups", detail: "4 × 6" },
        { name: "Barbell Row", detail: "4 × 6" },
        { name: "Face Pulls", detail: "3 × 20" },
      ],
    },
    {
      day: "Tuesday", focus: "Max Effort Lower Body", exercises: [
        { name: "Back Squat", detail: "Work to 1RM, then 3 × 3 at 85%" },
        { name: "Romanian Deadlift", detail: "4 × 6" },
        { name: "Bulgarian Split Squat", detail: "4 × 8 each" },
        { name: "Power Clean", detail: "5 × 3" },
        { name: "Hang Snatch", detail: "4 × 3" },
        { name: "Box Jump", detail: "5 × 5" },
      ],
    },
    {
      day: "Wednesday", focus: "Speed Day", exercises: [
        { name: "40-Yard Dash (timed)", detail: "10 reps — rest 3 min between" },
        { name: "Flying 20s", detail: "6 reps" },
        { name: "Resisted Sprints", detail: "8 × 30 yds" },
        { name: "Pro Agility Shuttle", detail: "8 reps" },
        { name: "L-Drill", detail: "8 reps" },
        { name: "Position Specific Footwork", detail: "20 min" },
      ],
    },
    {
      day: "Thursday", focus: "Dynamic Effort Upper Body", exercises: [
        { name: "Speed Bench (with bands)", detail: "8 × 3 at 60%" },
        { name: "Push Press", detail: "5 × 3" },
        { name: "Explosive Push Ups", detail: "4 × 10" },
        { name: "Medicine Ball Chest Pass", detail: "4 × 10" },
        { name: "Lat Pulldown", detail: "4 × 10" },
        { name: "Seated Cable Row", detail: "4 × 10" },
        { name: "Band Pull Apart", detail: "3 × 20" },
      ],
    },
    {
      day: "Friday", focus: "Dynamic Effort Lower & Conditioning", exercises: [
        { name: "Speed Squat (with bands)", detail: "8 × 2 at 60%" },
        { name: "Deadlift", detail: "6 × 2 at 70%" },
        { name: "Sled Push", detail: "5 × 30 yds" },
        { name: "Sled Pull", detail: "5 × 30 yds" },
        { name: "Gassers", detail: "6 reps" },
        { name: "110-Yard Sprints", detail: "6 reps" },
      ],
    },
    {
      day: "Saturday", focus: "Skills & Competition Prep",
      isRest: true, restNote: "Team drills, film review, and mental preparation. Treat this like game week prep.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest + Recovery",
      isRest: true, restNote: "Ice bath or contrast shower, foam rolling, 9 hours sleep minimum. Recovery is where you get stronger.",
      exercises: [],
    },
  ],
};

// ─── BASKETBALL ───────────────────────────────────────────────────────────────

const basketballBeginner: ProgramData = {
  slug: "basketball-beginner",
  sport: "Basketball",
  emoji: "🏀",
  level: "Beginner",
  name: "Build Your Base",
  tagline: "Develop the athleticism and skills foundation every basketball player needs.",
  weeks: 8,
  focusAreas: ["Athleticism Foundation", "Ball Handling", "Conditioning"],
  equipment: ["Dumbbells", "Jump Rope", "Basketball", "Basketball Hoop"],
  nutritionTip: "Stay hydrated — drink at least half your bodyweight in ounces of water daily. At 150 lbs, that's 75 oz (about 9 glasses). Add an electrolyte drink during workouts longer than 60 minutes.",
  schedule: [
    {
      day: "Monday", focus: "Lower Body Strength", exercises: [
        { name: "Goblet Squat", detail: "3 × 10" },
        { name: "Lunge", detail: "3 × 12 each leg" },
        { name: "Step Ups", detail: "3 × 12 each leg" },
        { name: "Calf Raises", detail: "3 × 20" },
        { name: "Glute Bridge", detail: "3 × 15" },
        { name: "Wall Sit", detail: "3 × 45 sec" },
      ],
    },
    {
      day: "Tuesday", focus: "Conditioning & Ball Handling", exercises: [
        { name: "Jump Rope", detail: "3 × 3 min" },
        { name: "Defensive Slides", detail: "4 × 30 sec" },
        { name: "Ball Handling — Stationary Crossover", detail: "5 min" },
        { name: "Ball Handling — Between Legs", detail: "5 min" },
        { name: "Ball Handling — Behind Back", detail: "5 min" },
        { name: "Form Shooting (5 spots)", detail: "10 makes each spot" },
      ],
    },
    {
      day: "Wednesday", focus: "Upper Body & Core", exercises: [
        { name: "Push Ups", detail: "3 × 15" },
        { name: "Dumbbell Row", detail: "3 × 12 each arm" },
        { name: "Dumbbell Shoulder Press", detail: "3 × 10" },
        { name: "Plank", detail: "3 × 45 sec" },
        { name: "Dead Bug", detail: "3 × 10 each side" },
        { name: "Superman Hold", detail: "3 × 12" },
      ],
    },
    {
      day: "Thursday", focus: "Speed & Agility", exercises: [
        { name: "Ladder Drills", detail: "4 sets" },
        { name: "Suicide Sprints", detail: "6 reps" },
        { name: "Defensive Slides", detail: "4 × 30 sec" },
        { name: "Standing Vertical Jumps", detail: "3 × 10" },
        { name: "Approach Jumps", detail: "3 × 8" },
      ],
    },
    {
      day: "Friday", focus: "Skills & Shooting", exercises: [
        { name: "Ball Handling Drills", detail: "15 min" },
        { name: "Mid-Range Shooting (10 spots)", detail: "5 makes each spot" },
        { name: "Free Throws", detail: "50 makes" },
        { name: "Three-Point Shooting (5 spots)", detail: "10 reps each spot" },
      ],
    },
    {
      day: "Saturday", focus: "Light Conditioning",
      isRest: true, restNote: "20 min easy jog, 10 min core work, full body stretch. Keep the heart rate low.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. Let your legs recover for the week ahead.",
      exercises: [],
    },
  ],
};

const basketballIntermediate: ProgramData = {
  slug: "basketball-intermediate",
  sport: "Basketball",
  emoji: "🏀",
  level: "Intermediate",
  name: "Elevate Your Game",
  tagline: "Build explosive athleticism, improve your vertical, and sharpen advanced skills.",
  weeks: 10,
  focusAreas: ["Explosion & Vertical", "Advanced Skills", "Conditioning"],
  equipment: ["Barbell", "Dumbbells", "Pull Up Bar", "Jump Rope", "Basketball", "Treadmill"],
  nutritionTip: "Eat complex carbs like oatmeal and sweet potato 2–3 hours before every workout and game. Your muscles need glycogen to explode. Eat protein within 30 minutes after — aim for 0.8g protein per lb of bodyweight daily.",
  schedule: [
    {
      day: "Monday", focus: "Lower Body Power", exercises: [
        { name: "Back Squat", detail: "4 × 6" },
        { name: "Box Jump", detail: "4 × 8" },
        { name: "Depth Jump", detail: "3 × 6" },
        { name: "Single Leg Squat", detail: "3 × 10 each" },
        { name: "Nordic Hamstring Curl", detail: "3 × 8" },
        { name: "Weighted Calf Raises", detail: "4 × 15" },
        { name: "Ankle Stability Work", detail: "2 × 10 each" },
      ],
    },
    {
      day: "Tuesday", focus: "Ball Handling & Shooting", exercises: [
        { name: "Two Ball Dribbling Drills", detail: "15 min" },
        { name: "Cone Dribbling", detail: "10 min" },
        { name: "Pull Up Jumper off Dribble", detail: "20 makes each side" },
        { name: "Three-Point Shooting", detail: "100 makes — don't leave until complete" },
        { name: "Catch-and-Shoot (Corner, Wing, Top)", detail: "10 makes each spot" },
      ],
    },
    {
      day: "Wednesday", focus: "Conditioning", exercises: [
        { name: "Treadmill Sprint Intervals", detail: "12 × (30 sec on / 30 sec off)" },
        { name: "Suicide Sprints", detail: "8 reps" },
        { name: "Defensive Slides", detail: "6 sets full court" },
        { name: "Jump Rope", detail: "5 × 2 min with 30 sec rest" },
      ],
    },
    {
      day: "Thursday", focus: "Full Body Strength", exercises: [
        { name: "Deadlift", detail: "4 × 6" },
        { name: "Push Press", detail: "4 × 6" },
        { name: "Weighted Pull Ups", detail: "4 × 6" },
        { name: "Core Work:", isSection: true },
        { name: "Cable Rotation", detail: "3 × 12 each side" },
        { name: "Pallof Press", detail: "3 × 12 each side" },
        { name: "Ab Wheel", detail: "3 × 15" },
      ],
    },
    {
      day: "Friday", focus: "Skills & Game Speed", exercises: [
        { name: "1v1 Drives (Multiple Angles)", detail: "20 min" },
        { name: "Floater Practice", detail: "10 min" },
        { name: "Pick & Roll Reads", detail: "10 min" },
        { name: "Transition Offense Drills", detail: "10 min" },
        { name: "Film Study — watch 1 game at your position", detail: "30–45 min" },
      ],
    },
    {
      day: "Saturday", focus: "Vertical Jump Protocol", exercises: [
        { name: "Depth Jumps", detail: "5 × 5" },
        { name: "Approach Jumps", detail: "5 × 5" },
        { name: "Max Vertical Attempts", detail: "5 jumps" },
        { name: "Plyometric Circuit", detail: "3 rounds" },
      ],
    },
    {
      day: "Sunday", focus: "Rest and Recovery",
      isRest: true, restNote: "Foam rolling, light stretching, 8–9 hours sleep. Your vertical grows during recovery — protect it.",
      exercises: [],
    },
  ],
};

const basketballElite: ProgramData = {
  slug: "basketball-elite",
  sport: "Basketball",
  emoji: "🏀",
  level: "Advanced",
  name: "Pro Level Preparation",
  tagline: "NBA-style training, elite conditioning, and advanced basketball IQ development.",
  weeks: 12,
  focusAreas: ["NBA-Style Training", "Elite Conditioning", "Advanced Basketball IQ"],
  equipment: ["Full Weight Room", "Barbell", "Pull Up Bar", "Track or Court", "Basketball", "Film Access"],
  nutritionTip: "Elite basketball players burn 800–1,000 calories per game. Replenish with a full meal within 45 minutes of competing — rice, chicken, and vegetables. On back-to-back days, add 500 extra calories. Sleep 9 hours minimum.",
  schedule: [
    {
      day: "Monday", focus: "Strength & Power", exercises: [
        { name: "Back Squat", detail: "5 × 5 heavy" },
        { name: "Power Clean", detail: "5 × 3" },
        { name: "Box Jump", detail: "5 × 5" },
        { name: "Single Leg Deadlift", detail: "4 × 8 each" },
        { name: "Nordic Curl", detail: "4 × 6" },
        { name: "Explosive Step Ups", detail: "4 × 10 each" },
        { name: "Lateral Bounds", detail: "4 × 8 each side" },
      ],
    },
    {
      day: "Tuesday", focus: "Guard / Forward Specific Skills", exercises: [
        { name: "Guards — Pick & Roll Mastery, Pull Up 3, Off-Hand Finishing", isSection: true },
        { name: "Forwards — Post Moves, Face Up Game, Mid-Range Mastery", isSection: true },
        { name: "All Players:", isSection: true },
        { name: "Three-Point Makes (track percentage)", detail: "200 makes" },
        { name: "Free Throws Under Fatigue", detail: "Sprint then shoot — 20 sets" },
      ],
    },
    {
      day: "Wednesday", focus: "Elite Conditioning", exercises: [
        { name: "400-Yard Intervals (timed, 90 sec rest)", detail: "6 reps" },
        { name: "Baseline-to-Baseline Court Sprints", detail: "20 reps" },
        { name: "Defensive Slides Full Court", detail: "8 sets" },
        { name: "Closeout Drills", detail: "10 reps" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body & Core", exercises: [
        { name: "Bench Press", detail: "4 × 6" },
        { name: "Weighted Dips", detail: "4 × 8" },
        { name: "Cable Row", detail: "4 × 10" },
        { name: "Core Circuit:", isSection: true },
        { name: "Hanging Leg Raise", detail: "3 × 15" },
        { name: "Cable Crunch", detail: "3 × 20" },
        { name: "Rotational Medicine Ball Slam", detail: "3 × 12 each side" },
      ],
    },
    {
      day: "Friday", focus: "Advanced Skills & IQ", exercises: [
        { name: "Film Breakdown — last 3 games", detail: "30 min" },
        { name: "Work On Weaknesses Identified from Film", detail: "30 min" },
        { name: "Free Throws Under Fatigue", detail: "Sprint, then shoot — 20 sets" },
        { name: "Late Game Situations — Clock management, fouling strategy", detail: "15 min" },
      ],
    },
    {
      day: "Saturday", focus: "Competition Simulation", exercises: [
        { name: "Full 5v5 or Intense 1v1 / 3v3 Pickup", detail: "90 min" },
        { name: "Track Your Stats and Review After", detail: "Points, assists, rebounds, TO" },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "9 hours sleep — non-negotiable at this level. Foam roll, stretch, eat clean. No training today.",
      exercises: [],
    },
  ],
};

// ─── BASEBALL ─────────────────────────────────────────────────────────────────

const baseballBeginner: ProgramData = {
  slug: "baseball-beginner",
  sport: "Baseball",
  emoji: "⚾",
  level: "Beginner",
  name: "Athlete First",
  tagline: "Build the athletic foundation and arm care habits that protect your future in the sport.",
  weeks: 8,
  focusAreas: ["Athletic Foundation", "Arm Care", "Basic Mechanics"],
  equipment: ["Dumbbells", "Resistance Bands", "Baseball", "Tee", "Bat"],
  nutritionTip: "Pitchers especially need anti-inflammatory foods on recovery days — wild salmon, blueberries, and leafy greens. Aim for 0.9g protein per lb of bodyweight and 64–80 oz of water daily.",
  schedule: [
    {
      day: "Monday", focus: "Lower Body Strength", exercises: [
        { name: "Goblet Squat", detail: "3 × 12" },
        { name: "Romanian Deadlift", detail: "3 × 10" },
        { name: "Lateral Lunge", detail: "3 × 10 each side" },
        { name: "Hip Flexor Stretch", detail: "3 × 30 sec each" },
        { name: "Glute Activation (Clamshells)", detail: "3 × 15 each" },
        { name: "Single Leg Balance", detail: "3 × 30 sec each" },
      ],
    },
    {
      day: "Tuesday", focus: "Arm Care & Throwing", exercises: [
        { name: "Band — External Rotation", detail: "3 × 15 each arm" },
        { name: "Band — Internal Rotation", detail: "3 × 15 each arm" },
        { name: "Band — Scarecrow", detail: "3 × 12" },
        { name: "Long Toss — Build from 45 ft to 90 ft", detail: "20 throws total" },
        { name: "Flat Ground Pitching (mechanics focus)", detail: "20 pitches" },
      ],
    },
    {
      day: "Wednesday", focus: "Upper Body Strength", exercises: [
        { name: "Push Ups", detail: "3 × 15" },
        { name: "Dumbbell Row", detail: "3 × 12 each arm" },
        { name: "Face Pulls", detail: "3 × 15" },
        { name: "Rotator Cuff Circuit (bands)", detail: "2 rounds × 12 each" },
        { name: "Wrist Curls", detail: "3 × 20 each" },
      ],
    },
    {
      day: "Thursday", focus: "Speed & Agility", exercises: [
        { name: "First Step Quickness Drills", detail: "3 × 10" },
        { name: "Base Running Technique — 90 ft leads and reads", detail: "15 min" },
        { name: "Lateral Movement Drills", detail: "4 sets" },
        { name: "Reaction Ball Work", detail: "5 min" },
      ],
    },
    {
      day: "Friday", focus: "Hitting & Fielding Skills", exercises: [
        { name: "Tee Work (mechanics focus)", detail: "50 swings" },
        { name: "Soft Toss", detail: "30 swings" },
        { name: "Batting Practice", detail: "20 pitches" },
        { name: "Fielding Grounders", detail: "20 reps" },
        { name: "Fly Balls", detail: "20 reps" },
      ],
    },
    {
      day: "Saturday", focus: "Light Throwing & Flexibility",
      isRest: true, restNote: "Light long toss at 50% — maintain arm strength without stress. 20 min full body stretching after.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest — Arm Recovery",
      isRest: true, restNote: "No throwing. Complete rest. Arm recovery is critical at every level — protect it now.",
      exercises: [],
    },
  ],
};

const baseballIntermediate: ProgramData = {
  slug: "baseball-intermediate",
  sport: "Baseball",
  emoji: "⚾",
  level: "Intermediate",
  name: "Develop Your Arsenal",
  tagline: "Build velocity, bat speed, and position mastery for competitive-level play.",
  weeks: 10,
  focusAreas: ["Velocity Development", "Bat Speed", "Position Mastery"],
  equipment: ["Barbell", "Dumbbells", "Medicine Ball", "Resistance Bands", "Baseball", "Bat", "Radar Gun (optional)"],
  nutritionTip: "Eat a light meal 2 hours before games — nothing heavy. Focus on easily digestible carbs and protein: turkey sandwich on white bread, banana, and 16 oz of water. Heavy food = slow reactions.",
  schedule: [
    {
      day: "Monday", focus: "Lower Body Power", exercises: [
        { name: "Back Squat", detail: "4 × 6" },
        { name: "Romanian Deadlift", detail: "4 × 8" },
        { name: "Hip Thrust", detail: "4 × 10" },
        { name: "Lateral Band Walk", detail: "3 × 20 each way" },
        { name: "Single Leg Squat", detail: "3 × 10 each" },
      ],
    },
    {
      day: "Tuesday", focus: "Throwing Program", exercises: [
        { name: "Arm Care Band Circuit", detail: "Full protocol, 15 min" },
        { name: "Dynamic Warm Up", detail: "10 min" },
        { name: "Long Toss — Build to max distance", detail: "Track your max" },
        { name: "Bullpen Session (2 pitch types)", detail: "40–50 pitches" },
        { name: "Video Mechanics Review", detail: "10 min after session" },
      ],
    },
    {
      day: "Wednesday", focus: "Rotational Power", exercises: [
        { name: "Medicine Ball Rotational Throw", detail: "4 × 8 each side" },
        { name: "Cable Woodchop", detail: "3 × 12 each side" },
        { name: "Band Rotation", detail: "3 × 15 each side" },
        { name: "Plank (multiple variations)", detail: "3 × 45 sec each" },
        { name: "Dead Bug", detail: "3 × 10 each side" },
        { name: "Bird Dog", detail: "3 × 10 each side" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body Strength", exercises: [
        { name: "Bench Press", detail: "4 × 8" },
        { name: "Weighted Pull Ups", detail: "4 × 6" },
        { name: "Cable Row", detail: "4 × 10" },
        { name: "Shoulder Stability Work", detail: "3 × 12" },
        { name: "Rotator Cuff Maintenance (bands)", detail: "2 rounds × 15" },
      ],
    },
    {
      day: "Friday", focus: "Hitting Development", exercises: [
        { name: "Tee Work (bat path focus)", detail: "75 swings" },
        { name: "Front Toss", detail: "50 swings" },
        { name: "Live BP", detail: "30 pitches" },
        { name: "Study Opposing Pitcher Tendencies", detail: "20 min" },
      ],
    },
    {
      day: "Saturday", focus: "Fielding & Position Skills", exercises: [
        { name: "Position Specific Fielding", detail: "30 min" },
        { name: "Double Play Footwork", detail: "15 min" },
        { name: "Cutoff and Relay Throws", detail: "15 min" },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest — Arm Recovery",
      isRest: true, restNote: "No throwing. Complete rest. 8+ hours sleep. Arm recovery is your competitive edge.",
      exercises: [],
    },
  ],
};

const baseballElite: ProgramData = {
  slug: "baseball-elite",
  sport: "Baseball",
  emoji: "⚾",
  level: "Advanced",
  name: "Compete At The Next Level",
  tagline: "Showcase-ready preparation — elite velocity, advanced approach, and full athletic development.",
  weeks: 12,
  focusAreas: ["Showcase Preparation", "Elite Velocity", "Advanced Hitting Approach"],
  equipment: ["Full Weight Room", "Barbell", "Medicine Ball", "Radar Gun", "Bat", "Pitching Machine", "Video Camera"],
  nutritionTip: "Pitchers who throw 75+ pitches need 48–72 hours recovery minimum. Do not throw hard back-to-back days. Fuel recovery with anti-inflammatory meals: salmon, blueberries, spinach, olive oil. Hydrate with 96–128 oz of water daily.",
  schedule: [
    {
      day: "Monday", focus: "Max Strength", exercises: [
        { name: "Back Squat", detail: "5 × 5, work to heavy set" },
        { name: "Deadlift", detail: "4 × 4 heavy" },
        { name: "Hip Thrust (weighted)", detail: "4 × 8" },
        { name: "Nordic Curl", detail: "3 × 8" },
        { name: "Rotational Med Ball Work", detail: "4 × 8 each side" },
      ],
    },
    {
      day: "Tuesday", focus: "Pitching / Elite Throwing", exercises: [
        { name: "Full Arm Care Protocol", detail: "15 min — no skipping" },
        { name: "Long Toss to Max Distance", detail: "Then pull-down phase" },
        { name: "Bullpen — Full Game Simulation", detail: "60–75 pitches" },
        { name: "Velocity Tracking (radar if available)", detail: "Track every session" },
        { name: "Film Review of Mechanics", detail: "After every bullpen" },
      ],
    },
    {
      day: "Wednesday", focus: "Athletic Development", exercises: [
        { name: "60-Yard Dash (timed)", detail: "8 reps — rest 3 min" },
        { name: "First Step Reaction Drills", detail: "10 reps" },
        { name: "Cone Drills — Lateral Agility", detail: "4 sets" },
        { name: "Shuffle Drills", detail: "4 × 20 yds each way" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body Power", exercises: [
        { name: "Push Press", detail: "5 × 4" },
        { name: "Weighted Pull Ups", detail: "5 × 5" },
        { name: "Explosive Push Ups", detail: "4 × 10" },
        { name: "Cable Row", detail: "4 × 8" },
        { name: "Face Pulls", detail: "3 × 20" },
        { name: "Band Pull Aparts", detail: "3 × 20" },
      ],
    },
    {
      day: "Friday", focus: "Elite Hitting", exercises: [
        { name: "Tee Work (track exit velocity if possible)", detail: "100 swings" },
        { name: "Machine or Live BP with Specific Approach", detail: "50 pitches" },
        { name: "Two-Strike Approach Work", detail: "20 pitches" },
        { name: "Opposite Field Work", detail: "20 swings" },
        { name: "Situational Hitting (runner on 2nd, squeeze)", detail: "15 min" },
      ],
    },
    {
      day: "Saturday", focus: "Game Simulation or Showcase Prep", exercises: [
        { name: "Pitch Count Management Drill", detail: "15 min" },
        { name: "Showcase Metrics:", isSection: true },
        { name: "60-Yard Dash Time", detail: "3 attempts, best counts" },
        { name: "Velocity (off mound)", detail: "5 max effort pitches" },
        { name: "Exit Velocity off tee", detail: "10 swings" },
        { name: "Infield/Outfield Showcase Fielding", detail: "10 reps" },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "8–9 hours sleep minimum. No throwing. This is non-negotiable for arm health and velocity.",
      exercises: [],
    },
  ],
};

// ─── SOCCER ───────────────────────────────────────────────────────────────────

const soccerBeginner: ProgramData = {
  slug: "soccer-beginner",
  sport: "Soccer",
  emoji: "⚽",
  level: "Beginner",
  name: "The Foundation",
  tagline: "Build the fitness base, technical skills, and positional awareness to compete.",
  weeks: 8,
  focusAreas: ["Fitness Base", "Basic Technical Skills", "Positional Awareness"],
  equipment: ["Soccer Ball", "Cones", "Open Field or Court"],
  nutritionTip: "Soccer players run 5–7 miles per game. Carbohydrates are your primary fuel — eat pasta, rice, or oatmeal the night before games. Stay hydrated with at least 80 oz of water daily and add electrolytes during hard sessions.",
  schedule: [
    {
      day: "Monday", focus: "Endurance Base", exercises: [
        { name: "Steady Jog", detail: "20 min" },
        { name: "Ball Work While Jogging", detail: "10 min" },
        { name: "Passing Drills (wall or partner)", detail: "15 min" },
      ],
    },
    {
      day: "Tuesday", focus: "Strength & Power", exercises: [
        { name: "Goblet Squat", detail: "3 × 10" },
        { name: "Reverse Lunge", detail: "3 × 12 each leg" },
        { name: "Calf Raises", detail: "3 × 20" },
        { name: "Plank", detail: "3 × 45 sec" },
        { name: "Side Plank", detail: "3 × 30 sec each side" },
      ],
    },
    {
      day: "Wednesday", focus: "Technical Skills", exercises: [
        { name: "Dribbling Through Cones", detail: "20 min" },
        { name: "First Touch Work", detail: "15 min" },
        { name: "Juggling Practice", detail: "Track your personal record" },
      ],
    },
    {
      day: "Thursday", focus: "Speed & Agility", exercises: [
        { name: "Ladder Drills", detail: "4 sets" },
        { name: "Cone Drills", detail: "4 sets" },
        { name: "Defensive Positioning Work", detail: "10 min" },
        { name: "Short Sprint Intervals", detail: "10 × 22 yds" },
      ],
    },
    {
      day: "Friday", focus: "Scrimmage or Shooting", exercises: [
        { name: "Shooting Drills (multiple angles)", detail: "30 min" },
        { name: "Small Sided Game or Scrimmage (if available)", detail: "20 min" },
      ],
    },
    {
      day: "Saturday", focus: "Long Run",
      isRest: true, restNote: "30–40 min steady state cardio at conversational pace. Stretch 15 min after. Build your engine.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. Let your legs recover.",
      exercises: [],
    },
  ],
};

const soccerIntermediate: ProgramData = {
  slug: "soccer-intermediate",
  sport: "Soccer",
  emoji: "⚽",
  level: "Intermediate",
  name: "Dominate Your Position",
  tagline: "Position-specific fitness, technical excellence, and competitive conditioning.",
  weeks: 10,
  focusAreas: ["Position Specific Fitness", "Technical Excellence", "Match Conditioning"],
  equipment: ["Soccer Ball", "Cones", "Track or Field", "Dumbbells"],
  nutritionTip: "Intermediate players need to start tracking food quality. Focus on lean proteins (4–6 oz per meal), complex carbs, and healthy fats. Eat pasta or rice the night before matches. Carry 32 oz of water to every training session.",
  schedule: [
    {
      day: "Monday", focus: "Interval Training", exercises: [
        { name: "Technical Warm Up with Ball", detail: "10 min" },
        { name: "440-Yard Repeats (90 sec rest between)", detail: "6 reps" },
        { name: "Cool Down Juggling", detail: "5 min" },
      ],
    },
    {
      day: "Tuesday", focus: "Strength & Power", exercises: [
        { name: "Back Squat", detail: "4 × 6" },
        { name: "Single Leg Deadlift", detail: "3 × 10 each" },
        { name: "Box Jump", detail: "4 × 8" },
        { name: "Core Rotational Work", detail: "3 × 12 each side" },
        { name: "Hip Flexor Strengthening", detail: "3 × 15 each" },
      ],
    },
    {
      day: "Wednesday", focus: "Position Specific Training", exercises: [
        { name: "Defenders — Tackling timing, heading, defensive shape", isSection: true },
        { name: "Midfielders — Passing combinations, vision drills, pressing triggers", isSection: true },
        { name: "Forwards — Finishing under pressure, movement off ball", isSection: true },
        { name: "All Positions:", isSection: true },
        { name: "1v1 Situations", detail: "15 min attacking and defending" },
        { name: "Set Piece Work", detail: "15 min" },
      ],
    },
    {
      day: "Thursday", focus: "Speed Work", exercises: [
        { name: "Flying 30s", detail: "8 reps" },
        { name: "Change of Direction Drills", detail: "10 reps each side" },
        { name: "Reactive Sprint Drills", detail: "8 reps" },
      ],
    },
    {
      day: "Friday", focus: "Technical Mastery", exercises: [
        { name: "1v1 Attacking and Defending", detail: "20 min" },
        { name: "Set Piece Work (free kicks, corners)", detail: "15 min" },
        { name: "Small Sided Games with Focus Skill", detail: "20 min" },
      ],
    },
    {
      day: "Saturday", focus: "Full Match or Scrimmage",
      isRest: true, restNote: "Full 11v11 or scrimmage. Apply everything from the week. If no match available, do a full 90 min field session.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Recovery",
      isRest: true, restNote: "Light stretching, foam rolling, 15 min walk. Focus on hip flexors, quads, and calves.",
      exercises: [],
    },
  ],
};

const soccerElite: ProgramData = {
  slug: "soccer-elite",
  sport: "Soccer",
  emoji: "⚽",
  level: "Advanced",
  name: "Championship Level",
  tagline: "Elite fitness, tactical mastery, and showcase-ready performance.",
  weeks: 12,
  focusAreas: ["Elite VO2 Max Fitness", "Tactical Mastery", "Showcase Preparation"],
  equipment: ["Full Weight Room", "Track", "Soccer Ball", "Cones", "Video Camera for Film"],
  nutritionTip: "Elite soccer players need to carb load the night before matches — pasta or rice with lean protein. During games over 60 minutes, use a sports drink every 20 minutes. Recover with protein + carbs within 30 min after every match and hard session.",
  schedule: [
    {
      day: "Monday", focus: "Double Session — Fitness + Technical", exercises: [
        { name: "AM Session — VO2 Max Intervals:", isSection: true },
        { name: "880-Yard Repeats (90 sec rest)", detail: "6 reps, timed" },
        { name: "PM Session — Technical:", isSection: true },
        { name: "Combination Play", detail: "20 min" },
        { name: "First Touch Under Pressure", detail: "15 min" },
        { name: "Creative 1v1 Work", detail: "15 min" },
      ],
    },
    {
      day: "Tuesday", focus: "Strength & Power", exercises: [
        { name: "Power Clean", detail: "4 × 4" },
        { name: "Back Squat", detail: "4 × 5 heavy" },
        { name: "Box Jumps", detail: "4 × 8" },
        { name: "Single Leg Box Jump", detail: "3 × 6 each" },
        { name: "Lateral Bound", detail: "4 × 6 each side" },
      ],
    },
    {
      day: "Wednesday", focus: "Tactical Training", exercises: [
        { name: "Video Analysis — opponent or own footage", detail: "30 min" },
        { name: "Formation & Shape Work", detail: "30 min" },
        { name: "Pressing Triggers & Defensive Transitions", detail: "30 min" },
      ],
    },
    {
      day: "Thursday", focus: "Speed & Active Recovery", exercises: [
        { name: "Max Velocity Sprints", detail: "8 × 30 yds" },
        { name: "Agility Ladder Drills", detail: "4 sets" },
        { name: "Active Recovery Bike", detail: "20 min at 60% effort" },
      ],
    },
    {
      day: "Friday", focus: "Match Preparation", exercises: [
        { name: "Set Pieces — Attacking and Defending", detail: "30 min" },
        { name: "Team Shape & Transition Runs", detail: "20 min" },
        { name: "Mental Preparation — visualization, strategy review", detail: "15 min" },
      ],
    },
    {
      day: "Saturday", focus: "Full Match Intensity",
      isRest: true, restNote: "Full game — 90 min match intensity. Track minutes played, distance covered if possible. Leave everything on the field.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Recovery Protocol",
      isRest: true, restNote: "Ice bath or contrast shower, compression gear, 20 min mobility work, 9 hours sleep. Your next performance depends on today's recovery.",
      exercises: [],
    },
  ],
};

// ─── TRACK ────────────────────────────────────────────────────────────────────

const trackBeginner: ProgramData = {
  slug: "track-beginner",
  sport: "Track",
  emoji: "🏃",
  level: "Beginner",
  name: "Speed Foundation",
  tagline: "Build running mechanics, base fitness, and injury prevention habits for every track event.",
  weeks: 8,
  focusAreas: ["Running Mechanics", "Fitness Base", "Injury Prevention"],
  equipment: ["Track or Field", "Running Shoes", "Cones", "Dumbbells"],
  nutritionTip: "Sprinters need more protein and moderate carbs. Distance runners need higher carbs for sustained energy. Both need iron-rich foods to fight fatigue — lean red meat, spinach, lentils. Drink 80–96 oz of water daily. Eat a light meal 2 hours before training.",
  schedule: [
    {
      day: "Monday", focus: "Strength Foundation", exercises: [
        { name: "Back Squat", detail: "3 × 8" },
        { name: "Romanian Deadlift", detail: "3 × 10" },
        { name: "Lunges", detail: "3 × 10 each leg" },
        { name: "Push Ups", detail: "3 × 15" },
        { name: "Pull Ups / Assisted Pull Ups", detail: "3 × max" },
        { name: "Plank", detail: "3 × 45 sec" },
      ],
    },
    {
      day: "Tuesday", focus: "Sprint Mechanics", exercises: [
        { name: "A-Skip Form Drills", detail: "4 × 30 yds" },
        { name: "B-Skip Form Drills", detail: "4 × 30 yds" },
        { name: "High Knees", detail: "4 × 30 yds" },
        { name: "40-Yard Dash", detail: "6 reps, focus on form not time" },
        { name: "Flying 20s (build then hold)", detail: "4 reps" },
      ],
    },
    {
      day: "Wednesday", focus: "Active Recovery",
      isRest: true, restNote: "20 min easy jog at conversational pace. Full body stretching — 15 min. Foam roll legs and hips.",
      exercises: [],
    },
    {
      day: "Thursday", focus: "Strength + Jumps", exercises: [
        { name: "Step Ups", detail: "3 × 12 each leg" },
        { name: "Calf Raises", detail: "3 × 20" },
        { name: "Box Jumps", detail: "3 × 6" },
        { name: "Broad Jumps", detail: "3 × 6" },
        { name: "Single Leg Hop", detail: "3 × 8 each leg" },
        { name: "Glute Bridge", detail: "3 × 15" },
      ],
    },
    {
      day: "Friday", focus: "Event Specific Work", exercises: [
        { name: "Sprinters (100/200m):", isSection: true },
        { name: "Block Start Practice", detail: "10 starts" },
        { name: "100m at 85%", detail: "4 reps, full recovery" },
        { name: "Distance (800m+):", isSection: true },
        { name: "Easy 1-mile Run", detail: "At comfortable pace" },
        { name: "Jumps:", isSection: true },
        { name: "Approach Jump Practice", detail: "10 attempts" },
        { name: "Throws:", isSection: true },
        { name: "Basic Throwing Technique Work", detail: "20 min with coach" },
      ],
    },
    {
      day: "Saturday", focus: "Aerobic Work", exercises: [
        { name: "Distance runners — Easy 2–3 mile run", isSection: true },
        { name: "Sprinters / Jumpers / Throwers — 20 min easy bike or jog", isSection: true },
        { name: "Full body stretch after", detail: "15 min" },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. Protect your legs — track injuries happen when you don't recover.",
      exercises: [],
    },
  ],
};

const trackIntermediate: ProgramData = {
  slug: "track-intermediate",
  sport: "Track",
  emoji: "🏃",
  level: "Intermediate",
  name: "Break Your PR",
  tagline: "Event-specific periodization to drop your time, raise your mark, and peak for competition.",
  weeks: 10,
  focusAreas: ["Event Periodization", "Strength + Speed Integration", "Competition Prep"],
  equipment: ["Track", "Barbell", "Starting Blocks", "Dumbbells", "Pull Up Bar"],
  nutritionTip: "Sprinters: higher protein (1g per lb), moderate carbs. Distance runners: heavy carbs (2–3g per lb) before long runs. Both: iron-rich foods weekly to prevent performance drops. Hydrate before you're thirsty — sip 6–8 oz of water every 20 min during training.",
  schedule: [
    {
      day: "Monday", focus: "Strength — Lower Body Heavy", exercises: [
        { name: "Back Squat", detail: "4 × 5 — add weight from last week" },
        { name: "Deadlift", detail: "4 × 4 heavy" },
        { name: "Power Clean", detail: "4 × 4" },
        { name: "Romanian Deadlift", detail: "3 × 8" },
        { name: "Calf Raises", detail: "3 × 20" },
      ],
    },
    {
      day: "Tuesday", focus: "Event Specific Speed", exercises: [
        { name: "Sprinters (100/200m):", isSection: true },
        { name: "Block Starts", detail: "10 reps" },
        { name: "100m at 90%", detail: "4 reps, full recovery" },
        { name: "200m at 85%", detail: "3 reps" },
        { name: "Distance (800m+):", isSection: true },
        { name: "440-Yard Intervals (90 sec rest)", detail: "6 reps, timed" },
        { name: "1-Mile Tempo Run", detail: "At race effort" },
        { name: "Jumps:", isSection: true },
        { name: "Approach Jump Practice with Full Runway", detail: "12 attempts" },
      ],
    },
    {
      day: "Wednesday", focus: "Active Recovery", exercises: [
        { name: "Easy 15 min jog", isSection: true },
        { name: "Form Drills", detail: "A-skip, B-skip, high knees — 3 × 30 yds each" },
        { name: "Full body stretch + foam roll", detail: "20 min" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body + Core Strength", exercises: [
        { name: "Bench Press", detail: "3 × 8" },
        { name: "Pull Ups", detail: "3 × 10" },
        { name: "Dumbbell Shoulder Press", detail: "3 × 10" },
        { name: "Core Circuit:", isSection: true },
        { name: "Hanging Leg Raise", detail: "3 × 12" },
        { name: "Cable Rotation", detail: "3 × 12 each side" },
        { name: "Ab Wheel", detail: "3 × 12" },
      ],
    },
    {
      day: "Friday", focus: "Speed Work — Acceleration & Top End", exercises: [
        { name: "Flying 20s", detail: "6 reps — max effort" },
        { name: "Resisted Sprints (bands)", detail: "6 × 30 yds" },
        { name: "Acceleration Runs (10, 20, 30 yd builds)", detail: "3 sets" },
        { name: "Standing Long Jump", detail: "5 attempts" },
      ],
    },
    {
      day: "Saturday", focus: "Aerobic / Event Distance Work", exercises: [
        { name: "Distance runners — 4–6 mile easy run", isSection: true },
        { name: "Sprinters — 2 mile easy jog + strides", isSection: true },
        { name: "Stretch 20 min after", isSection: true },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Full rest. Strength gains are made on rest days — protect your recovery.",
      exercises: [],
    },
  ],
};

const trackElite: ProgramData = {
  slug: "track-elite",
  sport: "Track",
  emoji: "🏃",
  level: "Advanced",
  name: "Championship Performance",
  tagline: "Full periodization — base, build, peak, and taper phases for championship-level results.",
  weeks: 12,
  focusAreas: ["Full Periodization", "Event Mastery", "Mental Performance"],
  equipment: ["Full Track", "Full Weight Room", "Starting Blocks", "Radar Gun (sprinters)", "Stopwatch"],
  nutritionTip: "Elite track athletes need precise fueling. Sprinters: 1.2g protein per lb, 2g carbs per lb. Distance: 1g protein per lb, 3g carbs per lb on long run days. During meets, eat a light 300-calorie meal 3 hours before events. Warm up with 8–12 oz of sports drink 30 min before competing.",
  schedule: [
    {
      day: "Monday", focus: "Max Strength (Base / Build Phase)", exercises: [
        { name: "Back Squat", detail: "5 × 5 — work to heavy set" },
        { name: "Deadlift", detail: "4 × 4 heavy" },
        { name: "Power Clean", detail: "5 × 3" },
        { name: "Romanian Deadlift", detail: "3 × 8" },
        { name: "Plyometric Finisher — Box Jumps", detail: "3 × 6 max height" },
      ],
    },
    {
      day: "Tuesday", focus: "Max Velocity Work", exercises: [
        { name: "Sprinters:", isSection: true },
        { name: "Flying 20s — time every rep", detail: "8 reps, full 8 min recovery" },
        { name: "100m Race Simulation", detail: "2 reps at 95%+" },
        { name: "Distance:", isSection: true },
        { name: "880-Yard Intervals", detail: "6 reps at race pace minus 5 sec" },
        { name: "Jumps:", isSection: true },
        { name: "Full Competition Approach", detail: "15 attempts — judge best 5" },
      ],
    },
    {
      day: "Wednesday", focus: "Build / Peak Phase Work", exercises: [
        { name: "Tempo Runs at 80%", detail: "8 × 220 yds with 45 sec rest" },
        { name: "Sprint Drills", detail: "A/B-skip, wicket drills, 3 × 30 yds each" },
        { name: "Mobility & Flexibility", detail: "30 min full routine" },
      ],
    },
    {
      day: "Thursday", focus: "Strength + Plyometrics", exercises: [
        { name: "Push Press", detail: "4 × 4" },
        { name: "Weighted Pull Ups", detail: "4 × 5" },
        { name: "Depth Jumps", detail: "4 × 5" },
        { name: "Bounding (10 bounds for distance)", detail: "5 sets" },
        { name: "Core — Hanging Leg Raise + Cable Crunch", detail: "3 × 15 each" },
      ],
    },
    {
      day: "Friday", focus: "Competition Simulation / Taper Work", exercises: [
        { name: "Race Simulation at 100%", detail: "1–2 reps only" },
        { name: "Block Starts (sprinters)", detail: "5 perfect starts" },
        { name: "Mental Preparation", detail: "Visualization, race strategy review" },
        { name: "Light Form Drills", detail: "2 × 30 yds each" },
      ],
    },
    {
      day: "Saturday", focus: "Competition or Time Trial",
      isRest: true, restNote: "Compete. If no meet, run a time trial at full effort. This is your data point — compare to Week 1.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Recovery Protocol",
      isRest: true, restNote: "Ice bath (10 min at 55°F), full body stretch, 9 hours sleep. Log your session data and review it.",
      exercises: [],
    },
  ],
};

// ─── WRESTLING ────────────────────────────────────────────────────────────────

const wrestlingBeginner: ProgramData = {
  slug: "wrestling-beginner",
  sport: "Wrestling",
  emoji: "🤼",
  level: "Beginner",
  name: "Mat Ready",
  tagline: "Build the functional strength, flexibility, and basic technique to compete on the mat.",
  weeks: 8,
  focusAreas: ["Functional Strength", "Flexibility", "Basic Technique"],
  equipment: ["Barbell", "Pull Up Bar", "Wrestling Mat", "Dumbbells"],
  nutritionTip: "Wrestlers need to manage weight carefully. Never cut more than 1–2 lbs per week. Eat 0.9g protein per lb of bodyweight to preserve muscle. Drink 96 oz of water daily — dehydration kills performance and is dangerous. Do NOT cut weight by skipping meals.",
  schedule: [
    {
      day: "Monday", focus: "Full Body Strength", exercises: [
        { name: "Back Squat", detail: "3 × 10" },
        { name: "Deadlift", detail: "3 × 8" },
        { name: "Pull Ups", detail: "3 × max reps" },
        { name: "Push Ups", detail: "3 × 20" },
        { name: "Farmer Carry", detail: "3 × 40 yds" },
        { name: "Hip Mobility Routine", detail: "10 min" },
      ],
    },
    {
      day: "Tuesday", focus: "Technique — Basics", exercises: [
        { name: "Stance and Motion Drills", detail: "10 min" },
        { name: "Takedown Fundamentals (double leg, single leg)", detail: "20 min drilling" },
        { name: "Escape Technique (stand up, sit out)", detail: "15 min" },
        { name: "Basic Positions — top, bottom, neutral", detail: "15 min" },
      ],
    },
    {
      day: "Wednesday", focus: "Conditioning", exercises: [
        { name: "Grappling Conditioning Circuit:", isSection: true },
        { name: "Sprawls", detail: "3 × 10" },
        { name: "Shots (drop to single/double)", detail: "3 × 10" },
        { name: "Bear Crawls", detail: "3 × 30 yds" },
        { name: "Granby Rolls", detail: "3 × 10 each way" },
        { name: "Rope Climb or Towel Pull Up", detail: "3 × 3 climbs" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body & Grip Strength", exercises: [
        { name: "Bench Press", detail: "3 × 10" },
        { name: "Dumbbell Row", detail: "3 × 12 each arm" },
        { name: "Towel Pull Ups", detail: "3 × max" },
        { name: "Wrist Roller", detail: "3 × up and down" },
        { name: "Plate Pinch Carry", detail: "3 × 30 sec" },
      ],
    },
    {
      day: "Friday", focus: "Live Wrestling & Drilling", exercises: [
        { name: "Drilling — 30 min (partner or solo)", isSection: true },
        { name: "Live Wrestling — 3 min rounds", detail: "6 rounds with 30 sec rest" },
        { name: "Conditioning Finisher — Sprints", detail: "6 × 40 yds" },
      ],
    },
    {
      day: "Saturday", focus: "Conditioning Run",
      isRest: true, restNote: "30 min easy run or 20 min bike at comfortable pace. Focus on breathing mechanics. Stretch hips and shoulders after.",
      exercises: [],
    },
    {
      day: "Sunday", focus: "Full Rest + Flexibility",
      isRest: true, restNote: "Hip mobility and flexibility work — 20 min. The most flexible wrestler wins. Prioritize hips, shoulders, and spine.",
      exercises: [],
    },
  ],
};

const wrestlingIntermediate: ProgramData = {
  slug: "wrestling-intermediate",
  sport: "Wrestling",
  emoji: "🤼",
  level: "Intermediate",
  name: "Dominate Your Weight Class",
  tagline: "Strength, conditioning, weight management, and competition-level preparation.",
  weeks: 10,
  focusAreas: ["Weight Class Management", "Competition Conditioning", "Technical Mastery"],
  equipment: ["Barbell", "Dumbbells", "Pull Up Bar", "Wrestling Mat", "Rope"],
  nutritionTip: "Never cut more than 3% of your bodyweight per week. If you're cutting for weigh-ins, reduce calories gradually — no crash dieting. After weigh-ins, immediately rehydrate with a sports drink and eat a banana and rice before your match. Protein goal: 1g per lb of bodyweight.",
  schedule: [
    {
      day: "Monday", focus: "Heavy Compound Strength", exercises: [
        { name: "Back Squat", detail: "4 × 5 — add weight from last week" },
        { name: "Deadlift", detail: "4 × 4 heavy" },
        { name: "Weighted Pull Ups", detail: "4 × 6" },
        { name: "Dumbbell Row", detail: "3 × 10 each arm" },
        { name: "Farmer Carry", detail: "4 × 50 yds" },
      ],
    },
    {
      day: "Tuesday", focus: "Advanced Technique", exercises: [
        { name: "Chain Wrestling Drills", detail: "20 min — flow without stopping" },
        { name: "Advanced Takedowns — High crotch, duck under, blast double", detail: "20 min" },
        { name: "Riding and Breakdown Technique", detail: "15 min" },
        { name: "Competition situation drilling — defending shots", detail: "15 min" },
      ],
    },
    {
      day: "Wednesday", focus: "High Intensity Conditioning", exercises: [
        { name: "Grappling Circuit — 5 rounds:", isSection: true },
        { name: "Shots + Sprawls", detail: "30 sec max reps" },
        { name: "Bear Crawls", detail: "30 yds" },
        { name: "Rope Climb or Towel Pull Ups", detail: "3 reps" },
        { name: "Sprawls", detail: "10 reps" },
        { name: "Rest", detail: "60 sec between rounds" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body + Grip Strength", exercises: [
        { name: "Bench Press", detail: "4 × 6" },
        { name: "Incline Dumbbell Press", detail: "3 × 10" },
        { name: "Towel Pull Ups", detail: "4 × max" },
        { name: "Wrist Roller", detail: "4 × up and down" },
        { name: "Plate Pinch Carry", detail: "4 × 40 sec" },
      ],
    },
    {
      day: "Friday", focus: "Scrimmage — Full Live Wrestling", exercises: [
        { name: "Full 7 min match simulation", detail: "3 bouts" },
        { name: "Track weight after — monitor cut progress", isSection: true },
        { name: "Conditioning Finisher — Suicide sprints", detail: "8 reps" },
      ],
    },
    {
      day: "Saturday", focus: "Long Conditioning Run", exercises: [
        { name: "3–4 mile run at moderate pace", isSection: true },
        { name: "Weigh in after run to monitor progress", isSection: true },
        { name: "Stretch and foam roll 20 min", isSection: true },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. Hip mobility and shoulder work for 15 min only. Monitor weight and adjust nutrition.",
      exercises: [],
    },
  ],
};

const wrestlingElite: ProgramData = {
  slug: "wrestling-elite",
  sport: "Wrestling",
  emoji: "🤼",
  level: "Advanced",
  name: "State Level Preparation",
  tagline: "Periodized strength, elite conditioning, and full tournament simulation for state-level competition.",
  weeks: 12,
  focusAreas: ["Periodized Strength", "Tournament Simulation", "Elite Mental Toughness"],
  equipment: ["Full Weight Room", "Wrestling Mat", "Rope", "Sled"],
  nutritionTip: "At the elite level, weight cutting must be done carefully and safely. Work with your coach. If cutting, do it slowly over 4–6 weeks — not the day before. After weigh-ins: banana + sports drink immediately, then rice or oatmeal + chicken 90 min before your match. Sleep 9 hours — it's your most important recovery tool.",
  schedule: [
    {
      day: "Monday", focus: "Max Strength", exercises: [
        { name: "Back Squat", detail: "Work to heavy set of 3, then 3 × 3 at 85%" },
        { name: "Deadlift", detail: "Work to heavy set of 2, then 3 × 2 at 85%" },
        { name: "Power Clean", detail: "5 × 3" },
        { name: "Weighted Pull Ups", detail: "5 × 5" },
        { name: "Farmer Carry", detail: "4 × 60 yds at bodyweight" },
      ],
    },
    {
      day: "Tuesday", focus: "Elite Technique + Film", exercises: [
        { name: "Film Review — last match or practice", detail: "20 min" },
        { name: "Tournament Simulation Drilling", detail: "30 min" },
        { name: "Specialty Moves — work on your bread and butter", detail: "20 min" },
        { name: "Defending your weaknesses", detail: "20 min" },
      ],
    },
    {
      day: "Wednesday", focus: "Elite Conditioning", exercises: [
        { name: "Grappling Conditioning — 10 rounds:", isSection: true },
        { name: "1 min all-out wrestling effort", detail: "10 rounds, 30 sec rest" },
        { name: "Post-conditioning shots and sprawls", detail: "2 × 10" },
        { name: "Sled Push (bodyweight)", detail: "5 × 20 yds" },
      ],
    },
    {
      day: "Thursday", focus: "Dynamic Strength + Mobility", exercises: [
        { name: "Hang Clean", detail: "5 × 3" },
        { name: "Push Press", detail: "4 × 5" },
        { name: "Explosive Pull Ups", detail: "4 × 6" },
        { name: "Hip Mobility Sequence", detail: "20 min" },
        { name: "Shoulder Maintenance Circuit", detail: "3 × 15 each movement" },
      ],
    },
    {
      day: "Friday", focus: "Tournament Simulation", exercises: [
        { name: "Full Tournament Format — multiple bouts:", isSection: true },
        { name: "3 × 7-min match simulation with full rest between", detail: "Treat like a real tournament" },
        { name: "Strategy and adjustment between bouts", detail: "Coach review" },
      ],
    },
    {
      day: "Saturday", focus: "Weight Management + Mental Prep", exercises: [
        { name: "Weigh in and assess — adjust next week's plan accordingly", isSection: true },
        { name: "If on weight: easy 20 min bike + stretch", isSection: true },
        { name: "Mental performance work:", isSection: true },
        { name: "Visualization — see yourself winning your specific moves", detail: "15 min" },
        { name: "Pre-match routine drill", detail: "10 min" },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. 9 hours sleep. State-level competition demands complete recovery. Your mind and body both need this.",
      exercises: [],
    },
  ],
};

// ─── GENERAL ATHLETIC PROGRAM ─────────────────────────────────────────────────

const generalAthletic: ProgramData = {
  slug: "general-athletic",
  sport: "All Sports",
  emoji: "🏅",
  level: "Intermediate",
  name: "General Athletic Program",
  tagline: "A 12-week phased program built for Volleyball, Lacrosse, and any multi-sport athlete.",
  weeks: 12,
  focusAreas: ["Foundation Strength", "Speed & Agility", "Sport-Specific Conditioning"],
  equipment: ["Barbell", "Dumbbells", "Pull Up Bar", "Cones", "Agility Ladder", "Jump Rope"],
  nutritionTip: "Multi-sport athletes should eat 0.8–1g protein per lb of bodyweight daily, spread over 4–5 meals. Stay hydrated with at least 80 oz of water daily — more during two-a-day practice weeks. Eat carbs before training and protein after.",
  schedule: [
    {
      day: "Monday", focus: "Full Body Strength — Phase 1: Weeks 1–4: 3×10 | Phase 2: Weeks 5–8: 4×6 | Phase 3: Weeks 9–12: 5×3 heavy", exercises: [
        { name: "Back Squat or Goblet Squat", detail: "See phase progression above" },
        { name: "Romanian Deadlift", detail: "See phase progression above" },
        { name: "Bench Press or Push Ups", detail: "See phase progression above" },
        { name: "Pull Ups or Lat Pulldown", detail: "See phase progression above" },
        { name: "Plank", detail: "3 × 45 sec (all phases)" },
      ],
    },
    {
      day: "Tuesday", focus: "Speed, Agility & Sport-Specific Conditioning", exercises: [
        { name: "Ladder Drills", detail: "4 sets (all phases — increase complexity each phase)" },
        { name: "Cone Drills", detail: "4 sets" },
        { name: "Phase 1 — Shuttle Sprints", detail: "6 × 20 yds" },
        { name: "Phase 2 — Pro Agility Shuttle", detail: "8 reps" },
        { name: "Phase 3 — Full Field Sprints + Direction Change", detail: "10 reps" },
        { name: "Volleyball: Vertical jump approach work", isSection: true },
        { name: "Lacrosse: Stick skills combined with movement", isSection: true },
      ],
    },
    {
      day: "Wednesday", focus: "Active Recovery", exercises: [
        { name: "20 min easy jog or bike", isSection: true },
        { name: "Full body mobility routine", detail: "20 min — hips, thoracic, ankles" },
        { name: "Foam rolling", detail: "10 min — quads, hamstrings, IT band" },
      ],
    },
    {
      day: "Thursday", focus: "Lower Body Power + Core", exercises: [
        { name: "Lunge", detail: "3 × 12 each leg (Phase 1) / Bulgarian Split Squat 4×8 (Phase 2–3)" },
        { name: "Box Jump", detail: "3 × 8 (Phase 1) / 4×6 (Phase 2) / 5×5 max height (Phase 3)" },
        { name: "Calf Raises", detail: "3 × 20" },
        { name: "Core Circuit:", isSection: true },
        { name: "Dead Bug", detail: "3 × 10 each side" },
        { name: "Russian Twist", detail: "3 × 20" },
        { name: "Hanging Leg Raise", detail: "3 × 12 (Phase 2–3)" },
      ],
    },
    {
      day: "Friday", focus: "Sport Skill + Conditioning", exercises: [
        { name: "Volleyball:", isSection: true },
        { name: "Approach jump and blocking technique", detail: "30 min" },
        { name: "Serve and pass drills", detail: "20 min" },
        { name: "Lacrosse:", isSection: true },
        { name: "Stick handling and shooting", detail: "30 min" },
        { name: "1v1 and 2v2 drills", detail: "20 min" },
        { name: "All Sports — Conditioning Finisher:", isSection: true },
        { name: "Suicide Sprints", detail: "8 reps" },
      ],
    },
    {
      day: "Saturday", focus: "Phase-Based Endurance or Skills", exercises: [
        { name: "Phase 1 — 20 min jog + stretching", isSection: true },
        { name: "Phase 2 — 30 min conditioning + sport specific drills", isSection: true },
        { name: "Phase 3 — Competition simulation or scrimmage", isSection: true },
      ],
    },
    {
      day: "Sunday", focus: "Full Rest",
      isRest: true, restNote: "Complete rest. The three phases build on each other — only progress if you've fully recovered from the previous week.",
      exercises: [],
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export const allPrograms: ProgramData[] = [
  footballBeginner, footballIntermediate, footballElite,
  basketballBeginner, basketballIntermediate, basketballElite,
  baseballBeginner, baseballIntermediate, baseballElite,
  soccerBeginner, soccerIntermediate, soccerElite,
  trackBeginner, trackIntermediate, trackElite,
  wrestlingBeginner, wrestlingIntermediate, wrestlingElite,
  generalAthletic,
];

export function getProgramBySlug(slug: string): ProgramData | undefined {
  return allPrograms.find((p) => p.slug === slug);
}

export function getProgramsBySport(sport: string): ProgramData[] {
  return allPrograms.filter((p) => p.sport === sport);
}
