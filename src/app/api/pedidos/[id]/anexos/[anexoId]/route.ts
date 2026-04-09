import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; anexoId: string }> }
) {
  try {
    const { anexoId } = await params;
    const anexo = await prisma.anexo.findUnique({ where: { id: anexoId } });

    if (!anexo) {
      return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 });
    }

    const buffer = Buffer.from(anexo.dados, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": anexo.tipo,
        "Content-Disposition": `inline; filename="${anexo.nome}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("Erro ao baixar anexo:", error);
    return NextResponse.json({ error: "Erro ao baixar anexo" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; anexoId: string }> }
) {
  try {
    const { anexoId } = await params;
    await prisma.anexo.delete({ where: { id: anexoId } });
    return NextResponse.json({ message: "Anexo excluído" });
  } catch (error) {
    console.error("Erro ao excluir anexo:", error);
    return NextResponse.json({ error: "Erro ao excluir anexo" }, { status: 500 });
  }
}
