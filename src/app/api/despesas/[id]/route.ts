import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.despesa.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Despesa excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return NextResponse.json(
      { error: "Erro ao excluir despesa" },
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
    const { descricao, valor, categoria, data } = body;

    const updateData: Record<string, unknown> = {};
    if (descricao !== undefined) updateData.descricao = descricao;
    if (valor !== undefined) updateData.valor = Number(valor);
    if (categoria !== undefined) updateData.categoria = categoria;
    if (data !== undefined) {
      const dataDate = new Date(data);
      updateData.data = dataDate;
      updateData.mes = dataDate.getMonth() + 1;
      updateData.ano = dataDate.getFullYear();
    }

    const despesa = await prisma.despesa.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(despesa);
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar despesa" },
      { status: 500 }
    );
  }
}
