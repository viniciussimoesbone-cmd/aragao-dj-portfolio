import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="heading-display mt-3 text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
      <div className={cn("mt-5 h-[3px] w-16 bg-gold", align === "center" && "mx-auto")} />
    </div>
  );
}
