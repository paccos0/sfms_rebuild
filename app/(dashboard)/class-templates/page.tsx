import CrudModulePage from "@/components/dashboard/CrudModulePage";

export default function Page() {
  return (
    <CrudModulePage
      apiPath="/class-templates"
      idKey="class_template_id"
      eyebrow="Academic setup"
      title="Class Templates"
      description="Maintain reusable base classes before assigning them to a specific academic year."
      columns={[
        { header: "ID", key: "class_template_id" },
        { header: "Class", key: "class_name" },
        { header: "Level Order", key: "level_order" },
        { header: "Active", key: "active_status" }
      ]}
      fields={[
        { name: "class_name", label: "Class name", required: true, placeholder: "L3 SOD" },
        { name: "level_order", label: "Level order", type: "number", required: true },
        { name: "is_active", label: "Active", type: "checkbox" }
      ]}
      initialValues={{ class_name: "", level_order: 1, is_active: true }}
    />
  );
}
