"use client";

type SkeletonBlockProps = {
  className?: string;
};

export default function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}