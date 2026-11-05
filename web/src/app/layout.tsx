import type { Metadata, Viewport } from "next"
import { Fraunces, Outfit } from "next/font/google"
import "./globals.css"

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" })
const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: { default: "Jewish Business Directory", template: "%s · Jewish Business Directory" },
  description: "Kosher shopping and dining in South Africa, plus the vetted Jewish business directory.",
  applicationName: "Jewish Yellow Pages",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kosher Dining", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
}

export const viewport: Viewport = {
  themeColor: "#f7f4ec",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  )
}
