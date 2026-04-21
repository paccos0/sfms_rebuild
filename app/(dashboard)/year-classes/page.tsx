import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/year-classes"
      idKey="year_class_id"
      eyebrow="Academic setup"
      title="Year Classes"
      description="Create actual classes for a specific academic year, with optional sections and capacities."
      columns={[
        { header: "ID", key: "year_class_id" },
        { header: "Academic Year", key: "academic_year_name" },
        { header: "Class", key: "class_name" },
        { header: "Section", key: "section_label" },
        { header: "Capacity", key: "capacity" },
        { header: "Active", key: "active_status" }
      ]}
      fields={[
        { name: "academic_year_id", label: "Academic year", type: "select", required: true, optionsEndpoint: "/academic-years", optionLabelKey: "name", optionValueKey: "academic_year_id" },
        { name: "class_template_id", label: "Class template", type: "select", required: true, optionsEndpoint: "/class-templates", optionLabelKey: "class_name", optionValueKey: "class_template_id" },
        { name: "section", label: "Section", placeholder: "A" },
        { name: "capacity", label: "Capacity", type: "number" },
        { name: "is_active", label: "Active", type: "checkbox" }
      ]}
      initialValues={{ academic_year_id: "", class_template_id: "", section: "", capacity: "", is_active: true }}
    />
  );
}
