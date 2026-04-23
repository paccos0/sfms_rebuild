"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import SkeletonBlock from "@/components/ui/SkeletonBlock";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export default function Button({
  className,
  variant = "primary",
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500/30",
    secondary:
      "bg-white/10 text-slate-100 hover:bg-white/15 focus:ring-white/20",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/10 focus:ring-white/20",
    danger:
      "bg-rose-500 text-white hover:bg-rose-400 focus:ring-rose-500/30"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2 w-full">
          {/* Icon skeleton */}
          {icon && <SkeletonBlock className="h-4 w-4 rounded" />}

          {/* Text skeleton */}
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}