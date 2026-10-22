import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildEmailDrafts, type EmailBusiness, type EmailSubmission } from "./email-templates";
import { missingEmailJSConfig, sendEmailJS, type EmailJSConfig } from "./emailjs-transport";

const business: EmailBusiness = {
  orderEmail: "orders@example.com", contactEmail: "contact@example.com", contactPhone: "+90 555 000 0000",
  bankName: "Test bank", bankAccountHolder: "Matek Energy", bankIban: "TEST-IBAN", bankNotes: "Test bank instructions",
};
const config: EmailJSConfig = {
  serviceId: "test_service", publicKey: "test_public", privateKey: "test_private",
  adminTemplateId: "admin_template", customerTemplateId: "customer_template",
};
const order: EmailSubmission = {
  id: "order-test-id", kind: "order", locale: "tr", createdAt: new Date("2026-10-22T12:00:00Z"), channel: "website",
  order: {
    orderNumber: "MK-TEST", customerName: "Test Customer", email: "customer@example.com", phone: "+90 555 111 1111",
    address: "Test street", city: "Kyrenia", notes: "<script>alert('test')</script>", paymentMethod: "bank_transfer",
    items: [
      { productId: "p1", slug: "p1", name: "Test solar panel", image: null, sku: "P1", unitPrice: 100, currency: "EUR", quantity: 2 },
      { productId: "p2", slug: "p2", name: "Cable", image: null, sku: null, unitPrice: 0, currency: "TRY", quantity: 1 },
    ],
    totals: { EUR: 200, TRY: 0 },
  },
};
const request: EmailSubmission = {
  id: "request-test-id", kind: "service", locale: "tr", createdAt: order.createdAt,
  name: "Test Customer", email: "customer@example.com", phone: "+90 555 111 1111", message: "<b>Do not render as HTML</b>",
  sourceType: "quote", sourceLabel: "Solar installation", preferredDate: "2026-11-01",
};

test("orders create distinct admin/customer emails with correct recipients, totals and secure links", () => {
  const [admin, customer] = buildEmailDrafts(order, business, "https://matek.example/");
  assert.equal(admin.recipient, business.orderEmail);
  assert.equal(customer.recipient, order.order.email);
  assert.equal(admin.params.reply_to, order.order.email);
  assert.equal(customer.params.reply_to, business.contactEmail);
  assert.equal(admin.params.language, "en");
  assert.equal(customer.params.language, "tr");
  assert.equal(admin.params.action_url, "https://matek.example/admin/orders/order-test-id");
  assert.equal(customer.params.action_url, "https://matek.example/tr/contact");
  assert.notEqual(admin.id, customer.id);
  assert.match(String(customer.params.total), /200/);
  assert.match(String(customer.params.total), /0/);
  assert.equal(customer.params.show_bank, true);
  assert.equal(admin.params.show_bank, false);
  assert.match(String(customer.params.next_steps), /ödemenin alındığını/);
  assert.ok(Array.isArray(customer.params.items));
  assert.equal(customer.params.items[0].quantity, 2);
  assert.equal(customer.params.items[0].sku, "P1");
  assert.equal(customer.params.message, order.order.notes);
});

test("cash orders omit bank details and an absent customer email creates admin notification only", () => {
  const drafts = buildEmailDrafts({ ...order, locale: "en", order: { ...order.order, email: null, paymentMethod: "cash_on_delivery" } }, business, "https://matek.example");
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].audience, "admin");
  assert.equal(drafts[0].params.reply_to, business.contactEmail);
  assert.equal(drafts[0].params.show_bank, false);
});

test("contact, service and appointment requests include topic, preferred date and accurate acknowledgement", () => {
  for (const kind of ["contact", "service"] as const) {
    for (const locale of ["en", "tr"]) {
      const [admin, customer] = buildEmailDrafts({ ...request, kind, locale }, business, "https://matek.example");
      assert.equal(admin.recipient, business.orderEmail);
      assert.equal(customer.recipient, request.email);
      assert.equal(customer.params.is_order, false);
      assert.equal(customer.params.is_request, true);
      assert.equal(customer.params.preferred_date, "2026-11-01");
      assert.equal(customer.params.request_topic, "Solar installation");
      assert.equal(customer.params.message, request.message);
      assert.equal(customer.params.show_bank, false);
      assert.match(String(customer.params.next_steps), locale === "tr" ? /onayı değildir/ : /does not confirm/);
      assert.match(String(customer.params.email_subject), kind === "service" ? locale === "tr" ? /Hizmet talebi/ : /Service request/ : locale === "tr" ? /İletişim talebi/ : /Contact enquiry/);
    }
  }
});

test("template sources use escaped variables, supported sections and only provided parameters", () => {
  const params = buildEmailDrafts(order, business, "https://matek.example")[0].params;
  const allowed = new Set([...Object.keys(params), "name", "quantity", "unit_price", "line_total", "sku"]);
  for (const template of ["admin-notification", "customer-confirmation"]) {
    const html = readFileSync(new URL(`../../templates/emailjs/${template}.html`, import.meta.url), "utf8");
    assert.ok(!html.includes("{{{"), "Never inject customer data as raw HTML");
    assert.ok(html.includes("{{message}}"));
    const stack: string[] = [];
    for (const match of html.matchAll(/{{([#/^]?)([\w.]+)}}/g)) {
      const [, operation, variable] = match;
      assert.ok(allowed.has(variable), `Unknown template variable ${variable}`);
      if (operation === "#") stack.push(variable);
      if (operation === "/") assert.equal(stack.pop(), variable);
    }
    assert.deepEqual(stack, []);
  }
  assert.throws(() => buildEmailDrafts(order, business, "javascript:alert(1)"), /HTTP/);
});

test("EmailJS transport sends correct template and authentication without exposing response secrets", async () => {
  const fetcher: typeof fetch = async (input, init) => {
    assert.equal(input, "https://api.emailjs.com/api/v1.0/email/send");
    assert.equal(init?.method, "POST");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.service_id, config.serviceId);
    assert.equal(body.user_id, config.publicKey);
    assert.equal(body.accessToken, config.privateKey);
    assert.equal(body.template_id, config.customerTemplateId);
    assert.equal(body.template_params.to_email, "customer@example.com");
    return new Response("OK", { status: 200 });
  };
  assert.deepEqual(await sendEmailJS(config, "customer", { to_email: "customer@example.com" }, fetcher), { status: "sent", error: null });
  const rejected = await sendEmailJS(config, "admin", {}, async () => new Response("private-secret/customer-data", { status: 429 }));
  assert.equal(rejected.status, "failed");
  assert.match(rejected.error ?? "", /429/);
  assert.ok(!rejected.error?.includes("private-secret"));
});

test("missing configuration, oversized content, provider errors and timeouts are explicit", async () => {
  assert.deepEqual(missingEmailJSConfig({}, "admin"), ["EMAILJS_SERVICE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_ADMIN_TEMPLATE_ID"]);
  const noCall: typeof fetch = async () => { throw new Error("Must not call provider"); };
  assert.equal((await sendEmailJS({}, "customer", {}, noCall)).status, "not_configured");
  assert.match((await sendEmailJS(config, "admin", { message: "a".repeat(51000) }, noCall)).error ?? "", /50 KB/);
  for (const status of [400, 401, 403, 429, 500]) {
    assert.equal((await sendEmailJS(config, "admin", {}, async () => new Response("Error", { status }))).status, "failed");
  }
  const timeout = await sendEmailJS(config, "admin", {}, async () => { throw new DOMException("Timeout", "TimeoutError"); });
  assert.match(timeout.error ?? "", /Delivery is uncertain/);
  assert.equal((await sendEmailJS(config, "admin", {}, noCall)).status, "failed");
});
