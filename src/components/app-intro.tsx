"use client"

import { useEffect, useRef, useState } from "react"

let played = false

function silence(video: HTMLVideoElement) {
  if (!video.defaultMuted) video.defaultMuted = true
  if (!video.muted) video.muted = true
  if (video.volume !== 0) video.volume = 0
  const tracks = (video as HTMLVideoElement & {
    audioTracks?: { length: number; [index: number]: { enabled: boolean } }
  }).audioTracks
  if (!tracks) return
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].enabled) tracks[i].enabled = false
  }
}

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
    silence(video)
    video.play().catch(() => undefined)
  }, [])

  function dismiss() {
    if (phase !== "play") return
    const video = videoRef.current
    if (video) {
      silence(video)
      video.pause()
    }
    played = true
    setPhase("out")
    window.setTimeout(() => setPhase("gone"), 480)
  }

  if (phase === "gone") return null

  return (
    <div className={phase === "out" ? "intro out" : "intro"}>
      <video
        ref={(node) => {
          videoRef.current = node
          if (node) silence(node)
        }}
        src="/intro.mp4"
        muted
        autoPlay
        playsInline
        preload="auto"
        onPlay={(event) => silence(event.currentTarget)}
        onLoadedMetadata={(event) => silence(event.currentTarget)}
        onVolumeChange={(event) => silence(event.currentTarget)}
        onEnded={dismiss}
        onError={dismiss}
      />
    </div>
  )
}
