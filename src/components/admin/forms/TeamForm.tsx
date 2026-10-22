"use client";

import { useActionState } from "react";
import {
  saveTeamMember,
  type TeamFormState,
} from "@/app/(admin)/admin/(dashboard)/team/actions";
import {
  FormSection,
  TextField,
  Switch,
  SubmitButton,
} from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { ImageField } from "@/components/admin/form/ImageField";
import type { TeamMember, TeamTranslation } from "@/lib/db/schema";

function trText(
  translations: TeamTranslation[] | undefined,
  field: keyof TeamTranslation,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of translations ?? []) {
    const v = t[field];
    if (typeof v === "string") map[t.locale] = v;
  }
  return map;
}

export function TeamForm({
  member,
  translations,
}: {
  member?: TeamMember;
  translations?: TeamTranslation[];
}) {
  const boundAction = saveTeamMember.bind(null, member?.id ?? null);
  const [state, action] = useActionState<TeamFormState, FormData>(
    boundAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection title="Profile">
        <LangTabs>
          <TranslatedField
            label="Name"
            name="name"
            required
            values={trText(translations, "name")}
          />
          <TranslatedField
            label="Role / Title"
            name="role"
            values={trText(translations, "role")}
          />
          <TranslatedField
            label="Biography"
            name="bio"
            type="textarea"
            rows={5}
            values={trText(translations, "bio")}
          />
        </LangTabs>
      </FormSection>

      <FormSection title="Photo & Contact">
        <ImageField
          label="Photo"
          name="photo"
          defaultValue={member?.photo}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Email"
            name="email"
            type="email"
            defaultValue={member?.email ?? undefined}
          />
          <TextField
            label="Phone"
            name="phone"
            defaultValue={member?.phone ?? undefined}
          />
          <TextField
            label="LinkedIn URL"
            name="linkedin"
            defaultValue={member?.linkedin ?? undefined}
          />
          <TextField
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={member?.sortOrder ?? 0}
          />
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <Switch
          label="Published"
          name="published"
          defaultChecked={member?.published ?? true}
        />
      </FormSection>

      {state.error ? (
        <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>{member ? "Save changes" : "Add member"}</SubmitButton>
    </form>
  );
}
