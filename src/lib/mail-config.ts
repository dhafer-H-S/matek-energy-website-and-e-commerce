export interface MailConfig {
  user?: string;
  password?: string;
  fromName: string;
  fromEmail?: string;
}

export interface MailMessage {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export type MailResult =
  | { status: "sent"; error: null }
  | { status: "failed" | "not_configured"; error: string };

export function mailConfig(): MailConfig {
  const user = process.env.GMAIL_USER?.trim();
  return {
    user,
    password: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""),
    fromName: process.env.MAIL_FROM_NAME?.trim() || "Matek Energy",
    fromEmail: user,
  };
}

export function missingMailConfig(config: MailConfig): string[] {
  return [
    !config.user && "GMAIL_USER",
    !config.password && "GMAIL_APP_PASSWORD",
  ].filter((value): value is string => Boolean(value));
}
