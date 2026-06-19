"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2, Truck, Loader2 } from "lucide-react";

interface Transportadora {
  id: string;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  _count?: { pedidos: number };
}

export default function TransportadorasPage() {
  const router = useRouter();
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransportadoras();
  }, []);

  async function fetchTransportadoras() {
    try {
      const res = await fetch("/api/transportadoras");
      if (res.ok) setTransportadoras(await res.json());
    } catch (error) {
      console.error("Erro ao buscar transportadoras:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir a transportadora "${nome}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transportadoras/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransportadoras((prev) => prev.filter((t) => t.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir transportadora.");
      }
    } catch (error) {
      console.error("Erro ao excluir transportadora:", error);
      alert("Erro ao excluir transportadora.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtradas = transportadoras.filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(184, 150, 12, 0.15)" }}>
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">Transportadoras</h1>
            <p className="text-sm text-text-secondary">
              {transportadoras.length} transportadora
              {transportadoras.length !== 1 ? "s" : ""} cadastrada
              {transportadoras.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/transportadoras/novo")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
          style={{ backgroundColor: "var(--brand-green)" }}
        >
          <Plus className="h-4 w-4" />
          Nova Transportadora
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-lg border border-input-border bg-input-bg py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-gray-400 focus:outline-none focus:ring-1"
          onFocus={(e) => { e.currentTarget.style.borderColor = "#b8960c"; e.currentTarget.style.boxShadow = "0 0 0 1px #b8960c"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-text-secondary">Carregando...</span>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="py-20 text-center text-sm text-text-secondary">
            {busca
              ? "Nenhuma transportadora encontrada para esta busca."
              : "Nenhuma transportadora cadastrada."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card-border">
              <thead style={{ backgroundColor: "#f5f0e1" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Nome</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Telefone</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Cidade/UF</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filtradas.map((t) => (
                  <tr key={t.id} className="hover:bg-hover-bg transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="font-medium text-text-primary">{t.nome}</div>
                      {t._count && t._count.pedidos > 0 && (
                        <div className="text-xs text-text-secondary">
                          {t._count.pedidos} pedido{t._count.pedidos !== 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {t.cnpj || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {t.telefone || "—"}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {t.cidade && t.estado ? `${t.cidade}/${t.estado}` : t.cidade || t.estado || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/transportadoras/${t.id}/editar`)}
                          className="rounded-lg p-2 text-text-muted hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.nome)}
                          disabled={deletingId === t.id}
                          className="rounded-lg p-2 text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
