import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { SessionUser } from "@/types";

export const SESSION_COOKIE_NAME = "sfms_session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return await new SignJWT({
    admin_id: user.admin_id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return {
      admin_id: Number(payload.admin_id),
      username: String(payload.username),
      first_name: String(payload.first_name),
      last_name: String(payload.last_name),
      role: payload.role as SessionUser["role"]
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE
  };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0
  });
}

export async function getSessionUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}
