"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Landmark, Wallet, GraduationCap, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type PortalResponse = {
  success: boolean;
  message: string;
  data: {
    viewer: {
      role: "student" | "parent";
      display_name: string;
    };
    student: {
      student_id: number;
      registration_number: string;
      full_name: string;
      parent_name: string | null;
      class_name: string | null;
      academic_year: string | null;
      term: string | null;
    };
    finance: {
      fee_due: number;
      amount_paid: number;
      tuition_balance: number;
      unpaid_penalties: number;
      total_outstanding: number;
    };
    bank_accounts: {
      bank_name: string;
      account_name: string;
      account_number: string;
    }[];
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0
  }).format(value);
}

export default function PortalDashboardClient() {
  const [data, setData] = useState<PortalResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api
      .get<PortalResponse>("/portal/dashboard")
      .then((response) => setData(response.data.data))
      .catch((error) =>
        toast.error(
          error?.response?.data?.message ||
            "Unable to load portal dashboard."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await api.post("/auth/logout");
      window.location.href = "/portal";
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to logout right now."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse p-6">
          <div className="h-6 w-48 rounded bg-white/10" />
          <div className="mt-4 h-4 w-72 rounded bg-white/10" />
        </Card>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse p-6">
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="mt-4 h-8 w-32 rounded bg-white/10" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-shell min-h-screen">
      <div className="page-container">
        <header className="glass mb-6 flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
              {data.viewer.role === "parent" ? "Parent Portal" : "Student Portal"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              School Fees Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {data.student.full_name} • {data.student.registration_number}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                {data.viewer.display_name}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {data.viewer.role}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-brand-400" />
              <p className="text-sm font-medium text-slate-300">
                Outstanding Balance
              </p>
            </div>
            <p className="mt-4 text-3xl font-bold text-white">
              {formatCurrency(data.finance.total_outstanding)}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Total unpaid tuition and penalties
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-brand-400" />
              <p className="text-sm font-medium text-slate-300">
                Academic Context
              </p>
            </div>
            <p className="mt-4 text-lg font-semibold text-white">
              {data.student.academic_year ?? "Not set"}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {data.student.term ?? "No current term"} • {data.student.class_name ?? "No class"}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-brand-400" />
              <p className="text-sm font-medium text-slate-300">
                Payment Breakdown
              </p>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Fee Due</span>
                <span>{formatCurrency(data.finance.fee_due)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Paid</span>
                <span>{formatCurrency(data.finance.amount_paid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Penalties</span>
                <span>{formatCurrency(data.finance.unpaid_penalties)}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-6">
            <p className="text-sm font-semibold text-white">Student Details</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Student Name
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {data.student.full_name}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  RegNo
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {data.student.registration_number}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Parent Name
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {data.student.parent_name || "Not assigned"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Class
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {data.student.class_name || "Not assigned"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-brand-400" />
              <p className="text-sm font-semibold text-white">
                School Bank Accounts
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {data.bank_accounts.length > 0 ? (
                data.bank_accounts.map((account) => (
                  <div
                    key={`${account.bank_name}-${account.account_number}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {account.bank_name}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {account.account_name}
                    </p>
                    <p className="mt-1 text-lg font-bold tracking-wide text-brand-300">
                      {account.account_number}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-400">
                  No school bank accounts have been configured yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}