"use client";

import SkeletonBlock from "@/components/ui/SkeletonBlock";
import SkeletonTable from "@/components/ui/SkeletonTable";

type PageSkeletonProps = {
  titleWidth?: string;
  descriptionWidth?: string;
  tableColumns?: number;
  tableRows?: number;
  showTopCards?: boolean;
  showTable?: boolean;
};

export default function PageSkeleton({
  titleWidth = "w-64",
  descriptionWidth = "w-96",
  tableColumns = 5,
  tableRows = 6,
  showTopCards = true,
  showTable = true
}: PageSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className={`mt-3 h-9 ${titleWidth}`} />
          <SkeletonBlock className={`mt-3 h-4 ${descriptionWidth} max-w-full`} />
        </div>

        <div className="flex gap-3">
          <SkeletonBlock className="h-12 w-28 rounded-2xl" />
          <SkeletonBlock className="h-12 w-32 rounded-2xl" />
        </div>
      </div>

      {showTopCards ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-4 h-8 w-28" />
              <SkeletonBlock className="mt-3 h-3 w-20" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
          </div>
          <SkeletonBlock className="h-11 w-24 rounded-2xl" />
        </div>
      </div>

      {showTable ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  {Array.from({ length: tableColumns }).map((_, index) => (
                    <th key={index} className="px-4 py-3 text-left">
                      <SkeletonBlock className="h-3 w-20" />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">
                    <SkeletonBlock className="h-3 w-16" />
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                <SkeletonTable columnCount={tableColumns} rowCount={tableRows} />
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}