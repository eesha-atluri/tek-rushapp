"use client";

import { useEffect, useState } from "react";
import { feedback, rushees } from "@/lib/mockData";
import AdminNav from "@/app/components/AdminNav";

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
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);

  useEffect(() => {
    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
        <AdminNav />
      <header className="bg-[#061A33] px-6 py-5 text-white">
       

        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Dashboard</h1>

        <p className="mt-2 text-sm text-slate-300">
          View rushee stats, feedback summaries, and hash-ready data.
        </p>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Rushees</p>
            <p className="text-3xl font-extrabold">{rushees.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Feedback Entries</p>
            <p className="text-3xl font-extrabold">{allFeedback.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Fit Votes</p>
            <p className="text-3xl font-extrabold">
              {allFeedback.filter((item) => item.fitAddChoice === "Fit").length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Add Votes</p>
            <p className="text-3xl font-extrabold">
              {allFeedback.filter((item) => item.fitAddChoice === "Add").length}
            </p>
          </div>
        </div>

       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h2 className="text-xl font-bold">Rushee Overview</h2>

  <div className="flex flex-wrap gap-2">
  <a
    href="/admin/hash"
    className="rounded-xl bg-[#061A33] px-4 py-2 text-sm font-bold text-white"
  >
    Hash Dashboard
  </a>

  <a
    href="/admin/rushees"
    className="rounded-xl bg-[#061A33] px-4 py-2 text-sm font-bold text-white"
  >
    Add / Edit Rushees
  </a>

  <a
    href="/admin/events"
    className="rounded-xl border border-[#C49A45] px-4 py-2 text-sm font-bold text-[#061A33]"
  >
    Manage Events
  </a>

  <a
    href="/admin/feedback"
    className="rounded-xl border border-[#C49A45] px-4 py-2 text-sm font-bold text-[#061A33]"
  >
    View All Feedback
  </a>

  <a
    href="/admin/archive"
    className="rounded-xl border border-[#C49A45] px-4 py-2 text-sm font-bold text-[#061A33]"
  >
    Archive
  </a>

  <button className="rounded-xl border border-[#061A33] px-4 py-2 text-sm font-bold text-[#061A33]">
    Export CSV
  </button>
</div>
</div>

        <div className="space-y-4">
          {rushees.map((rushee) => {
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

            const fitCount = rusheeFeedback.filter(
              (item) => item.fitAddChoice === "Fit"
            ).length;

            const addCount = rusheeFeedback.filter(
              (item) => item.fitAddChoice === "Add"
            ).length;

            const neitherCount = rusheeFeedback.filter(
              (item) => item.fitAddChoice === "Neither"
            ).length;

            return (
              <div
                key={rushee.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <img
                    src={rushee.photo}
                    alt={rushee.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold">{rushee.name}</h3>
                        <p className="text-xs text-slate-500">
                          #{rushee.number} · {rushee.major} · {rushee.year}
                        </p>
                      </div>

                      <a
                        href={`/rushees/${rushee.id}`}
                        className="text-sm font-bold text-[#061A33]"
                      >
                        View
                      </a>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Events: {rushee.events.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center md:grid-cols-5">
                  <div className="rounded-xl bg-[#F4F1EA] p-3">
                    <p className="font-extrabold">{communicationAvg}</p>
                    <p className="text-xs text-slate-500">Comm</p>
                  </div>

                  <div className="rounded-xl bg-[#F4F1EA] p-3">
                    <p className="font-extrabold">{passionAvg}</p>
                    <p className="text-xs text-slate-500">Passion</p>
                  </div>

                  <div className="rounded-xl bg-[#F4F1EA] p-3">
                    <p className="font-extrabold">{cultureFitAvg}</p>
                    <p className="text-xs text-slate-500">Culture</p>
                  </div>

                  <div className="rounded-xl bg-[#F4F1EA] p-3">
                    <p className="font-extrabold">{fitAddAvg}</p>
                    <p className="text-xs text-slate-500">Fit/Add Avg</p>
                  </div>

                  <div className="rounded-xl bg-[#F4F1EA] p-3">
                    <p className="font-extrabold">{rusheeFeedback.length}</p>
                    <p className="text-xs text-slate-500">Reviews</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-[#E5E0D8] p-3">
                    <p className="font-extrabold text-green-700">{fitCount}</p>
                    <p className="text-xs text-slate-500">Fit</p>
                  </div>

                  <div className="rounded-xl border border-[#E5E0D8] p-3">
                    <p className="font-extrabold text-blue-700">{addCount}</p>
                    <p className="text-xs text-slate-500">Add</p>
                  </div>

                  <div className="rounded-xl border border-[#E5E0D8] p-3">
                    <p className="font-extrabold text-slate-600">
                      {neitherCount}
                    </p>
                    <p className="text-xs text-slate-500">Neither</p>
                  </div>
                </div>

                {rusheeFeedback.length > 0 && (
                  <div className="mt-4 rounded-xl border border-[#E5E0D8] p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Comments
                    </p>

                    <div className="mt-2 space-y-2">
                      {rusheeFeedback.map((item) => (
                        <p
                          key={item.id}
                          className="rounded-lg bg-[#F4F1EA] p-2 text-sm text-slate-700"
                        >
                          {item.comment}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}