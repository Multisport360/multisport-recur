"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SUBJECTS = [
  "General Inquiry",
  "Submit My Story",
  "Partnership Opportunity",
  "Training Question",
  "Nutrition Question",
  "Other",
];

const infoCards = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "Submit Your Story",
    description:
      "Tell us about your athlete journey and we'll feature you on the platform. Multi-sport athletes from all levels and backgrounds are welcome.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    title: "Partnership Opportunities",
    description:
      "Brands and organizations looking to connect with multi-sport athletes. Let's build something meaningful together.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    ),
    title: "Training & Nutrition Questions",
    description:
      "Ask our team anything about our training programs or nutrition guidance. We're here to help you perform at your best.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          "Full Name": form.name,
          "Email Address": form.email,
          "Subject": form.subject,
          "Message": form.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#38bdf8]/50 focus:ring-1 focus:ring-[#38bdf8]/30 transition-colors";

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">
        {/* Hero */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1530] to-[#0a0f1e]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#38bdf8]/5 rounded-full blur-[110px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#38bdf8] font-bold text-xs uppercase tracking-[0.25em] mb-5">Reach Out</p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-5">
              Get In <span className="text-[#38bdf8]">Touch</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Have a question, want to submit your story, or partner with us? We want to hear from you.
            </p>
          </div>
        </section>

        {/* Form + contact info */}
        <section className="py-8 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

              {/* Form */}
              <div className="lg:col-span-3">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                          Full Name <span className="text-[#38bdf8]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Your full name"
                          value={form.name}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                          Email Address <span className="text-[#38bdf8]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        Subject <span className="text-[#38bdf8]">*</span>
                      </label>
                      <select
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" disabled>Select a subject...</option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        Message <span className="text-[#38bdf8]">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        value={form.message}
                        onChange={handleChange}
                        className={`${inputClass} resize-none`}
                      />
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
                      className="w-full bg-[#38bdf8] hover:bg-[#0ea5e9] disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0f1e] font-black text-sm py-4 rounded-full transition-all shadow-lg shadow-[#38bdf8]/20 hover:scale-[1.02] disabled:hover:scale-100 uppercase tracking-wide"
                    >
                      {loading ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                ) : (
                  <div className="bg-[#0f172a] border border-[#38bdf8]/20 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Message Sent!</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                      Thanks for reaching out! We will get back to you within 24–48 hours at the email you provided.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-[#38bdf8] hover:text-white font-bold transition-colors"
                    >
                      Send another message →
                    </button>
                  </div>
                )}
              </div>

              {/* Contact info sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Email */}
                <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
                  <p className="text-xs font-black text-[#38bdf8] uppercase tracking-widest mb-4">Contact Info</p>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Email</p>
                      <p className="text-white font-bold text-sm">multisportrecur@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Response Time</p>
                      <p className="text-white font-bold text-sm">Within 24–48 hours</p>
                    </div>
                  </div>
                </div>

                {/* Info cards */}
                {infoCards.map((card) => (
                  <div
                    key={card.title}
                    className="group bg-[#0f172a] border border-white/10 rounded-2xl p-6 hover:border-[#38bdf8]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-[#38bdf8] group-hover:scale-110 transition-transform origin-left">
                        {card.icon}
                      </div>
                      <p className="font-black text-white text-sm">{card.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
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
