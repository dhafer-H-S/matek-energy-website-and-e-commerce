/**
 * Renders one or more JSON-LD structured-data blocks. Server component.
 * Uses a stable serializer; `<` is escaped to prevent breaking out of the
 * script context when values contain user-provided text.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | (Record<string, unknown> | null)[] }) {
  const blocks = (Array.isArray(data) ? data : [data]).filter(
    (block): block is Record<string, unknown> => Boolean(block),
  );
  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
