import assert from "node:assert/strict";
import test from "node:test";
import { buildEmailMessages, type EmailBusiness, type EmailSubmission } from "./email-templates";
import { missingMailConfig } from "./mail-config";

const business: EmailBusiness = {
  orderEmail: "orders@example.com", contactEmail: "contact@example.com", contactPhone: "+90 555 000 0000",
  bankName: "Test bank", bankAccountHolder: "Matek Energy", bankIban: "TEST-IBAN", bankNotes: "Test bank instructions",
};
const order: EmailSubmission = {
  id: "order-test-id", kind: "order", locale: "tr", createdAt: new Date("2026-10-22T12:00:00Z"), channel: "website",
  order: {
    orderNumber: "MK-TEST", customerName: "Test Customer", email: "customer@example.com", phone: "+90 555 111 1111",
    address: "Test street", city: "Kyrenia", notes: "<script>alert('xss')</script>", paymentMethod: "bank_transfer",
    items: [
      { productId: "p1", slug: "p1", name: "Test <b>solar</b> panel", image: null, sku: "P1", unitPrice: 100, currency: "EUR", quantity: 2 },
      { productId: "p2", slug: "p2", name: "Cable", image: null, sku: null, unitPrice: 0, currency: "TRY", quantity: 1 },
    ],
    totals: { EUR: 200, TRY: 0 },
  },
};
const request: EmailSubmission = {
  id: "request-test-id", kind: "service", locale: "tr", createdAt: order.createdAt,
  name: "Test Customer", email: "customer@example.com", phone: "+90 555 111 1111", message: "Line one\nLine two <b>x</b>",
  sourceType: "quote", sourceLabel: "Solar installation", preferredDate: "2026-11-01",
};

test("orders create distinct admin/customer emails with correct recipients, reply-to, subject and language", () => {
  const [admin, customer] = buildEmailMessages(order, business, "https://matek.example/");
  assert.equal(admin.recipient, business.orderEmail);
  assert.equal(customer.recipient, order.order.email);
  assert.equal(admin.replyTo, order.order.email);
  assert.equal(customer.replyTo, business.contactEmail);
  assert.match(admin.subject, /New Order \| MK-TEST/);
  assert.match(customer.subject, /Matek Energy \| Sipariş \| MK-TEST/);
  assert.notEqual(admin.id, customer.id);
  // Customer order email is Turkish and includes totals + payment method
  assert.match(customer.html, /Siparişinizi aldık/);
  assert.match(customer.html, /200/);
  assert.match(customer.html, /Banka havalesi/);
  assert.match(customer.text, /MK-TEST/);
});

test("user-provided content is HTML-escaped in both html and preserved in text", () => {
  const [admin, customer] = buildEmailMessages(order, business, "https://matek.example");
  for (const message of [admin, customer]) {
    assert.ok(!message.html.includes("<script>"), "script tag must be escaped");
    assert.ok(message.html.includes("&lt;script&gt;"), "escaped script expected");
    assert.ok(!message.html.includes("Test <b>solar</b> panel"), "product name must be escaped");
    assert.ok(message.html.includes("Test &lt;b&gt;solar&lt;/b&gt; panel"));
  }
});

test("bank details appear only on customer bank-transfer orders", () => {
  const [admin, customer] = buildEmailMessages(order, business, "https://matek.example");
  assert.match(customer.html, /Banka havalesi bilgileri/);
  assert.match(customer.html, /TEST-IBAN/);
  assert.ok(!admin.html.includes("TEST-IBAN"), "admin email should not contain IBAN block");
  const cash = buildEmailMessages({ ...order, locale: "en", order: { ...order.order, email: "c@e.com", paymentMethod: "cash_on_delivery" } }, business, "https://matek.example");
  assert.ok(!cash[1].html.includes("TEST-IBAN"));
});

test("a missing customer email yields only the admin notification", () => {
  const drafts = buildEmailMessages({ ...order, order: { ...order.order, email: null } }, business, "https://matek.example");
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].audience, "admin");
  assert.equal(drafts[0].replyTo, business.contactEmail);
});

test("contact and service requests include topic, preferred date and accurate EN/TR acknowledgement", () => {
  for (const kind of ["contact", "service"] as const) {
    for (const locale of ["en", "tr"]) {
      const [admin, customer] = buildEmailMessages({ ...request, kind, locale }, business, "https://matek.example");
      assert.equal(admin.recipient, business.orderEmail);
      assert.equal(customer.recipient, request.email);
      assert.match(customer.html, /Solar installation/);
      assert.match(customer.html, /2026-11-01/);
      assert.ok(!customer.html.includes("TEST-IBAN"));
      assert.match(customer.html, locale === "tr" ? /onayı değildir/ : /does not confirm/);
      assert.match(customer.subject, kind === "service" ? (locale === "tr" ? /Hizmet talebi/ : /Service request/) : (locale === "tr" ? /İletişim talebi/ : /Contact enquiry/));
      // multi-line message preserved as <br> in html
      assert.match(customer.html, /Line one<br>Line two/);
    }
  }
});

test("admin links point to the admin panel; customer links to public contact; invalid site URL rejected", () => {
  const [admin, customer] = buildEmailMessages(order, business, "https://matek.example");
  assert.match(admin.html, /https:\/\/matek\.example\/admin\/orders\/order-test-id/);
  assert.match(customer.html, /https:\/\/matek\.example\/tr\/contact/);
  assert.throws(() => buildEmailMessages(order, business, "javascript:alert(1)"), /HTTP/);
  assert.throws(() => buildEmailMessages(order, business, "https://user:pass@matek.example"), /without credentials/);
});

test("rendered emails are valid self-contained HTML documents", () => {
  for (const message of buildEmailMessages(order, business, "https://matek.example")) {
    assert.match(message.html, /^<!DOCTYPE html>/);
    assert.match(message.html, /<\/html>$/);
    assert.ok(message.text.length > 0);
  }
});

test("mailer reports missing Gmail configuration explicitly", () => {
  assert.deepEqual(missingMailConfig({ fromName: "Matek Energy" }), ["GMAIL_USER", "GMAIL_APP_PASSWORD"]);
  assert.deepEqual(missingMailConfig({ fromName: "Matek Energy", user: "a@gmail.com", password: "pw" }), []);
  assert.deepEqual(missingMailConfig({ fromName: "Matek Energy", user: "a@gmail.com" }), ["GMAIL_APP_PASSWORD"]);
});
