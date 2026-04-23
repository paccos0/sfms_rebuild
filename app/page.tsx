import Link from "next/link";
import {
  ShieldCheck,
  UsersRound,
  GraduationCap,
  ArrowRight,
  CreditCard,
  Landmark
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between lg:min-h-[calc(100vh-4rem)]">
        <section className="grid flex-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300">
              <GraduationCap className="h-3.5 w-3.5" />
              OROSHYA APP - (School Fees Management System)
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Manage school fees with one simple, connected system.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              This system helps the school manage students, fees, payments,
              balances, and parent access in one place. Admin users manage the
              records, while students and parents can check fee information from
              their own portal.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-brand-500/15 p-2.5">
                  <CreditCard className="h-5 w-5 text-brand-300" />
                </div>
                <p className="text-sm font-semibold text-white">Fees & Payments</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  Track fee structures, payments, balances, and penalties.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-brand-500/15 p-2.5">
                  <UsersRound className="h-5 w-5 text-brand-300" />
                </div>
                <p className="text-sm font-semibold text-white">Student Records</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  Organize students, enrollments, classes, and academic terms.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-brand-500/15 p-2.5">
                  <Landmark className="h-5 w-5 text-brand-300" />
                </div>
                <p className="text-sm font-semibold text-white">Portal Access</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  Let students and parents view balances and payment details.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <Link
              href="/login"
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-brand-400/30 hover:bg-brand-500/10 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-2xl bg-brand-500/15 p-3">
                    <ShieldCheck className="h-6 w-6 text-brand-300" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">
                    Admin Dashboard
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Access the management side of the system for students,
                    enrollments, fee settings, payments, penalties, reports, and
                    academic controls.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-2 transition group-hover:bg-brand-500/20">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Route
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-300">
                  /login
                </p>
              </div>
            </Link>

            <Link
              href="/portal"
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-brand-400/30 hover:bg-brand-500/10 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-2xl bg-brand-500/15 p-3">
                    <UsersRound className="h-6 w-6 text-brand-300" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">
                    Student – Parent Portal
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Students and parents can log in or register to view
                    outstanding balance, fee details, and school bank account
                    information in a simple portal.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-2 transition group-hover:bg-brand-500/20">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Route
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-300">
                  /portal
                </p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">
            School Fees Management System
          </p>
          <p className="text-xs text-slate-500">
            Admin management and student-parent access in one platform
          </p>
        </footer>
      </div>
    </main>
  );
}