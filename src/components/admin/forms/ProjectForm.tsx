"use client";

import { useActionState } from "react";
import { saveProject, type ProjectFormState } from "@/app/(admin)/admin/(dashboard)/projects/actions";
import { FormSection, TextField, Switch, SubmitButton } from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { TranslatedRichText } from "@/components/admin/form/RichTextField";
import { ImageField, GalleryField } from "@/components/admin/form/ImageField";
import type { Project, ProjectTranslation } from "@/lib/db/schema";
import { trText, ErrorNote } from "./shared";

export function ProjectForm({
  project,
  translations,
}: {
  project?: Project;
  translations?: ProjectTranslation[];
}) {
  const [state, action] = useActionState<ProjectFormState, FormData>(
    saveProject.bind(null, project?.id ?? null),
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection title="Project story" description="Write a useful case study in English and Turkish. Include only verified project details; avoid estimated results presented as measured performance.">
        <LangTabs>
          <TranslatedField label="Title" name="title" required values={trText(translations, "title")} />
          <TranslatedField label="Subtitle" name="subtitle" values={trText(translations, "subtitle")} />
          <TranslatedRichText label="Description" name="description" hint="Use headings for the brief, system or equipment, installation approach and verified outcome. Rich-text formatting appears on the public project page." values={trText(translations, "description")} />
        </LangTabs>
      </FormSection>
      <FormSection title="Details">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="Type / size" name="kind" defaultValue={project?.kind ?? ""} placeholder="Residential · 10 kW" />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} />
          <TextField label="Slug" name="slug" defaultValue={project?.slug} placeholder="auto-generated" />
        </div>
        <ImageField label="Main image" name="image" defaultValue={project?.image} />
        <GalleryField label="Gallery" name="gallery" defaultValue={project?.gallery} hint="Add original photographs from this installation. Visitors can enlarge each photo and browse the gallery." />
        <Switch label="Published" name="published" defaultChecked={project?.published ?? true} />
      </FormSection>
      <ErrorNote message={state.error} />
      <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
    </form>
  );
}
