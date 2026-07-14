export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#061A33]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-center">
          <img
            src="/tek-logo.png"
            alt="TEK Logo"
            className="h-16 w-auto object-contain"
          />
        </nav>

        <div className="flex flex-1 items-center justify-center py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#C49A45]">
              Tau Epsilon Kappa
            </p>

            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#061A33] md:text-7xl">
              Rush Feedback
    
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-slate-600 md:text-xl">
              Iota Class
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/rush-board"
                className="rounded-full bg-[#061A33] px-8 py-4 text-center text-base font-bold text-[#F4F1EA] transition hover:bg-[#0B2748]"
              >
                Enter Brother View
              </a>

              <a
                href="/admin"
                className="rounded-full border border-[#061A33] px-8 py-4 text-center text-base font-bold text-[#061A33] transition hover:bg-[#061A33] hover:text-[#F4F1EA]"
              >
                Open Admin
              </a>
            </div>
          </div>
        </div>

        <p className="pb-4 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
Fall 2026        </p>
      </section>
    </main>
  );
}