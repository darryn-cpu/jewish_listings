import "server-only"

type Entry = { expires: number; payload: unknown }

const directoryCache = new Map<string, Entry>()
let metadataCache: Entry | null = null

export function readCache(store: "directory" | "metadata", key: string) {
  const entry = store === "metadata" ? metadataCache : directoryCache.get(key)
  if (!entry || entry.expires <= Date.now()) return null
  return entry.payload
}

export function writeCache(store: "directory" | "metadata", key: string, payload: unknown, ttlMs: number) {
  const entry = { expires: Date.now() + ttlMs, payload }
  if (store === "metadata") metadataCache = entry
  else directoryCache.set(key, entry)
}

export function invalidateDirectoryCache() {
  directoryCache.clear()
}
