import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/academic-years"
      idKey="academic_year_id"
      eyebrow="Academic setup"
      title="Academic Years"
      description="Manage academic years and control which year is currently active."
      columns={[
        { header: "ID", key: "academic_year_id" },
        { header: "Name", key: "name" },
        { header: "Start Date", key: "start_date" },
        { header: "End Date", key: "end_date" },
        { header: "Current", key: "current_status" },
        { header: "Active", key: "active_status" }
      ]}
      fields={[
        { name: "name", label: "Academic year name", required: true, placeholder: "2026-2027" },
        { name: "start_date", label: "Start date", type: "date", required: true },
        { name: "end_date", label: "End date", type: "date", required: true },
        { name: "is_current", label: "Set as current academic year", type: "checkbox" },
        { name: "is_active", label: "Active", type: "checkbox" }
      ]}
      initialValues={{ name: "", start_date: "", end_date: "", is_current: false, is_active: true }}
    />
  );
}
