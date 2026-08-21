"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function login() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const { data: brotherData, error: brotherError } = await supabase
        .from("brothers")
        .select("role")
        .ilike("email", email)
        .single();

      if (brotherError) {
        setErrorMessage("Login worked, but no brother profile was found.");
        return;
      }

      if (brotherData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/rush-board");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen md:grid-cols-2">

      {/* BRAND PANEL */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#071E34] to-[#031526] px-8 py-16 text-center text-[#F6F1E8] md:px-14">

        <svg
          viewBox="0 0 900 900"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 md:h-[900px] md:w-[900px]"
        >
          <g stroke="#c69a3d" strokeWidth="0.6" fill="none">
            <line x1="450" y1="450" x2="450" y2="0" />
            <line x1="450" y1="450" x2="740" y2="90" />
            <line x1="450" y1="450" x2="900" y2="380" />
            <line x1="450" y1="450" x2="850" y2="750" />
            <line x1="450" y1="450" x2="530" y2="900" />
            <line x1="450" y1="450" x2="150" y2="820" />
            <line x1="450" y1="450" x2="20" y2="520" />
            <line x1="450" y1="450" x2="90" y2="140" />
            <circle cx="450" cy="450" r="120" opacity="0.55" />
            <circle cx="450" cy="450" r="240" opacity="0.4" />
            <circle cx="450" cy="450" r="360" opacity="0.25" />
            <circle cx="450" cy="450" r="480" opacity="0.12" />
          </g>
        </svg>

        <div className="relative z-10">
          <img
            src="/tek-logo.png"
            alt="TEK Logo"
            className="mx-auto mb-8 h-16 w-auto"
          />
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.32em] text-[#e3c98a]">
            Tau Epsilon Kappa
          </p>
          <h1 className="mx-auto max-w-[9.5ch] font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            Rush Feedback
          </h1>
          <p className="mx-auto mt-5 max-w-[32ch] text-white/60">
            Iota Class
          </p>
          <p className="mt-10 font-display text-sm tracking-wide text-[#e3c98a]">
            2026
          </p>
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#5f6f85]">
            Welcome back!
          </p>
          <h2 className="mb-2 font-display text-3xl font-medium text-[#071E34]">
            Sign in
          </h2>
          <p className="mb-9 text-sm text-[#5f6f85]">
          
          </p>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-[#e8c9cd] bg-[#f5e8ea] px-4 py-3 text-sm font-semibold text-[#8A1F2D]">
              {errorMessage}
            </div>
          )}

          <label className="mb-5 block text-sm font-semibold text-[#071E34]">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@umich.edu"
              className="mt-2 w-full rounded-xl border border-[#E5DDD0] bg-white px-4 py-3.5 text-sm font-normal text-[#071E34] outline-none transition focus:border-[#c69a3d] focus:ring-2 focus:ring-[#c69a3d]/20"
            />
          </label>

          <label className="mb-7 block text-sm font-semibold text-[#071E34]">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
              className="mt-2 w-full rounded-xl border border-[#E5DDD0] bg-white px-4 py-3.5 text-sm font-normal text-[#071E34] outline-none transition focus:border-[#c69a3d] focus:ring-2 focus:ring-[#c69a3d]/20"
            />
          </label>

          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-[#071E34] py-3.5 text-sm font-semibold text-[#F6F1E8] transition hover:bg-[#031526] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
