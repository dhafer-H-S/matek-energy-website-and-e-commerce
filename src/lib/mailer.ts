import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { type MailConfig, type MailMessage, type MailResult, missingMailConfig } from "./mail-config";

export { mailConfig, missingMailConfig } from "./mail-config";
export type { MailConfig, MailMessage, MailResult } from "./mail-config";

// Cache one transporter per credential pair on the server instance.
let cached: { key: string; transporter: Transporter } | null = null;

function getTransporter(config: MailConfig): Transporter {
  const key = `${config.user}:${config.password}`;
  if (cached?.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.password },
    pool: true,
    maxConnections: 1,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
  cached = { key, transporter };
  return transporter;
}

export async function sendMail(config: MailConfig, message: MailMessage): Promise<MailResult> {
  const missing = missingMailConfig(config);
  if (missing.length) {
    return { status: "not_configured", error: `Email sending is not configured. Set ${missing.join(" and ")} in the server environment.` };
  }
  try {
    await getTransporter(config).sendMail({
      from: { name: config.fromName, address: config.fromEmail! },
      to: message.to,
      replyTo: message.replyTo || undefined,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { status: "sent", error: null };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Unknown error";
    const hint = /invalid login|username and password not accepted|5\.7\.8|badcredentials/i.test(raw)
      ? "Gmail rejected the credentials. Use a 16-character App Password (2-Step Verification required), not the account password."
      : /self[- ]signed|certificate|etimedout|econnection|esocket|dns|getaddrinfo/i.test(raw)
        ? "Could not connect to Gmail SMTP. Check network/SMTP egress and try again."
        : raw;
    return { status: "failed", error: `Email could not be sent: ${hint}` };
  }
}
