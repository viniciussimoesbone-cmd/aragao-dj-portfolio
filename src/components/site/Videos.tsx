import Link from "next/link";
import { videoItems } from "@/lib/site/content";
import { IconPlay } from "./Icons";
import { PlaceholderImage } from "./PlaceholderImage";
import { RevealOnScroll } from "./RevealOnScroll";
import { SectionHeading } from "./SectionHeading";

export function Videos() {
  return (
    <section id="videos" className="bg-ink-950 py-28 sm:py-32">
      <div className="container-page">
        <RevealOnScroll>
          <SectionHeading eyebrow="Audiovisual" title="SINTA A ENERGIA" />
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videoItems.map((video, i) => (
            <RevealOnScroll key={video.title} delay={i * 90}>
              <Link
                href={video.url ?? "#contato"}
                target={video.url ? "_blank" : undefined}
                className="group relative block aspect-[9/12] overflow-hidden rounded-2xl border border-white/10"
              >
                <PlaceholderImage
                  label={video.title}
                  className="transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                  {video.platform}
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-ink-950 shadow-lg shadow-black/50 transition-transform duration-300 group-hover:scale-110">
                    <IconPlay className="ml-1 h-6 w-6" />
                  </span>
                </span>
                <span className="absolute inset-x-4 bottom-4 text-sm font-semibold text-white">
                  {video.title}
                </span>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
