import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { pedidos: true },
        },
      },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao listar clientes." },
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

    const cliente = await prisma.cliente.create({
      data: {
        nome: body.nome.trim(),
        cpf: body.cpf?.trim() || null,
        cnpj: body.cnpj?.trim() || null,
        inscricaoEstadual: body.inscricaoEstadual?.trim() || null,
        email: body.email?.trim() || null,
        telefone: body.telefone?.trim() || null,
        endereco: body.endereco?.trim() || null,
        bairro: body.bairro?.trim() || null,
        cidade: body.cidade?.trim() || null,
        estado: body.estado?.trim() || null,
        cep: body.cep?.trim() || null,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente." },
      { status: 500 }
    );
  }
}
