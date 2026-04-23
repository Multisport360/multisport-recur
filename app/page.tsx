import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* ─── Data ─────────────────────────────────────────────── */

const howItWorksSteps = [
  {
    number: "01",
    title: "Fill Out The Form",
    description: "Tell us about your athlete — sports, stats, positions, awards, and what makes them special.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "We Build Your Page",
    description: "Our team personally builds your premium profile page within 48 hours. No templates — built by hand.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "You Get Your Link",
    description: "Receive your personal URL to share with coaches, recruiters, scouts, and anyone who needs to know your story.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Get Seen",
    description: "Let your page do the talking while you focus on competing. Coaches get everything they need in one place.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

const communityCards = [
  {
    emoji: "⚡",
    title: "Training Programs",
    description: "Sport-specific programs built for athletes who never stop competing.",
    href: "/training",
    cta: "Browse Programs",
  },
  {
    emoji: "🥗",
    title: "Nutrition Guidance",
    description: "Fuel guides for bulking, performance, and sport-specific needs.",
    href: "/nutrition",
    cta: "View Nutrition",
  },
  {
    emoji: "📹",
    title: "Submit Your Clips",
    description: "Send us your highlight footage to be featured on the platform.",
    href: "/contact",
    cta: "Submit Clips",
  },
];

/* ─── Page ─────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0a0f1e]">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0f1e]" />
          <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-[#38bdf8]/6 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#38bdf8]/4 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "24px 24px" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[#38bdf8] text-xs font-bold uppercase tracking-widest">Premium Athlete Profile Pages</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              Your Page.
              <br />
              <span className="text-[#38bdf8]">Your Story.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We build premium athlete profile pages for multi-sport athletes.
              One link. Every stat. Every sport. Built to impress coaches.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/get-your-page"
                className="w-full sm:w-auto bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-base px-9 py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/25 hover:shadow-[#38bdf8]/40 hover:scale-105 uppercase tracking-wide"
              >
                Get Your Page
              </Link>
              <Link
                href="/athletes/cole-kindig"
                className="w-full sm:w-auto border-2 border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/5 font-bold text-base px-9 py-4 rounded-full transition-all uppercase tracking-wide"
              >
                See An Example
              </Link>
            </div>

            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
              Built for multi-sport athletes.{" "}
              <span className="text-gray-500">Delivered in 48 hours.</span>
            </p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────── */}
        <section className="py-28 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">The Process</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Simple. Fast. Professional.
              </h2>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                {howItWorksSteps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center text-center">
                    <div className="relative mb-7">
                      <div className="w-20 h-20 rounded-full border-2 border-[#38bdf8]/30 bg-[#38bdf8]/8 flex items-center justify-center">
                        <span className="text-[#38bdf8] font-black text-xl">{step.number}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-[#0a0f1e]">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SEE AN EXAMPLE ───────────────────────────── */}
        <section className="py-28 px-4 bg-[#0a0f1e] relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Live Example</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                This Is What Coaches Will See
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Every page we build looks like this — professional, detailed, and built to impress.
              </p>
            </div>

            {/* Preview card */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0f172a] border border-[#38bdf8]/20 rounded-2xl overflow-hidden shadow-2xl shadow-[#38bdf8]/5">
                {/* Card header bar */}
                <div className="bg-gradient-to-r from-[#0d1530] to-[#111827] px-8 py-5 border-b border-white/5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-gray-600 font-mono">multisportrecur.com/athletes/cole-kindig</span>
                </div>

                <div className="p-8">
                  {/* Athlete name block */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-black bg-[#38bdf8] text-[#0a0f1e] px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
                        Featured Athlete
                      </span>
                      <h3 className="text-4xl font-black text-white tracking-tighter">Cole Kindig</h3>
                      <p className="text-[#38bdf8] font-bold text-sm mt-1">Wilson Memorial High School · Fishersville, VA</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1">Class of</p>
                      <p className="text-3xl font-black text-white">2029</p>
                    </div>
                  </div>

                  {/* Sport tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { sport: "🏀 Basketball", pos: "Point Guard", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                      { sport: "🏈 Football", pos: "Quarterback", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                      { sport: "⚾ Baseball", pos: "Pitcher", color: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20" },
                    ].map((s) => (
                      <span key={s.sport} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border ${s.color}`}>
                        {s.sport} <span className="text-gray-600">· {s.pos}</span>
                      </span>
                    ))}
                  </div>

                  {/* Stat row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "GPA", value: "4.28" },
                      { label: "Height", value: "5'11\"" },
                      { label: "PPG", value: "18.4" },
                      { label: "Pass Yds", value: "1,847" },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#0a0f1e] border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-xl font-black text-white">{s.value}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1 font-bold">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Blur overlay hint */}
                  <div className="relative h-16 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a] z-10" />
                    <div className="text-xs text-gray-700 leading-6">
                      Cole Kindig is one of the most complete multi-sport athletes to come out of the Shenandoah Valley...
                      competing at a high level in basketball, football, and baseball at Wilson Memorial High School...
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 space-y-3">
                  <Link
                    href="/athletes/cole-kindig"
                    className="block w-full text-center border-2 border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/5 font-black py-4 rounded-full transition-all uppercase tracking-wide text-sm"
                  >
                    View Full Example Page →
                  </Link>
                  <Link
                    href="/get-your-page"
                    className="block w-full text-center bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black py-4 rounded-full transition-all hover:scale-[1.02] shadow-lg shadow-[#38bdf8]/20 uppercase tracking-wide text-sm"
                  >
                    Get Your Page →
                  </Link>
                  <p className="text-center text-xs text-gray-600">
                    This is a real page we built. Yours will look just like it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ────────────────────────────────── */}
        <section className="py-28 px-4 bg-[#0a0f1e] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[700px] h-[350px] bg-[#38bdf8]/4 rounded-full blur-[100px]" />
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">The Community</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                More Than A Page. A Movement.
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Multisport Recur is a community built to support multi-sport athletes with exposure, training resources,
                and a network of families who get it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communityCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group bg-[#0f172a] border border-white/10 rounded-2xl p-8 hover:border-[#38bdf8]/40 transition-all duration-300 hover:-translate-y-1 block"
                >
                  <span className="text-4xl mb-5 block">{card.emoji}</span>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-[#38bdf8] transition-colors">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{card.description}</p>
                  <span className="text-xs font-black text-[#38bdf8] uppercase tracking-widest">
                    {card.cta} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── MERCH ────────────────────────────────────── */}
        <section id="merch" className="py-28 px-4 bg-[#060b17] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="text-[#38bdf8] text-xs font-black uppercase tracking-widest">Coming Soon</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Gear For The Versatile Athlete
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Multisport Recur apparel coming soon. Built for athletes who never stop.
            </p>
            <Link
              href="/contact"
              className="inline-block border-2 border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/5 font-black text-sm px-9 py-4 rounded-full transition-all uppercase tracking-wide"
            >
              Notify Me
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
