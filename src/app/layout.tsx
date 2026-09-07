import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Manrope } from "next/font/google";
import { WhatsappFloatingButton } from "@/components/site/WhatsappFloatingButton";
import "./globals.css";

const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = "https://aragaodj.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Aragão | DJ & Producer",
  description:
    "Aragão é DJ e produtor musical. Conheça seu trabalho, agenda, experiências e solicite uma contratação.",
  openGraph: {
    title: "Aragão | DJ & Producer",
    description:
      "Aragão é DJ e produtor musical. Conheça seu trabalho, agenda, experiências e solicite uma contratação.",
    url: siteUrl,
    siteName: "Aragão",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Aragão — DJ & Producer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aragão | DJ & Producer",
    description:
      "Aragão é DJ e produtor musical. Conheça seu trabalho, agenda, experiências e solicite uma contratação.",
    images: ["/images/og-cover.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        {children}
        <WhatsappFloatingButton />
      </body>
    </html>
  );
}
