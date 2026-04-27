"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Copy,
  Check,
  Megaphone,
  ExternalLink,
} from "lucide-react";

interface Influencer {
  id: string;
  slug: string;
  nome: string;
  telefone: string | null;
  comissaoPct: number;
  ativo: boolean;
  observacoes: string | null;
  fotoUrl: string | null;
  _count: { pedidos: number };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Influencer | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [telefone, setTelefone] = useState("");
  const [comissaoPct, setComissaoPct] = useState<string>("10");
  const [observacoes, setObservacoes] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  useEffect(() => {
    fetchInfluencers();
  }, []);

  async function fetchInfluencers() {
    try {
      const res = await fetch("/api/influencers");
      const data = await res.json();
      setInfluencers(data);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setNome("");
    setSlug("");
    setTelefone("");
    setComissaoPct("10");
    setObservacoes("");
    setFotoUrl("");
    setEditing(null);
    setErro(null);
  }

  function abrirEdicao(inf: Influencer) {
    setEditing(inf);
    setNome(inf.nome);
    setSlug(inf.slug);
    setTelefone(inf.telefone || "");
    setComissaoPct(String(inf.comissaoPct));
    setObservacoes(inf.observacoes || "");
    setFotoUrl(inf.fotoUrl || "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSaving(true);
    try {
      const url = editing ? `/api/influencers/${editing.id}` : "/api/influencers";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          slug: editing ? undefined : slug,
          telefone,
          comissaoPct: Number(comissaoPct) || 0,
          observacoes,
          fotoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }
      await fetchInfluencers();
      resetForm();
      setShowForm(false);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(inf: Influencer) {
    await fetch(`/api/influencers/${inf.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !inf.ativo }),
    });
    fetchInfluencers();
  }

  async function handleDelete(inf: Influencer) {
    if (!confirm(`Excluir "${inf.nome}"?`)) return;
    const res = await fetch(`/api/influencers/${inf.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao excluir.");
      return;
    }
    fetchInfluencers();
  }

  function publicUrl(slug: string) {
    if (typeof window === "undefined") return `/i/${slug}`;
    return `${window.location.origin}/i/${slug}`;
  }

  async function copiarLink(slug: string) {
    try {
      await navigator.clipboard.writeText(publicUrl(slug));
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      alert("Não foi possível copiar. Copie manualmente: " + publicUrl(slug));
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
          <h1 className="text-2xl font-bold text-brand-green">Influencers</h1>
          <p className="text-text-secondary text-sm mt-1">
            {influencers.length} cadastrada
            {influencers.length !== 1 ? "s" : ""} — cada uma tem um link público
            pra divulgar.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: "var(--brand-green)" }}
        >
          <Plus size={18} />
          Nova influencer
        </button>
      </div>

      {influencers.length === 0 ? (
        <div className="text-center py-16 bg-card-bg rounded-xl border border-card-border">
          <Megaphone className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg">Nenhuma influencer cadastrada</p>
          <p className="text-text-muted text-sm mt-2">
            Crie a primeira pra gerar o link de divulgação.
          </p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border" style={{ backgroundColor: "#f5f0e1" }}>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Link</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-text-secondary">Comissão</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-text-secondary">Pedidos</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-text-secondary">Status</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((inf) => (
                  <tr
                    key={inf.id}
                    className="border-b border-card-border hover:bg-hover-bg transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{inf.nome}</div>
                      {inf.telefone && (
                        <div className="text-xs text-text-secondary">{inf.telefone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          /i/{inf.slug}
                        </code>
                        <button
                          onClick={() => copiarLink(inf.slug)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          title="Copiar link completo"
                        >
                          {copiedSlug === inf.slug ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-text-secondary" />
                          )}
                        </button>
                        <a
                          href={`/i/${inf.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          title="Abrir landing"
                        >
                          <ExternalLink size={14} className="text-text-secondary" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">
                      {inf.comissaoPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">
                      {inf._count.pedidos}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleAtivo(inf)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inf.ativo
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {inf.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => abrirEdicao(inf)}
                          className="p-2 text-text-muted hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inf)}
                          className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-card-bg w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-card-bg border-b border-card-border px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">
                {editing ? "Editar influencer" : "Nova influencer"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-1 hover:bg-hover-bg rounded-lg text-text-secondary"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-text-secondary">Nome *</span>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-primary"
                />
              </label>

              {!editing && (
                <label className="block">
                  <span className="text-sm font-medium text-text-secondary">
                    Slug (link)
                  </span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-text-secondary text-sm">/i/</span>
                    <input
                      type="text"
                      placeholder="auto-gerado pelo nome"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      className="flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-primary"
                    />
                  </div>
                  <span className="text-xs text-text-muted mt-1 block">
                    Deixe em branco pra gerar a partir do nome.
                  </span>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-medium text-text-secondary">
                  Telefone (opcional)
                </span>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-primary"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-secondary">
                  Comissão (%)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={comissaoPct}
                  onChange={(e) => setComissaoPct(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-primary"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-secondary">
                  URL da foto (opcional)
                </span>
                <input
                  type="text"
                  placeholder="/influencers/flavia.jpg"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-primary"
                />
                <span className="text-xs text-text-muted mt-1 block">
                  Foto do rosto da influencer pra avatar da landing.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-secondary">
                  Observações
                </span>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-primary resize-none"
                />
              </label>

              {erro && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{erro}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-text-secondary hover:bg-hover-bg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium disabled:opacity-60"
                  style={{ backgroundColor: "var(--brand-green)" }}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {influencers.length > 0 && (
        <p className="text-xs text-text-muted mt-3">
          Comissão estimada =
          <span className="ml-1">
            valor total dos pedidos × % de cada influencer.
          </span>{" "}
          Em breve: relatório fechado por mês com filtro de pedidos pagos.
        </p>
      )}
    </div>
  );
}
