import { about } from "@/lib/site/content";
import { PlaceholderImage } from "./PlaceholderImage";
import { RevealOnScroll } from "./RevealOnScroll";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-ink-950 py-28 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-gold/10 blur-[100px]" aria-hidden />

      <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <RevealOnScroll>
          <SectionHeading
            eyebrow={about.eyebrow}
            title={
              <>
                MAIS QUE UM DJ.
                <br />
                UMA{" "}
                <span className="bg-[linear-gradient(120deg,#f8e7b8_0%,#c9a24b_55%,#8a6a2a_100%)] bg-clip-text text-transparent">
                  EXPERIÊNCIA.
                </span>
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

          <dl className="mt-12 grid max-w-xl grid-cols-[1.3fr_1fr] grid-rows-2 gap-[2px] border-t border-white/10 pt-8">
            {about.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={
                  i === 0
                    ? "row-span-2 flex flex-col justify-center bg-white/[0.03] p-6"
                    : "bg-white/[0.03] p-5"
                }
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd
                  className={
                    i === 0
                      ? "heading-display bg-[linear-gradient(120deg,#f8e7b8_0%,#c9a24b_55%,#8a6a2a_100%)] bg-clip-text text-4xl text-transparent sm:text-5xl"
                      : "heading-display text-2xl text-gold sm:text-3xl"
                  }
                >
                  {stat.value}
                </dd>
                <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-widest text-ink-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="relative">
            <div
              className="absolute -bottom-4 -right-4 -top-4 left-4 border border-gold/50"
              aria-hidden
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden shadow-2xl shadow-black/60 lg:aspect-[3/4]">
              <PlaceholderImage label="Foto — retrato do artista" src={about.image} alt="Aragão em apresentação" />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
