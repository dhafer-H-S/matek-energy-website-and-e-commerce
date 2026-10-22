"use client";

import { useActionState } from "react";
import { saveBanner, type BannerFormState } from "@/app/(admin)/admin/(dashboard)/banners/actions";
import { FormSection, TextField, SelectField, Switch, SubmitButton } from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { ImageField, TranslatedImageField } from "@/components/admin/form/ImageField";
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
      <FormSection title="Default banner image" description="Shared fallback image for both languages (recommended 1920×700 for hero). Use the language-specific images below for artwork containing English or Turkish text.">
        <ImageField label="Default image" name="image" required defaultValue={banner?.image} />
        <ImageField label="Default mobile image (optional)" name="mobileImage" defaultValue={banner?.mobileImage} />
      </FormSection>
      <FormSection title="English & Turkish banner content" description="Write separate text or upload separate artwork for each language. Leave text empty if it is already part of the image. A language-specific image overrides the default; without a matching mobile image, that language's desktop image is used on mobile too.">
        <LangTabs hint="Switch between English and Türkçe to edit each banner version, then save once for both. A language-specific image can have no overlay text. If no Turkish content or artwork is entered, English text is used over the default image.">
          <TranslatedImageField label="Language-specific image (optional)" name="image" values={trText(translations, "image")} />
          <TranslatedImageField label="Language-specific mobile image (optional)" name="mobileImage" values={trText(translations, "mobileImage")} />
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
          <TextField label="Link URL" name="linkUrl" defaultValue={banner?.linkUrl ?? ""} placeholder="/shop" hint="Use /shop or /services/... without /en or /tr to keep the visitor's selected language." />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={banner?.sortOrder ?? 0} />
        </div>
        <Switch label="Active" name="active" defaultChecked={banner?.active ?? true} />
      </FormSection>
      <ErrorNote message={state.error} />
      <SubmitButton>{banner ? "Save changes" : "Create banner"}</SubmitButton>
    </form>
  );
}
