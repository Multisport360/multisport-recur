const steps = [
  {
    number: "01",
    title: "Submit Your Clips",
    description:
      "Upload your highlight footage from any sport — basketball, football, track, baseball, whatever you compete in. All levels welcome.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "We Create Your Mixtape",
    description:
      "Our team builds a professional highlight feature tailored to you — edited, branded, and ready to represent who you are as an athlete.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get Exposed",
    description:
      "Your story gets shared across our platform and social channels. Coaches, scouts, and the community see you compete — across every sport.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 px-4 bg-[#0a0f1e] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#38bdf8]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.2em] mb-4">
            The Process
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center md:items-start md:text-left">
                {/* Step number circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-2 border-[#38bdf8]/40 bg-[#38bdf8]/10 flex items-center justify-center">
                    <span className="text-[#38bdf8] font-black text-2xl">{step.number}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
