import Link from "next/link";
import { getSessionUserFromCookies } from "@/lib/session";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import CalculatorPopup from "@/components/CalculatorPopup";

export default async function Navbar() {
  const user = await getSessionUserFromCookies();

  return (
    <header className="glass mb-6 flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          School Fees Management System
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          {user ? (
            <>
              <p className="text-sm font-semibold text-white">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {user.role}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
          )}
        </div>

        <CalculatorPopup />

        <Link
          href="/profile"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Profile
        </Link>
      </div>
    </header>
  );
}