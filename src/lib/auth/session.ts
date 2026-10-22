import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  signSession,
  verifySession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type SessionPayload,
  type UserRole,
} from "./jwt";

export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}): Promise<void> {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(
  async function getCurrentUser(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySession(token);
  },
);

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role !== "super_admin") redirect("/admin");
  return user;
}

export type { SessionPayload, UserRole };
