import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  emitirNFe,
  consultarNFe,
  cancelarNFe,
  FocusNFeItem,
  FocusNFePayload,
} from "@/lib/focusnfe";

function onlyDigits(s: string | null | undefined) {
  return (s || "").replace(/\D/g, "");
}

function getEmitenteConfig() {
  return {
    cnpj: "63512791000159",
    nome: "ORGANOAGIL LTDA",
    fantasia: "Organo Ágil",
    inscricaoEstadual: "177691737112",
    regime: 1, // 1 = Simples Nacional
    logradouro: process.env.EMITENTE_LOGRADOURO,
    numero: process.env.EMITENTE_NUMERO,
    bairro: process.env.EMITENTE_BAIRRO,
    municipio: process.env.EMITENTE_MUNICIPIO,
    uf: process.env.EMITENTE_UF,
    cep: onlyDigits(process.env.EMITENTE_CEP),
  };
}

function validateEmitente() {
  const e = getEmitenteConfig();
  const missing: string[] = [];
  if (!e.logradouro) missing.push("EMITENTE_LOGRADOURO");
  if (!e.numero) missing.push("EMITENTE_NUMERO");
  if (!e.bairro) missing.push("EMITENTE_BAIRRO");
  if (!e.municipio) missing.push("EMITENTE_MUNICIPIO");
  if (!e.uf) missing.push("EMITENTE_UF");
  if (!e.cep) missing.push("EMITENTE_CEP");
  return missing;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (pedido.nfeStatus === "autorizada") {
      return NextResponse.json(
        { error: "Este pedido já tem uma NFe autorizada. Cancele antes de reemitir." },
        { status: 400 }
      );
    }

    const missingEmitente = validateEmitente();
    if (missingEmitente.length > 0) {
      return NextResponse.json(
        {
          error: `Dados do emitente não configurados. Adicione nas env vars: ${missingEmitente.join(", ")}`,
        },
        { status: 500 }
      );
    }

    // Only products go into NFe (services would need NFSe)
    const produtos = pedido.itens.filter((item) => item.produto.tipo !== "SERVICO");
    if (produtos.length === 0) {
      return NextResponse.json(
        { error: "Este pedido não tem produtos para emitir NFe" },
        { status: 400 }
      );
    }

    // Validate fiscal data on products (NCM must be 8 digits after stripping)
    const missingFiscal: string[] = [];
    for (const item of produtos) {
      const ncmDigits = (item.produto.ncm || "").replace(/\D/g, "");
      if (ncmDigits.length !== 8) {
        missingFiscal.push(
          `${item.produto.nome}: NCM "${item.produto.ncm || "vazio"}" inválido (precisa ter 8 dígitos)`
        );
      }
    }
    if (missingFiscal.length > 0) {
      return NextResponse.json(
        {
          error: `Produtos com NCM inválido: ${missingFiscal.join("; ")}. Edite os produtos e corrija o NCM.`,
        },
        { status: 400 }
      );
    }

    const emitente = getEmitenteConfig();
    const cliente = pedido.cliente;
    const cnpjCliente = onlyDigits(cliente.cnpj);
    const cpfCliente = onlyDigits(cliente.cpf);

    if (!cnpjCliente && !cpfCliente) {
      return NextResponse.json(
        { error: "Cliente precisa ter CNPJ ou CPF para emitir NFe" },
        { status: 400 }
      );
    }

    if (!cliente.endereco || !cliente.cidade || !cliente.estado || !cliente.cep) {
      return NextResponse.json(
        { error: "Cliente precisa ter endereço, cidade, estado e CEP completos" },
        { status: 400 }
      );
    }

    // Determine CFOP by state (5xxx same state, 6xxx different state)
    const cfopBase = cliente.estado === emitente.uf ? "5102" : "6102";

    const items: FocusNFeItem[] = produtos.map((item, idx) => ({
      numero_item: idx + 1,
      codigo_produto: item.produtoId.slice(-10),
      descricao: item.produto.nome,
      cfop: cfopBase,
      unidade_comercial: item.produto.unidade || "un",
      quantidade_comercial: item.quantidade,
      valor_unitario_comercial: item.precoUnit,
      valor_bruto: item.subtotal,
      unidade_tributavel: item.produto.unidade || "un",
      quantidade_tributavel: item.quantidade,
      valor_unitario_tributavel: item.precoUnit,
      codigo_ncm: (item.produto.ncm || "").replace(/\D/g, ""),
      codigo_cest: item.produto.cest ? item.produto.cest.replace(/\D/g, "") : undefined,
      icms_origem: item.produto.origem || "0",
      icms_situacao_tributaria: "102", // CSOSN 102 - Simples Nacional sem permissão de crédito
      pis_situacao_tributaria: "07", // Operação isenta da contribuição
      cofins_situacao_tributaria: "07",
    }));

    const nfeRef = `ped-${pedido.id}-${Date.now()}`;

    const payload: FocusNFePayload = {
      natureza_operacao: "VENDA",
      data_emissao: new Date().toISOString(),
      tipo_documento: 1,
      finalidade_emissao: 1,
      cnpj_emitente: emitente.cnpj,
      nome_emitente: emitente.nome,
      nome_fantasia_emitente: emitente.fantasia,
      logradouro_emitente: emitente.logradouro!,
      numero_emitente: emitente.numero!,
      bairro_emitente: emitente.bairro!,
      municipio_emitente: emitente.municipio!,
      uf_emitente: emitente.uf!,
      cep_emitente: emitente.cep,
      inscricao_estadual_emitente: emitente.inscricaoEstadual,
      regime_tributario_emitente: emitente.regime,

      cnpj_destinatario: cnpjCliente || undefined,
      cpf_destinatario: !cnpjCliente ? cpfCliente : undefined,
      nome_destinatario: cliente.nome,
      logradouro_destinatario: cliente.endereco,
      numero_destinatario: cliente.numero || "S/N",
      bairro_destinatario: cliente.bairro || undefined,
      municipio_destinatario: cliente.cidade,
      uf_destinatario: cliente.estado,
      cep_destinatario: onlyDigits(cliente.cep),
      indicador_inscricao_estadual_destinatario: cliente.indicadorIE || "9",
      inscricao_estadual_destinatario:
        cliente.indicadorIE === "1" ? onlyDigits(cliente.inscricaoEstadual) : undefined,
      email_destinatario: cliente.email || undefined,

      modalidade_frete: pedido.valorFrete > 0 ? 0 : 9,
      valor_frete: pedido.valorFrete || undefined,
      valor_desconto: pedido.desconto || undefined,
      presenca_comprador: 9,

      items,
    };

    const result = await emitirNFe(nfeRef, payload);

    console.log("[NFe] resposta Focus", {
      pedidoId: id,
      nfeRef,
      httpStatus: result.httpStatus,
      status: result.status,
      mensagem_sefaz: result.mensagem_sefaz,
      mensagem: result.mensagem,
      codigo: result.codigo,
      erros: result.erros,
    });

    const status = (result.status || "processando").toLowerCase();
    const isError =
      status === "erro" ||
      status === "rejeitada" ||
      status === "rejeitado" ||
      status.startsWith("erro_") ||
      status.startsWith("denegad") ||
      status.startsWith("rejeitad") ||
      result.httpStatus >= 400;

    const errosList = Array.isArray(result.erros) && result.erros.length > 0
      ? result.erros
          .map((e) => {
            const ref =
              (e as { campo?: string; codigo?: string }).campo ||
              (e as { codigo?: string }).codigo ||
              "";
            return ref ? `[${ref}] ${e.mensagem}` : e.mensagem;
          })
          .join(" | ")
      : null;

    const mensagemBase = result.mensagem_sefaz || result.mensagem || null;
    let mensagem: string | null =
      mensagemBase && errosList
        ? `${mensagemBase} — ${errosList}`
        : mensagemBase || errosList;

    if (!mensagem && isError) {
      const httpInfo = `HTTP ${result.httpStatus}`;
      const body = result.rawBody || JSON.stringify(result);
      mensagem = `${httpInfo} — ${body}`.slice(0, 1000);
    }

    await prisma.pedido.update({
      where: { id },
      data: {
        nfeRef,
        nfeStatus: status,
        nfeMensagem: mensagem,
      },
    });

    return NextResponse.json({ nfeRef, status, mensagem, isError, raw: result });
  } catch (error) {
    console.error("Erro ao emitir NFe:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erro ao emitir NFe" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedido = await prisma.pedido.findUnique({ where: { id } });
    if (!pedido?.nfeRef) {
      return NextResponse.json({ error: "Pedido sem NFe emitida" }, { status: 400 });
    }

    const result = await consultarNFe(pedido.nfeRef);
    const status = (result.status || pedido.nfeStatus || "").toLowerCase();
    const errosList = Array.isArray(result.erros) && result.erros.length > 0
      ? result.erros.map((e) => `[${e.codigo}] ${e.mensagem}`).join(" | ")
      : null;
    const mensagem =
      result.mensagem_sefaz || result.mensagem || errosList || null;

    const updated = await prisma.pedido.update({
      where: { id },
      data: {
        nfeStatus: status,
        nfeMensagem: mensagem,
        nfeNumero: result.numero ? Number(result.numero) : undefined,
        nfeSerie: result.serie ? Number(result.serie) : undefined,
        nfeChave: result.chave_nfe || undefined,
        nfeDataEmissao: result.data_emissao ? new Date(result.data_emissao) : undefined,
      },
    });

    return NextResponse.json({ ...updated, raw: result });
  } catch (error) {
    console.error("Erro ao consultar NFe:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erro ao consultar NFe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const justificativa: string = body?.justificativa || "";

    if (justificativa.length < 15) {
      return NextResponse.json(
        { error: "Justificativa deve ter no mínimo 15 caracteres" },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.findUnique({ where: { id } });
    if (!pedido?.nfeRef) {
      return NextResponse.json({ error: "Pedido sem NFe emitida" }, { status: 400 });
    }

    const result = await cancelarNFe(pedido.nfeRef, justificativa);
    const status = (result.status || "cancelada").toLowerCase();

    await prisma.pedido.update({
      where: { id },
      data: {
        nfeStatus: status,
        nfeMensagem: justificativa,
      },
    });

    return NextResponse.json({ status, raw: result });
  } catch (error) {
    console.error("Erro ao cancelar NFe:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erro ao cancelar NFe" },
      { status: 500 }
    );
  }
}
