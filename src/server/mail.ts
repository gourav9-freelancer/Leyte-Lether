import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomToken } from "./security";

/*
 * Outbound email boundary.
 *
 *  MAIL_PROVIDER=resend    → POST https://api.resend.com/emails        (MAIL_API_KEY, MAIL_FROM)
 *  MAIL_PROVIDER=postmark  → POST https://api.postmarkapp.com/email    (MAIL_API_KEY = server token, MAIL_FROM)
 *  unset, development      → written to storage/dev-outbox/ for inspection (never sent)
 *  unset, production       → not sent; a warning is logged (no message body — it may contain tokens)
 *
 * Delivery through the providers is implemented against their documented HTTP
 * APIs but has NOT been verified with real credentials (none supplied).
 */
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export type MailResult = { delivered: true; via: "resend" | "postmark" | "dev-outbox" } | { delivered: false; reason: string };

type Provider = "resend" | "postmark";

function configuredProvider(): { provider: Provider; apiKey: string; from: string } | null {
  const provider = process.env.MAIL_PROVIDER as Provider | undefined;
  const apiKey = process.env.MAIL_API_KEY;
  const from = process.env.MAIL_FROM;
  if ((provider === "resend" || provider === "postmark") && apiKey && from) return { provider, apiKey, from };
  return null;
}

export function mailConfigured(): boolean {
  return configuredProvider() !== null;
}

/** Strips CR/LF so user-controlled values can never inject headers. */
function oneLine(v: string): string {
  return v.replace(/[\r\n]+/g, " ").trim().slice(0, 300);
}

async function post(url: string, headers: Record<string, string>, body: unknown): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const to = oneLine(msg.to);
  const subject = oneLine(msg.subject);
  const cfg = configuredProvider();

  if (cfg) {
    try {
      const res =
        cfg.provider === "resend"
          ? await post("https://api.resend.com/emails", { Authorization: `Bearer ${cfg.apiKey}` }, { from: cfg.from, to: [to], subject, text: msg.text })
          : await post(
              "https://api.postmarkapp.com/email",
              { "X-Postmark-Server-Token": cfg.apiKey },
              { From: cfg.from, To: to, Subject: subject, TextBody: msg.text, MessageStream: "outbound" },
            );
      if (res.ok) return { delivered: true, via: cfg.provider };
      console.error(`[mail] ${cfg.provider} rejected "${subject}" with HTTP ${res.status}`);
      return { delivered: false, reason: `provider_http_${res.status}` };
    } catch (err) {
      console.error(`[mail] ${cfg.provider} request failed for "${subject}":`, err instanceof Error ? err.name : "unknown");
      return { delivered: false, reason: "provider_unreachable" };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), "storage", "dev-outbox");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}-${randomToken(4)}.txt`);
    fs.writeFileSync(file, `To: ${to}\nSubject: ${subject}\n\n${msg.text}\n`, { mode: 0o600 });
    console.info(`[mail] development outbox: ${path.relative(process.cwd(), file)}`);
    return { delivered: true, via: "dev-outbox" };
  }
  console.warn(`[mail] MAIL_PROVIDER not configured — "${subject}" was not sent.`);
  return { delivered: false, reason: "not_configured" };
}
