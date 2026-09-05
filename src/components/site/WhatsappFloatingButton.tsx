import Link from "next/link";
import { buildWhatsappLink } from "@/lib/site/whatsapp";
import { IconWhatsapp } from "./Icons";

export function WhatsappFloatingButton() {
  return (
    <Link
      href={buildWhatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="safe-b safe-r fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blood text-white shadow-lg shadow-black/50 transition-transform duration-300 hover:scale-105 active:scale-95"
    >
      <IconWhatsapp className="h-6 w-6" />
    </Link>
  );
}
