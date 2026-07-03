import { Resend } from "resend";
import nodemailer from "nodemailer";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "KarmaKnocksBack <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL;

// Gmail SMTP alternative — works without any domain setup, just needs
// GMAIL_USER (your Gmail address) and GMAIL_APP_PASSWORD (a 16-character
// App Password from Google Account → Security → App Passwords, NOT your
// actual Gmail password). Takes about 2 minutes to set up.
// If both RESEND_API_KEY and GMAIL credentials are set, Resend wins.
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const gmailTransport =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : null;

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<void> {
  // Resend takes priority if configured
  if (resend) {
    try {
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return;
    } catch (err) {
      console.error("[email/resend] Failed to send email:", err);
      return;
    }
  }

  // Gmail SMTP fallback — no domain needed, works directly with Gmail
  if (gmailTransport) {
    try {
      const fromName = FROM_EMAIL.includes("<")
        ? FROM_EMAIL
        : `KarmaKnocksBack <${GMAIL_USER}>`;
      await gmailTransport.sendMail({
        from: fromName,
        to,
        subject,
        html,
      });
      return;
    } catch (err) {
      console.error("[email/gmail] Failed to send email:", err);
      return;
    }
  }

  // Neither configured — log to console so nothing is silently lost
  console.warn(
    "[email] No email provider configured. Add RESEND_API_KEY or GMAIL_USER+GMAIL_APP_PASSWORD to .env.local. Would have sent:",
    { to, subject }
  );
}

export async function notifyAdmin(subject: string, html: string): Promise<void> {
  if (!ADMIN_EMAIL) {
    console.warn("[email] ADMIN_NOTIFICATION_EMAIL not set — skipping admin notification.");
    return;
  }
  await sendEmail({ to: ADMIN_EMAIL, subject, html });
}

export function rowsToHtml(rows: Record<string, string>): string {
  const body = Object.entries(rows)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#8a6d2f;font-weight:600;">${label}</td><td style="padding:6px 12px;">${value || "—"}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${body}</table>`;
}

/** Sends a confirmation email to the PERSON WHO SUBMITTED a form (contact,
 * custom jap request, service inquiry) — distinct from notifyAdmin, which
 * tells the site owner about the new submission. Both fire on every
 * submission: the owner gets notified, and the submitter gets a receipt
 * confirming it went through, with what to expect next. */
export async function sendAcknowledgment(args: {
  to: string;
  name: string;
  title: string;
  bodyHtml: string;
}): Promise<void> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p style="font-size:18px;color:#9c7726;font-weight:600;margin-bottom:4px;">कर्म KarmaKnocksBack</p>
      <h2 style="color:#1a1a1a;font-size:18px;margin-top:20px;">नमस्ते ${args.name} जी,</h2>
      <p style="color:#1a1a1a;font-size:14px;line-height:1.6;">${args.title}</p>
      <div style="margin:16px 0;">${args.bodyHtml}</div>
      <p style="color:#1a1a1a;font-size:13px;line-height:1.6;margin-top:20px;">
        हम शीघ्र ही आपसे संपर्क करेंगे। धन्यवाद।
      </p>
      <p style="color:#8a6d2f;font-size:12px;margin-top:24px;">— KarmaKnocksBack टीम</p>
    </div>
  `;
  await sendEmail({ to: args.to, subject: args.title, html });
}

/**
 * WhatsApp Business API (Meta Cloud API) notification to the site owner.
 *
 * IMPORTANT — this needs real setup before it sends anything:
 * 1. A Meta Business Account + WhatsApp Business Platform access (free,
 *    but requires business verification, typically 1-5 business days).
 * 2. A dedicated phone number registered to the WhatsApp Business API
 *    (this CANNOT be a number still used in the regular WhatsApp app —
 *    migrating a number to the API removes it from the consumer app).
 * 3. At least one message TEMPLATE submitted to Meta and approved.
 *    Business-initiated notifications (which is what this is — you're
 *    not replying to an existing customer conversation) MUST use an
 *    approved template; free-form text only works as a REPLY within a
 *    customer-initiated 24-hour window, which doesn't apply here.
 *
 * Until WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID are set, this
 * safely no-ops (logs to console) rather than failing — same pattern as
 * sendEmail() above when RESEND_API_KEY is unset.
 *
 * The template name/language/variable count here are placeholders —
 * once you create your own template in Meta Business Manager, update
 * WHATSAPP_TEMPLATE_NAME and the `parameters` array below to match
 * whatever variables your approved template actually defines.
 */
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "new_form_notification";
const WHATSAPP_TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";

export async function sendWhatsAppNotification(toPhoneE164: string, summary: string): Promise<void> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("[whatsapp] WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID not set — skipping. Would have sent:", summary);
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhoneE164,
        type: "template",
        template: {
          name: WHATSAPP_TEMPLATE_NAME,
          language: { code: WHATSAPP_TEMPLATE_LANG },
          components: [{ type: "body", parameters: [{ type: "text", text: summary }] }],
        },
      }),
    });
    if (!res.ok) {
      console.error("[whatsapp] send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[whatsapp] error:", err);
  }
}

/**
 * SMS notification via MSG91 (a major Indian transactional SMS gateway —
 * chosen because it natively supports India's mandatory DLT-registered
 * template flow, unlike most international SMS providers).
 *
 * IMPORTANT — this also needs real setup before it sends anything:
 * 1. An MSG91 account + API key.
 * 2. DLT registration (TRAI requirement for any commercial/transactional
 *    SMS sent to Indian numbers) — a separate registration on the DLT
 *    portal (your telecom operator's portal, e.g. Jio/Airtel/Vi's DLT
 *    platform) for your Entity ID, a registered Sender ID (6 characters),
 *    and the EXACT approved message template text. This is mandatory by
 *    law, not an MSG91-specific hurdle — every SMS provider requires it
 *    for Indian numbers.
 * 3. The approved DLT template ID, configured below.
 *
 * Until MSG91_AUTH_KEY/MSG91_TEMPLATE_ID are set, this safely no-ops.
 * The VAR1 mapping is a placeholder — match it to whatever variable
 * your actual approved DLT template defines.
 */
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export async function sendSmsNotification(toPhoneE164: string, summary: string): Promise<void> {
  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    console.warn("[sms] MSG91_AUTH_KEY/MSG91_TEMPLATE_ID not set — skipping. Would have sent:", summary);
    return;
  }

  try {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE_ID,
        short_url: "0",
        recipients: [{ mobiles: toPhoneE164.replace(/^\+/, ""), VAR1: summary }],
      }),
    });
    if (!res.ok) {
      console.error("[sms] send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[sms] error:", err);
  }
}

/** Fires all three configured notification channels (email always fires
 * if RESEND_API_KEY is set; WhatsApp/SMS fire only if their respective
 * credentials are set — each independently, so having only one or two
 * configured still works fine). Use this instead of calling notifyAdmin
 * directly when you want the phone-notification channels included too. */
export async function notifyAdminAllChannels(subject: string, html: string, plainSummary: string): Promise<void> {
  const settings = await import("@/lib/repo/settings").then(async (m) => m.getSettings());
  const phone = settings.whatsappNumber || settings.contactPhone;
  const phoneE164 = phone ? (phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`) : null;

  await Promise.all([
    notifyAdmin(subject, html),
    phoneE164 ? sendWhatsAppNotification(phoneE164, plainSummary) : Promise.resolve(),
    phoneE164 ? sendSmsNotification(phoneE164, plainSummary) : Promise.resolve(),
  ]);
}

// ---- Typed email senders using beautiful templates ----
import {
  contactAckTemplate, customJapAckTemplate,
  adminNotificationTemplate, karmaReportTemplate, paymentConfirmTemplate,
} from "@/lib/email-templates";

export async function sendContactAck(to: string, name: string, subject: string): Promise<void> {
  await sendEmail({
    to,
    subject: `आपका संदेश प्राप्त हुआ — KarmaKnocksBack`,
    html: contactAckTemplate(name, subject),
  });
}

export async function sendCustomJapAck(to: string, name: string, purpose: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Custom Jap Request प्राप्त हुआ — KarmaKnocksBack`,
    html: customJapAckTemplate(name, purpose),
  });
}

export async function sendAdminNotification(type: string, details: Record<string, string>): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL;
  if (!adminEmail) return;
  await sendEmail({
    to: adminEmail,
    subject: `🔔 नया ${type} — KarmaKnocksBack`,
    html: adminNotificationTemplate(type, details),
  });
}

export async function sendKarmaReport(to: string, name: string, archetypeHi: string, sessionId: string): Promise<void> {
  await sendEmail({
    to,
    subject: `आपकी Karma Mirror रिपोर्ट तैयार है — ${archetypeHi}`,
    html: karmaReportTemplate(name, archetypeHi, sessionId),
  });
}

export async function sendPaymentConfirm(to: string, name: string, amount: string, note: string, referenceCode: string): Promise<void> {
  await sendEmail({
    to,
    subject: `भुगतान सफल ✓ — KarmaKnocksBack`,
    html: paymentConfirmTemplate(name, amount, note, referenceCode),
  });
}
