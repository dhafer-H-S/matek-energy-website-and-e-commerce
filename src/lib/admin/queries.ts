import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  blogPosts,
  blogTranslations,
  services,
  serviceTranslations,
  teamMembers,
  teamTranslations,
  categories,
  categoryTranslations,
  products,
  productTranslations,
  banners,
  bannerTranslations,
  projects,
  projectTranslations,
  orders,
} from "@/lib/db/schema";

/* ── Categories ───────────────────────────────────────────────────────── */
export async function getCategoryForEdit(id: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: { translations: true },
  });
  if (!category) return null;
  return { category, translations: category.translations };
}

export async function listCategoriesForAdmin() {
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      image: categories.image,
      published: categories.published,
      sortOrder: categories.sortOrder,
      name: categoryTranslations.name,
    })
    .from(categories)
    .leftJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.locale, "en"),
      ),
    )
    .orderBy(categories.sortOrder);
  const counts = await db
    .select({ categoryId: products.categoryId })
    .from(products);
  return rows.map((r) => ({
    ...r,
    productCount: counts.filter((c) => c.categoryId === r.id).length,
  }));
}

export async function listCategoryOptions(): Promise<
  { value: string; label: string }[]
> {
  const rows = await listCategoriesForAdmin();
  return rows.map((r) => ({ value: r.id, label: r.name ?? r.slug }));
}

/* ── Products ─────────────────────────────────────────────────────────── */
export async function getProductForEdit(id: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { translations: true },
  });
  if (!product) return null;
  return { product, translations: product.translations };
}

export async function listProductsForAdmin() {
  return db
    .select({
      id: products.id,
      slug: products.slug,
      image: products.image,
      sku: products.sku,
      price: products.price,
      salePrice: products.salePrice,
      currency: products.currency,
      inStock: products.inStock,
      featured: products.featured,
      published: products.published,
      categoryId: products.categoryId,
      name: productTranslations.name,
    })
    .from(products)
    .leftJoin(
      productTranslations,
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.locale, "en"),
      ),
    )
    .orderBy(desc(products.createdAt));
}

/* ── Banners ──────────────────────────────────────────────────────────── */
export async function getBannerForEdit(id: string) {
  const banner = await db.query.banners.findFirst({
    where: eq(banners.id, id),
    with: { translations: true },
  });
  if (!banner) return null;
  return { banner, translations: banner.translations };
}

export async function listBannersForAdmin() {
  return db
    .select({
      id: banners.id,
      placement: banners.placement,
      image: banners.image,
      active: banners.active,
      sortOrder: banners.sortOrder,
      linkUrl: banners.linkUrl,
      title: bannerTranslations.title,
    })
    .from(banners)
    .leftJoin(
      bannerTranslations,
      and(
        eq(bannerTranslations.bannerId, banners.id),
        eq(bannerTranslations.locale, "en"),
      ),
    )
    .orderBy(banners.placement, banners.sortOrder);
}

/* ── Projects ─────────────────────────────────────────────────────────── */
export async function getProjectForEdit(id: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { translations: true },
  });
  if (!project) return null;
  return { project, translations: project.translations };
}

export async function listProjectsForAdmin() {
  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      kind: projects.kind,
      image: projects.image,
      published: projects.published,
      sortOrder: projects.sortOrder,
      title: projectTranslations.title,
    })
    .from(projects)
    .leftJoin(
      projectTranslations,
      and(
        eq(projectTranslations.projectId, projects.id),
        eq(projectTranslations.locale, "en"),
      ),
    )
    .orderBy(projects.sortOrder);
}

/* ── Orders ───────────────────────────────────────────────────────────── */
export async function listOrdersForAdmin() {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderForAdmin(id: string) {
  return db.query.orders.findFirst({ where: eq(orders.id, id) });
}

/* ── Blog ─────────────────────────────────────────────────────────────── */
export async function getBlogPostForEdit(id: string) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
    with: { translations: true },
  });
  if (!post) return null;
  return { post, translations: post.translations };
}

export async function listBlogPostsForAdmin() {
  return db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      coverImage: blogPosts.coverImage,
      category: blogPosts.category,
      published: blogPosts.published,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      title: blogTranslations.title,
    })
    .from(blogPosts)
    .leftJoin(
      blogTranslations,
      and(
        eq(blogTranslations.postId, blogPosts.id),
        eq(blogTranslations.locale, "en"),
      ),
    )
    .orderBy(desc(blogPosts.createdAt));
}

/* ── Services ─────────────────────────────────────────────────────────── */
export async function getServiceForEdit(id: string) {
  const service = await db.query.services.findFirst({
    where: eq(services.id, id),
    with: { translations: true },
  });
  if (!service) return null;
  return { service, translations: service.translations };
}

export async function listServicesForAdmin() {
  return db
    .select({
      id: services.id,
      slug: services.slug,
      icon: services.icon,
      image: services.image,
      published: services.published,
      sortOrder: services.sortOrder,
      title: serviceTranslations.title,
    })
    .from(services)
    .leftJoin(
      serviceTranslations,
      and(
        eq(serviceTranslations.serviceId, services.id),
        eq(serviceTranslations.locale, "en"),
      ),
    )
    .orderBy(services.sortOrder);
}

/* ── Team ─────────────────────────────────────────────────────────────── */
export async function getTeamMemberForEdit(id: string) {
  const member = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.id, id),
    with: { translations: true },
  });
  if (!member) return null;
  return { member, translations: member.translations };
}

export async function listTeamForAdmin() {
  return db
    .select({
      id: teamMembers.id,
      photo: teamMembers.photo,
      published: teamMembers.published,
      sortOrder: teamMembers.sortOrder,
      name: teamTranslations.name,
      role: teamTranslations.role,
    })
    .from(teamMembers)
    .leftJoin(
      teamTranslations,
      and(
        eq(teamTranslations.memberId, teamMembers.id),
        eq(teamTranslations.locale, "en"),
      ),
    )
    .orderBy(teamMembers.sortOrder);
}

