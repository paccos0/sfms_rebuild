import Link from "next/link";
import { BadgeDollarSign, BookOpenText, CalendarDays, CreditCard, FileText, GraduationCap, LayoutDashboard, School, Shield, TriangleAlert, Users } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/academic-years", label: "Academic Years", icon: CalendarDays },
  { href: "/terms", label: "Terms", icon: BookOpenText },
  { href: "/class-templates", label: "Class Templates", icon: School },
  { href: "/year-classes", label: "Year Classes", icon: GraduationCap },
  { href: "/students", label: "Students", icon: Users },
  { href: "/enrollments", label: "Enrollments", icon: Shield },
  { href: "/fees", label: "Fees", icon: BadgeDollarSign },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/penalties", label: "Penalties", icon: TriangleAlert },
  { href: "/reports", label: "Reports", icon: FileText }
];

export default function Sidebar() {
  return (
    <aside className="glass hidden w-72 shrink-0 rounded-3xl p-4 lg:block">
      <div className="mb-6 px-3 py-2">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-400">
          SFMS
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          OROSHYA APP
        </h2>
      </div>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
