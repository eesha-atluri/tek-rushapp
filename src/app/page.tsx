export default function Home() {
  return (
    <main className="min-h-screen bg-[#061A33] text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-8">
        <div className="pt-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-[#C49A45] text-3xl font-bold text-[#C49A45]">
            TEK
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-[#C49A45]">
            Tau Epsilon Kappa
          </p>

          <h1 className="mt-4 text-4xl font-extrabold">Rush Feedback</h1>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            Organize rushee feedback for hashes. Brothers submit feedback.
            Admins manage rushee profiles, photos, and events.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/rush-board"
            className="block rounded-xl bg-[#9B1232] px-4 py-3 text-center font-bold text-white shadow-lg"
          >
            Brother Login
          </a>

          <a
            href="/admin"
            className="block rounded-xl border border-[#C49A45] px-4 py-3 text-center font-bold text-[#C49A45]"
          >
            Admin Login
          </a>

          <button className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-[#061A33]">
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-xs uppercase tracking-[0.25em] text-[#C49A45]">
          Professional Technology Fraternity
        </p>
      </section>
    </main>
  );
}