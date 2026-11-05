import { NextResponse } from "next/server"
import { jsonError } from "@/server/http"
import { getMetadata } from "@/server/metadataService"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const metadata = await getMetadata()
    return NextResponse.json(metadata, { headers: { "Cache-Control": "public, max-age=3600" } })
  } catch (error) {
    return jsonError(error)
  }
}
