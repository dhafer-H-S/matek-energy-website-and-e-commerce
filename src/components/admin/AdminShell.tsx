"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  GalleryHorizontal,
  HardHat,
  Newspaper,
  Sparkles,
  UsersRound,
  Inbox,
  Image as ImageIcon,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth/jwt";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/banners", label: "Banners", icon: GalleryHorizontal },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/projects", label: "Projects", icon: HardHat },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/team", label: "Team", icon: UsersRound },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/content", label: "Website content", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const SUPER_ADMIN_NAV: NavItem[] = [
  { href: "/admin/users", label: "Users", icon: ShieldCheck },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items =
    user.role === "super_admin" ? [...NAV, ...SUPER_ADMIN_NAV] : NAV;

  function isActive(item: NavItem) {
    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt="Matek Energy"
              width={600}
              height={200}
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-gold/15 font-medium text-gold"
                        : "text-foreground/70 hover:bg-background-alt hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-sm px-3 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-semibold text-gold">
              {user.name?.charAt(0).toUpperCase() ?? "A"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs capitalize text-muted">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-background-alt hover:text-foreground"
            >
              <LogOut className="h-4.5 w-4.5" strokeWidth={1.5} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Backdrop on mobile */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:ms-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ms-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-gold"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
              View site
            </a>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
