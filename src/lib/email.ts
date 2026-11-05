// src/lib/email.ts — SMTP mail sender (Nodemailer). Never throws.

import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null | undefined; // undefined = not initialised yet

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[email] SMTP_HOST / SMTP_USER / SMTP_PASS not set — emails are disabled.");
    return (transporter = null);
  }

  const port   = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  return (transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
    pool: true,
    connectionTimeout: 10_000,
    socketTimeout:     15_000,
  }));
}

export interface SendEmailParams {
  to:      string;
  subject: string;
  html:    string;
  text:    string;
}

/** Sends one email. Returns true on success; logs and returns false on any failure. */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) return false;

  try {
    await tx.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
      to, subject, html, text,
    });
    return true;
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
    return false;
  }
}
