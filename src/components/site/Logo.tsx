import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
  return (
    <Link
      href={href}
      aria-label="Matek Energy — home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src={variant === "light" ? "/brand/logo-light.png" : "/brand/logo.png"}
        alt="Matek Energy"
        width={967}
        height={372}
        priority={priority}
        className={cn("h-auto w-auto select-none", imgClassName)}
      />
    </Link>
  );
}
