import { NextRequest, NextResponse } from "next/server";
import { dbRun, dbAll } from "@/lib/db";
import { upcomingHighlights } from "@/lib/panchang/calculator";
import { getJainFestivals } from "@/lib/panchang/jain-festivals";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, preferences = ["all"], language = "hi" } = await req.json();
    if (!name || !phone) return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
    
    // Clean phone: keep only digits, ensure starts with country code
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    
    const now = new Date().toISOString();
    await dbRun(
      `INSERT INTO whatsapp_subscribers (name, phone, preferences, language, subscribed_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(phone) DO UPDATE SET name=excluded.name, preferences=excluded.preferences, 
       language=excluded.language, active=1`,
      [name, cleanPhone, JSON.stringify(preferences), language, now]
    );
    
    // Build WhatsApp confirmation link
    const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const msg = encodeURIComponent(
      language === "hi"
        ? `🙏 जय जिनेन्द्र! मेरा नाम ${name} है। मुझे KarmaKnocksBack से दिगम्बर जैन पर्व और व्रत की सूचनाएं WhatsApp पर चाहिए।`
        : `🙏 Jai Jinendra! My name is ${name}. I want to receive Digambar Jain festival & vrat reminders from KarmaKnocksBack on WhatsApp.`
    );
    const waLink = `https://wa.me/${waPhone}?text=${msg}`;
    
    return NextResponse.json({ success: true, waLink, message: "Subscribed successfully!" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE")) return NextResponse.json({ success: true, message: "Already subscribed!" });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Admin: list subscribers (requires admin session)
  const cookie = req.cookies.get("kkb_admin_session");
  if (!cookie?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const subscribers = await dbAll("SELECT * FROM whatsapp_subscribers ORDER BY subscribed_at DESC", []);
  
  // Build upcoming festivals message
  const upcoming = upcomingHighlights(7);
  const festivals = upcoming.slice(0, 3).map(p => {
    const f = getJainFestivals(p.tithi.number, p.hindu_month.number - 1);
    return f.length > 0 
      ? `📅 ${p.date}: ${f[0].nameHi} — ${f[0].emoji}`
      : null;
  }).filter(Boolean);
  
  return NextResponse.json({ subscribers, count: subscribers.length, upcomingFestivals: festivals });
}
