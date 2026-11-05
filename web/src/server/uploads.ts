export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

export function isAllowedMime(value: string): value is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value)
}
