"use client";

import SkeletonBlock from "@/components/ui/SkeletonBlock";
import SkeletonTable from "@/components/ui/SkeletonTable";

type Column<T> = {
  header: string;
  accessor: keyof T;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Array<Column<T>>;
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  skeletonRows = 5
}: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              {loading
                ? columns.map((column) => (
                    <th
                      key={String(column.accessor)}
                      className="px-4 py-3 text-left"
                    >
                      <SkeletonBlock className="h-3 w-20" />
                    </th>
                  ))
                : columns.map((column) => (
                    <th
                      key={String(column.accessor)}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300"
                    >
                      {column.header}
                    </th>
                  ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {loading ? (
              <SkeletonTable
                columnCount={columns.length}
                rowCount={skeletonRows}
                showActions={false}
              />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-white/5">
                  {columns.map((column) => (
                    <td
                      key={String(column.accessor)}
                      className="px-4 py-3 text-sm text-slate-200"
                    >
                      {String(row[column.accessor] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}