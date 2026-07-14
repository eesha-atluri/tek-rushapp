"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BrotherNav from "@/app/components/BrotherNav";
import { events, feedback, rushees } from "@/lib/mockData";
import { getStoredRushees } from "@/lib/rusheeStorage";

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
              ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
              : "border-[#061A33] bg-white text-[#061A33] hover:bg-[#F4F1EA]"
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

  const storedRushees = getStoredRushees();
  const rushee = storedRushees.find((item) => item.id === id);

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
    } else {
      setExistingFeedback(null);
      setSelectedEvents([]);
      setCommunication(0);
      setPassion(0);
      setCultureFit(0);
      setFitAddChoice("");
      setFitAddScore(0);
      setComment("");
    }
  }, [id]);

  if (!rushee) {
    return (
      <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
        <BrotherNav />

        <section className="p-6">
          <p>Rushee not found.</p>

          <a href="/rush-board" className="mt-4 block font-bold text-[#061A33]">
            Back to Rush Board
          </a>
        </section>
      </main>
    );
  }

  const isEditingExistingFeedback = Boolean(existingFeedback);

  function toggleEvent(eventName: string) {
    if (selectedEvents.includes(eventName)) {
      setSelectedEvents(selectedEvents.filter((event) => event !== eventName));
    } else {
      setSelectedEvents([...selectedEvents, eventName]);
    }
  }

  function saveFeedbackAndNext() {
    saveFeedback("next");
  }

  function saveFeedbackAndReturn() {
    saveFeedback("board");
  }

  function saveFeedback(destination: "next" | "board") {
    const currentRushee = rushee;

    if (!currentRushee) {
      return;
    }

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

    if (destination === "board") {
      router.push("/rush-board");
      return;
    }

    const nextUnvotedRushee = getStoredRushees().find((item) => {
      const alreadyHasFeedback = updatedFeedback.some(
        (feedbackItem) => feedbackItem.rusheeId === item.id
      );

      return !alreadyHasFeedback && item.id !== currentRushee.id;
    });

    if (nextUnvotedRushee) {
      router.push(`/feedback/${nextUnvotedRushee.id}`);
    } else {
      router.push("/rush-board");
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] pb-20 text-[#061A33]">
      <BrotherNav />

      <header className="bg-[#061A33] px-5 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Brother View
        </p>

        <h1 className="mt-1 text-2xl font-extrabold">
          {isEditingExistingFeedback ? "Edit Feedback" : "Submit Feedback"}
        </h1>

        <p className="mt-2 text-sm text-white/70">
          {isEditingExistingFeedback
            ? "Your previous feedback is loaded below. Update it and continue."
            : "Submit feedback, then move quickly to the next rushee."}
        </p>
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
              <h2 className="text-lg font-bold">
                #{rushee.number} {rushee.name}
              </h2>

              <p className="text-xs text-slate-500">
                {rushee.major || "No major"} · {rushee.year || "No year"}
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
                      ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
                      : "border-[#061A33] bg-white text-[#061A33] hover:bg-[#F4F1EA]"
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
          <p className="text-sm text-slate-500">Can they hold a conversation?</p>
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
                    ? "border-[#061A33] bg-[#061A33] text-[#F4F1EA]"
                    : "border-[#061A33] bg-white text-[#061A33] hover:bg-[#F4F1EA]"
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

            <div className="mt-3 rounded-xl bg-[#F4F1EA] p-4 text-center text-2xl font-extrabold text-slate-500">
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
            className="mt-3 min-h-28 w-full rounded-xl border border-[#E5E0D8] p-3 text-sm outline-none"
          />
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={saveFeedbackAndNext}
            className="w-full rounded-xl bg-[#061A33] px-4 py-4 font-bold text-[#F4F1EA] shadow-lg"
          >
            {isEditingExistingFeedback ? "Update & Next" : "Save & Next"}
          </button>

          <button
            type="button"
            onClick={saveFeedbackAndReturn}
            className="w-full rounded-xl border border-[#061A33] bg-white px-4 py-4 font-bold text-[#061A33]"
          >
            Save & Return to Board
          </button>
        </div>
      </form>
    </main>
  );
}