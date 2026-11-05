import { NextResponse } from "next/server"
import { lookupApplicationStatus } from "@/server/adminService"
import { ApiError } from "@/server/errors"
import { jsonError } from "@/server/http"
import { clientIp, rateLimit } from "@/server/rateLimit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request, context: { params: Promise<{ refCode: string }> }) {
  try {
    rateLimit(`status:${clientIp(request)}`, 30, 10 * 60 * 1000)
    const { refCode } = await context.params
    const token = new URL(request.url).searchParams.get("token") ?? ""
    const status = await lookupApplicationStatus(decodeURIComponent(refCode), token)
    if (!status) {
      throw new ApiError(404, "NOT_FOUND", "No application matches that reference and token.")
    }
    return NextResponse.json(status, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return jsonError(error)
  }
}
