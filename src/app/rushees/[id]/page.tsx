"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BrotherNav from "@/app/components/BrotherNav";
import { supabase } from "@/lib/supabase";
import {
  getCurrentBrotherProfile,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

type RusheeEventRow = {
  events: EventRow | null;
};

type HashDecisionRow = {
  stage: string;
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
  assigned_brother_id: string | null;
  rushee_events?: RusheeEventRow[];
  hash_decisions?: HashDecisionRow[];
};

type FeedbackRow = {
  id: string;
  brother_id: string;
};

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

function getRusheeEvents(rushee: RusheeRow) {
  return (
    rushee.rushee_events
      ?.map((item) => item.events)
      .filter((event): event is EventRow => Boolean(event)) || []
  );
}

export default function RusheeProfilePage() {
  const params = useParams();
  const router = useRouter();

  const rusheeId = params.id as string;

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);
  const [rushee, setRushee] = useState<RusheeRow | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [hasMyFeedback, setHasMyFeedback] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRusheeProfile();
  }, [rusheeId]);

  async function loadRusheeProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const brother = await getCurrentBrotherProfile();

      if (!brother) {
        router.push("/");
        return;
      }

      setCurrentBrother(brother);

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
          application_summary,
          assigned_brother_id,
          rushee_events (
            events (
              id,
              name,
              date,
              time,
              type
            )
          ),
          hash_decisions (
            stage
          )
        `
        )
        .eq("id", rusheeId)
        .single();

      if (rusheeError) {
        throw rusheeError;
      }

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, brother_id")
        .eq("rushee_id", rusheeId);

      if (feedbackError) {
        throw feedbackError;
      }

      const feedbackRows = (feedbackData || []) as FeedbackRow[];

      setRushee(rusheeData as unknown as RusheeRow);
      setReviewCount(feedbackRows.length);
      setHasMyFeedback(
        feedbackRows.some((item) => item.brother_id === brother.id)
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load rushee profile.");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <BrotherNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading rushee profile...
          </div>
        </section>
      </main>
    );
  }

  if (!rushee) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <BrotherNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            {errorMessage || "Rushee not found."}
          </div>
        </section>
      </main>
    );
  }

  const events = getRusheeEvents(rushee);
  const stage = rushee.hash_decisions?.[0]?.stage || "Hash #1";

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <BrotherNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Rushee Profile
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            #{rushee.number} {rushee.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
            {rushee.major || "No major"} · {rushee.year || "No year"}
            {rushee.gender ? ` · ${rushee.gender}` : ""}
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-3xl bg-[#F0E8DA]">
              <img
                src={rushee.photo || defaultPhoto}
                alt={rushee.name}
                className="h-96 w-full object-cover object-center"
              />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-[#F6F1E8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Current Stage
                </p>
                <p className="mt-2 text-lg font-black">{stage}</p>
              </div>

              <div className="rounded-2xl bg-[#F6F1E8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total Reviews
                </p>
                <p className="mt-2 text-lg font-black">{reviewCount}</p>
              </div>

              <div className="rounded-2xl bg-[#F6F1E8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  My Note
                </p>
                <p className="mt-2 text-lg font-black">
                  {hasMyFeedback ? "Submitted" : "Not submitted"}
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-black">{rushee.name}</h2>

            <p className="mt-3 text-lg text-slate-600">
              #{rushee.number} · {rushee.major || "No major"} ·{" "}
              {rushee.year || "No year"}
              {rushee.gender ? ` · ${rushee.gender}` : ""}
            </p>

            <div className="mt-6 rounded-2xl bg-[#F6F1E8] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Application Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {rushee.application_summary || "No summary provided."}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E5DDD0] p-4">
              <p className="text-sm font-black">Events Attended</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {events.length === 0 && (
                  <p className="text-sm text-slate-600">No events yet.</p>
                )}

                {events.map((event) => (
                  <span
                    key={event.id}
                    className="rounded-full bg-[#F6F1E8] px-4 py-2 text-xs font-bold text-[#071E34]"
                  >
                    {event.name}
                    {event.date ? ` · ${event.date}` : ""}
                    {event.time ? ` · ${event.time}` : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/rush-board"
                className="rounded-full border border-[#071E34] px-6 py-3 text-center text-sm font-bold text-[#071E34]"
              >
                Back to Rush Board
              </a>

              <a
                href={`/feedback/${rushee.id}`}
                className="rounded-full bg-[#071E34] px-6 py-3 text-center text-sm font-bold text-[#F6F1E8]"
              >
                {hasMyFeedback ? "Edit Note" : "Give Feedback"}
              </a>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}