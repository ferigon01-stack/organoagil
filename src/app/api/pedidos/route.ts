import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        itens: {
          include: { produto: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return NextResponse.json(
      { error: "Erro ao listar pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, valorFrete, desconto, volumes, observacoes, condicaoPagamento, itens } = body;

    if (!clienteId || !itens || itens.length === 0) {
      return NextResponse.json(
        { error: "Cliente e pelo menos um item são obrigatórios" },
        { status: 400 }
      );
    }

    // Fetch product details for calculations
    const produtoIds = itens.map((item: { produtoId: string }) => item.produtoId);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
    });
    const produtoMap = new Map(produtos.map((p) => [p.id, p]));

    let valorProdutos = 0;
    let pesoTotal = 0;

    const itensData = itens.map(
      (item: { produtoId: string; quantidade: number; precoUnit?: number }) => {
        const produto = produtoMap.get(item.produtoId);
        if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);

        const precoUnit =
          item.precoUnit != null && !isNaN(Number(item.precoUnit))
            ? Number(item.precoUnit)
            : produto.precoVenda;
        const itemPeso = item.quantidade * produto.peso;
        const subtotal = item.quantidade * precoUnit;
        valorProdutos += subtotal;
        pesoTotal += itemPeso;

        return {
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          pesoTotal: itemPeso,
          precoUnit,
          subtotal,
        };
      }
    );

    const descontoValue = Math.max(0, Number(desconto) || 0);
    const valorTotal = Math.max(
      0,
      valorProdutos + (Number(valorFrete) || 0) - descontoValue
    );

    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        valorProdutos,
        valorFrete: Number(valorFrete) || 0,
        desconto: descontoValue,
        valorTotal,
        pesoTotal,
        volumes: Number(volumes) || 1,
        observacoes: observacoes || null,
        condicaoPagamento: condicaoPagamento || null,
        itens: {
          create: itensData,
        },
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    // Update cliente.ultimaCompra
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { ultimaCompra: new Date() },
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}
