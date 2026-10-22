"use client";

import { useActionState } from "react";
import { saveProduct, type ProductFormState } from "@/app/(admin)/admin/(dashboard)/products/actions";
import { FormSection, TextField, SelectField, Switch, SubmitButton } from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import { TranslatedRichText } from "@/components/admin/form/RichTextField";
import { ImageField, GalleryField } from "@/components/admin/form/ImageField";
import type { Product, ProductTranslation } from "@/lib/db/schema";
import { trText, specsText, ErrorNote } from "./shared";

export function ProductForm({
  product,
  translations,
  categories,
}: {
  product?: Product;
  translations?: ProductTranslation[];
  categories: { value: string; label: string }[];
}) {
  const [state, action] = useActionState<ProductFormState, FormData>(
    saveProduct.bind(null, product?.id ?? null),
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection title="Content">
        <LangTabs>
          <TranslatedField label="Product name" name="name" required values={trText(translations, "name")} />
          <TranslatedField
            label="Short description"
            name="shortDescription"
            type="textarea"
            rows={2}
            values={trText(translations, "shortDescription")}
          />
          <TranslatedRichText label="Full description" name="description" values={trText(translations, "description")} />
          <TranslatedField
            label="Specifications"
            name="specs"
            type="textarea"
            rows={5}
            values={specsText(translations)}
          />
        </LangTabs>
        <p className="text-xs text-muted">Specifications: one per line as “Label: Value”.</p>
      </FormSection>

      <FormSection title="Category & pricing">
        <SelectField
          label="Category"
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
          options={[{ value: "", label: "Select a category…" }, ...categories]}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            label="Currency"
            name="currency"
            defaultValue={product?.currency ?? "EUR"}
            options={[
              { value: "EUR", label: "Euro (€)" },
              { value: "TRY", label: "Turkish Lira (₺)" },
            ]}
          />
          <TextField label="Price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? 0} />
          <TextField
            label="Sale price"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.salePrice ?? ""}
            hint="Optional discounted price."
          />
        </div>
        <Switch
          label="Quote only"
          name="quoteOnly"
          defaultChecked={product?.quoteOnly ?? false}
          hint="Hide the price and ask customers to request a quote."
        />
      </FormSection>

      <FormSection title="Media">
        <ImageField label="Main image" name="image" defaultValue={product?.image} />
        <GalleryField label="Gallery" name="gallery" defaultValue={product?.gallery} />
      </FormSection>

      <FormSection title="Inventory & visibility">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="SKU" name="sku" defaultValue={product?.sku ?? ""} />
          <TextField label="Brand" name="brand" defaultValue={product?.brand ?? ""} />
          <TextField label="Stock quantity" name="stock" type="number" min="0" defaultValue={product?.stock ?? ""} hint="Leave empty if not tracked." />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
          <TextField label="Slug" name="slug" defaultValue={product?.slug} placeholder="auto-generated" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Switch label="In stock" name="inStock" defaultChecked={product?.inStock ?? true} />
          <Switch label="Featured on home" name="featured" defaultChecked={product?.featured ?? false} />
          <Switch label="Mark as new" name="isNew" defaultChecked={product?.isNew ?? false} />
          <Switch label="Published" name="published" defaultChecked={product?.published ?? true} />
        </div>
      </FormSection>
      <ErrorNote message={state.error} />
      <SubmitButton>{product ? "Save changes" : "Create product"}</SubmitButton>
    </form>
  );
}
