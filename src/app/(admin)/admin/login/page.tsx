import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign In · Matek Admin",
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo.png"
            alt="Matek Energy"
            width={600}
            height={200}
            priority
            className="h-14 w-auto"
          />
          <span className="eyebrow mt-4">Administration</span>
        </div>

        <div className="rounded-md border border-border bg-surface p-8 shadow-soft">
          <h1 className="mb-1 font-display text-2xl">Welcome back</h1>
          <p className="mb-6 text-sm text-muted">
            Sign in to manage your shop and content.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-soft">
          Matek Energy · Private Administration
        </p>
      </div>
    </main>
  );
}
