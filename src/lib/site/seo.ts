import { artist, eventTypes, experienceItems, navLinks } from "./content";

export const siteUrl = "https://aragaodj.com.br";

export const siteKeywords = [
  "Aragão DJ",
  "DJ Aragão",
  "contratar DJ",
  "DJ para festa",
  "DJ para casamento",
  "DJ para formatura",
  "DJ para evento corporativo",
  "DJ e produtor musical",
  "@aragaodj",
];

// Dados estruturados (JSON-LD) usados para SEO tradicional e para dar contexto
// factual claro a motores de resposta/IA (AEO/GEO): quem é o artista, o que
// faz, onde contratar e quais páginas existem no site.
export function buildStructuredData() {
  const personId = `${siteUrl}/#pessoa`;
  const websiteId = `${siteUrl}/#site`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: artist.fullName,
        alternateName: artist.stageName,
        jobTitle: artist.role,
        url: siteUrl,
        sameAs: [artist.instagramUrl],
        knowsAbout: experienceItems.map((item) => item.category),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: `${artist.stageName} | ${artist.role}`,
        inLanguage: "pt-BR",
        publisher: { "@id": personId },
      },
      {
        "@type": "Service",
        serviceType: "Contratação de DJ e produtor musical",
        provider: { "@id": personId },
        areaServed: "BR",
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: artist.whatsappLink,
          servicePhone: artist.whatsappNumber,
        },
        audience: {
          "@type": "Audience",
          audienceType: eventTypes.join(", "),
        },
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${siteUrl}/#navegacao`,
        name: navLinks.map((link) => link.label),
        url: navLinks.map((link) => `${siteUrl}/${link.href}`),
      },
    ],
  };
}
