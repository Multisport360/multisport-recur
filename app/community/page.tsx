"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── Weekly Scripture ────────────────────────────────────────────────────────

const scriptures = [
  { verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { verse: "Whatever you do, work at it with all your heart.", ref: "Colossians 3:23" },
  { verse: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9" },
  { verse: "Run in such a way as to get the prize.", ref: "1 Corinthians 9:24" },
  { verse: "For I know the plans I have for you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { verse: "Let us not grow weary in doing good.", ref: "Galatians 6:9" },
];

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

const currentScripture = scriptures[getWeekNumber() % 6];

// ─── Data ────────────────────────────────────────────────────────────────────

const resources = [
  {
    title: "Managing Multiple Sport Schedules",
    body: "Juggling two or three sports seasons is no small feat. Start with a master calendar that maps every practice, game, and school commitment for the entire semester.",
    icon: "📅",
    href: "/community/managing-schedules",
  },
  {
    title: "Navigating Recruiting Costs",
    body: "The recruiting process can get expensive fast between camps, showcases, travel, and gear. Prioritize quality over quantity and be strategic about every event.",
    icon: "💰",
    href: "/community/recruiting-costs",
  },
  {
    title: "Communicating With Coaches",
    body: "The most underrated skill in recruiting is knowing how to talk to coaches professionally. Keep it short, respectful, and let the athlete lead the conversation.",
    icon: "🗣️",
    href: "/community/talking-to-coaches",
  },
  {
    title: "Keeping Athletes Balanced",
    body: "Burnout is real and it is one of the biggest reasons talented athletes walk away from sports early. Watch for signs and prioritize the whole person.",
    icon: "⚖️",
    href: "/community/keeping-athletes-balanced",
  },
];

const character = [
  {
    title: "What Makes A Great Captain",
    body: "The best captains are not always the most talented players on the team — they are the most reliable. They show up early, stay late, and lead by example.",
    icon: "🏆",
    href: "/community/great-captain",
  },
  {
    title: "How To Handle Adversity",
    body: "Every athlete will face setbacks — a bad game, an injury, getting cut, or losing a starting spot. What separates good athletes from great ones is the response.",
    icon: "💪",
    href: "/community/handling-adversity",
  },
  {
    title: "Excellence In The Classroom",
    body: "Your GPA is not separate from your athletic career — it is part of it. College coaches look at grades because they tell them something about your character.",
    icon: "📚",
    href: "/community/excellence-in-classroom",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">

        {/* ── SECTION 1: Hero ─────────────────────────────────────────────── */}
        <section className="relative py-28 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530] to-[#0a0f1e]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#38bdf8]/6 rounded-full blur-[140px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.3em] mb-6">
              Multisport Recur Community
            </p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-6">
              More Than A Platform.{" "}
              <span className="text-[#38bdf8]">A Community.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Built on faith. Driven by purpose. United by sport. This is a space for athletes
              and families who believe in something bigger than the game.
            </p>
          </div>
        </section>

        {/* ── SECTION 2: The Faith Advantage ──────────────────────────────── */}
        <section className="py-16 px-4 bg-[#060b17]">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest text-center mb-8">
              The Faith Advantage
            </p>
            <div className="relative bg-[#0a0f1e] border border-[#38bdf8]/20 rounded-2xl p-10 pl-12">
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-[#38bdf8]/60 via-[#38bdf8] to-[#38bdf8]/60 rounded-full ml-5" />
              <p className="text-2xl sm:text-3xl font-black italic text-white leading-snug mb-5">
                &ldquo;{currentScripture.verse}&rdquo;
              </p>
              <p className="text-[#38bdf8] font-black text-sm uppercase tracking-widest">
                — {currentScripture.ref}
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Athlete Story ─────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Athlete Story</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Real Athletes. Real Journeys.
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">Built for the resilient.</p>
            </div>

            {/* Cole feature card */}
            <div className="group bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#38bdf8]/30 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Photo */}
                <div className="relative h-72 md:h-auto min-h-[320px] overflow-hidden">
                  <Image
                    src="/cole-football.jpeg"
                    alt="Cole Kindig"
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f172a] hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent md:hidden" />
                  <div className="absolute top-5 left-5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#38bdf8] text-[#0a0f1e] px-3 py-1.5 rounded-full">
                      Featured Athlete
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-10 flex flex-col justify-center">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">
                    Cole Kindig
                  </h3>
                  <p className="text-[#38bdf8] font-bold text-sm mb-5">
                    Wilson Memorial High School · Fishersville, VA · Class of 2029
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { label: "Football · QB", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                      { label: "Basketball · PG", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                      { label: "Baseball · Pitcher", color: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20" },
                    ].map((s) => (
                      <span key={s.label} className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${s.color}`}>
                        {s.label}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
                    At 15 years old, Cole Kindig is already proving that elite performance in the classroom and on every field of play are not mutually exclusive. A three-sport varsity athlete as a freshman at Wilson Memorial High School in Fishersville, Virginia, Cole competes as a Quarterback, Point Guard, and Pitcher — excelling at the highest level of each before most athletes have earned a varsity spot in one sport. He carries a 4.28 GPA, holds membership in the National Honor Society, and serves as the Founder and CEO of Multisport Recur — a platform he built to give every multi-sport athlete the exposure and recognition they deserve. Cole is not just an example of what Multisport Recur builds. He is the reason it exists.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                      { label: "GPA", value: "4.28" },
                      { label: "Sports", value: "3" },
                      { label: "Year", value: "2029" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-[#0a0f1e] border border-white/5 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-[#38bdf8]">{stat.value}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5 font-bold">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/athletes/cole-kindig"
                    className="inline-flex items-center gap-2 bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-7 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#38bdf8]/20 uppercase tracking-wide self-start"
                  >
                    Read Full Profile
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Family Resources ─────────────────────────────────── */}
        <section className="py-20 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">For The Family</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Resources For Sports Families
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                We know the grind. The early mornings, the long drives, the costs, and the sacrifices. This is for you too.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {resources.map((r) => (
                <Link
                  key={r.title}
                  href={r.href}
                  className="group flex flex-col bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 hover:border-[#38bdf8]/40 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#38bdf8]/5"
                >
                  <span className="text-3xl mb-4 block">{r.icon}</span>
                  <h3 className="text-sm font-black text-white mb-3 leading-snug group-hover:text-[#38bdf8] transition-colors">{r.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">{r.body}</p>
                  <span className="mt-4 text-[10px] font-black text-[#38bdf8]/60 group-hover:text-[#38bdf8] uppercase tracking-widest transition-colors">
                    Read More →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Character Corner ─────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Character Corner</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Character Over Everything
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                What you do when nobody is watching defines the kind of athlete and person you become.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {character.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="group flex flex-col bg-[#0f172a] border border-white/10 rounded-2xl p-8 hover:border-[#38bdf8]/40 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#38bdf8]/5"
                >
                  <span className="text-4xl mb-5 block">{c.icon}</span>
                  <h3 className="text-lg font-black text-white mb-3 group-hover:text-[#38bdf8] transition-colors">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{c.body}</p>
                  <span className="mt-5 text-[10px] font-black text-[#38bdf8]/60 group-hover:text-[#38bdf8] uppercase tracking-widest transition-colors">
                    Read More →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Join The Movement CTA ───────────────────────────── */}
        <section className="py-28 px-4 relative overflow-hidden text-center bg-[#060b17]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[700px] h-[400px] bg-[#38bdf8]/6 rounded-full blur-[130px]" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-6">Join The Movement</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-5">
              Ready To Be Part Of{" "}
              <span className="text-[#38bdf8]">Something Bigger?</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Get your athlete profile page and join a community of multi-sport athletes who never settle.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/get-your-page"
                className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-9 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-[#38bdf8]/20 uppercase tracking-wide"
              >
                Get Your Page
              </Link>
              <Link
                href="/contact"
                className="border border-white/20 hover:border-white/40 text-white font-black text-sm px-9 py-4 rounded-full transition-all hover:bg-white/5 uppercase tracking-wide"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: Spread The Word / Merch ─────────────────────────── */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Merch</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Spread The Word
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Rep the movement with Multisport Recur apparel.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-[#38bdf8]/15 rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

              <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                <span className="text-[#38bdf8] text-xs font-black uppercase tracking-widest">Coming Soon</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Multisport Recur Merch
              </h3>
              <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed mb-8">
                Multisport Recur merch coming soon. Built for athletes who never stop.
              </p>

              <Link
                href="/contact"
                className="inline-block border-2 border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/5 font-black text-sm px-9 py-4 rounded-full transition-all uppercase tracking-wide"
              >
                Notify Me
              </Link>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent" />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
