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
4. Before deploying this version, apply the reviewed additive schema changes
   with `npm run db:push` against the **production Turso database**. Do not
   reseed an existing database. Keep the production and local URLs separate.
5. Deploy, then test the public pages, admin login and notification delivery.

### Vercel build: `URL_INVALID: The URL 'undefined'`

This means `TURSO_DATABASE_URL` was not supplied to the build. It is not an
email or `/api/media` bug: the media route imports the shared database client,
so Next.js encounters the missing database configuration while collecting it.

In **Vercel > Project > Settings > Environment Variables**, add:

- `TURSO_DATABASE_URL`: your remote `libsql://...turso.io` URL (not an auth
  token and not the local `file:./data/matek.db` URL).
- `TURSO_AUTH_TOKEN`: the token authorized for that database.
- Also configure `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` and the Gmail email
  variables listed below; configure Blob/Pexels variables for the corresponding
  features.

Enable variables for **Production and Preview** if both deployment types need
them, save, and **redeploy**. Existing deployments do not acquire new values.
The local `.env.local` file is gitignored and is not uploaded to Vercel; never
commit it to work around this. Confirm you are changing the correct Vercel
project and that its Root Directory points to the Matek app containing
`package.json` (the Matek subfolder if deploying this parent repository).
The database URL is server-only and must not use a `NEXT_PUBLIC_` prefix.

### Moving the existing local Matek content to its own Turso database

In the **Matek app's** `.env.local`, set `TURSO_DATABASE_URL` to
`libsql://matek-energy-website-and-e-commerce-dhaferhs.aws-us-east-1.turso.io`
and `TURSO_AUTH_TOKEN` to a fresh **database auth token for that database**.
An organization/account API token is not a database auth token.

Run `npm run db:transfer-matek` from the Matek app directory. It reads the
existing `data/matek.db`, checks the source is Matek, and refuses to modify
any remote database other than the exact Matek destination. The destination
must have no user tables. Schema, content, admin accounts and settings are
copied together in a transaction, then every record and foreign key is checked.
The source database is not deleted or reseeded; Aura is never accessed.
Do not run `db:push` first for this transfer: the script creates the source
schema itself and deliberately refuses an already initialized destination.

Restart the local server after changing database configuration, set the same
Matek URL and database token in Vercel, and redeploy. Never commit environment
files or share the token.

## Matek storefront services and imagery

### Automatic emails with Gmail (Nodemailer)

New orders, contact messages, service quotations and appointment requests are
saved in the Matek database **together with** their notification records.
The server then sends one Matek notification and one customer acknowledgement
(the customer email is skipped only when checkout has no email address).
Delivery runs server-side through Gmail SMTP (Nodemailer); it does not depend on
the browser. If server execution is interrupted, the saved notification records
remain available for manual retry. Website and WhatsApp checkout both notify
Matek. Email HTML is rendered in `src/lib/email-templates.ts`, and all
customer-provided text is HTML-escaped.

**Set up Gmail sending before expecting real emails:**

1. Use a Gmail (or Google Workspace) account for sending, e.g.
   `matek.energy@gmail.com`. Enable **2-Step Verification** on that account.
2. Create a 16-character **App Password** at
   <https://myaccount.google.com/apppasswords> (choose "Mail"). This is **not**
   the normal account password, and it only ever goes in server environment
   variables — never in the website source, admin content, a `NEXT_PUBLIC_`
   variable, or version control.
3. Add these **server-only** environment variables in `.env.local` and in
   Vercel (Production + Preview):

   | Variable | Value |
   | --- | --- |
   | `GMAIL_USER` | the sending Gmail address |
   | `GMAIL_APP_PASSWORD` | the 16-character App Password (spaces are ignored) |
   | `MAIL_FROM_NAME` | optional sender name; defaults to `Matek Energy` |

   Restart locally / redeploy on Vercel after changing variables.
4. Set `NEXT_PUBLIC_SITE_URL` to your public HTTPS domain in production. Email
   buttons and the admin links use this origin.
5. Apply the additive database change with `npm run db:push` before deployment
   (creates `email_notifications`). Do **not** reseed an existing database.
   Configure **Order & enquiry notification email** and **Contact Email** under
   Admin > Settings; set the bank account/IBAN there to include bank-transfer
   instructions in customer order emails. The notification email receives all
   Matek notifications (default `matek.energy@gmail.com`); the Contact Email is
   the public reply-to address.
6. Submit a test order, contact message and service request with an inbox you
   control, then check the inbox (and spam) and **Admin > Email notifications**.

The sending account and the business notification address can differ. Emails are
sent **from** `GMAIL_USER`; the **Reply-To** is set to the customer (on Matek
notifications) or to the business Contact Email (on customer confirmations), so
replies reach the right place.

**Email content**

- Matek receives customer details, submission reference/date, source/language,
  order products with quantities/SKUs, separate EUR/TRY totals, payment method,
  address/notes, or the request topic/message/preferred date and an admin link.
- Customer acknowledgements follow EN/TR, include the submitted summary and
  next steps, and provide a contact link. Bank-transfer orders include
  configured bank details and reference instructions. They never claim that
  payment, delivery, an appointment or a quoted price has been confirmed.
- Emails use inline styles and table layouts for broad mail-client support, and
  ship with a plain-text alternative part.

**Delivery status and retries**

Use **Admin > Email notifications** to see pending/sending/sent/failed/not
configured states separately for Matek and the customer. Orders and enquiries
link to their related notifications. Sent means **Gmail accepted the message**;
confirm actual delivery in the recipient inbox/spam. Missing setup and
connection/authentication failures are shown explicitly. Customers are told that
the submission is saved if email cannot be confirmed, and must not submit again.

After fixing setup, retry an individual unsent notification from this page.
There are no automatic retry loops or cron jobs. Sending is serialized within a
server instance. Gmail enforces daily sending limits (~500/day for consumer
accounts); production public forms should use suitable spam/CAPTCHA protection
and monitoring before being promoted broadly.

Retries cannot resend a record already marked sent; concurrent attempts claim
the same record atomically. An interrupted sending attempt becomes retryable
after two minutes. An interrupted send may already have been delivered, so
retrying can produce a duplicate. Deleting an order/enquiry cascades its
notification records, including the stored rendered email.

Run `npm run test:email` for recipient, language, escaping, bank-detail and
configuration checks. Live delivery still requires the real Gmail configuration
and an inbox test; automated tests do not send email.

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
