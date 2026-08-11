"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type RusheeStage =
  | "Hash #1"
  | "Hash #2"
  | "Hash #3"
  | "Final Hash #4"
  | "Bid / Accepted"
  | "Not Continuing"
  | "Archived";

type RusheeRow = {
  id: string;
  number: number;
  name: string;
  major: string | null;
  year: string | null;
  gender: string | null;
  photo: string | null;
  created_at: string;
};

type HashDecisionRow = {
  rushee_id: string;
  stage: RusheeStage;
  updated_at: string;
  rushees: RusheeRow | null;
};

type FeedbackRow = {
  id: string;
  rushee_id: string;
  brother_id: string;
  updated_at: string;
};

type RequiredFeedbackRow = {
  id: string;
  rushee_id: string;
  brother_id: string;
};

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

const stages: RusheeStage[] = [
  "Hash #1",
  "Hash #2",
  "Hash #3",
  "Final Hash #4",
  "Bid / Accepted",
  "Not Continuing",
  "Archived",
];

function getStageStyle(stage: RusheeStage) {
  if (stage === "Bid / Accepted") return "bg-[#EAF3EA] text-[#1F6B3A]";
  if (stage === "Not Continuing") return "bg-[#F5E8EA] text-[#8A1F2D]";
  if (stage === "Archived") return "bg-slate-100 text-slate-600";
  if (stage === "Final Hash #4") return "bg-[#FFF7E6] text-[#8A6500]";

  return "bg-[#F6F1E8] text-[#071E34]";
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [rusheeList, setRusheeList] = useState<RusheeRow[]>([]);
  const [hashDecisionList, setHashDecisionList] = useState<HashDecisionRow[]>(
    []
  );
  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>([]);
  const [requiredFeedbackList, setRequiredFeedbackList] = useState<
    RequiredFeedbackRow[]
  >([]);
  const [eventList, setEventList] = useState<EventRow[]>([]);

  const [loading, setLoading] = useState(true);
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
    await loadDashboard();
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        rusheesResponse,
        hashResponse,
        feedbackResponse,
        requiredResponse,
        eventsResponse,
      ] = await Promise.all([
        supabase
          .from("rushees")
          .select("id, number, name, major, year, gender, photo, created_at")
          .order("number", { ascending: true }),

        supabase
          .from("hash_decisions")
          .select(
            `
            rushee_id,
            stage,
            updated_at,
            rushees (
              id,
              number,
              name,
              major,
              year,
              gender,
              photo,
              created_at
            )
          `
          )
          .order("updated_at", { ascending: false }),

        supabase
          .from("feedback")
          .select("id, rushee_id, brother_id, updated_at")
          .order("updated_at", { ascending: false }),

        supabase
          .from("required_feedback")
          .select("id, rushee_id, brother_id"),

        supabase
          .from("events")
          .select("id, name, date, time, type")
          .order("created_at", { ascending: true }),
      ]);

      if (rusheesResponse.error) throw rusheesResponse.error;
      if (hashResponse.error) throw hashResponse.error;
      if (feedbackResponse.error) throw feedbackResponse.error;
      if (requiredResponse.error) throw requiredResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      setRusheeList((rusheesResponse.data || []) as RusheeRow[]);
      setHashDecisionList(
        (hashResponse.data || []) as unknown as HashDecisionRow[]
      );
      setFeedbackList((feedbackResponse.data || []) as FeedbackRow[]);
      setRequiredFeedbackList(
        (requiredResponse.data || []) as RequiredFeedbackRow[]
      );
      setEventList((eventsResponse.data || []) as EventRow[]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const stageByRusheeId = useMemo(() => {
    const map: Record<string, RusheeStage> = {};

    hashDecisionList.forEach((item) => {
      map[item.rushee_id] = item.stage;
    });

    return map;
  }, [hashDecisionList]);

  const counts = useMemo(() => {
    const countForStage = (stage: RusheeStage) =>
      rusheeList.filter(
        (rushee) => (stageByRusheeId[rushee.id] || "Hash #1") === stage
      ).length;

    return {
      totalRushees: rusheeList.length,
      hash1: countForStage("Hash #1"),
      hash2: countForStage("Hash #2"),
      hash3: countForStage("Hash #3"),
      finalHash: countForStage("Final Hash #4"),
      bid: countForStage("Bid / Accepted"),
      notContinuing: countForStage("Not Continuing"),
      archived: countForStage("Archived"),
      feedback: feedbackList.length,
      requiredFeedback: requiredFeedbackList.length,
      events: eventList.length,
    };
  }, [rusheeList, stageByRusheeId, feedbackList, requiredFeedbackList, eventList]);

  const recentHashChanges = hashDecisionList.slice(0, 5);

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <AdminNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading dashboard...
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

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Dashboard
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/rushees"
            className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">Total Rushees</p>
            <p className="mt-2 text-4xl font-black">{counts.totalRushees}</p>
            <p className="mt-3 text-sm font-bold text-[#071E34]">
              Manage rushees →
            </p>
          </a>

          <a
            href="/admin/feedback"
            className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">Feedback Notes</p>
            <p className="mt-2 text-4xl font-black">{counts.feedback}</p>
            <p className="mt-3 text-sm font-bold text-[#071E34]">
              View feedback →
            </p>
          </a>

          <a
            href="/admin/rushees"
            className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">Feedback Assign</p>
            <p className="mt-2 text-4xl font-black">
              {counts.requiredFeedback}
            </p>
            <p className="mt-3 text-sm font-bold text-[#071E34]">
              Assign required →
            </p>
          </a>

          <a
            href="/admin/events"
            className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">Events</p>
            <p className="mt-2 text-4xl font-black">{counts.events}</p>
            <p className="mt-3 text-sm font-bold text-[#071E34]">
              Manage events →
            </p>
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          {[
            ["Hash #1", counts.hash1],
            ["Hash #2", counts.hash2],
            ["Hash #3", counts.hash3],
            ["Final", counts.finalHash],
            ["Bid", counts.bid],
            ["Not Continuing", counts.notContinuing],
            ["Archived", counts.archived],
          ].map(([label, count]) => (
            <a
              key={String(label)}
              href="/admin/hash"
              className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black">{count}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Recent Hash Movement</h2>
                <p className="mt-1 text-sm text-slate-500">
                  
                </p>
              </div>

              <a
                href="/admin/hash"
                className="rounded-full bg-[#071E34] px-5 py-2 text-sm font-bold text-[#F6F1E8]"
              >
                Open Hash
              </a>
            </div>

            <div className="mt-5 space-y-3">
              {recentHashChanges.length === 0 && (
                <p className="rounded-2xl bg-[#F6F1E8] p-4 text-sm text-slate-600">
                  No hash movements yet.
                </p>
              )}

              {recentHashChanges.map((item) => {
                const rushee = item.rushees;

                if (!rushee) return null;

                return (
                  <article
                    key={item.rushee_id}
                    className="flex items-center gap-4 rounded-2xl border border-[#E5DDD0] p-4"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#F0E8DA]">
                      <img
                        src={rushee.photo || defaultPhoto}
                        alt={rushee.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black">
                        #{rushee.number} {rushee.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {rushee.major || "No major"} ·{" "}
                        {rushee.year || "No year"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStageStyle(
                        item.stage
                      )}`}
                    >
                      {item.stage}
                    </span>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Quick Actions</h2>

            <div className="mt-5 grid gap-3">
              <a
                href="/admin/rushees"
                className="rounded-2xl border border-[#E5DDD0] bg-[#F6F1E8] px-5 py-4 text-sm font-bold text-[#071E34]"
              >
                Add or edit rushees
              </a>

              <a
                href="/admin/events"
                className="rounded-2xl border border-[#E5DDD0] bg-[#F6F1E8] px-5 py-4 text-sm font-bold text-[#071E34]"
              >
                Manage events
              </a>

              <a
                href="/admin/feedback"
                className="rounded-2xl border border-[#E5DDD0] bg-[#F6F1E8] px-5 py-4 text-sm font-bold text-[#071E34]"
              >
                Review all feedback
              </a>

              <a
                href="/admin/hash"
                className="rounded-2xl border border-[#E5DDD0] bg-[#F6F1E8] px-5 py-4 text-sm font-bold text-[#071E34]"
              >
                Open Rush Decisions
              </a>

              <a
                href="/admin/archive"
                className="rounded-2xl border border-[#E5DDD0] bg-[#F6F1E8] px-5 py-4 text-sm font-bold text-[#071E34]"
              >
                View archive
              </a>
            </div>

          </section>
        </div>
      </section>
    </main>
  );
}