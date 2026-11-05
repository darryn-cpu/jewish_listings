import { NextResponse } from "next/server"
import { getApprovedBusiness } from "@/server/directoryService"
import { ApiError } from "@/server/errors"
import { jsonError } from "@/server/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const business = await getApprovedBusiness(id)
    if (!business) throw new ApiError(404, "NOT_FOUND", "That business is not in the directory.")
    return NextResponse.json(business, { headers: { "Cache-Control": "public, max-age=30" } })
  } catch (error) {
    return jsonError(error)
  }
}
