import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { getSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title") };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const s = await getSettings();
  return (
    <>
      <PageHero title={t("title")} />
      <section className="py-12">
        <div className="container-luxe">
          <CheckoutForm
            bank={{ name: s.bankName, holder: s.bankAccountHolder, iban: s.bankIban, notes: s.bankNotes }}
          />
        </div>
      </section>
    </>
  );
}
