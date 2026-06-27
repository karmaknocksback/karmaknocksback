import { NextResponse } from "next/server";
import { getTestimonials } from "@/lib/data";

export async function GET() {
  const testimonials = await getTestimonials(60);
  return NextResponse.json({ testimonials });
}
