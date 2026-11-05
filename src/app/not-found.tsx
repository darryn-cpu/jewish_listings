import { BrandLink } from "@/components/brand"

export default function NotFound() {
  return (
    <div className="shell site narrow">
      <header className="topbar">
        <BrandLink />
      </header>
      <main className="page">
        <div>
          <p className="kicker">Not found</p>
          <h1>That page is not in the directory.</h1>
          <p className="lede"><a href="/">Return to the listings</a></p>
        </div>
      </main>
    </div>
  )
}
