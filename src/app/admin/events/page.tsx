"use client";

import { useState } from "react";
import { events } from "@/lib/mockData";
import AdminNav from "@/app/components/AdminNav";

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
  const [eventList, setEventList] = useState<EventItem[]>(startingEvents);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState<"Open Rush" | "Closed Rush">(
    "Open Rush"
  );

  function addEvent() {
    if (!eventName.trim()) {
      alert("Please enter an event name.");
      return;
    }

    const newEvent: EventItem = {
      id: String(Date.now()),
      name: eventName,
      date: eventDate,
      type: eventType,
    };

    setEventList([...eventList, newEvent]);
    setEventName("");
    setEventDate("");
    setEventType("Open Rush");
  }

  function deleteEvent(id: string) {
    setEventList(eventList.filter((event) => event.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#061A33]">
        <AdminNav />
      <header className="bg-[#061A33] px-6 py-5 text-white">


        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Manage Events</h1>

        <p className="mt-2 text-sm text-slate-300">
          Add open rush and closed rush events that brothers can select when
          submitting feedback.
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
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Info Night"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Event Date
              <input
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Event Type
              <select
                value={eventType}
                onChange={(e) =>
                  setEventType(e.target.value as "Open Rush" | "Closed Rush")
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
                    onClick={() => deleteEvent(event.id)}
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