import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";

export interface CustomJapRequest {
  _id: string; fullName: string; email: string; phone: string; whatsapp: string;
  country: string; purpose: string; detailedProblem: string; preferredVoice: string;
  musicType: string; durationMinutes: string; urgency: string; budget: string;
  status: string; createdAt: string;
}
export interface ServiceRequest {
  _id: string; name: string; email: string; phone: string;
  service: string; requirement: string; budget: string; status: string; createdAt: string;
}
export interface ContactMessage {
  _id: string; name: string; email: string; phone?: string;
  subject: string; message: string; resolved: boolean; createdAt: string;
}

function toCJR(r: Record<string, unknown>): CustomJapRequest {
  return { _id: String(r.id), fullName: r.full_name as string, email: r.email as string,
    phone: r.phone as string, whatsapp: r.whatsapp as string, country: r.country as string,
    purpose: r.purpose as string, detailedProblem: r.detailed_problem as string,
    preferredVoice: r.preferred_voice as string, musicType: r.music_type as string,
    durationMinutes: r.duration_minutes as string, urgency: r.urgency as string,
    budget: r.budget as string, status: r.status as string, createdAt: r.created_at as string };
}
function toSR(r: Record<string, unknown>): ServiceRequest {
  return { _id: String(r.id), name: r.name as string, email: r.email as string,
    phone: r.phone as string, service: r.service as string,
    requirement: r.requirement as string, budget: r.budget as string,
    status: r.status as string, createdAt: r.created_at as string };
}
function toCM(r: Record<string, unknown>): ContactMessage {
  return { _id: String(r.id), name: r.name as string, email: r.email as string,
    phone: (r.phone as string) || undefined, subject: r.subject as string,
    message: r.message as string, resolved: !!(r.resolved as number),
    createdAt: r.created_at as string };
}

export async function createCustomJapRequest(input: Omit<CustomJapRequest, "_id" | "status" | "createdAt">): Promise<string> {
  const now = nowIso();
  const res = await dbRun(
    `INSERT INTO custom_jap_requests (full_name,email,phone,whatsapp,country,purpose,detailed_problem,preferred_voice,music_type,duration_minutes,urgency,budget,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'New',?,?)`,
    [input.fullName, input.email, input.phone, input.whatsapp, input.country, input.purpose,
     input.detailedProblem, input.preferredVoice, input.musicType, input.durationMinutes,
     input.urgency, input.budget, now, now]
  );
  return String(res.lastInsertRowid);
}

export async function createServiceRequest(input: Omit<ServiceRequest, "_id" | "status" | "createdAt">): Promise<string> {
  const now = nowIso();
  const res = await dbRun(
    `INSERT INTO service_requests (name,email,phone,service,requirement,budget,status,created_at,updated_at) VALUES (?,?,?,?,?,?,'New',?,?)`,
    [input.name, input.email, input.phone, input.service, input.requirement, input.budget, now, now]
  );
  return String(res.lastInsertRowid);
}

export async function createContactMessage(input: Omit<ContactMessage, "_id" | "resolved" | "createdAt">): Promise<string> {
  const res = await dbRun(
    `INSERT INTO contact_messages (name,email,phone,subject,message,resolved,created_at) VALUES (?,?,?,?,?,0,?)`,
    [input.name, input.email, input.phone || null, input.subject, input.message, nowIso()]
  );
  return String(res.lastInsertRowid);
}

export async function listCustomJapRequests(): Promise<CustomJapRequest[]> {
  const rows = await dbAll<Record<string, unknown>>("SELECT * FROM custom_jap_requests ORDER BY created_at DESC");
  return rows.map(toCJR);
}
export async function listServiceRequests(): Promise<ServiceRequest[]> {
  const rows = await dbAll<Record<string, unknown>>("SELECT * FROM service_requests ORDER BY created_at DESC");
  return rows.map(toSR);
}
export async function listContactMessages(): Promise<ContactMessage[]> {
  const rows = await dbAll<Record<string, unknown>>("SELECT * FROM contact_messages ORDER BY created_at DESC");
  return rows.map(toCM);
}

export async function updateCustomJapStatus(id: string, status: string): Promise<void> {
  await dbRun("UPDATE custom_jap_requests SET status=?, updated_at=? WHERE id=?", [status, nowIso(), Number(id)]);
}
export async function updateServiceStatus(id: string, status: string): Promise<void> {
  await dbRun("UPDATE service_requests SET status=?, updated_at=? WHERE id=?", [status, nowIso(), Number(id)]);
}
export async function resolveContactMessage(id: string): Promise<void> {
  await dbRun("UPDATE contact_messages SET resolved=1 WHERE id=?", [Number(id)]);
}
export async function deleteCustomJapRequest(id: string): Promise<void> {
  await dbRun("DELETE FROM custom_jap_requests WHERE id=?", [Number(id)]);
}
export async function deleteServiceRequest(id: string): Promise<void> {
  await dbRun("DELETE FROM service_requests WHERE id=?", [Number(id)]);
}
export async function deleteContactMessage(id: string): Promise<void> {
  await dbRun("DELETE FROM contact_messages WHERE id=?", [Number(id)]);
}

// Backward compat aliases
export const updateCustomJapRequestStatus = updateCustomJapStatus;
export const updateServiceRequestStatus = updateServiceStatus;
export const updateContactMessageResolved = resolveContactMessage;
export const deleteCustomJap = deleteCustomJapRequest;
export const deleteService = deleteServiceRequest;
export const deleteContact = deleteContactMessage;
