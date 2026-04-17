"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { allPrograms } from "./programs-data";
import type { Level } from "./programs-data";

type Sport = "All" | "Football" | "Basketball" | "Baseball" | "Soccer" | "Track" | "Wrestling" | "Volleyball" | "Lacrosse";

const SPORTS: Sport[] = ["All", "Football", "Basketball", "Baseball", "Soccer", "Track", "Wrestling", "Volleyball", "Lacrosse"];

const difficultyColor: Record<Level, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function TrainingPage() {
  const [active, setActive] = useState<Sport>("All");

  const displayedPrograms =
    active === "All"
      ? allPrograms
      : active === "Volleyball" || active === "Lacrosse"
      ? allPrograms.filter((p) => p.slug === "general-athletic")
      : allPrograms.filter((p) => p.sport === active);

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">
        {/* Hero */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530] to-[#0a0f1e]" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#38bdf8]/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-5">Training Programs</p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-5">
              Train Smarter.{" "}
              <span className="text-[#38bdf8]">Perform in Every Sport.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Sport-specific training programs built for athletes who never stop competing.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 pb-6 sticky top-16 z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide py-3">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setActive(sport)}
                  className={`shrink-0 text-sm font-bold px-5 py-2 rounded-full border transition-all ${
                    active === sport
                      ? "bg-[#38bdf8] border-[#38bdf8] text-white shadow-lg shadow-[#38bdf8]/20"
                      : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Program cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPrograms.map((program) => (
                <div
                  key={program.slug}
                  className="group bg-[#0f172a] border border-white/10 rounded-2xl p-7 hover:border-[#38bdf8]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38bdf8]/5 flex flex-col"
                >
                  {/* Sport header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{program.emoji}</span>
                      <span className="text-xs font-black text-[#38bdf8] uppercase tracking-widest">
                        {program.sport}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${difficultyColor[program.level]}`}
                    >
                      {program.level}
                    </span>
                  </div>

                  {/* Program name */}
                  <h3 className="text-lg font-black text-white mb-4 leading-snug">{program.name}</h3>

                  {/* Duration */}
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-sm text-gray-500">{program.weeks} weeks</span>
                  </div>

                  {/* Focus areas */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {program.focusAreas.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Link
                      href={`/training/${program.slug}`}
                      className="block w-full text-center text-sm font-black bg-[#38bdf8] hover:bg-[#0ea5e9] text-white py-3 rounded-full transition-all group-hover:shadow-lg group-hover:shadow-[#38bdf8]/20 uppercase tracking-wide"
                    >
                      View Program
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {displayedPrograms.length === 0 && (
              <div className="text-center py-20 text-gray-600">
                <p className="text-5xl mb-4">🏋️</p>
                <p className="font-bold text-lg">No programs for this sport yet.</p>
                <p className="text-sm mt-2">Check back soon — we&apos;re always adding more.</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom callout */}
        <section className="py-24 px-4 bg-[#060b17] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[300px] bg-[#38bdf8]/6 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.2em] mb-4">The Advantage</p>
                <h2 className="text-4xl font-black text-white leading-tight mb-5">
                  Built for Multi-Sport Athletes
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mb-5">
                  Every program is designed with the multi-sport athlete in mind — workouts that
                  build transferable athleticism so you don&apos;t burn out or peak in just one sport.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Whether you&apos;re in football season or transitioning to baseball, our programs
                  are built to complement each other, not compete. Train once, perform everywhere.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "8+", label: "Sports Covered" },
                  { stat: "19", label: "Programs Available" },
                  { stat: "All", label: "Skill Levels" },
                  { stat: "100%", label: "Athlete Focused" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0a0f1e] border border-white/10 rounded-xl p-5 text-center">
                    <p className="text-3xl font-black text-[#38bdf8] mb-1">{item.stat}</p>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
