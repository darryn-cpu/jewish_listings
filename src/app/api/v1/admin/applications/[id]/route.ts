import { NextResponse } from "next/server"
import { getAdminApplication } from "@/server/adminService"
import { ApiError } from "@/server/errors"
import { jsonError } from "@/server/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const application = await getAdminApplication(id)
    if (!application) throw new ApiError(404, "NOT_FOUND", "That application does not exist.")
    return NextResponse.json(application, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return jsonError(error)
  }
}
