import { NextRequest, NextResponse } from "next/server";
import {
  updateCustomJapRequestStatus,
  deleteCustomJapRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
  updateContactMessageResolved,
  deleteContactMessage,
} from "@/lib/repo/requests";
import { requireAdmin } from "@/lib/require-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const type = new URL(req.url).searchParams.get("type");

  try {
    const body = await req.json();
    if (type === "service") {
      await updateServiceRequestStatus(id, body.status);
    } else if (type === "contact") {
      await updateContactMessageResolved(id);
    } else {
      await updateCustomJapRequestStatus(id, body.status);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/requests/:id] update error:", err);
    return NextResponse.json({ error: "अपडेट में त्रुटि" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const type = new URL(req.url).searchParams.get("type");

  if (type === "service") deleteServiceRequest(id);
  else if (type === "contact") deleteContactMessage(id);
  else deleteCustomJapRequest(id);

  return NextResponse.json({ success: true });
}
