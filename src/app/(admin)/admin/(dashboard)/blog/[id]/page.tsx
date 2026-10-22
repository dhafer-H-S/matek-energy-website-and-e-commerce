import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/forms/BlogForm";
import { getBlogPostForEdit } from "@/lib/admin/queries";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBlogPostForEdit(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Insight" description={`/${data.post.slug}`} />
      <BlogForm post={data.post} translations={data.translations} />
    </div>
  );
}
