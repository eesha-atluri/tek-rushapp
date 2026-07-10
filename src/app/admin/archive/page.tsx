"use client";

import { useEffect, useState } from "react";
import { feedback } from "@/lib/mockData";
import { getStoredRushees, type Rushee } from "@/lib/rusheeStorage";
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

type RusheeStatus =
  | "Active Rush"
  | "Needs More Feedback"
  | "Next Round"
  | "Maybe"
  | "Do Not Continue"
  | "Archived";

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

export default function AdminArchivePage() {
   const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RusheeStatus>>({});
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);

  useEffect(() => {
    setRusheeList(getStoredRushees());
    const savedStatusesString = localStorage.getItem("tek-rushee-statuses");
    const savedFeedbackString = localStorage.getItem("tek-feedback");

    if (savedStatusesString) {
      setStatuses(JSON.parse(savedStatusesString));
    }

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);
  }, []);

  function unarchiveRushee(rusheeId: string) {
    const updatedStatuses = {
      ...statuses,
      [rusheeId]: "Active Rush" as RusheeStatus,
    };

    setStatuses(updatedStatuses);
    localStorage.setItem(
      "tek-rushee-statuses",
      JSON.stringify(updatedStatuses)
    );
  }

  const archivedRushees = rusheeList.filter(
    (rushee) => statuses[rushee.id] === "Archived"
  );

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#061A33]">
        <AdminNav />
      <header className="bg-[#061A33] px-6 py-5 text-white">
       

        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Archive</h1>

        <p className="mt-2 text-sm text-slate-300">
          View rushees removed from the active rush board while keeping their
          feedback history.
        </p>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Archived Rushees</p>
          <p className="text-3xl font-extrabold">{archivedRushees.length}</p>
        </div>

        <div className="space-y-4">
          {archivedRushees.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
              No rushees are archived yet. Archive someone from the Hash
              Dashboard first.
            </div>
          )}

          {archivedRushees.map((rushee) => {
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-extrabold">
                          #{rushee.number} {rushee.name}
                        </h2>

                        <p className="text-xs text-slate-500">
                          {rushee.major} · {rushee.year}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        Archived
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Events: {rushee.events.join(", ")}
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-xl bg-[#F8F6F1] p-3">
                        <p className="font-extrabold">{rusheeFeedback.length}</p>
                        <p className="text-xs text-slate-500">Reviews</p>
                      </div>

                      <div className="rounded-xl bg-[#F8F6F1] p-3">
                        <p className="font-extrabold">{communicationAvg}</p>
                        <p className="text-xs text-slate-500">Comm</p>
                      </div>

                      <div className="rounded-xl bg-[#F8F6F1] p-3">
                        <p className="font-extrabold">{passionAvg}</p>
                        <p className="text-xs text-slate-500">Passion</p>
                      </div>

                      <div className="rounded-xl bg-[#F8F6F1] p-3">
                        <p className="font-extrabold">{cultureFitAvg}</p>
                        <p className="text-xs text-slate-500">Culture</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`/rushees/${rushee.id}`}
                        className="rounded-full border border-[#061A33] px-3 py-1 text-xs font-bold text-[#061A33]"
                      >
                        View Profile
                      </a>

                      <button
                        onClick={() => unarchiveRushee(rushee.id)}
                        className="rounded-full bg-[#9B1232] px-3 py-1 text-xs font-bold text-white"
                      >
                        Restore to Active Rush
                      </button>
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