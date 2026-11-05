import { NextResponse } from "next/server"
import { listQueue, parseQueueQuery } from "@/server/adminService"
import { jsonError } from "@/server/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const queue = await listQueue(parseQueueQuery(new URL(request.url).searchParams))
    return NextResponse.json(queue, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return jsonError(error)
  }
}
