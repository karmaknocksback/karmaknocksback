import { dbGet, dbRun, nowIso } from "@/lib/db";

export interface SettingsData {
  siteName: string; tagline: string; contactEmail: string;
  contactPhone: string; whatsappNumber: string;
  socialLinks: { youtube: string; instagram: string; facebook: string; whatsappGroup: string; whatsappChannel: string };
  upiId: string; upiPayeeName: string; maintenanceMode: boolean;
}

interface SettingsRow {
  site_name: string; tagline: string; contact_email: string;
  contact_phone: string; whatsapp_number: string;
  social_youtube: string; social_instagram: string; social_facebook: string;
  social_whatsapp_group: string; social_whatsapp_channel: string;
  upi_id: string; upi_payee_name: string; maintenance_mode: number;
}

function toSettings(row: SettingsRow): SettingsData {
  return {
    siteName: row.site_name, tagline: row.tagline,
    contactEmail: row.contact_email, contactPhone: row.contact_phone,
    whatsappNumber: row.whatsapp_number,
    socialLinks: { youtube: row.social_youtube, instagram: row.social_instagram,
      facebook: row.social_facebook, whatsappGroup: row.social_whatsapp_group,
      whatsappChannel: row.social_whatsapp_channel },
    upiId: row.upi_id, upiPayeeName: row.upi_payee_name,
    maintenanceMode: !!row.maintenance_mode,
  };
}

const DEFAULT: SettingsData = {
  siteName: "KarmaKnocksBack", tagline: "आत्मा से परमात्मा की ओर",
  contactEmail: "karmaknocksback@gmail.com", contactPhone: "7888321105",
  whatsappNumber: "7888321105",
  socialLinks: { youtube: "", instagram: "", facebook: "", whatsappGroup: "", whatsappChannel: "" },
  upiId: "", upiPayeeName: "KarmaKnocksBack", maintenanceMode: false,
};

export async function getSettings(): Promise<SettingsData> {
  const row = await dbGet<SettingsRow>("SELECT * FROM settings WHERE id = 1");
  return row ? toSettings(row) : DEFAULT;
}

export async function updateSettings(input: Partial<SettingsData>): Promise<SettingsData> {
  const current = await getSettings();
  const merged = { ...current, ...input,
    socialLinks: { ...current.socialLinks, ...(input.socialLinks || {}) } };
  await dbRun(
    `INSERT INTO settings (id, site_name, tagline, contact_email, contact_phone,
      whatsapp_number, social_youtube, social_instagram, social_facebook,
      social_whatsapp_group, social_whatsapp_channel, upi_id, upi_payee_name, maintenance_mode)
    VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      site_name=excluded.site_name, tagline=excluded.tagline,
      contact_email=excluded.contact_email, contact_phone=excluded.contact_phone,
      whatsapp_number=excluded.whatsapp_number, social_youtube=excluded.social_youtube,
      social_instagram=excluded.social_instagram, social_facebook=excluded.social_facebook,
      social_whatsapp_group=excluded.social_whatsapp_group,
      social_whatsapp_channel=excluded.social_whatsapp_channel,
      upi_id=excluded.upi_id, upi_payee_name=excluded.upi_payee_name,
      maintenance_mode=excluded.maintenance_mode`,
    [merged.siteName, merged.tagline, merged.contactEmail, merged.contactPhone,
     merged.whatsappNumber, merged.socialLinks.youtube, merged.socialLinks.instagram,
     merged.socialLinks.facebook, merged.socialLinks.whatsappGroup,
     merged.socialLinks.whatsappChannel, merged.upiId, merged.upiPayeeName,
     merged.maintenanceMode ? 1 : 0]
  );
  return merged;
}
