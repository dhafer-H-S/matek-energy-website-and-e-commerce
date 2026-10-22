import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "gold" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display text-sm font-semibold rounded-full transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-navy shadow-sm",
  secondary:
    "border border-navy text-navy hover:bg-navy hover:text-white",
  gold: "bg-white text-navy hover:bg-navy hover:text-white",
  ghost: "text-navy hover:text-brand",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5",
  md: "px-7 py-3.5",
  lg: "px-9 py-4 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props} />
  );
}
