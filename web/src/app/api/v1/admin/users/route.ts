import { NextResponse } from "next/server"
import { createStaffUser } from "@/server/adminService"
import { jsonError } from "@/server/http"
import { createReviewerSchema } from "@/server/schemas"
import { requireSuperAdmin } from "@/server/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    await requireSuperAdmin()
    const body = createReviewerSchema.parse(await request.json())
    const user = await createStaffUser(body)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
