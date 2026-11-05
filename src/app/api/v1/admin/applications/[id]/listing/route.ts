import { NextResponse } from "next/server"
import { setListingDisabled } from "@/server/adminService"
import { jsonError } from "@/server/http"
import { listingVisibilitySchema } from "@/server/schemas"
import { requireSession } from "@/server/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await context.params
    const body = listingVisibilitySchema.parse(await request.json())
    const result = await setListingDisabled(id, session.sub, body.disabled)
    return NextResponse.json(result)
  } catch (error) {
    return jsonError(error)
  }
}
