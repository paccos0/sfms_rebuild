import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/fees"
      idKey="fee_structure_id"
      eyebrow="Finance"
      title="Fees"
      description="Set the general fee structure per term, category, and admission type."
      columns={[
        { header: "ID", key: "fee_structure_id" },
        { header: "Academic Year", key: "academic_year_name" },
        { header: "Term", key: "term_name" },
        { header: "Category", key: "category_name" },
        { header: "Admission", key: "admission_type" },
        { header: "Amount", key: "amount_display" },
        { header: "Currency", key: "currency" },
        { header: "Active", key: "active_status" }
      ]}
      fields={[
        { name: "academic_year_id", label: "Academic year", type: "select", required: true, optionsEndpoint: "/academic-years", optionLabelKey: "name", optionValueKey: "academic_year_id" },
        { name: "term_id", label: "Term", type: "select", required: true, optionsEndpoint: "/terms", optionLabelKey: "term_label", optionValueKey: "term_id" },
        { name: "category_id", label: "Category", type: "select", required: true, optionsEndpoint: "/student-categories", optionLabelKey: "category_name", optionValueKey: "category_id" },
        { name: "admission_type", label: "Admission type", type: "select", required: true, options: [{label:"new", value:"new"},{label:"continuing", value:"continuing"}] },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "currency", label: "Currency", required: true },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "is_active", label: "Active", type: "checkbox" }
      ]}
      initialValues={{ academic_year_id: "", term_id: "", category_id: "", admission_type: "", amount: "", currency: "RWF", notes: "", is_active: true }}
    />
  );
}
