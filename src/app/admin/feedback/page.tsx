"use client";

import { useEffect, useState } from "react";
import { feedback } from "@/lib/mockData";
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

export default function AdminFeedbackPage() {
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

        <h1 className="mt-1 text-2xl font-extrabold">All Feedback</h1>

        <p className="mt-2 text-sm text-slate-300">
          Review every brother-submitted rating and comment.
        </p>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-extrabold">
            Feedback Entries: {allFeedback.length}
          </h2>

          <button
            type="button"
            onClick={() => alert("CSV export will be added next.")}
            className="rounded-xl bg-[#061A33] px-4 py-2 text-sm font-bold text-white"
          >
            Export CSV
          </button>
        </div>

        <div className="space-y-4">
          {allFeedback.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
              No feedback has been submitted yet.
            </div>
          )}

          {allFeedback.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold">
                    {item.rusheeName}
                  </h3>

                  <p className="text-xs text-slate-500">
                    #{item.rusheeNumber} · Events: {item.events.join(", ")}
                  </p>
                </div>

                <span className="rounded-full bg-[#F4F1EA] px-3 py-1 text-xs font-bold text-[#061A33]">
                  {item.fitAddChoice}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-5">
                <div className="rounded-xl bg-[#F4F1EA] p-3">
                  <p className="font-extrabold">{item.communication}</p>
                  <p className="text-xs text-slate-500">Communication</p>
                </div>

                <div className="rounded-xl bg-[#F4F1EA] p-3">
                  <p className="font-extrabold">{item.passion}</p>
                  <p className="text-xs text-slate-500">Passion</p>
                </div>

                <div className="rounded-xl bg-[#F4F1EA] p-3">
                  <p className="font-extrabold">{item.cultureFit}</p>
                  <p className="text-xs text-slate-500">Culture Fit</p>
                </div>

                <div className="rounded-xl bg-[#F4F1EA] p-3">
                  <p className="font-extrabold">{item.fitAddChoice}</p>
                  <p className="text-xs text-slate-500">Fit/Add</p>
                </div>

                <div className="rounded-xl bg-[#F4F1EA] p-3">
                  <p className="font-extrabold">{item.fitAddScore}</p>
                  <p className="text-xs text-slate-500">Fit/Add Score</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#E5E0D8] p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Comment
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {item.comment || "No comment provided."}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={`/rushees/${item.rusheeId}`}
                  className="rounded-full border border-[#061A33] px-3 py-1 text-xs font-bold text-[#061A33]"
                >
                  View Rushee
                </a>

                <a
                  href={`/feedback/${item.rusheeId}`}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-500"
                >
                  Edit Feedback
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}