"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgeDollarSign,
  BookOpenText,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  School,
  Shield,
  TriangleAlert,
  Users,
  ChevronLeft,
  ChevronRight,
  WalletCards
} from "lucide-react";

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
  { href: "/outstanding-fees", label: "Outstanding Fees", icon: WalletCards },
  { href: "/penalties", label: "Penalties", icon: TriangleAlert },
  { href: "/reports", label: "Reports", icon: FileText }
  
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`glass hidden shrink-0 rounded-3xl p-3 transition-all duration-300 lg:block ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between px-2 py-2">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              <Image
                src="/icon.png"
                alt="Oroshya Logo"
                fill
                className="object-contain p-1"
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-400">
                SFMS
              </p>
              <h2 className="text-lg font-semibold text-white leading-tight">
                OROSHYA APP
              </h2>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl p-2 text-slate-300 hover:bg-white/10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                isActive
                  ? "bg-brand-500/20 text-white border border-brand-400/30"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-brand-400" : ""
                }`}
              />

              {!collapsed && <span>{label}</span>}

              {/* Tooltip (when collapsed) */}
              {collapsed && (
                <span className="absolute left-20 z-50 hidden rounded-xl bg-black px-3 py-1 text-xs text-white shadow-lg group-hover:block">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}