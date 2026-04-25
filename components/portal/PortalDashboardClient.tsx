"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AlertCircle,
  Banknote,
  Bell,
  CheckCircle2,
  Languages,
  Landmark,
  LogOut,
  ReceiptText,
  UserRound,
  Wallet,
  X
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Language = "en" | "rw" | "fr";

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
    payment_history: {
      payment_id: number;
      payment_ref: string;
      amount_paid: number;
      payment_method: string;
      paid_at: string;
      term_name: string;
      academic_year_name: string;
    }[];
    notifications: {
      unread_count: number;
      items: {
        notification_id: number;
        title: string;
        message: string;
        notification_type: "payment" | "general" | "warning";
        is_read: boolean;
        created_at: string;
      }[];
    };
  };
};

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function getPaymentStatus(totalOutstanding: number) {
  if (totalOutstanding <= 0) {
    return {
      label: "Paid",
      className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
    };
  }

  return {
    label: "Balance Due",
    className: "border-amber-400/30 bg-amber-500/10 text-amber-300"
  };
}

function setGoogleTranslateCookie(language: Language) {
  const value = `/en/${language}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

function clearGoogleTranslateCookie() {
  document.cookie =
    "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export default function PortalDashboardClient() {
  const [data, setData] = useState<PortalResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  const bellButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  async function loadDashboard() {
    try {
      const response = await api.get<PortalResponse>("/portal/dashboard");
      setData(response.data.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to load portal dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadDashboard();
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("oroshya_portal_language");

    if (
      savedLanguage === "en" ||
      savedLanguage === "rw" ||
      savedLanguage === "fr"
    ) {
      setLanguage(savedLanguage);
    }

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,rw,fr",
          autoDisplay: false
        },
        "google_translate_element"
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        bellButtonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setNotificationsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    localStorage.setItem("oroshya_portal_language", nextLanguage);

    if (nextLanguage === "en") {
      clearGoogleTranslateCookie();
    } else {
      setGoogleTranslateCookie(nextLanguage);
    }

    window.location.reload();
  }

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

  async function handleMarkNotificationsRead() {
    setMarkingRead(true);

    try {
      await api.post("/portal/notifications/read");
      toast.success("Notifications marked as read.");
      await loadDashboard();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to update notifications."
      );
    } finally {
      setMarkingRead(false);
    }
  }

  async function copyAccountNumber(accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success("Account number copied.");
    } catch {
      toast.error("Unable to copy account number.");
    }
  }

  function renderNotificationDropdown() {
    if (!mounted || !notificationsOpen || !data) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <div
          ref={dropdownRef}
          className="pointer-events-auto absolute right-3 top-20 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/60 sm:right-6 lg:right-8"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">Notifications</p>
              <p className="text-xs text-slate-400">
                {data.notifications.unread_count} unread
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotificationsOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-3">
            {data.notifications.items.length > 0 ? (
              <div className="space-y-2">
                {data.notifications.items.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`rounded-2xl border p-3 ${
                      notification.is_read
                        ? "border-white/10 bg-white/5"
                        : "border-brand-400/30 bg-brand-500/10"
                    }`}
                  >
                    <p className="break-words text-sm font-semibold text-white">
                      {notification.title}
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-300">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {notification.created_at}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-300" />
                <p className="mt-3 text-sm font-semibold text-white">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Payment updates will appear here.
                </p>
              </div>
            )}
          </div>

          {data.notifications.unread_count > 0 && (
            <div className="border-t border-white/10 p-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleMarkNotificationsRead}
                disabled={markingRead}
              >
                {markingRead ? "Updating..." : "Mark all as read"}
              </Button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <div id="google_translate_element" className="hidden" />
        <div className="mx-auto max-w-7xl space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
              <div className="mt-5 h-10 w-full max-w-sm animate-pulse rounded-2xl bg-white/10" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div id="google_translate_element" className="hidden" />
        <Card className="max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-300" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            We could not load your portal information right now.
          </p>
        </Card>
      </main>
    );
  }

  const status = getPaymentStatus(data.finance.total_outstanding);
  const compactPayments = data.payment_history.slice(0, 6);

  return (
    <>
      {renderNotificationDropdown()}

      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <div id="google_translate_element" className="hidden" />

        <div className="mx-auto max-w-7xl space-y-4">
          <header className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src="/icon.png"
                    alt="Oroshya Logo"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-300">
                    OROSHYA APP
                  </p>
                  <h1 className="truncate text-lg font-bold text-white sm:text-xl">
                    Student Fees Dashboard
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
                  {[
                    { key: "en", label: "EN" },
                    { key: "rw", label: "RW" },
                    { key: "fr", label: "FR" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleLanguageChange(item.key as Language)}
                      className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                        language === item.key
                          ? "bg-brand-500 text-white"
                          : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Languages className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 lg:flex-none">
                    <p className="truncate text-sm font-semibold text-white">
                      {data.viewer.display_name}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {data.viewer.role}
                    </p>
                  </div>

                  <button
                    ref={bellButtonRef}
                    type="button"
                    onClick={() => setNotificationsOpen((value) => !value)}
                    className="relative rounded-2xl border border-white/10 bg-black/20 p-3 text-slate-200 transition hover:bg-white/10"
                  >
                    <Bell className="h-5 w-5" />
                    {data.notifications.unread_count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                        {data.notifications.unread_count}
                      </span>
                    )}
                  </button>

                  <Button
                    variant="secondary"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "..." : "Logout"}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                    <Wallet className="h-4 w-4 text-brand-300" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Outstanding Balance
                    </span>
                  </div>

                  <p className="mt-5 break-words text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    {formatCurrency(data.finance.total_outstanding)}
                  </p>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                    This is the total amount currently remaining, including
                    school fees and unpaid penalties.
                  </p>
                </div>

                <div
                  className={`w-fit rounded-2xl border px-4 py-2 text-sm font-semibold ${status.className}`}
                >
                  {status.label}
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MiniMoneyCard title="Fee Due" value={data.finance.fee_due} />
                <MiniMoneyCard title="Paid" value={data.finance.amount_paid} />
                <MiniMoneyCard
                  title="Penalties"
                  value={data.finance.unpaid_penalties}
                />
              </div>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-8">
              <SectionHeader
                icon={UserRound}
                eyebrow="Student Information"
                title={data.student.full_name}
              />

              <div className="mt-6 space-y-3">
                <InfoRow
                  label="Registration Number"
                  value={data.student.registration_number}
                />
                <InfoRow
                  label="Class"
                  value={data.student.class_name || "Not assigned"}
                />
                <InfoRow
                  label="Academic Year"
                  value={data.student.academic_year || "Not set"}
                />
                <InfoRow
                  label="Current Term"
                  value={data.student.term || "Not set"}
                />
                <InfoRow
                  label="Parent"
                  value={data.student.parent_name || "Not assigned"}
                />
              </div>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <SectionHeader
                icon={ReceiptText}
                eyebrow="Payment Breakdown"
                title="Current Term Summary"
              />

              <div className="mt-6 space-y-3">
                <FinanceRow
                  label="Expected School Fees"
                  value={data.finance.fee_due}
                />
                <FinanceRow
                  label="Total Paid"
                  value={data.finance.amount_paid}
                />
                <FinanceRow
                  label="Tuition Balance"
                  value={data.finance.tuition_balance}
                />
                <FinanceRow
                  label="Unpaid Penalties"
                  value={data.finance.unpaid_penalties}
                />

                <div className="mt-4 rounded-3xl border border-brand-400/20 bg-brand-500/10 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-white">
                      Total Outstanding
                    </span>
                    <span className="break-words text-lg font-bold text-brand-300">
                      {formatCurrency(data.finance.total_outstanding)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <SectionHeader
                icon={Landmark}
                eyebrow="School Bank Accounts"
                title="Payment Information"
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {data.bank_accounts.length > 0 ? (
                  data.bank_accounts.map((account) => (
                    <div
                      key={`${account.bank_name}-${account.account_number}`}
                      className="min-w-0 rounded-3xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-2xl bg-white/10 p-2.5">
                          <Banknote className="h-5 w-5 text-brand-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {account.bank_name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {account.account_name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Account Number
                        </p>
                        <p className="mt-1 break-words text-lg font-bold text-brand-300">
                          {account.account_number}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-4 w-full"
                        onClick={() => copyAccountNumber(account.account_number)}
                      >
                        Copy Account Number
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-slate-400 sm:col-span-2">
                    No school bank account has been configured yet.
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section>
            <Card className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <SectionHeader
                icon={ReceiptText}
                eyebrow="Payment History"
                title="Recent Payments"
              />

              <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {compactPayments.length > 0 ? (
                  compactPayments.map((payment) => (
                    <div
                      key={payment.payment_id}
                      className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {payment.payment_ref}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {payment.paid_at}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-emerald-300">
                          {formatCurrency(payment.amount_paid)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-xl bg-white/10 px-2.5 py-1 text-xs text-slate-300">
                          {payment.term_name}
                        </span>
                        <span className="rounded-xl bg-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">
                          {payment.payment_method.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-center sm:col-span-2 xl:col-span-3">
                    <ReceiptText className="mx-auto h-10 w-10 text-slate-500" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      No payments recorded yet
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Payment records will appear here after the school records a
                      payment.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </section>

          <footer className="pb-2 text-center text-xs text-slate-500">
            OROSHYA APP • Student & Parent Portal
          </footer>
        </div>
      </main>
    </>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="shrink-0 rounded-2xl bg-brand-500/15 p-2.5">
        <Icon className="h-5 w-5 text-brand-300" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </p>
        <h2 className="break-words text-xl font-bold text-white">{title}</h2>
      </div>
    </div>
  );
}

function MiniMoneyCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 break-words text-lg font-bold text-white">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="break-words text-sm font-semibold text-white sm:text-right">
        {value}
      </span>
    </div>
  );
}

function FinanceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="break-words text-sm font-semibold text-white sm:text-right">
        {formatCurrency(value)}
      </span>
    </div>
  );
}