"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { FieldShell, inputClass } from "./fields";

export const FORM_LOCALES = [
  { code: "en", label: "English", dir: "ltr" as const },
  { code: "tr", label: "Türkçe", dir: "ltr" as const },
];

const LangContext = createContext<string>("en");

export type TranslatedValues = Record<string, string | null | undefined>;

export function LangTabs({
  children,
  hint = "Enter English and Turkish content using the buttons below. Switching languages keeps your unsaved text; save once to save both. If a translated title or name is empty, the website uses English.",
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  const [active, setActive] = useState("en");
  return (
    <LangContext.Provider value={active}>
      <p className="mb-3 text-sm text-muted">{hint}</p>
      <div role="group" aria-label="Content language" className="mb-5 inline-flex rounded-sm border border-border bg-background p-1">
        {FORM_LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            aria-pressed={active === l.code}
            onClick={() => setActive(l.code)}
            className={cn(
              "rounded-xs px-4 py-1.5 text-sm font-medium transition-colors",
              active === l.code
                ? "bg-gold text-ink"
                : "text-muted hover:text-foreground",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
      {children}
    </LangContext.Provider>
  );
}

interface TranslatedFieldProps {
  label: string;
  name: string;
  type?: "input" | "textarea";
  rows?: number;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  values?: TranslatedValues;
}

/**
 * Renders one input per locale (en/tr), showing only the active tab's field
 * while keeping all in the DOM so every translation submits. Field names are
 * suffixed with the locale, e.g. `title_en`, `title_tr`.
 */
export function TranslatedField({
  label,
  name,
  type = "input",
  rows = 4,
  required,
  hint,
  placeholder,
  values,
}: TranslatedFieldProps) {
  const active = useContext(LangContext);
  return (
    <FieldShell label={`${label} (${active === "tr" ? "Türkçe" : "English"})`} htmlFor={`${name}_${active}`} hint={hint} required={required}>
      {FORM_LOCALES.map((l) => {
        const fieldName = `${name}_${l.code}`;
        const hidden = active !== l.code;
        const common = {
          id: fieldName,
          name: fieldName,
          dir: l.dir,
          defaultValue: values?.[l.code] ?? "",
          placeholder,
          className: inputClass,
        };
        return (
          <div key={l.code} className={cn(hidden && "hidden")}>
            {type === "textarea" ? (
              <textarea {...common} rows={rows} className={cn(common.className, "resize-y")} />
            ) : (
              <input {...common} />
            )}
          </div>
        );
      })}
    </FieldShell>
  );
}

export function useActiveLocale() {
  return useContext(LangContext);
}

export { LangContext };
