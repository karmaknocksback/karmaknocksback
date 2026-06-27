import { dbGet, dbRun, nowIso } from "@/lib/db";
import bcrypt from "bcryptjs";

interface AdminUserRow {
  id: number; name: string; email: string;
  password_hash: string; role: string; created_at: string;
}

export interface AdminUser {
  id: string; name: string; email: string;
  passwordHash: string; role: string; createdAt: string;
}

function toAdminUser(row: AdminUserRow): AdminUser {
  return { id: String(row.id), name: row.name, email: row.email,
    passwordHash: row.password_hash, role: row.role, createdAt: row.created_at };
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const row = await dbGet<AdminUserRow>("SELECT * FROM admin_users WHERE email = ?", [email.toLowerCase()]);
  return row ? toAdminUser(row) : null;
}

export async function createAdminUser(input: { name: string; email: string; password: string; role?: string }): Promise<AdminUser> {
  const hash = await bcrypt.hash(input.password, 10);
  const now = nowIso();
  const result = await dbRun(
    "INSERT INTO admin_users (name, email, password_hash, role, created_at) VALUES (?,?,?,?,?)",
    [input.name, input.email.toLowerCase(), hash, input.role || "superadmin", now]
  );
  const row = await dbGet<AdminUserRow>("SELECT * FROM admin_users WHERE id = ?", [result.lastInsertRowid]);
  return toAdminUser(row!);
}

export async function verifyAdminPassword(admin: AdminUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, admin.passwordHash);
}
