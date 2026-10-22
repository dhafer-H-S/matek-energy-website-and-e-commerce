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

## Security

The Turso token and Pexels key live only in `.env.local` (gitignored) and your
Vercel environment — never commit them. **Rotate the Turso auth token** if it has
been shared anywhere.
