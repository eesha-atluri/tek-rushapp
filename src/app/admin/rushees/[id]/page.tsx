"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function AdminRusheeProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [rushee, setRushee] = useState<Rushee | null>(null);
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);

  useEffect(() => {
    const storedRushees = getStoredRushees();
    const foundRushee = storedRushees.find((item) => item.id === id) || null;

    setRushee(foundRushee);

    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);
  }, [id]);

  if (!rushee) {
    return (
      <main className="min-h-screen bg-[#F8F6F1] text-[#061A33]">
        <AdminNav />

        <section className="p-6">
          <p>Rushee not found.</p>

          <a href="/admin/hash" className="mt-4 block font-bold text-[#9B1232]">
            Back to Hash Dashboard
          </a>
        </section>
      </main>
    );
  }

  const rusheeFeedback = allFeedback.filter(
    (item) => item.rusheeId === rushee.id
  );

  const communicationAvg = getAverage(
    rusheeFeedback.map((item) => item.communication)
  );

  const passionAvg = getAverage(rusheeFeedback.map((item) => item.passion));

  const cultureFitAvg = getAverage(
    rusheeFeedback.map((item) => item.cultureFit)
  );

  const fitAddAvg = getAverage(rusheeFeedback.map((item) => item.fitAddScore));

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
    <main className="min-h-screen bg-[#F8F6F1] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Rushee Admin Profile</h1>

        <p className="mt-2 text-sm text-slate-300">
          View full rushee details, feedback summaries, and admin-only comments.
        </p>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row">
            <img
              src={rushee.photo}
              alt={rushee.name}
              className="h-40 w-40 rounded-2xl object-cover"
            />

            <div className="flex-1">
              <h2 className="text-3xl font-extrabold">
                #{rushee.number} {rushee.name}
              </h2>

              <p className="mt-2 text-slate-600">
                {rushee.major || "No major"} · {rushee.year || "No year"}
              </p>

              <p className="mt-3 text-sm text-slate-700">
                Events:{" "}
                {rushee.events.length > 0
                  ? rushee.events.join(", ")
                  : "None selected"}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href="/admin/hash"
                  className="rounded-xl border border-[#061A33] px-4 py-2 text-sm font-bold"
                >
                  Back to Hash
                </a>

                <a
                  href="/admin/rushees"
                  className="rounded-xl bg-[#9B1232] px-4 py-2 text-sm font-bold text-white"
                >
                  Edit in Manage Rushees
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F8F6F1] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Application Summary
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {rushee.applicationSummary || "No summary provided."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-xl bg-[#F8F6F1] p-4 text-center">
              <p className="text-xl font-extrabold">{communicationAvg}</p>
              <p className="text-xs text-slate-500">Communication</p>
            </div>

            <div className="rounded-xl bg-[#F8F6F1] p-4 text-center">
              <p className="text-xl font-extrabold">{passionAvg}</p>
              <p className="text-xs text-slate-500">Passion</p>
            </div>

            <div className="rounded-xl bg-[#F8F6F1] p-4 text-center">
              <p className="text-xl font-extrabold">{cultureFitAvg}</p>
              <p className="text-xs text-slate-500">Culture Fit</p>
            </div>

            <div className="rounded-xl bg-[#F8F6F1] p-4 text-center">
              <p className="text-xl font-extrabold">{fitAddAvg}</p>
              <p className="text-xs text-slate-500">Fit/Add Avg</p>
            </div>

            <div className="rounded-xl bg-[#F8F6F1] p-4 text-center">
              <p className="text-xl font-extrabold">{rusheeFeedback.length}</p>
              <p className="text-xs text-slate-500">Reviews</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xl font-extrabold text-[#1F6B3A]">
                {fitCount}
              </p>
              <p className="text-xs text-slate-500">Fit</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xl font-extrabold text-[#061A33]">
                {addCount}
              </p>
              <p className="text-xs text-slate-500">Add</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xl font-extrabold text-slate-600">
                {neitherCount}
              </p>
              <p className="text-xs text-slate-500">Neither</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-extrabold">All Feedback Comments</h3>

            <div className="mt-3 space-y-3">
              {rusheeFeedback.length === 0 && (
                <div className="rounded-xl bg-[#F8F6F1] p-4 text-sm text-slate-600">
                  No feedback submitted yet.
                </div>
              )}

              {rusheeFeedback.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
                    <p>Comm: {item.communication}</p>
                    <p>Passion: {item.passion}</p>
                    <p>Culture: {item.cultureFit}</p>
                    <p>{item.fitAddChoice}</p>
                    <p>Score: {item.fitAddScore}</p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {item.comment || "No comment provided."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}