"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  ChevronRight,
  Copy,
  Check,
  Truck,
  FileText,
  Package,
} from "lucide-react";

interface ItemPedido {
  id: string;
  quantidade: number;
  pesoTotal: number;
  precoUnit: number;
  subtotal: number;
  produto: {
    id: string;
    nome: string;
    peso: number;
    unidade: string;
  };
}

interface Pedido {
  id: string;
  numero: number;
  fase: string;
  valorProdutos: number;
  valorFrete: number;
  valorTotal: number;
  pesoTotal: number;
  volumes: number;
  observacoes?: string;
  notaFiscal?: string;
  boleto?: string;
  dataEnvio?: string;
  dataRecebimento?: string;
  createdAt: string;
  updatedAt: string;
  cliente: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  itens: ItemPedido[];
}

const FASES = [
  "PEDIDO",
  "ORCAMENTO",
  "APROVADO",
  "PRODUCAO",
  "ENVIO",
  "RECEBIDO",
] as const;

const FASE_LABELS: Record<string, string> = {
  PEDIDO: "Pedido",
  ORCAMENTO: "Orcamento",
  APROVADO: "Aprovado",
  PRODUCAO: "Producao",
  ENVIO: "Envio",
  RECEBIDO: "Recebido",
};

const FASE_COLORS: Record<string, string> = {
  PEDIDO: "bg-blue-100 text-blue-700 border-blue-300",
  ORCAMENTO: "bg-yellow-100 text-yellow-700 border-yellow-300",
  APROVADO: "bg-green-100 text-green-700 border-green-300",
  PRODUCAO: "bg-purple-100 text-purple-700 border-purple-300",
  ENVIO: "bg-orange-100 text-orange-700 border-orange-300",
  RECEBIDO: "bg-gray-100 text-gray-700 border-gray-300",
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

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR");
}

export default function PedidoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notaFiscal, setNotaFiscal] = useState("");
  const [boleto, setBoleto] = useState("");

  const fetchPedido = () => {
    fetch(`/api/pedidos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPedido(data);
        setNotaFiscal(data.notaFiscal || "");
        setBoleto(data.boleto || "");
      })
      .catch((err) => console.error("Erro ao carregar pedido:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPedido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const advancePhase = async (newFase: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase: newFase }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPedido(updated);
        setNotaFiscal(updated.notaFiscal || "");
        setBoleto(updated.boleto || "");
      }
    } catch (error) {
      console.error("Erro ao atualizar fase:", error);
    } finally {
      setUpdating(false);
    }
  };

  const saveEnvioFields = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notaFiscal, boleto }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPedido(updated);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Pedido nao encontrado.
      </div>
    );
  }

  const currentFaseIndex = FASES.indexOf(pedido.fase as (typeof FASES)[number]);
  const nextFase = currentFaseIndex < FASES.length - 1 ? FASES[currentFaseIndex + 1] : null;
  const prevFase = currentFaseIndex > 0 ? FASES[currentFaseIndex - 1] : null;

  const itemDescriptions = pedido.itens
    .map(
      (item) =>
        `${item.quantidade}x ${item.produto.nome} (${item.pesoTotal.toFixed(1)} kg)`
    )
    .join(", ");

  const cotacaoText = [
    "Cotacao de frete",
    `${pedido.volumes} vol`,
    `${pedido.pesoTotal.toFixed(1)} kg`,
    `Sendo ${itemDescriptions}`,
    `Valor total ${formatCurrency(pedido.valorTotal)}`,
    pedido.cliente.endereco || "",
    `Bairro: ${pedido.cliente.bairro || ""}`,
    `Cidade: ${pedido.cliente.cidade || ""}`,
    `Estado: ${pedido.cliente.estado || ""}`,
    `CEP: ${pedido.cliente.cep || ""}`,
    pedido.cliente.nome,
  ].join("\n");

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(cotacaoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/pedidos")}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Pedido #{pedido.numero}
            </h1>
            <p className="text-sm text-gray-500">
              Criado em {formatDateTime(pedido.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/pedidos/${id}/editar`)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit size={16} />
          Editar
        </button>
      </div>

      {/* Phase Stepper */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Fase Atual</h2>
        <div className="flex items-center gap-1 overflow-x-auto">
          {FASES.map((fase, index) => {
            const isCurrent = fase === pedido.fase;
            const isPast = index < currentFaseIndex;
            return (
              <div key={fase} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    isCurrent
                      ? FASE_COLORS[fase]
                      : isPast
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-current-phase"
                        : isPast
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-white"
                    }`}
                    style={
                      isCurrent
                        ? { backgroundColor: "currentColor", color: "white" }
                        : undefined
                    }
                  >
                    {isPast ? (
                      <Check size={10} className="text-white" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {FASE_LABELS[fase]}
                </div>
                {index < FASES.length - 1 && (
                  <ChevronRight
                    size={14}
                    className={`mx-0.5 flex-shrink-0 ${
                      index < currentFaseIndex
                        ? "text-green-400"
                        : "text-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Phase Actions */}
        <div className="mt-4 flex gap-2">
          {prevFase && (
            <button
              onClick={() => advancePhase(prevFase)}
              disabled={updating}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Voltar para {FASE_LABELS[prevFase]}
            </button>
          )}
          {nextFase && (
            <button
              onClick={() => advancePhase(nextFase)}
              disabled={updating}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
            >
              Avancar para {FASE_LABELS[nextFase]}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nota Fiscal & Boleto (ENVIO phase) */}
      {(pedido.fase === "ENVIO" || pedido.fase === "RECEBIDO") && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Truck size={20} />
            Dados de Envio
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nota Fiscal
              </label>
              <input
                type="text"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
                disabled={pedido.fase === "RECEBIDO"}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                placeholder="Numero da nota fiscal"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Boleto
              </label>
              <input
                type="text"
                value={boleto}
                onChange={(e) => setBoleto(e.target.value)}
                disabled={pedido.fase === "RECEBIDO"}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                placeholder="Codigo do boleto"
              />
            </div>
          </div>
          {pedido.fase === "ENVIO" && (
            <button
              onClick={saveEnvioFields}
              disabled={updating}
              className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
            >
              Salvar
            </button>
          )}
          {pedido.dataEnvio && (
            <p className="mt-2 text-xs text-gray-500">
              Enviado em {formatDateTime(pedido.dataEnvio)}
            </p>
          )}
          {pedido.dataRecebimento && (
            <p className="mt-1 text-xs text-gray-500">
              Recebido em {formatDateTime(pedido.dataRecebimento)}
            </p>
          )}
        </div>
      )}

      {/* Client Info */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Cliente</h2>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-gray-500">Nome:</span>{" "}
            <span className="font-medium text-gray-800">
              {pedido.cliente.nome}
            </span>
          </div>
          {pedido.cliente.email && (
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="text-gray-800">{pedido.cliente.email}</span>
            </div>
          )}
          {pedido.cliente.telefone && (
            <div>
              <span className="text-gray-500">Telefone:</span>{" "}
              <span className="text-gray-800">{pedido.cliente.telefone}</span>
            </div>
          )}
          {pedido.cliente.endereco && (
            <div className="sm:col-span-2">
              <span className="text-gray-500">Endereco:</span>{" "}
              <span className="text-gray-800">
                {pedido.cliente.endereco}
                {pedido.cliente.bairro && `, ${pedido.cliente.bairro}`}
                {pedido.cliente.cidade && ` - ${pedido.cliente.cidade}`}
                {pedido.cliente.estado && `/${pedido.cliente.estado}`}
                {pedido.cliente.cep && ` - CEP: ${pedido.cliente.cep}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Package size={20} />
          Itens do Pedido
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3 font-medium">Produto</th>
                <th className="pb-3 font-medium text-center">Qtd</th>
                <th className="pb-3 font-medium text-right">Peso</th>
                <th className="pb-3 font-medium text-right">Preco Unit.</th>
                <th className="pb-3 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.itens.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">
                    {item.produto.nome}
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {item.quantidade}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {item.pesoTotal.toFixed(1)} kg
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {formatCurrency(item.precoUnit)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-800">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Valor dos Produtos</span>
            <span className="font-medium">{formatCurrency(pedido.valorProdutos)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Frete</span>
            <span className="font-medium">{formatCurrency(pedido.valorFrete)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Peso Total</span>
            <span className="font-medium">{pedido.pesoTotal.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Volumes</span>
            <span className="font-medium">{pedido.volumes}</span>
          </div>
          <hr />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-800">Valor Total</span>
            <span className="font-bold text-green-700">
              {formatCurrency(pedido.valorTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Observacoes */}
      {pedido.observacoes && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Observacoes
          </h2>
          <p className="text-sm text-gray-600">{pedido.observacoes}</p>
        </div>
      )}

      {/* Cotacao de Frete */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FileText size={20} />
            Cotacao de Frete
          </h2>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          {cotacaoText}
        </pre>
      </div>
    </div>
  );
}
