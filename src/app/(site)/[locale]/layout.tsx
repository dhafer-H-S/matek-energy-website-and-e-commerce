import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { routing, dirFor, locales } from "@/i18n/routing";
import { fontClassFor } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Analytics } from "@/components/analytics/Analytics";
import { Navbar } from "@/components/site/Navbar";
import { CartProvider } from "@/components/shop/CartProvider";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/queries/settings";
import "../../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}/${l}`]),
  );

  const brand = t("brand");
  const tagline = t("tagline");
  const description = t("seoDescription");
  const title = `${brand} — ${tagline}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${brand}`,
    },
    description,
    applicationName: brand,
    authors: [{ name: brand, url: SITE_URL }],
    creator: brand,
    publisher: brand,
    category: "energy",
    keywords: ["solar panels", "air conditioning", "water heaters", "heating systems", "electrical equipment", "Northern Cyprus", "Kyrenia", "Matek Energy"],
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: brand,
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      locale,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [messages, settings] = await Promise.all([
    getMessages(),
    getSettings(),
  ]);

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={cn(fontClassFor(locale), "h-full")}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CartProvider>
            <Navbar locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} locale={locale} />
            <WhatsAppFab number={settings.whatsapp} />
          </CartProvider>
        </NextIntlClientProvider>
        <Analytics
          metaPixelId={settings.metaPixelId}
          gaMeasurementId={settings.gaMeasurementId}
        />
      </body>
    </html>
  );
}
