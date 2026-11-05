"use client"

import { useEffect, useRef, useState } from "react"

let played = false

export function AppIntro() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<"play" | "out" | "gone">(played ? "gone" : "play")

  useEffect(() => {
    if (played) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      played = true
      setPhase("gone")
      return
    }
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.play().catch(() => {
      video.muted = true
      video.play().catch(() => undefined)
    })
  }, [])

  function dismiss() {
    if (phase !== "play") return
    played = true
    setPhase("out")
    window.setTimeout(() => setPhase("gone"), 480)
  }

  if (phase === "gone") return null

  return (
    <div className={phase === "out" ? "intro out" : "intro"}>
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={dismiss}
        onError={dismiss}
      />
    </div>
  )
}
