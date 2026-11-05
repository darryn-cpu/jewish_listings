import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { ApiError } from "@/server/errors"
import { isAllowedMime, MAX_UPLOAD_BYTES } from "@/server/uploads"

function bucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET || "business-documents"
}

let cached: SupabaseClient | null = null

function client(): SupabaseClient {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new ApiError(500, "STORAGE_NOT_CONFIGURED", "File storage is not configured.")
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export async function createUploadTarget(objectKey: string) {
  const { data, error } = await client().storage.from(bucketName()).createSignedUploadUrl(objectKey, { upsert: false })
  if (error || !data?.signedUrl || !data.token) {
    throw new ApiError(500, "STORAGE_SIGN_FAILED", "The upload could not be started.")
  }
  return { signedUrl: data.signedUrl, token: data.token, path: data.path }
}

export async function assertStoredObject(objectKey: string) {
  const { data, error } = await client().storage.from(bucketName()).info(objectKey)
  if (error || !data) {
    throw new ApiError(400, "UPLOAD_MISSING", "A document upload did not finish. Upload it again.")
  }
  if (typeof data.size === "number" && data.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(400, "UPLOAD_TOO_LARGE", "A document is larger than 10 MB.")
  }
  const contentType = data.contentType?.split(";")[0]?.trim()
  if (contentType && !isAllowedMime(contentType)) {
    throw new ApiError(400, "UPLOAD_TYPE", "A document is not a PDF or image.")
  }
}

export async function signedDownloadUrl(objectKey: string) {
  const { data, error } = await client().storage.from(bucketName()).createSignedUrl(objectKey, 300)
  if (error || !data?.signedUrl) {
    throw new ApiError(500, "STORAGE_SIGN_FAILED", "The document could not be opened.")
  }
  return data.signedUrl
}
