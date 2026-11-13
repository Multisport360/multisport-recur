import { notFound } from "next/navigation";
import Link from "next/link";
import { allPrograms, getProgramBySlug } from "../programs-data";
import type { DayPlan, ExerciseItem, Level } from "../programs-data";

export async function generateStaticParams() {
  return allPrograms.map((p) => ({ slug: p.slug }));
}

const levelColors: Record<Level, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  Advanced: "bg-red-500/20 text-red-400 border border-red-500/30",
};

function ExerciseRow({ item }: { item: ExerciseItem }) {
  if (item.isSection) {
    return (
      <li className="pt-3 pb-1">
        <span className="text-xs font-black uppercase tracking-widest text-[#38bdf8]">
          {item.name}
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-300">{item.name}</span>
      {item.detail && (
        <span className="text-xs font-bold text-gray-500 ml-4 shrink-0">
          {item.detail}
        </span>
      )}
    </li>
  );
}

function DayCard({ day }: { day: DayPlan }) {
  if (day.isRest) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-600">
            {day.day}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-600">
            Rest
          </span>
        </div>
        <p className="text-sm font-bold text-gray-500 mb-1">{day.focus}</p>
        {day.restNote && (
          <p className="text-xs text-gray-600 leading-relaxed">{day.restNote}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#38bdf8]/60">
          {day.day}
        </span>
      </div>
      <p className="text-sm font-black text-white mb-4">{day.focus}</p>
      <ul className="divide-y divide-white/0">
        {day.exercises.map((ex, i) => (
          <ExerciseRow key={i} item={ex} />
        ))}
      </ul>
    </div>
  );
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) notFound();

  return (
    <main className="min-h-screen bg-[#0a0f1e] pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/training"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Programs
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-3xl">{program.emoji}</span>
            <span
              className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${levelColors[program.level]}`}
            >
              {program.level}
            </span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              {program.sport}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            {program.name}
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            {program.tagline}
          </p>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 text-center">
            <p className="text-2xl font-black text-white">{program.weeks}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Weeks</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 text-center col-span-2 sm:col-span-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Focus Areas</p>
            <div className="flex flex-wrap justify-center gap-2">
              {program.focusAreas.map((f) => (
                <span
                  key={f}
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#38bdf8]/10 text-[#38bdf8]/80 border border-[#38bdf8]/20"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <section className="mb-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-5">
            Weekly Schedule
          </h2>
          <div className="flex flex-col gap-4">
            {program.schedule.map((day, i) => (
              <DayCard key={i} day={day} />
            ))}
          </div>
        </section>

        {/* Equipment */}
        <section className="mb-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
            Equipment Needed
          </h2>
          <div className="flex flex-wrap gap-2">
            {program.equipment.map((e) => (
              <span
                key={e}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400"
              >
                {e}
              </span>
            ))}
          </div>
        </section>

        {/* Nutrition Tip */}
        <section className="mb-12 rounded-2xl bg-[#38bdf8]/5 border border-[#38bdf8]/20 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-[#38bdf8]/60 mb-3">
            Nutrition Tip
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">{program.nutritionTip}</p>
        </section>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-[#38bdf8]/10 to-[#0ea5e9]/5 border border-[#38bdf8]/20 p-8 text-center">
          <h3 className="text-xl font-black text-white mb-2">
            Built for Multi-Sport Athletes
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Get a premium athlete profile page that showcases every sport, every stat, and every achievement in one place.
          </p>
          <Link
            href="/#request-form"
            className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-8 py-3 rounded-full transition-all hover:scale-105 uppercase tracking-wide shadow-lg shadow-[#38bdf8]/20"
          >
            Get Your Page
          </Link>
        </div>
      </div>
    </main>
  );
}
