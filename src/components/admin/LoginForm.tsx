"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="w-full rounded-xs border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-gold"
          placeholder="admin@matek-energy.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xs border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-gold"
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p className="rounded-xs border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xs bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" strokeWidth={1.5} />
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
