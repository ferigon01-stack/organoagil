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
        <Loader2 className="animate-spin" size={32} style={{ color: '#1a4d2e' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a4d2e' }}>Produtos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {produtos.length} produto{produtos.length !== 1 ? "s" : ""} cadastrado{produtos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/produtos/novo")}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: '#1a4d2e' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d6b3f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a4d2e')}
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Nenhum produto cadastrado</p>
          <button
            onClick={() => router.push("/produtos/novo")}
            className="mt-4 font-medium"
            style={{ color: '#1a4d2e' }}
          >
            Cadastrar primeiro produto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200" style={{ backgroundColor: '#f5f0e1' }}>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nome</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Peso (kg)</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Preco Venda</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Custo</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Margem (%)</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Duracao Media</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Unidade</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const margem = calcMargem(produto.precoVenda, produto.custoProducao);
                  return (
                    <tr
                      key={produto.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{produto.nome}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatWeight(produto.peso)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">
                        {formatCurrency(produto.precoVenda)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatCurrency(produto.custoProducao)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${margemColor(margem)}`}
                        >
                          {margem.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {produto.duracaoMedia ? `${produto.duracaoMedia} dias` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 uppercase text-sm">
                        {produto.unidade}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => router.push(`/produtos/${produto.id}/editar`)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id, produto.nome)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
