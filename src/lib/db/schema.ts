import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/* ─── Shared column helpers ──────────────────────────────────────────────── */
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull();

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull();

/* ─── Users ──────────────────────────────────────────────────────────────── */
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["super_admin", "editor"] })
    .notNull()
    .default("editor"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ─── Shop categories ────────────────────────────────────────────────────── */
export const categories = sqliteTable("categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  icon: text("icon"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const categoryTranslations = sqliteTable(
  "category_translations",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (t) => [uniqueIndex("category_tr_unique").on(t.categoryId, t.locale)],
);

/* ─── Products ───────────────────────────────────────────────────────────── */
export const products = sqliteTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    sku: text("sku"),
    brand: text("brand"),
    image: text("image"),
    gallery: text("gallery", { mode: "json" }).$type<string[]>(),
    price: real("price").notNull().default(0),
    salePrice: real("sale_price"),
    currency: text("currency", { enum: ["TRY", "EUR"] })
      .notNull()
      .default("EUR"),
    inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
    // null = unlimited / not tracked
    stock: integer("stock"),
    // When true the price is hidden and customers are asked to request a quote.
    quoteOnly: integer("quote_only", { mode: "boolean" })
      .notNull()
      .default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    isNew: integer("is_new", { mode: "boolean" }).notNull().default(false),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("product_category_idx").on(t.categoryId, t.published),
    index("product_featured_idx").on(t.featured, t.published),
  ],
);

export const productTranslations = sqliteTable(
  "product_translations",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    specs: text("specs", { mode: "json" }).$type<
      { label: string; value: string }[]
    >(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (t) => [uniqueIndex("product_tr_unique").on(t.productId, t.locale)],
);

/* ─── Banners (admin-managed moving banners) ─────────────────────────────── */
export const banners = sqliteTable("banners", {
  id: id(),
  placement: text("placement", { enum: ["hero", "promo"] })
    .notNull()
    .default("hero"),
  image: text("image").notNull(),
  mobileImage: text("mobile_image"),
  linkUrl: text("link_url"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const bannerTranslations = sqliteTable(
  "banner_translations",
  {
    id: id(),
    bannerId: text("banner_id")
      .notNull()
      .references(() => banners.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    eyebrow: text("eyebrow"),
    title: text("title"),
    subtitle: text("subtitle"),
    ctaLabel: text("cta_label"),
  },
  (t) => [uniqueIndex("banner_tr_unique").on(t.bannerId, t.locale)],
);

/* ─── Projects (completed installations portfolio) ───────────────────────── */
export const projects = sqliteTable("projects", {
  id: id(),
  slug: text("slug").notNull().unique(),
  kind: text("kind"),
  image: text("image"),
  gallery: text("gallery", { mode: "json" }).$type<string[]>(),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const projectTranslations = sqliteTable(
  "project_translations",
  {
    id: id(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
  },
  (t) => [uniqueIndex("project_tr_unique").on(t.projectId, t.locale)],
);

/* ─── Orders ─────────────────────────────────────────────────────────────── */
export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  sku: string | null;
  unitPrice: number;
  currency: "TRY" | "EUR";
  quantity: number;
}

export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number").notNull().unique(),
    customerName: text("customer_name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    city: text("city"),
    address: text("address"),
    notes: text("notes"),
    paymentMethod: text("payment_method", {
      enum: ["cash_on_delivery", "bank_transfer"],
    })
      .notNull()
      .default("cash_on_delivery"),
    channel: text("channel", { enum: ["website", "whatsapp"] })
      .notNull()
      .default("website"),
    items: text("items", { mode: "json" }).$type<OrderItem[]>().notNull(),
    totals: text("totals", { mode: "json" })
      .$type<{ TRY?: number; EUR?: number }>()
      .notNull(),
    status: text("status", {
      enum: ["new", "confirmed", "shipped", "delivered", "cancelled"],
    })
      .notNull()
      .default("new"),
    adminNote: text("admin_note"),
    locale: text("locale").notNull().default("en"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("order_status_idx").on(t.status, t.createdAt)],
);

/* ─── Blog / Insights ────────────────────────────────────────────────────── */
export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    coverImage: text("cover_image"),
    category: text("category"),
    authorName: text("author_name"),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("blog_published_idx").on(t.published, t.publishedAt)],
);

export const blogTranslations = sqliteTable(
  "blog_translations",
  {
    id: id(),
    postId: text("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (t) => [uniqueIndex("blog_tr_unique").on(t.postId, t.locale)],
);

/* ─── Services ───────────────────────────────────────────────────────────── */
export const services = sqliteTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  image: text("image"),
  gallery: text("gallery", { mode: "json" }).$type<string[]>(),
  priceFrom: real("price_from"),
  currency: text("currency", { enum: ["TRY", "EUR"] }).notNull().default("EUR"),
  categoryId: text("category_id"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const serviceTranslations = sqliteTable(
  "service_translations",
  {
    id: id(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    content: text("content"),
    duration: text("duration"),
    highlights: text("highlights", { mode: "json" }).$type<string[]>(),
    steps: text("steps", { mode: "json" }).$type<{ title: string; text: string }[]>(),
    faqs: text("faqs", { mode: "json" }).$type<{ q: string; a: string }[]>(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (t) => [uniqueIndex("service_tr_unique").on(t.serviceId, t.locale)],
);

/* ─── Team members ───────────────────────────────────────────────────────── */
export const teamMembers = sqliteTable("team_members", {
  id: id(),
  photo: text("photo"),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const teamTranslations = sqliteTable(
  "team_translations",
  {
    id: id(),
    memberId: text("member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    role: text("role"),
    bio: text("bio"),
  },
  (t) => [uniqueIndex("team_tr_unique").on(t.memberId, t.locale)],
);

/* ─── Media library ──────────────────────────────────────────────────────── */
export const media = sqliteTable("media", {
  id: id(),
  url: text("url").notNull(),
  alt: text("alt"),
  type: text("type", { enum: ["image", "video"] })
    .notNull()
    .default("image"),
  source: text("source", { enum: ["upload", "pexels", "external"] })
    .notNull()
    .default("upload"),
  width: integer("width"),
  height: integer("height"),
  pexelsId: text("pexels_id"),
  photographer: text("photographer"),
  createdAt: createdAt(),
});

/* ─── Enquiries (contact form, appointments, quote requests) ─────────────── */
export const enquiries = sqliteTable(
  "enquiries",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message"),
    sourceType: text("source_type", {
      enum: ["contact", "appointment", "quote", "general"],
    })
      .notNull()
      .default("general"),
    sourceId: text("source_id"),
    // Selected service / product name, depending on the source.
    sourceLabel: text("source_label"),
    locale: text("locale").notNull().default("en"),
    status: text("status", { enum: ["new", "contacted", "closed"] })
      .notNull()
      .default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("enquiry_status_idx").on(t.status, t.createdAt)],
);

/* ─── Global settings (singleton) ────────────────────────────────────────── */
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("global"),
  metaPixelId: text("meta_pixel_id"),
  gaMeasurementId: text("ga_measurement_id"),
  gtmId: text("gtm_id"),
  contactEmail: text("contact_email"),
  orderEmail: text("order_email"),
  contactPhone: text("contact_phone"),
  whatsapp: text("whatsapp"),
  addressText: text("address_text"),
  openingHours: text("opening_hours"),
  bankName: text("bank_name"),
  bankAccountHolder: text("bank_account_holder"),
  bankIban: text("bank_iban"),
  bankNotes: text("bank_notes"),
  social: text("social", { mode: "json" }).$type<{
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
  }>(),
  updatedAt: updatedAt(),
});

/* ─── Relations ──────────────────────────────────────────────────────────── */
export const categoriesRelations = relations(categories, ({ many }) => ({
  translations: many(categoryTranslations),
  products: many(products),
}));

export const categoryTranslationsRelations = relations(
  categoryTranslations,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryTranslations.categoryId],
      references: [categories.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ many, one }) => ({
  translations: many(productTranslations),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const productTranslationsRelations = relations(
  productTranslations,
  ({ one }) => ({
    product: one(products, {
      fields: [productTranslations.productId],
      references: [products.id],
    }),
  }),
);

export const bannersRelations = relations(banners, ({ many }) => ({
  translations: many(bannerTranslations),
}));

export const bannerTranslationsRelations = relations(
  bannerTranslations,
  ({ one }) => ({
    banner: one(banners, {
      fields: [bannerTranslations.bannerId],
      references: [banners.id],
    }),
  }),
);

export const projectsRelations = relations(projects, ({ many }) => ({
  translations: many(projectTranslations),
}));

export const projectTranslationsRelations = relations(
  projectTranslations,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTranslations.projectId],
      references: [projects.id],
    }),
  }),
);

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  translations: many(blogTranslations),
}));
export const blogTranslationsRelations = relations(
  blogTranslations,
  ({ one }) => ({
    post: one(blogPosts, {
      fields: [blogTranslations.postId],
      references: [blogPosts.id],
    }),
  }),
);

export const servicesRelations = relations(services, ({ many }) => ({
  translations: many(serviceTranslations),
}));

export const serviceTranslationsRelations = relations(
  serviceTranslations,
  ({ one }) => ({
    service: one(services, {
      fields: [serviceTranslations.serviceId],
      references: [services.id],
    }),
  }),
);

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
  translations: many(teamTranslations),
}));

export const teamTranslationsRelations = relations(
  teamTranslations,
  ({ one }) => ({
    member: one(teamMembers, {
      fields: [teamTranslations.memberId],
      references: [teamMembers.id],
    }),
  }),
);

/* ─── Inferred types ─────────────────────────────────────────────────────── */
export type User = typeof users.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogTranslation = typeof blogTranslations.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceTranslation = typeof serviceTranslations.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamTranslation = typeof teamTranslations.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductTranslation = typeof productTranslations.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type BannerTranslation = typeof bannerTranslations.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectTranslation = typeof projectTranslations.$inferSelect;
export type Order = typeof orders.$inferSelect;
