"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  Printer,
  RefreshCcw,
  Search,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type AcademicYear = {
  academic_year_id: number;
  name: string;
  is_current: number;
};

type Term = {
  term_id: number;
  academic_year_id: number;
  name: string;
  term_label: string;
  is_current: number;
};

type YearClass = {
  year_class_id: number;
  academic_year_id: number;
  year_class_label: string;
};

type OutstandingFeeRow = {
  student_id: number;
  enrollment_id: number;
  names: string;
  student_name: string;
  registration_number: string;
  academic_year_name: string;
  term_name: string;
  class_name: string;
  fee: number;
  amount: number;
};

type OutstandingFeesResponse = {
  success: boolean;
  message: string;
  data: {
    items: OutstandingFeeRow[];
    totals: {
      students: number;
      fee: number;
      amount: number;
    };
    filters: {
      academic_year_id: number;
      term_id: number;
      year_class_id: string | number;
    };
  };
};

type OptionsResponse<T> = {
  success: boolean;
  message: string;
  data: {
    items: T[];
  };
};

function formatCurrency(value: number) {
  const absValue = Math.abs(value || 0);

  const formatted = new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0
  }).format(absValue);

  return value < 0 ? `-${formatted}` : formatted;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeFileName(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

export default function OutstandingFeesClient() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [yearClasses, setYearClasses] = useState<YearClass[]>([]);
  const [rows, setRows] = useState<OutstandingFeeRow[]>([]);
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [yearClassId, setYearClassId] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);

  const filteredTerms = useMemo(() => {
    if (!academicYearId) return terms;
    return terms.filter(
      (term) => String(term.academic_year_id) === String(academicYearId)
    );
  }, [terms, academicYearId]);

  const filteredClasses = useMemo(() => {
    if (!academicYearId) return yearClasses;
    return yearClasses.filter(
      (yearClass) =>
        String(yearClass.academic_year_id) === String(academicYearId)
    );
  }, [yearClasses, academicYearId]);

  const visibleRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return rows;

    return rows.filter((row) => {
      return (
        row.names.toLowerCase().includes(needle) ||
        row.class_name.toLowerCase().includes(needle)
      );
    });
  }, [rows, search]);

  const selectedAcademicYearName =
    academicYears.find(
      (item) => String(item.academic_year_id) === String(academicYearId)
    )?.name ?? "Academic Year";

  const selectedTermName =
    terms.find((item) => String(item.term_id) === String(termId))?.name ??
    "Term";

  const selectedClassName =
    yearClassId === "all"
      ? "ALL CLASSES"
      : yearClasses.find(
          (item) => String(item.year_class_id) === String(yearClassId)
        )?.year_class_label ?? "CLASS";

  useEffect(() => {
    async function loadOptions() {
      try {
        const [yearsResponse, termsResponse, classesResponse] =
          await Promise.all([
            api.get<OptionsResponse<AcademicYear>>("/academic-years"),
            api.get<OptionsResponse<Term>>("/terms"),
            api.get<OptionsResponse<YearClass>>("/year-classes")
          ]);

        const yearItems = yearsResponse.data.data.items;
        const termItems = termsResponse.data.data.items;
        const classItems = classesResponse.data.data.items;

        setAcademicYears(yearItems);
        setTerms(termItems);
        setYearClasses(classItems);

        const currentYear = yearItems.find((item) => Number(item.is_current));
        const currentTerm = termItems.find((item) => Number(item.is_current));

        const defaultYearId =
          currentYear?.academic_year_id ?? yearItems[0]?.academic_year_id ?? "";

        const defaultTermId =
          currentTerm?.term_id ??
          termItems.find(
            (item) => String(item.academic_year_id) === String(defaultYearId)
          )?.term_id ??
          "";

        setAcademicYearId(String(defaultYearId));
        setTermId(String(defaultTermId));
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Unable to load filter options."
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    if (!academicYearId || !termId) return;
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYearId, termId, yearClassId]);

  useEffect(() => {
    if (!academicYearId) return;

    const termStillValid = terms.some(
      (term) =>
        String(term.term_id) === String(termId) &&
        String(term.academic_year_id) === String(academicYearId)
    );

    if (!termStillValid) {
      const nextTerm = terms.find(
        (term) => String(term.academic_year_id) === String(academicYearId)
      );

      setTermId(nextTerm ? String(nextTerm.term_id) : "");
    }

    const classStillValid =
      yearClassId === "all" ||
      yearClasses.some(
        (yearClass) =>
          String(yearClass.year_class_id) === String(yearClassId) &&
          String(yearClass.academic_year_id) === String(academicYearId)
      );

    if (!classStillValid) {
      setYearClassId("all");
    }
  }, [academicYearId, terms, termId, yearClasses, yearClassId]);

  async function loadRows() {
    setLoadingRows(true);

    try {
      const params = new URLSearchParams({
        academic_year_id: academicYearId,
        term_id: termId,
        year_class_id: yearClassId
      });

      const response = await api.get<OutstandingFeesResponse>(
        `/outstanding-fees?${params.toString()}`
      );

      setRows(response.data.data.items);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to load outstanding fees."
      );
    } finally {
      setLoadingRows(false);
    }
  }

  function exportToExcel() {
    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table {
              border-collapse: collapse;
              table-layout: fixed;
              width: 620px;
              font-family: Arial, sans-serif;
              font-size: 10px;
            }

            th {
              background: #d9eaf7;
              color: #000000;
              font-weight: bold;
              border: 1px solid #000000;
              padding: 3px 4px;
              text-align: left;
              height: 16px;
            }

            td {
              border: 1px solid #000000;
              padding: 2px 4px;
              vertical-align: middle;
              height: 15px;
            }

            .money {
              text-align: right;
              mso-number-format: "#,##0";
            }
          </style>
        </head>
        <body>
          <table>
            <colgroup>
              <col style="width: 360px;" />
              <col style="width: 130px;" />
              <col style="width: 130px;" />
            </colgroup>
            <tr>
              <th>Names</th>
              <th>Fee</th>
              <th>Amount</th>
            </tr>
            ${visibleRows
              .map(
                (row) => `
                  <tr>
                    <td>${escapeHtml(row.names)}</td>
                    <td class="money">${row.fee}</td>
                    <td class="money">${row.amount}</td>
                  </tr>
                `
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const fileName = `MINERIVAL ${selectedAcademicYearName} ${selectedClassName}.xls`;

    link.href = url;
    link.download = safeFileName(fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    toast.success("Excel file exported.");
  }

  function printTable() {
    window.print();
  }

  const totalFee = visibleRows.reduce((sum, row) => sum + row.fee, 0);
  const totalAmount = visibleRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #outstanding-print,
          #outstanding-print * {
            visibility: visible !important;
          }

          #outstanding-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }

          #outstanding-print table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 9px;
            line-height: 1.05;
          }

          #outstanding-print th,
          #outstanding-print td {
            border: 1px solid #000000;
            padding: 2px 3px;
            color: black !important;
            height: 13px;
            vertical-align: middle;
          }

          #outstanding-print th {
            background: #e5e7eb !important;
            font-weight: 700;
            text-align: left;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between print:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-400">
            Finance
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Outstanding Fees
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            This report carries previous unpaid balances forward. Credit is shown
            as a negative amount.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={loadRows}
            disabled={loadingRows || !academicYearId || !termId}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={exportToExcel}
            disabled={loadingRows || visibleRows.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>

          <Button
            type="button"
            onClick={printTable}
            disabled={loadingRows || visibleRows.length === 0}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="p-5 print:hidden">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500/15 p-2.5">
            <Filter className="h-5 w-5 text-brand-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Filters
            </p>
            <h3 className="text-lg font-bold text-white">
              Choose academic context
            </h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Academic Year"
            value={academicYearId}
            onChange={setAcademicYearId}
            disabled={loadingOptions}
            options={academicYears.map((item) => ({
              label: item.name,
              value: String(item.academic_year_id)
            }))}
          />

          <FilterSelect
            label="Term"
            value={termId}
            onChange={setTermId}
            disabled={loadingOptions || !academicYearId}
            options={filteredTerms.map((item) => ({
              label: item.term_label || item.name,
              value: String(item.term_id)
            }))}
          />

          <FilterSelect
            label="Class"
            value={yearClassId}
            onChange={setYearClassId}
            disabled={loadingOptions || !academicYearId}
            options={[
              { label: "All classes", value: "all" },
              ...filteredClasses.map((item) => ({
                label: item.year_class_label,
                value: String(item.year_class_id)
              }))
            ]}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Search
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student or class"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <SummaryCard
          title="Students"
          value={String(visibleRows.length)}
          icon={Wallet}
        />
        <SummaryCard title="Fee" value={formatCurrency(totalFee)} icon={Wallet} />
        <SummaryCard
          title="Amount"
          value={formatCurrency(totalAmount)}
          icon={Wallet}
        />
      </div>

      <Card className="p-0 print:rounded-none print:border-0 print:bg-white print:p-0">
        {loadingRows ? (
          <OutstandingSkeleton />
        ) : (
          <div id="outstanding-print" className="p-5 print:p-0">
            <div className="mb-5 flex flex-col gap-2 print:hidden">
              <h3 className="text-lg font-semibold text-white">
                Outstanding List
              </h3>
              <p className="text-sm text-slate-400">
                {selectedAcademicYearName} • {selectedTermName} •{" "}
                {selectedClassName}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 print:rounded-none print:border-0">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[58%]" />
                  <col className="w-[21%]" />
                  <col className="w-[21%]" />
                </colgroup>

                <thead className="bg-black/30 print:bg-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 print:text-black">
                      Names
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 print:text-black">
                      Fee
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 print:text-black">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10 bg-black/20 print:divide-gray-300 print:bg-white">
                  {visibleRows.length > 0 ? (
                    visibleRows.map((row) => (
                      <tr key={row.enrollment_id}>
                        <td className="break-words px-3 py-3 text-sm font-medium text-white print:text-black">
                          {row.names}
                        </td>
                        <td className="break-words px-3 py-3 text-right text-sm font-semibold text-slate-200 print:text-black">
                          {formatCurrency(row.fee)}
                        </td>
                        <td
                          className={`break-words px-3 py-3 text-right text-sm font-semibold print:text-black ${
                            row.amount < 0 ? "text-emerald-300" : "text-brand-300"
                          }`}
                        >
                          {formatCurrency(row.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-8 text-center text-sm text-slate-400 print:text-black"
                      >
                        No students found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>

                {visibleRows.length > 0 && (
                  <tfoot className="bg-brand-500/10 print:bg-gray-200">
                    <tr>
                      <td className="px-3 py-3 text-sm font-bold text-white print:text-black">
                        Total: {visibleRows.length}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-white print:text-black">
                        {formatCurrency(totalFee)}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-white print:text-black">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.length === 0 ? (
          <option value="">No options</option>
        ) : (
          options.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold text-white">
            {value}
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-brand-500/15 p-2.5">
          <Icon className="h-5 w-5 text-brand-300" />
        </div>
      </div>
    </Card>
  );
}

function OutstandingSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div>
        <div className="h-6 w-48 animate-pulse rounded-xl bg-white/10" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/10" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-3 gap-3 border-b border-white/10 bg-black/20 p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-4 animate-pulse rounded bg-white/10"
            />
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-3 gap-3 border-b border-white/10 p-4 last:border-b-0"
          >
            {Array.from({ length: 3 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 animate-pulse rounded bg-white/10"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}