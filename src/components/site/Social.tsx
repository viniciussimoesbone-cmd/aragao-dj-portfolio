import Link from "next/link";
import { artist, socials } from "@/lib/site/content";
import { IconInstagram } from "./Icons";
import { RevealOnScroll } from "./RevealOnScroll";

export function Social() {
  return (
    <section className="border-y border-white/10 bg-ink-900 py-20">
      <div className="container-page flex flex-col items-center gap-8 text-center">
        <RevealOnScroll className="flex flex-col items-center gap-4">
          <p className="eyebrow">Redes sociais</p>
          <h2 className="heading-display text-3xl text-white sm:text-4xl">ACOMPANHE O ARAGÃO</h2>
          <p className="text-lg font-semibold text-blood">{artist.instagramHandle}</p>
          <Link href={artist.instagramUrl} target="_blank" rel="noreferrer" className="btn-primary">
            <IconInstagram className="h-4 w-4" />
            Seguir no Instagram
          </Link>
        </RevealOnScroll>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {socials
            .filter((s) => !s.active)
            .map((s) => (
              <span
                key={s.label}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink-500"
              >
                {s.label} · em breve
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}
