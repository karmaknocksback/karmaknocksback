import { NextRequest, NextResponse } from "next/server";
import { todayPanchang, calculatePanchang, upcomingHighlights } from "@/lib/panchang/calculator";
import { getJainFestivals } from "@/lib/panchang/jain-festivals";

let cached: { date: string; data: ReturnType<typeof todayPanchang> } | null = null;

function enrichWithJainFestivals(p: ReturnType<typeof todayPanchang>) {
  const festivals = getJainFestivals(p.tithi.number, p.hindu_month.number - 1);
  return { ...p, jain_festivals: festivals };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "today";

  if (type === "month") {
    // Return all days in a given month with their tithis and Jain festivals
    const year  = parseInt(searchParams.get("year")  || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const p = calculatePanchang(year, month, d, 6);
      const festivals = getJainFestivals(p.tithi.number, p.hindu_month.number - 1);
      days.push({ 
        day: d, ...p, 
        jain_festivals: festivals,
        brahma_muhurta_tithi_note: null  // computed per day if needed
      });
    }
    const resp = NextResponse.json({ year, month, days });
    // Cache month data for 1 hour in browser/CDN  
    resp.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return resp;
  }

  if (type === "upcoming") {
    const days = parseInt(searchParams.get("days") || "30");
    const highlights = upcomingHighlights(days).map(enrichWithJainFestivals);
    return NextResponse.json({ highlights });
  }

  if (type === "date") {
    const dateStr = searchParams.get("date") || "";
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return NextResponse.json({ error: "Use YYYY-MM-DD" }, { status: 400 });
    const p = calculatePanchang(y, m, d);
    return NextResponse.json({ panchang: enrichWithJainFestivals(p) });
  }

  // Today
  const today = new Date().toISOString().slice(0, 10);
  if (!cached || cached.date !== today) {
    cached = { date: today, data: todayPanchang() };
  }
  return NextResponse.json({ panchang: enrichWithJainFestivals(cached.data), cached: cached.date });
}
