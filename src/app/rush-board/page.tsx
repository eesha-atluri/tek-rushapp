"use client";

import { useEffect, useState } from "react";
import { feedback } from "@/lib/mockData";
import { getStoredRushees, type Rushee } from "@/lib/rusheeStorage";
import BrotherNav from "@/app/components/BrotherNav";

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

type RusheeStatus =
  | "Active Rush"
  | "Needs More Feedback"
  | "Next Round"
  | "Maybe"
  | "Do Not Continue"
  | "Archived";

type FilterType =
  | "All"
  | "Need My Vote"
  | "Voted By Me"
  | "Needs More Feedback"
  | "Archived";

function getStatusStyle(status: RusheeStatus) {
  if (status === "Active Rush") return "bg-green-100 text-green-700";
  if (status === "Needs More Feedback") return "bg-yellow-100 text-yellow-700";
  if (status === "Next Round") return "bg-blue-100 text-blue-700";
  if (status === "Maybe") return "bg-purple-100 text-purple-700";
  if (status === "Do Not Continue") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function RushBoardPage() {
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RusheeStatus>>({});
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);

  useEffect(() => {
    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);

    setRusheeList(getStoredRushees());

    const savedStatusesString = localStorage.getItem("tek-rushee-statuses");

    if (savedStatusesString) {
      setStatuses(JSON.parse(savedStatusesString));
    } else {
      const defaultStatuses: Record<string, RusheeStatus> = {};

      rusheeList.forEach((rushee) => {
        defaultStatuses[rushee.id] = "Active Rush";
      });

      setStatuses(defaultStatuses);
      localStorage.setItem(
        "tek-rushee-statuses",
        JSON.stringify(defaultStatuses)
      );
    }
  }, []);

  const filteredRushees = rusheeList.filter((rushee) => {
    const currentStatus = statuses[rushee.id] || "Active Rush";
    const hasMyFeedback = allFeedback.some(
      (item) => item.rusheeId === rushee.id
    );

    const matchesSearch =
      rushee.name.toLowerCase().includes(search.toLowerCase()) ||
      rushee.major.toLowerCase().includes(search.toLowerCase()) ||
      rushee.year.toLowerCase().includes(search.toLowerCase()) ||
      String(rushee.number).includes(search);

    if (!matchesSearch) return false;

    if (selectedFilter === "Need My Vote") return !hasMyFeedback;
    if (selectedFilter === "Voted By Me") return hasMyFeedback;
    if (selectedFilter === "Needs More Feedback")
      return currentStatus === "Needs More Feedback";
    if (selectedFilter === "Archived") return currentStatus === "Archived";

    return true;
  });

  const votedCount = rusheeList.filter((rushee) =>
    allFeedback.some((item) => item.rusheeId === rushee.id)
  ).length;

  const needVoteCount = rusheeList.length - votedCount;

  return (
    <main className="min-h-screen bg-[#F8F6F1] pb-20 text-[#061A33]">
        <BrotherNav />
      <header className="bg-[#061A33] px-5 py-5 text-white">
       

        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Brother View
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Rush Board</h1>

        <p className="mt-2 text-sm text-slate-300">
          See who needs your vote, review profiles, and submit feedback.
        </p>
      </header>

      <section className="mx-auto max-w-md px-4 py-5">
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xl font-extrabold">{rusheeList.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xl font-extrabold text-green-700">
              {votedCount}
            </p>
            <p className="text-xs text-slate-500">Voted</p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xl font-extrabold text-[#9B1232]">
              {needVoteCount}
            </p>
            <p className="text-xs text-slate-500">Need Vote</p>
          </div>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, number, major..."
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
        />

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {[
            "All",
            "Need My Vote",
            "Voted By Me",
            "Needs More Feedback",
            "Archived",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as FilterType)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${
                selectedFilter === filter
                  ? "border-[#9B1232] bg-[#9B1232] text-white"
                  : "border-slate-300 bg-white text-[#061A33]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          <a
            href="/rushees"
            className="flex-1 rounded-xl border border-[#061A33] px-4 py-3 text-center text-sm font-bold"
          >
            Rushee Directory
          </a>

          <a
            href="/my-feedback"
            className="flex-1 rounded-xl bg-[#061A33] px-4 py-3 text-center text-sm font-bold text-white"
          >
            My Feedback
          </a>
        </div>

        <div className="space-y-3">
          {filteredRushees.length === 0 && (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
              No rushees match this filter.
            </div>
          )}

          {filteredRushees.map((rushee) => {
            const hasMyFeedback = allFeedback.some(
              (item) => item.rusheeId === rushee.id
            );

            const currentStatus = statuses[rushee.id] || "Active Rush";

            const reviewCount = allFeedback.filter(
              (item) => item.rusheeId === rushee.id
            ).length;

            return (
              <div
                key={rushee.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <img
                    src={rushee.photo}
                    alt={rushee.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-extrabold">
                          #{rushee.number} {rushee.name}
                        </h2>

                        <p className="text-xs text-slate-500">
                          {rushee.major} · {rushee.year}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${getStatusStyle(
                          currentStatus
                        )}`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Events: {rushee.events.join(", ")}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            hasMyFeedback
                              ? "text-green-700"
                              : "text-[#9B1232]"
                          }`}
                        >
                          My Vote:{" "}
                          {hasMyFeedback ? "Submitted" : "Not Submitted"}
                        </p>

                        <p className="text-xs text-slate-500">
                          Total Reviews: {reviewCount}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`/rushees/${rushee.id}`}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-[#061A33]"
                        >
                          View
                        </a>

                        <a
                          href={`/feedback/${rushee.id}`}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            hasMyFeedback
                              ? "border border-[#9B1232] text-[#9B1232]"
                              : "bg-[#9B1232] text-white"
                          }`}
                        >
                          {hasMyFeedback ? "Edit Vote" : "Vote"}
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