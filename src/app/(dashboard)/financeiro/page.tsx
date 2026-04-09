'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface FinanceiroData {
  mes: number
  ano: number
  faturamento: number
  despesas: number
  lucro: number
  mensal: {
    mes: number
    ano: number
    faturamento: number
    despesas: number
    lucro: number
  }[]
}

interface Despesa {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
  mes: number
  ano: number
}

const CATEGORIAS = [
  { value: 'BONIFICACAO', label: 'Bonificacao' },
  { value: 'COMBUSTIVEL', label: 'Combustivel' },
  { value: 'HOSPEDAGEM', label: 'Hospedagem' },
  { value: 'IMPOSTOS', label: 'Impostos' },
  { value: 'SISTEMAS', label: 'Sistemas' },
  { value: 'OUTROS', label: 'Outros' },
]

const CATEGORIA_LABELS: Record<string, string> = {
  BONIFICACAO: 'Bonificacao',
  COMBUSTIVEL: 'Combustivel',
  HOSPEDAGEM: 'Hospedagem',
  IMPOSTOS: 'Impostos',
  SISTEMAS: 'Sistemas',
  OUTROS: 'Outros',
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const MESES_FULL = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getMonthOptions() {
  const options: { mes: number; ano: number; label: string }[] = []
  const now = new Date()
  let year = 2025
  let month = 11

  while (year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth() + 1)) {
    options.push({
      mes: month,
      ano: year,
      label: `${MESES_FULL[month - 1]} ${year}`,
    })
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }
  return options
}

export default function FinanceiroPage() {
  const router = useRouter()
  const now = new Date()
  const [selectedMes, setSelectedMes] = useState(now.getMonth() + 1)
  const [selectedAno, setSelectedAno] = useState(now.getFullYear())
  const [data, setData] = useState<FinanceiroData | null>(null)
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    categoria: 'OUTROS',
    data: new Date().toISOString().split('T')[0],
  })

  const monthOptions = getMonthOptions()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [finRes, despRes] = await Promise.all([
        fetch(`/api/financeiro?mes=${selectedMes}&ano=${selectedAno}`),
        fetch(`/api/despesas?mes=${selectedMes}&ano=${selectedAno}`),
      ])
      const finData = await finRes.json()
      const despData = await despRes.json()
      setData(finData)
      setDespesas(despData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedMes, selectedAno])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleMonthChange = (value: string) => {
    const [m, a] = value.split('-').map(Number)
    setSelectedMes(m)
    setSelectedAno(a)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const res = await fetch('/api/despesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: form.descricao,
          valor: Number(form.valor),
          categoria: form.categoria,
          data: form.data,
        }),
      })
      if (res.ok) {
        setForm({ descricao: '', valor: '', categoria: 'OUTROS', data: new Date().toISOString().split('T')[0] })
        setShowForm(false)
        fetchData()
      }
    } catch (err) {
      console.error('Erro ao criar despesa:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
    try {
      const res = await fetch(`/api/despesas/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (err) {
      console.error('Erro ao excluir despesa:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#1a4d2e', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const chartData = data?.mensal?.map((item) => ({
    nome: `${MESES[item.mes - 1]}/${item.ano}`,
    Faturamento: item.faturamento,
    Despesas: item.despesas,
    Lucro: item.lucro,
  })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#1a4d2e' }}>Financeiro</h1>
        <select
          value={`${selectedMes}-${selectedAno}`}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm font-medium text-text-primary shadow-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
        >
          {monthOptions.map((opt) => (
            <option key={`${opt.mes}-${opt.ano}`} value={`${opt.mes}-${opt.ano}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm border border-card-border">
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(26, 77, 46, 0.1)' }}>
            <DollarSign className="h-6 w-6" style={{ color: '#1a4d2e' }} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Faturamento</p>
            <p className="text-xl font-semibold" style={{ color: '#1a4d2e' }}>
              {formatCurrency(data?.faturamento ?? 0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm border border-card-border">
          <div className="rounded-lg bg-red-50 p-3">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Despesas</p>
            <p className="text-xl font-semibold text-red-600">
              {formatCurrency(data?.despesas ?? 0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm border border-card-border">
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(184, 150, 12, 0.1)' }}>
            <TrendingUp className="h-6 w-6" style={{ color: '#b8960c' }} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Lucro</p>
            <p className="text-xl font-semibold" style={{ color: (data?.lucro ?? 0) >= 0 ? '#b8960c' : '#dc2626' }}>
              {formatCurrency(data?.lucro ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a4d2e' }}>
          Evolucao Mensal
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="Faturamento" stroke="#1a4d2e" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Despesas" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Lucro" stroke="#b8960c" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: '#1a4d2e' }}>
            Despesas - {MESES_FULL[selectedMes - 1]} {selectedAno}
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: '#1a4d2e' }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Nova Despesa'}
          </button>
        </div>

        {/* Inline Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-card-border bg-brand-cream p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Descricao</label>
                <input
                  type="text"
                  required
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                  placeholder="Ex: Gasolina"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Valor (R$)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Data</label>
                <input
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#1a4d2e' }}
              >
                {formLoading ? 'Salvando...' : 'Salvar Despesa'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-text-secondary">
                <th className="pb-3 font-medium">Descricao</th>
                <th className="pb-3 font-medium">Categoria</th>
                <th className="pb-3 font-medium text-right">Valor</th>
                <th className="pb-3 font-medium text-right">Data</th>
                <th className="pb-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((despesa) => (
                <tr key={despesa.id} className="border-b last:border-0">
                  <td className="py-3 text-text-primary">{despesa.descricao}</td>
                  <td className="py-3">
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', color: '#b8960c' }}>
                      {CATEGORIA_LABELS[despesa.categoria] ?? despesa.categoria}
                    </span>
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {formatCurrency(despesa.valor)}
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {new Date(despesa.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(despesa.id)}
                      className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                      title="Excluir despesa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {despesas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted">
                    Nenhuma despesa registrada neste mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
