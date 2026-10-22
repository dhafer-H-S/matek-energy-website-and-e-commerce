import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default function AdminMediaPage() {
  return (
    <>
      <PageHeader
        title="Media Library"
        description="Upload and manage images and videos used across the site."
      />
      <MediaLibrary />
    </>
  );
}
