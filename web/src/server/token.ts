import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

export function createStatusToken() {
  const token = randomBytes(32).toString("base64url")
  return { token, hash: hashStatusToken(token) }
}

export function hashStatusToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function tokenMatches(token: string, hash: string) {
  const actual = Buffer.from(hashStatusToken(token), "hex")
  const expected = Buffer.from(hash, "hex")
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}
