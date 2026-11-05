"use client"

import { useLinkStatus } from "next/link"
import { Spinner } from "@/components/spinner"

export function LinkPending({ label = "Loading", overlay = false }: { label?: string; overlay?: boolean }) {
  const { pending } = useLinkStatus()
  if (!pending) return null
  const className = overlay ? "link-pending" : "inline-pending"
  return (
    <span className={className} role="status">
      <Spinner />
      {label}
    </span>
  )
}
