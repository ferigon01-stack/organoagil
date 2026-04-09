'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
} from 'lucide-react'
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

interface DashboardData {
  faturamento: number
  despesas: number
  lucro: number
  totalPedidos: number
  mensal: {
    mes: number
    ano: number
    faturamento: number
    despesas: number
  }[]
  pedidosRecentes: {
    numero: string
    cliente: { nome: string }
    fase: string
    valorTotal: number
    createdAt: string
  }[]
}

const FASE_CORES: Record<string, string> = {
  PEDIDO: 'bg-blue-100 text-blue-800',
  ORCAMENTO: 'bg-yellow-100 text-yellow-800',
  APROVADO: 'bg-green-100 text-green-800',
  PRODUCAO: 'bg-purple-100 text-purple-800',
  ENVIO: 'bg-orange-100 text-orange-800',
  RECEBIDO: 'bg-gray-100 text-gray-800',
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Erro ao carregar dashboard:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `var(--brand-green)`, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary">
        Erro ao carregar os dados do dashboard.
      </div>
    )
  }

  const chartData = data.mensal.map((item) => ({
    nome: `${MESES[item.mes - 1]}/${item.ano}`,
    Faturamento: item.faturamento,
    Despesas: item.despesas,
  }))

  const cards = [
    {
      label: 'Faturamento Total',
      value: formatCurrency(data.faturamento),
      icon: DollarSign,
      iconColor: `var(--brand-green)`,
      bgColor: 'rgba(26, 77, 46, 0.1)',
      valueColor: `var(--brand-green)`,
    },
    {
      label: 'Despesas Totais',
      value: formatCurrency(data.despesas),
      icon: TrendingDown,
      iconColor: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      valueColor: '#dc2626',
    },
    {
      label: 'Lucro',
      value: formatCurrency(data.lucro),
      icon: TrendingUp,
      iconColor: '#b8960c',
      bgColor: 'rgba(184, 150, 12, 0.1)',
      valueColor: '#b8960c',
    },
    {
      label: 'Total de Pedidos',
      value: data.totalPedidos.toString(),
      icon: ShoppingCart,
      iconColor: `var(--brand-green)`,
      bgColor: 'rgba(26, 77, 46, 0.1)',
      valueColor: `var(--brand-green)`,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-green">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm border border-card-border"
          >
            <div className="rounded-lg p-3" style={{ backgroundColor: card.bgColor }}>
              <card.icon className="h-6 w-6" style={{ color: card.iconColor }} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p className="text-xl font-semibold" style={{ color: card.valueColor }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm border border-card-border">
        <h2 className="mb-4 text-lg font-semibold text-brand-green">
          Faturamento vs Despesas Mensais
        </h2>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
              <Bar dataKey="Faturamento" fill="var(--brand-green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl bg-card-bg p-6 shadow-sm border border-card-border">
        <h2 className="mb-4 text-lg font-semibold text-brand-green">
          Pedidos Recentes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-text-secondary" style={{ backgroundColor: '#f5f0e1' }}>
                <th className="pb-3 pt-3 font-medium">Pedido</th>
                <th className="pb-3 pt-3 font-medium">Cliente</th>
                <th className="pb-3 pt-3 font-medium">Fase</th>
                <th className="hidden sm:table-cell pb-3 pt-3 font-medium text-right">Valor</th>
                <th className="hidden sm:table-cell pb-3 pt-3 font-medium text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.pedidosRecentes.map((pedido) => (
                <tr key={pedido.numero} className="border-b last:border-0">
                  <td className="py-3 text-sm font-medium text-text-primary">
                    #{pedido.numero}
                  </td>
                  <td className="py-3 text-sm text-text-secondary">
                    {pedido.cliente.nome}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        FASE_CORES[pedido.fase] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pedido.fase}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell py-3 text-right text-text-secondary">
                    {formatCurrency(pedido.valorTotal)}
                  </td>
                  <td className="hidden sm:table-cell py-3 text-right text-text-secondary">
                    {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {data.pedidosRecentes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted">
                    Nenhum pedido recente.
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
