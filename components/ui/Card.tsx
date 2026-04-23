"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SkeletonBlock from "@/components/ui/SkeletonBlock";

type CardProps = {
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  skeletonLines?: number;
};

export default function Card({
  children,
  className,
  loading = false,
  skeletonLines = 3
}: CardProps) {
  return (
    <div className={cn("glass rounded-3xl p-5", className)}>
      {loading ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-8 w-28" />
          {Array.from({ length: Math.max(0, skeletonLines - 2) }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className={cn(
                "h-3",
                index === skeletonLines - 3 ? "w-20" : "w-full max-w-[220px]"
              )}
            />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
}