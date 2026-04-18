"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
} from "lucide-react";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/currency";

interface Cliente {
  id: string;
  nome: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface Produto {
  id: string;
  nome: string;
  peso: number;
  precoVenda: number;
  unidade: string;
  unidadesPorCaixa?: number;
  caixaDimensoes?: string;
}

interface ItemForm {
  produtoId: string;
  quantidade: number;
  precoUnit: number;
}

interface Pedido {
  id: string;
  numero: number;
  clienteId: string;
  valorFrete: number;
  desconto: number;
  volumes: number;
  observacoes?: string;
  itens: {
    produtoId: string;
    quantidade: number;
    precoUnit: number;
  }[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function EditarPedidoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([{ produtoId: "", quantidade: 1, precoUnit: 0 }]);
  const [valorFrete, setValorFrete] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [volumes, setVolumes] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [pedidoNumero, setPedidoNumero] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [volumesAutoCalculated, setVolumesAutoCalculated] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/produtos").then((r) => r.json()),
      fetch(`/api/pedidos/${id}`).then((r) => r.json()),
    ])
      .then(([clientesData, produtosData, pedidoData]) => {
        setClientes(clientesData);
        setProdutos(produtosData);

        // Prefill form
        setClienteId(pedidoData.clienteId);
        setValorFrete(pedidoData.valorFrete);
        setDesconto(pedidoData.desconto || 0);
        setVolumes(pedidoData.volumes);
        setObservacoes(pedidoData.observacoes || "");
        setPedidoNumero(pedidoData.numero);
        setItens(
          pedidoData.itens.map(
            (item: { produtoId: string; quantidade: number; precoUnit: number }) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnit: item.precoUnit,
            })
          )
        );
      })
      .catch((err) => console.error("Erro ao carregar dados:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const produtoMap = new Map(produtos.map((p) => [p.id, p]));
  const selectedCliente = clientes.find((c) => c.id === clienteId);

  // Auto-calculate volumes when items change
  useEffect(() => {
    if (produtos.length === 0) return;
    let totalVolumes = 0;
    for (const item of itens) {
      const produto = produtoMap.get(item.produtoId);
      if (!produto) continue;
      if (produto.unidadesPorCaixa && produto.unidadesPorCaixa > 0) {
        totalVolumes += Math.ceil(item.quantidade / produto.unidadesPorCaixa);
      } else {
        totalVolumes += item.quantidade;
      }
    }
    if (totalVolumes > 0) {
      setVolumes(totalVolumes);
      setVolumesAutoCalculated(totalVolumes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, produtos]);

  const pesoTotal = itens.reduce((acc, item) => {
    const produto = produtoMap.get(item.produtoId);
    return acc + (produto ? item.quantidade * produto.peso : 0);
  }, 0);

  const valorProdutos = itens.reduce(
    (acc, item) => acc + item.quantidade * item.precoUnit,
    0
  );

  const valorTotal = Math.max(0, valorProdutos + valorFrete - desconto);

  const addItem = () => {
    setItens([...itens, { produtoId: "", quantidade: 1, precoUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ItemForm,
    value: string | number
  ) => {
    const updated = [...itens];
    if (field === "produtoId") {
      const produtoId = value as string;
      const produto = produtoMap.get(produtoId);
      updated[index] = {
        ...updated[index],
        produtoId,
        precoUnit: produto ? produto.precoVenda : 0,
      };
    } else if (field === "quantidade") {
      updated[index] = { ...updated[index], quantidade: Number(value) || 0 };
    } else if (field === "precoUnit") {
      updated[index] = { ...updated[index], precoUnit: Number(value) || 0 };
    }
    setItens(updated);
  };

  const itemDescriptions = itens
    .filter((item) => item.produtoId)
    .map((item) => {
      const produto = produtoMap.get(item.produtoId);
      if (!produto) return "";
      if (produto.unidadesPorCaixa && produto.unidadesPorCaixa > 0) {
        const caixas = Math.ceil(item.quantidade / produto.unidadesPorCaixa);
        return `${item.quantidade} ${produto.nome} (${(item.quantidade * produto.peso).toFixed(1)} kg) - ${caixas} caixa(s)${produto.caixaDimensoes ? ` ${produto.caixaDimensoes}` : ""}`;
      }
      return `${item.quantidade}x ${produto.nome} (${(item.quantidade * produto.peso).toFixed(1)} kg)`;
    })
    .filter(Boolean)
    .join(", ");

  const dimensoesLines = itens
    .filter((item) => item.produtoId)
    .map((item) => {
      const produto = produtoMap.get(item.produtoId);
      if (!produto || !produto.caixaDimensoes) return "";
      return `Medidas da caixa: ${produto.caixaDimensoes}`;
    })
    .filter(Boolean);

  const cotacaoText = [
    "Cotação de frete",
    `${volumes} vol`,
    `${pesoTotal.toFixed(1)} kg`,
    `Sendo ${itemDescriptions}`,
    ...dimensoesLines,
    `Valor total ${formatCurrency(valorTotal)}`,
    selectedCliente?.endereco || "",
    `Bairro: ${selectedCliente?.bairro || ""}`,
    `Cidade: ${selectedCliente?.cidade || ""}`,
    `Estado: ${selectedCliente?.estado || ""}`,
    `CEP: ${selectedCliente?.cep || ""}`,
    selectedCliente?.nome || "",
  ].join("\n");

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(cotacaoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) return alert("Selecione um cliente");
    const validItens = itens.filter((i) => i.produtoId && i.quantidade > 0);
    if (validItens.length === 0) return alert("Adicione pelo menos um item");

    setSaving(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          valorFrete,
          desconto,
          volumes,
          observacoes: observacoes || null,
          itens: validItens,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar pedido");
      router.push(`/pedidos/${id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar pedido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `var(--brand-green)`, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/pedidos/${id}`)}
          className="rounded-lg p-2 text-text-secondary hover:bg-hover-bg"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-brand-green">
          Editar Pedido #{pedidoNumero}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-green">Cliente</h2>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
            required
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Itens */}
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-green">Itens</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium w-full sm:w-auto"
              style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', color: `var(--brand-green)` }}
            >
              <Plus size={14} />
              Adicionar Item
            </button>
          </div>

          <div className="space-y-3">
            {itens.map((item, index) => {
              const produto = produtoMap.get(item.produtoId);
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 rounded-lg border border-card-border bg-brand-cream p-3"
                >
                  <div className="w-full sm:min-w-[200px] sm:flex-1">
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Produto
                    </label>
                    <select
                      value={item.produtoId}
                      onChange={(e) => updateItem(index, "produtoId", e.target.value)}
                      className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                      required
                    >
                      <option value="">Selecione</option>
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-24">
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Qtd
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) =>
                        updateItem(index, "quantidade", e.target.value)
                      }
                      className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                      required
                    />
                  </div>

                  {produto && (
                    <>
                      <div className="w-full sm:w-24">
                        <label className="mb-1 block text-xs font-medium text-text-secondary">
                          Peso
                        </label>
                        <p className="rounded-lg bg-brand-cream px-3 py-2 text-sm text-text-secondary">
                          {produto.peso} kg
                        </p>
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="mb-1 block text-xs font-medium text-text-secondary">
                          Preço Unit.
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatCurrencyInput(item.precoUnit)}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "precoUnit",
                              parseCurrencyInput(e.target.value)
                            )
                          }
                          className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="mb-1 block text-xs font-medium text-text-secondary">
                          Subtotal
                        </label>
                        <p className="rounded-lg px-3 py-2 text-sm font-medium" style={{ backgroundColor: 'rgba(26, 77, 46, 0.1)', color: `var(--brand-green)` }}>
                          {formatCurrency(item.quantidade * item.precoUnit)}
                        </p>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    disabled={itens.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frete, Desconto & Volumes */}
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-green">
            Frete, Desconto e Volumes
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Valor do Frete
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formatCurrencyInput(valorFrete)}
                onChange={(e) => setValorFrete(parseCurrencyInput(e.target.value))}
                className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Desconto
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formatCurrencyInput(desconto)}
                onChange={(e) => setDesconto(parseCurrencyInput(e.target.value))}
                className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Volumes
              </label>
              <input
                type="number"
                min={1}
                value={volumes}
                onChange={(e) => setVolumes(Number(e.target.value) || 1)}
                className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
              />
              {volumesAutoCalculated > 0 && (
                <p className="mt-1 text-xs text-text-secondary">
                  Calculado: {volumesAutoCalculated} caixa(s)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Observacoes */}
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-green">
            Observações
          </h2>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
            placeholder="Observações sobre o pedido..."
          />
        </div>

        {/* Totais */}
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-green">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Valor dos Produtos</span>
              <span className="font-medium text-text-primary">
                {formatCurrency(valorProdutos)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Valor do Frete</span>
              <span className="font-medium text-text-primary">
                {formatCurrency(valorFrete)}
              </span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Desconto</span>
                <span className="font-medium text-red-600">
                  - {formatCurrency(desconto)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">Peso Total</span>
              <span className="font-medium text-text-primary">
                {pesoTotal.toFixed(1)} kg
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-text-primary">Valor Total</span>
              <span className="font-bold">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Cotacao de Frete */}
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-green">
              Cotação de Frete
            </h2>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white w-full sm:w-auto"
              style={{ backgroundColor: '#b8960c' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-brand-cream p-4 text-sm text-text-primary">
            {cotacaoText}
          </pre>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: `var(--brand-green)` }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#2d6b3f')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
