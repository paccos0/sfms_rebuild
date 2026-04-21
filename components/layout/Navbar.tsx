import Link from "next/link";
import { getSessionUserFromCookies } from "@/lib/session";

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

      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-sm font-semibold text-white">
            {user ? `${user.first_name} ${user.last_name}` : "Guest"}
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {user?.role ?? "unknown"}
          </p>
        </div>
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
