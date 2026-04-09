import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Organo Ágil - Sistema de Gestão",
  description: "Sistema de gestão Organo Ágil - Controle de clientes, produtos, pedidos e financeiro",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Organo Ágil",
  },
  openGraph: {
    title: "Organo Ágil - Sistema de Gestão",
    description: "Controle de clientes, produtos, pedidos e financeiro",
    url: "https://organoagil.vercel.app",
    siteName: "Organo Ágil",
    images: [
      {
        url: "https://organoagil.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Organo Ágil",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
