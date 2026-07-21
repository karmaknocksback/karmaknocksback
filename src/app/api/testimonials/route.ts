import { NextResponse } from "next/server";
import { getTestimonials } from "@/lib/data";

export async function GET() {
  const testimonials = await getTestimonials(60);
  (()=>{const __r=NextResponse.json({ testimonials });__r.headers.set("Cache-Control","public, s-maxage=3600, max-age=300, stale-while-revalidate=86400");return __r;})();
}
