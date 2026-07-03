import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, saveKundliProfile } from "@/lib/repo/km-assessment";
import { geocodePlace } from "@/lib/karma-mirror/kundli/geocoding";
import { calculateKundliPositions } from "@/lib/karma-mirror/kundli/ephemeris";

const schema = z.object({
  sessionId: z.string().min(1),
  fullName: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  birthTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM, 24hr
  birthPlace: z.string().min(1).max(200),
  utcOffsetHours: z.number().min(-12).max(14),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const session = await getSession(data.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "सत्र नहीं मिला" }, { status: 404 });
    }

    const geocoded = await geocodePlace(data.birthPlace);
    if (!geocoded) {
      return NextResponse.json(
        { success: false, error: "जन्म स्थान नहीं मिल सका। कृपया अधिक स्पष्ट नाम लिखें (जैसे: शहर, राज्य, देश)।" },
        { status: 400 }
      );
    }

    const [year, month, day] = data.birthDate.split("-").map(Number);
    const [hour, minute] = data.birthTime.split(":").map(Number);

    const positions = calculateKundliPositions({
      year, month, day, hour, minute,
      utcOffsetHours: data.utcOffsetHours,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
    });

    await saveKundliProfile({
      sessionId: data.sessionId,
      fullName: data.fullName,
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthPlace: geocoded.displayName,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      utcOffsetHours: data.utcOffsetHours,
      positionsJson: JSON.stringify(positions),
    });

    return NextResponse.json({ success: true, resolvedPlace: geocoded.displayName });
  } catch (err) {
    console.error("[api/karma-mirror/kundli] error:", err);
    return NextResponse.json({ success: false, error: "कुंडली गणना में त्रुटि" }, { status: 400 });
  }
}
