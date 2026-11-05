"use client"

import { BrandLink } from "@/components/brand"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="shell site narrow">
      <header className="topbar">
        <BrandLink />
      </header>
      <main className="page">
        <div>
          <p className="kicker">Error</p>
          <h1>Something went wrong.</h1>
          <p className="lede">The directory could not load this view.</p>
        </div>
        <button className="btn-primary" type="button" onClick={reset}>Try again</button>
      </main>
    </div>
  )
}
