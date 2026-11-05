import { NextResponse } from "next/server"
import { authenticateAdmin } from "@/server/adminService"
import { jsonError } from "@/server/http"
import { clientIp, rateLimit } from "@/server/rateLimit"
import { loginSchema } from "@/server/schemas"
import { ADMIN_COOKIE, adminCookieOptions, signSession } from "@/lib/sessionToken"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    rateLimit(`login:${clientIp(request)}`, 10, 10 * 60 * 1000)
    const body = loginSchema.parse(await request.json())
    const user = await authenticateAdmin(body.email, body.password)
    const token = await signSession({ sub: user.id, role: user.role, email: user.email })
    const response = NextResponse.json({ email: user.email, role: user.role })
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions())
    return response
  } catch (error) {
    return jsonError(error)
  }
}
