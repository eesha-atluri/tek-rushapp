"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const brotherLinks = [
  { href: "/rush-board", label: "Rush Board" },
  { href: "/my-feedback", label: "My Notes" },
];

export default function BrotherNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#071E34] px-4 py-4 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <a href="/rush-board" className="flex items-center">
          <img
            src="/tek-logo.png"
            alt="TEK Logo"
            className="h-14 w-auto object-contain md:h-16"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 text-base font-bold lg:flex">
          {brotherLinks.map((link) => {
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

          <button
            type="button"
            onClick={logout}
            className="whitespace-nowrap rounded-full border border-white/30 px-7 py-3 text-white hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white lg:hidden"
        >
          {menuOpen ? "Close" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mx-auto mt-4 max-w-7xl rounded-3xl border border-white/10 bg-[#031526] p-3 lg:hidden">
          <div className="grid gap-2">
            {brotherLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-2xl px-5 py-4 text-base font-bold transition ${
                    active
                      ? "bg-[#F6F1E8] text-[#071E34]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-white/20 px-5 py-4 text-left text-base font-bold text-white hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}