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
    body: "Juggling two or three sports seasons is no small feat. Start with a master calendar that maps every practice, game, and school commitment for the entire semester. Color code by sport so conflicts jump out early. Communicate with coaches at the start of each season so they know your athlete is multi-sport and build relationships with each program. Most coaches respect the multi-sport athlete — but they need to know upfront. Build in at least one full rest day per week. Recovery is not optional, it is part of the training plan.",
    icon: "📅",
  },
  {
    title: "Navigating Recruiting Costs",
    body: "The recruiting process can get expensive fast between camps, showcases, travel, and gear. Prioritize quality over quantity — three well chosen camps where your athlete can truly shine will outperform ten random events every time. Research free resources like NCSA, DirectAthletics, and college program websites before paying for premium services. Build a highlight profile page early so coaches can find your athlete online without you having to attend every event. Budget for two to three targeted showcases per sport per year and be strategic about which programs will actually be in attendance.",
    icon: "💰",
  },
  {
    title: "Communicating With Coaches",
    body: "The most underrated skill in recruiting is knowing how to talk to coaches professionally. Athletes should send a brief introductory email to college coaches they are interested in — name, graduation year, sport, position, GPA, and a link to their profile page. Keep it short and respectful. Follow up after camps and showcases with a thank you message. Parents should let the athlete lead communication as much as possible — college coaches are recruiting the athlete, not the parent. Stay positive, stay persistent, and always respond promptly when a coach reaches out.",
    icon: "🗣️",
  },
  {
    title: "Keeping Athletes Balanced",
    body: "Burnout is real and it is one of the biggest reasons talented athletes walk away from sports early. Watch for signs — loss of motivation, irritability, declining grades, or dreading practice. Schedule intentional downtime that has nothing to do with sports. Make sure your athlete has hobbies, friendships, and interests outside of competition. Keep the conversation open about how they are feeling — not just about performance but about enjoyment. The goal is an athlete who still loves the game at 18 as much as they did at 10. That requires balance, rest, and a family that prioritizes the whole person over the stat line.",
    icon: "⚖️",
  },
];

const character = [
  {
    title: "What Makes A Great Captain",
    body: "The best captains are not always the most talented players on the team — they are the most reliable. They show up early, stay late, and hold themselves to a higher standard than they hold anyone else. Great captains lead by example in practice, not just in games. They hold teammates accountable with respect, lift people up after mistakes, and bring energy when the team needs it most. Coaches trust captains to be an extension of their leadership on the floor or field. If you want to be that person start by being the hardest worker in every room you walk into.",
    icon: "🏆",
  },
  {
    title: "How To Handle Adversity",
    body: "Every athlete will face setbacks — a bad game, an injury, getting cut, or losing a starting spot. What separates good athletes from great ones is the response. Give yourself 24 hours to feel the disappointment, then shift your focus entirely to what you can control. Break your comeback down into small daily actions. Talk to a coach, a parent, or a mentor you trust. Never let one bad moment define your story. The athletes who make it to the next level are rarely the ones who never struggled — they are the ones who refused to stay down. Adversity is not a roadblock. It is part of the path.",
    icon: "💪",
  },
  {
    title: "Excellence In The Classroom",
    body: "Your GPA is not separate from your athletic career — it is part of it. College coaches look at grades because they tell them something about your character, your work ethic, and your ability to handle responsibility. A strong GPA opens doors that talent alone cannot. It qualifies you for academic scholarships that can stack on top of athletic aid. It keeps your options wide open if your sport does not work out at the next level. Treat your schoolwork the same way you treat your training — show up prepared, give full effort, and never take shortcuts. The discipline it takes to excel academically is the same discipline that makes a great athlete.",
    icon: "📚",
  },
];

const values = [
  { label: "Faith", desc: "Grounded in something greater than the game." },
  { label: "Hard Work", desc: "Outwork everyone, every single day." },
  { label: "Character", desc: "Who you are off the field matters most." },
  { label: "Versatility", desc: "The best athletes never stop growing." },
  { label: "Community", desc: "We rise together or not at all." },
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

        {/* ── SECTION 2: Weekly Scripture ─────────────────────────────────── */}
        <section className="py-16 px-4 bg-[#060b17]">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest text-center mb-8">
              This Week&apos;s Scripture
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

        {/* ── SECTION 3: Athlete Spotlights ───────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Athlete Spotlights</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Real Athletes. Real Stories.
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">Built for the versatile.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cole Kindig */}
              <div className="group bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#38bdf8]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#38bdf8]/10 flex flex-col">
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src="/cole-football.jpeg"
                    alt="Cole Kindig"
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#38bdf8] text-[#0a0f1e] px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-white mb-1 group-hover:text-[#38bdf8] transition-colors">Cole Kindig</h3>
                  <p className="text-xs text-gray-500 mb-3">Wilson Memorial HS · Fishersville, VA</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {["Basketball", "Football", "Baseball"].map((sport) => (
                      <span key={sport} className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20">
                        {sport}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5 flex-1">
                    One of the most complete multi-sport athletes out of the Shenandoah Valley — a 4.28 GPA student-athlete competing at the varsity level in three sports as a freshman.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-gray-600">GPA <span className="text-[#38bdf8] font-black">4.28</span></span>
                    <Link
                      href="/athletes/cole-kindig"
                      className="text-xs font-black text-[#38bdf8] hover:underline uppercase tracking-wide"
                    >
                      View Full Profile →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Coming Soon cards */}
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#0f172a]/50 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-10 gap-4 min-h-[400px]">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-bold text-sm mb-1">Coming Soon</p>
                    <p className="text-gray-700 text-xs">Submit Your Story</p>
                  </div>
                  <Link
                    href="/contact"
                    className="text-xs font-black text-[#38bdf8]/60 hover:text-[#38bdf8] uppercase tracking-widest transition-colors"
                  >
                    Submit Your Clips →
                  </Link>
                </div>
              ))}
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
                <div
                  key={r.title}
                  className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 hover:border-[#38bdf8]/30 transition-all hover:-translate-y-0.5"
                >
                  <span className="text-3xl mb-4 block">{r.icon}</span>
                  <h3 className="text-sm font-black text-white mb-3 leading-snug">{r.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{r.body}</p>
                </div>
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
                <div
                  key={c.title}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 hover:border-[#38bdf8]/30 transition-all hover:-translate-y-0.5"
                >
                  <span className="text-4xl mb-5 block">{c.icon}</span>
                  <h3 className="text-lg font-black text-white mb-3">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Submit Your Clips ────────────────────────────────── */}
        <section className="py-20 px-4 bg-[#060b17]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Get Featured</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Get Featured On Multisport Recur
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Submit your highlight footage and we will feature you across our platform and social channels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left: what happens */}
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-[#38bdf8] mb-6">What Happens When You Submit</p>
                {[
                  { step: "01", text: "We review your footage" },
                  { step: "02", text: "We build your highlight feature" },
                  { step: "03", text: "You get shared across our network" },
                  { step: "04", text: "Coaches and scouts see your story" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-5">
                    <span className="text-xs font-black text-[#38bdf8]/40 w-6 shrink-0">{item.step}</span>
                    <div className="flex-1 h-px bg-white/5" />
                    <p className="text-sm font-bold text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Right: CTA card */}
              <div className="bg-gradient-to-br from-[#38bdf8]/10 to-[#0ea5e9]/5 border border-[#38bdf8]/20 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Ready To Be Seen?</h3>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  Your highlights deserve a professional home. Submit your clips and get featured.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#38bdf8]/20 uppercase tracking-wide"
                >
                  Submit Your Clips
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: Mixtapes Showcase ────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Highlight Mixtapes</p>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                Highlight Mixtapes
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Professional highlight features built for multi-sport athletes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative bg-[#0f172a] border border-[#38bdf8]/15 rounded-2xl overflow-hidden aspect-video flex items-center justify-center group hover:border-[#38bdf8]/40 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d1530] to-[#060b17]" />
                  <div className="absolute inset-0 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                    <div
                      style={{
                        backgroundImage: "repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)",
                        backgroundSize: "20px 20px",
                      }}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="relative z-10 text-center px-6">
                    <div className="w-14 h-14 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#38bdf8]/20 transition-colors">
                      <svg className="w-6 h-6 text-[#38bdf8]/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-black text-sm mb-1">Mixtape Coming Soon</p>
                    <Link
                      href="/contact"
                      className="text-[10px] font-black text-[#38bdf8]/50 hover:text-[#38bdf8] uppercase tracking-widest transition-colors"
                    >
                      Be the first — Submit Your Clips
                    </Link>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 8: Our Values ───────────────────────────────────────── */}
        <section className="py-20 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Core Values</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {values.map((v) => (
                <div
                  key={v.label}
                  className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 text-center hover:border-[#38bdf8]/30 transition-all hover:-translate-y-0.5"
                >
                  <p className="text-xl font-black text-white mb-2">{v.label}</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 9: Join The Movement CTA ───────────────────────────── */}
        <section className="py-28 px-4 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] to-[#060b17]" />
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
                href="/#pricing"
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

      </main>
      <Footer />
    </>
  );
}
