import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const navLinks = [
  { label: "Athletes", href: "/athletes" },
  { label: "Training", href: "/training" },
  { label: "Nutrition", href: "/nutrition" },
  { label: "Community", href: "/community" },
];

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

          <div className="relative z-10 max-w-4xl mx-auto w-full py-24">

            {/* 1. Badge */}
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[#38bdf8] text-xs font-bold uppercase tracking-widest">Empowering Every Athlete</span>
            </div>

            {/* 2. Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
              Your Page.
              <br />
              <span className="text-[#38bdf8]">Your Story.</span>
            </h1>

            {/* 3. Subheadline */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We build premium athlete profile pages for multi-sport athletes.
              One link. Every stat. Every sport. Built to Impress.
            </p>

            {/* 4. Two buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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

            {/* Divider */}
            <div className="w-full max-w-sm mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

            {/* 5. Section headline */}
            <h2 className="text-3xl sm:text-4xl font-black text-[#38bdf8] mb-5">
              More Than A Page. A Movement.
            </h2>

            {/* 6. Mission statement */}
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-14">
              At Multisport Recur our mission is to fuel the next generation of athletes. Every athlete deserves guidance, support, and encouragement — without financial barriers.
            </p>

            {/* 7. Nav links — 4 col desktop, 2x2 mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-center border border-[#38bdf8]/25 hover:border-[#38bdf8]/60 text-[#38bdf8] hover:bg-[#38bdf8]/5 font-bold text-sm px-5 py-3.5 rounded-full transition-all uppercase tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
