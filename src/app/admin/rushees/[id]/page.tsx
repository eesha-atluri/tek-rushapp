"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type BrotherRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "brother";
};

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

type EventAssignmentRow = {
  brother_id: string;
  brothers: BrotherRow | BrotherRow[] | null;
};

type RusheeEventRow = {
  events: (EventRow & {
    event_assignments?: EventAssignmentRow[] | EventAssignmentRow | null;
  }) | (EventRow & {
    event_assignments?: EventAssignmentRow[] | EventAssignmentRow | null;
  })[] | null;
};

type FeedbackEventRow = {
  events: EventRow | EventRow[] | null;
};

type FeedbackRow = {
  id: string;
  brother_id: string;
  communication: number;
  passion: number;
  fit_add_choice: "Fit" | "Add" | "Neither";
  fit_add_score: number;
  comment: string | null;
  updated_at: string;
  brothers: BrotherRow | BrotherRow[] | null;
  feedback_events?: FeedbackEventRow[] | FeedbackEventRow | null;
};

type HashDecisionRow = {
  stage: RusheeStage;
};

type RusheeRow = {
  id: string;
  number: number;
  name: string;
  major: string | null;
  year: string | null;
  gender: string | null;
  photo: string | null;
  application_summary: string | null;
  rushee_events?: RusheeEventRow[] | RusheeEventRow | null;
  feedback?: FeedbackRow[] | FeedbackRow | null;
  hash_decisions?: HashDecisionRow[] | HashDecisionRow | null;
};

const stages: RusheeStage[] = [
  "Hash #1",
  "Hash #2",
  "Hash #3",
  "Final Hash #4",
  "Bid / Accepted",
  "Not Continuing",
  "Archived",
];

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

function toArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getRusheeStage(rushee: RusheeRow): RusheeStage {
  const decision = rushee.hash_decisions;

  if (!decision) return "Hash #1";

  if (Array.isArray(decision)) {
    return decision[0]?.stage || "Hash #1";
  }

  return decision.stage || "Hash #1";
}

function getRusheeEvents(rushee: RusheeRow) {
  return toArray(rushee.rushee_events)
    .flatMap((item) => toArray(item.events))
    .filter((event): event is EventRow & {
      event_assignments?: EventAssignmentRow[] | EventAssignmentRow | null;
    } => Boolean(event));
}

function getRusheeFeedback(rushee: RusheeRow) {
  return toArray(rushee.feedback);
}

function getFeedbackBrother(feedback: FeedbackRow) {
  return toArray(feedback.brothers)[0] || null;
}

function getFeedbackEvents(feedback: FeedbackRow) {
  return toArray(feedback.feedback_events)
    .flatMap((item) => toArray(item.events))
    .filter((event): event is EventRow => Boolean(event));
}

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

function getStageStyle(stage: RusheeStage) {
  if (stage === "Bid / Accepted") return "bg-[#EAF3EA] text-[#1F6B3A]";
  if (stage === "Not Continuing") return "bg-[#F5E8EA] text-[#8A1F2D]";
  if (stage === "Archived") return "bg-slate-100 text-slate-600";
  if (stage === "Final Hash #4") return "bg-[#FFF7E6] text-[#8A6500]";

  return "bg-[#F6F1E8] text-[#071E34]";
}

function getEventBrotherNames(event: {
  event_assignments?: EventAssignmentRow[] | EventAssignmentRow | null;
}) {
  const names = toArray(event.event_assignments)
    .flatMap((assignment) => toArray(assignment.brothers))
    .map((brother) => brother.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "No brothers assigned";
}

export default function AdminRusheeProfilePage() {
  const params = useParams();
  const router = useRouter();

  const rusheeId = params.id as string;

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [rushee, setRushee] = useState<RusheeRow | null>(null);
  const [stage, setStage] = useState<RusheeStage>("Hash #1");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, [rusheeId]);

  async function checkAuthAndLoad() {
    const admin = await requireAdmin();

    if (!admin) {
      router.push("/");
      return;
    }

    setCurrentBrother(admin);
    await loadPageData();
  }

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("rushees")
        .select(
          `
          id,
          number,
          name,
          major,
          year,
          gender,
          photo,
          application_summary,
          rushee_events (
            events (
              id,
              name,
              date,
              time,
              type,
              event_assignments (
                brother_id,
                brothers (
                  id,
                  name,
                  email,
                  role
                )
              )
            )
          ),
          feedback (
            id,
            brother_id,
            communication,
            passion,
            fit_add_choice,
            fit_add_score,
            comment,
            updated_at,
            brothers (
              id,
              name,
              email,
              role
            ),
            feedback_events (
              events (
                id,
                name,
                date,
                time,
                type
              )
            )
          ),
          hash_decisions (
            stage
          )
        `
        )
        .eq("id", rusheeId)
        .single();

      if (error) throw error;

      const loadedRushee = data as unknown as RusheeRow;

      setRushee(loadedRushee);
      setStage(getRusheeStage(loadedRushee));
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load admin rushee profile.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStage(nextStage: RusheeStage) {
    if (!rushee) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const { error } = await supabase.from("hash_decisions").upsert(
        {
          rushee_id: rushee.id,
          stage: nextStage,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "rushee_id",
        }
      );

      if (error) throw error;

      setStage(nextStage);
      await loadPageData();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not update stage.");
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
            Loading admin profile...
          </div>
        </section>
      </main>
    );
  }

  if (!rushee) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <AdminNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            {errorMessage || "Rushee not found."}
          </div>
        </section>
      </main>
    );
  }

  const events = getRusheeEvents(rushee);
  const feedback = getRusheeFeedback(rushee);

  const communicationAvg = getAverage(
    feedback.map((item) => item.communication)
  );
  const passionAvg = getAverage(feedback.map((item) => item.passion));
  const fitAddAvg = getAverage(feedback.map((item) => item.fit_add_score));

  const fitCount = feedback.filter(
    (item) => item.fit_add_choice === "Fit"
  ).length;
  const addCount = feedback.filter(
    (item) => item.fit_add_choice === "Add"
  ).length;
  const neitherCount = feedback.filter(
    (item) => item.fit_add_choice === "Neither"
  ).length;

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <AdminNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Admin Profile
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            #{rushee.number} {rushee.name}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            {rushee.major || "No major"} · {rushee.year || "No year"}
            {rushee.gender ? ` · ${rushee.gender}` : ""}
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-3xl bg-[#F0E8DA]">
              <img
                src={rushee.photo || defaultPhoto}
                alt={rushee.name}
                className="h-96 w-full object-cover object-center"
              />
            </div>

            <div className="mt-5 grid gap-5">
              <label className="text-sm font-bold">
                Current Stage
                <select
                  value={stage}
                  onChange={(event) =>
                    updateStage(event.target.value as RusheeStage)
                  }
                  disabled={saving}
                  className={`mt-2 w-full rounded-2xl border border-[#E5DDD0] px-4 py-3 text-sm font-bold outline-none disabled:opacity-50 ${getStageStyle(
                    stage
                  )}`}
                >
                  {stages.map((stageOption) => (
                    <option key={stageOption}>{stageOption}</option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl bg-[#F6F1E8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Brother Coverage
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Brother coverage is handled through event assignments. If a
                  brother is assigned to an event this rushee attended, they
                  will see this rushee under Assigned To Me.
                </p>

                <a
                  href="/admin/events"
                  className="mt-4 inline-block rounded-full bg-[#071E34] px-5 py-2 text-sm font-bold text-[#F6F1E8]"
                >
                  Manage Event Assignments
                </a>
              </div>

              <div className="rounded-2xl bg-[#F6F1E8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Events Attended
                </p>

                <div className="mt-3 grid gap-3">
                  {events.length === 0 && (
                    <p className="text-sm text-slate-600">No events yet.</p>
                  )}

                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-white p-4 text-sm"
                    >
                      <p className="font-black text-[#071E34]">{event.name}</p>

                      <p className="mt-1 text-slate-600">
                        {event.date || "No date"} · {event.time || "No time"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Brothers assigned to event:{" "}
                        <span className="font-bold text-[#071E34]">
                          {getEventBrotherNames(event)}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
<a
  href={`/admin/feedback/${rushee.id}`}
  className="rounded-full bg-[#071E34] px-5 py-3 text-center text-sm font-bold text-[#F6F1E8]"
>
  Leave Admin Note
</a>
              <a
                href="/admin/rushees"
                className="rounded-full border border-[#071E34] px-5 py-3 text-center text-sm font-bold text-[#071E34]"
              >
                Back to Rushees
              </a>
            </div>
          </aside>

          <section>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black">{communicationAvg}</p>
                <p className="text-xs text-slate-500">Comm</p>
              </div>

              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black">{passionAvg}</p>
                <p className="text-xs text-slate-500">Passion</p>
              </div>


              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black">{fitAddAvg}</p>
                <p className="text-xs text-slate-500">Fit/Add</p>
              </div>

              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black">{feedback.length}</p>
                <p className="text-xs text-slate-500">Reviews</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black text-[#1F6B3A]">
                  {fitCount}
                </p>
                <p className="text-xs text-slate-500">Fit</p>
              </div>

              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black text-[#071E34]">
                  {addCount}
                </p>
                <p className="text-xs text-slate-500">Add</p>
              </div>

              <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-black text-slate-600">
                  {neitherCount}
                </p>
                <p className="text-xs text-slate-500">Neither</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Application Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {rushee.application_summary || "No summary provided."}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {feedback.length === 0 && (
                <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600 shadow-sm">
                  No feedback submitted yet.
                </div>
              )}

              {feedback.map((item) => {
                const brother = getFeedbackBrother(item);
                const feedbackEvents = getFeedbackEvents(item);

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Submitted by</p>
                        <h2 className="text-xl font-black">
                          {brother?.name || "Unknown Brother"}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Last updated:{" "}
                          {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="rounded-full bg-[#F6F1E8] px-4 py-2 text-xs font-bold">
                        {item.fit_add_choice} · {item.fit_add_score}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">
                          {item.communication}
                        </p>
                        <p className="text-xs text-slate-500">Comm</p>
                      </div>

                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">{item.passion}</p>
                        <p className="text-xs text-slate-500">Passion</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#E5DDD0] p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Events Talked At
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {feedbackEvents.length === 0 && (
                          <p className="text-sm text-slate-600">
                            No events selected.
                          </p>
                        )}

                        {feedbackEvents.map((event) => (
                          <span
                            key={event.id}
                            className="rounded-full bg-[#F6F1E8] px-4 py-2 text-xs font-bold text-[#071E34]"
                          >
                            {event.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#F6F1E8] p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Comment
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.comment || "No comment provided."}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}