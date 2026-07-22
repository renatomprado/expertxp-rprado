import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./credit.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const siteUrl = "https://expertxp.rprado.dev.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Agenda Expert XP 2026",
  description: "Consulte, filtre e favorite as sessões da Expert XP 2026.",
  applicationName: "Agenda Expert XP 2026",
  authors: [{ name: "Renato Prado", url: "https://rprado.dev.br" }],
  creator: "Renato Prado",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "Agenda Expert XP 2026",
    description: "Encontre sua próxima sessão e monte sua agenda de favoritos.",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Agenda Expert XP 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agenda Expert XP 2026",
    description: "Encontre sua próxima sessão e monte sua agenda de favoritos.",
    images: [`${siteUrl}/og.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070b18",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={geist.variable}>
        <div className="creator-strip">
          <span>Desenvolvido por</span>
          <a href="https://rprado.dev.br" target="_blank" rel="noopener noreferrer">Renato Prado <b aria-hidden="true">↗</b></a>
        </div>
        {children}
      </body>
    </html>
  );
}
