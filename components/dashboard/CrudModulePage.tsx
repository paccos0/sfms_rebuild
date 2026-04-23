"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import SkeletonTable from "@/components/ui/SkeletonTable";

type Option = { label: string; value: string | number };

type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (item: T) => ReactNode;
};

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: Option[];
  optionsEndpoint?: string;
  optionLabelKey?: string;
  optionValueKey?: string;
};

type CrudModulePageProps<T extends Record<string, any>> = {
  apiPath: string;
  idKey: keyof T;
  eyebrow: string;
  title: string;
  description: string;
  columns: Array<Column<T>>;
  fields: Field[];
  initialValues: Record<string, any>;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: { items?: T[] };
};

export default function CrudModulePage<T extends Record<string, any>>({
  apiPath,
  idKey,
  eyebrow,
  title,
  description,
  columns,
  fields,
  initialValues
}: CrudModulePageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, any>>(initialValues);
  const [optionsMap, setOptionsMap] = useState<Record<string, Option[]>>({});

  async function loadItems() {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<T>>(apiPath);
      setItems(response.data.data.items ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    const endpointFields = fields.filter((field) => field.optionsEndpoint);
    if (!endpointFields.length) return;

    try {
      const loaded = await Promise.all(
        endpointFields.map(async (field) => {
          const response = await api.get<ApiResponse<Record<string, any>>>(field.optionsEndpoint!);
          const rawItems = response.data.data.items ?? [];
          const options = rawItems.map((item) => ({
            value: item[field.optionValueKey || "id"] ?? item.id,
            label: item[field.optionLabelKey || "label"] ?? item.label
          }));
          return [field.name, options] as const;
        })
      );

      setOptionsMap(Object.fromEntries(loaded));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to load form options.");
    }
  }

  useEffect(() => {
    loadItems();
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  const countLabel = useMemo(() => `${items.length} record${items.length === 1 ? "" : "s"}`, [items.length]);

  function openCreate() {
    setEditingItem(null);
    setForm({ ...initialValues });
    setOpen(true);
  }

  function normalizeForForm(field: Field, value: any) {
    if (field.type === "checkbox") return Boolean(value);
    if (field.type === "datetime-local") {
      if (!value) return "";
      return String(value).slice(0, 16);
    }
    return value ?? "";
  }

  function openEdit(item: T) {
    setEditingItem(item);
    const nextForm = { ...initialValues };

    for (const field of fields) {
      nextForm[field.name] = normalizeForForm(field, item[field.name]);
    }

    nextForm[String(idKey)] = item[idKey];
    setForm(nextForm);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingItem(null);
    setForm({ ...initialValues });
  }

  function updateField(name: string, value: any) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function sanitizePayload() {
    const payload: Record<string, any> = {};

    for (const field of fields) {
      const value = form[field.name];

      if (field.type === "checkbox") {
        payload[field.name] = value ? 1 : 0;
        continue;
      }

      payload[field.name] = value === "" ? null : value;
    }

    if (editingItem) payload[String(idKey)] = editingItem[idKey];
    return payload;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = sanitizePayload();

      if (editingItem) {
        await api.put(apiPath, payload);
        toast.success(`${title.slice(0, -1) || title} updated successfully.`);
      } else {
        await api.post(apiPath, payload);
        toast.success(`${title.slice(0, -1) || title} created successfully.`);
      }

      closeModal();
      await loadItems();
      await loadOptions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Unable to save ${title.toLowerCase()}.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: T) {
    const id = item[idKey];

    if (!window.confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return;

    try {
      await api.delete(`${apiPath}?id=${id}`);
      toast.success(`${title.slice(0, -1) || title} deleted successfully.`);
      await loadItems();
      await loadOptions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Unable to delete ${title.toLowerCase()}.`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-400">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadItems}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add new
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Live data and actions</h3>
            <p className="mt-1 text-sm text-slate-300">
              Create, edit, and delete records directly from this page.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
            {loading ? <SkeletonBlock className="h-5 w-24" /> : countLabel}
          </div>
        </div>
      </Card>

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300"
                  >
                    {column.header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <SkeletonTable columnCount={columns.length} rowCount={6} />
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={String(item[idKey] ?? index)} className="hover:bg-white/5">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-sm text-slate-200 align-top"
                      >
                        {column.render ? column.render(item) : String(item[column.key as keyof T] ?? "-")}
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-2"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="glass max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {editingItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
                </h3>
                <p className="mt-1 text-sm text-slate-300">Fill the form below and save your changes.</p>
              </div>

              <Button type="button" variant="ghost" className="px-3 py-2" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              {fields.map((field) => {
                const type = field.type || "text";
                const options = field.options ?? optionsMap[field.name] ?? [];
                const value = form[field.name] ?? (type === "checkbox" ? false : "");
                const span = type === "textarea" ? "md:col-span-2" : "";

                return (
                  <div key={field.name} className={span}>
                    {type === "checkbox" ? (
                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => updateField(field.name, e.target.checked)}
                        />
                        {field.label}
                      </label>
                    ) : type === "textarea" ? (
                      <>
                        <label className="label">{field.label}</label>
                        <textarea
                          className="input min-h-28"
                          placeholder={field.placeholder}
                          value={value}
                          required={field.required}
                          onChange={(e) => updateField(field.name, e.target.value)}
                        />
                      </>
                    ) : type === "select" ? (
                      <>
                        <label className="label">{field.label}</label>
                        <select
                          className="input"
                          value={value}
                          required={field.required}
                          onChange={(e) => updateField(field.name, e.target.value)}
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {options.map((option) => (
                            <option key={String(option.value)} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="label">{field.label}</label>
                        <input
                          className="input"
                          type={type}
                          placeholder={field.placeholder}
                          value={value}
                          required={field.required}
                          onChange={(e) => updateField(field.name, e.target.value)}
                        />
                      </>
                    )}
                  </div>
                );
              })}

              <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}