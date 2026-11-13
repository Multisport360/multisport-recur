import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const athlete = {
  name: "Cole Kindig",
  age: 15,
  gradYear: 2029,
  hometown: "Fishersville, VA",
  school: "Wilson Memorial High School",
  height: "5'11\"",
  weight: "161 lbs",
  gpa: "4.28",
  sports: [
    { name: "Basketball", emoji: "🏀", position: "Point Guard", jersey: 13 },
    { name: "Football", emoji: "🏈", position: "Quarterback", jersey: 7 },
    { name: "Baseball", emoji: "⚾", position: "Center Field / Pitcher", jersey: 8 },
  ],
  stats: {
    basketball: [
      { label: "PPG", value: "N/A" },
      { label: "RPG", value: "N/A" },
      { label: "APG", value: "N/A" },
      { label: "3PT%", value: "N/A" },
    ],
    football: [
      { label: "Pass Yds", value: "N/A" },
      { label: "TDs", value: "N/A" },
      { label: "INTs", value: "N/A" },
      { label: "Comp%", value: "N/A" },
    ],
    baseball: [
      { label: "BA", value: "N/A" },
      { label: "RBIs", value: "N/A" },
      { label: "Fastball", value: "N/A" },
    ],
  },
  measurables: [
    { label: "Throwing Velocity", value: "81 MPH" },
    { label: "Exit Velocity", value: "90 MPH" },
    { label: "60 Yard Dash", value: "6.8 sec" },
    { label: "Vertical Jump", value: "22 in" },
  ],
  bio: "Cole Kindig is one of the most complete multi-sport athletes to come out of the Shenandoah Valley, competing at a high level in basketball, football, and baseball at Wilson Memorial High School in Fishersville, Virginia. As a freshman, he leads by example on every field and court — orchestrating offenses as a Point Guard, commanding the huddle as a Quarterback, and locking down hitters as a Pitcher. What separates Cole isn't just his ability across three sports — it's his mental edge, coachability, and refusal to let one season be a ceiling for the next. A 4.28 GPA student-athlete, Cole represents the exact spirit Multisport Recur was built to celebrate and elevate.",
  awards: [
    "3 Sport Varsity Athlete as a Freshman",
    "Founder and CEO of Multisport Recur",
    "National Honor Society Member",
    "Best Team Captain Award",
  ],
  quote: "I don't stop when one season ends — I just switch uniforms. Every sport makes me better at the next one.",
  goal: "To compete in a high level college sports program while excelling academically and continuing to grow personally both on and off the field.",
  social: [
    {
      platform: "Instagram",
      handle: "@colethekiid",
      href: "https://instagram.com/colethekiid",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      platform: "Facebook",
      handle: "Cole Kindig",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      platform: "X",
      handle: "Cole Kindig",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ],
};

const sportColor: Record<string, { bg: string; text: string; border: string }> = {
  Basketball: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  Football:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  Baseball:   { bg: "bg-[#38bdf8]/10", text: "text-[#38bdf8]", border: "border-[#38bdf8]/20" },
};

const photos = [
  { src: "/cole-football.jpeg", caption: "QB | Wilson Memorial Hornets", sport: "Football" },
  { src: "/cole-basketball.jpeg", caption: "PG | Wilson Memorial Hornets", sport: "Basketball" },
  { src: "/cole-baseball.jpeg", caption: "Pitcher | Wilson Memorial Hornets", sport: "Baseball" },
];

export default function ColeKindigPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">
        {/* Back */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link href="/athletes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Athletes
          </Link>
        </div>

        {/* Profile hero */}
        <section className="relative py-12 px-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#38bdf8]/5 rounded-full blur-[130px] pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* Photo card */}
              <div className="lg:col-span-1">
                <div className="relative bg-gradient-to-br from-[#0d1530] via-[#111827] to-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden aspect-[3/4]">
                  <Image
                    src="/cole-football.jpeg"
                    alt="Cole Kindig — Football"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f1e] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/60 to-transparent" />
                </div>

                {/* Jersey numbers */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {athlete.sports.map((s) => (
                    <div key={s.name} className={`${sportColor[s.name].bg} border ${sportColor[s.name].border} rounded-xl p-3 text-center`}>
                      <span className={`text-2xl font-black ${sportColor[s.name].text}`}>#{s.jersey}</span>
                      <p className="text-[10px] text-gray-600 mt-1 font-bold uppercase tracking-wider">{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Name + tags */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-[10px] font-black bg-[#38bdf8] text-[#0a0f1e] px-3 py-1 rounded-full uppercase tracking-widest">
                      Featured Athlete
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Class of {athlete.gradYear}</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-2">{athlete.name}</h1>
                  <p className="text-[#38bdf8] font-bold text-sm">{athlete.school} · {athlete.hometown}</p>
                </div>

                {/* Sport tags */}
                <div className="flex flex-wrap gap-2">
                  {athlete.sports.map((s) => (
                    <div key={s.name} className={`flex items-center gap-2 ${sportColor[s.name].bg} border ${sportColor[s.name].border} rounded-full px-4 py-2`}>
                      <span>{s.emoji}</span>
                      <span className={`text-xs font-black ${sportColor[s.name].text} uppercase tracking-wider`}>{s.name}</span>
                      <span className="text-xs text-gray-600">· {s.position}</span>
                    </div>
                  ))}
                </div>

                {/* Physical + academic stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Age", value: athlete.age },
                    { label: "Height", value: athlete.height },
                    { label: "Weight", value: athlete.weight },
                    { label: "GPA", value: athlete.gpa },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0f172a] border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-xl font-black text-white">{item.value}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
                  <p className="text-xs font-black text-[#38bdf8] uppercase tracking-widest mb-3">About Cole</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{athlete.bio}</p>
                </div>

                {/* Quote */}
                <blockquote className="relative border-l-2 border-[#38bdf8] pl-6 py-2">
                  <p className="text-white font-bold text-lg italic leading-snug">&ldquo;{athlete.quote}&rdquo;</p>
                  <footer className="text-[#38bdf8] text-xs font-black uppercase tracking-widest mt-3">— Cole Kindig</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="py-16 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-8">Athletic Stats</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Basketball stats */}
              <div className="bg-[#0a0f1e] border border-amber-500/20 rounded-2xl overflow-hidden">
                <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-500/10 flex items-center gap-3">
                  <span className="text-2xl">🏀</span>
                  <div>
                    <p className="font-black text-white text-sm">Basketball</p>
                    <p className="text-xs text-amber-400">Point Guard · #13</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  {athlete.stats.basketball.map((s) => (
                    <div key={s.label} className="bg-[#0a0f1e] p-5 text-center">
                      <p className="text-2xl font-black text-white">{s.value}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Football stats */}
              <div className="bg-[#0a0f1e] border border-emerald-500/20 rounded-2xl overflow-hidden">
                <div className="bg-emerald-500/10 px-6 py-4 border-b border-emerald-500/10 flex items-center gap-3">
                  <span className="text-2xl">🏈</span>
                  <div>
                    <p className="font-black text-white text-sm">Football</p>
                    <p className="text-xs text-emerald-400">Quarterback · #7</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  {athlete.stats.football.map((s) => (
                    <div key={s.label} className="bg-[#0a0f1e] p-5 text-center">
                      <p className="text-2xl font-black text-white">{s.value}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baseball stats */}
              <div className="bg-[#0a0f1e] border border-[#38bdf8]/20 rounded-2xl overflow-hidden">
                <div className="bg-[#38bdf8]/10 px-6 py-4 border-b border-[#38bdf8]/10 flex items-center gap-3">
                  <span className="text-2xl">⚾</span>
                  <div>
                    <p className="font-black text-white text-sm">Baseball</p>
                    <p className="text-xs text-[#38bdf8]">Center Field / Pitcher · #8</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/5">
                  {athlete.stats.baseball.map((s) => (
                    <div key={s.label} className="bg-[#0a0f1e] p-5 text-center">
                      <p className="text-xl font-black text-white">{s.value}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Athletic Measurables */}
            <div className="mt-10">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-6">Athletic Measurables</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {athlete.measurables.map((m) => (
                  <div
                    key={m.label}
                    className="bg-gradient-to-br from-[#38bdf8]/10 to-[#0ea5e9]/5 border border-[#38bdf8]/25 rounded-2xl p-6 text-center"
                  >
                    <p className="text-3xl font-black text-white mb-1">{m.value}</p>
                    <p className="text-[10px] font-black text-[#38bdf8]/70 uppercase tracking-widest">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-8">Photo Gallery</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.sport} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#0f172a]">
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/90 via-[#0a0f1e]/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[#38bdf8] text-xs font-black uppercase tracking-widest">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards + Highlight */}
        <section className="py-16 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-6">Accomplishments</p>
                <div className="space-y-3">
                  {athlete.awards.map((award, i) => (
                    <div key={i} className="flex items-start gap-4 bg-[#0a0f1e] border border-white/10 rounded-xl px-5 py-4 hover:border-[#38bdf8]/20 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-[#38bdf8]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-300 font-medium leading-snug">{award}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlight reel */}
              <div>
                <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-6">Highlight Mixtape</p>
                <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d1530] to-[#060b17]" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <div
                      style={{
                        backgroundImage: "repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)",
                        backgroundSize: "20px 20px",
                      }}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#38bdf8]/30 bg-[#38bdf8]/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-[#38bdf8]/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-black text-lg">Highlight Mixtape</p>
                    <p className="text-[#38bdf8] font-bold text-sm mt-1">Coming Soon</p>
                    <p className="text-gray-600 text-xs mt-2 max-w-xs">
                      Cole&apos;s multi-sport highlight reel is in production. Check back soon.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-8">Goals</p>
            <div className="relative border border-[#38bdf8]/20 rounded-2xl bg-gradient-to-br from-[#38bdf8]/5 to-transparent p-10 text-center max-w-3xl mx-auto">
              <div className="absolute top-6 left-8 text-[#38bdf8]/20 text-7xl font-black leading-none select-none">&ldquo;</div>
              <p className="relative z-10 text-xl sm:text-2xl font-black text-white leading-snug italic">
                {athlete.goal}
              </p>
              <div className="absolute bottom-6 right-8 text-[#38bdf8]/20 text-7xl font-black leading-none select-none">&rdquo;</div>
              <footer className="mt-6 text-[#38bdf8] text-xs font-black uppercase tracking-widest">— Cole Kindig</footer>
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="py-12 px-4 bg-[#060b17] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-6">Social Media</p>
            <div className="flex flex-wrap gap-3">
              {athlete.social.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target={s.href !== "#" ? "_blank" : undefined}
                  rel={s.href !== "#" ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-3 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/25 hover:border-[#38bdf8]/50 text-[#38bdf8] rounded-full px-5 py-3 transition-all group"
                >
                  {s.icon}
                  <span className="text-sm font-bold">{s.handle}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8]/50 group-hover:text-[#38bdf8]/80 transition-colors">{s.platform}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-[#060b17] border-t border-white/5 text-center">
          <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-widest mb-4">Want to be featured?</p>
          <h2 className="text-3xl font-black text-white mb-4">Your story belongs here too.</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Submit your clips and join athletes like Cole on the Multisport Recur platform.
          </p>
          <Link
            href="/#request-form"
            className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-9 py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/20 hover:scale-105 uppercase tracking-wide"
          >
            Get Your Page
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
