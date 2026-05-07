import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Organo Ágil — Sistema de Gestão",
  description:
    "Sistema de gestão Organo Ágil — clientes, produtos, pedidos e financeiro.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Organo Ágil",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-cream">
      <ServiceWorkerRegister />
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 sm:rounded-l-2xl shadow-inner bg-brand-cream">
        {children}
      </main>
    </div>
  );
}
