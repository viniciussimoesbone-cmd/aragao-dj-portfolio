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

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experienceItems.map((item, i) => (
            <RevealOnScroll
              key={item.category}
              delay={(i % 3) * 90}
              className={item.featured ? "sm:col-span-2" : undefined}
            >
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-950">
                <div className={`relative ${item.featured ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                  <PlaceholderImage
                    label={`Foto — ${item.category}`}
                    src={item.image}
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="heading-display text-2xl text-white">{item.category}</h3>
                  <p className="mt-2 max-w-sm text-sm text-ink-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.description}
                  </p>
                </div>
                <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-blood opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
