import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0f1e]" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#38bdf8]/8 rounded-full blur-[130px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#38bdf8]/6 rounded-full blur-[110px] pointer-events-none translate-x-1/3 translate-y-1/3" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-6">
          The Multi-Sport Community
        </p>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-8">
          More Than
          <br />
          <span className="text-[#38bdf8]">An Athlete.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A community built for multi-sport athletes — get exposure, training
          resources, and connect with others who share your grind.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/submit"
            className="w-full sm:w-auto bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-black text-base px-9 py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/30 hover:shadow-[#38bdf8]/50 hover:scale-105 tracking-wide uppercase"
          >
            Submit Your Clips
          </Link>
          <Link
            href="/athletes"
            className="w-full sm:w-auto border-2 border-[#38bdf8]/60 hover:border-[#38bdf8] text-[#38bdf8] hover:text-white hover:bg-[#38bdf8] font-bold text-base px-9 py-4 rounded-full transition-all uppercase tracking-wide"
          >
            Explore Athletes
          </Link>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
