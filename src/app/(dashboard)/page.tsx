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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
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
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      label: 'Despesas Totais',
      value: formatCurrency(data.despesas),
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Lucro',
      value: formatCurrency(data.lucro),
      icon: TrendingUp,
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      label: 'Total de Pedidos',
      value: data.totalPedidos.toString(),
      icon: ShoppingCart,
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm"
          >
            <div className={`rounded-lg p-3 ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`text-xl font-semibold ${card.color}`}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Faturamento vs Despesas Mensais
        </h2>
        <div className="h-80">
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
              <Bar dataKey="Faturamento" fill="#15803d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Pedidos Recentes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3 font-medium">Pedido</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Fase</th>
                <th className="pb-3 font-medium text-right">Valor</th>
                <th className="pb-3 font-medium text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.pedidosRecentes.map((pedido) => (
                <tr key={pedido.numero} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">
                    #{pedido.numero}
                  </td>
                  <td className="py-3 text-gray-600">
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
                  <td className="py-3 text-right text-gray-600">
                    {formatCurrency(pedido.valorTotal)}
                  </td>
                  <td className="py-3 text-right text-gray-500">
                    {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {data.pedidosRecentes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
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
