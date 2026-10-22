export interface EmailJSConfig {
  serviceId?: string;
  publicKey?: string;
  privateKey?: string;
  adminTemplateId?: string;
  customerTemplateId?: string;
}

export type EmailSendResult = { status: "sent"; error: null } | { status: "failed" | "not_configured"; error: string };

export function missingEmailJSConfig(config: EmailJSConfig, audience: "admin" | "customer"): string[] {
  return [
    !config.serviceId && "EMAILJS_SERVICE_ID",
    !config.publicKey && "EMAILJS_PUBLIC_KEY",
    !(audience === "admin" ? config.adminTemplateId : config.customerTemplateId) && (audience === "admin" ? "EMAILJS_ADMIN_TEMPLATE_ID" : "EMAILJS_CUSTOMER_TEMPLATE_ID"),
  ].filter((value): value is string => Boolean(value));
}

export async function sendEmailJS(
  config: EmailJSConfig,
  audience: "admin" | "customer",
  params: Record<string, unknown>,
  fetcher: typeof fetch = fetch,
): Promise<EmailSendResult> {
  const missing = missingEmailJSConfig(config, audience);
  if (missing.length) return { status: "not_configured", error: `Missing configuration: ${missing.join(", ")}` };
  if (new TextEncoder().encode(JSON.stringify(params)).length > 50000) return { status: "failed", error: "Email content exceeds the EmailJS 50 KB template-parameter limit." };
  try {
    const response = await fetcher("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: audience === "admin" ? config.adminTemplateId : config.customerTemplateId,
        user_id: config.publicKey,
        ...(config.privateKey ? { accessToken: config.privateKey } : {}),
        template_params: params,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) return { status: "sent", error: null };
    // Do not persist provider response text: it can contain credentials or customer data.
    return { status: "failed", error: `EmailJS returned HTTP ${response.status}. Check service authorization, templates, API security settings and account quota.` };
  } catch (error) {
    return { status: "failed", error: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
      ? "EmailJS request timed out. Delivery is uncertain; check your EmailJS history before retrying to avoid duplicates."
      : "Could not reach EmailJS. Delivery is uncertain; check your EmailJS history before retrying." };
  }
}
