"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("eatluri@umich.edu");
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
        .eq("email", email)
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
    <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-center">
          <img
            src="/tek-logo.png"
            alt="TEK Logo"
            className="h-20 w-auto object-contain"
          />
        </nav>

        <div className="flex flex-1 items-center justify-center py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
              Tau Epsilon Kappa
            </p>

            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#071E34] md:text-7xl">
              Rush feedback,
              <br />
              organized.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-slate-600 md:text-xl">
              Sign in with your TEK account to manage rush decisions, events,
              and brother feedback.
            </p>

            <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-[#E5DDD0] bg-white p-6 text-left shadow-sm">
              {errorMessage && (
                <p className="mb-4 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
                  {errorMessage}
                </p>
              )}

              <label className="text-sm font-bold">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="eatluri@umich.edu"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-4 text-base font-normal outline-none"
                />
              </label>

              <label className="mt-4 block text-sm font-bold">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-4 text-base font-normal outline-none"
                />
              </label>

              <button
                type="button"
                onClick={login}
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-[#071E34] px-6 py-4 text-base font-bold text-[#F6F1E8] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </div>
        </div>

        <p className="pb-4 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
          Professional Technology Fraternity
        </p>
      </section>
    </main>
  );
}