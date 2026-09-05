"use client";

import { useState } from "react";
import { galleryItems } from "@/lib/site/content";
import { cn } from "@/lib/cn";
import { IconClose } from "./Icons";
import { PlaceholderImage } from "./PlaceholderImage";
import { RevealOnScroll } from "./RevealOnScroll";
import { SectionHeading } from "./SectionHeading";

const SPAN_CLASSES: Record<string, string> = {
  tall: "sm:row-span-2",
  wide: "sm:col-span-2",
};

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? galleryItems[activeIndex] : null;

  return (
    <section id="midia" className="bg-ink-900 py-28 sm:py-32">
      <div className="container-page">
        <RevealOnScroll>
          <SectionHeading eyebrow="Mídia" title="VIVENCIE A EXPERIÊNCIA" />
        </RevealOnScroll>

        <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] sm:grid-cols-4">
          {galleryItems.map((item, i) => (
            <RevealOnScroll
              key={`${item.category}-${i}`}
              delay={(i % 4) * 60}
              className={cn("h-full", item.span && SPAN_CLASSES[item.span])}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="group relative block h-full w-full overflow-hidden rounded-xl border border-white/10 text-left"
              >
                <PlaceholderImage
                  label={item.category}
                  src={item.image}
                  className="transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.category}
                </span>
              </button>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setActiveIndex(null)}
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white"
          >
            <IconClose className="h-5 w-5" />
          </button>
          <div
            className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PlaceholderImage label={active.category} src={active.image} />
          </div>
        </div>
      )}
    </section>
  );
}
