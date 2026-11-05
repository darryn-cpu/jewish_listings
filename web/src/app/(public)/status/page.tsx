import { redirect } from "next/navigation"
import { one } from "@/lib/directory"

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const params = new URLSearchParams({ view: "status" })
  const ref = one(raw.ref)?.trim()
  const token = one(raw.token)?.trim()
  if (ref) params.set("ref", ref)
  if (token) params.set("token", token)
  redirect(`/apply?${params.toString()}`)
}
