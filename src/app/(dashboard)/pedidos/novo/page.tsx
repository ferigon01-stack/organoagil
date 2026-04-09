"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
} from "lucide-react";

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
}

interface ItemForm {
  produtoId: string;
  quantidade: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function NovoPedidoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([{ produtoId: "", quantidade: 1 }]);
  const [valorFrete, setValorFrete] = useState(0);
  const [volumes, setVolumes] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => console.error("Erro ao carregar clientes:", err));

    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);

  const produtoMap = new Map(produtos.map((p) => [p.id, p]));
  const selectedCliente = clientes.find((c) => c.id === clienteId);

  const pesoTotal = itens.reduce((acc, item) => {
    const produto = produtoMap.get(item.produtoId);
    return acc + (produto ? item.quantidade * produto.peso : 0);
  }, 0);

  const valorProdutos = itens.reduce((acc, item) => {
    const produto = produtoMap.get(item.produtoId);
    return acc + (produto ? item.quantidade * produto.precoVenda : 0);
  }, 0);

  const valorTotal = valorProdutos + valorFrete;

  const addItem = () => {
    setItens([...itens, { produtoId: "", quantidade: 1 }]);
  };

  const removeItem = (index: number) => {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
    const updated = [...itens];
    if (field === "quantidade") {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value as string;
    }
    setItens(updated);
  };

  const itemDescriptions = itens
    .filter((item) => item.produtoId)
    .map((item) => {
      const produto = produtoMap.get(item.produtoId);
      if (!produto) return "";
      return `${item.quantidade}x ${produto.nome} (${(item.quantidade * produto.peso).toFixed(1)} kg)`;
    })
    .filter(Boolean)
    .join(", ");

  const cotacaoText = [
    "Cotacao de frete",
    `${volumes} vol`,
    `${pesoTotal.toFixed(1)} kg`,
    `Sendo ${itemDescriptions}`,
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
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          valorFrete,
          volumes,
          observacoes: observacoes || null,
          itens: validItens,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar pedido");
      const pedido = await res.json();
      router.push(`/pedidos/${pedido.id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar pedido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/pedidos")}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: '#1a4d2e' }}>Novo Pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a4d2e' }}>Cliente</h2>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
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
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#1a4d2e' }}>Itens</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', color: '#1a4d2e' }}
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
                  className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Produto
                    </label>
                    <select
                      value={item.produtoId}
                      onChange={(e) => updateItem(index, "produtoId", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
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

                  <div className="w-24">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Qtd
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) =>
                        updateItem(index, "quantidade", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                      required
                    />
                  </div>

                  {produto && (
                    <>
                      <div className="w-24">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                          Peso
                        </label>
                        <p className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
                          {produto.peso} kg
                        </p>
                      </div>
                      <div className="w-28">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                          Preco Unit.
                        </label>
                        <p className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
                          {formatCurrency(produto.precoVenda)}
                        </p>
                      </div>
                      <div className="w-28">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                          Subtotal
                        </label>
                        <p className="rounded-lg px-3 py-2 text-sm font-medium" style={{ backgroundColor: 'rgba(26, 77, 46, 0.1)', color: '#1a4d2e' }}>
                          {formatCurrency(item.quantidade * produto.precoVenda)}
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

        {/* Frete & Volumes */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a4d2e' }}>
            Frete e Volumes
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Valor do Frete (R$)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={valorFrete}
                onChange={(e) => setValorFrete(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Volumes
              </label>
              <input
                type="number"
                min={1}
                value={volumes}
                onChange={(e) => setVolumes(Number(e.target.value) || 1)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
              />
            </div>
          </div>
        </div>

        {/* Observacoes */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a4d2e' }}>
            Observacoes
          </h2>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
            placeholder="Observacoes sobre o pedido..."
          />
        </div>

        {/* Totais */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a4d2e' }}>Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor dos Produtos</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(valorProdutos)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor do Frete</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(valorFrete)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peso Total</span>
              <span className="font-medium text-gray-800">
                {pesoTotal.toFixed(1)} kg
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-gray-800">Valor Total</span>
              <span className="font-bold" style={{ color: '#1a4d2e' }}>
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Cotacao de Frete */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#1a4d2e' }}>
              Cotacao de Frete
            </h2>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: '#b8960c' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            {cotacaoText}
          </pre>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#1a4d2e' }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#2d6b3f')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#1a4d2e')}
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Criar Pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
