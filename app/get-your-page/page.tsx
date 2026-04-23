"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Data ─────────────────────────────────────────────── */

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

const SPORTS_OPTIONS = [
  "Football", "Basketball", "Baseball", "Soccer",
  "Track", "Wrestling", "Volleyball", "Lacrosse", "Other",
];

const GRAD_YEARS = ["2025", "2026", "2027", "2028", "2029", "2030"];

/* ─── Page ─────────────────────────────────────────────── */

export default function GetYourPagePage() {
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
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530] to-[#0a0f1e]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#38bdf8]/6 rounded-full blur-[130px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "24px 24px" }}
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[#38bdf8] text-xs font-bold uppercase tracking-widest">Premium Athlete Profile Pages</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-6">
              Your Page.
              <br />
              <span className="text-[#38bdf8]">Your Story.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed">
              Premium athlete profile pages built for multi-sport athletes. One link. Every stat. Every sport. Built to impress coaches.
            </p>

            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-10">
              Built for multi-sport athletes.{" "}
              <span className="text-gray-500">Delivered in 48 hours.</span>
            </p>

            <a
              href="#request-form"
              className="inline-block bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] font-black text-base px-9 py-4 rounded-full transition-all shadow-xl shadow-[#38bdf8]/25 hover:shadow-[#38bdf8]/40 hover:scale-105 uppercase tracking-wide"
            >
              Get Your Page
            </a>
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

      </main>
      <Footer />
    </>
  );
}
