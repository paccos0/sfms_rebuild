"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import DataTable from "@/components/tables/DataTable";

type ModuleTablePageProps<T extends Record<string, unknown>> = {
  apiPath: string;
  eyebrow: string;
  title: string;
  description: string;
  columns: Array<{ header: string; accessor: keyof T }>;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: { items: T[] };
};

export default function ModuleTablePage<T extends Record<string, unknown>>({
  apiPath,
  eyebrow,
  title,
  description,
  columns
}: ModuleTablePageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await api.get<ApiResponse<T>>(apiPath);
        if (mounted) {
          setItems(response.data.data.items ?? []);
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message || `Unable to load ${title.toLowerCase()}.`;
        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [apiPath, title]);

  const countLabel = useMemo(() => `${items.length} record${items.length === 1 ? "" : "s"}`, [items.length]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-400">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Live data</h3>
            <p className="mt-1 text-sm text-slate-300">
              This page is backed by the route handler at <span className="font-mono text-slate-200">{apiPath}</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
            {loading ? "Loading..." : countLabel}
          </div>
        </div>
      </Card>

      <DataTable columns={columns} data={items} />
    </div>
  );
}
