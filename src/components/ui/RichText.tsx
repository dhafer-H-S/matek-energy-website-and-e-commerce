import { cn } from "@/lib/utils";

/** Renders trusted admin-authored HTML (from the Tiptap editor). */
export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Renders plain text preserving paragraph breaks. */
export function PlainProse({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={cn("flex flex-col gap-4 leading-relaxed", className)}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}
