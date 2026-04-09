import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-cream dark:bg-[#0f1a13]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8 rounded-l-2xl shadow-inner bg-brand-cream dark:bg-[#0f1a13]">
        {children}
      </main>
    </div>
  );
}
