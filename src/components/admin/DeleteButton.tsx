"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmText = "Are you sure you want to delete this item? This cannot be undone.",
  iconOnly = false,
  className,
}: {
  action: (id: string) => Promise<void>;
  id: string;
  label?: string;
  confirmText?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [pending, start] = useTransition();

  function onClick() {
    if (window.confirm(confirmText)) {
      start(() => action(id));
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-xs text-sm text-muted transition-colors hover:text-red-500 disabled:opacity-50",
        !iconOnly && "border border-border px-3 py-2 hover:border-red-500",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {!iconOnly ? label : null}
    </button>
  );
}
