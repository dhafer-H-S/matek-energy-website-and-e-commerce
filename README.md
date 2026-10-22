# Aura Properties

A full-stack, trilingual (English · French · Arabic + RTL) luxury real-estate
platform with a self-serve admin CMS. Every development and property listing
automatically generates its own SEO landing page (with an auto slug URL) ending
in a call-to-action enquiry form.

## Stack

- **Next.js 16** (App Router, RSC, Server Actions) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (brand design system, dark mode, RTL)
- **next-intl** — `en` (default) · `fr` · `ar` (right-to-left)
- **Drizzle ORM** + **Turso** (libSQL)
- Custom JWT auth (`jose` + `bcryptjs`), role-based (`super_admin` / `editor`)
- **Vercel Blob** uploads · **Pexels** stock imagery · **Tiptap** rich text

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run db:migrate           # apply the schema to Turso
npm run db:seed              # populate trilingual demo content + Pexels imagery
npm run create:admin -- admin@auraproperties.com 'YourPassword' 'Your Name' super_admin
npm run dev
```

Open <http://localhost:3000>. The admin dashboard is at <http://localhost:3000/admin>.

### Default admin credentials (created during this build)

```
Email:    admin@auraproperties.com
Password: Aura@Admin2026
```

> Change this password from **Admin → Users** after first sign-in.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Turso (libSQL) database |
| `PEXELS_API_KEY` | Stock image/video search in the admin |
| `AUTH_SECRET` | Signs the session JWT (generate with `openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads (set on Vercel; optional locally) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (used for SEO/sitemap) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:migrate` | Apply migrations to Turso |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed trilingual demo content |
| `npm run create:admin` | Create/update an admin user |

## Admin features

- **Developments** & **Properties** (for sale / for rent) — each auto-generates a
  landing page at `/<locale>/developments/<slug>` and `/<locale>/properties/<slug>`.
- **Insights** (blog), **Services**, **Team**, and editable **Pages** (home, about, contact).
- **Media library** — upload to Vercel Blob or pick from Pexels; images stay editable.
- **Enquiries** — every CTA submission is captured here with status tracking.
- **Settings** — **Meta Pixel** (injected site-wide automatically), Google Analytics,
  contact details, social links, currency.
- **Users** — role-based access (super admin / editor).
- All content is entered per language via EN / FR / AR tabs; missing translations
  fall back to English.

## Architecture notes

- Two route-group roots: `src/app/(site)/[locale]` (localized public site) and
  `src/app/(admin)/admin` (English admin). The proxy (`src/proxy.ts`) handles locale
  routing; admin auth is enforced server-side in the admin layout.
- Data layer in `src/lib/db` (schema) and `src/lib/queries/*` (locale-aware reads).
- The Meta Pixel is read from settings in the localized root layout, so setting or
  clearing it in the admin reflects across the whole site immediately.

## Deploy (Vercel)

1. Push to a Git repo and import into Vercel.
2. Add all environment variables (above). Create a **Blob** store and set
   `BLOB_READ_WRITE_TOKEN`.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Deploy. Run `npm run db:migrate` against the production Turso database if needed.

## Matek storefront services and imagery

### Company, projects and journal pages

The About page introduces the company, property types, live published services,
working process, principles, projects and FAQs in English and Turkish. Project
pages include system-type filters, original installation photography, an
accessible enlarged-photo dialog, related work and project-specific contact
links. The project editor's rich-text story is rendered as rich text (legacy
plain text is still supported).

The blog includes title/excerpt search, category filtering, reading time,
featured articles, article navigation and links to published services. Articles
remain editable through Admin > Blog. To expand only the original untouched
one-paragraph demo guides on an existing database, use
`npx tsx scripts/enrich-blog.ts`. This idempotent update preserves edited
articles and does not reseed or delete catalogue/order data. New seeds include
the full guides.

### Editing website pages

Use **Admin > Website content** to edit fixed page text in English and Turkish:
About/company story, homepage sections and statistics, FAQs, process steps,
project/blog introductions, consultation panels, navigation, footer, legal
policies and shopping/checkout labels. Lists support adding, removing and
reordering entries. Each section saves both languages atomically to the
`site_content` table; switching languages preserves unsaved changes. A visible
status distinguishes unsaved changes from a successful save. Database failures
and invalid message placeholders are reported without discarding editor text.

Under **Website images & logos**, choose language-specific header/footer logos,
social-sharing artwork, homepage company image, About hero/story images and
the product installation image using the existing media picker. Other entity
images remain in their corresponding product/service/project/article/banner
editors. Contact details, opening hours, currencies and bank information remain
in **Settings**. Layout/code and admin interface text are not page content.

`messages/en.json` and `messages/tr.json` provide defaults; saved section values
override them for both server-rendered pages and client navigation/forms.
New default fields are merged into previously saved sections. Keep ICU
placeholders such as `{count}` and plural formats unchanged when editing labels.
**Restore this section's original content** stages a reset of both languages;
click **Save both languages** to publish it. No other sections or catalogue
entries are reset.

Run `npm run test:content` to check section defaults, saved/default merging,
repeatable-list validation, message placeholders and image URL restrictions.

### English and Turkish content

Product, category, service, project, blog and team forms use **English / Türkçe**
buttons. Enter both versions before saving; switching language does not discard
unsaved values. Visitors see the matching translation on `/en` and `/tr`.
English is used when the translated name/title is omitted. Product and service
SEO titles/descriptions can also be edited per language.
Settings also offers bilingual address, opening hours and payment notes. Contact
details, bank identifiers and social links stay shared. Empty Turkish settings
text falls back to English.

In **Admin → Banners**, supply a default image and optionally override it with
English and Turkish desktop/mobile artwork. Text overlays (eyebrow, title,
subtitle, button) are independent per language. Leave overlay text empty for
artwork that already contains text. Localized images apply to both the hero
slider and promo banners. If a localized desktop image has no localized mobile
image, mobile uses that localized desktop image rather than a potentially
wrong-language default mobile image. Without a localized image, the shared
default is used. Banner links should omit locale prefixes (for example `/shop`).

After updating this version on an existing database, run `npm run db:push` to
add the optional image columns in `banner_translations`, Turkish text columns
in `settings` and the `site_content` table. Apply these additive schema changes
to the production database before deploying the updated app.
No reseeding is necessary.

The EN/TR homepage introduces every published service before the shopping
sections, with inclusions, booking links, WhatsApp contact, a four-stage service
process and residential/commercial guidance. Manage service descriptions,
inclusions, images and starting prices in **Admin → Services**.
Use **New Service** to create a page; publishing also adds it to the homepage,
Services listing and navigation menu. In **Service pricing**, select EUR or TRY,
or clear the amount for **Free quote** without a starting price. Zero is a valid
displayed price. Titles, descriptions, body content, FAQs, steps and SEO fields
support EN/TR editing. Draft services are not shown publicly.

The floating WhatsApp shortcut stays visible on mobile and desktop. On mobile
service and product pages it sits above the fixed quote/purchase action bar,
with extra clearance for the device safe area.

High-resolution illustrative photos live in `public/seed/pexels/`. New service
photos are from Pexels: [solar installation](https://www.pexels.com/photo/30285845/),
[HVAC maintenance](https://www.pexels.com/photo/32588555/),
[outdoor HVAC](https://www.pexels.com/photo/32497161/),
[radiator installation](https://www.pexels.com/photo/29226620/) and
[industrial pipework](https://www.pexels.com/photo/17232659/).
These illustrate services, not completed Matek projects. Original Matek project
photos remain in the project portfolio. Replace illustrative product photos
with exact model photos before accepting real orders.

The seed uses these improved images for fresh demo databases. Do not rerun the
seed to update an existing catalogue: it deletes catalogue content and orders.

## Security

The Turso token and Pexels key live only in `.env.local` (gitignored) and your
Vercel environment — never commit them. **Rotate the Turso auth token** if it has
been shared anywhere.
