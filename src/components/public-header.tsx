"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLink } from "@/components/brand"
import { LinkPending } from "@/components/link-pending"

export function PublicHeader() {
  const pathname = usePathname()
  if (pathname === "/") return null

  return (
    <header className="topbar">
      <BrandLink />
      <nav className="nav" aria-label="Primary">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Directory <LinkPending label="Loading" /></Link>
        <Link href="/apply" aria-current={pathname.startsWith("/apply") ? "page" : undefined}>Apply <LinkPending label="Loading" /></Link>
      </nav>
    </header>
  )
}
