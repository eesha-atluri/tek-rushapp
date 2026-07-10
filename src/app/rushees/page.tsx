import { rushees } from "@/lib/mockData";
import BrotherNav from "@/app/components/BrotherNav";

export default function RusheesPage() {
  return (
    <main className="min-h-screen bg-[#F8F6F1] pb-20 text-[#061A33]">
        <BrotherNav />
      <header className="bg-[#061A33] px-5 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Tau Epsilon Kappa
        </p>
        <h1 className="mt-1 text-2xl font-extrabold">Rushees</h1>
      </header>

      <section className="mx-auto max-w-md px-4 py-5">
        <input
          placeholder="Search by name, number, major..."
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
        />

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {["All", "Open Rush", "Voted By Me", "Needs Reviews"].map(
            (filter) => (
              <button
                key={filter}
                className="whitespace-nowrap rounded-full border border-[#C49A45]/40 bg-white px-4 py-2 text-xs font-semibold"
              >
                {filter}
              </button>
            )
          )}
        </div>

        <div className="space-y-3">
          {rushees.map((rushee) => (
            <a
              key={rushee.id}
              href={`/rushees/${rushee.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-4">
                <img
                  src={rushee.photo}
                  alt={rushee.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="font-bold">{rushee.name}</h2>
                      <p className="text-xs text-slate-500">
                        #{rushee.number} · {rushee.major} · {rushee.year}
                      </p>
                    </div>

                    <span className="text-xl text-[#9B1232]">›</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Events: {rushee.events.join(", ")}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#9B1232]">
                    Reviews: {rushee.reviews} brothers
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}