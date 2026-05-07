import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OrganoÁgil — Proteção contra insetos com BioGuard",
  description:
    "BioGuard 500ml: inseticida híbrido orgânico, ação imediata e residual de até 3 dias. Cuidado com pets e família.",
  manifest: "/manifest-loja.json",
  openGraph: {
    title: "OrganoÁgil — Proteção contra insetos com BioGuard",
    description:
      "BioGuard 500ml: inseticida híbrido orgânico, ação imediata e residual de até 3 dias. Cuidado com pets e família.",
    siteName: "OrganoÁgil",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OrganoÁgil — BioGuard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OrganoÁgil — Proteção contra insetos com BioGuard",
    description:
      "BioGuard 500ml: ação imediata e residual de até 3 dias. Seguro para pets e família.",
    images: ["/og-image.png"],
  },
  themeColor: "#0a1f12",
};

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a1f12" }}
    >
      {children}
    </div>
  );
}
