"use client";

import Card from "@/components/ui/Card";
import SkeletonBlock from "@/components/ui/SkeletonBlock";

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  loading?: boolean;
};

export default function StatCard({
  title,
  value,
  description,
  loading = false
}: StatCardProps) {
  return (
    <Card className="p-5">
      {loading ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-8 w-28" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-300">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </>
      )}
    </Card>
  );
}