import { dbRun, nowIso } from "@/lib/db";

export async function addSubscriber(email: string, whatsapp?: string): Promise<void> {
  await dbRun(
    "INSERT OR IGNORE INTO newsletter_subscribers (email, whatsapp, created_at) VALUES (?,?,?)",
    [email.toLowerCase(), whatsapp || null, nowIso()]
  );
}

export const upsertNewsletterSubscriber = addSubscriber;
