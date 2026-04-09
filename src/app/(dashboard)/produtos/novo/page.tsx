"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    peso: "",
    precoVenda: "",
    custoProducao: "",
    duracaoMedia: "",
    unidade: "un",
    unidadesPorCaixa: "",
    caixaDimensoes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao || null,
          peso: parseFloat(form.peso),
          precoVenda: parseFloat(form.precoVenda),
          custoProducao: parseFloat(form.custoProducao) || 0,
          duracaoMedia: form.duracaoMedia ? parseInt(form.duracaoMedia) : null,
          unidade: form.unidade,
          unidadesPorCaixa: parseInt(form.unidadesPorCaixa) || null,
          caixaDimensoes: form.caixaDimensoes || null,
        }),
      });

      if (res.ok) {
        router.push("/produtos");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar produto.");
      }
    } catch {
      alert("Erro ao criar produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="bg-card-bg rounded-xl border border-card-border p-4 sm:p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Novo Produto</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
              placeholder="Nome do produto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Descricao
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
              placeholder="Descrição do produto"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="peso"
                value={form.peso}
                onChange={handleChange}
                required
                step="0.001"
                min="0"
                className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
                placeholder="0.000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Unidade
              </label>
              <select
                name="unidade"
                value={form.unidade}
                onChange={handleChange}
                className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
              >
                <option value="un">Unidade (un)</option>
                <option value="L">Litro (L)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="cx">Caixa (cx)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Preco de Venda (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="precoVenda"
                value={form.precoVenda}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Custo de Produção (R$)
              </label>
              <input
                type="number"
                name="custoProducao"
                value={form.custoProducao}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Duração Média (dias)
            </label>
            <input
              type="number"
              name="duracaoMedia"
              value={form.duracaoMedia}
              onChange={handleChange}
              min="0"
              className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors w-full sm:max-w-xs"
              placeholder="Ex: 30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Unidades por Caixa
              </label>
              <input
                type="number"
                name="unidadesPorCaixa"
                value={form.unidadesPorCaixa}
                onChange={handleChange}
                min="0"
                className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
                placeholder="Ex: 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Dimensões da Caixa (cm)
              </label>
              <input
                type="text"
                name="caixaDimensoes"
                value={form.caixaDimensoes}
                onChange={handleChange}
                className="w-full border border-input-border rounded-lg px-3 py-2 bg-input-bg text-text-primary focus:ring-2 focus:ring-[#b8960c] focus:border-[#b8960c] outline-none transition-colors"
                placeholder="Ex: 25x30x20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: `var(--brand-green)` }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2d6b3f')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = `var(--brand-green)`)}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-lg font-medium text-text-secondary hover:bg-hover-bg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
