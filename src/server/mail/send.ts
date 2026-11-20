import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nodemailer from "nodemailer";
import { exec, one, rows } from "../db";
import { renderMail, type MailLocale, type MailPayload, type MailTemplate } from "./templates";

/**
 * Transactional e-mail with a DB outbox (docs/06). Callers never block on SMTP failures:
 * a failed delivery stays "pending" and is retried by the daily cron.
 * MAIL_DRIVER=file writes messages to .data/mail (development/tests); MAIL_DRIVER=smtp uses SMTP_*.
 */
let transporter: import("nodemailer").Transporter | null = null;
function smtp() {
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

async function deliver(to: string, template: MailTemplate, locale: MailLocale, payload: MailPayload): Promise<void> {
  const msg = renderMail(template, locale, payload);
  const from = process.env.MAIL_FROM ?? "DUJON <no-reply@dujon.invalid>";
  if ((process.env.MAIL_DRIVER ?? "file") === "smtp") {
    await smtp().sendMail({ from, to, subject: msg.subject, text: msg.text, html: msg.html });
    return;
  }
  const dir = join(process.cwd(), ".data", "mail");
  await mkdir(dir, { recursive: true });
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await writeFile(join(dir, `${stamp}.json`), JSON.stringify({ to, template, locale, ...msg, url: payload.url ?? null }, null, 2));
}

export async function sendMail(to: string, template: MailTemplate, locale: MailLocale, payload: MailPayload = {}): Promise<void> {
  const res = await exec("INSERT INTO mail_outbox (to_email, template, locale, payload_json) VALUES (?,?,?,?)", [
    to,
    template,
    locale,
    JSON.stringify(payload),
  ]);
  try {
    await deliver(to, template, locale, payload);
    await exec("UPDATE mail_outbox SET status='sent', sent_at=NOW(3), payload_json='{}' WHERE id=?", [res.insertId]);
  } catch (e) {
    await exec("UPDATE mail_outbox SET attempts=attempts+1, last_error=? WHERE id=?", [String((e as Error).message).slice(0, 300), res.insertId]);
  }
}

/** Retry pending mails (called by the daily cron). */
export async function flushOutbox(): Promise<{ sent: number; failed: number }> {
  const pending = await rows<{ id: number; to_email: string; template: MailTemplate; locale: MailLocale; payload_json: string | MailPayload; attempts: number }>(
    "SELECT id,to_email,template,locale,payload_json,attempts FROM mail_outbox WHERE status='pending' AND attempts < 5 ORDER BY id LIMIT 100",
  );
  let sent = 0, failed = 0;
  for (const m of pending) {
    const payload = typeof m.payload_json === "string" ? (JSON.parse(m.payload_json) as MailPayload) : m.payload_json;
    try {
      await deliver(m.to_email, m.template, m.locale, payload);
      await exec("UPDATE mail_outbox SET status='sent', sent_at=NOW(3), payload_json='{}' WHERE id=?", [m.id]);
      sent++;
    } catch (e) {
      await exec("UPDATE mail_outbox SET attempts=attempts+1, last_error=? WHERE id=?", [String((e as Error).message).slice(0, 300), m.id]);
      failed++;
    }
  }
  return { sent, failed };
}

export async function opsNotify(template: "ops-report" | "ops-contact", subjectArg: string, lines: string[]): Promise<void> {
  const to = process.env.OPS_EMAIL;
  if (!to) return;
  await sendMail(to, template, "en", { subjectArg, lines });
}

export async function pendingCount(): Promise<number> {
  const r = await one<{ c: number }>("SELECT COUNT(*) AS c FROM mail_outbox WHERE status='pending'");
  return r?.c ?? 0;
}
