"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  Upload,
  Download,
  Trash2,
  Loader2,
  FileDown,
  Save,
  Edit,
  X,
} from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface Visita {
  id: string;
  clienteId: string;
  data: string;
  observacoes?: string;
  createdAt: string;
  cliente: Cliente;
}

interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function VisitaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [visita, setVisita] = useState<Visita | null>(null);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editClienteId, setEditClienteId] = useState("");
  const [editData, setEditData] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");

  const fetchVisita = () =>
    fetch(`/api/visitas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVisita(data);
        setEditClienteId(data.clienteId);
        setEditData(new Date(data.data).toISOString().slice(0, 10));
        setEditObservacoes(data.observacoes || "");
      });

  const fetchAnexos = () =>
    fetch(`/api/visitas/${id}/anexos`)
      .then((res) => res.json())
      .then((data) => setAnexos(data));

  useEffect(() => {
    Promise.all([fetchVisita(), fetchAnexos(), fetch("/api/clientes").then((r) => r.json())])
      .then((results) => setClientes(results[2] as Cliente[]))
      .catch((err) => console.error("Erro ao carregar:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/visitas/${id}/anexos`, {
        method: "POST",
        body: formData,
      });
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
      await fetch(`/api/visitas/${id}/anexos/${anexoId}`, { method: "DELETE" });
      fetchAnexos();
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
    }
  };

  const handleDelete = async () => {
    if (!visita) return;
    const ok = confirm("Excluir esta visita? Esta ação não pode ser desfeita.");
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/visitas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      router.push("/visitas");
    } catch (error) {
      console.error("Erro ao excluir visita:", error);
      alert("Erro ao excluir visita.");
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/visitas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: editClienteId,
          data: editData,
          observacoes: editObservacoes || null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      await fetchVisita();
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const generatePdf = async () => {
    if (!visita) return;
    setGeneratingPdf(true);
    try {
      const fotoAnexos = anexos.filter((a) => a.tipo.startsWith("image/"));
      const fotos = await Promise.all(
        fotoAnexos.map(async (a) => {
          const res = await fetch(`/api/visitas/${id}/anexos/${a.id}`);
          const blob = await res.blob();
          const dataUrl: string = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          return { id: a.id, dataUrl };
        })
      );

      const { pdf } = await import("@react-pdf/renderer");
      const { default: VisitaPDF } = await import("@/components/VisitaPDF");
      const blob = await pdf(<VisitaPDF visita={visita} fotos={fotos} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date(visita.data).toISOString().slice(0, 10);
      a.download = `visita-${visita.cliente.nome.replace(/\s+/g, "-")}-${dateStr}.pdf`;
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
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: `var(--brand-green)`, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!visita) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary">
        Visita não encontrada.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/visitas")}
            className="rounded-lg p-2 text-text-secondary hover:bg-hover-bg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">
              Visita - {visita.cliente.nome}
            </h1>
            <p className="text-sm text-text-secondary">{formatDate(visita.data)}</p>
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
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-lg border border-input-border bg-card-bg px-4 py-2 text-sm font-medium text-text-primary hover:bg-hover-bg"
            >
              <Edit size={16} />
              Editar
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg border border-red-300 bg-card-bg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-green">Dados da Visita</h2>
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg p-1 text-text-secondary hover:bg-hover-bg"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Cliente
                </label>
                <select
                  value={editClienteId}
                  onChange={(e) => setEditClienteId(e.target.value)}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Data</label>
                <input
                  type="date"
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Observações
              </label>
              <textarea
                value={editObservacoes}
                onChange={(e) => setEditObservacoes(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: `var(--brand-green)` }}
              >
                <Save size={16} />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-muted" />
              <span className="text-text-secondary">Cliente:</span>
              <span className="font-medium text-text-primary">{visita.cliente.nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-text-muted" />
              <span className="text-text-secondary">Data:</span>
              <span className="font-medium text-text-primary">{formatDate(visita.data)}</span>
            </div>
            {visita.observacoes && (
              <div>
                <p className="mb-1 text-text-secondary">Observações:</p>
                <p className="whitespace-pre-wrap rounded-lg bg-brand-cream p-3 text-text-primary">
                  {visita.observacoes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-green">
            <Paperclip size={20} />
            Fotos e Anexos
          </h2>
          <label
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white cursor-pointer transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ backgroundColor: `var(--brand-green)` }}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Enviando..." : "Anexar"}
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {anexos.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            Nenhuma foto ou anexo ainda.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {anexos.map((anexo) =>
              anexo.tipo.startsWith("image/") ? (
                <div
                  key={anexo.id}
                  className="group relative overflow-hidden rounded-lg border border-card-border"
                >
                  <a
                    href={`/api/visitas/${id}/anexos/${anexo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/visitas/${id}/anexos/${anexo.id}`}
                      alt={anexo.nome}
                      className="h-40 w-full object-cover"
                    />
                  </a>
                  <button
                    onClick={() => deleteAnexo(anexo.id)}
                    className="absolute top-2 right-2 rounded-lg bg-red-500/90 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="bg-card-bg p-2 text-xs text-text-muted">
                    {formatFileSize(anexo.tamanho)}
                  </div>
                </div>
              ) : (
                <div
                  key={anexo.id}
                  className="flex items-center justify-between rounded-lg border border-card-border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{anexo.nome}</p>
                    <p className="text-xs text-text-muted">{formatFileSize(anexo.tamanho)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/visitas/${id}/anexos/${anexo.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-text-secondary hover:bg-hover-bg"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => deleteAnexo(anexo.id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
