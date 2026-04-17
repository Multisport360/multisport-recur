import Link from "next/link";

const features = [
  {
    label: "Mixtapes",
    href: "/mixtapes",
    title: "Highlight Mixtapes",
    description:
      "We turn your submitted clips into professional-style mixtapes and spotlight features. Your best moments, cut together the right way.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    label: "Exposure",
    href: "/athletes",
    title: "Athlete Exposure",
    description:
      "Get featured across our platform and social channels to build visibility and confidence. We put your name and game in front of people who matter.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    label: "Training",
    href: "/training",
    title: "Training Programs",
    description:
      "Sport-specific training built for athletes who never stop competing. Programs designed to complement each other across every season.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: "Nutrition",
    href: "/nutrition",
    title: "Nutrition Guidance",
    description:
      "Fuel your body right for every sport and every goal. From bulking plans to pre-game meals, we break it down for the multi-sport athlete.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-4 bg-[#060b17]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.2em] mb-4">
            What We Offer
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Everything the multi-sport
            <br />
            athlete deserves.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative bg-[#0a0f1e] border border-white/10 rounded-2xl p-8 hover:border-[#38bdf8]/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <span className="absolute top-6 right-7 text-7xl font-black text-white/[0.03] select-none leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex items-start justify-between mb-5">
                <span className="inline-block text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.2em]">
                  {feature.label}
                </span>
                <Link
                  href={feature.href}
                  className="text-[10px] font-bold text-gray-600 hover:text-[#38bdf8] uppercase tracking-wider transition-colors"
                >
                  Explore →
                </Link>
              </div>

              <div className="text-[#38bdf8] mb-5 group-hover:scale-110 transition-transform origin-left">
                {feature.icon}
              </div>

              <h3 className="text-xl font-black text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#38bdf8]/0 via-[#38bdf8]/60 to-[#38bdf8]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
