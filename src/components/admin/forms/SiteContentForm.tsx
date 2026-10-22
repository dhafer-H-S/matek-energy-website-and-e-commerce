"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSiteContent, type ContentFormState } from "@/app/(admin)/admin/(dashboard)/content/actions";
import { ImageField } from "@/components/admin/form/ImageField";
import { inputClass, SubmitButton } from "@/components/admin/form/fields";
import type { ContentSection, ContentValue } from "@/lib/content";

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function emptyItem(template: ContentValue): ContentValue {
  if (typeof template === "string") return "";
  if (Array.isArray(template)) return [];
  return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, emptyItem(value)]));
}

function ContentFields({ value, template, path, onChange, media }: {
  value: ContentValue;
  template: ContentValue;
  path: string[];
  onChange: (value: ContentValue) => void;
  media: boolean;
}) {
  const id = path.join("_");
  const label = labelFor(path[path.length - 1]);
  if (typeof value === "string") {
    if (media) return <ImageField label={label} name={id} defaultValue={value} onChange={onChange} required />;
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
        <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={value.length > 180 || value.includes("\n") ? 5 : 2} className={inputClass} />
        {typeof template === "string" && template.includes("{") ? <p className="text-xs text-muted">Keep message placeholders and plural rules intact. Original format: <code className="break-words">{template}</code></p> : null}
      </div>
    );
  }
  if (Array.isArray(value)) {
    const templates = Array.isArray(template) ? template : [];
    return (
      <fieldset className="rounded-2xl border border-border p-5">
        <legend className="px-2 font-semibold text-foreground">{label}</legend>
        <div className="space-y-5">
          {value.map((item, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-4 flex flex-wrap justify-between gap-4">
                <span className="text-sm font-semibold text-muted">Item {index + 1}</span>
                <div className="flex gap-4 text-xs font-semibold">
                  {index > 0 ? <button type="button" onClick={() => {
                    const reordered = [...value];
                    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
                    onChange(reordered);
                  }} className="text-muted">Move up</button> : null}
                  <button type="button" onClick={() => onChange(value.filter((_, position) => position !== index))} className="text-red-600">Remove item</button>
                </div>
              </div>
              <ContentFields value={item} template={templates[index] ?? templates[0]} path={[...path, String(index + 1)]} media={media} onChange={(next) => onChange(value.map((current, position) => position === index ? next : current))} />
            </div>
          ))}
          <button type="button" disabled={!templates.length || value.length >= 30} onClick={() => onChange([...value, emptyItem(templates[0])])} className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:border-gold disabled:opacity-50">+ Add item</button>
        </div>
      </fieldset>
    );
  }
  const templates = typeof template === "object" && !Array.isArray(template) ? template : {};
  return (
    <div className="space-y-6">
      {Object.entries(value).map(([key, item]) => (
        <ContentFields key={key} value={item} template={templates[key]} path={[...path, key]} media={media} onChange={(next) => onChange({ ...value, [key]: next })} />
      ))}
    </div>
  );
}

export function SiteContentForm({ section, initial, defaults }: {
  section: string;
  initial: Record<"en" | "tr", ContentSection>;
  defaults: Record<"en" | "tr", ContentSection>;
}) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [locale, setLocale] = useState<"en" | "tr">("en");
  const [version, setVersion] = useState(0);
  const dirty = JSON.stringify(values) !== saved;
  const [state, action, pending] = useActionState<ContentFormState, FormData>(async (previous, fd) => {
    const result = await saveSiteContent(section, previous, fd);
    if (result.ok) setSaved(JSON.stringify(values));
    return result;
  }, {});
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="content_en" value={JSON.stringify(values.en)} />
      <input type="hidden" name="content_tr" value={JSON.stringify(values.tr)} />
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <div role="group" aria-label="Content language" className="flex gap-1">
          {(["en", "tr"] as const).map((language) => <button key={language} type="button" aria-pressed={locale === language} onClick={() => setLocale(language)} className={`rounded-full px-5 py-2 text-sm font-semibold ${locale === language ? "bg-foreground text-background" : "text-muted"}`}>{language === "en" ? "English" : "Türkçe"}</button>)}
        </div>
        <span role="status" aria-live="polite" className={`text-sm ${state.error ? "text-red-600" : dirty ? "text-muted" : "text-emerald-600"}`}>{state.error ? "Not saved — see the error below" : pending ? "Saving..." : dirty ? "Unsaved changes" : state.ok ? "Saved in both languages" : "No unsaved changes"}</span>
        <SubmitButton>Save both languages</SubmitButton>
      </div>
      <p className="text-sm leading-relaxed text-muted">Switch languages without losing edits, then save once for both. Lists support adding and removing items. Changes publish immediately after a successful save. Required placeholders are validated before saving.</p>
      {state.error ? <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{state.error}</p> : null}
      <fieldset disabled={pending} className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
        {(["en", "tr"] as const).map((language) => <div key={`${language}-${version}`} hidden={locale !== language}>
          <ContentFields value={values[language]} template={defaults[language]} path={[language, section]} media={section === "media"} onChange={(next) => {
            if (typeof next === "object" && !Array.isArray(next)) setValues((current) => ({ ...current, [language]: next }));
          }} />
        </div>)}
      </fieldset>
      <button type="button" disabled={pending} onClick={() => {
        if (window.confirm("Restore the original text and images for this section in both languages? This remains unsaved until you click Save.")) {
          setValues(defaults);
          setVersion((current) => current + 1);
        }
      }} className="text-sm font-semibold text-muted underline hover:text-foreground">Restore this section&apos;s original content</button>
    </form>
  );
}
