"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

interface CdnMarker {
  id: string
  location: [number, number]
  region: string
}

interface CdnArc {
  id: string
  from: [number, number]
  to: [number, number]
}

interface GlobeCdnProps {
  markers?: CdnMarker[]
  arcs?: CdnArc[]
  className?: string
  speed?: number
}

const defaultMarkers: CdnMarker[] = [
  { id: "m1", location: [38.95, -77.45], region: "NA" },
  { id: "m2", location: [37.62, -122.38], region: "WEST" },
  { id: "m3", location: [49.01, 2.55], region: "EU" },
  { id: "m4", location: [35.55, 139.78], region: "APAC" },
  { id: "m5", location: [-33.95, 151.18], region: "OCE" },
  { id: "m6", location: [-23.43, -46.47], region: "LATAM" },
  { id: "m7", location: [1.36, 103.99], region: "SEA" },
  { id: "m8", location: [19.09, 72.87], region: "IND" },
]

const defaultArcs: CdnArc[] = [
  { id: "a1", from: [38.95, -77.45], to: [49.01, 2.55] },
  { id: "a2", from: [37.62, -122.38], to: [35.55, 139.78] },
  { id: "a3", from: [49.01, 2.55], to: [1.36, 103.99] },
  { id: "a4", from: [38.95, -77.45], to: [-23.43, -46.47] },
  { id: "a5", from: [35.55, 139.78], to: [-33.95, 151.18] },
  { id: "a6", from: [49.01, 2.55], to: [19.09, 72.87] },
]

export function GlobeCdn({ markers = defaultMarkers, arcs = defaultArcs, className = "", speed = 0.003 }: GlobeCdnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const [traffic, setTraffic] = useState(() =>
    defaultArcs.map((a, i) => ({ id: a.id, value: [420, 380, 290, 185, 156, 134][i] || 100 })),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic((data) =>
        data.map((t) => ({
          ...t,
          value: Math.max(50, t.value + Math.floor(Math.random() * 21) - 10),
        })),
      )
    }, 250)
    return () => clearInterval(interval)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 2,
        baseColor: [0.14, 0.16, 0.22],
        markerColor: [0.3, 0.82, 0.95],
        glowColor: [0.07, 0.35, 0.5],
        markerElevation: 0.03,
        markers: markers.map((m) => ({ location: m.location, size: 0.012 })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to })),
        arcColor: [0.96, 0.74, 0.38],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.85,
      } as any)

      const animate = () => {
        if (!isPausedRef.current) phi += speed
        globe?.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }

      animate()

      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1"
      })
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />

    </div>
  )
}
