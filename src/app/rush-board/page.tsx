"use client";

import { useEffect, useState } from "react";
import BrotherNav from "@/app/components/BrotherNav";
import { feedback } from "@/lib/mockData";
import { getStoredRushees, type Rushee } from "@/lib/rusheeStorage";

type SavedFeedback = {
  id: string;
  rusheeId: string;
  rusheeName: string;
  rusheeNumber: number;
  events: string[];
  communication: number;
  passion: number;
  cultureFit: number;
  fitAddChoice: string;
  fitAddScore: number;
  comment: string;
};

type FilterType = "All" | "Need My Vote" | "Reviewed";

export default function RushBoardPage() {
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);
  const [stages, setStages] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  useEffect(() => {
    setRusheeList(getStoredRushees());

    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);

    const savedStagesString = localStorage.getItem("tek-rushee-stages");

    const savedStages: Record<string, string> = savedStagesString
      ? JSON.parse(savedStagesString)
      : {};

    setStages(savedStages);
  }, []);

  const visibleRushees = rusheeList.filter((rushee) => {
    const stage = stages[rushee.id];

    if (stage === "Archived" || stage === "Not Continuing") {
      return false;
    }

    return true;
  });

  const filteredRushees = visibleRushees.filter((rushee) => {
    const query = search.toLowerCase();

    const hasMyFeedback = allFeedback.some(
      (item) => item.rusheeId === rushee.id
    );

    const matchesSearch =
      rushee.name.toLowerCase().includes(query) ||
      rushee.major.toLowerCase().includes(query) ||
      rushee.year.toLowerCase().includes(query) ||
      String(rushee.number).includes(query);

    if (!matchesSearch) return false;

    if (selectedFilter === "Need My Vote") return !hasMyFeedback;
    if (selectedFilter === "Reviewed") return hasMyFeedback;

    return true;
  });

  const votedCount = visibleRushees.filter((rushee) =>
    allFeedback.some((item) => item.rusheeId === rushee.id)
  ).length;

  const needVoteCount = visibleRushees.length - votedCount;

  return (
    <main className="min-h-screen bg-[#F4F1EA] pb-20 text-[#061A33]">
      <BrotherNav />

      <header className="bg-[#061A33] px-6 py-10 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C49A45]">
            Brother View
          </p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Rush Board
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
                See who still needs your notes and move through feedback faster.
              </p>
            </div>

            <div className="w-full max-w-md">
              <label className="text-xs font-bold uppercase tracking-wide text-white/60">
                Search
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, number, major..."
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-4 text-sm text-[#061A33] outline-none"
              />
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <p className="text-4xl font-extrabold">{visibleRushees.length}</p>
              <p className="mt-1 text-sm text-slate-500">Total</p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <p className="text-4xl font-extrabold text-[#1F6B3A]">
                {votedCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Reviewed</p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <p className="text-4xl font-extrabold">{needVoteCount}</p>
              <p className="mt-1 text-sm text-slate-500">Left</p>
            </div>
          </div>

          <label className="block min-w-72 text-sm font-bold">
            Filter
            <select
              value={selectedFilter}
              onChange={(event) =>
                setSelectedFilter(event.target.value as FilterType)
              }
              className="mt-2 w-full rounded-2xl border border-[#E5E0D8] bg-white px-4 py-4 text-sm font-normal outline-none"
            >
              <option>All</option>
              <option>Need My Vote</option>
              <option>Reviewed</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredRushees.length === 0 && (
            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 text-sm text-slate-600 shadow-sm">
              No rushees match this view.
            </div>
          )}

          {filteredRushees.map((rushee) => {
            const hasMyFeedback = allFeedback.some(
              (item) => item.rusheeId === rushee.id
            );

            const reviewCount = allFeedback.filter(
              (item) => item.rusheeId === rushee.id
            ).length;

            return (
              <article
                key={rushee.id}
                className="rounded-3xl border border-[#E5E0D8] bg-white p-7 shadow-sm"
              >
                <div className="grid gap-6 sm:grid-cols-[12rem_1fr] lg:grid-cols-[14rem_1fr]">
                  <div className="shrink-0 overflow-hidden rounded-3xl bg-[#F0E8DA] sm:h-48 sm:w-48 lg:h-56 lg:w-56">
  <img
    src={rushee.photo}
    alt={rushee.name}
    className="h-full w-full object-cover object-center"
  />
</div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-3xl font-extrabold">
                          #{rushee.number} {rushee.name}
                        </h2>

                        <p className="mt-2 text-base text-slate-600">
                          {rushee.major || "No major"} ·{" "}
                          {rushee.year || "No year"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${
                          hasMyFeedback
                            ? "bg-[#EAF3EA] text-[#1F6B3A]"
                            : "bg-[#F4F1EA] text-[#061A33]"
                        }`}
                      >
                        {hasMyFeedback ? "Reviewed" : "Needs Note"}
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-600">
                      Seen at:{" "}
                      {rushee.events.length > 0
                        ? rushee.events.join(", ")
                        : "No events yet"}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        {reviewCount} review{reviewCount === 1 ? "" : "s"}
                      </p>

                      <div className="flex gap-2">
                        <a
                          href={`/rushees/${rushee.id}`}
                          className="rounded-full border border-[#061A33] px-5 py-3 text-sm font-bold text-[#061A33]"
                        >
                          View
                        </a>

                        <a
                          href={`/feedback/${rushee.id}`}
                          className="rounded-full bg-[#061A33] px-5 py-3 text-sm font-bold text-[#F4F1EA]"
                        >
                          {hasMyFeedback ? "Edit Note" : "Leave Note"}
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