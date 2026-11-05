import { NextResponse } from "next/server"
import { createPresignedUpload } from "@/server/applicationService"
import { jsonError } from "@/server/http"
import { clientIp, rateLimit } from "@/server/rateLimit"
import { presignSchema } from "@/server/schemas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    rateLimit(`presign:${clientIp(request)}`, 20, 10 * 60 * 1000)
    const body = presignSchema.parse(await request.json())
    const upload = await createPresignedUpload(body)
    return NextResponse.json(upload, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
