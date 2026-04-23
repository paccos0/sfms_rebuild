import PageSkeleton from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <PageSkeleton
        titleWidth="w-72"
        descriptionWidth="w-[30rem]"
        tableColumns={5}
        tableRows={6}
        showTopCards
        showTable
      />
    </main>
  );
}