"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Truck, Search } from "lucide-react";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const emptyForm = {
  nome: "",
  cnpj: "",
  inscricaoEstadual: "",
  telefone: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

const inputCls =
  "w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]";
const labelCls = "mb-1 block text-sm font-medium text-text-primary";

export default function TransportadoraForm({ id }: { id?: string }) {
  const router = useRouter();
  const editing = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [erro, setErro] = useState("");
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [cnpjInfo, setCnpjInfo] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/transportadoras/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          nome: data.nome || "",
          cnpj: data.cnpj || "",
          inscricaoEstadual: data.inscricaoEstadual || "",
          telefone: data.telefone || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          cep: data.cep || "",
        });
      })
      .catch((e) => console.error("Erro ao carregar transportadora:", e))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function consultarCnpj() {
    const digits = form.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return;
    setConsultandoCnpj(true);
    setCnpjInfo("");
    try {
      const res = await fetch(`/api/consulta-cnpj/${digits}`);
      const data = await res.json();
      if (!res.ok) {
        setCnpjInfo(data.error || "Não foi possível consultar o CNPJ");
        return;
      }
      setForm((prev) => ({
        ...prev,
        nome: prev.nome || data.razao_social || data.nome_fantasia || "",
        endereco: prev.endereco || data.endereco || "",
        numero: prev.numero || data.numero || "",
        bairro: prev.bairro || data.bairro || "",
        cep: prev.cep || data.cep || "",
        cidade: prev.cidade || data.cidade || "",
        estado: prev.estado || data.estado || "",
        telefone: prev.telefone || data.telefone || "",
      }));
      setCnpjInfo(
        data.situacao && data.situacao.toLowerCase() !== "ativa"
          ? `Atenção: situação cadastral "${data.situacao}"`
          : "Dados preenchidos automaticamente pela Receita Federal"
      );
    } catch {
      setCnpjInfo("Erro ao consultar CNPJ");
    } finally {
      setConsultandoCnpj(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!form.nome.trim()) {
      setErro("O nome / razão social é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/transportadoras/${id}` : "/api/transportadoras",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        router.push("/transportadoras");
      } else {
        const data = await res.json();
        setErro(data.error || "Erro ao salvar transportadora.");
      }
    } catch (error) {
      console.error("Erro ao salvar transportadora:", error);
      setErro("Erro ao salvar transportadora.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/transportadoras")}
          className="rounded-lg p-2 text-text-muted hover:bg-hover-bg hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(184, 150, 12, 0.15)" }}>
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">
              {editing ? "Editar Transportadora" : "Nova Transportadora"}
            </h1>
            <p className="text-sm text-text-secondary">
              Dados usados na etiqueta e no grupo Transportador da NFe
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Dados fiscais */}
        <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
            Dados fiscais
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Nome / Razão social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className={inputCls}
                placeholder="Razão social da transportadora"
              />
            </div>
            <div>
              <label className={labelCls}>CNPJ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={handleChange}
                  onBlur={consultarCnpj}
                  className={inputCls}
                  placeholder="00.000.000/0000-00"
                />
                <button
                  type="button"
                  onClick={consultarCnpj}
                  disabled={consultandoCnpj || form.cnpj.replace(/\D/g, "").length !== 14}
                  className="inline-flex items-center justify-center rounded-lg border border-input-border bg-card-bg px-3 text-text-muted hover:bg-hover-bg disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Buscar dados do CNPJ na Receita Federal"
                >
                  {consultandoCnpj ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </div>
              {cnpjInfo && <p className="mt-1 text-xs text-text-muted">{cnpjInfo}</p>}
            </div>
            <div>
              <label className={labelCls}>Inscrição Estadual</label>
              <input
                type="text"
                name="inscricaoEstadual"
                value={form.inscricaoEstadual}
                onChange={handleChange}
                className={inputCls}
                placeholder="IE (preencher manualmente)"
              />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className={inputCls}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
            Endereço
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Endereço</label>
              <input
                type="text"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                className={inputCls}
                placeholder="Rua / logradouro"
              />
            </div>
            <div>
              <label className={labelCls}>Número</label>
              <input
                type="text"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                className={inputCls}
                placeholder="Número"
              />
            </div>
            <div>
              <label className={labelCls}>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                className={inputCls}
                placeholder="Bairro"
              />
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input
                type="text"
                name="cep"
                value={form.cep}
                onChange={handleChange}
                className={inputCls}
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className={labelCls}>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                className={inputCls}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Selecione</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/transportadoras")}
            className="rounded-lg border border-input-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-hover-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--brand-green)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Transportadora
          </button>
        </div>
      </form>
    </div>
  );
}
