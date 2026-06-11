'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Receipt, FileDown, Search } from 'lucide-react'

interface NfeEmitida {
  id: string
  numero: number
  valorTotal: number
  nfeStatus: string | null
  nfeNumero: number | null
  nfeSerie: number | null
  nfeChave: string | null
  nfeDataEmissao: string | null
  cliente: { nome: string; cpf: string | null; cnpj: string | null }
}

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

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  return options.reverse()
}

function isAutorizada(status: string | null) {
  return status === 'autorizada' || status === 'autorizado'
}

function isCancelada(status: string | null) {
  return status === 'cancelada' || status === 'cancelado'
}

export default function NfeEmitidasPage() {
  const now = new Date()
  // Valor "" = todos os meses
  const [periodo, setPeriodo] = useState(`${now.getMonth() + 1}-${now.getFullYear()}`)
  const [busca, setBusca] = useState('')
  const [notas, setNotas] = useState<NfeEmitida[]>([])
  const [loading, setLoading] = useState(true)

  const monthOptions = useMemo(getMonthOptions, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const query = periodo
        ? (() => {
            const [m, a] = periodo.split('-')
            return `?mes=${m}&ano=${a}`
          })()
        : ''
      const res = await fetch(`/api/nfe-emitidas${query}`)
      const data = await res.json()
      setNotas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar NFs emitidas:', err)
    } finally {
      setLoading(false)
    }
  }, [periodo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const notasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return notas
    return notas.filter((n) =>
      n.cliente.nome.toLowerCase().includes(termo) ||
      String(n.nfeNumero ?? '').includes(termo) ||
      String(n.numero).includes(termo) ||
      (n.nfeChave ?? '').includes(termo)
    )
  }, [notas, busca])

  const totalAutorizado = useMemo(
    () =>
      notasFiltradas
        .filter((n) => isAutorizada(n.nfeStatus))
        .reduce((acc, n) => acc + n.valorTotal, 0),
    [notasFiltradas]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-green">
          <Receipt size={26} />
          Notas Fiscais Emitidas
        </h1>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm font-medium text-text-primary shadow-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
        >
          <option value="">Todos os meses</option>
          {monthOptions.map((opt) => (
            <option key={`${opt.mes}-${opt.ano}`} value={`${opt.mes}-${opt.ano}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Resumo + busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 rounded-xl bg-card-bg p-5 shadow-sm border border-card-border">
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(26, 77, 46, 0.1)' }}>
            <Receipt className="h-6 w-6" style={{ color: 'var(--brand-green)' }} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              {notasFiltradas.length} nota(s) · total autorizado
            </p>
            <p className="text-xl font-semibold" style={{ color: 'var(--brand-green)' }}>
              {formatCurrency(totalAutorizado)}
            </p>
          </div>
        </div>
        <div className="relative sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, nº NFe ou pedido"
            className="w-full rounded-lg border border-input-border bg-input-bg py-2 pl-9 pr-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-card-border">
            <thead style={{ backgroundColor: '#f5f0e1' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">NFe</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Emitida em</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Valor</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-text-muted">
                    Carregando...
                  </td>
                </tr>
              ) : notasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-text-muted">
                    Nenhuma nota fiscal emitida neste período.
                  </td>
                </tr>
              ) : (
                notasFiltradas.map((n) => (
                  <tr key={n.id} className="hover:bg-hover-bg transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {n.nfeNumero}
                      <span className="text-text-muted"> / Série {n.nfeSerie}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">#{n.numero}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{n.cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatDateTime(n.nfeDataEmissao)}</td>
                    <td className="px-6 py-4 text-right text-sm text-text-secondary">{formatCurrency(n.valorTotal)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          isAutorizada(n.nfeStatus)
                            ? 'bg-green-100 text-green-700'
                            : isCancelada(n.nfeStatus)
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {n.nfeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/api/pedidos/${n.id}/nfe/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-hover-bg"
                          title="Baixar DANFE (PDF)"
                        >
                          <FileDown size={14} />
                          DANFE
                        </a>
                        <a
                          href={`/api/pedidos/${n.id}/nfe/xml`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-hover-bg"
                          title="Baixar XML"
                        >
                          <FileDown size={14} />
                          XML
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
