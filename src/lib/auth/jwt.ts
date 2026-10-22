import { SignJWT, jwtVerify } from "jose";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type UserRole,
} from "./constants";

export { SESSION_COOKIE, SESSION_MAX_AGE };
export type { UserRole };

export interface SessionPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: UserRole;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(
  payload: SessionPayload,
  maxAgeSeconds = SESSION_MAX_AGE,
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.role) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}
