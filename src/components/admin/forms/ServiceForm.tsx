"use client";

import { useActionState } from "react";
import {
  saveService,
  type ServiceFormState,
} from "@/app/(admin)/admin/(dashboard)/services/actions";
import {
  FormSection,
  TextField,
  SelectField,
  Switch,
  SubmitButton,
} from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { TranslatedRichText } from "@/components/admin/form/RichTextField";
import { ImageField, GalleryField } from "@/components/admin/form/ImageField";
import { SERVICE_ICON_OPTIONS } from "@/components/icons/ServiceIcon";
import type { Service, ServiceTranslation } from "@/lib/db/schema";

function trText(
  translations: ServiceTranslation[] | undefined,
  field: keyof ServiceTranslation,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of translations ?? []) {
    const v = t[field];
    if (typeof v === "string") map[t.locale] = v;
  }
  return map;
}

function listText(translations: ServiceTranslation[] | undefined, field: "highlights" | "steps" | "faqs"): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of translations ?? []) {
    const v = t[field] as unknown;
    if (!Array.isArray(v)) continue;
    map[t.locale] = v
      .map((x) => (typeof x === "string" ? x : "title" in x ? `${x.title} | ${x.text}` : `${x.q} | ${x.a}`))
      .join("\n");
  }
  return map;
}

export function ServiceForm({
  service,
  translations,
  categories = [],
}: {
  service?: Service;
  translations?: ServiceTranslation[];
  categories?: { value: string; label: string }[];
}) {
  const boundAction = saveService.bind(null, service?.id ?? null);
  const [state, action] = useActionState<ServiceFormState, FormData>(
    boundAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection title="Content">
        <LangTabs>
          <TranslatedField
            label="Title"
            name="title"
            required
            values={trText(translations, "title")}
          />
          <TranslatedField
            label="Short description"
            name="description"
            type="textarea"
            rows={3}
            values={trText(translations, "description")}
          />
          <TranslatedRichText
            label="Full content"
            name="content"
            values={trText(translations, "content")}
          />
        </LangTabs>
      </FormSection>

      <FormSection title="Sales page details">
        <LangTabs>
          <TranslatedField label="Typical duration (e.g. 1–2 days)" name="duration" values={trText(translations, "duration")} />
          <TranslatedField label="What's included (one per line)" name="highlights" type="textarea" rows={6} values={listText(translations, "highlights")} />
          <TranslatedField label="Process steps (one per line: Title | Description)" name="steps" type="textarea" rows={6} values={listText(translations, "steps")} />
          <TranslatedField label="FAQ (one per line: Question | Answer)" name="faqs" type="textarea" rows={6} values={listText(translations, "faqs")} />
        </LangTabs>
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="Starting price (optional)" name="priceFrom" type="number" step="0.01" min="0" defaultValue={service?.priceFrom ?? ""} hint="Shown as “From …”. Leave empty for quote-only." />
          <SelectField label="Currency" name="currency" defaultValue={service?.currency ?? "EUR"} options={[{ value: "EUR", label: "EUR (€)" }, { value: "TRY", label: "TRY (₺)" }]} />
          <SelectField label="Related shop category" name="categoryId" defaultValue={service?.categoryId ?? ""} options={[{ value: "", label: "None" }, ...categories]} />
        </div>
        <GalleryField label="Gallery" name="gallery" defaultValue={service?.gallery} />
      </FormSection>

      <FormSection title="Appearance">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Icon"
            name="icon"
            defaultValue={service?.icon ?? "sparkles"}
            options={SERVICE_ICON_OPTIONS}
          />
          <TextField
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={service?.sortOrder ?? 0}
          />
        </div>
        <ImageField
          label="Image (optional)"
          name="image"
          defaultValue={service?.image}
        />
        <TextField
          label="Slug"
          name="slug"
          defaultValue={service?.slug}
          placeholder="auto-generated from title"
          hint="Leave blank to auto-generate."
        />
      </FormSection>

      <FormSection title="Visibility">
        <Switch
          label="Published"
          name="published"
          defaultChecked={service?.published ?? true}
        />
      </FormSection>

      {state.error ? (
        <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>{service ? "Save changes" : "Create service"}</SubmitButton>
    </form>
  );
}
