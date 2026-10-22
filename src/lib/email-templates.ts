import { formatMoney } from "./money";
import type { OrderSummary } from "./whatsapp";

export type EmailKind = "order" | "contact" | "service";
export type EmailAudience = "admin" | "customer";
export type EmailParameters = Record<string, string | boolean | { name: string; quantity: number; unit_price: string; line_total: string; sku: string }[]>;

export interface EmailBusiness {
  orderEmail: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  bankName: string | null;
  bankAccountHolder: string | null;
  bankIban: string | null;
  bankNotes: string | null;
}

interface SubmissionBase {
  id: string;
  locale: string;
  createdAt: Date;
}

export type EmailSubmission =
  | (SubmissionBase & { kind: "order"; order: OrderSummary; channel: "website" | "whatsapp" })
  | (SubmissionBase & {
      kind: "contact" | "service";
      name: string;
      email: string;
      phone: string | null;
      message: string | null;
      sourceType: string;
      sourceLabel: string | null;
      preferredDate: string | null;
    });

export interface EmailDraft {
  id: string;
  entityId: string;
  kind: EmailKind;
  audience: EmailAudience;
  recipient: string;
  params: EmailParameters;
}

function siteBase(siteUrl: string): string {
  const url = new URL(siteUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL without credentials.");
  return url.origin;
}

export function buildEmailDrafts(submission: EmailSubmission, business: EmailBusiness, siteUrl: string): EmailDraft[] {
  const base = siteBase(siteUrl);
  const isOrder = submission.kind === "order";
  const customerEmail = isOrder ? submission.order.email : submission.email;
  const adminEmail = business.orderEmail || business.contactEmail || "matek.energy@gmail.com";
  const name = isOrder ? submission.order.customerName : submission.name;
  const reference = isOrder ? submission.order.orderNumber : `MK-${submission.id.toUpperCase()}`;
  return (["admin", "customer"] as const).flatMap((audience) => {
    if (audience === "customer" && !customerEmail) return [];
    const tr = audience === "customer" && submission.locale === "tr";
    const locale = tr ? "tr" : "en";
    const kindTitle = isOrder ? (tr ? "Sipariş" : "Order") : submission.kind === "service" ? (tr ? "Hizmet talebi" : "Service request") : (tr ? "İletişim talebi" : "Contact enquiry");
    const heading = audience === "admin"
      ? `New ${kindTitle.toLowerCase()} received`
      : isOrder ? (tr ? "Siparişinizi aldık" : "We've received your order")
        : (tr ? "Talebinizi aldık" : "We've received your request");
    const introduction = audience === "admin"
      ? "A customer has submitted the following details on the Matek Energy website. Open the admin panel to follow up."
      : tr ? `Merhaba ${name}, Matek Energy ile iletişime geçtiğiniz için teşekkür ederiz. Bilgileriniz güvenle kaydedildi. Ekibimiz sizinle iletişime geçecektir.`
        : `Hello ${name}, thank you for choosing Matek Energy. Your details have been safely saved and our team will follow up with you.`;
    const nextSteps = isOrder
      ? tr ? "Bu e-posta ödemenin alındığını veya teslimatın onaylandığını göstermez. Ekibimiz stok, teslimat ve ödeme bilgilerini sizinle teyit edecektir."
        : "This is an acknowledgement, not a payment receipt or delivery confirmation. Our team will confirm availability, delivery and payment details with you."
      : tr ? "Bu e-posta randevu veya fiyat teklifi onayı değildir. İhtiyaçlarınızı ve uygun tarihi görüşmek için sizinle iletişime geçeceğiz."
        : "This acknowledgement does not confirm an appointment or a quotation. We will contact you to discuss your requirements and agree on the next steps.";
    const params: EmailParameters = {
      to_email: audience === "admin" ? adminEmail : customerEmail!,
      reply_to: audience === "admin" ? customerEmail || business.contactEmail || adminEmail : business.contactEmail || adminEmail,
      email_subject: `Matek Energy | ${audience === "admin" ? "New " : ""}${kindTitle} | ${reference}`,
      language: locale,
      brand_name: "Matek Energy",
      logo_url: `${base}/brand/logo.png`,
      site_url: `${base}/${locale}`,
      heading,
      introduction,
      kind_label: kindTitle,
      reference,
      reference_label: tr ? "Referans" : "Reference",
      submitted_label: tr ? "Gönderim zamanı" : "Submitted",
      submitted_at: new Intl.DateTimeFormat(tr ? "tr-TR" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Nicosia" }).format(submission.createdAt) + " (Cyprus)",
      customer_label: tr ? "Müşteri" : "Customer",
      customer_name: name,
      customer_email: customerEmail || "",
      customer_phone: isOrder ? submission.order.phone : submission.phone || "",
      email_label: tr ? "E-posta" : "Email",
      phone_label: tr ? "Telefon" : "Phone",
      message_label: tr ? "Mesajınız / notlar" : "Message / notes",
      message: isOrder ? submission.order.notes || "" : submission.message || "",
      is_order: isOrder,
      is_request: !isOrder,
      request_label: tr ? "Talep konusu" : "Request topic",
      request_topic: isOrder ? "" : submission.sourceLabel || kindTitle,
      source_type: isOrder ? submission.channel : submission.sourceType,
      locale: submission.locale.toUpperCase(),
      preferred_date_label: tr ? "Tercih edilen tarih" : "Preferred date",
      preferred_date: isOrder ? "" : submission.preferredDate || "",
      items_label: tr ? "Ürün" : "Product",
      quantity_label: tr ? "Adet" : "Qty",
      price_label: tr ? "Birim fiyat" : "Unit price",
      total_label: tr ? "Toplam" : "Total",
      items: isOrder ? submission.order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: formatMoney(item.unitPrice, item.currency, locale),
        line_total: formatMoney(item.unitPrice * item.quantity, item.currency, locale),
        sku: item.sku || "",
      })) : [],
      total: isOrder ? (["EUR", "TRY"] as const).filter((currency) => submission.order.totals[currency] !== undefined).map((currency) => formatMoney(submission.order.totals[currency], currency, locale)).join(" + ") : "",
      payment_label: tr ? "Ödeme yöntemi" : "Payment method",
      payment_method: isOrder ? submission.order.paymentMethod === "bank_transfer" ? (tr ? "Banka havalesi" : "Bank transfer") : (tr ? "Kapıda ödeme" : "Cash on delivery") : "",
      address_label: tr ? "Teslimat adresi" : "Delivery address",
      customer_address: isOrder ? [submission.order.address, submission.order.city].filter(Boolean).join(", ") : "",
      show_bank: isOrder && audience === "customer" && submission.order.paymentMethod === "bank_transfer" && Boolean(business.bankIban),
      bank_title: tr ? "Banka havalesi bilgileri" : "Bank transfer details",
      bank_name: business.bankName || "",
      bank_holder_label: tr ? "Hesap sahibi" : "Account holder",
      bank_holder: business.bankAccountHolder || "",
      bank_iban: business.bankIban || "",
      bank_notes: business.bankNotes || "",
      bank_reference_note: tr ? "Havale açıklamasına sipariş referansınızı yazın. Transferden önce tutarı ve stok durumunu ekibimizle teyit edin." : "Include your order reference with the transfer. Confirm the amount and availability with our team before transferring.",
      next_steps_label: tr ? "Sonraki adımlar" : "What happens next",
      next_steps: nextSteps,
      action_url: audience === "admin" ? isOrder ? `${base}/admin/orders/${encodeURIComponent(submission.id)}` : `${base}/admin/enquiries` : `${base}/${locale}/contact`,
      action_label: audience === "admin" ? "Open in Matek Admin" : tr ? "Bizimle iletişime geçin" : "Contact our team",
      contact_email: business.contactEmail || adminEmail,
      contact_phone: business.contactPhone || "",
      footer_note: tr ? "Matek Energy web sitesindeki talebiniz üzerine otomatik olarak gönderilmiştir." : "Automatically sent in response to your submission on the Matek Energy website.",
    };
    return [{ id: crypto.randomUUID(), entityId: submission.id, kind: submission.kind, audience, recipient: String(params.to_email), params }];
  });
}
