import english from "../../messages/en.json";
import turkish from "../../messages/tr.json";

export type ContentValue = string | ContentValue[] | { [key: string]: ContentValue };
export type ContentSection = { [key: string]: ContentValue };

export const contentDefaults: Record<"en" | "tr", Record<string, ContentSection>> = {
  en: english,
  tr: turkish,
};

export const contentSections: Record<string, { label: string; description: string }> = {
  about: { label: "About the company", description: "Company story, mission, audiences, working process, principles and FAQs." },
  home: { label: "Homepage", description: "Section headings, company introduction, benefits, statistics and FAQs." },
  projects: { label: "Projects page", description: "Portfolio introduction, filters, gallery labels and project enquiry text. Edit individual projects under Projects." },
  blog: { label: "Blog pages", description: "Journal introduction, topic cards, article labels and advice panels. Edit articles under Blog." },
  editorial: { label: "Consultation panels", description: "The consultation and WhatsApp panels on About, projects and blog pages." },
  media: { label: "Website images & logos", description: "Header/footer logos, homepage company image, About page images and product installation image. Select separate EN/TR artwork if needed." },
  services: { label: "Services page", description: "Services introduction, benefits, labels and booking copy. Edit individual services under Services." },
  shop: { label: "Shop & product pages", description: "Shop headings, product labels, installation promotion and purchase instructions." },
  common: { label: "Brand & shared text", description: "Brand name, tagline, SEO description, shared buttons and form messages." },
  nav: { label: "Navigation", description: "Menu labels, search text and announcement. Contact details and opening hours are in Settings." },
  footer: { label: "Footer", description: "Company summary, link group headings, copyright and payment summary." },
  contact: { label: "Contact page", description: "Contact headings and labels. Address, phone and email are in Settings." },
  appointment: { label: "Appointments", description: "Booking introduction and available request topics." },
  team: { label: "Team page", description: "Team introduction and consultation copy. Edit individual profiles under Team." },
  cart: { label: "Shopping cart", description: "Cart labels and empty-cart messages." },
  checkout: { label: "Checkout & confirmation", description: "Checkout forms, payment labels and order confirmation text. Bank details are in Settings." },
  legal: { label: "Privacy & terms", description: "Privacy policy and terms text. Review these policies for your business before publishing." },
};

export function isContentObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeValue(template: ContentValue, saved: unknown): ContentValue {
  if (typeof template === "string") return typeof saved === "string" ? saved : template;
  if (Array.isArray(template)) {
    if (!Array.isArray(saved)) return template;
    if (!template.length) return [];
    return saved.map((item, index) => mergeValue(template[index] ?? template[0], item));
  }
  return mergeContent(template, isContentObject(saved) ? saved : {});
}

export function mergeContent(defaults: ContentSection, saved: Record<string, unknown>): ContentSection {
  return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [
    key, mergeValue(value, Object.hasOwn(saved, key) ? saved[key] : undefined),
  ]));
}
