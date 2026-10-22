import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface p-6 shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number | string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const content = (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface p-6 shadow-soft transition-colors hover:border-gold/50">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
      </div>
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
          {icon}
        </span>
      ) : null}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "green" | "red" | "blue";
}) {
  const tones = {
    neutral: "bg-background-alt text-muted",
    gold: "bg-gold/15 text-gold-strong",
    green: "bg-emerald-500/15 text-emerald-600",
    red: "bg-red-500/15 text-red-600",
    blue: "bg-blue-500/15 text-blue-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center">
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
