import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "angad_admin";
const SECRET = process.env.ADMIN_SECRET || "angad-dev-secret-change-me";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angad@123";

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function makeToken() {
  const issued = String(Date.now());
  return `${issued}.${sign(issued)}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = sign(issued);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  // Session stays valid for 7 days
  return Date.now() - Number(issued) < 7 * 24 * 60 * 60 * 1000;
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function requireAdminResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
