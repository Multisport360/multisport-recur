"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Athletes", href: "/athletes" },
  { label: "Training", href: "/training" },
  { label: "Nutrition", href: "/nutrition" },
  { label: "Community", href: "/community" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-white font-black text-xl tracking-tight">Multisport</span>
            <span className="text-[#38bdf8] font-black text-xl tracking-tight">Recur</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === l.href ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/get-your-page"
              className="text-sm font-black bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#38bdf8]/20 ml-2 uppercase tracking-wide"
            >
              Get Your Page
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white flex flex-col gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a0f1e] border-t border-white/10 px-5 py-5 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`text-base font-medium transition-colors ${pathname === l.href ? "text-white" : "text-gray-400"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/get-your-page"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-black bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0a0f1e] px-5 py-3 rounded-full text-center transition-colors mt-2 uppercase tracking-wide"
          >
            Get Your Page
          </Link>
        </div>
      )}
    </nav>
  );
}
