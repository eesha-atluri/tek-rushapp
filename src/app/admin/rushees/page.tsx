"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type BrotherRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "brother";
};

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

type RusheeStage =
  | "Hash #1"
  | "Hash #2"
  | "Hash #3"
  | "Final Hash #4"
  | "Bid / Accepted"
  | "Not Continuing"
  | "Archived";

type RusheeEventRow = {
  event_id: string;
  events: EventRow | EventRow[] | null;
};

type RequiredFeedbackRow = {
  brother_id: string;
  brothers: BrotherRow | BrotherRow[] | null;
};

type HashDecisionRow = {
  stage: RusheeStage;
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
  rushee_events?: RusheeEventRow[] | RusheeEventRow | null;
  required_feedback?: RequiredFeedbackRow[] | RequiredFeedbackRow | null;
  hash_decisions?: HashDecisionRow[] | HashDecisionRow | null;
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

function getStageStyle(stage: string) {
  if (stage === "Bid / Accepted") return "bg-[#EAF3EA] text-[#1F6B3A]";
  if (stage === "Not Continuing") return "bg-[#F5E8EA] text-[#8A1F2D]";
  if (stage === "Archived") return "bg-slate-100 text-slate-600";
  if (stage === "Final Hash #4") return "bg-[#FFF7E6] text-[#8A6500]";

  return "bg-[#F6F1E8] text-[#071E34]";
}

function getRusheeStage(rushee: RusheeRow): RusheeStage {
  const decision = rushee.hash_decisions;

  if (!decision) return "Hash #1";

  if (Array.isArray(decision)) {
    return decision[0]?.stage || "Hash #1";
  }

  return decision.stage || "Hash #1";
}

function getRusheeEventIds(rushee: RusheeRow) {
  return toArray(rushee.rushee_events).map((item) => item.event_id);
}

function getRusheeEventNames(rushee: RusheeRow) {
  return toArray(rushee.rushee_events)
    .flatMap((item) => toArray(item.events))
    .map((event) => event.name)
    .filter(Boolean);
}

function getRequiredBrotherIds(rushee: RusheeRow) {
  return toArray(rushee.required_feedback).map((item) => item.brother_id);
}

function getBrotherName(brotherList: BrotherRow[], brotherId: string) {
  return brotherList.find((brother) => brother.id === brotherId)?.name || "";
}

function getRequiredBrotherNames(
  rushee: RusheeRow,
  brotherList: BrotherRow[]
) {
  const requiredIds = getRequiredBrotherIds(rushee);

  if (requiredIds.length === 0) {
    return "None yet";
  }

  return requiredIds
    .map((brotherId) => getBrotherName(brotherList, brotherId))
    .filter(Boolean)
    .join(", ");
}

function formatError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
  }

  return String(error);
}

export default function AdminRusheesPage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [rusheeList, setRusheeList] = useState<RusheeRow[]>([]);
  const [eventList, setEventList] = useState<EventRow[]>([]);
  const [brotherList, setBrotherList] = useState<BrotherRow[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState("");
  const [applicationSummary, setApplicationSummary] = useState("");
  const [selectedStage, setSelectedStage] = useState<RusheeStage>("Hash #1");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedRequiredBrotherIds, setSelectedRequiredBrotherIds] = useState<
    string[]
  >([]);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [majorFilter, setMajorFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [requiredBrotherFilter, setRequiredBrotherFilter] = useState("All");

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
    await loadPageData();
  }

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [rusheesResponse, eventsResponse, brothersResponse] =
        await Promise.all([
          supabase
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
              rushee_events (
                event_id,
                events (
                  id,
                  name,
                  date,
                  time,
                  type
                )
              ),
              required_feedback (
                brother_id,
                brothers (
                  id,
                  name,
                  email,
                  role
                )
              ),
              hash_decisions (
                stage
              )
            `
            )
            .order("number", { ascending: true }),

          supabase
            .from("events")
            .select("id, name, date, time, type")
            .order("created_at", { ascending: true }),

          supabase
            .from("brothers")
            .select("id, name, email, role")
            .order("name", { ascending: true }),
        ]);

      if (rusheesResponse.error) throw rusheesResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;
      if (brothersResponse.error) throw brothersResponse.error;

      setRusheeList((rusheesResponse.data || []) as unknown as RusheeRow[]);
      setEventList((eventsResponse.data || []) as EventRow[]);
      setBrotherList((brothersResponse.data || []) as BrotherRow[]);
    } catch (error) {
      console.error("Could not load rushees:", error);
      setErrorMessage(formatError(error));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setNumber("");
    setName("");
    setMajor("");
    setYear("");
    setGender("");
    setPhoto("");
    setApplicationSummary("");
    setSelectedStage("Hash #1");
    setSelectedEventIds([]);
    setSelectedRequiredBrotherIds([]);
    setErrorMessage("");
  }

  function startEditing(rushee: RusheeRow) {
    setEditingId(rushee.id);
    setNumber(String(rushee.number));
    setName(rushee.name);
    setMajor(rushee.major || "");
    setYear(rushee.year || "");
    setGender(rushee.gender || "");
    setPhoto(rushee.photo || "");
    setApplicationSummary(rushee.application_summary || "");
    setSelectedStage(getRusheeStage(rushee));
    setSelectedEventIds(getRusheeEventIds(rushee));
    setSelectedRequiredBrotherIds(getRequiredBrotherIds(rushee));
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleEvent(eventId: string) {
    if (selectedEventIds.includes(eventId)) {
      setSelectedEventIds(selectedEventIds.filter((id) => id !== eventId));
      return;
    }

    setSelectedEventIds([...selectedEventIds, eventId]);
  }

  function toggleRequiredBrother(brotherId: string) {
    if (selectedRequiredBrotherIds.includes(brotherId)) {
      setSelectedRequiredBrotherIds(
        selectedRequiredBrotherIds.filter((id) => id !== brotherId)
      );
      return;
    }

    setSelectedRequiredBrotherIds([...selectedRequiredBrotherIds, brotherId]);
  }

  async function syncRusheeEvents(rusheeId: string) {
    const { error: deleteError } = await supabase
      .from("rushee_events")
      .delete()
      .eq("rushee_id", rusheeId);

    if (deleteError) throw deleteError;

    if (selectedEventIds.length === 0) return;

    const rows = selectedEventIds.map((eventId) => ({
      rushee_id: rusheeId,
      event_id: eventId,
    }));

    const { error: insertError } = await supabase
      .from("rushee_events")
      .insert(rows);

    if (insertError) throw insertError;
  }

  async function syncRequiredFeedback(rusheeId: string) {
    console.log("Saving required feedback:", {
      rusheeId,
      selectedRequiredBrotherIds,
    });

    const { error: deleteError } = await supabase
      .from("required_feedback")
      .delete()
      .eq("rushee_id", rusheeId);

    if (deleteError) {
      console.error("Required feedback delete failed:", deleteError);
      throw deleteError;
    }

    if (selectedRequiredBrotherIds.length === 0) {
      console.log("No required feedback brothers selected.");
      return;
    }

    const rows = selectedRequiredBrotherIds.map((brotherId) => ({
      rushee_id: rusheeId,
      brother_id: brotherId,
    }));

    console.log("Required feedback rows to insert:", rows);

    const { data, error: insertError } = await supabase
      .from("required_feedback")
      .insert(rows)
      .select("id, rushee_id, brother_id");

    if (insertError) {
      console.error("Required feedback insert failed:", insertError);
      throw insertError;
    }

    console.log("Required feedback saved:", data);

    if (!data || data.length !== selectedRequiredBrotherIds.length) {
      throw new Error(
        `Required feedback save mismatch. Selected ${selectedRequiredBrotherIds.length}, saved ${
          data?.length || 0
        }.`
      );
    }
  }

  async function syncHashDecision(rusheeId: string) {
    const { error } = await supabase.from("hash_decisions").upsert(
      {
        rushee_id: rusheeId,
        stage: selectedStage,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "rushee_id",
      }
    );

    if (error) throw error;
  }

  async function saveRushee() {
    const trimmedName = name.trim();
    const parsedNumber = Number(number);

    if (!trimmedName) {
      setErrorMessage("Name is required.");
      return;
    }

    if (!parsedNumber || parsedNumber < 1) {
      setErrorMessage("Rush number must be a positive number.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      console.log("Saving rushee form:", {
        editingId,
        selectedRequiredBrotherIds,
        selectedEventIds,
      });

      const payload = {
        number: parsedNumber,
        name: trimmedName,
        major,
        year,
        gender,
        photo: photo || defaultPhoto,
        application_summary: applicationSummary,
      };

      let rusheeId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from("rushees")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("rushees")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        rusheeId = data.id;
      }

      if (!rusheeId) {
        throw new Error("No rushee ID found after save.");
      }

      await syncRusheeEvents(rusheeId);
      await syncRequiredFeedback(rusheeId);
      await syncHashDecision(rusheeId);

      const { data: checkRequiredRows, error: checkRequiredError } =
        await supabase
          .from("required_feedback")
          .select("id, rushee_id, brother_id")
          .eq("rushee_id", rusheeId);

      if (checkRequiredError) {
        throw checkRequiredError;
      }

      console.log("Required feedback after save:", checkRequiredRows);

      if (
        selectedRequiredBrotherIds.length > 0 &&
        (!checkRequiredRows ||
          checkRequiredRows.length !== selectedRequiredBrotherIds.length)
      ) {
        throw new Error(
          `Required feedback did not save correctly. Selected ${selectedRequiredBrotherIds.length}, found ${
            checkRequiredRows?.length || 0
          } rows after save.`
        );
      }

      resetForm();
      await loadPageData();
    } catch (error) {
      console.error("Save rushee failed:", error);

      const readableError = formatError(error);

      alert(readableError);
      setErrorMessage(readableError);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRushee(rushee: RusheeRow) {
    const confirmed = window.confirm(
      `Delete #${rushee.number} ${rushee.name}? This will remove their events, feedback, required feedback assignments, and hash decision.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const { error } = await supabase
        .from("rushees")
        .delete()
        .eq("id", rushee.id);

      if (error) throw error;

      if (editingId === rushee.id) {
        resetForm();
      }

      await loadPageData();
    } catch (error) {
      console.error("Delete rushee failed:", error);
      setErrorMessage(formatError(error));
    } finally {
      setSaving(false);
    }
  }

  async function quickUpdateStage(rusheeId: string, stage: RusheeStage) {
    try {
      const { error } = await supabase.from("hash_decisions").upsert(
        {
          rushee_id: rusheeId,
          stage,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "rushee_id",
        }
      );

      if (error) throw error;

      await loadPageData();
    } catch (error) {
      console.error("Quick stage update failed:", error);
      setErrorMessage(formatError(error));
    }
  }

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(rusheeList.map((rushee) => rushee.year || "").filter(Boolean))
    ).sort();
  }, [rusheeList]);

  const majorOptions = useMemo(() => {
    return Array.from(
      new Set(rusheeList.map((rushee) => rushee.major || "").filter(Boolean))
    ).sort();
  }, [rusheeList]);

  const genderOptions = useMemo(() => {
    return Array.from(
      new Set(rusheeList.map((rushee) => rushee.gender || "").filter(Boolean))
    ).sort();
  }, [rusheeList]);

  const filteredRushees = useMemo(() => {
    return rusheeList.filter((rushee) => {
      const stage = getRusheeStage(rushee);
      const eventNames = getRusheeEventNames(rushee).join(" ");
      const requiredIds = getRequiredBrotherIds(rushee);
      const requiredNames = requiredIds
        .map((brotherId) => getBrotherName(brotherList, brotherId))
        .join(" ");
      const query = search.toLowerCase();

      const matchesSearch =
        rushee.name.toLowerCase().includes(query) ||
        String(rushee.number).includes(query) ||
        (rushee.major || "").toLowerCase().includes(query) ||
        (rushee.year || "").toLowerCase().includes(query) ||
        (rushee.gender || "").toLowerCase().includes(query) ||
        eventNames.toLowerCase().includes(query) ||
        requiredNames.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (stageFilter !== "All" && stage !== stageFilter) return false;
      if (yearFilter !== "All" && rushee.year !== yearFilter) return false;
      if (majorFilter !== "All" && rushee.major !== majorFilter) return false;
      if (genderFilter !== "All" && rushee.gender !== genderFilter) {
        return false;
      }

      if (
        requiredBrotherFilter !== "All" &&
        !requiredIds.includes(requiredBrotherFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    rusheeList,
    brotherList,
    search,
    stageFilter,
    yearFilter,
    majorFilter,
    genderFilter,
    requiredBrotherFilter,
  ]);

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <AdminNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading rushees...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
      <AdminNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Admin
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">Rushees</h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            Manage rushees, events attended, hash stage, and required feedback
            brothers.
          </p>
        </section>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 xl:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                {editingId ? "Edit Rushee" : "Add Rushee"}
              </h2>

              {editingId && (
                <p className="mt-2 w-fit rounded-full bg-[#FFF7E6] px-4 py-2 text-xs font-bold text-[#8A6500]">
                  Editing mode
                </p>
              )}
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-full border border-[#071E34] px-4 py-2 text-sm font-bold text-[#071E34] disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>

          {errorMessage && (
            <p className="mt-5 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D] whitespace-pre-wrap">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[0.5fr_1.5fr]">
              <label className="text-sm font-bold">
                Rush #
                <input
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  placeholder="1"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>

              <label className="text-sm font-bold">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-bold">
                Major
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  placeholder="Computer Science"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>

              <label className="text-sm font-bold">
                Year / Grade
                <input
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  placeholder="Sophomore"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>

              <label className="text-sm font-bold">
                Gender
                <input
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>
            </div>

            <label className="text-sm font-bold">
              Photo URL
              <input
                value={photo}
                onChange={(event) => setPhoto(event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              />
            </label>

            <label className="text-sm font-bold">
              Application Summary
              <textarea
                value={applicationSummary}
                onChange={(event) => setApplicationSummary(event.target.value)}
                placeholder="Short summary from the application..."
                className="mt-2 min-h-28 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              />
            </label>

            <label className="text-sm font-bold">
              Stage
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

            <div>
              <p className="text-sm font-bold">Events Attended</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {eventList.map((event) => {
                  const selected = selectedEventIds.includes(event.id);

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleEvent(event.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold ${
                        selected
                          ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                          : "border-[#071E34] bg-white text-[#071E34] hover:bg-[#F6F1E8]"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {event.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">
                    Required Feedback Brothers
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Pick the brothers the rushee said they talked to. These
                    brothers will see this rushee under Required Feedback.
                  </p>
                </div>

                <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-[#071E34]">
                  {selectedRequiredBrotherIds.length} selected
                </span>
              </div>

              <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-2xl border border-[#E5DDD0] p-3">
                {brotherList.map((brother) => {
                  const selected = selectedRequiredBrotherIds.includes(
                    brother.id
                  );

                  return (
                    <button
                      key={brother.id}
                      type="button"
                      onClick={() => toggleRequiredBrother(brother.id)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold ${
                        selected
                          ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                          : "border-[#E5DDD0] bg-white text-[#071E34] hover:bg-[#F6F1E8]"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {brother.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={saveRushee}
              disabled={saving}
              className="rounded-2xl bg-[#071E34] px-5 py-4 text-sm font-bold text-[#F6F1E8] disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Add Rushee"}
            </button>
          </div>
        </aside>

        <section>
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="text-sm font-bold lg:col-span-3">
                Search
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, number, major, year, event, brother..."
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>

              <label className="text-sm font-bold">
                Stage
                <select
                  value={stageFilter}
                  onChange={(event) => setStageFilter(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                >
                  <option>All</option>
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Year
                <select
                  value={yearFilter}
                  onChange={(event) => setYearFilter(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                >
                  <option>All</option>
                  {yearOptions.map((yearOption) => (
                    <option key={yearOption}>{yearOption}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Major
                <select
                  value={majorFilter}
                  onChange={(event) => setMajorFilter(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                >
                  <option>All</option>
                  {majorOptions.map((majorOption) => (
                    <option key={majorOption}>{majorOption}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Gender
                <select
                  value={genderFilter}
                  onChange={(event) => setGenderFilter(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                >
                  <option>All</option>
                  {genderOptions.map((genderOption) => (
                    <option key={genderOption}>{genderOption}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Required Brother
                <select
                  value={requiredBrotherFilter}
                  onChange={(event) =>
                    setRequiredBrotherFilter(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                >
                  <option>All</option>
                  {brotherList.map((brother) => (
                    <option key={brother.id} value={brother.id}>
                      {brother.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl bg-[#F6F1E8] p-4">
                <p className="text-sm text-slate-500">Showing</p>
                <p className="mt-1 text-3xl font-black">
                  {filteredRushees.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredRushees.length === 0 && (
              <p className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600 shadow-sm">
                No rushees match this view.
              </p>
            )}

            {filteredRushees.map((rushee) => {
              const stage = getRusheeStage(rushee);
              const eventNames = getRusheeEventNames(rushee);

              return (
                <article
                  key={rushee.id}
                  className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 lg:grid-cols-[8rem_1fr]">
                    <div className="h-40 w-full overflow-hidden rounded-3xl bg-[#F0E8DA] lg:h-32 lg:w-32">
                      <img
                        src={rushee.photo || defaultPhoto}
                        alt={rushee.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div>
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-black">
                              #{rushee.number} {rushee.name}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getStageStyle(
                                stage
                              )}`}
                            >
                              {stage}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-600">
                            {rushee.major || "No major"} ·{" "}
                            {rushee.year || "No year"}
                            {rushee.gender ? ` · ${rushee.gender}` : ""}
                          </p>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            Events:{" "}
                            {eventNames.length > 0
                              ? eventNames.join(", ")
                              : "No events yet"}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Required Feedback:{" "}
                            <span className="font-bold text-[#071E34]">
                              {getRequiredBrotherNames(rushee, brotherList)}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(rushee)}
                            disabled={saving}
                            className="rounded-full border border-[#071E34] px-5 py-2 text-sm font-bold text-[#071E34] disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <a
                            href={`/admin/rushees/${rushee.id}`}
                            className="rounded-full border border-[#071E34] px-5 py-2 text-sm font-bold text-[#071E34]"
                          >
                            Profile
                          </a>

                          <button
                            type="button"
                            onClick={() => deleteRushee(rushee)}
                            disabled={saving}
                            className="rounded-full border border-[#8A1F2D] px-5 py-2 text-sm font-bold text-[#8A1F2D] disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-sm font-bold">
                          Quick Stage
                          <select
                            value={stage}
                            onChange={(event) =>
                              quickUpdateStage(
                                rushee.id,
                                event.target.value as RusheeStage
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                          >
                            {stages.map((stageOption) => (
                              <option key={stageOption}>{stageOption}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}