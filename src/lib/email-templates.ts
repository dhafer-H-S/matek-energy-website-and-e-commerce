import { formatMoney } from "./money";
import type { OrderSummary } from "./whatsapp";

export type EmailKind = "order" | "contact" | "service";
export type EmailAudience = "admin" | "customer";

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

/** A fully rendered email ready for an SMTP transport. */
export interface EmailMessage {
  id: string;
  entityId: string;
  kind: EmailKind;
  audience: EmailAudience;
  recipient: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}

const BRAND = "#5d8b73";
const NAVY = "#132e43";

/** Escape user-controlled text for safe HTML interpolation. */
function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Escape and convert newlines to <br> for multi-line user text. */
function escMultiline(value: string): string {
  return esc(value).replaceAll("\n", "<br>");
}

function siteBase(siteUrl: string): string {
  const url = new URL(siteUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL without credentials.");
  }
  return url.origin;
}

function row(label: string, value: string, multiline = false): string {
  if (!value) return "";
  return `<tr><td style="padding:6px 0;color:#60717c;width:130px;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;word-break:break-word;">${multiline ? escMultiline(value) : esc(value)}</td></tr>`;
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background:${BRAND};border-radius:8px;"><a href="${esc(url)}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${esc(label)}</a></td></tr></table>`;
}

function shell(base: string, locale: string, subject: string, bodyInner: string, footer: string): string {
  return `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#eef3f1;color:${NAVY};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f1;"><tr><td align="center" style="padding:26px 12px;">
<table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:22px 28px;border-top:6px solid ${BRAND};"><a href="${esc(base)}/${locale}" style="text-decoration:none;color:${NAVY};font-size:22px;font-weight:bold;letter-spacing:0.5px;">Matek Energy</a></td></tr>
${bodyInner}
<tr><td style="padding:20px 28px;background:#eef3f1;font-size:12px;line-height:1.7;color:#60717c;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

export function buildEmailMessages(submission: EmailSubmission, business: EmailBusiness, siteUrl: string): EmailMessage[] {
  const base = siteBase(siteUrl);
  const isOrder = submission.kind === "order";
  const customerEmail = isOrder ? submission.order.email : submission.email;
  const adminEmail = business.orderEmail || business.contactEmail || "matek.energy@gmail.com";
  const name = isOrder ? submission.order.customerName : submission.name;
  const reference = isOrder ? submission.order.orderNumber : `MK-${submission.id.toUpperCase()}`;

  return (["admin", "customer"] as const).flatMap<EmailMessage>((audience) => {
    if (audience === "customer" && !customerEmail) return [];
    const tr = audience === "customer" && submission.locale === "tr";
    const locale = tr ? "tr" : "en";
    const kindTitle = isOrder
      ? (tr ? "Sipariş" : "Order")
      : submission.kind === "service"
        ? (tr ? "Hizmet talebi" : "Service request")
        : (tr ? "İletişim talebi" : "Contact enquiry");
    const subject = `Matek Energy | ${audience === "admin" ? "New " : ""}${kindTitle} | ${reference}`;
    const to = audience === "admin" ? adminEmail : customerEmail!;
    const replyTo = audience === "admin"
      ? customerEmail || business.contactEmail || adminEmail
      : business.contactEmail || adminEmail;
    const submittedAt = new Intl.DateTimeFormat(tr ? "tr-TR" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Nicosia" }).format(submission.createdAt) + " (Cyprus)";

    const heading = audience === "admin"
      ? `New ${kindTitle.toLowerCase()} received`
      : isOrder ? (tr ? "Siparişinizi aldık" : "We've received your order")
        : (tr ? "Talebinizi aldık" : "We've received your request");
    const introduction = audience === "admin"
      ? "A customer submitted the following details on the Matek Energy website. Open the admin panel to follow up."
      : tr ? `Merhaba ${name}, Matek Energy ile iletişime geçtiğiniz için teşekkür ederiz. Bilgileriniz güvenle kaydedildi ve ekibimiz sizinle iletişime geçecektir.`
        : `Hello ${name}, thank you for choosing Matek Energy. Your details have been safely saved and our team will follow up with you.`;
    const nextSteps = isOrder
      ? tr ? "Bu e-posta ödemenin alındığını veya teslimatın onaylandığını göstermez. Ekibimiz stok, teslimat ve ödeme bilgilerini sizinle teyit edecektir."
        : "This is an acknowledgement, not a payment receipt or delivery confirmation. Our team will confirm availability, delivery and payment with you."
      : tr ? "Bu e-posta randevu veya fiyat teklifi onayı değildir. İhtiyaçlarınızı ve uygun tarihi görüşmek için sizinle iletişime geçeceğiz."
        : "This acknowledgement does not confirm an appointment or a quotation. We will contact you to discuss your requirements and next steps.";

    const refLabel = tr ? "Referans" : "Reference";
    const sections: string[] = [];
    const textLines: string[] = [heading, "", `${refLabel}: ${reference}`, submittedAt, ""];

    sections.push(`<tr><td style="padding:26px 28px;background:${NAVY};color:#ffffff;"><p style="margin:0 0 10px;color:#a9d9be;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Matek Energy · ${esc(kindTitle)}</p><h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;">${esc(heading)}</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#e0e9ee;">${esc(introduction)}</p></td></tr>`);
    sections.push(`<tr><td style="padding:22px 28px 0;"><p style="margin:0 0 4px;font-size:12px;color:#60717c;">${esc(refLabel)}</p><p style="margin:0 0 8px;font-size:20px;font-weight:bold;word-break:break-word;">${esc(reference)}</p><p style="margin:0;font-size:12px;color:#60717c;">${esc(submittedAt)}${audience === "admin" ? ` · ${esc(isOrder ? submission.channel : submission.sourceType)} · ${esc(submission.locale.toUpperCase())}` : ""}</p></td></tr>`);

    if (audience === "admin") {
      const details = [
        row(tr ? "Müşteri" : "Name", name),
        row("Email", customerEmail || ""),
        row(tr ? "Telefon" : "Phone", isOrder ? submission.order.phone : submission.phone || ""),
        isOrder ? row(tr ? "Teslimat adresi" : "Address", [submission.order.address, submission.order.city].filter(Boolean).join(", "), true) : "",
        !isOrder ? row(tr ? "Talep konusu" : "Request topic", submission.sourceLabel || kindTitle) : "",
        !isOrder ? row(tr ? "Tercih edilen tarih" : "Preferred date", submission.preferredDate || "") : "",
      ].join("");
      sections.push(`<tr><td style="padding:22px 28px 0;"><h2 style="margin:0 0 10px;font-size:17px;">Customer details</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6;">${details}</table></td></tr>`);
      textLines.push(`Name: ${name}`, customerEmail ? `Email: ${customerEmail}` : "", `Phone: ${isOrder ? submission.order.phone : submission.phone || "-"}`);
    }

    if (isOrder) {
      const itemsLabel = tr ? "Ürün" : "Product";
      const qtyLabel = tr ? "Adet" : "Qty";
      const totalLabel = tr ? "Toplam" : "Total";
      const rows = submission.order.items.map((item) => {
        const lineTotal = formatMoney(item.unitPrice * item.quantity, item.currency, locale);
        const unit = formatMoney(item.unitPrice, item.currency, locale);
        textLines.push(`- ${item.quantity} x ${item.name} (${unit}) = ${lineTotal}`);
        return `<tr><td style="padding:10px 8px;border-bottom:1px solid #e3e9e6;word-break:break-word;">${esc(item.name)}<br><span style="font-size:11px;color:#60717c;">${esc(unit)}${item.sku ? ` · ${esc(item.sku)}` : ""}</span></td><td style="padding:10px 8px;border-bottom:1px solid #e3e9e6;">${item.quantity}</td><td style="padding:10px 8px;border-bottom:1px solid #e3e9e6;text-align:right;">${esc(lineTotal)}</td></tr>`;
      }).join("");
      const total = (["EUR", "TRY"] as const)
        .filter((currency) => submission.order.totals[currency] !== undefined)
        .map((currency) => formatMoney(submission.order.totals[currency], currency, locale))
        .join(" + ");
      const payment = submission.order.paymentMethod === "bank_transfer" ? (tr ? "Banka havalesi" : "Bank transfer") : (tr ? "Kapıda ödeme" : "Cash on delivery");
      sections.push(`<tr><td style="padding:22px 28px 0;"><table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;text-align:left;"><tr style="background:#eef3f1;"><th style="padding:9px 8px;">${esc(itemsLabel)}</th><th style="padding:9px 8px;">${esc(qtyLabel)}</th><th style="padding:9px 8px;text-align:right;">${esc(totalLabel)}</th></tr>${rows}</table><p style="text-align:right;font-size:20px;font-weight:bold;color:${BRAND};margin:12px 0 4px;">${esc(totalLabel)}: ${esc(total)}</p><p style="margin:0;font-size:14px;">${esc(tr ? "Ödeme yöntemi" : "Payment method")}: <strong>${esc(payment)}</strong></p></td></tr>`);
      textLines.push(`${totalLabel}: ${total}`, `${tr ? "Ödeme" : "Payment"}: ${payment}`);
    }

    if (!isOrder && audience === "customer") {
      const topic = submission.sourceLabel || kindTitle;
      sections.push(`<tr><td style="padding:22px 28px 0;"><h2 style="margin:0 0 8px;font-size:17px;">${esc(tr ? "Talep konusu" : "Request topic")}</h2><p style="margin:0;font-size:15px;line-height:1.6;word-break:break-word;">${esc(topic)}</p>${submission.preferredDate ? `<p style="margin:8px 0 0;font-size:14px;">${esc(tr ? "Tercih edilen tarih" : "Preferred date")}: <strong>${esc(submission.preferredDate)}</strong></p>` : ""}</td></tr>`);
      textLines.push(`${tr ? "Talep" : "Request"}: ${topic}`);
    }

    const messageText = isOrder ? submission.order.notes || "" : submission.message || "";
    if (messageText) {
      sections.push(`<tr><td style="padding:20px 28px 0;"><div style="padding:16px;background:#f5f7f6;border-left:4px solid ${BRAND};"><h2 style="margin:0 0 8px;font-size:15px;">${esc(tr ? "Mesaj / notlar" : "Message / notes")}</h2><p style="margin:0;font-size:14px;line-height:1.7;word-break:break-word;">${escMultiline(messageText)}</p></div></td></tr>`);
      textLines.push("", `${tr ? "Mesaj" : "Message"}: ${messageText}`);
    }

    const showBank = isOrder && audience === "customer" && submission.order.paymentMethod === "bank_transfer" && Boolean(business.bankIban);
    if (showBank) {
      const bankRef = tr ? "Havale açıklamasına sipariş referansınızı yazın. Transferden önce tutarı ve stok durumunu ekibimizle teyit edin." : "Include your order reference with the transfer. Confirm the amount and availability with our team before transferring.";
      const bankRows = [
        row(tr ? "Banka" : "Bank", business.bankName || ""),
        row(tr ? "Hesap sahibi" : "Account holder", business.bankAccountHolder || ""),
        row("IBAN", business.bankIban || ""),
        business.bankNotes ? row(tr ? "Notlar" : "Notes", business.bankNotes, true) : "",
      ].join("");
      sections.push(`<tr><td style="padding:20px 28px 0;"><div style="padding:16px;background:#eef3f1;border-radius:10px;"><h2 style="margin:0 0 10px;font-size:16px;">${esc(tr ? "Banka havalesi bilgileri" : "Bank transfer details")}</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6;">${bankRows}</table><p style="margin:10px 0 0;font-size:13px;line-height:1.6;color:#60717c;">${esc(bankRef)}</p></div></td></tr>`);
    }

    const actionUrl = audience === "admin"
      ? isOrder ? `${base}/admin/orders/${encodeURIComponent(submission.id)}` : `${base}/admin/enquiries`
      : `${base}/${locale}/contact`;
    const actionLabel = audience === "admin" ? "Open in Matek Admin" : tr ? "Bizimle iletişime geçin" : "Contact our team";
    sections.push(`<tr><td style="padding:22px 28px 26px;"><h2 style="margin:0 0 8px;font-size:17px;">${esc(tr ? "Sonraki adımlar" : "What happens next")}</h2><p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#60717c;">${esc(nextSteps)}</p>${button(actionUrl, actionLabel)}</td></tr>`);
    textLines.push("", nextSteps, `${actionLabel}: ${actionUrl}`);

    const footer = audience === "admin"
      ? `<strong>Matek Energy</strong> · Internal notification<br>Reply to reach the customer when an email was provided. Treat customer-provided content as unverified.`
      : `<strong>Matek Energy</strong><br>${esc(business.contactEmail || adminEmail)}${business.contactPhone ? ` · ${esc(business.contactPhone)}` : ""}<br><br>${esc(tr ? "Matek Energy web sitesindeki talebiniz üzerine otomatik olarak gönderilmiştir." : "Automatically sent in response to your submission on the Matek Energy website.")}`;

    const html = shell(base, locale, subject, sections.join(""), footer);
    const text = textLines.filter((line) => line !== "").join("\n");

    return [{
      id: crypto.randomUUID(),
      entityId: submission.id,
      kind: submission.kind,
      audience,
      recipient: to,
      replyTo,
      subject,
      html,
      text,
    }];
  });
}
