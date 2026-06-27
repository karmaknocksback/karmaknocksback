import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listCollections, listItemsByCollection, upsertCollection } from "@/lib/repo/jap-collections";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const cols = await listCollections();
  const collections = await Promise.all(cols.map(async (c) => ({
    ...c,
    items: await listItemsByCollection(c._id),
  })));

  return NextResponse.json({ collections });
}

const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "केवल लोअरकेस अक्षर, अंक व हाइफ़न"),
  nameHi: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionHi: z.string().min(1),
  totalItems: z.number().int().min(0),
  sourceNoteHi: z.string().optional(),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const collection = await upsertCollection(data);
    return NextResponse.json({ success: true, collection });
  } catch (err) {
    console.error("[api/admin/jap-collections] create error:", err);
    return NextResponse.json({ error: "संग्रह बनाने में त्रुटि (slug पहले से मौजूद हो सकता है)" }, { status: 400 });
  }
}
