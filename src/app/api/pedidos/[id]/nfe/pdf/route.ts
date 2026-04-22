import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { baixarDanfe } from "@/lib/focusnfe";

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

    const buffer = await baixarDanfe(pedido.nfeRef);
    if (!buffer) {
      return NextResponse.json(
        { error: "DANFE indisponível. A NFe pode ainda estar em processamento." },
        { status: 404 }
      );
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="nfe-${pedido.numero}.pdf"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (error) {
    console.error("Erro ao baixar DANFE:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erro ao baixar DANFE" },
      { status: 500 }
    );
  }
}
