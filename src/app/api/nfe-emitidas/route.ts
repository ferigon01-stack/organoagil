import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// A chave da NFe (44 dígitos) embute AAMM logo após o código da UF:
// cUF(2) + AAMM(4) + CNPJ(14) + ... — é a competência oficial da nota.
function competenciaDaChave(chave: string | null): { mes: number; ano: number } | null {
  const digits = (chave || "").replace(/\D/g, "");
  if (digits.length !== 44) return null;
  const ano = 2000 + Number(digits.slice(2, 4));
  const mes = Number(digits.slice(4, 6));
  if (mes < 1 || mes > 12) return null;
  return { mes, ano };
}

// Competência de uma nota: prioriza a chave (sempre presente e autoritativa),
// cai pra data de emissão e, por fim, pra data de criação do pedido.
function competenciaDaNota(nota: {
  nfeChave: string | null;
  nfeDataEmissao: Date | null;
  createdAt: Date;
}): { mes: number; ano: number } {
  const daChave = competenciaDaChave(nota.nfeChave);
  if (daChave) return daChave;
  const base = nota.nfeDataEmissao ?? nota.createdAt;
  return { mes: base.getMonth() + 1, ano: base.getFullYear() };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = Number(searchParams.get("mes"));
    const ano = Number(searchParams.get("ano"));
    const filtraPeriodo = mes >= 1 && mes <= 12 && ano > 0;

    const pedidos = await prisma.pedido.findMany({
      // Só notas que de fato foram emitidas (ganharam número na SEFAZ)
      where: { nfeNumero: { not: null } },
      select: {
        id: true,
        numero: true,
        valorTotal: true,
        nfeStatus: true,
        nfeNumero: true,
        nfeSerie: true,
        nfeChave: true,
        nfeDataEmissao: true,
        createdAt: true,
        cliente: { select: { nome: true, cpf: true, cnpj: true } },
      },
    });

    const notas = pedidos
      .map((p) => {
        const comp = competenciaDaNota(p);
        return {
          id: p.id,
          numero: p.numero,
          valorTotal: p.valorTotal,
          nfeStatus: p.nfeStatus,
          nfeNumero: p.nfeNumero,
          nfeSerie: p.nfeSerie,
          nfeChave: p.nfeChave,
          nfeDataEmissao: p.nfeDataEmissao,
          cliente: p.cliente,
          competenciaMes: comp.mes,
          competenciaAno: comp.ano,
        };
      })
      .filter((n) => !filtraPeriodo || (n.competenciaMes === mes && n.competenciaAno === ano))
      // mais recentes primeiro: por competência, depois por número da NFe
      .sort((a, b) => {
        if (a.competenciaAno !== b.competenciaAno) return b.competenciaAno - a.competenciaAno;
        if (a.competenciaMes !== b.competenciaMes) return b.competenciaMes - a.competenciaMes;
        return (b.nfeNumero ?? 0) - (a.nfeNumero ?? 0);
      });

    return NextResponse.json(notas);
  } catch (error) {
    console.error("Erro ao listar NFs emitidas:", error);
    return NextResponse.json(
      { error: "Erro ao listar NFs emitidas" },
      { status: 500 }
    );
  }
}
