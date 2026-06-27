import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";

export interface PaymentData {
  _id: string; referenceCode: string;
  linkedRequestType?: "custom_jap" | "service" | null;
  linkedRequestId?: string | null;
  customerName: string; customerEmail?: string; customerPhone?: string;
  amountInr: number; note?: string;
  status: "pending" | "paid" | "cancelled";
  utrReference?: string; adminNotes?: string; paidAt?: string; createdAt: string;
}

interface PaymentRow {
  id: number; reference_code: string; linked_request_type: string | null;
  linked_request_id: number | null; customer_name: string;
  customer_email: string | null; customer_phone: string | null;
  amount_inr: number; note: string | null; status: string;
  utr_reference: string | null; admin_notes: string | null;
  paid_at: string | null; created_at: string;
}

function toPaymentData(row: PaymentRow): PaymentData {
  return {
    _id: String(row.id), referenceCode: row.reference_code,
    linkedRequestType: (row.linked_request_type as PaymentData["linkedRequestType"]) || null,
    linkedRequestId: row.linked_request_id ? String(row.linked_request_id) : null,
    customerName: row.customer_name, customerEmail: row.customer_email || undefined,
    customerPhone: row.customer_phone || undefined, amountInr: row.amount_inr,
    note: row.note || undefined, status: (row.status as PaymentData["status"]) || "pending",
    utrReference: row.utr_reference || undefined, adminNotes: row.admin_notes || undefined,
    paidAt: row.paid_at || undefined, createdAt: row.created_at,
  };
}

function generateReferenceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createPayment(input: {
  linkedRequestType?: "custom_jap" | "service" | null;
  linkedRequestId?: string | null;
  customerName: string; customerEmail?: string; customerPhone?: string;
  amountInr: number; note?: string;
}): Promise<PaymentData> {
  let referenceCode = generateReferenceCode();
  while (await dbGet("SELECT 1 FROM payments WHERE reference_code = ?", [referenceCode])) {
    referenceCode = generateReferenceCode();
  }
  const now = nowIso();
  const result = await dbRun(
    `INSERT INTO payments (reference_code, linked_request_type, linked_request_id,
      customer_name, customer_email, customer_phone, amount_inr, note, status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,'pending',?,?)`,
    [referenceCode, input.linkedRequestType || null,
     input.linkedRequestId ? Number(input.linkedRequestId) : null,
     input.customerName, input.customerEmail || null, input.customerPhone || null,
     input.amountInr, input.note || null, now, now]
  );
  return (await getPaymentById(String(result.lastInsertRowid)))!;
}

export async function getPaymentByReference(code: string): Promise<PaymentData | null> {
  const row = await dbGet<PaymentRow>("SELECT * FROM payments WHERE reference_code = ?", [code]);
  return row ? toPaymentData(row) : null;
}

export async function getPaymentById(id: string): Promise<PaymentData | null> {
  const row = await dbGet<PaymentRow>("SELECT * FROM payments WHERE id = ?", [Number(id)]);
  return row ? toPaymentData(row) : null;
}

export async function listPayments(statusFilter?: string): Promise<PaymentData[]> {
  const rows = statusFilter
    ? await dbAll<PaymentRow>("SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC", [statusFilter])
    : await dbAll<PaymentRow>("SELECT * FROM payments ORDER BY created_at DESC");
  return rows.map(toPaymentData);
}

export async function markPaymentPaid(id: string, utrReference?: string, adminNotes?: string): Promise<PaymentData | null> {
  await dbRun(
    "UPDATE payments SET status='paid', utr_reference=?, admin_notes=?, paid_at=?, updated_at=? WHERE id=?",
    [utrReference || null, adminNotes || null, nowIso(), nowIso(), Number(id)]
  );
  return await getPaymentById(id);
}

export async function markPaymentCancelled(id: string, adminNotes?: string): Promise<PaymentData | null> {
  await dbRun("UPDATE payments SET status='cancelled', admin_notes=?, updated_at=? WHERE id=?",
    [adminNotes || null, nowIso(), Number(id)]);
  return await getPaymentById(id);
}

export async function deletePayment(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM payments WHERE id=?", [Number(id)]);
  return res.changes > 0;
}
