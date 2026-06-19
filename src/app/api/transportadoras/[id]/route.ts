import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transportadora = await prisma.transportadora.findUnique({
      where: { id },
    });
    if (!transportadora) {
      return NextResponse.json(
        { error: "Transportadora não encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json(transportadora);
  } catch (error) {
    console.error("Erro ao buscar transportadora:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transportadora." },
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

    if (!body.nome || !body.nome.trim()) {
      return NextResponse.json(
        { error: "O campo nome é obrigatório." },
        { status: 400 }
      );
    }

    const existing = await prisma.transportadora.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Transportadora não encontrada." },
        { status: 404 }
      );
    }

    const transportadora = await prisma.transportadora.update({
      where: { id },
      data: {
        nome: body.nome.trim(),
        cnpj: body.cnpj?.trim() || null,
        inscricaoEstadual: body.inscricaoEstadual?.trim() || null,
        endereco: body.endereco?.trim() || null,
        numero: body.numero?.trim() || null,
        bairro: body.bairro?.trim() || null,
        cidade: body.cidade?.trim() || null,
        estado: body.estado?.trim() || null,
        cep: body.cep?.trim() || null,
        telefone: body.telefone?.trim() || null,
      },
    });

    return NextResponse.json(transportadora);
  } catch (error) {
    console.error("Erro ao atualizar transportadora:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar transportadora." },
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

    const existing = await prisma.transportadora.findUnique({
      where: { id },
      include: { _count: { select: { pedidos: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transportadora não encontrada." },
        { status: 404 }
      );
    }

    if (existing._count.pedidos > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir: há ${existing._count.pedidos} pedido(s) vinculado(s) a esta transportadora.`,
        },
        { status: 400 }
      );
    }

    await prisma.transportadora.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir transportadora:", error);
    return NextResponse.json(
      { error: "Erro ao excluir transportadora." },
      { status: 500 }
    );
  }
}
