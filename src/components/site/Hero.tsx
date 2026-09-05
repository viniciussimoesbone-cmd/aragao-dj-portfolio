import Link from "next/link";
import { hero } from "@/lib/site/content";
import { IconArrowRight, IconChevronDown } from "./Icons";

const EQ_BARS = [
  { anim: "animate-eq1", height: "h-10" },
  { anim: "animate-eq2", height: "h-16" },
  { anim: "animate-eq3", height: "h-8" },
  { anim: "animate-eq4", height: "h-20" },
  { anim: "animate-eq5", height: "h-12" },
  { anim: "animate-eq2", height: "h-9" },
];

export function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink-950">
      {/* Background: stage-light gradients standing in for the artist photo until one is supplied. */}
      <div
        className="absolute inset-0 [background:radial-gradient(60%_50%_at_82%_18%,rgba(224,18,36,0.28),transparent_60%),radial-gradient(45%_40%_at_10%_85%,rgba(224,18,36,0.16),transparent_65%),linear-gradient(180deg,#0a0a0a_0%,#050505_60%,#000_100%)] lg:bg-fixed"
        aria-hidden
      />
      <div className="noise-overlay absolute inset-0 opacity-40" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" aria-hidden />

      <div className="container-page relative z-10 pt-28">
        <div className="max-w-3xl animate-fade-up">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="heading-display text-glow mt-4 text-6xl sm:text-7xl lg:text-[8rem]">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-base text-ink-200 sm:text-lg">{hero.subtitle}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={hero.primaryCta.href} className="btn-primary">
              {hero.primaryCta.label}
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href={hero.secondaryCta.href} className="btn-outline">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="mt-16 flex items-end gap-1.5 opacity-70 sm:mt-24" aria-hidden>
          {EQ_BARS.map((bar, i) => (
            <span
              key={i}
              className={`w-1.5 origin-bottom rounded-full bg-blood ${bar.height} ${bar.anim}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <IconChevronDown className="h-6 w-6 animate-pulse-glow text-white/50" />
      </div>
    </section>
  );
}
