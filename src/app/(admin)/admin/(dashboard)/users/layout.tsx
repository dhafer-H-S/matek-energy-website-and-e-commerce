import { requireSuperAdmin } from "@/lib/auth/session";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
