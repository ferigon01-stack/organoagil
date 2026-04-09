"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function NovoClientePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cnpj: "",
    inscricaoEstadual: "",
    email: "",
    telefone: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("O nome é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/clientes");
      } else {
        const data = await res.json();
        setErro(data.error || "Erro ao salvar cliente.");
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      setErro("Erro ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/clientes")}
          className="rounded-lg p-2 text-text-muted hover:bg-hover-bg hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)' }}>
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">Novo Cliente</h1>
            <p className="text-sm text-text-secondary">
              Preencha os dados do novo cliente
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Dados Pessoais */}
        <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="Nome completo ou razão social"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                CNPJ
              </label>
              <input
                type="text"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Inscrição Estadual
              </label>
              <input
                type="text"
                name="inscricaoEstadual"
                value={form.inscricaoEstadual}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="Inscrição estadual"
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
            Contato
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Telefone
              </label>
              <input
                type="text"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
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
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="Rua, número, complemento"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Bairro
              </label>
              <input
                type="text"
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="Bairro"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                CEP
              </label>
              <input
                type="text"
                name="cep"
                value={form.cep}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Cidade
              </label>
              <input
                type="text"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full rounded-lg border border-input-border px-3 py-2.5 text-sm text-text-primary bg-input-bg focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
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
            onClick={() => router.push("/clientes")}
            className="rounded-lg border border-input-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-hover-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: `var(--brand-green)` }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#2d6b3f')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Cliente
          </button>
        </div>
      </form>
    </div>
  );
}
