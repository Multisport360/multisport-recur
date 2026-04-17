"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* ─── Data ─────────────────────────────────────────────── */

const howItWorksSteps = [
  {
    number: "01",
    title: "Fill Out The Form",
    description: "Tell us about your athlete — sports, stats, positions, awards, and what makes them special.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "We Build Your Page",
    description: "Our team personally builds your premium profile page within 48 hours. No templates — built by hand.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "You Get Your Link",
    description: "Receive your personal URL to share with coaches, recruiters, scouts, and anyone who needs to know your story.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Get Seen",
    description: "Let your page do the talking while you focus on competing. Coaches get everything they need in one place.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    tagline: "Best for single sport athletes",
    popular: false,
    features: [
      "Professional profile page",
      "Bio and stats section",
      "One sport focus",
      "Shareable link",
      "Delivered in 48 hours",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    tagline: "Best for multi-sport athletes",
    popular: true,
    features: [
      "Everything in Starter",
      "All sports included",
      "Awards and highlights section",
      "Highlight video embed",
      "Custom written athlete bio",
      "One free update",
    ],
  },
  {
    name: "Elite",
    price: "$199",
    tagline: "Best for serious recruits",
    popular: false,
    features: [
      "Everything in Pro",
      "Custom branding and colors",
      "Coach outreach letter written by our team",
      "Priority 24-hour delivery",
      "Unlimited updates for 6 months",
      "Featured on Multisport Recur athletes page",
    ],
  },
];

const whyUsCards = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
    title: "Built for Multi-Sport Athletes",
    description: "Most recruiting tools focus on one sport. We showcase everything you do — every field, every court, every season.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: "Fast Turnaround",
    description: "Pages delivered within 48 hours so you can start sharing immediately. Priority orders in 24 hours.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    title: "One Link For Everything",
    description: "Coaches get one clean link with every sport, every stat, and your full story. No PDFs. No confusion.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
    title: "Affordable",
    description: "Professional recruiting pages at a fraction of the cost of traditional recruiting services. One-time payment, no subscriptions.",
  },
];

const communityCards = [
  {
    emoji: "⚡",
    title: "Training Programs",
    description: "Sport-specific programs built for athletes who never stop competing.",
    href: "/training",
    cta: "Browse Programs",
  },
  {
    emoji: "🥗",
    title: "Nutrition Guidance",
    description: "Fuel guides for bulking, performance, and sport-specific needs.",
    href: "/nutrition",
    cta: "View Nutrition",
  },
  {
    emoji: "📹",
    title: "Submit Your Clips",
    description: "Send us your highlight footage to be featured on the platform.",
    href: "/contact",
    cta: "Submit Clips",
  },
];

const SPORTS_OPTIONS = [
  "Football", "Basketball", "Baseball", "Soccer",
  "Track", "Wrestling", "Volleyball", "Lacrosse", "Other",
];

const GRAD_YEARS = ["2025", "2026", "2027", "2028", "2029", "2030"];

/* ─── Page ─────────────────────────────────────────────── */

export default function Home() {
  const [sports, setSports] = useState<string[]>([]);
  const [form, setForm] = useState({
    athleteName: "", parentName: "", email: "", phone: "",
    highSchool: "", hometown: "", gradYear: "", package: "",
    bio: "", stats: "", videoLinks: "", otherInfo: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function toggleSport(sport: string) {
    setSports((p) => p.includes(sport) ? p.filter((s) => s !== sport) : [...p, sport]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://formspree.io/f/maqaoelz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "Athlete Full Name": form.athleteName,
          "Parent/Guardian Name": form.parentName,
          "Email Address": form.email,
          "Phone Number": form.phone,
          "High School Name": form.highSchool,
          "Hometown and State": form.hometown,
          "Graduation Year": form.gradYear,
          "Sports Played": sports.join(", "),
          "Package Selected": form.package,
          "Athlete Bio": form.bio,
          "Stats For Each Sport": form.stats,
          "Highlight Video Links": form.videoLinks,
          "Anything Else": form.otherInfo,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({
          athleteName: "", parentName: "", email: "", phone: "",
          highSchool: "", hometown: "", gradYear: "", package: "",
          bio: "", stats: "", videoLinks: "", otherInfo: "",
        });
        setSports([]);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#38bdf8]/60 focus:ring-1 focus:ring-[#38bdf8]/20 transition-colors";
  const labelClass = "block text-xs font-black text-gray-400 uppercase tracking-widest mb-2";

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

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[#38bdf8] text-xs font-bold uppercase tracking-widest">Premium Athlete Profile Pages</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              Your Page.
              <br />
              <span className="text-[#38bdf8]">Your Story.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We build premium athlete profile pages for multi-sport athletes.
              One link. Every stat. Every sport. Built to impress coaches.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="#request-form"
                className="w-full sm:w-auto bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-base px-9 py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/25 hover:shadow-[#38bdf8]/40 hover:scale-105 uppercase tracking-wide"
              >
                Get Your Page
              </a>
              <Link
                href="/athletes/cole-kindig"
                className="w-full sm:w-auto border-2 border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/5 font-bold text-base px-9 py-4 rounded-full transition-all uppercase tracking-wide"
              >
                See An Example
              </Link>
            </div>

            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
              Built for multi-sport athletes.{" "}
              <span className="text-gray-500">Delivered in 48 hours.</span>
            </p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────── */}
        <section className="py-28 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">The Process</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Simple. Fast. Professional.
              </h2>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                {howItWorksSteps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center text-center">
                    <div className="relative mb-7">
                      <div className="w-20 h-20 rounded-full border-2 border-[#38bdf8]/30 bg-[#38bdf8]/8 flex items-center justify-center">
                        <span className="text-[#38bdf8] font-black text-xl">{step.number}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-[#0a0f1e]">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SEE AN EXAMPLE ───────────────────────────── */}
        <section className="py-28 px-4 bg-[#0a0f1e] relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Live Example</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                This Is What Coaches Will See
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Every page we build looks like this — professional, detailed, and built to impress.
              </p>
            </div>

            {/* Preview card */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0f172a] border border-[#38bdf8]/20 rounded-2xl overflow-hidden shadow-2xl shadow-[#38bdf8]/5">
                {/* Card header bar */}
                <div className="bg-gradient-to-r from-[#0d1530] to-[#111827] px-8 py-5 border-b border-white/5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-gray-600 font-mono">multisportrecur.com/athletes/cole-kindig</span>
                </div>

                <div className="p-8">
                  {/* Athlete name block */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-black bg-[#38bdf8] text-[#0a0f1e] px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
                        Featured Athlete
                      </span>
                      <h3 className="text-4xl font-black text-white tracking-tighter">Cole Kindig</h3>
                      <p className="text-[#38bdf8] font-bold text-sm mt-1">Wilson Memorial High School · Fishersville, VA</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1">Class of</p>
                      <p className="text-3xl font-black text-white">2027</p>
                    </div>
                  </div>

                  {/* Sport tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { sport: "🏀 Basketball", pos: "Point Guard", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                      { sport: "🏈 Football", pos: "Quarterback", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                      { sport: "⚾ Baseball", pos: "Pitcher", color: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20" },
                    ].map((s) => (
                      <span key={s.sport} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border ${s.color}`}>
                        {s.sport} <span className="text-gray-600">· {s.pos}</span>
                      </span>
                    ))}
                  </div>

                  {/* Stat row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "GPA", value: "4.28" },
                      { label: "Height", value: "5'11\"" },
                      { label: "PPG", value: "18.4" },
                      { label: "Pass Yds", value: "1,847" },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#0a0f1e] border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-xl font-black text-white">{s.value}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1 font-bold">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Blur overlay hint */}
                  <div className="relative h-16 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a] z-10" />
                    <div className="text-xs text-gray-700 leading-6">
                      Cole Kindig is one of the most complete multi-sport athletes to come out of the Shenandoah Valley...
                      competing at a high level in basketball, football, and baseball at Wilson Memorial High School...
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <Link
                    href="/athletes/cole-kindig"
                    className="block w-full text-center bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black py-4 rounded-full transition-all hover:scale-[1.02] shadow-lg shadow-[#38bdf8]/20 uppercase tracking-wide text-sm"
                  >
                    View Full Example Page →
                  </Link>
                  <p className="text-center text-xs text-gray-600 mt-3">
                    This is a real page we built. Yours will look just like it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────── */}
        <section className="py-28 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Pricing</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                Choose Your Package
              </h2>
              <p className="text-gray-400 text-lg">
                One time payment. No subscriptions. No hidden fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    plan.popular
                      ? "bg-[#0d1f35] border-2 border-[#38bdf8] shadow-2xl shadow-[#38bdf8]/15"
                      : "bg-[#0f172a] border border-white/10 hover:border-[#38bdf8]/30"
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-[#38bdf8] text-[#0a0f1e] text-[10px] font-black uppercase tracking-widest text-center py-2">
                      Most Popular
                    </div>
                  )}

                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{plan.name}</p>
                    <div className="flex items-end gap-1 mb-2">
                      <span className={`text-5xl font-black ${plan.popular ? "text-[#38bdf8]" : "text-white"}`}>
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8">{plan.tagline}</p>

                    <ul className="space-y-3 mb-10 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-gray-400">
                          <svg className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#request-form"
                      className={`block w-full text-center font-black text-sm py-4 rounded-full transition-all uppercase tracking-wide ${
                        plan.popular
                          ? "bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] shadow-lg shadow-[#38bdf8]/25 hover:scale-[1.02]"
                          : "border-2 border-white/15 hover:border-[#38bdf8]/50 text-white hover:text-[#38bdf8]"
                      }`}
                    >
                      Get Started
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REQUEST FORM ─────────────────────────────── */}
        <section id="request-form" className="py-28 px-4 bg-[#0a0f1e] relative overflow-hidden">
          <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-[#38bdf8]/4 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Get Your Page</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                Ready To Get Your Page?
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Fill out the form below and our team will get started on your page right away.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 sm:p-10 space-y-7">
                {/* Personal info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Athlete Full Name <span className="text-[#38bdf8]">*</span></label>
                    <input type="text" name="athleteName" required placeholder="First and last name" value={form.athleteName} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Parent / Guardian Name <span className="text-[#38bdf8]">*</span></label>
                    <input type="text" name="parentName" required placeholder="First and last name" value={form.parentName} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Email Address <span className="text-[#38bdf8]">*</span></label>
                    <input type="email" name="email" required placeholder="your@email.com" value={form.email} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" name="phone" placeholder="(000) 000-0000" value={form.phone} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>High School Name <span className="text-[#38bdf8]">*</span></label>
                    <input type="text" name="highSchool" required placeholder="School name" value={form.highSchool} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Hometown & State <span className="text-[#38bdf8]">*</span></label>
                    <input type="text" name="hometown" required placeholder="City, State" value={form.hometown} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Graduation Year <span className="text-[#38bdf8]">*</span></label>
                    <select name="gradYear" required value={form.gradYear} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                      <option value="" disabled>Select year...</option>
                      {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Package Selected <span className="text-[#38bdf8]">*</span></label>
                    <select name="package" required value={form.package} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                      <option value="" disabled>Select package...</option>
                      <option value="Starter">Starter — $49</option>
                      <option value="Pro">Pro — $99</option>
                      <option value="Elite">Elite — $199</option>
                    </select>
                  </div>
                </div>

                {/* Sports checkboxes */}
                <div>
                  <label className={labelClass}>Sports Played <span className="text-[#38bdf8]">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SPORTS_OPTIONS.map((sport) => {
                      const checked = sports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left ${
                            checked
                              ? "bg-[#38bdf8]/10 border-[#38bdf8]/50 text-[#38bdf8]"
                              : "bg-white/3 border-white/10 text-gray-400 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked ? "bg-[#38bdf8] border-[#38bdf8]" : "border-white/20"}`}>
                            {checked && (
                              <svg className="w-3 h-3 text-[#0a0f1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            )}
                          </span>
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text areas */}
                <div>
                  <label className={labelClass}>Athlete Bio / Tell Us About Yourself <span className="text-[#38bdf8]">*</span></label>
                  <textarea name="bio" required rows={4} placeholder="Tell us about your athlete — their work ethic, personality, achievements, and what makes them stand out..." value={form.bio} onChange={handleChange} className={`${inputClass} resize-none`} />
                </div>

                <div>
                  <label className={labelClass}>Stats For Each Sport <span className="text-[#38bdf8]">*</span></label>
                  <p className="text-xs text-gray-600 mb-2">Include position, key stats, and any awards for each sport you play.</p>
                  <textarea name="stats" required rows={5} placeholder="Example: Basketball — Point Guard, 18.4 PPG, 7.2 RPG, 4.1 APG, 44% from three, All-District 2024&#10;Football — Quarterback, 1,847 passing yards, 22 TDs, 4 INTs, 68% completion" value={form.stats} onChange={handleChange} className={`${inputClass} resize-none`} />
                </div>

                <div>
                  <label className={labelClass}>Highlight Video Links</label>
                  <p className="text-xs text-gray-600 mb-2">YouTube, Hudl, or any link. One per line.</p>
                  <textarea name="videoLinks" rows={3} placeholder="https://hudl.com/video/..." value={form.videoLinks} onChange={handleChange} className={`${inputClass} resize-none`} />
                </div>

                <div>
                  <label className={labelClass}>Anything Else You Want On Your Page</label>
                  <textarea name="otherInfo" rows={3} placeholder="Additional info, special requests, or anything else you'd like us to know..." value={form.otherInfo} onChange={handleChange} className={`${inputClass} resize-none`} />
                </div>

                {error && (
                  <p className="text-sm text-red-400 text-center">
                    Something went wrong. Please email us directly at{" "}
                    <a href="mailto:multisportrecur@gmail.com" className="underline">multisportrecur@gmail.com</a>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#38bdf8] hover:bg-[#0ea5e9] disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0f1e] font-black text-base py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/20 hover:scale-[1.02] disabled:hover:scale-100 uppercase tracking-wide"
                >
                  {loading ? "Submitting…" : "Submit My Request"}
                </button>

                <div className="text-center pt-2 space-y-1">
                  <p className="text-xs text-gray-600 leading-relaxed max-w-lg mx-auto">
                    After submitting, our team will contact you within 24 hours at the email provided.
                    Payment will be collected after we confirm your order.
                  </p>
                  <a href="mailto:multisportrecur@gmail.com" className="text-xs text-[#38bdf8]/60 hover:text-[#38bdf8] transition-colors">
                    multisportrecur@gmail.com
                  </a>
                </div>
              </form>
            ) : (
              <div className="bg-[#0f172a] border border-[#38bdf8]/20 rounded-2xl p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white mb-3">Request Submitted!</h3>
                <p className="text-gray-400 text-base leading-relaxed mb-3 max-w-md mx-auto">
                  Your request has been submitted! Our team will contact you within 24 hours at the email provided to confirm your order and next steps.
                </p>
                <p className="text-gray-600 text-sm mb-8">
                  In the meantime, check out Cole Kindig&apos;s page to see what we build.
                </p>
                <Link
                  href="/athletes/cole-kindig"
                  className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-sm px-8 py-3.5 rounded-full transition-all"
                >
                  View Example Page
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── WHY US ───────────────────────────────────── */}
        <section className="py-28 px-4 bg-[#060b17]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">Why Us</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Why Families Choose Us
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {whyUsCards.map((card, i) => (
                <div
                  key={card.title}
                  className="group relative bg-[#0a0f1e] border border-white/10 rounded-2xl p-8 hover:border-[#38bdf8]/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="absolute top-6 right-7 text-7xl font-black text-white/[0.025] select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="text-[#38bdf8] mb-5 group-hover:scale-110 transition-transform origin-left">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{card.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{card.description}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ────────────────────────────────── */}
        <section className="py-28 px-4 bg-[#0a0f1e] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[700px] h-[350px] bg-[#38bdf8]/4 rounded-full blur-[100px]" />
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-4">The Community</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                More Than A Page. A Movement.
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Multisport Recur is a community built to support multi-sport athletes with exposure, training resources,
                and a network of families who get it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communityCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group bg-[#0f172a] border border-white/10 rounded-2xl p-8 hover:border-[#38bdf8]/40 transition-all duration-300 hover:-translate-y-1 block"
                >
                  <span className="text-4xl mb-5 block">{card.emoji}</span>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-[#38bdf8] transition-colors">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{card.description}</p>
                  <span className="text-xs font-black text-[#38bdf8] uppercase tracking-widest">
                    {card.cta} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── MERCH ────────────────────────────────────── */}
        <section id="merch" className="py-28 px-4 bg-[#060b17] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="text-[#38bdf8] text-xs font-black uppercase tracking-widest">Coming Soon</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Gear For The Versatile Athlete
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Multisport Recur apparel coming soon. Built for athletes who never stop.
            </p>
            <Link
              href="/contact"
              className="inline-block border-2 border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/5 font-black text-sm px-9 py-4 rounded-full transition-all uppercase tracking-wide"
            >
              Notify Me
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
