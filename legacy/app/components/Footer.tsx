import Link from "next/link";

const footerLinks = [
  {
    heading: "Platform",
    links: [
      { label: "Home", href: "/" },
      { label: "Get Your Page", href: "/get-your-page" },
      { label: "Athletes", href: "/athletes" },
      { label: "Training", href: "/training" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Nutrition", href: "/nutrition" },
      { label: "Community", href: "/community" },
      { label: "Merch", href: "/#merch" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socials = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#03060f] border-t border-white/10 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-white font-black text-2xl">Multisport</span>
              <span className="text-[#38bdf8] font-black text-2xl">Recur</span>
            </div>
            <p className="text-gray-500 text-sm font-bold mb-2">Your Page. Your Story.</p>
            <p className="text-gray-700 text-xs leading-relaxed mb-5 max-w-xs">
              We build premium athlete profile pages for multi-sport athletes. One link. Every stat. Every sport.
            </p>
            <a
              href="mailto:multisportrecur@gmail.com"
              className="text-sm text-[#38bdf8]/70 hover:text-[#38bdf8] transition-colors font-medium"
            >
              multisportrecur@gmail.com
            </a>
            <div className="flex items-center gap-3 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#38bdf8]/20 text-gray-500 hover:text-[#38bdf8] flex items-center justify-center transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">{col.heading}</p>
              <div className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-700">© 2025 Multisport Recur. All rights reserved.</p>
          <p className="text-xs text-[#38bdf8]/30 font-bold uppercase tracking-widest">Your Page. Your Story.</p>
        </div>
      </div>
    </footer>
  );
}
