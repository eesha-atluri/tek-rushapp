"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type RusheeRow = {
  id: string;
  number: number;
  name: string;
  major: string | null;
  year: string | null;
  gender: string | null;
  photo: string | null;
  application_summary: string | null;
};

type HashDecisionRow = {
  rushee_id: string;
  stage: string;
  rushees: RusheeRow | null;
};

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

export default function AdminArchivePage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [archivedRushees, setArchivedRushees] = useState<HashDecisionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const admin = await requireAdmin();

    if (!admin) {
      router.push("/");
      return;
    }

    setCurrentBrother(admin);
    await loadArchivedRushees();
  }

  async function loadArchivedRushees() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("hash_decisions")
        .select(
          `
          rushee_id,
          stage,
          rushees (
            id,
            number,
            name,
            major,
            year,
            gender,
            photo,
            application_summary
          )
        `
        )
        .eq("stage", "Archived")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setArchivedRushees((data || []) as unknown as HashDecisionRow[]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load archive.");
    } finally {
      setLoading(false);
    }
  }

  async function moveBackToHashOne(rusheeId: string) {
    const confirmed = window.confirm("Move this rushee back to Hash #1?");

    if (!confirmed) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const { error } = await supabase.from("hash_decisions").upsert(
        {
          rushee_id: rusheeId,
          stage: "Hash #1",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "rushee_id",
        }
      );

      if (error) {
        throw error;
      }

      await loadArchivedRushees();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not restore rushee.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRushee(rusheeId: string, rusheeName: string) {
    const confirmed = window.confirm(
      `Permanently delete ${rusheeName}? This will delete their feedback, events, required feedback, and hash decision.`
    );

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Final confirmation: this cannot be undone from the app."
    );

    if (!secondConfirm) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const { error } = await supabase
        .from("rushees")
        .delete()
        .eq("id", rusheeId);

      if (error) {
        throw error;
      }

      await loadArchivedRushees();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not permanently delete rushee.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <AdminNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading archive...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <AdminNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Admin
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">Archive</h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            View archived rushees, restore them to Hash #1, or permanently
            delete old/test data.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="mb-6 rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Archived Rushees</p>
          <p className="mt-2 text-4xl font-black">{archivedRushees.length}</p>
        </div>

        <div className="space-y-5">
          {archivedRushees.length === 0 && (
            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600 shadow-sm">
              No archived rushees yet.
            </div>
          )}

          {archivedRushees.map((item) => {
            const rushee = item.rushees;

            if (!rushee) return null;

            return (
              <article
                key={item.rushee_id}
                className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm"
              >
                <div className="grid gap-5 md:grid-cols-[10rem_1fr_auto] md:items-start">
                  <div className="h-40 w-full overflow-hidden rounded-3xl bg-[#F0E8DA] md:h-40 md:w-40">
                    <img
                      src={rushee.photo || defaultPhoto}
                      alt={rushee.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">
                      #{rushee.number} {rushee.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600">
                      {rushee.major || "No major"} ·{" "}
                      {rushee.year || "No year"}
                      {rushee.gender ? ` · ${rushee.gender}` : ""}
                    </p>

                    <p className="mt-4 rounded-2xl bg-[#F6F1E8] p-4 text-sm leading-6 text-slate-700">
                      {rushee.application_summary || "No summary provided."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => moveBackToHashOne(rushee.id)}
                      disabled={saving}
                      className="rounded-full border border-[#071E34] px-5 py-2 text-sm font-bold text-[#071E34] disabled:opacity-50"
                    >
                      Restore
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRushee(rushee.id, rushee.name)}
                      disabled={saving}
                      className="rounded-full border border-[#8A1F2D] px-5 py-2 text-sm font-bold text-[#8A1F2D] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}