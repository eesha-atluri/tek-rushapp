"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/app/components/AdminNav";
import { getBrothers, type Brother } from "@/lib/backend/brothers";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  type EventItem,
  type EventType,
} from "@/lib/backend/events";

export default function AdminEventsPage() {
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [brotherList, setBrotherList] = useState<Brother[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<EventType>("Open Rush");
  const [assignedBrotherIds, setAssignedBrotherIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [events, brothers] = await Promise.all([
        getEvents(),
        getBrothers(),
      ]);

      setEventList(events);
      setBrotherList(brothers);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load events. Check Supabase tables and keys.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDate("");
    setTime("");
    setType("Open Rush");
    setAssignedBrotherIds([]);
    setErrorMessage("");
  }

  function toggleBrother(brotherId: string) {
    if (assignedBrotherIds.includes(brotherId)) {
      setAssignedBrotherIds(
        assignedBrotherIds.filter((id) => id !== brotherId)
      );
      return;
    }

    setAssignedBrotherIds([...assignedBrotherIds, brotherId]);
  }

  function startEditing(eventItem: EventItem) {
    setEditingId(eventItem.id);
    setName(eventItem.name);
    setDate(eventItem.date);
    setTime(eventItem.time);
    setType(eventItem.type);
    setAssignedBrotherIds(eventItem.assignedBrotherIds || []);
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveEvent() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Event name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (editingId) {
        await updateEvent({
          id: editingId,
          name: trimmedName,
          date,
          time,
          type,
          assignedBrotherIds,
        });
      } else {
        await createEvent({
          name: trimmedName,
          date,
          time,
          type,
          assignedBrotherIds,
        });
      }

      resetForm();
      await loadPageData();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save event. Check Supabase permissions.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent(eventItem: EventItem) {
    const confirmed = window.confirm(
      `Delete "${eventItem.name}"? This will also remove its brother assignments.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setErrorMessage("");

      await deleteEvent(eventItem.id);

      if (editingId === eventItem.id) {
        resetForm();
      }

      await loadPageData();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not delete event. Check Supabase permissions.");
    } finally {
      setSaving(false);
    }
  }

  function getBrotherNames(assignedIds: string[]) {
    const names = assignedIds
      .map((id) => brotherList.find((brother) => brother.id === id)?.name)
      .filter(Boolean);

    return names.length > 0 ? names.join(", ") : "No brothers assigned";
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
      <AdminNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Admin
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">Events</h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            Edit rush events and assign brothers to cover each event.
          </p>
        </section>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                {editingId ? "Edit Event" : "Add Event"}
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
            <p className="mt-5 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 grid gap-4">
            <label className="text-sm font-bold">
              Event Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Meet & Greet #1"
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Date
                <input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  placeholder="Sep 10, 2026"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>

              <label className="text-sm font-bold">
                Time
                <input
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  placeholder="6–8pm"
                  className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
                />
              </label>
            </div>

            <label className="text-sm font-bold">
              Type
              <select
                value={type}
                onChange={(event) => setType(event.target.value as EventType)}
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              >
                <option>Open Rush</option>
                <option>Closed Rush</option>
              </select>
            </label>

            <div>
              <p className="text-sm font-bold">Assigned Brothers</p>

              <div className="mt-3 grid gap-2">
                {brotherList.length === 0 && (
                  <p className="rounded-2xl bg-[#F6F1E8] p-4 text-sm text-slate-600">
                    No brothers found in Supabase.
                  </p>
                )}

                {brotherList.map((brother) => {
                  const selected = assignedBrotherIds.includes(brother.id);

                  return (
                    <button
                      key={brother.id}
                      type="button"
                      onClick={() => toggleBrother(brother.id)}
                      disabled={saving}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold disabled:opacity-50 ${
                        selected
                          ? "border-[#071E34] bg-[#071E34] text-[#F6F1E8]"
                          : "border-[#E5DDD0] bg-white text-[#071E34] hover:bg-[#F6F1E8]"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {brother.name}
                      <span className="ml-2 text-xs font-normal opacity-70">
                        {brother.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={saveEvent}
              disabled={saving}
              className="rounded-2xl bg-[#071E34] px-5 py-4 text-sm font-bold text-[#F6F1E8] disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Add Event"}
            </button>
          </div>
        </aside>

        <section className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Rush Events</h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading..."
                  : `${eventList.length} event${
                      eventList.length === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            <button
              type="button"
              onClick={loadPageData}
              disabled={loading || saving}
              className="rounded-full border border-[#071E34] px-5 py-2 text-sm font-bold text-[#071E34] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading && (
              <p className="rounded-2xl bg-[#F6F1E8] p-4 text-sm text-slate-600">
                Loading events from Supabase...
              </p>
            )}

            {!loading && eventList.length === 0 && (
              <p className="rounded-2xl bg-[#F6F1E8] p-4 text-sm text-slate-600">
                No events yet. Add one using the form.
              </p>
            )}

            {eventList.map((eventItem) => (
              <article
                key={eventItem.id}
                className={`rounded-3xl border p-5 ${
                  editingId === eventItem.id
                    ? "border-[#071E34] bg-[#F6F1E8]"
                    : "border-[#E5DDD0] bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{eventItem.name}</h3>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#071E34]">
                        {eventItem.type}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {eventItem.date || "No date"} ·{" "}
                      {eventItem.time || "No time"}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Assigned:{" "}
                      <span className="font-bold text-[#071E34]">
                        {getBrotherNames(eventItem.assignedBrotherIds)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(eventItem)}
                      disabled={saving}
                      className="rounded-full border border-[#071E34] bg-white px-5 py-2 text-sm font-bold text-[#071E34] disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(eventItem)}
                      disabled={saving}
                      className="rounded-full border border-[#8A1F2D] bg-white px-5 py-2 text-sm font-bold text-[#8A1F2D] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}