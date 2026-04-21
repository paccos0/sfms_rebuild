"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";

type EnrollmentRow = {
  enrollment_id: number;
  student_name: string;
  academic_year_name: string;
  class_display_name: string;
  category_name: string;
  admission_type: string;
  enrollment_status: string;
  enrollment_date: string;
  notes?: string | null;
};

type OptionItem = Record<string, any>;

type EnrollmentPayload = {
  mode: "existing" | "new";
  student_id?: string | number;
  academic_year_id: string;
  year_class_id: string;
  category_id: string;
  admission_type: string;
  enrollment_status: string;
  enrollment_date: string;
  notes: string;

  registration_number?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  phone?: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
};

const emptyForm: EnrollmentPayload = {
  mode: "existing",
  student_id: "",
  academic_year_id: "",
  year_class_id: "",
  category_id: "",
  admission_type: "new",
  enrollment_status: "active",
  enrollment_date: "",
  notes: "",
  registration_number: "",
  first_name: "",
  last_name: "",
  gender: "",
  date_of_birth: "",
  phone: "",
  parent_name: "",
  parent_phone: "",
  address: "",
};

function normalizeArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.students)) return payload.students;
  if (Array.isArray(payload?.academicYears)) return payload.academicYears;
  if (Array.isArray(payload?.yearClasses)) return payload.yearClasses;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.enrollments)) return payload.enrollments;
  return [];
}

export default function EnrollmentsPage() {
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [students, setStudents] = useState<OptionItem[]>([]);
  const [academicYears, setAcademicYears] = useState<OptionItem[]>([]);
  const [yearClasses, setYearClasses] = useState<OptionItem[]>([]);
  const [categories, setCategories] = useState<OptionItem[]>([]);

  const [form, setForm] = useState<EnrollmentPayload>(emptyForm);

  const safeRows = Array.isArray(rows) ? rows : [];
  const safeStudents = Array.isArray(students) ? students : [];
  const safeAcademicYears = Array.isArray(academicYears) ? academicYears : [];
  const safeYearClasses = Array.isArray(yearClasses) ? yearClasses : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const yearClassOptions = useMemo(() => {
    if (!form.academic_year_id) return safeYearClasses;

    return safeYearClasses.filter(
      (item) => String(item.academic_year_id) === String(form.academic_year_id)
    );
  }, [form.academic_year_id, safeYearClasses]);

  async function loadData() {
    try {
      setLoading(true);

      const [
        enrollmentsRes,
        studentsRes,
        yearsRes,
        classesRes,
        categoriesRes,
      ] = await Promise.all([
        api.get("/enrollments"),
        api.get("/students"),
        api.get("/academic-years"),
        api.get("/year-classes"),
        api.get("/student-categories"),
      ]);

      setRows(normalizeArray(enrollmentsRes.data?.data ?? enrollmentsRes.data));
      setStudents(normalizeArray(studentsRes.data?.data ?? studentsRes.data));
      setAcademicYears(normalizeArray(yearsRes.data?.data ?? yearsRes.data));
      setYearClasses(normalizeArray(classesRes.data?.data ?? classesRes.data));
      setCategories(normalizeArray(categoriesRes.data?.data ?? categoriesRes.data));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "academic_year_id") {
        updated.year_class_id = "";
      }

      if (name === "mode") {
        if (value === "existing") {
          updated.registration_number = "";
          updated.first_name = "";
          updated.last_name = "";
          updated.gender = "";
          updated.date_of_birth = "";
          updated.phone = "";
          updated.parent_name = "";
          updated.parent_phone = "";
          updated.address = "";
        } else {
          updated.student_id = "";
        }
      }

      return updated;
    });
  };

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (form.mode === "existing" && !form.student_id) {
        toast.error("Please select an existing student.");
        return;
      }

      if (form.mode === "new") {
        if (
          !form.registration_number ||
          !form.first_name ||
          !form.last_name ||
          !form.gender
        ) {
          toast.error("Please fill all required new student fields.");
          return;
        }
      }

      await api.post("/enrollments", form);

      toast.success("Enrollment saved successfully.");
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save enrollment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (enrollment_id: number) => {
    const confirmed = window.confirm("Delete this enrollment?");
    if (!confirmed) return;

    try {
      await api.delete(`/enrollments?id=${enrollment_id}`);
      toast.success("Enrollment deleted successfully.");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete enrollment.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-400">Students</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Enrollments</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Assign an existing student to an academic year or create a new student and enroll immediately.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Enrollment mode
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option value="existing">Existing student</option>
                <option value="new">New student</option>
              </select>
            </div>
          </div>

          {form.mode === "existing" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Student
                </label>
                <select
                  name="student_id"
                  value={String(form.student_id ?? "")}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  required
                >
                  <option value="">Select student</option>
                  {safeStudents.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.student_label ??
                        `${student.registration_number ?? ""} - ${student.first_name ?? ""} ${student.last_name ?? ""}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="registration_number" label="Registration number" value={form.registration_number ?? ""} onChange={handleChange} required />
              <Input name="first_name" label="First name" value={form.first_name ?? ""} onChange={handleChange} required />
              <Input name="last_name" label="Last name" value={form.last_name ?? ""} onChange={handleChange} required />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Gender</label>
                <select
                  name="gender"
                  value={form.gender ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                </select>
              </div>
              <Input name="date_of_birth" label="Date of birth" type="date" value={form.date_of_birth ?? ""} onChange={handleChange} />
              <Input name="phone" label="Student phone" value={form.phone ?? ""} onChange={handleChange} />
              <Input name="parent_name" label="Parent name" value={form.parent_name ?? ""} onChange={handleChange} />
              <Input name="parent_phone" label="Parent phone" value={form.parent_phone ?? ""} onChange={handleChange} />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Address</label>
                <textarea
                  name="address"
                  value={form.address ?? ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              name="academic_year_id"
              label="Academic year"
              value={form.academic_year_id}
              onChange={handleChange}
              required
              options={safeAcademicYears.map((item) => ({
                value: item.academic_year_id,
                label: item.name,
              }))}
            />

            <SelectField
              name="year_class_id"
              label="Year class"
              value={form.year_class_id}
              onChange={handleChange}
              required
              options={yearClassOptions.map((item) => ({
                value: item.year_class_id,
                label:
                  item.year_class_label ??
                  item.class_display_name ??
                  `${item.class_name ?? ""}${item.section ? ` ${item.section}` : ""}`,
              }))}
            />

            <SelectField
              name="category_id"
              label="Category"
              value={form.category_id}
              onChange={handleChange}
              required
              options={safeCategories.map((item) => ({
                value: item.category_id,
                label: item.category_name,
              }))}
            />

            <SelectField
              name="admission_type"
              label="Admission type"
              value={form.admission_type}
              onChange={handleChange}
              required
              options={[
                { value: "new", label: "new" },
                { value: "continuing", label: "continuing" },
              ]}
            />

            <SelectField
              name="enrollment_status"
              label="Enrollment status"
              value={form.enrollment_status}
              onChange={handleChange}
              required
              options={[
                { value: "active", label: "active" },
                { value: "transferred", label: "transferred" },
                { value: "graduated", label: "graduated" },
                { value: "repeated", label: "repeated" },
                { value: "completed", label: "completed" },
                { value: "cancelled", label: "cancelled" },
              ]}
            />

            <Input
              name="enrollment_date"
              label="Enrollment date"
              type="date"
              value={form.enrollment_date}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save enrollment"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Academic Year</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Admission</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : safeRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                safeRows.map((row) => (
                  <tr key={row.enrollment_id} className="border-b border-white/5">
                    <td className="px-4 py-3">{row.enrollment_id}</td>
                    <td className="px-4 py-3">{row.student_name}</td>
                    <td className="px-4 py-3">{row.academic_year_name}</td>
                    <td className="px-4 py-3">{row.class_display_name}</td>
                    <td className="px-4 py-3">{row.category_name}</td>
                    <td className="px-4 py-3">{row.admission_type}</td>
                    <td className="px-4 py-3">{row.enrollment_status}</td>
                    <td className="px-4 py-3">{row.enrollment_date}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(row.enrollment_id)}
                        className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  required = false,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  options: { value: string | number; label: string }[];
}) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {safeOptions.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}