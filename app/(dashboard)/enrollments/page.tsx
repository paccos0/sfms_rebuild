import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/enrollments"
      idKey="enrollment_id"
      eyebrow="Students"
      title="Enrollments"
      description="Assign students to year-specific classes with category, admission type, and status."
      columns={[
        { header: "ID", key: "enrollment_id" },
        { header: "Student", key: "student_name" },
        { header: "Academic Year", key: "academic_year_name" },
        { header: "Class", key: "class_display_name" },
        { header: "Category", key: "category_name" },
        { header: "Admission", key: "admission_type" },
        { header: "Status", key: "enrollment_status" },
        { header: "Date", key: "enrollment_date" }
      ]}
      fields={[
        { name: "student_id", label: "Student", type: "select", required: true, optionsEndpoint: "/students", optionLabelKey: "student_label", optionValueKey: "student_id" },
        { name: "academic_year_id", label: "Academic year", type: "select", required: true, optionsEndpoint: "/academic-years", optionLabelKey: "name", optionValueKey: "academic_year_id" },
        { name: "year_class_id", label: "Year class", type: "select", required: true, optionsEndpoint: "/year-classes", optionLabelKey: "year_class_label", optionValueKey: "year_class_id" },
        { name: "category_id", label: "Category", type: "select", required: true, optionsEndpoint: "/student-categories", optionLabelKey: "category_name", optionValueKey: "category_id" },
        { name: "admission_type", label: "Admission type", type: "select", required: true, options: [{label:"new", value:"new"},{label:"continuing", value:"continuing"}] },
        { name: "enrollment_status", label: "Enrollment status", type: "select", required: true, options: [{label:"active", value:"active"},{label:"transferred", value:"transferred"},{label:"graduated", value:"graduated"},{label:"repeated", value:"repeated"},{label:"completed", value:"completed"},{label:"cancelled", value:"cancelled"}] },
        { name: "enrollment_date", label: "Enrollment date", type: "date", required: true },
        { name: "notes", label: "Notes", type: "textarea" }
      ]}
      initialValues={{ student_id: "", academic_year_id: "", year_class_id: "", category_id: "", admission_type: "", enrollment_status: "active", enrollment_date: "", notes: "" }}
    />
  );
}
