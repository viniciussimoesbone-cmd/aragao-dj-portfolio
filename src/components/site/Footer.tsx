import Link from "next/link";
import { artist, navLinks } from "@/lib/site/content";
import { IconInstagram, IconWhatsapp } from "./Icons";
import { buildWhatsappLink } from "@/lib/site/whatsapp";

export function Footer() {
  return (
    <footer className="bg-ink-950 pb-10 pt-16">
      <div className="container-page">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide text-white">
              ARAG<span className="text-blood">Ã</span>O
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
              {artist.role}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest text-ink-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 text-sm text-ink-300">
            <Link
              href={artist.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <IconInstagram className="h-4 w-4" />
              {artist.instagramHandle}
            </Link>
            <Link
              href={buildWhatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <IconWhatsapp className="h-4 w-4" />
              {artist.whatsappNumber}
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-500 sm:text-left">
          © {new Date().getFullYear()} Aragão. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
