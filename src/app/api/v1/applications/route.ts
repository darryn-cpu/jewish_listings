import { NextResponse } from "next/server"
import { submitApplication } from "@/server/applicationService"
import { jsonError } from "@/server/http"
import { clientIp, rateLimit } from "@/server/rateLimit"
import { applicationSchema } from "@/server/schemas"
import { verifyTurnstile } from "@/server/turnstile"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const ip = clientIp(request)
    rateLimit(`apply:${ip}`, 5, 10 * 60 * 1000)
    const body = applicationSchema.parse(await request.json())
    await verifyTurnstile(body.turnstileToken, ip)
    const result = await submitApplication(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
