"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireSuperAdminUser, str, bool } from "@/lib/admin/helpers";
import { hashPassword } from "@/lib/auth/password";

export interface UserFormState {
  error?: string;
}

export async function saveUser(
  id: string | null,
  _prev: UserFormState,
  fd: FormData,
): Promise<UserFormState> {
  await requireSuperAdminUser();

  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const role = (str(fd, "role") || "editor") as "super_admin" | "editor";
  const password = str(fd, "password");

  if (!email || !name) return { error: "Name and email are required." };

  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (existingEmail && existingEmail.id !== id) {
    return { error: "That email address is already in use." };
  }

  if (id) {
    const values: Record<string, unknown> = {
      email,
      name,
      role,
      active: bool(fd, "active"),
    };
    if (password) values.passwordHash = await hashPassword(password);
    await db.update(users).set(values).where(eq(users.id, id));
  } else {
    if (!password) return { error: "A password is required for new users." };
    await db.insert(users).values({
      email,
      name,
      role,
      passwordHash: await hashPassword(password),
      active: true,
    });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  const me = await requireSuperAdminUser();
  if (me.sub === id) {
    throw new Error("You cannot delete your own account.");
  }
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}
