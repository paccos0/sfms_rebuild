import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/terms"
      idKey="term_id"
      eyebrow="Academic setup"
      title="Terms"
      description="Create and maintain terms linked to academic years."
      columns={[
        { header: "ID", key: "term_id" },
        { header: "Academic Year", key: "academic_year_name" },
        { header: "Term", key: "name" },
        { header: "Start Date", key: "start_date" },
        { header: "End Date", key: "end_date" },
        { header: "Current", key: "current_status" },
        { header: "Active", key: "active_status" }
      ]}
      fields={[
        { name: "academic_year_id", label: "Academic year", type: "select", required: true, optionsEndpoint: "/academic-years", optionLabelKey: "name", optionValueKey: "academic_year_id" },
        { name: "name", label: "Term", type: "select", required: true, options: [{label:"Term 1", value:"Term 1"},{label:"Term 2", value:"Term 2"},{label:"Term 3", value:"Term 3"}] },
        { name: "start_date", label: "Start date", type: "date" },
        { name: "end_date", label: "End date", type: "date" },
        { name: "is_current", label: "Set as current term", type: "checkbox" },
        { name: "is_active", label: "Active", type: "checkbox" }
      ]}
      initialValues={{ academic_year_id: "", name: "", start_date: "", end_date: "", is_current: false, is_active: true }}
    />
  );
}
