import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LogoProps {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** "dark" = colour logo for light backgrounds, "light" = white logo for dark backgrounds. */
  variant?: "dark" | "light";
  href?: string;
}

export function Logo({
  className,
  imgClassName,
  priority = false,
  variant = "dark",
  href = "/",
}: LogoProps) {
  const t = useTranslations("media");
  const common = useTranslations("common");
  return (
    <Link
      href={href}
      aria-label={common("brand")}
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src={t(variant === "light" ? "logoLight" : "logo")}
        alt={common("brand")}
        width={967}
        height={372}
        priority={priority}
        className={cn("h-auto w-auto select-none", imgClassName)}
      />
    </Link>
  );
}
