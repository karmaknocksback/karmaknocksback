import { NextRequest, NextResponse } from "next/server";
import { todayPanchang, calculatePanchang, upcomingHighlights } from "@/lib/panchang/calculator";

// Simple in-memory cache — reset each server restart
let cached: { date: string; data: ReturnType<typeof todayPanchang> } | null = null;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "today";
  
  if (type === "upcoming") {
    const days = parseInt(searchParams.get("days") || "30");
    return NextResponse.json({ highlights: upcomingHighlights(days) });
  }

  if (type === "date") {
    const dateStr = searchParams.get("date") || "";
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return NextResponse.json({ error: "Invalid date. Use YYYY-MM-DD" }, { status: 400 });
    return NextResponse.json({ panchang: calculatePanchang(y, m, d) });
  }

  // Today's panchang — cache for 1 hour
  const now   = new Date();
  const today = now.toISOString().slice(0, 10);
  if (!cached || cached.date !== today) {
    cached = { date: today, data: todayPanchang() };
  }

  return NextResponse.json({ panchang: cached.data, cached: cached.date });
}
