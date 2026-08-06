import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

const COOKIE = "jobtake_session";
const ALG = "HS256";

function secretKey() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  sub: string;
  role: Role;
  email: string;
  name: string;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 11);
}

export async function verifyPassword(p: string, hash: string) {
  return bcrypt.compare(p, hash);
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getCurrentUser() {
  const c = await cookies();
  const tok = c.get(COOKIE)?.value;
  if (!tok) return null;
  const payload = await verifySession(tok);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true, email: true, name: true, role: true, avatarUrl: true,
      status: true, headline: true, location: true,
    },
  });
  if (!user || user.status === "SUSPENDED") return null;
  return user;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}

export async function requireRole(roles: Role[]) {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new Error("FORBIDDEN");
  return u;
}

export const COOKIE_NAME = COOKIE;

/** Hash a raw session JWT so we never store the token itself in the DB. */
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Returns the raw session token from the cookie, if present. */
export async function getSessionToken() {
  const c = await cookies();
  return c.get(COOKIE)?.value ?? null;
}
