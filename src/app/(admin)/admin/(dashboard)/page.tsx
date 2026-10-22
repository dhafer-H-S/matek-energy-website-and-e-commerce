import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  ShoppingBag,
  Package,
  Newspaper,
  Inbox,
  Plus,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  orders,
  products,
  blogPosts,
  enquiries,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PageHeader, StatCard, Card, Badge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await requireUser();

  const [orderCount, productCount, blogCount, newCount, recent] = await Promise.all([
    db.$count(orders, eq(orders.status, "new")),
    db.$count(products),
    db.$count(blogPosts),
    db.$count(enquiries, eq(enquiries.status, "new")),
    db
      .select()
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt))
      .limit(6),
  ]);

  const quickLinks = [
    { href: "/admin/products/new", label: "New Product" },
    { href: "/admin/categories/new", label: "New Category" },
    { href: "/admin/banners/new", label: "New Banner" },
    { href: "/admin/blog/new", label: "New Blog Post" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is what is happening across Matek Energy."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"
          >
            <Plus className="h-4 w-4" /> New Product
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New Orders"
          value={orderCount}
          href="/admin/orders"
          icon={<ShoppingBag className="h-5 w-5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Products"
          value={productCount}
          href="/admin/products"
          icon={<Package className="h-5 w-5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Blog posts"
          value={blogCount}
          href="/admin/blog"
          icon={<Newspaper className="h-5 w-5" strokeWidth={1.5} />}
        />
        <StatCard
          label="New Enquiries"
          value={newCount}
          href="/admin/enquiries"
          icon={<Inbox className="h-5 w-5" strokeWidth={1.5} />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg">Recent Enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gold hover:text-gold-strong"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No enquiries yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {e.email}
                      {e.sourceLabel ? ` · ${e.sourceLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-muted sm:block">
                      {formatDate(e.createdAt)}
                    </span>
                    <Badge
                      tone={
                        e.status === "new"
                          ? "gold"
                          : e.status === "contacted"
                            ? "blue"
                            : "green"
                      }
                    >
                      {e.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-5 font-display text-lg">Quick Actions</h2>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between rounded-sm border border-border px-4 py-3 text-sm text-foreground/80 transition-colors hover:border-gold hover:text-gold"
                >
                  {l.label}
                  <Plus className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
