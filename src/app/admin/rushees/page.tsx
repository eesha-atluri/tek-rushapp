"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/app/components/AdminNav";
import { events, rushees } from "@/lib/mockData";

type Rushee = {
  id: string;
  name: string;
  number: number;
  major: string;
  year: string;
  photo: string;
  events: string[];
  applicationSummary: string;
  reviews: number;
  votedBy: string[];
};

export default function AdminRusheesPage() {
  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [rushNumber, setRushNumber] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("Freshman");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [applicationSummary, setApplicationSummary] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    const savedRusheesString = localStorage.getItem("tek-rushees");

    const savedRushees: Rushee[] = savedRusheesString
      ? JSON.parse(savedRusheesString)
      : rushees;

    setRusheeList(savedRushees);
  }, []);

  function saveRushees(updatedRushees: Rushee[]) {
    setRusheeList(updatedRushees);
    localStorage.setItem("tek-rushees", JSON.stringify(updatedRushees));
  }

  function toggleEvent(eventName: string) {
    if (selectedEvents.includes(eventName)) {
      setSelectedEvents(selectedEvents.filter((event) => event !== eventName));
    } else {
      setSelectedEvents([...selectedEvents, eventName]);
    }
  }

  function clearForm() {
    setEditingId(null);
    setName("");
    setRushNumber("");
    setMajor("");
    setYear("Freshman");
    setSelectedEvents([]);
    setApplicationSummary("");
    setPhotoPreview("");
  }

  function editRushee(rushee: Rushee) {
    setEditingId(rushee.id);
    setName(rushee.name);
    setRushNumber(String(rushee.number));
    setMajor(rushee.major);
    setYear(rushee.year);
    setSelectedEvents(rushee.events);
    setApplicationSummary(rushee.applicationSummary);
    setPhotoPreview(rushee.photo);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveRushee() {
    if (!name.trim() || !rushNumber.trim()) {
      alert("Please enter a name and rush number.");
      return;
    }

    const newRushee: Rushee = {
      id: rushNumber,
      name,
      number: Number(rushNumber),
      major,
      year,
      photo:
        photoPreview ||
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
      events: selectedEvents,
      applicationSummary,
      reviews: 0,
      votedBy: [],
    };

    if (editingId) {
      const updatedRushees = rusheeList.map((rushee) =>
        rushee.id === editingId ? newRushee : rushee
      );

      saveRushees(updatedRushees);
      clearForm();
      return;
    }

    const alreadyExists = rusheeList.some((rushee) => rushee.id === rushNumber);

    if (alreadyExists) {
      alert("A rushee with this rush number already exists.");
      return;
    }

    saveRushees([...rusheeList, newRushee]);
    clearForm();
  }

  function deleteRushee(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this rushee from the prototype?"
    );

    if (!confirmDelete) return;

    const updatedRushees = rusheeList.filter((rushee) => rushee.id !== id);
    saveRushees(updatedRushees);
  }

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#061A33]">
      <AdminNav />

      <header className="bg-[#061A33] px-6 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Admin
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">Add / Edit Rushees</h1>

        <p className="mt-2 text-sm text-slate-300">
          Add rushee info, assign rush numbers, upload photos, and manage event
          attendance.
        </p>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <form className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">
            {editingId ? "Edit Rushee" : "Add New Rushee"}
          </h2>

          {editingId && (
            <p className="mt-2 text-sm text-slate-500">
              Editing existing rushee. Save changes or clear the form to cancel.
            </p>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Full Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="River McCorry"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Rush Number
              <input
                value={rushNumber}
                onChange={(event) => setRushNumber(event.target.value)}
                placeholder="1"
                type="number"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Major
              <input
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                placeholder="Computer Science"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              />
            </label>

            <label className="text-sm font-semibold">
              Year
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
              >
                <option>Freshman</option>
                <option>Sophomore</option>
                <option>Junior</option>
                <option>Senior</option>
                <option>Graduate Student</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold">Photo Upload</p>

            <label className="mt-2 flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-[#F8F6F1] px-4 text-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Rushee preview"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <>
                  <p className="font-bold text-[#9B1232]">
                    Upload Rushee Photo
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Click to choose a photo from your computer.
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) return;

                  const previewUrl = URL.createObjectURL(file);
                  setPhotoPreview(previewUrl);
                }}
              />
            </label>

            {photoPreview && (
              <button
                type="button"
                onClick={() => setPhotoPreview("")}
                className="mt-2 text-sm font-bold text-[#9B1232]"
              >
                Remove photo
              </button>
            )}
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold">Events Attended</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {events.map((event) => {
                const isSelected = selectedEvents.includes(event);

                return (
                  <button
                    key={event}
                    type="button"
                    onClick={() => toggleEvent(event)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                      isSelected
                        ? "border-[#9B1232] bg-[#9B1232] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected ? "✓ " : ""}
                    {event}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Application Summary
            <textarea
              value={applicationSummary}
              onChange={(event) => setApplicationSummary(event.target.value)}
              placeholder="Paste or summarize their application responses here..."
              className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none"
            />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={saveRushee}
              className="rounded-xl bg-[#9B1232] px-5 py-3 font-bold text-white"
            >
              {editingId ? "Update Rushee" : "Save Rushee"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="rounded-xl border border-[#061A33] px-5 py-3 font-bold text-[#061A33]"
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-extrabold">Existing Rushees</h2>

          <div className="space-y-3">
            {rusheeList.map((rushee) => (
              <div
                key={rushee.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={rushee.photo}
                    alt={rushee.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-extrabold">{rushee.name}</h3>

                    <p className="text-xs text-slate-500">
                      #{rushee.number} · {rushee.major || "No major"} ·{" "}
                      {rushee.year || "No year"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Events:{" "}
                      {rushee.events.length > 0
                        ? rushee.events.join(", ")
                        : "None selected"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href={`/admin/rushees/${rushee.id}`}
                      className="rounded-full border border-[#061A33] px-3 py-1 text-center text-xs font-bold text-[#061A33]"
                    >
                      Profile
                    </a>

                    <button
                      type="button"
                      onClick={() => editRushee(rushee)}
                      className="rounded-full border border-[#9B1232] px-3 py-1 text-xs font-bold text-[#9B1232]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRushee(rushee.id)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}