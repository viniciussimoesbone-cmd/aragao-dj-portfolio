import { artist } from "./content";

export function buildWhatsappLink(message?: string) {
  const text = message ?? artist.whatsappDefaultMessage;
  return `${artist.whatsappLink}?text=${encodeURIComponent(text)}`;
}
