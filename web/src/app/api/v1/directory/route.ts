import { NextResponse } from "next/server"
import { readCache, writeCache } from "@/server/cache"
import { listDirectory } from "@/server/directoryService"
import { jsonError } from "@/server/http"
import { parseDirectoryQuery } from "@/server/schemas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const query = parseDirectoryQuery(new URL(request.url).searchParams)
    const cacheKey = new URL(request.url).search
    const cached = readCache("directory", cacheKey)
    if (cached) {
      return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=30" } })
    }
    const directory = await listDirectory(query)
    writeCache("directory", cacheKey, directory, 30_000)
    return NextResponse.json(directory, { headers: { "Cache-Control": "public, max-age=30" } })
  } catch (error) {
    return jsonError(error)
  }
}
