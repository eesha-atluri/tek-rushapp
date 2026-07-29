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

    // Hide people removed by admin from brother voting flow
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

      <header className="bg-[#061A33] px-5 py-8 text-white">
        <section className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C49A45]">
            Brother View
          </p>

          <h1 className="mt-2 text-3xl font-extrabold">Rush Board</h1>

          <p className="mt-2 text-sm leading-6 text-white/70">
            Find who still needs your notes and move through feedback quickly.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            {visibleRushees.length} total rushee
            {visibleRushees.length === 1 ? "" : "s"} · {votedCount} reviewed ·{" "}
            {needVoteCount} left
          </p>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, number, major..."
            className="mt-4 w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm outline-none"
          />

          <div className="mt-4 flex gap-2 overflow-x-auto">
            {["All", "Need My Vote", "Reviewed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as FilterType)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                  selectedFilter === filter
                    ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
                    : "border-[#E5E0D8] bg-white text-[#061A33] hover:bg-[#F4F1EA]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredRushees.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
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
              <div
                key={rushee.id}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <img
                    src={rushee.photo}
                    alt={rushee.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-extrabold">
                          #{rushee.number} {rushee.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                          {rushee.major || "No major"} ·{" "}
                          {rushee.year || "No year"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          hasMyFeedback
                            ? "bg-[#EAF3EA] text-[#1F6B3A]"
                            : "bg-[#F4F1EA] text-[#061A33]"
                        }`}
                      >
                        {hasMyFeedback ? "Reviewed" : "Needs Note"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                      Seen at:{" "}
                      {rushee.events.length > 0
                        ? rushee.events.join(", ")
                        : "No events yet"}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">
                        {reviewCount} review{reviewCount === 1 ? "" : "s"}
                      </p>

                      <div className="flex gap-2">
                        <a
                          href={`/rushees/${rushee.id}`}
                          className="rounded-full border border-[#061A33] px-4 py-2 text-xs font-bold text-[#061A33]"
                        >
                          View
                        </a>

                        <a
                          href={`/feedback/${rushee.id}`}
                          className="rounded-full bg-[#061A33] px-4 py-2 text-xs font-bold text-[#F4F1EA]"
                        >
                          {hasMyFeedback ? "Edit Note" : "Leave Note"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}