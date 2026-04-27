import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const influencers = await prisma.influencer.findMany({
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
      include: {
        _count: { select: { pedidos: true } },
      },
    });
    return NextResponse.json(influencers);
  } catch (error) {
    console.error("Erro ao listar influencers:", error);
    return NextResponse.json(
      { error: "Erro ao listar influencers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, slug, telefone, comissaoPct, observacoes, fotoUrl } = body;

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const finalSlug = slugify(slug || nome);
    if (!finalSlug) {
      return NextResponse.json(
        { error: "Não foi possível gerar slug a partir do nome." },
        { status: 400 }
      );
    }

    const existente = await prisma.influencer.findUnique({
      where: { slug: finalSlug },
    });
    if (existente) {
      return NextResponse.json(
        { error: `Já existe um link "/i/${finalSlug}". Escolha outro.` },
        { status: 409 }
      );
    }

    const influencer = await prisma.influencer.create({
      data: {
        nome: nome.trim(),
        slug: finalSlug,
        telefone: telefone?.trim() || null,
        comissaoPct: Number(comissaoPct) || 0,
        observacoes: observacoes?.trim() || null,
        fotoUrl: fotoUrl?.trim() || null,
      },
    });
    return NextResponse.json(influencer, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar influencer:", error);
    return NextResponse.json(
      { error: "Erro ao criar influencer" },
      { status: 500 }
    );
  }
}
