import Image from "next/image";
import { cn } from "@/lib/cn";
import { IconCamera } from "./Icons";

type PlaceholderImageProps = {
  label: string;
  src?: string;
  alt?: string;
  className?: string;
  fill?: boolean;
};

/**
 * Renders a real photo when `src` is provided; otherwise falls back to a
 * branded gradient tile clearly marked with its intended content, so every
 * image slot on the site is ready to receive real media later.
 */
export function PlaceholderImage({ label, src, alt, className, fill = true }: PlaceholderImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? label}
        fill={fill}
        className={cn("object-cover", className)}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  return (
    <div
      className={cn(
        "noise-overlay relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(155deg,#161616_0%,#0a0a0a_55%,#1a0304_100%)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <IconCamera className="h-6 w-6 text-white/25" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/35">
          {label}
        </span>
      </div>
    </div>
  );
}
