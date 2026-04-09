'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Produto {
  id: string
  nome: string
  precoVenda: number
  custoProducao: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getMargemColor(margemPct: number) {
  if (margemPct >= 30) return 'text-green-700 bg-green-50'
  if (margemPct >= 15) return 'text-yellow-700 bg-yellow-50'
  return 'text-red-700 bg-red-50'
}

function getMargemBadgeColor(margemPct: number) {
  if (margemPct >= 30) return 'bg-green-100 text-green-800'
  if (margemPct >= 15) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export default function CustosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/produtos')
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error('Erro ao carregar produtos:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#1a4d2e', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const produtosComMargem = produtos.map((p) => {
    const margem = p.precoVenda - p.custoProducao
    const margemPct = p.precoVenda > 0 ? (margem / p.precoVenda) * 100 : 0
    return { ...p, margem, margemPct }
  })

  const margemMedia =
    produtosComMargem.length > 0
      ? produtosComMargem.reduce((acc, p) => acc + p.margemPct, 0) / produtosComMargem.length
      : 0

  const chartData = produtosComMargem.map((p) => ({
    nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
    'Custo de Producao': p.custoProducao,
    'Preco de Venda': p.precoVenda,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#1a4d2e' }}>Analise de Custos</h1>

      {/* Summary Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm">
          <div className={`rounded-lg p-3 ${getMargemColor(margemMedia)}`}>
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Margem Media</p>
            <p className={`text-xl font-semibold ${margemMedia >= 30 ? 'text-green-700' : margemMedia >= 15 ? 'text-yellow-700' : 'text-red-700'}`}>
              {margemMedia.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm">
          <div className="rounded-lg bg-green-50 p-3">
            <Calculator className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Produtos Analisados</p>
            <p className="text-xl font-semibold text-green-700">
              {produtosComMargem.length}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Custo vs Preco de Venda
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" angle={-20} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
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
              <Bar dataKey="Custo de Producao" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Preco de Venda" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Detalhamento por Produto
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-text-secondary">
                <th className="pb-3 font-medium">Nome do Produto</th>
                <th className="pb-3 font-medium text-right">Custo de Producao</th>
                <th className="pb-3 font-medium text-right">Preco de Venda</th>
                <th className="pb-3 font-medium text-right">Margem (R$)</th>
                <th className="pb-3 font-medium text-right">Margem (%)</th>
              </tr>
            </thead>
            <tbody>
              {produtosComMargem.map((produto) => (
                <tr key={produto.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-text-primary">{produto.nome}</td>
                  <td className="py-3 text-right text-text-secondary">
                    {formatCurrency(produto.custoProducao)}
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {formatCurrency(produto.precoVenda)}
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {formatCurrency(produto.margem)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getMargemBadgeColor(produto.margemPct)}`}
                    >
                      {produto.margemPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {produtosComMargem.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted">
                    Nenhum produto cadastrado.
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
