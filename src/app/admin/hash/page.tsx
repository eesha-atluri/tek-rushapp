"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type RusheeStage =
  | "Hash #1"
  | "Hash #2"
  | "Hash #3"
  | "Final Hash #4"
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

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

type RusheeEventRow = {
  events: EventRow | EventRow[] | null;
};

type BrotherRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "brother";
};

type FeedbackRow = {
  id: string;
  brother_id: string;
  communication: number;
  passion: number;
  culture_fit: number;
  fit_add_choice: "Fit" | "Add" | "Neither";
  fit_add_score: number;
  comment: string | null;
  updated_at: string;
  brothers: BrotherRow | null;
};

type RusheeRow = {
  id: string;
  number: number;
  name: string;
  major: string | null;
  year: string | null;
  gender: string | null;
  photo: string | null;
  application_summary: string | null;
  assigned_brother_id: string | null;
  rushee_events?: RusheeEventRow[] | RusheeEventRow | null;
  feedback?: FeedbackRow[] | FeedbackRow | null;
};

type HashDecisionTableRow = {
  rushee_id: string;
  stage: RusheeStage;
};

const stages: RusheeStage[] = [
  "Hash #1",
  "Hash #2",
  "Hash #3",
  "Final Hash #4",
  "Bid / Accepted",
  "Not Continuing",
  "Archived",
];

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

function toArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getRusheeEvents(rushee: RusheeRow) {
  return toArray(rushee.rushee_events)
    .flatMap((item) => toArray(item.events))
    .filter((event): event is EventRow => Boolean(event));
}

function getRusheeFeedback(rushee: RusheeRow) {
  return toArray(rushee.feedback);
}

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

function getNextStage(stage: RusheeStage): RusheeStage {
  if (stage === "Hash #1") return "Hash #2";
  if (stage === "Hash #2") return "Hash #3";
  if (stage === "Hash #3") return "Final Hash #4";
  if (stage === "Final Hash #4") return "Bid / Accepted";

  return stage;
}

function getStageStyle(stage: RusheeStage) {
  if (stage === "Bid / Accepted") return "bg-[#EAF3EA] text-[#1F6B3A]";
  if (stage === "Not Continuing") return "bg-[#F5E8EA] text-[#8A1F2D]";
  if (stage === "Archived") return "bg-slate-100 text-slate-600";
  if (stage === "Final Hash #4") return "bg-[#FFF7E6] text-[#8A6500]";

  return "bg-[#F6F1E8] text-[#071E34]";
}

function getDecisionButtonStyle(
  lastDecision: HashDecision | undefined,
  buttonDecision: HashDecision
) {
  const isSelected = lastDecision === buttonDecision;

  if (isSelected) {
    return "border-[#071E34] bg-[#071E34] text-[#F6F1E8]";
  }

  return "border-[#071E34] bg-white text-[#071E34] hover:bg-[#F6F1E8]";
}

function getDecisionFromStageChange(
  oldStage: RusheeStage,
  newStage: RusheeStage
): HashDecision | null {
  if (newStage === "Not Continuing") return "Not Continuing";
  if (newStage === "Archived") return "Archive";
  if (newStage === "Bid / Accepted") return "Bid / Accepted";

  if (
    (oldStage === "Hash #1" && newStage === "Hash #2") ||
    (oldStage === "Hash #2" && newStage === "Hash #3") ||
    (oldStage === "Hash #3" && newStage === "Final Hash #4")
  ) {
    return "Advance";
  }

  return null;
}

export default function AdminHashPage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [rusheeList, setRusheeList] = useState<RusheeRow[]>([]);
  const [stageByRusheeId, setStageByRusheeId] = useState<
    Record<string, RusheeStage>
  >({});

  const [selectedStage, setSelectedStage] = useState<RusheeStage>("Hash #1");
  const [selectedRusheeId, setSelectedRusheeId] = useState<string | null>(null);

  const [lastDecisionByRushee, setLastDecisionByRushee] = useState<
    Record<string, HashDecision>
  >({});

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const admin = await requireAdmin();

    if (!admin) {
      router.push("/");
      return;
    }

    setCurrentBrother(admin);
    await loadHashData();
  }

  function getStageForRushee(rushee: RusheeRow): RusheeStage {
    return stageByRusheeId[rushee.id] || "Hash #1";
  }

  async function loadHashData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data: rusheesData, error: rusheesError } = await supabase
        .from("rushees")
        .select(
          `
          id,
          number,
          name,
          major,
          year,
          gender,
          photo,
          application_summary,
          assigned_brother_id,
          rushee_events (
            events (
              id,
              name,
              date,
              time,
              type
            )
          ),
          feedback (
            id,
            brother_id,
            communication,
            passion,
            culture_fit,
            fit_add_choice,
            fit_add_score,
            comment,
            updated_at,
            brothers (
              id,
              name,
              email,
              role
            )
          )
        `
        )
        .order("number", { ascending: true });

      if (rusheesError) {
        throw rusheesError;
      }

      const { data: stageRows, error: stageError } = await supabase
        .from("hash_decisions")
        .select("rushee_id, stage");

      if (stageError) {
        throw stageError;
      }

      const cleanRushees = (rusheesData || []) as unknown as RusheeRow[];
      const cleanStageRows = (stageRows || []) as HashDecisionTableRow[];

      const nextStageMap: Record<string, RusheeStage> = {};

      cleanRushees.forEach((rushee) => {
        nextStageMap[rushee.id] = "Hash #1";
      });

      cleanStageRows.forEach((row) => {
        nextStageMap[row.rushee_id] = row.stage;
      });

      setRusheeList(cleanRushees);
      setStageByRusheeId(nextStageMap);
    } catch (error) {
      console.error("Could not load hash data:", error);
      setErrorMessage("Could not load Rush Decisions from Supabase.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStage(
  rushee: RusheeRow,
  newStage: RusheeStage,
  decision?: HashDecision
) {
  try {
    setSaving(true);
    setErrorMessage("");

    const oldStage = stageByRusheeId[rushee.id] || "Hash #1";
    const currentViewingStage = selectedStage;

    const resolvedDecision =
      decision || getDecisionFromStageChange(oldStage, newStage) || undefined;

    const { data, error } = await supabase
      .from("hash_decisions")
      .upsert(
        {
          rushee_id: rushee.id,
          stage: newStage,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "rushee_id",
        }
      )
      .select("rushee_id, stage")
      .single();

    if (error) {
      throw error;
    }

    const savedStage = (data?.stage || newStage) as RusheeStage;

    const updatedStageMap = {
      ...stageByRusheeId,
      [rushee.id]: savedStage,
    };

    setStageByRusheeId(updatedStageMap);

    if (resolvedDecision) {
      setLastDecisionByRushee((current) => ({
        ...current,
        [rushee.id]: resolvedDecision,
      }));
    }

    // Stay on the category you were already viewing.
    setSelectedStage(currentViewingStage);

    // If the rushee moved out of this category, select the next rushee in the same category.
    if (savedStage !== currentViewingStage) {
      const query = search.toLowerCase();

      const remainingRusheesInCurrentCategory = rusheeList.filter((item) => {
        if (item.id === rushee.id) return false;

        const itemStage = updatedStageMap[item.id] || "Hash #1";
        const events = getRusheeEvents(item)
          .map((event) => event.name)
          .join(" ");

        const matchesSearch =
          item.name.toLowerCase().includes(query) ||
          String(item.number).includes(query) ||
          (item.major || "").toLowerCase().includes(query) ||
          (item.year || "").toLowerCase().includes(query) ||
          (item.gender || "").toLowerCase().includes(query) ||
          events.toLowerCase().includes(query);

        return itemStage === currentViewingStage && matchesSearch;
      });

      setSelectedRusheeId(remainingRusheesInCurrentCategory[0]?.id || null);
    } else {
      // If the rushee stayed in the same category, keep them selected.
      setSelectedRusheeId(rushee.id);
    }
  } catch (error: any) {
    console.error("Hash decision update failed:", error);

    const readableError =
      typeof error === "object"
        ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        : String(error);

    setErrorMessage(readableError);
    alert(readableError);
  } finally {
    setSaving(false);
  }
}

  async function handleDecision(rushee: RusheeRow, decision: HashDecision) {
    const currentStage = stageByRusheeId[rushee.id] || "Hash #1";

    let nextStage: RusheeStage = currentStage;

    if (decision === "Advance") {
      nextStage = getNextStage(currentStage);
    }

    if (decision === "Needs More Votes") {
      nextStage = currentStage;
    }

    if (decision === "Maybe") {
      nextStage = currentStage;
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

    await updateStage(rushee, nextStage, decision);
  }

  function exportCSV() {
    const rows = rusheeList.map((rushee) => {
      const feedback = getRusheeFeedback(rushee);
      const events = getRusheeEvents(rushee)
        .map((event) => event.name)
        .join(", ");

      const comments = feedback
        .map(
          (item) =>
            `${item.brothers?.name || "Unknown Brother"}: ${
              item.comment || "No comment"
            }`
        )
        .join(" | ");

      return {
        number: rushee.number,
        name: rushee.name,
        major: rushee.major || "",
        year: rushee.year || "",
        gender: rushee.gender || "",
        stage: stageByRusheeId[rushee.id] || "Hash #1",
        events,
        reviews: feedback.length,
        communicationAvg: getAverage(
          feedback.map((item) => item.communication)
        ),
        passionAvg: getAverage(feedback.map((item) => item.passion)),
        cultureAvg: getAverage(feedback.map((item) => item.culture_fit)),
        fitAddAvg: getAverage(feedback.map((item) => item.fit_add_score)),
        comments,
      };
    });

    const headers = [
      "Rush Number",
      "Name",
      "Major",
      "Year",
      "Gender",
      "Stage",
      "Events",
      "Reviews",
      "Communication Avg",
      "Passion Avg",
      "Culture Avg",
      "Fit/Add Avg",
      "Comments",
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.number,
          row.name,
          row.major,
          row.year,
          row.gender,
          row.stage,
          row.events,
          row.reviews,
          row.communicationAvg,
          row.passionAvg,
          row.cultureAvg,
          row.fitAddAvg,
          row.comments,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tek-rush-decisions.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const counts = useMemo(() => {
    return {
      hash1: rusheeList.filter(
        (rushee) => (stageByRusheeId[rushee.id] || "Hash #1") === "Hash #1"
      ).length,
      hash2: rusheeList.filter(
        (rushee) => stageByRusheeId[rushee.id] === "Hash #2"
      ).length,
      hash3: rusheeList.filter(
        (rushee) => stageByRusheeId[rushee.id] === "Hash #3"
      ).length,
      final: rusheeList.filter(
        (rushee) => stageByRusheeId[rushee.id] === "Final Hash #4"
      ).length,
      bid: rusheeList.filter(
        (rushee) => stageByRusheeId[rushee.id] === "Bid / Accepted"
      ).length,
      notContinuing: rusheeList.filter(
        (rushee) => stageByRusheeId[rushee.id] === "Not Continuing"
      ).length,
      archived: rusheeList.filter(
        (rushee) => stageByRusheeId[rushee.id] === "Archived"
      ).length,
    };
  }, [rusheeList, stageByRusheeId]);

  const stillDecidingCount =
    counts.hash1 + counts.hash2 + counts.hash3 + counts.final;

  const displayedRushees = useMemo(() => {
    return rusheeList.filter((rushee) => {
      const stage = stageByRusheeId[rushee.id] || "Hash #1";
      const events = getRusheeEvents(rushee)
        .map((event) => event.name)
        .join(" ");
      const query = search.toLowerCase();

      const matchesSearch =
        rushee.name.toLowerCase().includes(query) ||
        String(rushee.number).includes(query) ||
        (rushee.major || "").toLowerCase().includes(query) ||
        (rushee.year || "").toLowerCase().includes(query) ||
        (rushee.gender || "").toLowerCase().includes(query) ||
        events.toLowerCase().includes(query);

      return stage === selectedStage && matchesSearch;
    });
  }, [rusheeList, stageByRusheeId, selectedStage, search]);

  useEffect(() => {
    if (displayedRushees.length === 0) {
      setSelectedRusheeId(null);
      return;
    }

    const selectedStillVisible = displayedRushees.some(
      (rushee) => rushee.id === selectedRusheeId
    );

    if (!selectedRusheeId || !selectedStillVisible) {
      setSelectedRusheeId(displayedRushees[0].id);
    }
  }, [displayedRushees, selectedRusheeId]);

  const selectedRushee =
    displayedRushees.find((rushee) => rushee.id === selectedRusheeId) || null;

  const selectedFeedback = selectedRushee
    ? getRusheeFeedback(selectedRushee)
    : [];

  const selectedEvents = selectedRushee ? getRusheeEvents(selectedRushee) : [];

  const selectedCurrentStage = selectedRushee
    ? getStageForRushee(selectedRushee)
    : selectedStage;

  const lastDecision = selectedRushee
    ? lastDecisionByRushee[selectedRushee.id]
    : undefined;

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <AdminNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading Rush Decisions...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <AdminNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Admin
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Rush Decisions
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            Clean hash view for moving rushees through rounds, bid, not
            continuing, and archive.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Still Deciding</p>
            <p className="mt-2 text-4xl font-black">{stillDecidingCount}</p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Bid / Accepted</p>
            <p className="mt-2 text-4xl font-black text-[#1F6B3A]">
              {counts.bid}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Not Continuing</p>
            <p className="mt-2 text-4xl font-black text-[#8A1F2D]">
              {counts.notContinuing}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Archived</p>
            <p className="mt-2 text-4xl font-black">{counts.archived}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-7">
          {[
            ["Hash #1", "Hash #1", counts.hash1],
            ["Hash #2", "Hash #2", counts.hash2],
            ["Hash #3", "Hash #3", counts.hash3],
            ["Final", "Final Hash #4", counts.final],
            ["Bid", "Bid / Accepted", counts.bid],
            ["Not Continuing", "Not Continuing", counts.notContinuing],
            ["Archived", "Archived", counts.archived],
          ].map(([label, stage, count]) => (
            <button
              key={String(stage)}
              type="button"
              onClick={() => setSelectedStage(stage as RusheeStage)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedStage === stage
                  ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                  : "border-[#E5DDD0] bg-white text-[#071E34] hover:bg-[#F6F1E8]"
              }`}
            >
              <p
                className={`text-sm ${
                  selectedStage === stage ? "text-white/70" : "text-slate-500"
                }`}
              >
                {label}
              </p>

              <p className="mt-1 text-3xl font-black">{count}</p>
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr_auto] lg:items-end">
            <label className="text-sm font-bold">
              Show
              <select
                value={selectedStage}
                onChange={(event) =>
                  setSelectedStage(event.target.value as RusheeStage)
                }
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              >
                {stages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, number, major, event..."
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              />
            </label>

            <button
              type="button"
              onClick={exportCSV}
              className="rounded-2xl bg-[#071E34] px-5 py-3 text-sm font-bold text-[#F6F1E8]"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">{selectedStage}</h2>

            <p className="mt-1 text-sm text-slate-500">
              {displayedRushees.length} rushee
              {displayedRushees.length === 1 ? "" : "s"} shown
            </p>

            <div className="mt-5 space-y-3">
              {displayedRushees.length === 0 && (
                <p className="rounded-2xl bg-[#F6F1E8] p-4 text-sm text-slate-600">
                  No rushees in this category.
                </p>
              )}

              {displayedRushees.map((rushee) => {
                const feedbackCount = getRusheeFeedback(rushee).length;
                const isSelected = selectedRusheeId === rushee.id;

                return (
                  <button
                    key={rushee.id}
                    type="button"
                    onClick={() => setSelectedRusheeId(rushee.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                        : "border-[#E5DDD0] bg-white hover:bg-[#F6F1E8]"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F0E8DA]">
                        <img
                          src={rushee.photo || defaultPhoto}
                          alt={rushee.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-black">
                          #{rushee.number} {rushee.name}
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? "text-white/70" : "text-slate-500"
                          }`}
                        >
                          {rushee.major || "No major"} · {feedbackCount} review
                          {feedbackCount === 1 ? "" : "s"}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            isSelected ? "text-white/60" : "text-slate-400"
                          }`}
                        >
                          {rushee.year || "No year"}
                          {rushee.gender ? ` · ${rushee.gender}` : ""}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
            {!selectedRushee && (
              <div className="flex min-h-96 items-center justify-center rounded-2xl bg-[#F6F1E8] p-6 text-center text-sm text-slate-600">
                Select a rushee to review.
              </div>
            )}

            {selectedRushee && (
              <div>
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="h-60 w-60 shrink-0 overflow-hidden rounded-3xl bg-[#F0E8DA] lg:h-72 lg:w-72">
                    <img
                      src={selectedRushee.photo || defaultPhoto}
                      alt={selectedRushee.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1">
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold ${getStageStyle(
                        selectedCurrentStage
                      )}`}
                    >
                      {selectedCurrentStage}
                    </span>

                    {lastDecision && (
                      <span className="ml-2 rounded-full bg-[#EAF3EA] px-4 py-2 text-xs font-bold text-[#1F6B3A]">
                        {lastDecision}
                      </span>
                    )}

                    <h2 className="mt-4 text-4xl font-black">
                      #{selectedRushee.number} {selectedRushee.name}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      {selectedRushee.major || "No major"} ·{" "}
                      {selectedRushee.year || "No year"}
                      {selectedRushee.gender
                        ? ` · ${selectedRushee.gender}`
                        : ""}
                    </p>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Seen at:{" "}
                      {selectedEvents.length > 0
                        ? selectedEvents.map((event) => event.name).join(", ")
                        : "No events yet"}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <a
                        href={`/admin/rushees/${selectedRushee.id}`}
                        className="rounded-2xl border border-[#071E34] px-5 py-3 text-center text-sm font-bold text-[#071E34]"
                      >
                        Admin Profile
                      </a>
                      <a
  href={`/admin/feedback/${selectedRushee.id}`}
  className="rounded-2xl bg-[#071E34] px-5 py-3 text-center text-sm font-bold text-[#F6F1E8]"
>
  Leave Admin Note
</a>

                      <label className="text-sm font-bold">
                        Move to
                        <select
                          value={selectedCurrentStage}
                          onChange={(event) =>
                            updateStage(
                              selectedRushee,
                              event.target.value as RusheeStage
                            )
                          }
                          disabled={saving}
                          className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none disabled:opacity-50"
                        >
                          {stages.map((stage) => (
                            <option key={stage}>{stage}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#F6F1E8] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Application Summary
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedRushee.application_summary ||
                      "No summary provided."}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                    <p className="text-xl font-black">
                      {getAverage(
                        selectedFeedback.map((item) => item.communication)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Comm</p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                    <p className="text-xl font-black">
                      {getAverage(selectedFeedback.map((item) => item.passion))}
                    </p>
                    <p className="text-xs text-slate-500">Passion</p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                    <p className="text-xl font-black">
                      {getAverage(
                        selectedFeedback.map((item) => item.culture_fit)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Culture</p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                    <p className="text-xl font-black">
                      {getAverage(
                        selectedFeedback.map((item) => item.fit_add_score)
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Fit/Add</p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                    <p className="text-xl font-black">
                      {selectedFeedback.length}
                    </p>
                    <p className="text-xs text-slate-500">Reviews</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {selectedCurrentStage !== "Final Hash #4" &&
                    selectedCurrentStage !== "Bid / Accepted" &&
                    selectedCurrentStage !== "Not Continuing" &&
                    selectedCurrentStage !== "Archived" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDecision(selectedRushee, "Advance")
                        }
                        disabled={saving}
                        className={`rounded-2xl border px-4 py-4 text-sm font-bold disabled:opacity-50 ${getDecisionButtonStyle(
                          lastDecision,
                          "Advance"
                        )}`}
                      >
                        Advance
                      </button>
                    )}

                  {selectedCurrentStage === "Final Hash #4" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDecision(selectedRushee, "Bid / Accepted")
                      }
                      disabled={saving}
                      className={`rounded-2xl border px-4 py-4 text-sm font-bold disabled:opacity-50 ${getDecisionButtonStyle(
                        lastDecision,
                        "Bid / Accepted"
                      )}`}
                    >
                      Bid / Accepted
                    </button>
                  )}

                  {selectedCurrentStage !== "Bid / Accepted" &&
                    selectedCurrentStage !== "Not Continuing" &&
                    selectedCurrentStage !== "Archived" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleDecision(selectedRushee, "Needs More Votes")
                          }
                          disabled={saving}
                          className={`rounded-2xl border px-4 py-4 text-sm font-bold disabled:opacity-50 ${getDecisionButtonStyle(
                            lastDecision,
                            "Needs More Votes"
                          )}`}
                        >
                          Needs More Votes
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDecision(selectedRushee, "Maybe")}
                          disabled={saving}
                          className={`rounded-2xl border px-4 py-4 text-sm font-bold disabled:opacity-50 ${getDecisionButtonStyle(
                            lastDecision,
                            "Maybe"
                          )}`}
                        >
                          Maybe
                        </button>
                      </>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      handleDecision(selectedRushee, "Not Continuing")
                    }
                    disabled={saving}
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold disabled:opacity-50 ${getDecisionButtonStyle(
                      lastDecision,
                      "Not Continuing"
                    )}`}
                  >
                    Not Continuing
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision(selectedRushee, "Archive")}
                    disabled={saving}
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold disabled:opacity-50 ${getDecisionButtonStyle(
                      lastDecision,
                      "Archive"
                    )}`}
                  >
                    Archive
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-black">Recent Comments</p>

                  <div className="mt-3 space-y-2">
                    {selectedFeedback.length === 0 && (
                      <p className="rounded-2xl bg-[#F6F1E8] p-4 text-sm text-slate-600">
                        No comments yet.
                      </p>
                    )}

                    {selectedFeedback.slice(0, 5).map((item) => (
                      <p
                        key={item.id}
                        className="rounded-2xl bg-[#F6F1E8] p-4 text-sm leading-6 text-slate-700"
                      >
                        <span className="font-bold text-[#071E34]">
                          {item.brothers?.name || "Unknown Brother"}:
                        </span>{" "}
                        {item.comment || "No comment provided."}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}