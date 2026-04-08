import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");
    const ano = searchParams.get("ano");

    const where: Record<string, unknown> = {};
    if (mes) where.mes = Number(mes);
    if (ano) where.ano = Number(ano);

    const despesas = await prisma.despesa.findMany({
      where,
      orderBy: { data: "desc" },
    });

    return NextResponse.json(despesas);
  } catch (error) {
    console.error("Erro ao listar despesas:", error);
    return NextResponse.json(
      { error: "Erro ao listar despesas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { descricao, valor, categoria, data } = body;

    if (!descricao || valor == null || !categoria || !data) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios: descricao, valor, categoria, data" },
        { status: 400 }
      );
    }

    const dataDate = new Date(data);
    const mes = dataDate.getMonth() + 1;
    const ano = dataDate.getFullYear();

    const despesa = await prisma.despesa.create({
      data: {
        descricao,
        valor: Number(valor),
        categoria,
        data: dataDate,
        mes,
        ano,
      },
    });

    return NextResponse.json(despesa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json(
      { error: "Erro ao criar despesa" },
      { status: 500 }
    );
  }
}
