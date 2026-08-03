"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BrotherNav from "@/app/components/BrotherNav";
import { events as defaultEvents, feedback } from "@/lib/mockData";
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
  fitAddChoice: "Fit" | "Add" | "Neither";
  fitAddScore: number;
  comment: string;
};

type EventItem = {
  id: string;
  name: string;
  date: string;
  type: "Open Rush" | "Closed Rush";
};

function getStoredEvents(): EventItem[] {
  if (typeof window === "undefined") {
    return defaultEvents.map((event, index) => ({
      id: String(index + 1),
      name: event,
      date: "",
      type: "Open Rush",
    }));
  }

  const savedEventsString = localStorage.getItem("tek-events");

  if (savedEventsString) {
    return JSON.parse(savedEventsString);
  }

  return defaultEvents.map((event, index) => ({
    id: String(index + 1),
    name: event,
    date: "",
    type: "Open Rush",
  }));
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();

  const rusheeId = params.id as string;

  const [rusheeList, setRusheeList] = useState<Rushee[]>([]);
  const [rushee, setRushee] = useState<Rushee | null>(null);
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [allFeedback, setAllFeedback] = useState<SavedFeedback[]>([]);

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [communication, setCommunication] = useState(3);
  const [passion, setPassion] = useState(3);
  const [cultureFit, setCultureFit] = useState(3);
  const [fitAddChoice, setFitAddChoice] = useState<"Fit" | "Add" | "Neither">(
    "Fit"
  );
  const [fitAddScore, setFitAddScore] = useState(3);
  const [comment, setComment] = useState("");

  const [existingFeedbackId, setExistingFeedbackId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const storedRushees = getStoredRushees();
    const currentRushee =
      storedRushees.find((item) => item.id === rusheeId) || null;

    setRusheeList(storedRushees);
    setRushee(currentRushee);
    setEventList(getStoredEvents());

    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    setAllFeedback(savedFeedback);

    const existingFeedback = savedFeedback.find(
      (item) => item.rusheeId === rusheeId
    );

    if (existingFeedback) {
      setExistingFeedbackId(existingFeedback.id);
      setSelectedEvents(existingFeedback.events || []);
      setCommunication(existingFeedback.communication);
      setPassion(existingFeedback.passion);
      setCultureFit(existingFeedback.cultureFit);
      setFitAddChoice(existingFeedback.fitAddChoice);
      setFitAddScore(existingFeedback.fitAddScore);
      setComment(existingFeedback.comment);
    }
  }, [rusheeId]);

  function toggleEvent(eventName: string) {
    if (selectedEvents.includes(eventName)) {
      setSelectedEvents(selectedEvents.filter((event) => event !== eventName));
    } else {
      setSelectedEvents([...selectedEvents, eventName]);
    }
  }

  function getNextUnvotedRusheeId(updatedFeedback: SavedFeedback[]) {
    const currentIndex = rusheeList.findIndex((item) => item.id === rusheeId);

    const orderedRushees = [
      ...rusheeList.slice(currentIndex + 1),
      ...rusheeList.slice(0, currentIndex),
    ];

    const nextUnvotedRushee = orderedRushees.find(
      (item) =>
        !updatedFeedback.some((feedbackItem) => feedbackItem.rusheeId === item.id)
    );

    return nextUnvotedRushee?.id || null;
  }

  function saveFeedback(destination: "board" | "next") {
    if (!rushee) return;

    const finalFitAddScore = fitAddChoice === "Neither" ? 0 : fitAddScore;

    const newFeedback: SavedFeedback = {
      id: existingFeedbackId || String(Date.now()),
      rusheeId: rushee.id,
      rusheeName: rushee.name,
      rusheeNumber: rushee.number,
      events: selectedEvents,
      communication,
      passion,
      cultureFit,
      fitAddChoice,
      fitAddScore: finalFitAddScore,
      comment,
    };

    let updatedFeedback: SavedFeedback[];

    if (existingFeedbackId) {
      updatedFeedback = allFeedback.map((item) =>
        item.id === existingFeedbackId ? newFeedback : item
      );
    } else {
      updatedFeedback = [...allFeedback, newFeedback];
    }

    setAllFeedback(updatedFeedback);
    localStorage.setItem("tek-feedback", JSON.stringify(updatedFeedback));

    if (destination === "next") {
      const nextRusheeId = getNextUnvotedRusheeId(updatedFeedback);

      if (nextRusheeId) {
        router.push(`/feedback/${nextRusheeId}`);
      } else {
        router.push("/rush-board");
      }

      return;
    }

    router.push("/rush-board");
  }

  if (!rushee) {
    return (
      <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
        <BrotherNav />

        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 text-sm text-slate-600">
            Rushee not found.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] pb-20 text-[#061A33]">
      <BrotherNav />

      <header className="bg-[#061A33] px-6 py-8 text-white">
        <section className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C49A45]">
            Brother View
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">
            {existingFeedbackId ? "Edit Note" : "Leave Note"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Submit your feedback privately. Brothers can see that you voted, but
            not your ratings or comments.
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <img
              src={rushee.photo}
              alt={rushee.name}
              className="h-64 w-full rounded-3xl object-cover"
            />

            <div className="mt-5">
              <h2 className="text-3xl font-extrabold">
                #{rushee.number} {rushee.name}
              </h2>

              <p className="mt-2 text-base text-slate-600">
                {rushee.major || "No major"} · {rushee.year || "No year"}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Seen at:{" "}
                {rushee.events.length > 0
                  ? rushee.events.join(", ")
                  : "No events yet"}
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F4F1EA] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Application Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {rushee.applicationSummary || "No summary provided."}
              </p>
            </div>
          </aside>

          <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-extrabold">Events Talked At</h3>

              <p className="mt-1 text-sm text-slate-500">
                Select every event where you interacted with this rushee.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {eventList.map((event) => {
                  const isSelected = selectedEvents.includes(event.name);

                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => toggleEvent(event.name)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold ${
                        isSelected
                          ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
                          : "border-[#061A33] bg-white text-[#061A33] hover:bg-[#F4F1EA]"
                      }`}
                    >
                      {isSelected ? "✓ " : ""}
                      {event.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <label className="rounded-2xl bg-[#F4F1EA] p-4">
                <span className="text-sm font-extrabold">Communication</span>
                <select
                  value={communication}
                  onChange={(event) => setCommunication(Number(event.target.value))}
                  className="mt-3 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-3 text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl bg-[#F4F1EA] p-4">
                <span className="text-sm font-extrabold">Passion</span>
                <select
                  value={passion}
                  onChange={(event) => setPassion(Number(event.target.value))}
                  className="mt-3 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-3 text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl bg-[#F4F1EA] p-4">
                <span className="text-sm font-extrabold">Culture Fit</span>
                <select
                  value={cultureFit}
                  onChange={(event) => setCultureFit(Number(event.target.value))}
                  className="mt-3 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-3 text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-8 rounded-2xl bg-[#F4F1EA] p-4">
              <h3 className="text-lg font-extrabold">Fit / Add</h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose whether they feel like a strong fit, add something new,
                or neither.
              </p>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {(["Fit", "Add", "Neither"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setFitAddChoice(choice)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                      fitAddChoice === choice
                        ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
                        : "border-[#061A33] bg-white text-[#061A33] hover:bg-[#F4F1EA]"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              {fitAddChoice !== "Neither" && (
                <label className="mt-4 block text-sm font-bold">
                  Fit/Add Score
                  <select
                    value={fitAddScore}
                    onChange={(event) =>
                      setFitAddScore(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-3 text-sm font-normal outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {fitAddChoice === "Neither" && (
                <p className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600">
                  Fit/Add score will automatically save as 0.
                </p>
              )}
            </div>

            <label className="mt-8 block">
              <span className="text-lg font-extrabold">Comment</span>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a specific note that would help during hash..."
                className="mt-3 min-h-36 w-full rounded-2xl border border-[#E5E0D8] bg-white px-4 py-4 text-sm leading-6 outline-none"
              />
            </label>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/rush-board")}
                className="rounded-full border border-[#061A33] px-6 py-3 text-sm font-bold text-[#061A33]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => saveFeedback("board")}
                className="rounded-full border border-[#061A33] bg-white px-6 py-3 text-sm font-bold text-[#061A33]"
              >
                Save & Return
              </button>

              <button
                type="button"
                onClick={() => saveFeedback("next")}
                className="rounded-full bg-[#061A33] px-6 py-3 text-sm font-bold text-[#F4F1EA]"
              >
                Save & Next
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}