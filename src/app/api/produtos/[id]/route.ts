import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const produto = await prisma.produto.findUnique({ where: { id } });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, descricao, peso, precoVenda, custoProducao, duracaoMedia, unidade, unidadesPorCaixa, caixaDimensoes } = body;

    const produto = await prisma.produto.update({
      where: { id },
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
      },
    });

    return NextResponse.json(produto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.produto.delete({ where: { id } });
    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
