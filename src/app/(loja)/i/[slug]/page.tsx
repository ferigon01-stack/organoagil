import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoreClient from "./StoreClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const influencer = await prisma.influencer.findUnique({ where: { slug } });
  if (!influencer || !influencer.ativo) {
    return { title: "OrganoÁgil" };
  }
  const title = `OrganoÁgil — Indicação de ${influencer.nome}`;
  const description = `${influencer.nome} indica o BioGuard, da OrganoÁgil: proteção contra insetos com ação imediata, segura para pets e família.`;
  const ogImage = influencer.fotoUrl || "/og-image.png";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: "OrganoÁgil",
      images: [{ url: ogImage, alt: `Indicação de ${influencer.nome}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LojaInfluencerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const influencer = await prisma.influencer.findUnique({ where: { slug } });
  if (!influencer || !influencer.ativo) notFound();

  const produtos = await prisma.produto.findMany({
    where: { vitrineLoja: true, tipo: "PRODUTO" },
    orderBy: { nome: "asc" },
  });

  return (
    <StoreClient
      influencer={{
        slug: influencer.slug,
        nome: influencer.nome,
        fotoUrl: influencer.fotoUrl,
        descontoPct: influencer.descontoPct,
      }}
      produtos={produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        precoVenda: p.precoVenda,
        unidade: p.unidade,
        imagemUrl: p.imagemUrl,
      }))}
    />
  );
}
