"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function PublicHeader() {
  const pathname = usePathname()
  if (pathname === "/") return null

  return (
    <header className="topbar">
      <Link className="brand" href="/">Jewish Business Directory</Link>
      <nav className="nav">
        <Link href="/apply">Apply</Link>
      </nav>
    </header>
  )
}
