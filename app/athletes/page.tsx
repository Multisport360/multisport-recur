import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const athletes = [
  {
    slug: "cole-kindig",
    name: "Cole Kindig",
    age: 15,
    gradYear: 2029,
    hometown: "Fishersville, VA",
    sports: ["Basketball", "Football", "Baseball"],
    positions: ["Point Guard", "Quarterback", "CF / Pitcher"],
    school: "Wilson Memorial HS",
    gpa: "4.28",
    featured: true,
    photo: "/cole-football.jpeg",
  },
];

const sportColor: Record<string, string> = {
  Basketball: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Football: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Baseball: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20",
  Soccer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Track: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Wrestling: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AthletesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">
        {/* Hero */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530] to-[#0a0f1e]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#38bdf8]/6 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-5">Featured Athletes</p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-5">
              Meet The <span className="text-[#38bdf8]">Athletes</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Real athletes. Real stories. Built for the versatile.
            </p>
          </div>
        </section>

        {/* Athlete grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete) => (
                <Link key={athlete.slug} href={`/athletes/${athlete.slug}`} className="group block">
                  <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#38bdf8]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#38bdf8]/10">
                    {/* Featured badge */}
                    {athlete.featured && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#38bdf8] text-[#0a0f1e] px-3 py-1 rounded-full">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Photo */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={athlete.photo}
                        alt={athlete.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f172a] to-transparent" />
                    </div>

                    {/* Card body */}
                    <div className="p-6">
                      {/* Name + year */}
                      <div className="flex items-start justify-between mb-1">
                        <h2 className="text-xl font-black text-white group-hover:text-[#38bdf8] transition-colors">
                          {athlete.name}
                        </h2>
                        <span className="text-xs text-gray-600 font-bold shrink-0 ml-2">{athlete.gradYear}</span>
                      </div>

                      <p className="text-xs text-gray-500 mb-4">
                        {athlete.school} · {athlete.hometown}
                      </p>

                      {/* Sport tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {athlete.sports.map((sport) => (
                          <span
                            key={sport}
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${sportColor[sport] ?? "bg-white/5 text-gray-400 border-white/10"}`}
                          >
                            {sport}
                          </span>
                        ))}
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600">GPA</span>
                          <span className="text-sm font-black text-[#38bdf8]">{athlete.gpa}</span>
                        </div>
                        <span className="text-xs font-bold text-[#38bdf8] group-hover:underline">
                          View Profile →
                        </span>
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}

              {/* "More Coming Soon" placeholder cards */}
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#0f172a]/50 border border-white/5 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-bold text-sm">More Athletes Coming Soon</p>
                  <p className="text-gray-700 text-xs mt-1">Submit your clips to be featured</p>
                </div>
              ))}
            </div>

            {/* Submit CTA */}
            <div className="mt-16 text-center">
              <p className="text-gray-500 text-sm mb-4">Want to be featured on the Athletes page?</p>
              <Link
                href="/#request-form"
                className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-8 py-3.5 rounded-full transition-all shadow-lg shadow-[#38bdf8]/20 hover:scale-105 uppercase tracking-wide"
              >
                Get Your Page
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
