import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = Number(searchParams.get("mes"));
    const ano = Number(searchParams.get("ano"));

    // Só notas que de fato foram emitidas (ganharam número na SEFAZ)
    const where: Prisma.PedidoWhereInput = {
      nfeNumero: { not: null },
    };

    // Filtro por mês/ano sobre a data de emissão da NFe
    if (mes >= 1 && mes <= 12 && ano > 0) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 1);
      where.nfeDataEmissao = { gte: inicio, lt: fim };
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      select: {
        id: true,
        numero: true,
        valorTotal: true,
        nfeStatus: true,
        nfeNumero: true,
        nfeSerie: true,
        nfeChave: true,
        nfeDataEmissao: true,
        cliente: { select: { nome: true, cpf: true, cnpj: true } },
      },
      orderBy: [{ nfeDataEmissao: "desc" }, { nfeNumero: "desc" }],
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Erro ao listar NFs emitidas:", error);
    return NextResponse.json(
      { error: "Erro ao listar NFs emitidas" },
      { status: 500 }
    );
  }
}
