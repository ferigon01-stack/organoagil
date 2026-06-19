import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transportadoras = await prisma.transportadora.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: { select: { pedidos: true } },
      },
    });
    return NextResponse.json(transportadoras);
  } catch (error) {
    console.error("Erro ao listar transportadoras:", error);
    return NextResponse.json(
      { error: "Erro ao listar transportadoras." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nome || !body.nome.trim()) {
      return NextResponse.json(
        { error: "O campo nome é obrigatório." },
        { status: 400 }
      );
    }

    const transportadora = await prisma.transportadora.create({
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

    return NextResponse.json(transportadora, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transportadora:", error);
    return NextResponse.json(
      { error: "Erro ao criar transportadora." },
      { status: 500 }
    );
  }
}
