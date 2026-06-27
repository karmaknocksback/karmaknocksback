import { NextRequest, NextResponse } from "next/server";
import { searchJapsRanked } from "@/lib/jap-library/ranking";
import { getFeaturedJaps } from "@/lib/repo/japs";
import { solarRulingPlanetFromDate } from "@/lib/karma-mirror/kundli/ephemeris";
import { PLANET_LABELS_HI } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const problem: string = (body.problem || "").toString().trim();
    const planet: string = (body.planet || "").toString().trim();
    const dob: string = (body.dob || "").toString().trim();

    // Build one combined query string so the real ranking engine (purpose
    // tags, transliteration, planet-specific matching, fuzzy fallback —
    // the same engine used by /jap-library search) handles everything,
    // instead of the old 4-category hardcoded keyword map this route used
    // to have.
    const queryParts: string[] = [];
    if (problem) queryParts.push(problem);
    if (planet) queryParts.push(PLANET_LABELS_HI[planet] || planet);

    let dobNote: string | undefined;
    if (dob) {
      // dob alone (no birth time/place) can only honestly give the Sun's
      // sidereal rashi — NOT a real dasha, which needs the Moon's exact
      // nakshatra and therefore exact birth time. This is the actual fix
      // for the bug where dob was collected but silently never used.
      try {
        const { rashiHi, planet: solarPlanet } = solarRulingPlanetFromDate(dob);
        queryParts.push(PLANET_LABELS_HI[solarPlanet] || solarPlanet);
        dobNote = `आपकी जन्मतिथि अनुसार सूर्य ${rashiHi} राशि में है (पारंपरिक स्वामी ग्रह: ${PLANET_LABELS_HI[solarPlanet]}) — यह केवल तिथि-आधारित एक अनुमानित संकेत है। सटीक दशा विश्लेषण के लिए पूर्ण जन्म समय व स्थान सहित Karma Mirror की कुंडली गणना देखें।`;
      } catch {
        // malformed date — ignore the dob signal rather than fail the whole request
      }
    }

    let results = queryParts.length
      ? (await searchJapsRanked(queryParts.join(" "), 6)).map((r) => r.jap)
      : [];

    if (!results.length) {
      results = await getFeaturedJaps(6);
    }

    return NextResponse.json({ results, dobNote });
  } catch (err) {
    console.error("[api/recommend] error:", err);
    return NextResponse.json({ results: [], error: "कुछ त्रुटि हुई" }, { status: 500 });
  }
}
