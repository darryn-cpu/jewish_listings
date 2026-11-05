import { SignJWT, jwtVerify } from "jose"

export const ADMIN_COOKIE = "jbd_admin"
const TWELVE_HOURS = 60 * 60 * 12

export type SessionClaims = {
  sub: string
  role: "SUPERADMIN" | "REVIEWER"
  email: string
}

function secret() {
  const value = process.env.JWT_SECRET
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters.")
  }
  return new TextEncoder().encode(value)
}

export async function signSession(claims: SessionClaims) {
  return new SignJWT({ role: claims.role, email: claims.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret())
}

export async function readSessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    if (!payload.sub || (payload.role !== "SUPERADMIN" && payload.role !== "REVIEWER")) return null
    if (typeof payload.email !== "string") return null
    return { sub: payload.sub, role: payload.role, email: payload.email }
  } catch {
    return null
  }
}

export function adminCookieOptions(maxAge = TWELVE_HOURS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  }
}
