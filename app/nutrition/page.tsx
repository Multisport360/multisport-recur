"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

type Tab = "Bulking" | "Performance" | "Sport-Specific";
const TABS: Tab[] = ["Bulking", "Performance", "Sport-Specific"];

/* ─── Bulking ─────────────────────────────────────────── */

const caloricTargets = [
  { size: "Lightweight", weight: "Under 150 lbs", calories: "3,000–3,400", protein: "150g", carbs: "380g", fats: "90g" },
  { size: "Medium Build", weight: "150–190 lbs", calories: "3,400–3,900", protein: "175g", carbs: "440g", fats: "105g" },
  { size: "Heavyweight", weight: "190+ lbs", calories: "3,900–4,500+", protein: "210g", carbs: "510g", fats: "120g" },
];

const bulkingFoods = [
  "Chicken breast & thighs", "Whole eggs & egg whites", "Lean ground beef", "Greek yogurt (full-fat)",
  "Cottage cheese", "Brown rice & oats", "Sweet potatoes", "Whole milk", "Peanut butter & nut butters", "Avocados",
];

const bulkMealPlan = [
  { meal: "Breakfast", time: "7:00 AM", foods: "4 whole eggs + 2 egg whites scrambled, 1 cup oatmeal with banana and honey, 1 cup whole milk" },
  { meal: "Mid-Morning Snack", time: "10:00 AM", foods: "Greek yogurt (full-fat), 1 cup mixed berries, handful of granola" },
  { meal: "Lunch", time: "1:00 PM", foods: "8oz chicken breast, 1.5 cups brown rice, roasted broccoli and bell peppers, olive oil drizzle" },
  { meal: "Pre-Workout", time: "4:00 PM", foods: "2 slices whole-grain bread, 2 tbsp peanut butter, 1 banana, 12oz water" },
  { meal: "Post-Workout", time: "6:30 PM", foods: "Whey protein shake (50g protein), 1 cup white rice, 1 cup chocolate milk" },
  { meal: "Dinner", time: "8:00 PM", foods: "8oz lean ground beef, 1.5 cups pasta, marinara sauce, side salad with olive oil" },
  { meal: "Night Snack", time: "10:00 PM", foods: "1 cup cottage cheese, 1 tbsp honey, handful of almonds" },
];

/* ─── Performance / Pre-Game ─────────────────────────── */

const pregameTimeline = [
  {
    time: "3–4 Hours Before",
    icon: "🍽️",
    label: "Full Meal",
    eat: ["Grilled chicken or turkey", "Brown rice or pasta", "Cooked vegetables", "Plenty of water"],
    avoid: ["Fried or greasy foods", "Heavy sauces", "High-fat red meats", "Carbonated drinks"],
  },
  {
    time: "1–2 Hours Before",
    icon: "🍌",
    label: "Light Snack",
    eat: ["Banana or apple", "Toast with a thin layer of peanut butter", "Greek yogurt (low-fat)", "Sports drink if sweating heavily"],
    avoid: ["Full meals", "High-fiber vegetables", "New or unfamiliar foods", "Dairy-heavy options"],
  },
  {
    time: "30 Minutes Before",
    icon: "⚡",
    label: "Quick Fuel",
    eat: ["Energy gel or chew", "Small handful of raisins or dates", "Half a granola bar", "8–12oz water"],
    avoid: ["Anything new", "High sugar candy", "Heavy protein", "Too much fluid"],
  },
  {
    time: "During Competition",
    icon: "💧",
    label: "Hydration & Energy",
    eat: ["Water every 15–20 min", "Electrolyte drink for games 60+ min", "Quick carb snacks at halftime", "Banana or orange slices"],
    avoid: ["Skipping hydration", "Soda or juice", "Heavy foods", "Caffeine if not used to it"],
  },
  {
    time: "Post-Game Recovery",
    icon: "🔋",
    label: "Recovery Window",
    eat: ["Protein shake within 30 min", "Chocolate milk (3:1 carb:protein ratio)", "Full meal within 60 min", "Keep hydrating"],
    avoid: ["Skipping the recovery window", "Alcohol", "Fast food as your only meal", "Long gaps before eating"],
  },
];

const avoidFoods = [
  "Fast food or fried foods", "Heavy dairy (pizza, cheeseburgers)", "Carbonated drinks",
  "High-fiber raw vegetables", "New or unfamiliar foods", "Excessive caffeine",
  "Candy and high-sugar sweets", "Alcohol", "Heavy sauces and condiments",
];

/* ─── Sport-Specific ────────────────────────────────── */

const sportNutrition = [
  {
    sport: "Football",
    emoji: "🏈",
    needs: "High protein, calorie-dense, full hydration",
    details: "Football players need the most calories of any team sport athlete. Prioritize protein for muscle repair, complex carbs for explosive energy, and serious hydration — especially for linemen who sweat heavily in equipment.",
    tips: ["3g protein per kg of body weight", "Hydrate 24hrs before game day", "Pre-game carb-load with pasta or rice", "Electrolytes throughout practice"],
  },
  {
    sport: "Basketball",
    emoji: "🏀",
    needs: "Quick energy, sustained endurance, electrolytes",
    details: "Basketball demands both explosive bursts and 40-minute endurance. Carbohydrates are your fuel — keep glycogen stores full. Electrolyte replenishment is key since players sweat heavily on the court.",
    tips: ["Carb-heavy meals 3-4hrs before tip-off", "Sports drink during game", "Prioritize sleep + hydration for back-to-backs", "Light pre-game snack 1hr before"],
  },
  {
    sport: "Baseball",
    emoji: "⚾",
    needs: "Sustained energy, light pre-game meals",
    details: "Baseball is a long, low-intensity game with explosive bursts. Avoid heavy pre-game meals that make you feel sluggish. Focus on sustained energy and staying hydrated through long practices and double headers.",
    tips: ["Eat light 2hrs before first pitch", "Sunflower seeds or jerky for dugout snacking", "Stay hydrated even in cooler weather", "Recovery meal matters after double headers"],
  },
  {
    sport: "Soccer",
    emoji: "⚽",
    needs: "Carb loading, endurance focus, aggressive hydration",
    details: "Soccer players run 7-9 miles per game. Carbohydrates are non-negotiable. Carb-load the night before and morning of, stay hydrated throughout, and recover aggressively post-match.",
    tips: ["Pasta or rice night before", "Carb + electrolyte drink at halftime", "Recover with protein + carbs within 30min", "Hydrate well even in cool weather"],
  },
  {
    sport: "Track & Field",
    emoji: "🏃",
    needs: "Varies by event — sprinters vs. distance runners",
    details: "Sprinters focus on explosive power and muscle mass — higher protein, moderate carbs. Distance runners need carb-heavy diets to sustain aerobic endurance. Know your event and fuel accordingly.",
    tips: [
      "Sprinters: higher protein, moderate carbs",
      "Distance: heavy carb loading before races",
      "Both: iron-rich foods to avoid fatigue",
      "Light meal 2hrs before competing",
    ],
  },
  {
    sport: "Wrestling",
    emoji: "🤼",
    needs: "Weight management, safe cutting, aggressive recovery",
    details: "Wrestling nutrition is unique — weight class management matters. If cutting weight, do it gradually and safely. Never drop more than 3% of body weight per week. After weigh-ins, rehydrate and refuel aggressively before competition.",
    tips: ["Never cut more than 3% BW per week", "Rehydrate fully between weigh-in and match", "High protein to preserve muscle while cutting", "Banana + sports drink post weigh-in"],
  },
];

const multiSportTips = [
  {
    title: "Back-to-Back Seasons",
    description: "When transitioning between sports, increase your caloric intake by 200–400 calories per day during the first 2 weeks to support muscle adaptation and prevent fatigue.",
  },
  {
    title: "Overlapping Sports",
    description: "If you're competing in two sports simultaneously, treat nutrition like a double training load — prioritize recovery meals, increase protein by 20%, and never skip breakfast.",
  },
  {
    title: "Off-Season Fueling",
    description: "Don't drastically cut calories in the off-season. Maintain a slight caloric surplus to build muscle and stay explosive for the next season.",
  },
  {
    title: "Hydration Baseline",
    description: "Regardless of sport, every multi-sport athlete should drink at minimum half their body weight in ounces of water per day — more during active training.",
  },
];

/* ─── Page ───────────────────────────────────────────── */

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Bulking");

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">
        {/* Hero */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530] to-[#0a0f1e]" />
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-[#38bdf8]/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-5">Nutrition</p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-5">
              Fuel Built for{" "}
              <span className="text-[#38bdf8]">Athletes Like You.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              The right nutrition at the right time makes the difference between good and great.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-4 sticky top-16 z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-1 py-3">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none text-sm font-black px-6 py-2.5 rounded-full border transition-all ${
                    activeTab === tab
                      ? "bg-[#38bdf8] border-[#38bdf8] text-white shadow-lg shadow-[#38bdf8]/20"
                      : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── BULKING ── */}
        {activeTab === "Bulking" && (
          <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto space-y-16">
              {/* Header */}
              <div>
                <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-3">Bulking</p>
                <h2 className="text-4xl font-black text-white mb-3">Build Muscle Without Losing Speed</h2>
                <p className="text-gray-400 max-w-xl leading-relaxed">
                  Multi-sport athletes need to add mass without becoming slow or stiff. Here&apos;s how to eat for size and still perform on the field, court, or track.
                </p>
              </div>

              {/* Calorie targets */}
              <div>
                <h3 className="text-xl font-black text-white mb-6">Daily Calorie Targets by Size</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {caloricTargets.map((t) => (
                    <div key={t.size} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 hover:border-[#38bdf8]/30 transition-colors">
                      <p className="text-xs font-black text-[#38bdf8] uppercase tracking-widest mb-1">{t.size}</p>
                      <p className="text-gray-500 text-xs mb-4">{t.weight}</p>
                      <p className="text-3xl font-black text-white mb-5">{t.calories}</p>
                      <div className="space-y-2">
                        {[
                          { label: "Protein", value: t.protein, color: "bg-[#38bdf8]", pct: "30%" },
                          { label: "Carbs", value: t.carbs, color: "bg-blue-500", pct: "50%" },
                          { label: "Fats", value: t.fats, color: "bg-amber-500", pct: "20%" },
                        ].map((macro) => (
                          <div key={macro.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">{macro.label}</span>
                              <span className="text-gray-300 font-bold">{macro.value} <span className="text-gray-600">({macro.pct})</span></span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${macro.color} rounded-full`} style={{ width: macro.pct }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top bulking foods + meal plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-xl font-black text-white mb-5">Top 10 Bulking Foods for Athletes</h3>
                  <ol className="space-y-2">
                    {bulkingFoods.map((food, i) => (
                      <li key={food} className="flex items-center gap-3 text-sm text-gray-400 bg-[#0f172a] border border-white/5 rounded-xl px-4 py-3">
                        <span className="w-6 h-6 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] text-xs font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {food}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white mb-5">Sample 1-Day Bulking Meal Plan</h3>
                  <div className="space-y-3">
                    {bulkMealPlan.map((m) => (
                      <div key={m.meal} className="bg-[#0f172a] border border-white/5 rounded-xl px-5 py-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-black text-[#38bdf8] uppercase tracking-wider">{m.meal}</span>
                          <span className="text-xs text-gray-600">{m.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{m.foods}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PERFORMANCE ── */}
        {activeTab === "Performance" && (
          <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto space-y-16">
              <div>
                <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-3">Pre-Game Nutrition</p>
                <h2 className="text-4xl font-black text-white mb-3">What to Eat Before You Compete</h2>
                <p className="text-gray-400 max-w-xl leading-relaxed">
                  The meal you eat before a game can make or break your performance. Timing is everything — here&apos;s exactly what to eat and when.
                </p>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="hidden md:block absolute left-[2.4rem] top-16 bottom-16 w-px bg-gradient-to-b from-[#38bdf8]/40 via-[#38bdf8]/20 to-transparent" />
                <div className="space-y-5">
                  {pregameTimeline.map((item) => (
                    <div key={item.time} className="flex gap-6">
                      {/* Circle */}
                      <div className="hidden md:flex flex-col items-center shrink-0">
                        <div className="w-[4.8rem] h-[4.8rem] rounded-full border-2 border-[#38bdf8]/40 bg-[#38bdf8]/10 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl">{item.icon}</span>
                        </div>
                      </div>
                      {/* Card */}
                      <div className="flex-1 bg-[#0f172a] border border-white/10 rounded-2xl p-6 hover:border-[#38bdf8]/30 transition-colors">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="md:hidden text-2xl">{item.icon}</span>
                          <span className="font-black text-white text-lg">{item.time}</span>
                          <span className="text-xs font-bold bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                            {item.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">✓ Eat</p>
                            <ul className="space-y-1.5">
                              {item.eat.map((f) => (
                                <li key={f} className="text-sm text-gray-400 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">✗ Avoid</p>
                            <ul className="space-y-1.5">
                              {item.avoid.map((f) => (
                                <li key={f} className="text-sm text-gray-400 flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5 shrink-0">•</span>{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foods to avoid */}
              <div>
                <h3 className="text-xl font-black text-white mb-5">Foods to Always Avoid Before Competing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {avoidFoods.map((food) => (
                    <div key={food} className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 text-sm text-gray-400">
                      <span className="text-red-500 text-base shrink-0">✗</span>
                      {food}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPORT-SPECIFIC ── */}
        {activeTab === "Sport-Specific" && (
          <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto space-y-16">
              <div>
                <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-3">Sport-Specific</p>
                <h2 className="text-4xl font-black text-white mb-3">Every Sport Has Different Demands</h2>
                <p className="text-gray-400 max-w-xl leading-relaxed">
                  What works for a wrestler doesn&apos;t work for a distance runner. Know the unique fuel needs for every sport you compete in.
                </p>
              </div>

              {/* Sport cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sportNutrition.map((s) => (
                  <div
                    key={s.sport}
                    className="group bg-[#0f172a] border border-white/10 rounded-2xl p-7 hover:border-[#38bdf8]/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{s.emoji}</span>
                      <div>
                        <p className="font-black text-white text-lg">{s.sport}</p>
                        <p className="text-xs text-[#38bdf8] font-bold">{s.needs}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.details}</p>
                    <ul className="space-y-2">
                      {s.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-[#38bdf8] shrink-0 mt-0.5">→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Multi-sport schedule tips */}
              <div>
                <h3 className="text-xl font-black text-white mb-2">Timing Nutrition Around Multi-Sport Schedules</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-xl">
                  Managing nutrition across two or more sports at once is one of the most overlooked parts of being a multi-sport athlete.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {multiSportTips.map((tip) => (
                    <div key={tip.title} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 hover:border-[#38bdf8]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                        <p className="font-black text-white text-base">{tip.title}</p>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA bottom */}
        <section className="py-20 px-4 bg-[#060b17] border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Ready to Level Up?</p>
            <h2 className="text-3xl font-black text-white mb-4">Fuel right. Train right. Get seen.</h2>
            <p className="text-gray-500 text-sm mb-8">Submit your clips and join the Multisport Recur community today.</p>
            <Link
              href="/submit"
              className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-black text-sm px-9 py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/25 hover:scale-105 uppercase tracking-wide"
            >
              Submit Your Clips
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
