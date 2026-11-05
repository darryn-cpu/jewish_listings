import { NextResponse } from "next/server"
import { changeApplicationStatus } from "@/server/adminService"
import { jsonError } from "@/server/http"
import { requireSession } from "@/server/session"
import { statusChangeSchema } from "@/server/schemas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await context.params
    const body = statusChangeSchema.parse(await request.json())
    const result = await changeApplicationStatus(id, session.sub, body)
    return NextResponse.json(result)
  } catch (error) {
    return jsonError(error)
  }
}
