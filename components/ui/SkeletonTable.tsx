"use client";

import SkeletonBlock from "@/components/ui/SkeletonBlock";

type SkeletonTableProps = {
  columnCount: number;
  rowCount?: number;
  showActions?: boolean;
};

export default function SkeletonTable({
  columnCount,
  rowCount = 6,
  showActions = true
}: SkeletonTableProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="hover:bg-white/5">
          {Array.from({ length: columnCount }).map((__, colIndex) => (
            <td key={`${rowIndex}-${colIndex}`} className="px-4 py-3 align-top">
              <SkeletonBlock
                className={`h-4 ${
                  colIndex === 0
                    ? "w-32"
                    : colIndex === columnCount - 1
                    ? "w-20"
                    : "w-full max-w-[160px]"
                }`}
              />
            </td>
          ))}

          {showActions ? (
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <SkeletonBlock className="h-10 w-10 rounded-2xl" />
                <SkeletonBlock className="h-10 w-10 rounded-2xl" />
              </div>
            </td>
          ) : null}
        </tr>
      ))}
    </>
  );
}