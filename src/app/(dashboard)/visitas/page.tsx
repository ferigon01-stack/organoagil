"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, User } from "lucide-react";

interface Visita {
  id: string;
  data: string;
  observacoes?: string;
  createdAt: string;
  cliente: { nome: string };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function VisitasPage() {
  const router = useRouter();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visitas")
      .then((res) => res.json())
      .then((data) => setVisitas(data))
      .catch((err) => console.error("Erro ao carregar visitas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: `var(--brand-green)`, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-green">Visitas</h1>
        <button
          onClick={() => router.push("/visitas/nova")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: `var(--brand-green)` }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d6b3f")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
        >
          <Plus size={16} />
          Nova Visita
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-card-bg shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-text-secondary" style={{ backgroundColor: "#f5f0e1" }}>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="hidden sm:table-cell px-4 py-3 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody>
            {visitas.map((visita) => (
              <tr
                key={visita.id}
                onClick={() => router.push(`/visitas/${visita.id}`)}
                className="cursor-pointer border-b last:border-0 hover:bg-hover-bg"
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-text-muted" />
                    {formatDate(visita.data)}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-text-muted" />
                    {visita.cliente.nome}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-text-muted truncate max-w-md">
                  {visita.observacoes || "—"}
                </td>
              </tr>
            ))}
            {visitas.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-text-muted">
                  Nenhuma visita registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
