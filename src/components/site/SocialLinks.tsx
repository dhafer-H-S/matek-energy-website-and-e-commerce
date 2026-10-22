import { getSettings } from "@/lib/queries/settings";
import { BRAND_ICONS } from "./BrandIcons";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  twitter: "X",
  tiktok: "TikTok",
};

/**
 * Renders the configured social-media icon links. Reads links from settings,
 * so it stays in sync with Admin > Settings. Returns nothing when none are set.
 * `variant` controls the visual treatment for light vs. dark backgrounds.
 */
export async function SocialLinks({
  variant = "dark",
  className,
  iconClassName,
}: {
  variant?: "dark" | "light" | "bar";
  className?: string;
  iconClassName?: string;
}) {
  const settings = await getSettings();
  const social = settings.social ?? {};
  const entries = Object.entries(BRAND_ICONS).filter(
    ([key]) => typeof social[key as keyof typeof social] === "string" && social[key as keyof typeof social],
  );
  if (entries.length === 0) return null;

  const base =
    variant === "bar"
      ? "flex h-7 w-7 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white"
      : variant === "light"
        ? "flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-brand hover:border-brand"
        : "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {entries.map(([key, Icon]) => (
        <a
          key={key}
          href={social[key as keyof typeof social]!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={LABELS[key] ?? key}
          title={LABELS[key] ?? key}
          className={base}
        >
          <Icon className={cn(variant === "bar" ? "h-4 w-4" : "h-4.5 w-4.5", iconClassName)} />
        </a>
      ))}
    </div>
  );
}
