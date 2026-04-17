import Link from "next/link";

export default function JoinMovement() {
  return (
    <section className="relative py-32 px-4 overflow-hidden bg-[#060b17]">
      {/* Big orange glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] bg-[#38bdf8]/10 rounded-full blur-[100px]" />
      </div>

      {/* Diagonal texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Orange top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-6">
          Join The Movement
        </p>

        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-8">
          You&apos;re not just an athlete.
          <br />
          <span className="text-[#38bdf8]">You&apos;re part of something bigger.</span>
        </h2>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Multi-sport athletes are a different breed. We built this for you — the ones who don&apos;t
          stop when one season ends.
        </p>

        <Link
          href="/community"
          className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-black text-base px-10 py-5 rounded-full transition-all shadow-2xl shadow-[#38bdf8]/30 hover:shadow-[#38bdf8]/50 hover:scale-105 uppercase tracking-wide"
        >
          Join The Community
        </Link>
      </div>
    </section>
  );
}
