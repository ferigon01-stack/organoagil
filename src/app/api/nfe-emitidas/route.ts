import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultarNFe } from "@/lib/focusnfe";

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

function isAutorizada(status: string | null) {
  const s = (status || "").toLowerCase();
  return s === "autorizada" || s === "autorizado";
}

function isCancelada(status: string | null) {
  const s = (status || "").toLowerCase();
  return s === "cancelada" || s === "cancelado";
}

// Uma nota deve ir pro escritório quando foi autorizada ou cancelada na SEFAZ —
// não dependemos mais do número já estar gravado no banco.
function contaComoEmitida(status: string | null) {
  return isAutorizada(status) || isCancelada(status);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = Number(searchParams.get("mes"));
    const ano = Number(searchParams.get("ano"));
    const filtraPeriodo = mes >= 1 && mes <= 12 && ano > 0;

    const pedidos = await prisma.pedido.findMany({
      // Notas que foram pra SEFAZ (autorizadas/canceladas), ou qualquer uma que
      // já tenha número gravado. Não filtramos só por nfeNumero pra não esconder
      // notas autorizadas cujo "Atualizar status" nunca rodou (ficam sem número).
      where: {
        OR: [
          { nfeNumero: { not: null } },
          { nfeStatus: { in: ["autorizada", "autorizado", "cancelada", "cancelado"] } },
        ],
      },
      select: {
        id: true,
        numero: true,
        valorTotal: true,
        nfeStatus: true,
        nfeRef: true,
        nfeNumero: true,
        nfeSerie: true,
        nfeChave: true,
        nfeDataEmissao: true,
        createdAt: true,
        cliente: { select: { nome: true, cpf: true, cnpj: true } },
      },
    });

    // Auto-reconciliação: pra notas emitidas que ainda estão sem chave/número
    // (o "Atualizar status" nunca rodou), busca os dados reais no Focus e grava.
    // Best-effort: se o Focus falhar, seguimos com o que temos no banco.
    await Promise.all(
      pedidos.map(async (p) => {
        const precisaReconciliar =
          contaComoEmitida(p.nfeStatus) &&
          p.nfeRef != null &&
          (p.nfeChave == null || p.nfeNumero == null);
        if (!precisaReconciliar) return;
        try {
          const result = await consultarNFe(p.nfeRef!);
          const numero = result.numero ? Number(result.numero) : null;
          const chave = result.chave_nfe || null;
          if (numero == null && chave == null) return;
          const serie = result.serie ? Number(result.serie) : null;
          const dataEmissao = result.data_emissao ? new Date(result.data_emissao) : null;
          await prisma.pedido.update({
            where: { id: p.id },
            data: {
              nfeNumero: numero ?? undefined,
              nfeSerie: serie ?? undefined,
              nfeChave: chave ?? undefined,
              nfeDataEmissao: dataEmissao ?? undefined,
            },
          });
          // reflete no objeto em memória pra já sair certo nesta resposta
          if (numero != null) p.nfeNumero = numero;
          if (serie != null) p.nfeSerie = serie;
          if (chave != null) p.nfeChave = chave;
          if (dataEmissao != null) p.nfeDataEmissao = dataEmissao;
        } catch (err) {
          console.error(`Falha ao reconciliar NFe do pedido ${p.numero}:`, err);
        }
      })
    );

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
