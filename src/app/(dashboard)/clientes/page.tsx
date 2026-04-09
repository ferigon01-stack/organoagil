"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ultimaCompra: string | null;
  _count?: { pedidos: number };
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      const res = await fetch("/api/clientes");
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClientes((prev) => prev.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir cliente.");
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatCpfCnpj(cliente: Cliente) {
    if (cliente.cnpj) return cliente.cnpj;
    if (cliente.cpf) return cliente.cpf;
    return "—";
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)' }}>
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">Clientes</h1>
            <p className="text-sm text-text-secondary">
              {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{" "}
              cadastrado{clientes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/clientes/novo")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
          style={{ backgroundColor: `var(--brand-green)` }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d6b3f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
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
          style={{ '--tw-ring-color': '#b8960c' } as React.CSSProperties}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#b8960c'; e.currentTarget.style.boxShadow = '0 0 0 1px #b8960c'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-text-secondary">Carregando...</span>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="py-20 text-center text-sm text-text-secondary">
            {busca
              ? "Nenhum cliente encontrado para esta busca."
              : "Nenhum cliente cadastrado."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card-border">
              <thead style={{ backgroundColor: '#f5f0e1' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Nome
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    CPF/CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Telefone
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Cidade/Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Última Compra
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-hover-bg transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="font-medium text-text-primary">
                        {cliente.nome}
                      </div>
                      {cliente._count && cliente._count.pedidos > 0 && (
                        <div className="text-xs text-text-secondary">
                          {cliente._count.pedidos} pedido
                          {cliente._count.pedidos !== 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {formatCpfCnpj(cliente)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {cliente.email || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {cliente.telefone || "—"}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {cliente.cidade && cliente.estado
                        ? `${cliente.cidade}/${cliente.estado}`
                        : cliente.cidade || cliente.estado || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {formatDate(cliente.ultimaCompra)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/clientes/${cliente.id}/editar`)
                          }
                          className="rounded-lg p-2 text-text-muted hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cliente.id, cliente.nome)
                          }
                          disabled={deletingId === cliente.id}
                          className="rounded-lg p-2 text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletingId === cliente.id ? (
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
