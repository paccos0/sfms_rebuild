import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/students"
      idKey="student_id"
      eyebrow="Students"
      title="Students"
      description="Manage learner identity records independently from year-by-year enrollments."
      columns={[
        { header: "ID", key: "student_id" },
        { header: "Registration", key: "registration_number" },
        { header: "First Name", key: "first_name" },
        { header: "Last Name", key: "last_name" },
        { header: "Gender", key: "gender" },
        { header: "Parent", key: "parent_name" },
        { header: "Parent Phone", key: "parent_phone" },
        { header: "Status", key: "student_status" }
      ]}
      fields={[
        { name: "registration_number", label: "Registration number", required: true },
        { name: "first_name", label: "First name", required: true },
        { name: "last_name", label: "Last name", required: true },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{label:"male", value:"male"},{label:"female", value:"female"}] },
        { name: "date_of_birth", label: "Date of birth", type: "date" },
        { name: "phone", label: "Phone" },
        { name: "parent_name", label: "Parent name" },
        { name: "parent_phone", label: "Parent phone" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "student_status", label: "Student status", type: "select", required: true, options: [{label:"active", value:"active"},{label:"inactive", value:"inactive"}] }
      ]}
      initialValues={{ registration_number: "", first_name: "", last_name: "", gender: "", date_of_birth: "", phone: "", parent_name: "", parent_phone: "", address: "", student_status: "active" }}
    />
  );
}
