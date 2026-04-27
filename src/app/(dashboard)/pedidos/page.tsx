"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutGrid,
  Table,
  Package,
  Weight,
  Calendar,
} from "lucide-react";

interface Pedido {
  id: string;
  numero: number;
  fase: string;
  valorTotal: number;
  pesoTotal: number;
  createdAt: string;
  cliente: { nome: string };
  influencer?: { nome: string; slug: string } | null;
}

const FASES = [
  "PEDIDO",
  "ORCAMENTO",
  "APROVADO",
  "PRODUCAO",
  "ENVIO",
  "RECEBIDO",
] as const;

const FASE_CONFIG: Record<
  string,
  { label: string; bg: string; headerBg: string; headerText: string }
> = {
  PEDIDO: {
    label: "Pedido",
    bg: "bg-blue-50",
    headerBg: "bg-blue-100",
    headerText: "text-blue-700",
  },
  ORCAMENTO: {
    label: "Orçamento",
    bg: "bg-yellow-50",
    headerBg: "bg-yellow-100",
    headerText: "text-yellow-700",
  },
  APROVADO: {
    label: "Aprovado",
    bg: "bg-green-50",
    headerBg: "bg-green-100",
    headerText: "text-green-700",
  },
  PRODUCAO: {
    label: "Produção",
    bg: "bg-purple-50",
    headerBg: "bg-purple-100",
    headerText: "text-purple-700",
  },
  ENVIO: {
    label: "Envio",
    bg: "bg-orange-50",
    headerBg: "bg-orange-100",
    headerText: "text-orange-700",
  },
  RECEBIDO: {
    label: "Recebido",
    bg: "bg-gray-50",
    headerBg: "bg-gray-100",
    headerText: "text-gray-700",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function PedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");

  useEffect(() => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data) => setPedidos(data))
      .catch((err) => console.error("Erro ao carregar pedidos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `var(--brand-green)`, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const pedidosByFase = (fase: string) =>
    pedidos.filter((p) => p.fase === fase);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-green">Pedidos</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-card-border bg-card-bg">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "kanban"
                  ? "text-white"
                  : "text-text-secondary hover:bg-hover-bg"
              }`}
              style={view === "kanban" ? { backgroundColor: `var(--brand-green)` } : undefined}
            >
              <LayoutGrid size={16} />
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "table"
                  ? "text-white"
                  : "text-text-secondary hover:bg-hover-bg"
              }`}
              style={view === "table" ? { backgroundColor: `var(--brand-green)` } : undefined}
            >
              <Table size={16} />
              Tabela
            </button>
          </div>

          <button
            onClick={() => router.push("/pedidos/novo")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: `var(--brand-green)` }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d6b3f')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
          >
            <Plus size={16} />
            Novo Pedido
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {FASES.map((fase) => {
            const config = FASE_CONFIG[fase];
            const items = pedidosByFase(fase);
            return (
              <div
                key={fase}
                className={`flex min-w-[260px] sm:min-w-[280px] flex-shrink-0 flex-col rounded-xl ${config.bg}`}
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${config.headerBg}`}
                >
                  <span className={`text-sm font-semibold ${config.headerText}`}>
                    {config.label}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${config.headerBg} ${config.headerText}`}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-3">
                  {items.length === 0 && (
                    <p className="py-4 text-center text-xs text-text-muted">
                      Nenhum pedido
                    </p>
                  )}
                  {items.map((pedido) => (
                    <div
                      key={pedido.id}
                      onClick={() => router.push(`/pedidos/${pedido.id}`)}
                      className="cursor-pointer rounded-lg bg-card-bg p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">
                          #{pedido.numero}
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(pedido.valorTotal)}
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-text-secondary">
                        {pedido.cliente.nome}
                      </p>
                      {pedido.influencer && (
                        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          via {pedido.influencer.nome}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Weight size={12} />
                          {pedido.pesoTotal.toFixed(1)} kg
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(pedido.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl bg-card-bg shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-text-secondary" style={{ backgroundColor: '#f5f0e1' }}>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fase</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium text-right">Peso</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => {
                const config = FASE_CONFIG[pedido.fase];
                return (
                  <tr
                    key={pedido.id}
                    onClick={() => router.push(`/pedidos/${pedido.id}`)}
                    className="cursor-pointer border-b last:border-0 hover:bg-hover-bg"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      #{pedido.numero}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <div>{pedido.cliente.nome}</div>
                      {pedido.influencer && (
                        <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          via {pedido.influencer.nome}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.headerBg} ${config.headerText}`}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatCurrency(pedido.valorTotal)}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-text-secondary">
                      {pedido.pesoTotal.toFixed(1)} kg
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-text-secondary">
                      {formatDate(pedido.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
