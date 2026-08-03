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

type RusheeStage =
  | "Hash #1"
  | "Hash #2"
  | "Hash #3"
  | "Final Hash #4"
  | "Bid / Accepted"
  | "Not Continuing"
  | "Archived";

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";
  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

export default function AdminArchivePage() {
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [stages, setStages] = useState<Record<string, RusheeStage>>({});
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);

  useEffect(() => {
    const storedRushees = getStoredRushees();
    setRusheeList(storedRushees);

    const savedStagesString = localStorage.getItem("tek-rushee-stages");
    const savedStages: Record<string, RusheeStage> = savedStagesString
      ? JSON.parse(savedStagesString)
      : {};

    setStages(savedStages);

    const savedFeedbackString = localStorage.getItem("tek-feedback");
    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);
  }, []);

  function restoreRushee(rusheeId: string) {
    const updatedStages = {
      ...stages,
      [rusheeId]: "Hash #1" as RusheeStage,
    };

    setStages(updatedStages);
    localStorage.setItem("tek-rushee-stages", JSON.stringify(updatedStages));
  }

  const archivedRushees = rusheeList.filter(
    (rushee) => stages[rushee.id] === "Archived"
  );

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-8 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">Archive</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            View rushees removed from the active rush process while keeping
            their feedback history.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 rounded-2xl border border-[#E5E0D8] bg-white p-5">
          <p className="text-sm text-slate-500">Archived Rushees</p>
          <p className="mt-1 text-4xl font-extrabold">
            {archivedRushees.length}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {archivedRushees.length === 0 && (
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-sm text-slate-600">
              No rushees are archived yet. Archive someone from Rush Decisions
              first.
            </div>
          )}

          {archivedRushees.map((rushee) => {
            const rusheeFeedback = allFeedback.filter(
              (item) => item.rusheeId === rushee.id
            );

            return (
              <article
                key={rushee.id}
                className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm"
              >
                <div className="flex gap-5">
                 <div className="shrink-0 overflow-hidden rounded-3xl bg-[#F0E8DA] h-44 w-44 lg:h-52 lg:w-52">
  <img
    src={rushee.photo}
    alt={rushee.name}
    className="h-full w-full object-cover object-center"
  />
</div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-extrabold">
                          #{rushee.number} {rushee.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                          {rushee.major || "No major"} ·{" "}
                          {rushee.year || "No year"}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#F4F1EA] px-3 py-1 text-xs font-bold">
                        Archived
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                      Seen at:{" "}
                      {rushee.events.length > 0
                        ? rushee.events.join(", ")
                        : "No events yet"}
                    </p>

                    <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-2xl bg-[#F4F1EA] p-3">
                        <p className="font-extrabold">
                          {rusheeFeedback.length}
                        </p>
                        <p className="text-xs text-slate-500">Reviews</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-3">
                        <p className="font-extrabold">
                          {getAverage(
                            rusheeFeedback.map((item) => item.communication)
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Comm</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-3">
                        <p className="font-extrabold">
                          {getAverage(
                            rusheeFeedback.map((item) => item.passion)
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Passion</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F1EA] p-3">
                        <p className="font-extrabold">
                          {getAverage(
                            rusheeFeedback.map((item) => item.cultureFit)
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Culture</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={`/admin/rushees/${rushee.id}`}
                        className="rounded-full border border-[#061A33] px-4 py-2 text-sm font-bold text-[#061A33]"
                      >
                        Admin Profile
                      </a>

                      <button
                        type="button"
                        onClick={() => restoreRushee(rushee.id)}
                        className="rounded-full bg-[#061A33] px-4 py-2 text-sm font-bold text-[#F4F1EA]"
                      >
                        Restore to Hash #1
                      </button>
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