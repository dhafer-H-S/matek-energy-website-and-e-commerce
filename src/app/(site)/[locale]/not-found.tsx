import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-background-alt text-center">
      <div className="container-luxe">
        <p className="font-display text-7xl font-semibold text-brand">404</p>
        <h1 className="mt-4 font-display text-3xl text-navy sm:text-4xl">{t("notFoundTitle")}</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">{t("notFoundText")}</p>
        <Link href="/" className={`${buttonVariants({ size: "lg" })} mt-8`}>
          {t("backHome")}
        </Link>
      </div>
    </section>
  );
}
