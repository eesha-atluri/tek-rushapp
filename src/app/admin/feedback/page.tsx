"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
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

type BrotherRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "brother";
};

type FeedbackRow = {
  id: string;
  rushee_id: string;
  brother_id: string;
  communication: number;
  passion: number;
  culture_fit: number;
  fit_add_choice: "Fit" | "Add" | "Neither";
  fit_add_score: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  rushees: RusheeRow | null;
  brothers: BrotherRow | null;
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

function getAverage(scores: number[]) {
  if (scores.length === 0) return "N/A";

  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(1);
}

export default function AdminFeedbackPage() {
  const router = useRouter();

  const [currentBrother, setCurrentBrother] =
    useState<CurrentBrother | null>(null);

  const [allFeedback, setAllFeedback] = useState<FeedbackRow[]>([]);
  const [search, setSearch] = useState("");
  const [brotherFilter, setBrotherFilter] = useState("All");
  const [choiceFilter, setChoiceFilter] = useState("All");

  const [loading, setLoading] = useState(true);
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
    await loadFeedback();
  }

  async function loadFeedback() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("feedback")
        .select(
          `
          id,
          rushee_id,
          brother_id,
          communication,
          passion,
          culture_fit,
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
          brothers (
            id,
            name,
            email,
            role
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
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAllFeedback((data || []) as unknown as FeedbackRow[]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load feedback from Supabase.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFeedback(item: FeedbackRow) {
    const rusheeName = item.rushees?.name || "this rushee";
    const brotherName = item.brothers?.name || "this brother";

    const confirmed = window.confirm(
      `Delete ${brotherName}'s note for ${rusheeName}?`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");

      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadFeedback();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not delete feedback.");
    }
  }

  function exportCSV() {
    const rows = filteredFeedback.map((item) => {
      const rushee = item.rushees;
      const brother = item.brothers;
      const events = getFeedbackEvents(item)
        .map((event) => event.name)
        .join(", ");

      return {
        rusheeNumber: rushee?.number || "",
        rusheeName: rushee?.name || "Rushee deleted",
        major: rushee?.major || "",
        year: rushee?.year || "",
        gender: rushee?.gender || "",
        brotherName: brother?.name || "Brother deleted",
        brotherEmail: brother?.email || "",
        communication: item.communication,
        passion: item.passion,
        cultureFit: item.culture_fit,
        fitAddChoice: item.fit_add_choice,
        fitAddScore: item.fit_add_score,
        events,
        comment: item.comment || "",
        updatedAt: item.updated_at,
      };
    });

    const headers = [
      "Rush Number",
      "Rushee Name",
      "Major",
      "Year",
      "Gender",
      "Brother Name",
      "Brother Email",
      "Communication",
      "Passion",
      "Culture Fit",
      "Fit/Add Choice",
      "Fit/Add Score",
      "Events Talked At",
      "Comment",
      "Updated At",
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.rusheeNumber,
          row.rusheeName,
          row.major,
          row.year,
          row.gender,
          row.brotherName,
          row.brotherEmail,
          row.communication,
          row.passion,
          row.cultureFit,
          row.fitAddChoice,
          row.fitAddScore,
          row.events,
          row.comment,
          row.updatedAt,
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
    link.download = "tek-feedback.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const brotherOptions = Array.from(
    new Map(
      allFeedback
        .map((item) => item.brothers)
        .filter((brother): brother is BrotherRow => Boolean(brother))
        .map((brother) => [brother.id, brother])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const filteredFeedback = allFeedback.filter((item) => {
    const rushee = item.rushees;
    const brother = item.brothers;
    const events = getFeedbackEvents(item).map((event) => event.name).join(" ");
    const query = search.toLowerCase();

    const matchesSearch =
      (rushee?.name || "").toLowerCase().includes(query) ||
      String(rushee?.number || "").includes(query) ||
      (rushee?.major || "").toLowerCase().includes(query) ||
      (rushee?.year || "").toLowerCase().includes(query) ||
      (brother?.name || "").toLowerCase().includes(query) ||
      (brother?.email || "").toLowerCase().includes(query) ||
      events.toLowerCase().includes(query) ||
      (item.comment || "").toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (brotherFilter !== "All" && item.brother_id !== brotherFilter) {
      return false;
    }

    if (choiceFilter !== "All" && item.fit_add_choice !== choiceFilter) {
      return false;
    }

    return true;
  });

  const communicationAvg = getAverage(
    filteredFeedback.map((item) => item.communication)
  );

  const passionAvg = getAverage(filteredFeedback.map((item) => item.passion));

  const cultureAvg = getAverage(
    filteredFeedback.map((item) => item.culture_fit)
  );

  const fitAddAvg = getAverage(
    filteredFeedback.map((item) => item.fit_add_score)
  );

  if (loading || !currentBrother) {
    return (
      <main className="min-h-screen bg-[#F6F1E8] text-[#071E34]">
        <AdminNav />

        <section className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600">
            Loading feedback...
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
            Feedback
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            
          </p>
        </section>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {errorMessage && (
          <p className="mb-6 rounded-2xl bg-[#F5E8EA] p-4 text-sm font-bold text-[#8A1F2D]">
            {errorMessage}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Notes</p>
            <p className="mt-2 text-4xl font-black">
              {filteredFeedback.length}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Comm Avg</p>
            <p className="mt-2 text-4xl font-black">{communicationAvg}</p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Passion Avg</p>
            <p className="mt-2 text-4xl font-black">{passionAvg}</p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Culture Avg</p>
            <p className="mt-2 text-4xl font-black">{cultureAvg}</p>
          </div>

          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Fit/Add Avg</p>
            <p className="mt-2 text-4xl font-black">{fitAddAvg}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[#E5DDD0] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr_0.6fr_auto] lg:items-end">
            <label className="text-sm font-bold">
              Search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rushee, brother, event, comment..."
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              />
            </label>

            <label className="text-sm font-bold">
              Brother
              <select
                value={brotherFilter}
                onChange={(event) => setBrotherFilter(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              >
                <option>All</option>
                {brotherOptions.map((brother) => (
                  <option key={brother.id} value={brother.id}>
                    {brother.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Choice
              <select
                value={choiceFilter}
                onChange={(event) => setChoiceFilter(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#E5DDD0] bg-white px-4 py-3 text-sm font-normal outline-none"
              >
                <option>All</option>
                <option>Fit</option>
                <option>Add</option>
                <option>Neither</option>
              </select>
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

        <div className="mt-6 space-y-5">
          {filteredFeedback.length === 0 && (
            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 text-sm text-slate-600 shadow-sm">
              No feedback matches this view.
            </div>
          )}

          {filteredFeedback.map((item) => {
            const rushee = item.rushees;
            const brother = item.brothers;
            const events = getFeedbackEvents(item);

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm"
              >
                <div className="grid gap-5 lg:grid-cols-[10rem_1fr_auto] lg:items-start">
                  <div className="h-40 w-full overflow-hidden rounded-3xl bg-[#F0E8DA] lg:h-40 lg:w-40">
                    <img
                      src={rushee?.photo || defaultPhoto}
                      alt={rushee?.name || "Rushee"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black">
                        {rushee
                          ? `#${rushee.number} ${rushee.name}`
                          : "Rushee deleted"}
                      </h2>

                      <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-[#071E34]">
                        {item.fit_add_choice} · {item.fit_add_score}
                      </span>
                    </div>

                    {rushee && (
                      <p className="mt-2 text-sm text-slate-600">
                        {rushee.major || "No major"} ·{" "}
                        {rushee.year || "No year"}
                        {rushee.gender ? ` · ${rushee.gender}` : ""}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-slate-600">
                      Submitted by{" "}
                      <span className="font-bold text-[#071E34]">
                        {brother?.name || "Brother deleted"}
                      </span>
                      {brother?.email ? ` · ${brother.email}` : ""}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Last updated:{" "}
                      {new Date(item.updated_at).toLocaleDateString()}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
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
                          {item.culture_fit}
                        </p>
                        <p className="text-xs text-slate-500">Culture</p>
                      </div>

                      <div className="rounded-2xl bg-[#F6F1E8] p-4 text-center">
                        <p className="text-xl font-black">
                          {item.fit_add_score}
                        </p>
                        <p className="text-xs text-slate-500">Fit/Add</p>
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

                  <div className="flex flex-col gap-2">
                    {rushee && (
                      <a
                        href={`/admin/rushees/${rushee.id}`}
                        className="rounded-full border border-[#071E34] px-5 py-2 text-center text-sm font-bold text-[#071E34]"
                      >
                        Profile
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteFeedback(item)}
                      className="rounded-full border border-[#8A1F2D] px-5 py-2 text-sm font-bold text-[#8A1F2D]"
                    >
                      Delete
                    </button>
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