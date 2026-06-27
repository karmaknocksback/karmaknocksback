import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCollectionById, getNextSequenceNumber, upsertItem } from "@/lib/repo/jap-collections";
import { requireAdmin } from "@/lib/require-admin";

const createSchema = z.object({
  collectionId: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "केवल लोअरकेस अक्षर, अंक व हाइफ़न"),
  titleHi: z.string().min(1),
  sanskritText: z.string().optional(),
  mantraAvahan: z.string().optional(),
  mantraPranam: z.string().optional(),
  mantraSiddhi: z.string().optional(),
  jaapCountNote: z.string().optional(),
  purposeHi: z.string().optional(),
  whenToDoHi: z.string().optional(),
  whyToDoHi: z.string().optional(),
  durationNoteHi: z.string().optional(),
  granthReference: z.string().optional(),
  youtubeLink: z.string().url().optional().or(z.literal("")).nullable(),
  sourceConfidence: z.enum(["verified", "traditional", "community"]).default("community"),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  contentStatus: z.enum(["researched", "pending"]).default("researched"),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const collection = await getCollectionById(data.collectionId);
    if (!collection) {
      return NextResponse.json({ error: "संग्रह नहीं मिला" }, { status: 404 });
    }

    const sequenceNumber = await getNextSequenceNumber(data.collectionId);
    const item = await upsertItem({ ...data, sequenceNumber, youtubeLink: data.youtubeLink || null });
    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("[api/admin/jap-collection-items] create error:", err);
    return NextResponse.json({ error: "प्रविष्टि बनाने में त्रुटि (slug पहले से मौजूद हो सकता है)" }, { status: 400 });
  }
}
