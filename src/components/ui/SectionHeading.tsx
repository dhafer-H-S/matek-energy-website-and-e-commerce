import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
  invert?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  invert = false,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2
        className={cn(
          "font-display text-3xl leading-[1.32] sm:text-4xl sm:leading-tight lg:text-[2.75rem]",
          invert ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      <span className="block h-1 w-14 rounded-full bg-brand" aria-hidden />
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-balance",
            invert ? "text-white/75" : "text-muted",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
