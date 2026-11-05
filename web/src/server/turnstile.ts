import "server-only"
import { ApiError } from "@/server/errors"

export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY is unset; the bot check was skipped.")
    return
  }
  if (!token) {
    throw new ApiError(400, "TURNSTILE_REQUIRED", "Complete the bot check before submitting.")
  }
  const body = new URLSearchParams({ secret, response: token, remoteip: ip })
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  })
  const result = (await response.json()) as { success?: boolean }
  if (!result.success) {
    throw new ApiError(400, "TURNSTILE_FAILED", "The bot check failed. Try again.")
  }
}
