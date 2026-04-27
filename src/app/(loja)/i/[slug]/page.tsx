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
    return { title: "Organo Ágil" };
  }
  return {
    title: `Compre com ${influencer.nome} — Organo Ágil`,
    description: `Faça seu pedido Organo Ágil pela ${influencer.nome}.`,
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
