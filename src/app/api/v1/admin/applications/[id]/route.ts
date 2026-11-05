import { NextResponse } from "next/server"
import { getAdminApplication, removeListing } from "@/server/adminService"
import { ApiError } from "@/server/errors"
import { jsonError } from "@/server/http"
import { requireSession } from "@/server/session"

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

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await context.params
    const result = await removeListing(id, session.sub)
    return NextResponse.json(result)
  } catch (error) {
    return jsonError(error)
  }
}
