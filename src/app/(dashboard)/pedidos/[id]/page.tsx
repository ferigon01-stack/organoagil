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
  Paperclip,
  Upload,
  Download,
  Trash2,
  Loader2,
  FileDown,
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
    unidadesPorCaixa?: number;
    caixaDimensoes?: string;
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
  ORCAMENTO: "Orçamento",
  APROVADO: "Aprovado",
  PRODUCAO: "Produção",
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
  const [anexos, setAnexos] = useState<Array<{id: string; nome: string; tipo: string; tamanho: number; fase: string; createdAt: string}>>([]);
  const [uploading, setUploading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  const fetchAnexos = () => {
    fetch(`/api/pedidos/${id}/anexos`)
      .then((res) => res.json())
      .then((data) => setAnexos(data))
      .catch((err) => console.error("Erro ao carregar anexos:", err));
  };

  useEffect(() => {
    fetchPedido();
    fetchAnexos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pedido) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fase", pedido.fase);
      const res = await fetch(`/api/pedidos/${id}/anexos`, { method: "POST", body: formData });
      if (res.ok) {
        fetchAnexos();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao enviar arquivo");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteAnexo = async (anexoId: string) => {
    if (!confirm("Excluir este anexo?")) return;
    try {
      await fetch(`/api/pedidos/${id}/anexos/${anexoId}`, { method: "DELETE" });
      fetchAnexos();
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
    }
  };

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

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

  const generatePdf = async () => {
    if (!pedido) return;
    setGeneratingPdf(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: PedidoPDF } = await import("@/components/PedidoPDF");
      const blob = await pdf(<PedidoPDF pedido={pedido} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedido-${pedido.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `var(--brand-green)`, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary">
        Pedido nao encontrado.
      </div>
    );
  }

  const currentFaseIndex = FASES.indexOf(pedido.fase as (typeof FASES)[number]);
  const nextFase = currentFaseIndex < FASES.length - 1 ? FASES[currentFaseIndex + 1] : null;
  const prevFase = currentFaseIndex > 0 ? FASES[currentFaseIndex - 1] : null;

  const itemDescriptions = pedido.itens
    .map((item) => {
      if (item.produto.unidadesPorCaixa && item.produto.unidadesPorCaixa > 0) {
        const caixas = Math.ceil(item.quantidade / item.produto.unidadesPorCaixa);
        return `${item.quantidade} ${item.produto.nome} (${item.pesoTotal.toFixed(1)} kg) - ${caixas} caixa(s)${item.produto.caixaDimensoes ? ` ${item.produto.caixaDimensoes}` : ""}`;
      }
      return `${item.quantidade}x ${item.produto.nome} (${item.pesoTotal.toFixed(1)} kg)`;
    })
    .join(", ");

  const dimensoesLines = pedido.itens
    .map((item) => {
      if (!item.produto.caixaDimensoes) return "";
      return `Medidas da caixa: ${item.produto.caixaDimensoes}`;
    })
    .filter(Boolean);

  const cotacaoText = [
    "Cotacao de frete",
    `${pedido.volumes} vol`,
    `${pedido.pesoTotal.toFixed(1)} kg`,
    `Sendo ${itemDescriptions}`,
    ...dimensoesLines,
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
            className="rounded-lg p-2 text-text-secondary hover:bg-hover-bg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">
              Pedido #{pedido.numero}
            </h1>
            <p className="text-sm text-text-secondary">
              Criado em {formatDateTime(pedido.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generatePdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#b8960c" }}
          >
            {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            {generatingPdf ? "Gerando..." : "Gerar PDF"}
          </button>
          <button
            onClick={() => router.push(`/pedidos/${id}/editar`)}
            className="flex items-center gap-2 rounded-lg border border-input-border bg-card-bg px-4 py-2 text-sm font-medium text-text-primary hover:bg-hover-bg"
          >
            <Edit size={16} />
            Editar
          </button>
        </div>
      </div>

      {/* Phase Stepper */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm border border-card-border">
        <h2 className="mb-4 text-lg font-semibold text-brand-green">Fase Atual</h2>
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
                      ? "border-transparent text-white"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                  style={isPast && !isCurrent ? { backgroundColor: '#b8960c', borderColor: '#b8960c' } : undefined}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-current-phase"
                        : isPast
                        ? "text-white"
                        : "bg-gray-300 text-white"
                    }`}
                    style={
                      isCurrent
                        ? { backgroundColor: "currentColor", color: "white" }
                        : isPast
                        ? { backgroundColor: 'rgba(255,255,255,0.3)' }
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
                        ? ""
                        : "text-gray-300"
                    }`}
                    style={index < currentFaseIndex ? { color: '#b8960c' } : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Phase Actions */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          {prevFase && (
            <button
              onClick={() => advancePhase(prevFase)}
              disabled={updating}
              className="rounded-lg border border-input-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-hover-bg disabled:opacity-50"
            >
              Voltar para {FASE_LABELS[prevFase]}
            </button>
          )}
          {nextFase && (
            <button
              onClick={() => advancePhase(nextFase)}
              disabled={updating}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: `var(--brand-green)` }}
              onMouseEnter={(e) => !updating && (e.currentTarget.style.backgroundColor = '#2d6b3f')}
              onMouseLeave={(e) => !updating && (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
            >
              Avancar para {FASE_LABELS[nextFase]}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Anexos - Visível em todas as fases */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm border border-card-border">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-green">
            <Paperclip size={20} />
            Anexos
          </h2>
          <label className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white cursor-pointer transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`} style={{ backgroundColor: `var(--brand-green)` }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Enviando..." : "Anexar Arquivo"}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {anexos.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            Nenhum anexo ainda. Clique em &quot;Anexar Arquivo&quot; para adicionar PDFs, imagens ou documentos.
          </p>
        ) : (
          <div className="space-y-2">
            {anexos.map((anexo) => (
              <div
                key={anexo.id}
                className="flex items-center justify-between rounded-lg border border-card-border p-3 hover:bg-hover-bg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-text-muted flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{anexo.nome}</p>
                    <p className="text-xs text-text-muted">
                      {formatFileSize(anexo.tamanho)} &middot; {FASE_LABELS[anexo.fase] || anexo.fase} &middot; {formatDate(anexo.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <a
                    href={`/api/pedidos/${id}/anexos/${anexo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-text-secondary hover:bg-hover-bg transition-colors"
                    title="Visualizar / Baixar"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => deleteAnexo(anexo.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota Fiscal & Boleto (ENVIO phase) */}
      {(pedido.fase === "ENVIO" || pedido.fase === "RECEBIDO") && (
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Truck size={20} />
            Dados de Envio
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Nota Fiscal
              </label>
              <input
                type="text"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
                disabled={pedido.fase === "RECEBIDO"}
                className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c] disabled:bg-gray-100"
                placeholder="Número da nota fiscal"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Boleto
              </label>
              <input
                type="text"
                value={boleto}
                onChange={(e) => setBoleto(e.target.value)}
                disabled={pedido.fase === "RECEBIDO"}
                className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c] disabled:bg-gray-100"
                placeholder="Codigo do boleto"
              />
            </div>
          </div>
          {pedido.fase === "ENVIO" && (
            <button
              onClick={saveEnvioFields}
              disabled={updating}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: `var(--brand-green)` }}
            >
              Salvar
            </button>
          )}
          {pedido.dataEnvio && (
            <p className="mt-2 text-xs text-text-secondary">
              Enviado em {formatDateTime(pedido.dataEnvio)}
            </p>
          )}
          {pedido.dataRecebimento && (
            <p className="mt-1 text-xs text-text-secondary">
              Recebido em {formatDateTime(pedido.dataRecebimento)}
            </p>
          )}
        </div>
      )}

      {/* Client Info */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-brand-green">Cliente</h2>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-text-secondary">Nome:</span>{" "}
            <span className="font-medium text-text-primary">
              {pedido.cliente.nome}
            </span>
          </div>
          {pedido.cliente.email && (
            <div>
              <span className="text-text-secondary">Email:</span>{" "}
              <span className="text-text-primary">{pedido.cliente.email}</span>
            </div>
          )}
          {pedido.cliente.telefone && (
            <div>
              <span className="text-text-secondary">Telefone:</span>{" "}
              <span className="text-text-primary">{pedido.cliente.telefone}</span>
            </div>
          )}
          {pedido.cliente.endereco && (
            <div className="sm:col-span-2">
              <span className="text-text-secondary">Endereço:</span>{" "}
              <span className="text-text-primary">
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
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Package size={20} />
          Itens do Pedido
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b text-text-secondary">
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
                  <td className="py-3 font-medium text-text-primary">
                    {item.produto.nome}
                  </td>
                  <td className="py-3 text-center text-text-secondary">
                    {item.quantidade}
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {item.pesoTotal.toFixed(1)} kg
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {formatCurrency(item.precoUnit)}
                  </td>
                  <td className="py-3 text-right font-medium text-text-primary">
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
            <span className="text-text-secondary">Valor dos Produtos</span>
            <span className="font-medium">{formatCurrency(pedido.valorProdutos)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Frete</span>
            <span className="font-medium">{formatCurrency(pedido.valorFrete)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Peso Total</span>
            <span className="font-medium">{pedido.pesoTotal.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Volumes</span>
            <span className="font-medium">{pedido.volumes}</span>
          </div>
          <hr />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-text-primary">Valor Total</span>
            <span className="font-bold">
              {formatCurrency(pedido.valorTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Observacoes */}
      {pedido.observacoes && (
        <div className="rounded-xl bg-card-bg p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">
            Observacoes
          </h2>
          <p className="text-sm text-text-secondary">{pedido.observacoes}</p>
        </div>
      )}

      {/* Cotacao de Frete */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FileText size={20} />
            Cotacao de Frete
          </h2>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: '#b8960c' }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap overflow-x-auto rounded-lg bg-brand-cream p-4 text-sm text-text-primary">
          {cotacaoText}
        </pre>
      </div>
    </div>
  );
}
