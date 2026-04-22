import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao listar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, peso, precoVenda, custoProducao, duracaoMedia, unidade, unidadesPorCaixa, caixaDimensoes, tipo, ncm, origem, cest } = body;

    if (!nome || peso == null || precoVenda == null) {
      return NextResponse.json(
        { error: "Nome, peso e preço de venda são obrigatórios" },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao || null,
        peso: Number(peso),
        precoVenda: Number(precoVenda),
        custoProducao: Number(custoProducao) || 0,
        duracaoMedia: duracaoMedia ? Number(duracaoMedia) : null,
        unidade: unidade || "un",
        unidadesPorCaixa: unidadesPorCaixa ? Number(unidadesPorCaixa) : null,
        caixaDimensoes: caixaDimensoes || null,
        tipo: tipo || "PRODUTO",
        ncm: ncm || null,
        origem: origem || "0",
        cest: cest || null,
      },
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
