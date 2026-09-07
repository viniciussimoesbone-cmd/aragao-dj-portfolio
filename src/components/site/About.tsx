import { about } from "@/lib/site/content";
import { PlaceholderImage } from "./PlaceholderImage";
import { RevealOnScroll } from "./RevealOnScroll";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-ink-950 py-28 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blood/10 blur-[100px]" aria-hidden />

      <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <RevealOnScroll>
          <SectionHeading
            eyebrow={about.eyebrow}
            title={
              <>
                MAIS QUE UM DJ.
                <br />
                UMA <span className="text-blood">EXPERIÊNCIA.</span>
              </>
            }
          />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">
            {about.paragraph}
          </p>

          <div className="mt-6 max-w-xl rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
              Biografia oficial — em breve
            </p>
            <p className="mt-2 text-sm text-ink-300">{about.bioPlaceholder}</p>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {about.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="heading-display text-3xl text-blood sm:text-4xl">{stat.value}</dd>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-widest text-ink-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/60 lg:aspect-[3/4]">
            <PlaceholderImage label="Foto — retrato do artista" src={about.image} alt="Aragão em apresentação" />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
