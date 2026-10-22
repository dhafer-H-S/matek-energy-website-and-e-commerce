"use client";

import { useActionState } from "react";
import {
  saveBlogPost,
  type BlogFormState,
} from "@/app/(admin)/admin/(dashboard)/blog/actions";
import {
  FormSection,
  TextField,
  Switch,
  SubmitButton,
} from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { TranslatedRichText } from "@/components/admin/form/RichTextField";
import { ImageField } from "@/components/admin/form/ImageField";
import type { BlogPost, BlogTranslation } from "@/lib/db/schema";

interface Props {
  post?: BlogPost;
  translations?: BlogTranslation[];
}

function trText(
  translations: BlogTranslation[] | undefined,
  field: keyof BlogTranslation,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of translations ?? []) {
    const v = t[field];
    if (typeof v === "string") map[t.locale] = v;
  }
  return map;
}

export function BlogForm({ post, translations }: Props) {
  const boundAction = saveBlogPost.bind(null, post?.id ?? null);
  const [state, action] = useActionState<BlogFormState, FormData>(
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
            label="Excerpt"
            name="excerpt"
            type="textarea"
            rows={3}
            hint="Short summary shown in listings."
            values={trText(translations, "excerpt")}
          />
          <TranslatedRichText
            label="Body"
            name="content"
            values={trText(translations, "content")}
          />
        </LangTabs>
      </FormSection>

      <FormSection title="Details">
        <ImageField
          label="Cover image"
          name="coverImage"
          defaultValue={post?.coverImage}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Category"
            name="category"
            placeholder="e.g. Market Insights"
            defaultValue={post?.category ?? undefined}
          />
          <TextField
            label="Author"
            name="authorName"
            defaultValue={post?.authorName ?? undefined}
          />
          <TextField
            label="Slug"
            name="slug"
            defaultValue={post?.slug}
            placeholder="auto-generated from title"
            hint="Leave blank to auto-generate."
          />
        </div>
      </FormSection>

      <FormSection title="SEO">
        <LangTabs>
          <TranslatedField
            label="SEO title"
            name="seoTitle"
            values={trText(translations, "seoTitle")}
          />
          <TranslatedField
            label="SEO description"
            name="seoDescription"
            type="textarea"
            rows={3}
            values={trText(translations, "seoDescription")}
          />
        </LangTabs>
      </FormSection>

      <FormSection title="Visibility">
        <Switch
          label="Published"
          name="published"
          defaultChecked={post?.published ?? false}
          hint="Visible on the public site."
        />
      </FormSection>

      {state.error ? (
        <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>{post ? "Save changes" : "Create post"}</SubmitButton>
    </form>
  );
}
