"use client";

import { useEffect, useState } from "react";
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

export default function MyFeedbackPage() {
  const [myFeedback, setMyFeedback] = useState<SavedFeedback[]>([]);

  useEffect(() => {
    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setMyFeedback(savedFeedback);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F6F1] pb-20 text-[#061A33]">
        <BrotherNav />
      <header className="bg-[#061A33] px-5 py-5 text-white">
        <a href="/rushees" className="text-sm font-semibold text-[#C49A45]">
          ← Back to Rushees
        </a>

        <h1 className="mt-2 text-2xl font-extrabold">My Feedback</h1>

        <p className="mt-2 text-sm text-slate-300">
          View and edit feedback you have already submitted.
        </p>
      </header>

      <section className="mx-auto max-w-md space-y-3 px-4 py-5">
        {myFeedback.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
            You have not submitted any feedback yet.
          </div>
        )}

        {myFeedback.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">{item.rusheeName}</h2>
                <p className="text-xs text-slate-500">
                  #{item.rusheeNumber} · {item.events.join(", ")}
                </p>
              </div>

              <a
                href={`/feedback/${item.rusheeId}`}
                className="rounded-full border border-[#9B1232] px-3 py-1 text-xs font-bold text-[#9B1232]"
              >
                Edit
              </a>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-xl bg-[#F8F6F1] p-2">
                <p className="font-extrabold">{item.communication}</p>
                <p className="text-slate-500">Comm</p>
              </div>

              <div className="rounded-xl bg-[#F8F6F1] p-2">
                <p className="font-extrabold">{item.passion}</p>
                <p className="text-slate-500">Passion</p>
              </div>

              <div className="rounded-xl bg-[#F8F6F1] p-2">
                <p className="font-extrabold">{item.cultureFit}</p>
                <p className="text-slate-500">Culture</p>
              </div>

              <div className="rounded-xl bg-[#F8F6F1] p-2">
                <p className="font-extrabold">{item.fitAddChoice}</p>
                <p className="text-slate-500">Choice</p>
              </div>

              <div className="rounded-xl bg-[#F8F6F1] p-2">
                <p className="font-extrabold">{item.fitAddScore}</p>
                <p className="text-slate-500">Score</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Comment
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.comment}
              </p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}