import { NextResponse } from "next/server"
import { getStats } from "@/server/adminService"
import { jsonError } from "@/server/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json(await getStats(), { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return jsonError(error)
  }
}
