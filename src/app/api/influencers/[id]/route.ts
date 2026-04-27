import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { createdAt: "desc" },
          include: { cliente: true },
        },
      },
    });
    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer não encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(influencer);
  } catch (error) {
    console.error("Erro ao buscar influencer:", error);
    return NextResponse.json(
      { error: "Erro ao buscar influencer" },
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
    const { nome, telefone, comissaoPct, ativo, observacoes, fotoUrl } = body;

    const influencer = await prisma.influencer.update({
      where: { id },
      data: {
        ...(nome != null && { nome: String(nome).trim() }),
        ...(telefone !== undefined && {
          telefone: telefone?.trim() || null,
        }),
        ...(comissaoPct != null && { comissaoPct: Number(comissaoPct) || 0 }),
        ...(ativo != null && { ativo: Boolean(ativo) }),
        ...(observacoes !== undefined && {
          observacoes: observacoes?.trim() || null,
        }),
        ...(fotoUrl !== undefined && {
          fotoUrl: fotoUrl?.trim() || null,
        }),
      },
    });
    return NextResponse.json(influencer);
  } catch (error) {
    console.error("Erro ao atualizar influencer:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar influencer" },
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
    const pedidosCount = await prisma.pedido.count({
      where: { influencerId: id },
    });
    if (pedidosCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir: ${pedidosCount} pedido(s) vinculados. Desative em vez de excluir.`,
        },
        { status: 409 }
      );
    }
    await prisma.influencer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir influencer:", error);
    return NextResponse.json(
      { error: "Erro ao excluir influencer" },
      { status: 500 }
    );
  }
}
