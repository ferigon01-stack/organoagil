import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getMonthlyRange(mes: number, ano: number) {
  const start = new Date(ano, mes - 1, 1);
  const end = new Date(ano, mes, 1);
  return { start, end };
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");
    const ano = searchParams.get("ano");

    const monthsList = getMonthsList();

    // Build monthly array with faturamento and despesas for each month
    const mensal = await Promise.all(
      monthsList.map(async ({ mes: m, ano: a }) => {
        const { start, end } = getMonthlyRange(m, a);

        const faturamentoAgg = await prisma.pedido.aggregate({
          _sum: { valorTotal: true },
          where: {
            fase: { in: ["RECEBIDO", "ENVIO"] },
            createdAt: { gte: start, lt: end },
          },
        });

        const despesasAgg = await prisma.despesa.aggregate({
          _sum: { valor: true },
          where: { mes: m, ano: a },
        });

        const faturamento = faturamentoAgg._sum.valorTotal ?? 0;
        const despesas = despesasAgg._sum.valor ?? 0;

        return {
          mes: m,
          ano: a,
          faturamento,
          despesas,
          lucro: faturamento - despesas,
        };
      })
    );

    // If specific month requested, return that month's data
    if (mes && ano) {
      const m = Number(mes);
      const a = Number(ano);
      const { start, end } = getMonthlyRange(m, a);

      const faturamentoAgg = await prisma.pedido.aggregate({
        _sum: { valorTotal: true },
        where: {
          fase: { in: ["RECEBIDO", "ENVIO"] },
          createdAt: { gte: start, lt: end },
        },
      });

      const despesasAgg = await prisma.despesa.aggregate({
        _sum: { valor: true },
        where: { mes: m, ano: a },
      });

      const faturamento = faturamentoAgg._sum.valorTotal ?? 0;
      const despesas = despesasAgg._sum.valor ?? 0;

      return NextResponse.json({
        mes: m,
        ano: a,
        faturamento,
        despesas,
        lucro: faturamento - despesas,
        mensal,
      });
    }

    // No specific month: return current month + mensal array
    const now = new Date();
    const currentMes = now.getMonth() + 1;
    const currentAno = now.getFullYear();
    const { start, end } = getMonthlyRange(currentMes, currentAno);

    const faturamentoAgg = await prisma.pedido.aggregate({
      _sum: { valorTotal: true },
      where: {
        fase: { in: ["RECEBIDO", "ENVIO"] },
        createdAt: { gte: start, lt: end },
      },
    });

    const despesasAgg = await prisma.despesa.aggregate({
      _sum: { valor: true },
      where: { mes: currentMes, ano: currentAno },
    });

    const faturamento = faturamentoAgg._sum.valorTotal ?? 0;
    const despesas = despesasAgg._sum.valor ?? 0;

    return NextResponse.json({
      mes: currentMes,
      ano: currentAno,
      faturamento,
      despesas,
      lucro: faturamento - despesas,
      mensal,
    });
  } catch (error) {
    console.error("Erro ao buscar dados financeiros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados financeiros" },
      { status: 500 }
    );
  }
}
