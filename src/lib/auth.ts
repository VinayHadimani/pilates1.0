import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";

export const ADMIN_COOKIE = "arcwave_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.SESSION_SECRET || "arcwave-pilates-dev-secret-change-me";
}

/* ---------- Password hashing (scrypt) ---------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const test = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(test), Buffer.from(hash));
  } catch {
    return false;
  }
}

/* ---------- Session token (HMAC signed) ---------- */

export function createSessionToken(username: string): string {
  const payload = {
    u: username,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
      return false;
  } catch {
    return false;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as { u: string; exp: number };
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

/* ---------- Cookie helpers (server) ---------- */

export async function setAdminCookie(username: string) {
  const c = await cookies();
  c.set(ADMIN_COOKIE, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifySessionToken(c.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<boolean> {
  if (await isAdmin()) return true;
  return false;
}

/* ---------- Role-based permission helpers ---------- */

export async function getAdminRole(): Promise<string | null> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8")
    );
    // Look up the admin user to get their role
    const admin = await db.adminUser.findUnique({
      where: { username: payload.u },
    });
    return admin?.role || null;
  } catch {
    return null;
  }
}

export async function requireAdminRole(
  allowedRoles: string[]
): Promise<boolean> {
  const role = await getAdminRole();
  if (!role) return false;
  return allowedRoles.includes(role);
}

/* ---------- Member (user) session ---------- */
export const USER_COOKIE = "arcwave_user";

export async function setUserCookie(userId: string) {
  const c = await cookies();
  c.set(USER_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearUserCookie() {
  const c = await cookies();
  c.delete(USER_COOKIE);
}

export async function isUser(): Promise<boolean> {
  const c = await cookies();
  return verifySessionToken(c.get(USER_COOKIE)?.value);
}

export async function getUserId(): Promise<string | null> {
  const c = await cookies();
  const token = c.get(USER_COOKIE)?.value;
  if (!token) return null;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return payload.u || null;
  } catch {
    return null;
  }
}
