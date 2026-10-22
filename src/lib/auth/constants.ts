/** Auth constants with no crypto dependencies — safe to import in the Edge proxy. */
export const SESSION_COOKIE = "matek_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type UserRole = "super_admin" | "editor";
