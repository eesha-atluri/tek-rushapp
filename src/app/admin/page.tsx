"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/app/components/AdminNav";
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

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

export default function AdminDashboardPage() {
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);

  useEffect(() => {
    setRusheeList(getStoredRushees());

    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);
  }, []);

  const fitVotes = allFeedback.filter(
    (item) => item.fitAddChoice === "Fit"
  ).length;

  const addVotes = allFeedback.filter(
    (item) => item.fitAddChoice === "Add"
  ).length;

  function exportCSV() {
    const rows = rusheeList.map((rushee) => {
      const rusheeFeedback = allFeedback.filter(
        (item) => item.rusheeId === rushee.id
      );

      const comments = rusheeFeedback
        .map((item) => item.comment)
        .filter(Boolean)
        .join(" | ");

      return {
        number: rushee.number,
        name: rushee.name,
        major: rushee.major,
        year: rushee.year,
        events: rushee.events.join(", "),
        communicationAvg: getAverage(
          rusheeFeedback.map((item) => item.communication)
        ),
        passionAvg: getAverage(rusheeFeedback.map((item) => item.passion)),
        cultureFitAvg: getAverage(
          rusheeFeedback.map((item) => item.cultureFit)
        ),
        fitAddAvg: getAverage(rusheeFeedback.map((item) => item.fitAddScore)),
        reviews: rusheeFeedback.length,
        fitVotes: rusheeFeedback.filter((item) => item.fitAddChoice === "Fit")
          .length,
        addVotes: rusheeFeedback.filter((item) => item.fitAddChoice === "Add")
          .length,
        neitherVotes: rusheeFeedback.filter(
          (item) => item.fitAddChoice === "Neither"
        ).length,
        comments,
      };
    });

    const headers = [
      "Number",
      "Name",
      "Major",
      "Year",
      "Events",
      "Communication Avg",
      "Passion Avg",
      "Culture Fit Avg",
      "Fit/Add Avg",
      "Reviews",
      "Fit Votes",
      "Add Votes",
      "Neither Votes",
      "Comments",
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.number,
          row.name,
          row.major,
          row.year,
          row.events,
          row.communicationAvg,
          row.passionAvg,
          row.cultureFitAvg,
          row.fitAddAvg,
          row.reviews,
          row.fitVotes,
          row.addVotes,
          row.neitherVotes,
          row.comments,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tek-rush-feedback.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-10 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C49A45]">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">Dashboard</h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
            Review rushee stats, feedback summaries, and hash-ready data.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Rushees</p>
            <p className="mt-2 text-4xl font-extrabold">
              {rusheeList.length}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Feedback Entries</p>
            <p className="mt-2 text-4xl font-extrabold">
              {allFeedback.length}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Fit Votes</p>
            <p className="mt-2 text-4xl font-extrabold text-[#1F6B3A]">
              {fitVotes}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Add Votes</p>
            <p className="mt-2 text-4xl font-extrabold text-[#061A33]">
              {addVotes}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold">Rushee Overview</h2>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/hash"
              className="rounded-2xl bg-[#061A33] px-5 py-3 text-sm font-bold text-[#F4F1EA]"
            >
              Rush Decisions
            </a>

            <a
              href="/admin/rushees"
              className="rounded-2xl bg-[#061A33] px-5 py-3 text-sm font-bold text-[#F4F1EA]"
            >
              Add / Edit Rushees
            </a>

            <a
              href="/admin/events"
              className="rounded-2xl border border-[#C49A45] bg-white px-5 py-3 text-sm font-bold text-[#061A33]"
            >
              Manage Events
            </a>

            <a
              href="/admin/feedback"
              className="rounded-2xl border border-[#C49A45] bg-white px-5 py-3 text-sm font-bold text-[#061A33]"
            >
              View Feedback
            </a>

            <a
              href="/admin/archive"
              className="rounded-2xl border border-[#C49A45] bg-white px-5 py-3 text-sm font-bold text-[#061A33]"
            >
              Archive
            </a>

            <button
              type="button"
              onClick={exportCSV}
              className="rounded-2xl border border-[#061A33] bg-white px-5 py-3 text-sm font-bold text-[#061A33]"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {rusheeList.map((rushee) => {
            const rusheeFeedback = allFeedback.filter(
              (item) => item.rusheeId === rushee.id
            );

            const communicationAvg = getAverage(
              rusheeFeedback.map((item) => item.communication)
            );

            const passionAvg = getAverage(
              rusheeFeedback.map((item) => item.passion)
            );

            const cultureFitAvg = getAverage(
              rusheeFeedback.map((item) => item.cultureFit)
            );

            const fitAddAvg = getAverage(
              rusheeFeedback.map((item) => item.fitAddScore)
            );

            const rusheeFitVotes = rusheeFeedback.filter(
              (item) => item.fitAddChoice === "Fit"
            ).length;

            const rusheeAddVotes = rusheeFeedback.filter(
              (item) => item.fitAddChoice === "Add"
            ).length;

            const rusheeNeitherVotes = rusheeFeedback.filter(
              (item) => item.fitAddChoice === "Neither"
            ).length;

            return (
              <article
                key={rushee.id}
                className="rounded-3xl border border-[#E5E0D8] bg-white p-7 shadow-sm"
              >
                <div className="grid gap-6 xl:grid-cols-[14rem_1fr] xl:items-start">
                  <div className="shrink-0 overflow-hidden rounded-3xl bg-[#F0E8DA] sm:h-48 sm:w-48 xl:h-56 xl:w-56">
                    <img
                      src={rushee.photo}
                      alt={rushee.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-3xl font-extrabold">
                          {rushee.name}
                        </h3>

                        <p className="mt-2 text-base text-slate-600">
                          #{rushee.number} · {rushee.major || "No major"} ·{" "}
                          {rushee.year || "No year"}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          Events:{" "}
                          {rushee.events.length > 0
                            ? rushee.events.join(", ")
                            : "No events yet"}
                        </p>
                      </div>

                      <a
                        href={`/admin/rushees/${rushee.id}`}
                        className="rounded-full border border-[#061A33] px-5 py-2 text-sm font-bold text-[#061A33]"
                      >
                        View
                      </a>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
                      <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                        <p className="text-xl font-extrabold">
                          {communicationAvg}
                        </p>
                        <p className="text-xs text-slate-500">Comm</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                        <p className="text-xl font-extrabold">{passionAvg}</p>
                        <p className="text-xs text-slate-500">Passion</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                        <p className="text-xl font-extrabold">
                          {cultureFitAvg}
                        </p>
                        <p className="text-xs text-slate-500">Culture</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                        <p className="text-xl font-extrabold">{fitAddAvg}</p>
                        <p className="text-xs text-slate-500">Fit/Add Avg</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                        <p className="text-xl font-extrabold">
                          {rusheeFeedback.length}
                        </p>
                        <p className="text-xs text-slate-500">Reviews</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-[#E5E0D8] p-4 text-center">
                        <p className="text-xl font-extrabold text-[#1F6B3A]">
                          {rusheeFitVotes}
                        </p>
                        <p className="text-xs text-slate-500">Fit</p>
                      </div>

                      <div className="rounded-2xl border border-[#E5E0D8] p-4 text-center">
                        <p className="text-xl font-extrabold text-[#061A33]">
                          {rusheeAddVotes}
                        </p>
                        <p className="text-xs text-slate-500">Add</p>
                      </div>

                      <div className="rounded-2xl border border-[#E5E0D8] p-4 text-center">
                        <p className="text-xl font-extrabold text-slate-600">
                          {rusheeNeitherVotes}
                        </p>
                        <p className="text-xs text-slate-500">Neither</p>
                      </div>
                    </div>

                    {rusheeFeedback.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-[#E5E0D8] p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Comments
                        </p>

                        <div className="mt-3 space-y-2">
                          {rusheeFeedback.slice(0, 3).map((item) => (
                            <p
                              key={item.id}
                              className="rounded-xl bg-[#F4F1EA] p-3 text-sm leading-6 text-slate-700"
                            >
                              {item.comment || "No comment provided."}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
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