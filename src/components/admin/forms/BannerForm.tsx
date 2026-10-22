"use client";

import { useActionState } from "react";
import { saveBanner, type BannerFormState } from "@/app/(admin)/admin/(dashboard)/banners/actions";
import { FormSection, TextField, SelectField, Switch, SubmitButton } from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { ImageField } from "@/components/admin/form/ImageField";
import type { Banner, BannerTranslation } from "@/lib/db/schema";
import { trText, ErrorNote } from "./shared";

export function BannerForm({
  banner,
  translations,
}: {
  banner?: Banner;
  translations?: BannerTranslation[];
}) {
  const [state, action] = useActionState<BannerFormState, FormData>(
    saveBanner.bind(null, banner?.id ?? null),
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection title="Banner image" description="Upload your own designed banner (recommended 1920×700 for hero).">
        <ImageField label="Image" name="image" required defaultValue={banner?.image} />
        <ImageField label="Mobile image (optional)" name="mobileImage" defaultValue={banner?.mobileImage} />
      </FormSection>
      <FormSection title="Text overlay (optional)" description="Leave empty if your banner image already contains its text.">
        <LangTabs>
          <TranslatedField label="Eyebrow" name="eyebrow" values={trText(translations, "eyebrow")} />
          <TranslatedField label="Title" name="title" values={trText(translations, "title")} />
          <TranslatedField label="Subtitle" name="subtitle" type="textarea" rows={2} values={trText(translations, "subtitle")} />
          <TranslatedField label="Button label" name="ctaLabel" values={trText(translations, "ctaLabel")} />
        </LangTabs>
      </FormSection>
      <FormSection title="Settings">
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            label="Placement"
            name="placement"
            defaultValue={banner?.placement ?? "hero"}
            options={[
              { value: "hero", label: "Hero slider (moving)" },
              { value: "promo", label: "Promo strip" },
            ]}
          />
          <TextField label="Link URL" name="linkUrl" defaultValue={banner?.linkUrl ?? ""} placeholder="/en/shop" />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={banner?.sortOrder ?? 0} />
        </div>
        <Switch label="Active" name="active" defaultChecked={banner?.active ?? true} />
      </FormSection>
      <ErrorNote message={state.error} />
      <SubmitButton>{banner ? "Save changes" : "Create banner"}</SubmitButton>
    </form>
  );
}
