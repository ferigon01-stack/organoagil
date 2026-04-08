import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getMonthsList() {
  const months: { mes: number; ano: number }[] = [];
  const now = new Date();
  let year = 2025;
  let month = 11; // November 2025

  while (year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth() + 1)) {
    months.push({ mes: month, ano: year });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return months;
}

export async function GET() {
  try {
    // Total faturamento (all pedidos in ENVIO or RECEBIDO)
    const faturamentoAgg = await prisma.pedido.aggregate({
      _sum: { valorTotal: true },
      where: {
        fase: { in: ["ENVIO", "RECEBIDO"] },
      },
    });
    const faturamento = faturamentoAgg._sum.valorTotal ?? 0;

    // Total despesas
    const despesasAgg = await prisma.despesa.aggregate({
      _sum: { valor: true },
    });
    const despesas = despesasAgg._sum.valor ?? 0;

    const lucro = faturamento - despesas;

    // Total pedidos
    const totalPedidos = await prisma.pedido.count();

    // Monthly data
    const monthsList = getMonthsList();
    const mensal = await Promise.all(
      monthsList.map(async ({ mes, ano }) => {
        const start = new Date(ano, mes - 1, 1);
        const end = new Date(ano, mes, 1);

        const fatAgg = await prisma.pedido.aggregate({
          _sum: { valorTotal: true },
          where: {
            fase: { in: ["ENVIO", "RECEBIDO"] },
            createdAt: { gte: start, lt: end },
          },
        });

        const despAgg = await prisma.despesa.aggregate({
          _sum: { valor: true },
          where: { mes, ano },
        });

        return {
          mes,
          ano,
          faturamento: fatAgg._sum.valorTotal ?? 0,
          despesas: despAgg._sum.valor ?? 0,
        };
      })
    );

    // Recent orders
    const pedidosRecentes = await prisma.pedido.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cliente: { select: { nome: true } } },
    });

    return NextResponse.json({
      faturamento,
      despesas,
      lucro,
      totalPedidos,
      mensal,
      pedidosRecentes,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard" },
      { status: 500 }
    );
  }
}
