import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/payments"
      idKey="payment_id"
      eyebrow="Finance"
      title="Payments"
      description="Record, adjust, and trace student payments by enrollment and term."
      columns={[
        { header: "ID", key: "payment_id" },
        { header: "Reference", key: "payment_ref" },
        { header: "Student", key: "student_name" },
        { header: "Year", key: "academic_year_name" },
        { header: "Term", key: "term_name" },
        { header: "Amount", key: "amount_paid_display" },
        { header: "Method", key: "payment_method" },
        { header: "Paid At", key: "paid_at" }
      ]}
      fields={[
        { name: "enrollment_id", label: "Enrollment", type: "select", required: true, optionsEndpoint: "/enrollments", optionLabelKey: "enrollment_label", optionValueKey: "enrollment_id" },
        { name: "term_id", label: "Term", type: "select", required: true, optionsEndpoint: "/terms", optionLabelKey: "term_label", optionValueKey: "term_id" },
        { name: "amount_paid", label: "Amount paid", type: "number", required: true },
        { name: "payment_method", label: "Payment method", type: "select", required: true, options: [{label:"cash", value:"cash"},{label:"bank", value:"bank"},{label:"mobile_money", value:"mobile_money"},{label:"other", value:"other"}] },
        { name: "paid_at", label: "Paid at", type: "datetime-local", required: true },
        { name: "note", label: "Note", type: "textarea" }
      ]}
      initialValues={{ enrollment_id: "", term_id: "", amount_paid: "", payment_method: "cash", paid_at: "", note: "" }}
    />
  );
}
