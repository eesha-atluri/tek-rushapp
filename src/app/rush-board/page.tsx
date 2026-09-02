"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrotherNav from "@/app/components/BrotherNav";
import { supabase } from "@/lib/supabase";
import {
  getCurrentBrotherProfile,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type FilterType = "Required Feedback" | "All Rushees" | "Reviewed";

type FeedbackRow = {
  id: string;
  rushee_id: string;
  brother_id: string;
};

type HashDecisionRow = {
  rushee_id: string;
  stage: string;
};

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

type RusheeEventRow = {
  events: EventRow | EventRow[] | null;
};

type RequiredFeedbackRow = {
  brother_id: string;
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
  required_feedback?: RequiredFeedbackRow[] | RequiredFeedbackRow | null;
};

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

function toArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getRusheeEvents(rushee: RusheeRow) {
  return toArray(rushee.rushee_events)
    .flatMap((item) => toArray(item.events))
    .filter((event): event is EventRow => Boolean(event));
}

function isHiddenStage(stage: string) {
  return stage === "Archived" || stage === "Not Continuing";
}

export default function RushBoardPage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [rusheeList, setRusheeList] = useState<RusheeRow[]>([]);
  const [myFeedback, setMyFeedback] = useState<FeedbackRow[]>([]);
  const [stages, setStages] = useState<Record<string, string>>({});

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>("Required Feedback");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRushBoard();
  }, []);

  async function loadRushBoard() {
    try {
      setLoading(true);
      setErrorMessage("");

      const brother = await getCurrentBrotherProfile();

      if (!brother) {
        router.push("/");
        return;
      }

      setCurrentBrother(brother);

      const { data: rusheesData, error: rusheesError } = await supabase
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
          required_feedback (
            brother_id
          ),
          rushee_events (
            events (
              id,
              name,
              date,
              time,
              type
            )
          )
        `
        )
        .order("number", { ascending: true });

      if (rusheesError) {
        throw rusheesError;
      }

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, rushee_id, brother_id");

      if (feedbackError) {
        throw feedbackError;
      }

      const { data: stagesData, error: stagesError } = await supabase
        .from("hash_decisions")
        .select("rushee_id, stage");

      if (stagesError) {
        throw stagesError;
      }

      const stageMap: Record<string, string> = {};

      (stagesData as HashDecisionRow[]).forEach((item) => {
        stageMap[item.rushee_id] = item.stage;
      });

      setRusheeList((rusheesData || []) as unknown as RusheeRow[]);
      setMyFeedback((feedbackData || []) as FeedbackRow[]);
      setStages(stageMap);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load rush board from Supabase.");
    } finally {
      setLoading(false);
    }
  }

  function hasMyFeedback(rusheeId: string) {
    if (!currentBrother) return false;

    return myFeedback.some(
      (item) =>
        item.rushee_id === rusheeId && item.brother_id === currentBrother.id
    );
  }

  function isRequiredFeedbackForMe(rushee: RusheeRow) {
    if (!currentBrother) return false;

    return toArray(rushee.required_feedback).some(
      (item) => item.brother_id === currentBrother.id
    );
  }

  const visibleRushees = useMemo(() => {
    return rusheeList.filter((rushee) => {
      const stage = stages[rushee.id] || "Hash #1";
      return !isHiddenStage(stage);
    });
  }, [rusheeList, stages]);

  const filteredRushees = useMemo(() => {
    return visibleRushees.filter((rushee) => {
      const query = search.toLowerCase();

      const events = getRusheeEvents(rushee);
      const eventNames = events.map((event) => event.name).join(" ");

      const matchesSearch =
        rushee.name.toLowerCase().includes(query) ||
        String(rushee.number).includes(query) ||
        (rushee.major || "").toLowerCase().includes(query) ||
        (rushee.year || "").toLowerCase().includes(query) ||
        eventNames.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (selectedFilter === "Required Feedback") {
        return isRequiredFeedbackForMe(rushee);
      }

      if (selectedFilter === "Reviewed") {
        return hasMyFeedback(rushee.id);
      }

      return true;
    });
  }, [visibleRushees, search, selectedFilter, myFeedback, currentBrother]);

  const requiredCount = visibleRushees.filter((rushee) =>
    isRequiredFeedbackForMe(rushee)
  ).length;

  const reviewedCount = visibleRushees.filter((rushee) =>
    hasMyFeedback(rushee.id)
  ).length;

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <BrotherNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading rush board...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <BrotherNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Brother View
          </p>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black tracking-tight">
                Rush Board
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
                Logged in as {currentBrother.name}. Please fill out required feedback!
              </p>
            </div>

            <div className="w-full max-w-md">
              <label className="text-xs font-bold uppercase tracking-wide text-white/60">
                Search
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, number, major, event..."
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-4 text-sm text-[#071E34] outline-none"
              />
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
              <p className="text-4xl font-black">{requiredCount}</p>
              <p className="mt-1 text-sm text-slate-500">Required</p>
            </div>

            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
              <p className="text-4xl font-black">{visibleRushees.length}</p>
              <p className="mt-1 text-sm text-slate-500">All Active</p>
            </div>

            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
              <p className="text-4xl font-black text-[#1F6B3A]">
                {reviewedCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Reviewed</p>
            </div>
          </div>

          <label className="block min-w-72 text-sm font-bold">
            Filter
            <select
              value={selectedFilter}
              onChange={(event) =>
                setSelectedFilter(event.target.value as FilterType)
              }
              className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-4 text-sm font-normal outline-none"
            >
              <option>Required Feedback</option>
              <option>All Rushees</option>
              <option>Reviewed</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredRushees.length === 0 && (
            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600 shadow-sm">
              No rushees match this view.
            </div>
          )}

          {filteredRushees.map((rushee) => {
            const reviewed = hasMyFeedback(rushee.id);
            const required = isRequiredFeedbackForMe(rushee);
            const events = getRusheeEvents(rushee);

            return (
              <article
                key={rushee.id}
                className="rounded-3xl border border-[#E5DDD0] bg-white p-7 shadow-sm"
              >
                <div className="grid gap-6 sm:grid-cols-[14rem_1fr]">
                  <div className="h-64 w-full overflow-hidden rounded-3xl bg-[#F0E8DA] sm:h-56 sm:w-56">
                    <img
                      src={rushee.photo || defaultPhoto}
                      alt={rushee.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-3xl font-black">
                          #{rushee.number} {rushee.name}
                        </h2>

                        <p className="mt-2 text-base text-slate-600">
                          {rushee.major || "No major"} ·{" "}
                          {rushee.year || "No year"}
                          {rushee.gender ? ` · ${rushee.gender}` : ""}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${
                          reviewed
                            ? "bg-[#EAF3EA] text-[#1F6B3A]"
                            : "bg-[#F6F1E8] text-[#071E34]"
                        }`}
                      >
                        {reviewed ? "Reviewed" : "Not Reviewed"}
                      </span>
                    </div>

                    {required && (
                      <p className="mt-4 rounded-2xl bg-[#FFF7E6] px-4 py-3 text-sm font-bold text-[#8A6500]">
                        Required feedback for you
                      </p>
                    )}

                    <p className="mt-5 text-sm leading-6 text-slate-600">
                      Seen at:{" "}
                      {events.length > 0
                        ? events.map((event) => event.name).join(", ")
                        : "No events yet"}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        Stage: {stages[rushee.id] || "Hash #1"}
                      </p>

                      <div className="flex gap-2">
                        <a
                          href={`/rushees/${rushee.id}`}
                          className="rounded-full border border-[#071E34] px-5 py-3 text-sm font-bold text-[#071E34]"
                        >
                          View
                        </a>

                        <a
                          href={`/feedback/${rushee.id}`}
                          className="rounded-full bg-[#071E34] px-5 py-3 text-sm font-bold text-[#F6F1E8]"
                        >
                          {reviewed ? "Edit Note" : "Give Feedback"}
                        </a>
                      </div>
                    </div>
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