"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/app/components/AdminNav";
import { events } from "@/lib/mockData";
import { getStoredRushees, type Rushee } from "@/lib/rusheeStorage";

type EventItem = {
  id: string;
  name: string;
  date: string;
  type: "Open Rush" | "Closed Rush";
};

const startingEvents: EventItem[] = events.map((event, index) => ({
  id: String(index + 1),
  name: event,
  date: "",
  type: "Open Rush",
}));

export default function AdminEventsPage() {
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState<"Open Rush" | "Closed Rush">(
    "Open Rush"
  );

  useEffect(() => {
    const savedEventsString = localStorage.getItem("tek-events");

    const savedEvents: EventItem[] = savedEventsString
      ? JSON.parse(savedEventsString)
      : startingEvents;

    setEventList(savedEvents);
  }, []);

  function saveEvents(updatedEvents: EventItem[]) {
    setEventList(updatedEvents);
    localStorage.setItem("tek-events", JSON.stringify(updatedEvents));
  }

  function addEvent() {
    if (!eventName.trim()) {
      alert("Please enter an event name.");
      return;
    }

    const alreadyExists = eventList.some(
      (event) => event.name.toLowerCase() === eventName.trim().toLowerCase()
    );

    if (alreadyExists) {
      alert("That event already exists.");
      return;
    }

    const newEvent: EventItem = {
      id: String(Date.now()),
      name: eventName.trim(),
      date: eventDate,
      type: eventType,
    };

    saveEvents([...eventList, newEvent]);

    setEventName("");
    setEventDate("");
    setEventType("Open Rush");
  }

  function deleteEvent(eventToDelete: EventItem) {
    const confirmDelete = confirm(
      `Delete "${eventToDelete.name}"? This will also remove it from every rushee's attended events.`
    );

    if (!confirmDelete) return;

    const updatedEvents = eventList.filter(
      (event) => event.id !== eventToDelete.id
    );

    saveEvents(updatedEvents);

    const storedRushees = getStoredRushees();

    const updatedRushees: Rushee[] = storedRushees.map((rushee) => ({
      ...rushee,
      events: rushee.events.filter((event) => event !== eventToDelete.name),
    }));

    localStorage.setItem("tek-rushees", JSON.stringify(updatedRushees));
  }

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Manage Events</h1>

        <p className="mt-2 text-sm text-slate-300">
          Add open rush and closed rush events. Deleting an event also removes it
          from rushee profiles.
        </p>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Add New Event</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold">
              Event Name
              <input
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                placeholder="Info Night"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Event Date
              <input
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Event Type
              <select
                value={eventType}
                onChange={(event) =>
                  setEventType(event.target.value as "Open Rush" | "Closed Rush")
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              >
                <option>Open Rush</option>
                <option>Closed Rush</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={addEvent}
            className="mt-5 rounded-xl bg-[#9B1232] px-5 py-3 font-bold text-white"
          >
            Add Event
          </button>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-extrabold">Current Events</h2>

          <div className="space-y-3">
            {eventList.length === 0 && (
              <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
                No events have been added yet.
              </div>
            )}

            {eventList.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-extrabold">{event.name}</p>

                  <p className="text-xs text-slate-500">
                    {event.date || "No date set"} · {event.type}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-full border border-[#9B1232] px-3 py-1 text-xs font-bold text-[#9B1232]">
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteEvent(event)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}