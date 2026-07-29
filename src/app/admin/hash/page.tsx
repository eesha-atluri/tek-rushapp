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

type SearchBy = "All" | "Name" | "Rush Number" | "Major" | "Year";

type SortBy = "Rush Number" | "Name" | "Review Count" | "Stage";

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

function getStageStyle(stage: RusheeStage) {
  if (stage === "Hash #1") {
    return "bg-white text-[#061A33] border border-[#E5E0D8]";
  }

  if (stage === "Hash #2") {
    return "bg-[#EEF3F8] text-[#061A33] border border-[#E5E0D8]";
  }

  if (stage === "Hash #3") {
    return "bg-[#E8EEF6] text-[#061A33] border border-[#E5E0D8]";
  }

  if (stage === "Final Hash #4") {
    return "bg-[#FFF7E6] text-[#8A6500] border border-[#E5E0D8]";
  }

  if (stage === "Bid / Accepted") {
    return "bg-[#EAF3EA] text-[#1F6B3A] border border-[#E5E0D8]";
  }

  if (stage === "Not Continuing") {
    return "bg-[#F2E8E8] text-[#061A33] border border-[#E5E0D8]";
  }

  return "bg-slate-100 text-slate-700 border border-[#E5E0D8]";
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

  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<SearchBy>("All");
  const [sortBy, setSortBy] = useState<SortBy>("Rush Number");

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

  const filteredRushees = rusheeList
    .filter((rushee) => {
      const currentStage = stages[rushee.id] || "Hash #1";

      if (currentStage !== selectedHashRound) {
        return false;
      }

      const query = search.toLowerCase();

      let matchesSearch = true;

      if (query) {
        if (searchBy === "All") {
          matchesSearch =
            rushee.name.toLowerCase().includes(query) ||
            rushee.major.toLowerCase().includes(query) ||
            rushee.year.toLowerCase().includes(query) ||
            String(rushee.number).includes(query);
        }

        if (searchBy === "Name") {
          matchesSearch = rushee.name.toLowerCase().includes(query);
        }

        if (searchBy === "Rush Number") {
          matchesSearch = String(rushee.number).includes(query);
        }

        if (searchBy === "Major") {
          matchesSearch = rushee.major.toLowerCase().includes(query);
        }

        if (searchBy === "Year") {
          matchesSearch = rushee.year.toLowerCase().includes(query);
        }
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "Rush Number") {
        return a.number - b.number;
      }

      if (sortBy === "Name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "Review Count") {
        const aReviews = allFeedback.filter(
          (item) => item.rusheeId === a.id
        ).length;

        const bReviews = allFeedback.filter(
          (item) => item.rusheeId === b.id
        ).length;

        return bReviews - aReviews;
      }

      if (sortBy === "Stage") {
        const aStage = stages[a.id] || "Hash #1";
        const bStage = stages[b.id] || "Hash #1";

        return aStage.localeCompare(bStage);
      }

      return 0;
    });

  function exportHashCSV() {
    const rows = filteredRushees.map((rushee) => {
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
        hashDecision: history[rushee.id]?.[selectedHashRound] || "",
        events: rushee.events.join(", "),
        reviewCount: rusheeFeedback.length,
        communicationAvg,
        passionAvg,
        cultureFitAvg,
        fitAddAvg,
        fitCount,
        addCount,
        neitherCount,
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
          row.hashDecision,
          row.events,
          row.reviewCount,
          row.communicationAvg,
          row.passionAvg,
          row.cultureFitAvg,
          row.fitAddAvg,
          row.fitCount,
          row.addCount,
          row.neitherCount,
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
      .replaceAll(" ", "-")}-decisions.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Rush Decisions</h1>

        <p className="mt-2 text-sm text-white/70">
          Move rushees through each hash round while keeping decision history.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
          <button
            onClick={() => setSelectedHashRound("Hash #1")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Hash #1</p>
            <p className="text-3xl font-extrabold">{stageCounts.hash1}</p>
          </button>

          <button
            onClick={() => setSelectedHashRound("Hash #2")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Hash #2</p>
            <p className="text-3xl font-extrabold">{stageCounts.hash2}</p>
          </button>

          <button
            onClick={() => setSelectedHashRound("Hash #3")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Hash #3</p>
            <p className="text-3xl font-extrabold">{stageCounts.hash3}</p>
          </button>

          <button
            onClick={() => setSelectedHashRound("Final Hash #4")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Final Hash</p>
            <p className="text-3xl font-extrabold">{stageCounts.final}</p>
          </button>

          <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
            <p className="text-sm text-slate-500">Bid / Accepted</p>
            <p className="text-3xl font-extrabold text-[#1F6B3A]">
              {stageCounts.bid}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
            <p className="text-sm text-slate-500">Not Continuing</p>
            <p className="text-3xl font-extrabold">
              {stageCounts.notContinuing}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
            <p className="text-sm text-slate-500">Archived</p>
            <p className="text-3xl font-extrabold">{stageCounts.archived}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <label className="text-sm font-bold">
            Current Hash Round
            <select
              value={selectedHashRound}
              onChange={(event) =>
                setSelectedHashRound(event.target.value as HashRound)
              }
              className="mt-2 w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-normal outline-none"
            >
              {hashRounds.map((round) => (
                <option key={round}>{round}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-bold">
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search by ${searchBy.toLowerCase()}...`}
              className="mt-2 w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-normal shadow-sm outline-none"
            />
          </label>

          <label className="text-sm font-bold">
            Search By
            <select
              value={searchBy}
              onChange={(event) => setSearchBy(event.target.value as SearchBy)}
              className="mt-2 w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-normal shadow-sm outline-none"
            >
              <option>All</option>
              <option>Name</option>
              <option>Rush Number</option>
              <option>Major</option>
              <option>Year</option>
            </select>
          </label>

          <label className="text-sm font-bold">
            Sort By
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="mt-2 w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-normal shadow-sm outline-none"
            >
              <option>Rush Number</option>
              <option>Name</option>
              <option>Review Count</option>
              <option>Stage</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={exportHashCSV}
            className="rounded-xl bg-[#061A33] px-4 py-3 text-sm font-bold text-[#F4F1EA] shadow-sm"
          >
            Export Current Hash CSV
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {filteredRushees.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
              No rushees are currently in {selectedHashRound}.
            </div>
          )}

          {filteredRushees.map((rushee) => {
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

            const currentStage = stages[rushee.id] || "Hash #1";
            const lastDecision = history[rushee.id]?.[selectedHashRound];

            return (
              <div
                key={rushee.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex flex-1 gap-4">
                    <img
                      src={rushee.photo}
                      alt={rushee.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-lg font-extrabold">
                            #{rushee.number} {rushee.name}
                          </h2>

                          <p className="text-sm text-slate-500">
                            {rushee.major || "No major"} ·{" "}
                            {rushee.year || "No year"}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Events:{" "}
                            {rushee.events.length > 0
                              ? rushee.events.join(", ")
                              : "None selected"}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStageStyle(
                            currentStage
                          )}`}
                        >
                          {currentStage}
                        </span>
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
                          <p className="text-xs text-slate-500">Fit/Add</p>
                        </div>

                        <div className="rounded-xl bg-[#F4F1EA] p-3">
                          <p className="font-extrabold">
                            {rusheeFeedback.length}
                          </p>
                          <p className="text-xs text-slate-500">Reviews</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl border border-[#E5E0D8] p-3">
                          <p className="font-extrabold text-[#1F6B3A]">
                            {fitCount}
                          </p>
                          <p className="text-xs text-slate-500">Fit</p>
                        </div>

                        <div className="rounded-xl border border-[#E5E0D8] p-3">
                          <p className="font-extrabold text-[#061A33]">
                            {addCount}
                          </p>
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
                            Recent Comments
                          </p>

                          <div className="mt-2 space-y-2">
                            {rusheeFeedback.slice(0, 3).map((item) => (
                              <p
                                key={item.id}
                                className="rounded-lg bg-[#F4F1EA] p-2 text-sm text-slate-700"
                              >
                                {item.comment || "No comment provided."}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {history[rushee.id] && (
                        <div className="mt-4 rounded-xl border border-[#E5E0D8] p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Decision History
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {hashRounds.map((round) => {
                              const decision = history[rushee.id]?.[round];

                              if (!decision) return null;

                              return (
                                <span
                                  key={round}
                                  className="rounded-full bg-[#F4F1EA] px-3 py-1 text-xs font-bold"
                                >
                                  {round}: {decision}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full space-y-2 lg:w-56">
                    <a
                      href={`/admin/rushees/${rushee.id}`}
                      className="block rounded-xl border border-[#061A33] px-4 py-2 text-center text-sm font-bold text-[#061A33]"
                    >
                      Admin Profile
                    </a>

                    {selectedHashRound !== "Final Hash #4" && (
                      <button
                        onClick={() => updateDecision(rushee.id, "Advance")}
                        className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                          lastDecision,
                          "Advance"
                        )}`}
                      >
                        Advance
                      </button>
                    )}

                    {selectedHashRound === "Final Hash #4" && (
                      <button
                        onClick={() =>
                          updateDecision(rushee.id, "Bid / Accepted")
                        }
                        className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                          lastDecision,
                          "Bid / Accepted"
                        )}`}
                      >
                        Bid / Accepted
                      </button>
                    )}

                    <button
                      onClick={() =>
                        updateDecision(rushee.id, "Needs More Votes")
                      }
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        lastDecision,
                        "Needs More Votes"
                      )}`}
                    >
                      Needs More Votes
                    </button>

                    <button
                      onClick={() => updateDecision(rushee.id, "Maybe")}
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        lastDecision,
                        "Maybe"
                      )}`}
                    >
                      Maybe
                    </button>

                    <button
                      onClick={() =>
                        updateDecision(rushee.id, "Not Continuing")
                      }
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        lastDecision,
                        "Not Continuing"
                      )}`}
                    >
                      Not Continuing
                    </button>

                    <button
                      onClick={() => updateDecision(rushee.id, "Archive")}
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        lastDecision,
                        "Archive"
                      )}`}
                    >
                      Archive
                    </button>
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