"use client";

import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hash", label: "Hash" },
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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#061A33] px-4 py-3 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <a href="/admin" className="flex items-center">
          <img
            src="/tek-logo.png"
            alt="TEK Logo"
            className="h-10 w-auto object-contain"
          />
        </a>

        <div className="flex gap-2 overflow-x-auto text-xs font-bold">
          {adminLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <a
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-[#F4F1EA] text-[#061A33]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {link.label}
              </a>
            );
          })}

          <a
            href="/"
            className="whitespace-nowrap rounded-full border border-white/30 px-4 py-2 text-white hover:bg-white/10"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}