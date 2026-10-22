"use client";

import { useActionState } from "react";
import { saveCategory, type FormState } from "@/app/(admin)/admin/(dashboard)/categories/actions";
import { FormSection, TextField, Switch, SubmitButton } from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { ImageField } from "@/components/admin/form/ImageField";
import type { Category, CategoryTranslation } from "@/lib/db/schema";
import { trText, ErrorNote } from "./shared";

export function CategoryForm({
  category,
  translations,
}: {
  category?: Category;
  translations?: CategoryTranslation[];
}) {
  const [state, action] = useActionState<FormState, FormData>(
    saveCategory.bind(null, category?.id ?? null),
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection
        title="Category"
        description="Published categories appear automatically in the navbar dropdown and shop."
      >
        <LangTabs>
          <TranslatedField label="Name" name="name" required values={trText(translations, "name")} />
          <TranslatedField
            label="Description"
            name="description"
            type="textarea"
            rows={3}
            values={trText(translations, "description")}
          />
        </LangTabs>
      </FormSection>
      <FormSection title="Appearance">
        <ImageField label="Category image" name="image" defaultValue={category?.image} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} />
          <TextField label="Slug" name="slug" defaultValue={category?.slug} placeholder="auto-generated" />
        </div>
        <Switch label="Published" name="published" defaultChecked={category?.published ?? true} />
      </FormSection>
      <ErrorNote message={state.error} />
      <SubmitButton>{category ? "Save changes" : "Create category"}</SubmitButton>
    </form>
  );
}
