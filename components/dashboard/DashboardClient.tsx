"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import StatCard from "@/components/dashboard/StatCard";
import Card from "@/components/ui/Card";
import DataTable from "@/components/tables/DataTable";
import { formatCurrency } from "@/lib/utils";

type DashboardMetricPayload = {
  metrics: {
    academic_year: string | null;
    term: string | null;
    total_students: number;
    collected_fees: number;
    collected_today: number;
    unpaid_students: number;
    unpaid_balance: number;
    total_credit: number;
    total_penalties: number;
  };
  class_overview: Array<{
    class_name: string;
    students: number;
    unpaid_students: number;
    outstanding_balance: number;
  }>;
  term_tracking: Array<{
    term_name: string;
    expected_fees: number;
    collected_fees: number;
    outstanding_balance: number;
  }>;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: DashboardMetricPayload;
};

export default function DashboardClient() {
  const [data, setData] = useState<DashboardMetricPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const response = await api.get<ApiResponse>("/dashboard");

        if (mounted) {
          setData(response.data.data);
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Unable to load dashboard data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const metrics = data?.metrics;

  const maxCollected = Math.max(
    ...(data?.term_tracking ?? []).map((item) => Number(item.collected_fees)),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-400">
          Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">
          Financial overview
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Current academic context:{" "}
          <span className="font-semibold text-slate-200">
            {metrics?.academic_year ?? "Not set"}
          </span>
          {" · "}
          <span className="font-semibold text-slate-200">
            {metrics?.term ?? "No current term"}
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={metrics?.total_students ?? 0}
          description="Active students in the current academic year."
        />
        <StatCard
          title="Collected Today"
          value={formatCurrency(metrics?.collected_today ?? 0)}
          description="Payments recorded today."
        />
        <StatCard
          title="Collected Fees"
          value={formatCurrency(metrics?.collected_fees ?? 0)}
          description="Payments recorded for the current academic year."
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(metrics?.unpaid_balance ?? 0)}
          description="Expected current-term fees minus recorded payments."
        />
        <StatCard
          title="Unpaid Students"
          value={metrics?.unpaid_students ?? 0}
          description="Students with outstanding current-term balance."
        />
        <StatCard
          title="Total Credit"
          value={formatCurrency(metrics?.total_credit ?? 0)}
          description="Overpayments currently sitting as credit."
        />
        <StatCard
          title="Penalties"
          value={formatCurrency(metrics?.total_penalties ?? 0)}
          description="Unpaid penalty exposure for the current academic year."
        />
        <Card className="p-5">
          <div className="w-fit rounded-2xl bg-brand-500/15 p-2.5">
            <BarChart3 className="h-5 w-5 text-brand-300" />
          </div>
          <p className="mt-4 text-sm text-slate-400">System Health</p>
          <p className="mt-2 text-2xl font-bold text-white">Active</p>
          <p className="mt-1 text-xs text-slate-500">
            Dashboard data is connected.
          </p>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500/15 p-2.5">
            <BarChart3 className="h-5 w-5 text-brand-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Payments By Term
            </p>
            <h3 className="text-xl font-bold text-white">
              Current Academic Year Collections
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {(data?.term_tracking ?? []).map((term) => {
            const percent = Math.max(
              3,
              Math.round((Number(term.collected_fees) / maxCollected) * 100)
            );

            return (
              <div
                key={term.term_name}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <p className="font-semibold text-white">{term.term_name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  Collected: {formatCurrency(Number(term.collected_fees ?? 0))}
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Expected: {formatCurrency(Number(term.expected_fees ?? 0))}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">
            Class debt overview
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Outstanding exposure by class for the current academic year.
          </p>
          <div className="mt-4">
            <DataTable
              columns={[
                { header: "Class", accessor: "class_name" },
                { header: "Students", accessor: "students" },
                { header: "Unpaid", accessor: "unpaid_students" },
                { header: "Outstanding", accessor: "outstanding_balance" }
              ]}
              data={(data?.class_overview ?? []).map((item) => ({
                ...item,
                outstanding_balance: formatCurrency(
                  Number(item.outstanding_balance ?? 0)
                )
              }))}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white">Term tracking</h3>
          <p className="mt-2 text-sm text-slate-300">
            Expected fees versus collections within the current academic year.
          </p>
          <div className="mt-4">
            <DataTable
              columns={[
                { header: "Term", accessor: "term_name" },
                { header: "Expected", accessor: "expected_fees" },
                { header: "Collected", accessor: "collected_fees" },
                { header: "Outstanding", accessor: "outstanding_balance" }
              ]}
              data={(data?.term_tracking ?? []).map((item) => ({
                ...item,
                expected_fees: formatCurrency(Number(item.expected_fees ?? 0)),
                collected_fees: formatCurrency(Number(item.collected_fees ?? 0)),
                outstanding_balance: formatCurrency(
                  Number(item.outstanding_balance ?? 0)
                )
              }))}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-9 w-72 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="p-5">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-4 h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-8 w-36 animate-pulse rounded-xl bg-white/10" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-white/10" />
          </Card>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
          <div>
            <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-6 w-72 animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 bg-black/20 p-4"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-4 w-40 animate-pulse rounded bg-white/10" />
              <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-32 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card key={cardIndex}>
            <div className="h-6 w-48 animate-pulse rounded-xl bg-white/10" />
            <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-white/10" />

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-4 gap-3 border-b border-white/10 bg-black/20 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-3 animate-pulse rounded bg-white/10"
                  />
                ))}
              </div>

              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-4 gap-3 border-b border-white/10 p-4 last:border-b-0"
                >
                  {Array.from({ length: 4 }).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-4 animate-pulse rounded bg-white/10"
                    />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}