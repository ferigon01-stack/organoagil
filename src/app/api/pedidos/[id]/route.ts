import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clienteId, valorFrete, volumes, observacoes, itens } = body;

    if (!clienteId || !itens || itens.length === 0) {
      return NextResponse.json(
        { error: "Cliente e pelo menos um item são obrigatórios" },
        { status: 400 }
      );
    }

    // Fetch product details
    const produtoIds = itens.map((item: { produtoId: string }) => item.produtoId);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
    });
    const produtoMap = new Map(produtos.map((p) => [p.id, p]));

    let valorProdutos = 0;
    let pesoTotal = 0;

    const itensData = itens.map(
      (item: { produtoId: string; quantidade: number }) => {
        const produto = produtoMap.get(item.produtoId);
        if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);

        const itemPeso = item.quantidade * produto.peso;
        const subtotal = item.quantidade * produto.precoVenda;
        valorProdutos += subtotal;
        pesoTotal += itemPeso;

        return {
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          pesoTotal: itemPeso,
          precoUnit: produto.precoVenda,
          subtotal,
        };
      }
    );

    const valorTotal = valorProdutos + (Number(valorFrete) || 0);

    // Delete existing items and recreate
    await prisma.itemPedido.deleteMany({ where: { pedidoId: id } });

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        clienteId,
        valorProdutos,
        valorFrete: Number(valorFrete) || 0,
        valorTotal,
        pesoTotal,
        volumes: Number(volumes) || 1,
        observacoes: observacoes || null,
        itens: {
          create: itensData,
        },
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fase, notaFiscal, boleto } = body;

    const updateData: Record<string, unknown> = {};

    if (fase) {
      updateData.fase = fase;
      if (fase === "ENVIO") {
        updateData.dataEnvio = new Date();
      }
      if (fase === "RECEBIDO") {
        updateData.dataRecebimento = new Date();
      }
    }

    if (notaFiscal !== undefined) updateData.notaFiscal = notaFiscal;
    if (boleto !== undefined) updateData.boleto = boleto;

    const pedido = await prisma.pedido.update({
      where: { id },
      data: updateData,
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao atualizar fase:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pedido.delete({ where: { id } });
    return NextResponse.json({ message: "Pedido excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    return NextResponse.json(
      { error: "Erro ao excluir pedido" },
      { status: 500 }
    );
  }
}
