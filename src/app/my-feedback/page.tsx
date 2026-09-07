"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrotherNav from "@/app/components/BrotherNav";
import { supabase } from "@/lib/supabase";
import {
  getCurrentBrotherProfile,
  type CurrentBrother,
} from "@/lib/backend/currentBrother";

type EventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: string;
};

type FeedbackEventRow = {
  events: EventRow | null;
};

type RusheeRow = {
  id: string;
  number: number;
  name: string;
  major: string | null;
  year: string | null;
  gender: string | null;
  photo: string | null;
};

type FeedbackRow = {
  id: string;
  rushee_id: string;
  brother_id: string;
  communication: number;
  passion: number;
  fit_add_choice: "Fit" | "Add" | "Neither";
  fit_add_score: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  rushees: RusheeRow | null;
  feedback_events?: FeedbackEventRow[];
};

const defaultPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop";

function getFeedbackEvents(item: FeedbackRow) {
  return (
    item.feedback_events
      ?.map((eventItem) => eventItem.events)
      .filter((event): event is EventRow => Boolean(event)) || []
  );
}

export default function MyFeedbackPage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [myFeedback, setMyFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMyFeedback();
  }, []);

  async function loadMyFeedback() {
    try {
      setLoading(true);
      setErrorMessage("");

      const brother = await getCurrentBrotherProfile();

      if (!brother) {
        router.push("/");
        return;
      }

      setCurrentBrother(brother);

      const { data, error } = await supabase
        .from("feedback")
        .select(
          `
          id,
          rushee_id,
          brother_id,
          communication,
          passion,
          fit_add_choice,
          fit_add_score,
          comment,
          created_at,
          updated_at,
          rushees (
            id,
            number,
            name,
            major,
            year,
            gender,
            photo
          ),
          feedback_events (
            events (
              id,
              name,
              date,
              time,
              type
            )
          )
        `
        )
        .eq("brother_id", brother.id)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMyFeedback((data || []) as unknown as FeedbackRow[]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load your notes.");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <BrotherNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading your notes...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1E8] pb-20 text-[#071E34]">
      <BrotherNav />

      <header className="bg-[#071E34] px-6 py-12 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#C69A3D]">
            Brother View
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            My Notes
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
          {currentBrother.name} Notes
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="mb-6 rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Notes</p>
          <p className="mt-2 text-4xl font-black">{myFeedback.length}</p>
        </div>

        <div className="space-y-5">
          {myFeedback.length === 0 && (
            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600 shadow-sm">
              You have not submitted any notes yet.
            </div>
          )}

          {myFeedback.map((item) => {
            const rushee = item.rushees;
            const events = getFeedbackEvents(item);

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm"
              >
                <div className="grid gap-5 md:grid-cols-[10rem_1fr]">
                  <div className="h-40 w-full overflow-hidden rounded-3xl bg-[#F0E8DA] md:h-40 md:w-40">
                    <img
                      src={rushee?.photo || defaultPhoto}
                      alt={rushee?.name || "Rushee"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-2xl font-black">
                          {rushee
                            ? `#${rushee.number} ${rushee.name}`
                            : "Rushee deleted"}
                        </h2>

                        {rushee && (
                          <p className="mt-2 text-sm text-slate-600">
                            {rushee.major || "No major"} ·{" "}
                            {rushee.year || "No year"}
                            {rushee.gender ? ` · ${rushee.gender}` : ""}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-500">
                          Last updated:{" "}
                          {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>

                      {rushee && (
                        <a
                          href={`/feedback/${rushee.id}`}
                          className="rounded-full border border-[#071E34] px-5 py-2 text-center text-sm font-bold text-[#071E34]"
                        >
                          Edit Note
                        </a>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">
                          {item.communication}
                        </p>
                        <p className="text-xs text-slate-500">Comm</p>
                      </div>

                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">{item.passion}</p>
                        <p className="text-xs text-slate-500">Passion</p>
                      </div>


                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">
                          {item.fit_add_choice}
                        </p>
                        <p className="text-xs text-slate-500">Choice</p>
                      </div>

                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">
                          {item.fit_add_score}
                        </p>
                        <p className="text-xs text-slate-500">Culture Fit/Add</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#E5DDD0] p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Events Talked At
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {events.length === 0 && (
                          <p className="text-sm text-slate-600">
                            No events selected.
                          </p>
                        )}

                        {events.map((event) => (
                          <span
                            key={event.id}
                            className="rounded-full bg-[#F6F1E8] px-4 py-2 text-xs font-bold text-[#071E34]"
                          >
                            {event.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#F6F1E8] p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Comment
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.comment || "No comment provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}