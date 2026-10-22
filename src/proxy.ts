import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// The proxy handles locale negotiation/prefixing for the public site only.
// Admin routes are excluded via the matcher below and guarded server-side by
// requireUser() in the admin layout (Node runtime).
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
