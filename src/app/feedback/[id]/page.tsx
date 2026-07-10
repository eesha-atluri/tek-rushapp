"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { events, feedback, rushees } from "@/lib/mockData";
import BrotherNav from "@/app/components/BrotherNav";

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

function RatingButtons({
  value,
  setValue,
}: {
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <div className="mt-3 flex justify-between">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => setValue(num)}
          className={`h-11 w-11 rounded-full border text-sm font-bold ${
            value === num
              ? "border-[#9B1232] bg-[#9B1232] text-white"
              : "border-slate-300 bg-white text-[#061A33]"
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const rushee = rushees.find((item) => item.id === id);

  const [existingFeedback, setExistingFeedback] =
    useState<SavedFeedback | null>(null);

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [communication, setCommunication] = useState(0);
  const [passion, setPassion] = useState(0);
  const [cultureFit, setCultureFit] = useState(0);
  const [fitAddChoice, setFitAddChoice] = useState("");
  const [fitAddScore, setFitAddScore] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    const foundFeedback =
      savedFeedback.find((item) => item.rusheeId === id) || null;

    if (foundFeedback) {
      setExistingFeedback(foundFeedback);
      setSelectedEvents(foundFeedback.events);
      setCommunication(foundFeedback.communication);
      setPassion(foundFeedback.passion);
      setCultureFit(foundFeedback.cultureFit);
      setFitAddChoice(foundFeedback.fitAddChoice);
      setFitAddScore(foundFeedback.fitAddScore);
      setComment(foundFeedback.comment);
    }
  }, [id]);

  if (!rushee) {
    return (
      <main className="min-h-screen bg-[#F8F6F1] p-6 text-[#061A33]">
        <p>Rushee not found.</p>

        <a href="/rushees" className="mt-4 block text-[#9B1232]">
          Back to rushees
        </a>
      </main>
    );
  }
  const currentRushee = rushee;
  const isEditingExistingFeedback = Boolean(existingFeedback);

  function toggleEvent(eventName: string) {
    if (selectedEvents.includes(eventName)) {
      setSelectedEvents(selectedEvents.filter((event) => event !== eventName));
    } else {
      setSelectedEvents([...selectedEvents, eventName]);
    }
  }

  function saveFeedback() {
    const finalFitAddScore = fitAddChoice === "Neither" ? 0 : fitAddScore;

    const newFeedback: SavedFeedback = {
      id: existingFeedback?.id || String(Date.now()),
      rusheeId: currentRushee.id,
      rusheeName: currentRushee.name,
      rusheeNumber: currentRushee.number,
      events: selectedEvents,
      communication,
      passion,
      cultureFit,
      fitAddChoice,
      fitAddScore: finalFitAddScore,
      comment,
    };

    const savedFeedbackString = localStorage.getItem("tek-feedback");

    const savedFeedback: SavedFeedback[] = savedFeedbackString
      ? JSON.parse(savedFeedbackString)
      : feedback;

    const alreadyExists = savedFeedback.some(
      (item) => item.rusheeId === currentRushee.id
    );

    const updatedFeedback = alreadyExists
      ? savedFeedback.map((item) =>
          item.rusheeId === currentRushee.id ? newFeedback : item
        )
      : [...savedFeedback, newFeedback];

    localStorage.setItem("tek-feedback", JSON.stringify(updatedFeedback));
    setExistingFeedback(newFeedback);

    router.push(`/rushees/${currentRushee.id}`);
  }

  return (
    <main className="min-h-screen bg-[#F8F6F1] pb-20 text-[#061A33]">
        <BrotherNav />
      <header className="bg-[#061A33] px-5 py-4 text-white">
        <a
          href={`/rushees/${rushee.id}`}
          className="text-sm font-semibold text-[#C49A45]"
        >
          ← Back to Profile
        </a>

        <h1 className="mt-2 text-xl font-extrabold">
          {isEditingExistingFeedback ? "Edit Feedback" : "Submit Feedback"}
        </h1>

        {isEditingExistingFeedback && (
          <p className="mt-2 text-sm text-slate-300">
            Your previous feedback is loaded below. Make changes and update it.
          </p>
        )}
      </header>

      <form className="mx-auto max-w-md space-y-4 px-4 py-5">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <img
              src={rushee.photo}
              alt={rushee.name}
              className="h-16 w-16 rounded-xl object-cover"
            />

            <div>
              <h2 className="text-lg font-bold">{rushee.name}</h2>
              <p className="text-xs text-slate-500">
                #{rushee.number} · {rushee.major} · {rushee.year}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold">Which events did you talk to them at?</p>
          <p className="text-sm text-slate-500">
            Select all events where you interacted with this rushee.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {events.map((event) => {
              const isSelected = selectedEvents.includes(event);

              return (
                <button
                  type="button"
                  key={event}
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
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold">1. Communication</p>
          <p className="text-sm text-slate-500">
            Can they hold a conversation?
          </p>

          <RatingButtons value={communication} setValue={setCommunication} />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold">2. Passion / Interest</p>
          <p className="text-sm text-slate-500">
            Do they genuinely seem interested in TEK?
          </p>

          <RatingButtons value={passion} setValue={setPassion} />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold">3. Culture Fit</p>
          <p className="text-sm text-slate-500">
            Do you see them vibing with TEK?
          </p>

          <RatingButtons value={cultureFit} setValue={setCultureFit} />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold">4. Fit, Add, or Neither</p>
          <p className="text-sm text-slate-500">
            Choose the strongest category for this rushee.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Fit", "Add", "Neither"].map((choice) => (
              <button
                type="button"
                key={choice}
                onClick={() => {
                  setFitAddChoice(choice);

                  if (choice === "Neither") {
                    setFitAddScore(0);
                  }
                }}
                className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                  fitAddChoice === choice
                    ? "border-[#9B1232] bg-[#9B1232] text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </section>

        {fitAddChoice !== "" && fitAddChoice !== "Neither" && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-bold">5. {fitAddChoice} Score</p>
            <p className="text-sm text-slate-500">
              Rate how strongly they are a {fitAddChoice.toLowerCase()}.
            </p>

            <RatingButtons value={fitAddScore} setValue={setFitAddScore} />
          </section>
        )}

        {fitAddChoice === "Neither" && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-bold">5. Fit/Add Score</p>
            <p className="text-sm text-slate-500">
              Auto-set to 0 because Neither was selected.
            </p>

            <div className="mt-3 rounded-xl bg-slate-100 p-4 text-center text-2xl font-extrabold text-slate-500">
              0
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold">Comment</p>
          <p className="text-sm text-slate-500">
            Add any notes from your interaction.
          </p>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write notes here..."
            className="mt-3 min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none"
          />
        </section>

        <button
          type="button"
          onClick={saveFeedback}
          className="w-full rounded-xl bg-[#9B1232] px-4 py-4 font-bold text-white shadow-lg"
        >
          {isEditingExistingFeedback ? "Update Feedback" : "Submit Feedback"}
        </button>
      </form>
    </main>
  );
}
<div className="flex gap-2">
  <a
    href="/admin/rushees"
    className="rounded-xl bg-[#9B1232] px-4 py-2 text-sm font-bold text-white"
  >
    Add / Edit Rushees
  </a>

  <a
    href="/admin/events"
    className="rounded-xl border border-[#C49A45] px-4 py-2 text-sm font-bold text-[#061A33]"
  >
    Manage Events
  </a>

  <button className="rounded-xl border border-[#061A33] px-4 py-2 text-sm font-bold text-[#061A33]">
    Export CSV
  </button>
</div>