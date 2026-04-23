export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between lg:min-h-[calc(100vh-4rem)]">
        <section className="grid flex-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="h-8 w-52 animate-pulse rounded-full bg-white/10" />

            <div className="mt-5 space-y-3">
              <div className="h-10 w-full max-w-xl animate-pulse rounded-2xl bg-white/10 sm:h-12" />
              <div className="h-10 w-full max-w-lg animate-pulse rounded-2xl bg-white/10 sm:h-12" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/10" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-3 h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
                  <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full">
                    <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
                    <div className="mt-4 h-7 w-56 animate-pulse rounded-xl bg-white/10" />

                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                    </div>
                  </div>

                  <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-64 animate-pulse rounded bg-white/10" />
        </footer>
      </div>
    </main>
  );
}