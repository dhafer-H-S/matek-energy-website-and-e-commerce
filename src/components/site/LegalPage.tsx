import { PageHero } from "@/components/site/PageHero";

export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <>
      <PageHero title={title} />
      <section className="py-16">
        <div className="container-luxe max-w-3xl">
          <p className="text-lg leading-relaxed text-muted">{body}</p>
        </div>
      </section>
    </>
  );
}
