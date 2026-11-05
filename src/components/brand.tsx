import Link from "next/link"

/** The storefront mark used in the main site's app bar. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="brand-mark-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#ff9f1c" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="10" fill="url(#brand-mark-fill)" />
      <g transform="translate(6.4 6.4) scale(.8)" fill="none" stroke="#1d1500" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9l1.5-5h13L20 9" />
        <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" />
        <path d="M5.5 12v8h13v-8" />
        <path d="M10 20v-4.5h4V20" />
      </g>
    </svg>
  )
}

export function BrandLink({ subline = "Shopping & dining", href = "/" }: { subline?: string; href?: string }) {
  return (
    <Link className="brand" href={href}>
      <BrandMark />
      <span>
        <span className="word">Jewish <b>Yellow</b> Pages</span>
        <span className="subline">{subline}</span>
      </span>
    </Link>
  )
}
