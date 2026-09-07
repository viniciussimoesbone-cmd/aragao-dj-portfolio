import { experienceItems } from "@/lib/site/content";
import { PlaceholderImage } from "./PlaceholderImage";
import { RevealOnScroll } from "./RevealOnScroll";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  return (
    <section id="experiencia" className="bg-ink-900 py-28 sm:py-32">
      <div className="container-page">
        <RevealOnScroll>
          <SectionHeading eyebrow="Portfólio" title="EXPERIÊNCIA" />
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-2 gap-[2px] lg:grid-cols-4 lg:auto-rows-[180px]">
          {experienceItems.map((item, i) => (
            <RevealOnScroll
              key={item.category}
              delay={(i % 4) * 80}
              className={item.featured ? "col-span-2 row-span-2" : undefined}
            >
              <article className="group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden bg-ink-950 p-6">
                {item.image && (
                  <>
                    <PlaceholderImage
                      label={`Foto — ${item.category}`}
                      src={item.image}
                      className="opacity-25 transition-opacity duration-500 group-hover:opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" />
                  </>
                )}

                <span className="relative font-display text-xs tracking-[0.1em] text-ink-500">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative">
                  <h3 className={`heading-display text-white ${item.featured ? "text-3xl sm:text-4xl" : "text-xl"}`}>
                    {item.category}
                  </h3>
                  {(item.featured || item.image) && (
                    <p className="mt-2 max-w-xs text-sm text-ink-300">{item.description}</p>
                  )}
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
