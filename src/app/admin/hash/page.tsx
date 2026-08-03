"use client";

import { useEffect, useMemo, useState } from "react";
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

type HashRound = "Hash #1" | "Hash #2" | "Hash #3" | "Final Hash #4";

type RusheeStage =
  | HashRound
  | "Bid / Accepted"
  | "Not Continuing"
  | "Archived";

type HashDecision =
  | "Advance"
  | "Needs More Votes"
  | "Maybe"
  | "Not Continuing"
  | "Bid / Accepted"
  | "Archive";

type HashHistory = Record<string, Partial<Record<HashRound, HashDecision>>>;

const hashRounds: HashRound[] = [
  "Hash #1",
  "Hash #2",
  "Hash #3",
  "Final Hash #4",
];

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

function getNextStage(currentStage: HashRound): RusheeStage {
  if (currentStage === "Hash #1") return "Hash #2";
  if (currentStage === "Hash #2") return "Hash #3";
  if (currentStage === "Hash #3") return "Final Hash #4";
  return "Bid / Accepted";
}

function getDecisionButtonStyle(
  lastDecision: HashDecision | undefined,
  buttonDecision: HashDecision
) {
  const isSelected = lastDecision === buttonDecision;

  if (isSelected) {
    return "bg-[#061A33] text-[#F4F1EA] border-[#061A33]";
  }

  return "bg-white text-[#061A33] border-[#061A33] hover:bg-[#F4F1EA]";
}

export default function HashDashboardPage() {
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);
  const [stages, setStages] = useState<Record<string, RusheeStage>>({});
  const [history, setHistory] = useState<HashHistory>({});
  const [selectedHashRound, setSelectedHashRound] =
    useState<HashRound>("Hash #1");
  const [selectedRusheeId, setSelectedRusheeId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedRushees = getStoredRushees();
    setRusheeList(storedRushees);

    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);

    const savedStagesString = localStorage.getItem("tek-rushee-stages");

    if (savedStagesString) {
      setStages(JSON.parse(savedStagesString));
    } else {
      const defaultStages: Record<string, RusheeStage> = {};

      storedRushees.forEach((rushee) => {
        defaultStages[rushee.id] = "Hash #1";
      });

      setStages(defaultStages);
      localStorage.setItem("tek-rushee-stages", JSON.stringify(defaultStages));
    }

    const savedHistoryString = localStorage.getItem("tek-hash-history");

    if (savedHistoryString) {
      setHistory(JSON.parse(savedHistoryString));
    }
  }, []);

  const currentRoundRushees = useMemo(() => {
    return rusheeList.filter((rushee) => {
      const stage = stages[rushee.id] || "Hash #1";

      if (stage !== selectedHashRound) {
        return false;
      }

      const query = search.toLowerCase();

      return (
        rushee.name.toLowerCase().includes(query) ||
        rushee.major.toLowerCase().includes(query) ||
        rushee.year.toLowerCase().includes(query) ||
        String(rushee.number).includes(query)
      );
    });
  }, [rusheeList, stages, selectedHashRound, search]);

  useEffect(() => {
    if (currentRoundRushees.length === 0) {
      setSelectedRusheeId(null);
      return;
    }

    const selectedStillVisible = currentRoundRushees.some(
      (rushee) => rushee.id === selectedRusheeId
    );

    if (!selectedRusheeId || !selectedStillVisible) {
      setSelectedRusheeId(currentRoundRushees[0].id);
    }
  }, [currentRoundRushees, selectedRusheeId]);

  const selectedRushee =
    currentRoundRushees.find((rushee) => rushee.id === selectedRusheeId) ||
    null;

  function getRusheeFeedback(rusheeId: string) {
    return allFeedback.filter((item) => item.rusheeId === rusheeId);
  }

  function updateDecision(rusheeId: string, decision: HashDecision) {
    const currentStage = stages[rusheeId] || selectedHashRound;

    let nextStage: RusheeStage = currentStage;

    if (decision === "Advance") {
      nextStage = getNextStage(selectedHashRound);
    }

    if (decision === "Needs More Votes") {
      nextStage = selectedHashRound;
    }

    if (decision === "Maybe") {
      nextStage = selectedHashRound;
    }

    if (decision === "Not Continuing") {
      nextStage = "Not Continuing";
    }

    if (decision === "Bid / Accepted") {
      nextStage = "Bid / Accepted";
    }

    if (decision === "Archive") {
      nextStage = "Archived";
    }

    const updatedStages = {
      ...stages,
      [rusheeId]: nextStage,
    };

    const updatedHistory: HashHistory = {
      ...history,
      [rusheeId]: {
        ...(history[rusheeId] || {}),
        [selectedHashRound]: decision,
      },
    };

    setStages(updatedStages);
    setHistory(updatedHistory);

    localStorage.setItem("tek-rushee-stages", JSON.stringify(updatedStages));
    localStorage.setItem("tek-hash-history", JSON.stringify(updatedHistory));
  }

  function exportHashCSV() {
    const rows = currentRoundRushees.map((rushee) => {
      const rusheeFeedback = getRusheeFeedback(rushee.id);

      const comments = rusheeFeedback
        .map((item) => item.comment)
        .filter(Boolean)
        .join(" | ");

      return {
        rushNumber: rushee.number,
        name: rushee.name,
        major: rushee.major,
        year: rushee.year,
        currentStage: stages[rushee.id] || "Hash #1",
        currentHashDecision: history[rushee.id]?.[selectedHashRound] || "",
        events: rushee.events.join(", "),
        reviewCount: rusheeFeedback.length,
        communicationAvg: getAverage(
          rusheeFeedback.map((item) => item.communication)
        ),
        passionAvg: getAverage(rusheeFeedback.map((item) => item.passion)),
        cultureFitAvg: getAverage(
          rusheeFeedback.map((item) => item.cultureFit)
        ),
        fitAddAvg: getAverage(rusheeFeedback.map((item) => item.fitAddScore)),
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
      "Rush Number",
      "Name",
      "Major",
      "Year",
      "Current Stage",
      "Current Hash Decision",
      "Events",
      "Review Count",
      "Communication Avg",
      "Passion Avg",
      "Culture Fit Avg",
      "Fit/Add Avg",
      "Fit Votes",
      "Add Votes",
      "Neither Votes",
      "Comments",
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.rushNumber,
          row.name,
          row.major,
          row.year,
          row.currentStage,
          row.currentHashDecision,
          row.events,
          row.reviewCount,
          row.communicationAvg,
          row.passionAvg,
          row.cultureFitAvg,
          row.fitAddAvg,
          row.fitVotes,
          row.addVotes,
          row.neitherVotes,
          row.comments,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedHashRound
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("#", "hash")}-decisions.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const stageCounts = {
    hash1: Object.values(stages).filter((stage) => stage === "Hash #1").length,
    hash2: Object.values(stages).filter((stage) => stage === "Hash #2").length,
    hash3: Object.values(stages).filter((stage) => stage === "Hash #3").length,
    final: Object.values(stages).filter((stage) => stage === "Final Hash #4")
      .length,
    bid: Object.values(stages).filter((stage) => stage === "Bid / Accepted")
      .length,
    notContinuing: Object.values(stages).filter(
      (stage) => stage === "Not Continuing"
    ).length,
    archived: Object.values(stages).filter((stage) => stage === "Archived")
      .length,
  };

  const selectedFeedback = selectedRushee
    ? getRusheeFeedback(selectedRushee.id)
    : [];

  const lastDecision = selectedRushee
    ? history[selectedRushee.id]?.[selectedHashRound]
    : undefined;

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-8 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">Rush Decisions</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Select a rushee, review their feedback, and move them through each
            hash round.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-7">
          {[
            ["Hash #1", stageCounts.hash1],
            ["Hash #2", stageCounts.hash2],
            ["Hash #3", stageCounts.hash3],
            ["Final Hash", stageCounts.final],
            ["Bid", stageCounts.bid],
            ["Not Continuing", stageCounts.notContinuing],
            ["Archived", stageCounts.archived],
          ].map(([label, count]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#E5E0D8] bg-white p-4"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-extrabold">{count}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm">
            <div className="grid gap-3">
              <label className="text-sm font-bold">
                Current Hash
                <select
                  value={selectedHashRound}
                  onChange={(event) =>
                    setSelectedHashRound(event.target.value as HashRound)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-normal outline-none"
                >
                  {hashRounds.map((round) => (
                    <option key={round}>{round}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Search
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, number, major..."
                  className="mt-2 w-full rounded-2xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>

              <button
                type="button"
                onClick={exportHashCSV}
                className="mt-2 w-full rounded-2xl bg-[#061A33] px-4 py-3 text-sm font-bold text-[#F4F1EA]"
              >
                Export Current Hash CSV
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {currentRoundRushees.length === 0 && (
                <p className="rounded-2xl bg-[#F4F1EA] p-4 text-sm text-slate-600">
                  No rushees are currently in {selectedHashRound}.
                </p>
              )}

              {currentRoundRushees.map((rushee) => {
                const feedbackCount = getRusheeFeedback(rushee.id).length;
                const isSelected = selectedRusheeId === rushee.id;

                return (
                  <button
                    key={rushee.id}
                    type="button"
                    onClick={() => setSelectedRusheeId(rushee.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
                        : "border-[#E5E0D8] bg-white hover:bg-[#F4F1EA]"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0 overflow-hidden rounded-2xl bg-[#F0E8DA] h-20 w-20 lg:h-24 lg:w-24">
  <img
    src={rushee.photo}
    alt={rushee.name}
    className="h-full w-full object-cover object-center"
  />
</div>

                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold">
                          #{rushee.number} {rushee.name}
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? "text-white/70" : "text-slate-500"
                          }`}
                        >
                          {rushee.major || "No major"} ·{" "}
                          {feedbackCount} review
                          {feedbackCount === 1 ? "" : "s"}
                        </p>

                        <p
                          className={`mt-1 truncate text-xs ${
                            isSelected ? "text-white/60" : "text-slate-400"
                          }`}
                        >
                          {rushee.year || "No year"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            {!selectedRushee && (
              <div className="flex min-h-96 items-center justify-center rounded-2xl bg-[#F4F1EA] p-6 text-center text-sm text-slate-600">
                Select a rushee to review.
              </div>
            )}

            {selectedRushee && (
              <div>
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="shrink-0 overflow-hidden rounded-3xl bg-[#F0E8DA] h-52 w-52 lg:h-64 lg:w-64">
  <img
    src={selectedRushee.photo}
    alt={selectedRushee.name}
    className="h-full w-full object-cover object-center"
  />
</div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-extrabold">
                      #{selectedRushee.number} {selectedRushee.name}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      {selectedRushee.major || "No major"} ·{" "}
                      {selectedRushee.year || "No year"}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Seen at:{" "}
                      {selectedRushee.events.length > 0
                        ? selectedRushee.events.join(", ")
                        : "No events yet"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`/admin/rushees/${selectedRushee.id}`}
                        className="rounded-full border border-[#061A33] px-5 py-2 text-sm font-bold text-[#061A33]"
                      >
                        Admin Profile
                      </a>

                      <span className="rounded-full bg-[#F4F1EA] px-5 py-2 text-sm font-bold text-[#061A33]">
                        {selectedHashRound}
                      </span>

                      {lastDecision && (
                        <span className="rounded-full bg-[#EAF3EA] px-5 py-2 text-sm font-bold text-[#1F6B3A]">
                          {lastDecision}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#F4F1EA] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Application Summary
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedRushee.applicationSummary ||
                      "No summary provided."}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                    <p className="text-xl font-extrabold">
                      {getAverage(
                        selectedFeedback.map((item) => item.communication)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Comm</p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                    <p className="text-xl font-extrabold">
                      {getAverage(
                        selectedFeedback.map((item) => item.passion)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Passion</p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                    <p className="text-xl font-extrabold">
                      {getAverage(
                        selectedFeedback.map((item) => item.cultureFit)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Culture</p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                    <p className="text-xl font-extrabold">
                      {getAverage(
                        selectedFeedback.map((item) => item.fitAddScore)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Fit/Add</p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F1EA] p-4 text-center">
                    <p className="text-xl font-extrabold">
                      {selectedFeedback.length}
                    </p>
                    <p className="text-xs text-slate-500">Reviews</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-extrabold">Recent Comments</p>

                  <div className="mt-3 space-y-2">
                    {selectedFeedback.length === 0 && (
                      <p className="rounded-2xl bg-[#F4F1EA] p-4 text-sm text-slate-600">
                        No comments yet.
                      </p>
                    )}

                    {selectedFeedback.slice(0, 4).map((item) => (
                      <p
                        key={item.id}
                        className="rounded-2xl bg-[#F4F1EA] p-4 text-sm leading-6 text-slate-700"
                      >
                        {item.comment || "No comment provided."}
                      </p>
                    ))}
                  </div>
                </div>

                {history[selectedRushee.id] && (
                  <div className="mt-6 rounded-2xl border border-[#E5E0D8] p-4">
                    <p className="text-sm font-extrabold">Decision History</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {hashRounds.map((round) => {
                        const decision = history[selectedRushee.id]?.[round];

                        if (!decision) return null;

                        return (
                          <span
                            key={round}
                            className="rounded-full bg-[#F4F1EA] px-4 py-2 text-xs font-bold text-[#061A33]"
                          >
                            {round}: {decision}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {selectedHashRound !== "Final Hash #4" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateDecision(selectedRushee.id, "Advance")
                      }
                      className={`rounded-2xl border px-4 py-4 text-sm font-bold ${getDecisionButtonStyle(
                        lastDecision,
                        "Advance"
                      )}`}
                    >
                      Advance
                    </button>
                  )}

                  {selectedHashRound === "Final Hash #4" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateDecision(selectedRushee.id, "Bid / Accepted")
                      }
                      className={`rounded-2xl border px-4 py-4 text-sm font-bold ${getDecisionButtonStyle(
                        lastDecision,
                        "Bid / Accepted"
                      )}`}
                    >
                      Bid / Accepted
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      updateDecision(selectedRushee.id, "Needs More Votes")
                    }
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold ${getDecisionButtonStyle(
                      lastDecision,
                      "Needs More Votes"
                    )}`}
                  >
                    Needs More Votes
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDecision(selectedRushee.id, "Maybe")}
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold ${getDecisionButtonStyle(
                      lastDecision,
                      "Maybe"
                    )}`}
                  >
                    Maybe
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateDecision(selectedRushee.id, "Not Continuing")
                    }
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold ${getDecisionButtonStyle(
                      lastDecision,
                      "Not Continuing"
                    )}`}
                  >
                    Not Continuing
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDecision(selectedRushee.id, "Archive")}
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold ${getDecisionButtonStyle(
                      lastDecision,
                      "Archive"
                    )}`}
                  >
                    Archive
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}