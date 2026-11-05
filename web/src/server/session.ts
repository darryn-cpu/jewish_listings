import "server-only"
import { cookies } from "next/headers"
import { ApiError } from "@/server/errors"
import { prisma } from "@/server/prisma"
import { ADMIN_COOKIE, readSessionToken, type SessionClaims } from "@/lib/sessionToken"

export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token) return null
  const claims = await readSessionToken(token)
  if (!claims) return null
  const user = await prisma.adminUser.findUnique({ where: { id: claims.sub } })
  if (!user || !user.isActive) return null
  return { sub: user.id, role: user.role, email: user.email }
}

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new ApiError(401, "UNAUTHORIZED", "Sign in required.")
  return session
}

export async function requireSuperAdmin() {
  const session = await requireSession()
  if (session.role !== "SUPERADMIN") {
    throw new ApiError(403, "FORBIDDEN", "Only a super admin can do that.")
  }
  return session
}
