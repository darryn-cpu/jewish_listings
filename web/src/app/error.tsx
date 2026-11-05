"use client"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shell page" style={{ paddingTop: 48 }}>
      <h1>Something went wrong.</h1>
      <p className="lede">The directory could not load this view.</p>
      <button className="btn-primary" type="button" onClick={reset}>Try again</button>
    </main>
  )
}
