import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visitas = await prisma.visita.findMany({
      include: { cliente: true },
      orderBy: { data: "desc" },
    });
    return NextResponse.json(visitas);
  } catch (error) {
    console.error("Erro ao listar visitas:", error);
    return NextResponse.json({ error: "Erro ao listar visitas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, data, observacoes } = body;

    if (!clienteId || !data) {
      return NextResponse.json(
        { error: "Cliente e data são obrigatórios" },
        { status: 400 }
      );
    }

    const visita = await prisma.visita.create({
      data: {
        clienteId,
        data: new Date(data),
        observacoes: observacoes || null,
      },
      include: { cliente: true },
    });

    return NextResponse.json(visita, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar visita:", error);
    return NextResponse.json({ error: "Erro ao criar visita" }, { status: 500 });
  }
}
