"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect, useTransition } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-xs px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:opacity-80"
      >
        <Globe className="h-4 w-4" strokeWidth={1.5} />
        <span>{locale}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={1.5}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute inset-e-0 z-50 mt-2 min-w-40 overflow-hidden rounded-sm border border-border bg-surface py-1 shadow-lift"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-background-alt",
                  l === locale ? "text-gold" : "text-foreground/80",
                )}
              >
                <span>{localeNames[l]}</span>
                {l === locale ? (
                  <Check className="h-4 w-4" strokeWidth={1.5} />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
