"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStoredRushees, type Rushee } from "@/lib/rusheeStorage";
import { feedback } from "@/lib/mockData";
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

export default function RusheeProfilePage() {
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
      <main className="min-h-screen bg-[#F8F6F1] p-6 text-[#061A33]">
        <p>Rushee not found.</p>

        <a href="/rushees" className="mt-4 block font-bold text-[#9B1232]">
          Back to Rushees
        </a>
      </main>
    );
  }

  const rusheeFeedback = allFeedback.filter(
    (item) => item.rusheeId === rushee.id
  );

  const hasMyFeedback = rusheeFeedback.length > 0;

  return (
    <main className="min-h-screen bg-[#F8F6F1] pb-20 text-[#061A33]">
        <BrotherNav />
      <header className="bg-[#061A33] px-5 py-4 text-white">
        <a href="/rush-board" className="text-sm font-semibold text-[#C49A45]">
          ← Back to Rush Board
        </a>

        <h1 className="mt-2 text-xl font-extrabold">Rushee Profile</h1>
      </header>

      <section className="mx-auto max-w-md">
        <img
          src={rushee.photo}
          alt={rushee.name}
          className="h-64 w-full object-cover"
        />

        <div className="px-4 py-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold">
                  #{rushee.number} {rushee.name}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {rushee.major || "No major"} · {rushee.year || "No year"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Events Attended
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {rushee.events.length > 0 ? (
                  rushee.events.map((event) => (
                    <span
                      key={event}
                      className="rounded-full border border-[#C49A45]/40 bg-[#F8F6F1] px-3 py-1 text-xs font-semibold"
                    >
                      {event}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No events selected.</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Application Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {rushee.applicationSummary || "No summary provided."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xl font-extrabold">
                  {rusheeFeedback.length}
                </p>
                <p className="text-xs text-slate-500">Reviews</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xl font-extrabold">
                  {rushee.events.length}
                </p>
                <p className="text-xs text-slate-500">Events</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xl font-extrabold">
                  {hasMyFeedback ? "Yes" : "No"}
                </p>
                <p className="text-xs text-slate-500">My Vote</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F8F6F1] p-4">
  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    Review Progress
  </p>

  <p className="mt-2 text-sm text-slate-700">
    {rusheeFeedback.length} feedback entr
    {rusheeFeedback.length === 1 ? "y" : "ies"} submitted.
  </p>

  <p className="mt-2 text-xs text-slate-500">
    Use this to see whether this rushee needs more brother feedback before hash.
  </p>
</div>

            <a
              href={`/feedback/${rushee.id}`}
              className="mt-6 block rounded-xl bg-[#9B1232] px-4 py-3 text-center font-bold text-white shadow-md"
            >
              {hasMyFeedback ? "Edit My Feedback" : "Rank This Rushee"}
            </a>

            <a
              href="/my-feedback"
              className="mt-3 block rounded-xl border border-[#9B1232] px-4 py-3 text-center font-bold text-[#9B1232]"
            >
              View My Feedback
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}