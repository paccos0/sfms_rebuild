import ModuleTablePage from "@/components/dashboard/ModuleTablePage";

export default function Page() {
  return (
    <ModuleTablePage
      apiPath="/reports"
      eyebrow="Reporting"
      title="Reports"
      description="Current report output backed by the reports API route."
      columns={[
        { header: "Class", accessor: "class_name" },
        { header: "Students", accessor: "student_count" },
        { header: "Expected Fees", accessor: "expected_fees_display" },
        { header: "Collected", accessor: "collected_fees_display" },
        { header: "Outstanding", accessor: "outstanding_balance_display" }
      ]}
    />
  );
}
