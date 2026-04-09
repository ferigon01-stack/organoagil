import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anexos = await prisma.anexo.findMany({
      where: { pedidoId: id },
      select: { id: true, nome: true, tipo: true, tamanho: true, fase: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(anexos);
  } catch (error) {
    console.error("Erro ao buscar anexos:", error);
    return NextResponse.json({ error: "Erro ao buscar anexos" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fase = formData.get("fase") as string;

    if (!file) {
      return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 5MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const anexo = await prisma.anexo.create({
      data: {
        pedidoId: id,
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        dados: base64,
        fase: fase || "PEDIDO",
      },
    });

    return NextResponse.json({
      id: anexo.id,
      nome: anexo.nome,
      tipo: anexo.tipo,
      tamanho: anexo.tamanho,
      fase: anexo.fase,
      createdAt: anexo.createdAt,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
