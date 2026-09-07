import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, Inter } from "next/font/google";
import { WhatsappFloatingButton } from "@/components/site/WhatsappFloatingButton";
import { artist } from "@/lib/site/content";
import { buildStructuredData, siteKeywords, siteUrl } from "@/lib/site/seo";
import "./globals.css";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const title = `${artist.stageName} | ${artist.role}`;
const description =
  "Aragão é DJ e produtor musical. Conheça seu trabalho, agenda, experiências e solicite uma contratação.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${artist.stageName}`,
  },
  description,
  keywords: siteKeywords,
  authors: [{ name: artist.fullName, url: artist.instagramUrl }],
  creator: artist.fullName,
  publisher: artist.stageName,
  category: "music",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: artist.stageName,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: `${artist.stageName} — ${artist.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og-cover.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = buildStructuredData();

  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <WhatsappFloatingButton />
      </body>
    </html>
  );
}
