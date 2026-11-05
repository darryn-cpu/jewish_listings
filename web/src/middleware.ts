import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, readSessionToken } from "@/lib/sessionToken"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLogin = pathname === "/admin/login" || pathname === "/api/v1/admin/auth/login"
  if (isLogin) return NextResponse.next()

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const session = token ? await readSessionToken(token).catch(() => null) : null
  if (session) return NextResponse.next()

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required.", details: null } },
      { status: 401 },
    )
  }

  const login = request.nextUrl.clone()
  login.pathname = "/admin/login"
  login.searchParams.set("next", pathname)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
}
