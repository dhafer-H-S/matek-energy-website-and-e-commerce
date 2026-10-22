import assert from "node:assert/strict";
import test from "node:test";
import { contentDefaults, contentSections, mergeContent } from "./content";
import { validateContent } from "./content-validation";

test("every editable section has valid English and Turkish defaults", () => {
  for (const locale of ["en", "tr"] as const) {
    for (const section of Object.keys(contentSections)) {
      assert.equal(validateContent(contentDefaults[locale][section], contentDefaults[locale][section], section), null, `${locale}.${section}`);
    }
  }
});

test("saved copy overrides defaults while newly introduced fields survive", () => {
  const result = mergeContent({
    title: "Original",
    group: { title: "Default title", newField: "New field" },
    items: [{ title: "Item", newField: "New item field" }],
  }, {
    title: "Saved",
    group: { title: "Edited" },
    items: [{ title: "Edited item" }, { title: "Added item" }],
    obsolete: "Ignored",
  });
  assert.deepEqual(result, {
    title: "Saved",
    group: { title: "Edited", newField: "New field" },
    items: [{ title: "Edited item", newField: "New item field" }, { title: "Added item", newField: "New item field" }],
  });
});

test("intentionally emptied lists stay empty and invalid field types use defaults", () => {
  assert.deepEqual(mergeContent({ title: "Default", items: ["Default"] }, { title: null, items: [] }), { title: "Default", items: [] });
  assert.deepEqual(mergeContent({ items: [{ title: "Default" }] }, { items: [null] }), { items: [{ title: "Default" }] });
  assert.deepEqual(mergeContent({ items: ["Default"] }, { items: "Invalid" }), { items: ["Default"] });
});

test("ICU validation preserves interpolation, plural rules and rich-text tags", () => {
  const template = "{count, plural, =0 {No products} one {# product} other {# products}}";
  assert.equal(validateContent("{count, plural, one {# item} other {# items}}", template, "shop.results"), null);
  for (const invalid of ["No products", "{count}", "{quantity, plural, one {One} other {Many}}", "{count, plural, one {One}}"]) {
    assert.ok(validateContent(invalid, template, "shop.results"));
  }
  assert.ok(validateContent("Reading time", "{minutes} min read", "blog.readingTime"));
  assert.ok(validateContent("<b>Read</b>", "<strong>Read</strong>", "shop.read"));
  assert.equal(validateContent("Read {minutes} minutes", "{minutes} min read", "blog.readingTime"), null);
});

test("content validation rejects missing/extra keys, invalid arrays and large input", () => {
  const template = { title: "Title", faqs: [{ q: "Question", a: "Answer" }] };
  assert.equal(validateContent({ title: "", faqs: [] }, template, "about"), null);
  assert.equal(validateContent({ title: "New", faqs: [{ q: "Q", a: "A" }, { q: "Q2", a: "A2" }] }, template, "about"), null);
  assert.ok(validateContent({ title: "New" }, template, "about"));
  assert.ok(validateContent({ ...template, injected: "Not allowed" }, template, "about"));
  assert.ok(validateContent({ title: "New", faqs: [{ q: 42, a: "Answer" }] }, template, "about"));
  assert.ok(validateContent({ title: "New", faqs: Array.from({ length: 31 }, () => template.faqs[0]) }, template, "about"));
  assert.ok(validateContent("a".repeat(20001), "Title", "about.title"));
});

test("image validation accepts configured hosts and rejects unsafe sources", () => {
  for (const source of ["/brand/logo.png", "/uploads/photo.jpg", "https://images.pexels.com/photos/123/image.jpg", "https://abc.public.blob.vercel-storage.com/image.jpg"]) {
    assert.equal(validateContent(source, "/default.png", "media.logo"), null);
  }
  for (const source of ["", "//example.com/image.jpg", "http://images.pexels.com/image.jpg", "https://example.com/image.jpg", "javascript:alert(1)", "/\\example.com/image.jpg", "/image-{invalid}.jpg", "https://user:password@images.pexels.com/image.jpg"]) {
    assert.ok(validateContent(source, "/default.png", "media.logo"), source);
  }
});
