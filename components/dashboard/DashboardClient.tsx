"use client";

import { useEffect, useState } from "react";
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
        toast.error(error?.response?.data?.message || "Unable to load dashboard data.");
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

  const metrics = data?.metrics;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-400">Dashboard</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Financial overview</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Current academic context: <span className="font-semibold text-slate-200">{metrics?.academic_year ?? "Not set"}</span>
          {" · "}
          <span className="font-semibold text-slate-200">{metrics?.term ?? "No current term"}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Students" value={loading ? "..." : metrics?.total_students ?? 0} description="Active students in the current academic year." />
        <StatCard title="Collected Fees" value={loading ? "..." : formatCurrency(metrics?.collected_fees ?? 0)} description="Payments recorded for the current academic year." />
        <StatCard title="Unpaid Students" value={loading ? "..." : metrics?.unpaid_students ?? 0} description="Students with an outstanding current-term balance." />
        <StatCard title="Outstanding Balance" value={loading ? "..." : formatCurrency(metrics?.unpaid_balance ?? 0)} description="Expected current-term fees minus recorded payments." />
        <StatCard title="Total Credit" value={loading ? "..." : formatCurrency(metrics?.total_credit ?? 0)} description="Overpayments currently sitting as credit." />
        <StatCard title="Penalties" value={loading ? "..." : formatCurrency(metrics?.total_penalties ?? 0)} description="Unpaid penalty exposure for the current academic year." />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">Class debt overview</h3>
          <p className="mt-2 text-sm text-slate-300">Outstanding exposure by class for the current academic year.</p>
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
                outstanding_balance: formatCurrency(Number(item.outstanding_balance ?? 0))
              }))}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white">Term tracking</h3>
          <p className="mt-2 text-sm text-slate-300">Expected fees versus collections within the current academic year.</p>
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
                outstanding_balance: formatCurrency(Number(item.outstanding_balance ?? 0))
              }))}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
