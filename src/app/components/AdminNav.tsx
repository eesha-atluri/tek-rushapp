"use client";

import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hash", label: "Rush Decisions" },
  { href: "/admin/rushees", label: "Rushees" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/archive", label: "Archive" },
];

export default function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#071E34] px-6 py-5 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
        <a href="/admin" className="flex items-center">
          <img
            src="/tek-logo.png"
            alt="TEK Logo"
            className="h-16 w-auto object-contain"
          />
        </a>

        <div className="flex gap-4 overflow-x-auto text-base font-bold">
          {adminLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative whitespace-nowrap rounded-full px-7 py-3 transition ${
                  active
                    ? "bg-[#F6F1E8] text-[#071E34]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {link.label}

                {active && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#C69A3D]" />
                )}
              </a>
            );
          })}

          <a
            href="/"
            className="whitespace-nowrap rounded-full border border-white/30 px-7 py-3 text-white hover:bg-white/10"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}