import { PageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/forms/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Insight" description="Write a new journal article." />
      <BlogForm />
    </div>
  );
}
