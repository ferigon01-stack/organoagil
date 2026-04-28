import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { ManualMarcaPDF } from "@/components/ManualMarcaPDF";

export const runtime = "nodejs";

function fileToDataUrl(relativePath: string, mime: string) {
  const abs = path.join(process.cwd(), "public", relativePath);
  const buf = fs.readFileSync(abs);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET() {
  try {
    const logoSrc = fileToDataUrl("logo.jpeg", "image/jpeg");
    const bioguardSrc = fileToDataUrl("produtos/bioguard.jpeg", "image/jpeg");

    const buffer = await renderToBuffer(
      ManualMarcaPDF({ logoSrc, bioguardSrc })
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'inline; filename="organoagil-manual-de-marca.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar manual de marca:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}
