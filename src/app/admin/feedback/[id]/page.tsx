"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
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
};

type FeedbackRow = {
  id: string;
  rushee_id: string;
  brother_id: string;
  communication: number;
  passion: number;
  fit_add_choice: "Fit" | "Add" | "Neither";
  fit_add_score: number;
  comment: string | null;
};

type FeedbackEventRow = {
  events: {
    name: string;
  } | null;
};

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

export default function AdminFeedbackNotePage() {
  const params = useParams();
  const router = useRouter();

  const rusheeId = params.id as string;

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [rushee, setRushee] = useState<RusheeRow | null>(null);
  const [eventList, setEventList] = useState<EventRow[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const [communication, setCommunication] = useState(3);
  const [passion, setPassion] = useState(3);
  const [fitAddChoice, setFitAddChoice] = useState<"Fit" | "Add" | "Neither">(
    "Fit"
  );
  const [fitAddScore, setFitAddScore] = useState(3);
  const [comment, setComment] = useState("");

  const [existingFeedbackId, setExistingFeedbackId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadFeedbackPage();
  }, [rusheeId]);

  async function loadFeedbackPage() {
    try {
      setLoading(true);
      setErrorMessage("");

      const admin = await requireAdmin();

      if (!admin) {
        router.push("/");
        return;
      }

      setCurrentBrother(admin);

      const { data: rusheeData, error: rusheeError } = await supabase
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
          application_summary
        `
        )
        .eq("id", rusheeId)
        .single();

      if (rusheeError) {
        throw rusheeError;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, name, date, time, type")
        .order("created_at", { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select(
          `
          id,
          rushee_id,
          brother_id,
          communication,
          passion,
          fit_add_choice,
          fit_add_score,
          comment
        `
        )
        .eq("rushee_id", rusheeId)
        .eq("brother_id", admin.id)
        .maybeSingle();

      if (feedbackError) {
        throw feedbackError;
      }

      setRushee(rusheeData as RusheeRow);
      setEventList((eventsData || []) as EventRow[]);

      if (feedbackData) {
        const existing = feedbackData as FeedbackRow;

        setExistingFeedbackId(existing.id);
        setCommunication(existing.communication);
        setPassion(existing.passion);
        setFitAddChoice(existing.fit_add_choice);
        setFitAddScore(existing.fit_add_score);
        setComment(existing.comment || "");

        const { data: feedbackEventsData, error: feedbackEventsError } =
          await supabase
            .from("feedback_events")
            .select(
              `
              events (
                name
              )
            `
            )
            .eq("feedback_id", existing.id);

        if (feedbackEventsError) {
          throw feedbackEventsError;
        }

        const existingEventNames =
          ((feedbackEventsData || []) as unknown as FeedbackEventRow[])
            .map((item) => item.events?.name)
            .filter((name): name is string => Boolean(name));

        setSelectedEvents(existingEventNames);
      } else {
        setExistingFeedbackId(null);
        setSelectedEvents([]);
        setCommunication(3);
        setPassion(3);
        setFitAddChoice("Fit");
        setFitAddScore(3);
        setComment("");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load admin note page.");
    } finally {
      setLoading(false);
    }
  }

  function toggleEvent(eventName: string) {
    if (selectedEvents.includes(eventName)) {
      setSelectedEvents(selectedEvents.filter((event) => event !== eventName));
      return;
    }

    setSelectedEvents([...selectedEvents, eventName]);
  }

  async function syncFeedbackEvents(feedbackId: string) {
    const { error: deleteError } = await supabase
      .from("feedback_events")
      .delete()
      .eq("feedback_id", feedbackId);

    if (deleteError) {
      throw deleteError;
    }

    const selectedEventIds = eventList
      .filter((event) => selectedEvents.includes(event.name))
      .map((event) => event.id);

    if (selectedEventIds.length === 0) {
      return;
    }

    const rows = selectedEventIds.map((eventId) => ({
      feedback_id: feedbackId,
      event_id: eventId,
    }));

    const { error: insertError } = await supabase
      .from("feedback_events")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  async function saveFeedback() {
    if (!rushee || !currentBrother) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const finalFitAddScore = fitAddChoice === "Neither" ? 0 : fitAddScore;

      const payload = {
        rushee_id: rushee.id,
        brother_id: currentBrother.id,
        communication,
        passion,
        fit_add_choice: fitAddChoice,
        fit_add_score: finalFitAddScore,
        comment,
        updated_at: new Date().toISOString(),
      };

      let feedbackId = existingFeedbackId;

      if (existingFeedbackId) {
        const { error } = await supabase
          .from("feedback")
          .update(payload)
          .eq("id", existingFeedbackId);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("feedback")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        feedbackId = data.id;
      }

      if (!feedbackId) {
        throw new Error("No feedback ID found after save.");
      }

      await syncFeedbackEvents(feedbackId);

      router.push("/admin/hash");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save admin note.");
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
            Loading admin note...
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

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <AdminNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Admin
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            {existingFeedbackId ? "Edit Admin Note" : "Leave Admin Note"}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
            Logged in as {currentBrother.name}. Submit your admin note for{" "}
            {rushee.name}.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
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
                className="h-80 w-full object-cover object-center"
              />
            </div>

            <div className="mt-5">
              <h2 className="text-3xl font-black">
                #{rushee.number} {rushee.name}
              </h2>

              <p className="mt-2 text-base text-slate-600">
                {rushee.major || "No major"} · {rushee.year || "No year"}
                {rushee.gender ? ` · ${rushee.gender}` : ""}
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F6F1E8] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Application Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {rushee.application_summary || "No summary provided."}
              </p>
            </div>
          </aside>

          <section className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-black">Events Talked At</h3>

              <p className="mt-1 text-sm text-slate-500">
                Select every event where you interacted with this rushee.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {eventList.map((event) => {
                  const isSelected = selectedEvents.includes(event.name);

                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => toggleEvent(event.name)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold ${
                        isSelected
                          ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                          : "border-[#071E34] bg-white text-[#071E34] hover:bg-[#F6F1E8]"
                      }`}
                    >
                      {isSelected ? "✓ " : ""}
                      {event.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="rounded-2xl bg-[#F6F1E8] p-4">
                <span className="text-sm font-black">Communication</span>
                <select
                  value={communication}
                  onChange={(event) =>
                    setCommunication(Number(event.target.value))
                  }
                  className="mt-3 w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-3 text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl bg-[#F6F1E8] p-4">
                <span className="text-sm font-black">Passion</span>
                <select
                  value={passion}
                  onChange={(event) => setPassion(Number(event.target.value))}
                  className="mt-3 w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-3 text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>

            </div>

            <div className="mt-8 rounded-2xl bg-[#F6F1E8] p-4">
              <h3 className="text-lg font-black">Fit / Add</h3>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {(["Fit", "Add", "Neither"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setFitAddChoice(choice)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                      fitAddChoice === choice
                        ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                        : "border-[#071E34] bg-white text-[#071E34] hover:bg-[#F6F1E8]"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              {fitAddChoice !== "Neither" && (
                <label className="mt-4 block text-sm font-bold">
                  Fit/Add Score
                  <select
                    value={fitAddScore}
                    onChange={(event) =>
                      setFitAddScore(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-3 text-sm font-normal outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {fitAddChoice === "Neither" && (
                <p className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600">
                  Fit/Add score will automatically save as 0.
                </p>
              )}
            </div>

            <label className="mt-8 block">
              <span className="text-lg font-black">Comment</span>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a specific admin note that would help during hash..."
                className="mt-3 min-h-36 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-4 text-sm leading-6 outline-none"
              />
            </label>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/hash")}
                disabled={saving}
                className="rounded-full border border-[#071E34] px-6 py-3 text-sm font-bold text-[#071E34] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveFeedback}
                disabled={saving}
                className="rounded-full bg-[#071E34] px-6 py-3 text-sm font-bold text-[#F6F1E8] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Admin Note"}
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}