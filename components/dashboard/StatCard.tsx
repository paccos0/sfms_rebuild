import Card from "@/components/ui/Card";

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
};

export default function StatCard({
  title,
  value,
  description
}: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-300">{title}</p>
      <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Card>
  );
}
