import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { pedidos: true },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente." },
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

    const existing = await prisma.cliente.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: body.nome.trim(),
        cpf: body.cpf?.trim() || null,
        cnpj: body.cnpj?.trim() || null,
        inscricaoEstadual: body.inscricaoEstadual?.trim() || null,
        indicadorIE: body.indicadorIE || "9",
        email: body.email?.trim() || null,
        telefone: body.telefone?.trim() || null,
        endereco: body.endereco?.trim() || null,
        numero: body.numero?.trim() || null,
        bairro: body.bairro?.trim() || null,
        cidade: body.cidade?.trim() || null,
        estado: body.estado?.trim() || null,
        codigoIbge: body.codigoIbge?.trim() || null,
        cep: body.cep?.trim() || null,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente." },
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

    const existing = await prisma.cliente.findUnique({
      where: { id },
      include: { _count: { select: { pedidos: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    if (existing._count.pedidos > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir este cliente pois ele possui ${existing._count.pedidos} pedido(s) vinculado(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.cliente.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json(
      { error: "Erro ao excluir cliente." },
      { status: 500 }
    );
  }
}
