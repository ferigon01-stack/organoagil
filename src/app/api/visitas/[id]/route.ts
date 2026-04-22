import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visita = await prisma.visita.findUnique({
      where: { id },
      include: { cliente: true },
    });

    if (!visita) {
      return NextResponse.json({ error: "Visita não encontrada" }, { status: 404 });
    }

    return NextResponse.json(visita);
  } catch (error) {
    console.error("Erro ao buscar visita:", error);
    return NextResponse.json({ error: "Erro ao buscar visita" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clienteId, data, observacoes } = body;

    const visita = await prisma.visita.update({
      where: { id },
      data: {
        clienteId,
        data: data ? new Date(data) : undefined,
        observacoes: observacoes || null,
      },
      include: { cliente: true },
    });

    return NextResponse.json(visita);
  } catch (error) {
    console.error("Erro ao atualizar visita:", error);
    return NextResponse.json({ error: "Erro ao atualizar visita" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.visita.delete({ where: { id } });
    return NextResponse.json({ message: "Visita excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir visita:", error);
    return NextResponse.json({ error: "Erro ao excluir visita" }, { status: 500 });
  }
}
