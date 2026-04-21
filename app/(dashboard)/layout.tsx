import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="flex gap-6">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <Navbar />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}