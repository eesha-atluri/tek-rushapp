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

type RusheeStatus =
  | "Active Rush"
  | "Needs More Feedback"
  | "Next Round"
  | "Maybe"
  | "Do Not Continue"
  | "Archived";

type SearchBy = "All" | "Name" | "Rush Number" | "Major" | "Year";

type SortBy = "Rush Number" | "Name" | "Review Count" | "Status";

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

function getStatusStyle(status: RusheeStatus) {
  if (status === "Active Rush") {
    return "bg-[#EAF3EA] text-[#1F6B3A]";
  }

  if (status === "Needs More Feedback") {
    return "bg-[#FFF6E0] text-[#8A6500]";
  }

  if (status === "Next Round") {
    return "bg-[#E8EEF6] text-[#061A33]";
  }

  if (status === "Maybe") {
    return "bg-[#F8EAF0] text-[#061A33]";
  }

  if (status === "Do Not Continue") {
    return "bg-[#F5E5E8] text-[#061A33]";
  }

  return "bg-slate-100 text-slate-700";
}

function getDecisionButtonStyle(
  currentStatus: RusheeStatus,
  buttonStatus: RusheeStatus
) {
  const isSelected = currentStatus === buttonStatus;

  if (isSelected) {
    return "bg-[#061A33] text-white border-[#061A33]";
  }

  return "bg-white text-[#061A33] border-[#061A33] hover:bg-[#F4F1EA]";
}

export default function HashDashboardPage() {
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RusheeStatus>>({});
  const [selectedFilter, setSelectedFilter] = useState<RusheeStatus | "All">(
    "All"
  );

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

    const savedStatusesString = localStorage.getItem("tek-rushee-statuses");

    if (savedStatusesString) {
      setStatuses(JSON.parse(savedStatusesString));
    } else {
      const defaultStatuses: Record<string, RusheeStatus> = {};

      storedRushees.forEach((rushee) => {
        defaultStatuses[rushee.id] = "Active Rush";
      });

      setStatuses(defaultStatuses);

      localStorage.setItem(
        "tek-rushee-statuses",
        JSON.stringify(defaultStatuses)
      );
    }
  }, []);

  function updateStatus(rusheeId: string, newStatus: RusheeStatus) {
    const updatedStatuses = {
      ...statuses,
      [rusheeId]: newStatus,
    };

    setStatuses(updatedStatuses);

    localStorage.setItem(
      "tek-rushee-statuses",
      JSON.stringify(updatedStatuses)
    );
  }

  const statusCounts = {
    all: rusheeList.length,
    active: Object.values(statuses).filter(
      (status) => status === "Active Rush"
    ).length,
    needs: Object.values(statuses).filter(
      (status) => status === "Needs More Feedback"
    ).length,
    next: Object.values(statuses).filter((status) => status === "Next Round")
      .length,
    maybe: Object.values(statuses).filter((status) => status === "Maybe")
      .length,
    notContinue: Object.values(statuses).filter(
      (status) => status === "Do Not Continue"
    ).length,
    archived: Object.values(statuses).filter((status) => status === "Archived")
      .length,
  };

  const filteredRushees = rusheeList
    .filter((rushee) => {
      const currentStatus = statuses[rushee.id] || "Active Rush";

      const matchesFilter =
        selectedFilter === "All" || currentStatus === selectedFilter;

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

      return matchesFilter && matchesSearch;
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

      if (sortBy === "Status") {
        const aStatus = statuses[a.id] || "Active Rush";
        const bStatus = statuses[b.id] || "Active Rush";

        return aStatus.localeCompare(bStatus);
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
        status: statuses[rushee.id] || "Active Rush",
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
      "Status",
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
          row.status,
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
    link.download = "tek-hash-dashboard.csv";
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

        <h1 className="mt-1 text-2xl font-extrabold">Hash Dashboard</h1>

        <p className="mt-2 text-sm text-slate-300">
          Review feedback, filter rushees, and move them through the rush
          process.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <button
            onClick={() => setSelectedFilter("All")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">All Rushees</p>
            <p className="text-3xl font-extrabold">{statusCounts.all}</p>
          </button>

          <button
            onClick={() => setSelectedFilter("Active Rush")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Active Rush</p>
            <p className="text-3xl font-extrabold text-[#1F6B3A]">
              {statusCounts.active}
            </p>
          </button>

          <button
            onClick={() => setSelectedFilter("Needs More Feedback")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Needs Feedback</p>
            <p className="text-3xl font-extrabold text-[#8A6500]">
              {statusCounts.needs}
            </p>
          </button>

          <button
            onClick={() => setSelectedFilter("Next Round")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Next Round</p>
            <p className="text-3xl font-extrabold text-[#061A33]">
              {statusCounts.next}
            </p>
          </button>

          <button
            onClick={() => setSelectedFilter("Maybe")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Maybe</p>
            <p className="text-3xl font-extrabold text-[#061A33]">
              {statusCounts.maybe}
            </p>
          </button>

          <button
            onClick={() => setSelectedFilter("Archived")}
            className="rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Archived</p>
            <p className="text-3xl font-extrabold text-slate-700">
              {statusCounts.archived}
            </p>
          </button>
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
              <option>Status</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={exportHashCSV}
            className="rounded-xl bg-[#061A33] px-4 py-3 text-sm font-bold text-white shadow-sm"
          >
            Export Current View CSV
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "All",
            "Active Rush",
            "Needs More Feedback",
            "Next Round",
            "Maybe",
            "Do Not Continue",
            "Archived",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as RusheeStatus | "All")}
              className={`rounded-full border px-4 py-2 text-xs font-bold ${
                selectedFilter === filter
                  ? "border-[#061A33] bg-[#061A33] text-white"
                  : "border-slate-300 bg-white text-[#061A33]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {filteredRushees.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
              No rushees match this search or filter.
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

            const currentStatus = statuses[rushee.id] || "Active Rush";

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
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            currentStatus
                          )}`}
                        >
                          {currentStatus}
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
                    </div>
                  </div>

                  <div className="w-full space-y-2 lg:w-56">
                   <a
                    href={`/admin/rushees/${rushee.id}`}
                    className="block rounded-xl border border-[#061A33] px-4 py-2 text-center text-sm font-bold text-[#061A33]"
                    >
                    Admin Profile
                    </a>

                    <button
                      onClick={() => updateStatus(rushee.id, "Next Round")}
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        currentStatus,
                        "Next Round"
                      )}`}
                    >
                      Move to Next Round
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(rushee.id, "Needs More Feedback")
                      }
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        currentStatus,
                        "Needs More Feedback"
                      )}`}
                    >
                      Needs Feedback
                    </button>

                    <button
                      onClick={() => updateStatus(rushee.id, "Maybe")}
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        currentStatus,
                        "Maybe"
                      )}`}
                    >
                      Maybe
                    </button>

                    <button
                      onClick={() => updateStatus(rushee.id, "Do Not Continue")}
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        currentStatus,
                        "Do Not Continue"
                      )}`}
                    >
                      Do Not Continue
                    </button>

                    <button
                      onClick={() => updateStatus(rushee.id, "Archived")}
                      className={`w-full rounded-xl border px-4 py-2 text-sm font-bold transition ${getDecisionButtonStyle(
                        currentStatus,
                        "Archived"
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