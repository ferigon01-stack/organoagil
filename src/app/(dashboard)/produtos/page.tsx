"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  peso: number;
  precoVenda: number;
  custoProducao: number;
  duracaoMedia: number | null;
  unidade: string;
  unidadesPorCaixa?: number;
  caixaDimensoes?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatWeight(value: number) {
  return `${value.toFixed(3)} kg`;
}

function calcMargem(precoVenda: number, custoProducao: number) {
  if (precoVenda === 0) return 0;
  return ((precoVenda - custoProducao) / precoVenda) * 100;
}

function margemColor(margem: number) {
  if (margem > 30) return "text-green-600 bg-green-50";
  if (margem >= 15) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

export default function ProdutosPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Deseja excluir o produto "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProdutos((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Erro ao excluir produto.");
      }
    } catch {
      alert("Erro ao excluir produto.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">Produtos</h1>
          <p className="text-text-secondary text-sm mt-1">
            {produtos.length} produto{produtos.length !== 1 ? "s" : ""} cadastrado{produtos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/produtos/novo")}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: `var(--brand-green)` }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d6b3f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-16 bg-card-bg rounded-xl border border-card-border">
          <Package className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg">Nenhum produto cadastrado</p>
          <button
            onClick={() => router.push("/produtos/novo")}
            className="mt-4 font-medium"
           
          >
            Cadastrar primeiro produto
          </button>
        </div>
      ) : (
        <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border" style={{ backgroundColor: '#f5f0e1' }}>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Nome</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-text-secondary">Peso (kg)</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-text-secondary">Preço Venda</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-text-secondary">Custo</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-text-secondary">Margem (%)</th>
                  <th className="hidden sm:table-cell text-center px-4 py-3 text-sm font-semibold text-text-secondary">Duração Média</th>
                  <th className="hidden sm:table-cell text-center px-4 py-3 text-sm font-semibold text-text-secondary">Unidade</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const margem = calcMargem(produto.precoVenda, produto.custoProducao);
                  return (
                    <tr
                      key={produto.id}
                      className="border-b border-card-border hover:bg-hover-bg transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">{produto.nome}</td>
                      <td className="px-4 py-3 text-sm text-right text-text-secondary">{formatWeight(produto.peso)}</td>
                      <td className="px-4 py-3 text-sm text-right text-text-primary font-medium">
                        {formatCurrency(produto.precoVenda)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-text-secondary">
                        {formatCurrency(produto.custoProducao)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${margemColor(margem)}`}
                        >
                          {margem.toFixed(1)}%
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-center text-text-secondary">
                        {produto.duracaoMedia ? `${produto.duracaoMedia} dias` : "—"}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-center text-text-secondary uppercase text-sm">
                        {produto.unidade}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => router.push(`/produtos/${produto.id}/editar`)}
                            className="p-2 text-text-muted hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id, produto.nome)}
                            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
