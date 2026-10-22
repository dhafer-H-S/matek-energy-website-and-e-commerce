"use client";

import { useActionState } from "react";
import {
  saveUser,
  type UserFormState,
} from "@/app/(admin)/admin/(dashboard)/users/actions";
import {
  FormSection,
  TextField,
  SelectField,
  Switch,
  SubmitButton,
} from "@/components/admin/form/fields";
import type { User } from "@/lib/db/schema";

export function UserForm({ user }: { user?: User }) {
  const boundAction = saveUser.bind(null, user?.id ?? null);
  const [state, action] = useActionState<UserFormState, FormData>(
    boundAction,
    {},
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <FormSection title="Account">
        <TextField
          label="Full name"
          name="name"
          required
          defaultValue={user?.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={user?.email}
        />
        <SelectField
          label="Role"
          name="role"
          defaultValue={user?.role ?? "editor"}
          options={[
            { value: "editor", label: "Editor — content only" },
            { value: "super_admin", label: "Super Admin — full access" },
          ]}
        />
        <TextField
          label={user ? "New password" : "Password"}
          name="password"
          type="password"
          hint={user ? "Leave blank to keep the current password." : undefined}
          required={!user}
        />
        {user ? (
          <Switch
            label="Active"
            name="active"
            defaultChecked={user.active}
            hint="Inactive users cannot sign in."
          />
        ) : null}
      </FormSection>

      {state.error ? (
        <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>{user ? "Save changes" : "Create user"}</SubmitButton>
    </form>
  );
}
