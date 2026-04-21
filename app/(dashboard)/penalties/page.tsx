import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/penalties"
      idKey="penalty_id"
      eyebrow="Finance"
      title="Penalties"
      description="Manage penalties for damaged or lost tools linked to a student enrollment."
      columns={[
        { header: "ID", key: "penalty_id" },
        { header: "Student", key: "student_name" },
        { header: "Academic Year", key: "academic_year_name" },
        { header: "Title", key: "title" },
        { header: "Amount", key: "amount_display" },
        { header: "Status", key: "penalty_status" },
        { header: "Issued At", key: "issued_at" },
        { header: "Paid At", key: "paid_at" }
      ]}
      fields={[
        { name: "enrollment_id", label: "Enrollment", type: "select", required: true, optionsEndpoint: "/enrollments", optionLabelKey: "enrollment_label", optionValueKey: "enrollment_id" },
        { name: "title", label: "Penalty title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "penalty_status", label: "Penalty status", type: "select", required: true, options: [{label:"unpaid", value:"unpaid"},{label:"paid", value:"paid"},{label:"waived", value:"waived"}] },
        { name: "issued_at", label: "Issued at", type: "datetime-local", required: true },
        { name: "paid_at", label: "Paid at", type: "datetime-local" }
      ]}
      initialValues={{ enrollment_id: "", title: "", description: "", amount: "", penalty_status: "unpaid", issued_at: "", paid_at: "" }}
    />
  );
}
