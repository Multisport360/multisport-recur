import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ManagingSchedulesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">

        {/* Back */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-[#38bdf8] hover:text-white text-sm font-bold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Community
          </Link>
        </div>

        {/* Header */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530]/60 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#38bdf8]/4 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Family Resources</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tighter">
              Managing Multiple Sport Schedules
            </h1>
          </div>
        </section>

        {/* Article */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
                <span className="text-4xl">📅</span>
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">For The Family</p>
                  <p className="text-sm text-gray-400">Multisport Recur Community</p>
                </div>
              </div>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                Juggling two or three sports seasons is no small feat. Start with a master calendar that maps every practice, game, and school commitment for the entire semester. Color code by sport so conflicts jump out early. Communicate with coaches at the start of each season so they know your athlete is multi-sport and build relationships with each program. Most coaches respect the multi-sport athlete — but they need to know upfront. Build in at least one full rest day per week. Recovery is not optional, it is part of the training plan.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 px-4 bg-[#060b17]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Get In Touch</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Have Questions?</h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              We are here to help. Reach out to our team anytime.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-9 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#38bdf8]/20 uppercase tracking-wide"
            >
              Contact Us
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
