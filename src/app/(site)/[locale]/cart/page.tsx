import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { CartView } from "@/components/shop/CartView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("title") };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  return (
    <>
      <PageHero title={t("title")} />
      <section className="py-12">
        <div className="container-luxe">
          <CartView />
        </div>
      </section>
    </>
  );
}
