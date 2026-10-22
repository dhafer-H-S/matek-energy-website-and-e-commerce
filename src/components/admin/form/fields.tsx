"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-gold";

export function FieldShell({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold uppercase tracking-luxe text-muted"
        >
          {label}
          {required ? <span className="text-gold"> *</span> : null}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-xs text-muted-soft">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  name,
  hint,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  name: string;
  hint?: string;
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} required={required}>
      <input id={name} name={name} required={required} className={inputClass} {...props} />
    </FieldShell>
  );
}

export function TextareaField({
  label,
  name,
  hint,
  required,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  name: string;
  hint?: string;
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} required={required}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        className={cn(inputClass, "resize-y")}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  hint,
  required,
  options,
  defaultValue,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  name: string;
  hint?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} required={required}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={cn(inputClass, "appearance-none")}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Switch({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative inline-flex">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-border-strong transition-colors peer-checked:bg-gold" />
        <span className="absolute inset-s-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-6 shadow-soft">
      <div className="mb-5">
        <h2 className="font-display text-lg text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function SubmitButton({
  children = "Save",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xs bg-foreground px-7 py-3 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink disabled:opacity-60",
        className,
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Saving…" : children}
    </button>
  );
}
