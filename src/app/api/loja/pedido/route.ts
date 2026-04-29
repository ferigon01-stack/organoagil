import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ItemInput {
  produtoId: string;
  quantidade: number;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      cliente,
      itens,
      observacoes,
    }: {
      slug?: string;
      cliente?: {
        nome?: string;
        telefone?: string;
        cep?: string;
        endereco?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        estado?: string;
      };
      itens?: ItemInput[];
      observacoes?: string;
    } = body || {};

    if (
      !slug ||
      !cliente?.nome ||
      !cliente?.telefone ||
      !cliente?.cep ||
      !cliente?.endereco ||
      !cliente?.numero ||
      !cliente?.bairro ||
      !cliente?.cidade ||
      !cliente?.estado
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios do endereço." },
        { status: 400 }
      );
    }
    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: "Adicione ao menos um produto ao pedido." },
        { status: 400 }
      );
    }

    const influencer = await prisma.influencer.findUnique({ where: { slug } });
    if (!influencer || !influencer.ativo) {
      return NextResponse.json(
        { error: "Link inválido ou inativo." },
        { status: 404 }
      );
    }

    const produtoIds = itens.map((i) => i.produtoId);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds }, vitrineLoja: true },
    });
    if (produtos.length !== produtoIds.length) {
      return NextResponse.json(
        { error: "Algum produto não está disponível na loja." },
        { status: 400 }
      );
    }
    const produtoMap = new Map(produtos.map((p) => [p.id, p]));

    let valorProdutos = 0;
    let pesoTotal = 0;
    const itensData = itens.map((item) => {
      const produto = produtoMap.get(item.produtoId)!;
      const quantidade = Math.max(1, Math.floor(Number(item.quantidade) || 1));
      const itemPeso = quantidade * produto.peso;
      const subtotal = quantidade * produto.precoVenda;
      valorProdutos += subtotal;
      pesoTotal += itemPeso;
      return {
        produtoId: produto.id,
        quantidade,
        pesoTotal: itemPeso,
        precoUnit: produto.precoVenda,
        subtotal,
      };
    });

    const telefoneDigits = onlyDigits(cliente.telefone);
    const cepDigits = onlyDigits(cliente.cep);

    const dadosCliente = {
      nome: cliente.nome.trim(),
      telefone: cliente.telefone.trim(),
      cep: cepDigits || null,
      endereco: cliente.endereco?.trim() || null,
      numero: cliente.numero?.trim() || null,
      bairro: cliente.bairro?.trim() || null,
      cidade: cliente.cidade?.trim() || null,
      estado: cliente.estado?.trim().toUpperCase() || null,
    };

    let clienteRow = telefoneDigits
      ? await prisma.cliente.findFirst({
          where: { telefone: { contains: telefoneDigits } },
        })
      : null;

    if (clienteRow) {
      clienteRow = await prisma.cliente.update({
        where: { id: clienteRow.id },
        data: dadosCliente,
      });
    } else {
      clienteRow = await prisma.cliente.create({ data: dadosCliente });
    }

    const descontoPct = Math.max(0, Math.min(100, influencer.descontoPct || 0));
    const desconto = Number(((valorProdutos * descontoPct) / 100).toFixed(2));
    const valorTotal = Math.max(0, valorProdutos - desconto);

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: clienteRow.id,
        influencerId: influencer.id,
        valorProdutos,
        desconto,
        valorTotal,
        pesoTotal,
        volumes: 1,
        observacoes: observacoes?.trim() || null,
        itens: { create: itensData },
      },
      include: { itens: { include: { produto: true } } },
    });

    const whatsappDono = onlyDigits(process.env.WHATSAPP_DONO || "");
    const linhasItens = pedido.itens
      .map(
        (i) =>
          `• ${i.quantidade}x ${i.produto.nome} — ${formatBRL(i.subtotal)}`
      )
      .join("\n");

    const cidadeUf = [clienteRow.cidade, clienteRow.estado]
      .filter(Boolean)
      .join("/");

    const enderecoLinha = [
      clienteRow.endereco,
      clienteRow.numero ? `nº ${clienteRow.numero}` : "",
      cliente.complemento?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const cepFmt = clienteRow.cep
      ? `${clienteRow.cep.slice(0, 5)}-${clienteRow.cep.slice(5)}`
      : "";

    const linhasValor =
      desconto > 0
        ? [
            `Subtotal: ${formatBRL(valorProdutos)}`,
            `Desconto via ${influencer.nome} (${descontoPct.toFixed(0)}%): -${formatBRL(desconto)}`,
            `*Total: ${formatBRL(valorTotal)}*`,
            `(frete a combinar)`,
          ]
        : [
            `Subtotal: *${formatBRL(valorProdutos)}*`,
            `(frete a combinar)`,
          ];

    const mensagem = [
      `Olá! Vim pela *${influencer.nome}* 💚`,
      ``,
      `*Pedido #${pedido.numero}*`,
      linhasItens,
      ``,
      ...linhasValor,
      ``,
      `*Cliente:* ${clienteRow.nome}`,
      `*Telefone:* ${clienteRow.telefone || ""}`,
      ``,
      `*Endereço de entrega:*`,
      enderecoLinha,
      clienteRow.bairro ? `Bairro: ${clienteRow.bairro}` : "",
      cidadeUf ? `${cidadeUf}` : "",
      cepFmt ? `CEP: ${cepFmt}` : "",
      observacoes ? `\n*Obs:* ${observacoes}` : "",
      ``,
      `Como faço o pagamento?`,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = whatsappDono
      ? `https://wa.me/${whatsappDono}?text=${encodeURIComponent(mensagem)}`
      : null;

    return NextResponse.json({
      numero: pedido.numero,
      pedidoId: pedido.id,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Erro ao criar pedido da loja:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido. Tente novamente." },
      { status: 500 }
    );
  }
}
