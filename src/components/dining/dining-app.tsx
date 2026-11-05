"use client"

import { useEffect, useRef } from "react"
import type { DiningListing } from "@/lib/diningListing"
import { mountDining } from "@/components/dining/engine"
import "@/components/dining/dining.css"

export function DiningApp({
  listings,
  initialId,
  error,
}: {
  listings: DiningListing[]
  initialId?: string
  error?: string | null
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const listingsRef = useRef(listings)
  const initialRef = useRef(initialId)

  useEffect(() => {
    const host = hostRef.current
    if (!host || error) return
    return mountDining(host, listingsRef.current, initialRef.current)
  }, [error])

  if (error) {
    return (
      <div className="stage">
        <div className="device">
          <header className="appbar">
            <div className="bar1">
              <div className="brand">
                <div>
                  <div className="word">Jewish <b>Yellow</b> Pages</div>
                  <div className="subline">Shopping &amp; dining</div>
                </div>
              </div>
            </div>
          </header>
          <main className="scroll">
            <div className="page">
              <div className="pad">
                <div className="empty">
                  <h3>Directory unavailable</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="stage" ref={hostRef}>
      <div className="device" id="device">
        <header className="appbar" id="appbar" />
        <main className="scroll" id="view" tabIndex={-1} />
        <nav className="tabbar" id="tabbar" aria-label="Primary" />
        <div className="toast" id="toast" role="status" aria-live="polite" />
      </div>
    </div>
  )
}
