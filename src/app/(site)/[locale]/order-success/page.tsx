import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SuccessView } from "@/components/shop/SuccessView";

export const metadata: Metadata = { robots: { index: false } };

export default async function OrderSuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="py-16">
      <div className="container-luxe max-w-2xl">
        <SuccessView />
      </div>
    </section>
  );
}
