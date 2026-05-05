import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { baixarXml } from "@/lib/focusnfe";

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

    const xml = await baixarXml(pedido.nfeRef);
    if (!xml) {
      return NextResponse.json(
        { error: "XML indisponível. A NFe pode ainda estar em processamento." },
        { status: 404 }
      );
    }

    const filename = pedido.nfeChave
      ? `${pedido.nfeChave}.xml`
      : `nfe-${pedido.numero}.xml`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao baixar XML:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erro ao baixar XML" },
      { status: 500 }
    );
  }
}
