"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface SoundControlProps {
  toggleMute: () => void
  isMuted: boolean
  initializeAudio: () => void
  masterVolume: number
  setMasterVolume: (volume: number) => void
}

export function SoundControl({
  toggleMute,
  isMuted,
  initializeAudio,
  masterVolume,
  setMasterVolume,
}: SoundControlProps) {
  const [isHovering, setIsHovering] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openPanel = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsHovering(true)
  }

  const closePanelWithDelay = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsHovering(false)
      closeTimeoutRef.current = null
    }, 180)
  }

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleClick = () => {
    initializeAudio()
    toggleMute()
  }

  const handleVolumeChange = (value: number[]) => {
    initializeAudio()
    setMasterVolume((value[0] ?? 0) / 100)
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-50"
      onMouseEnter={openPanel}
      onMouseLeave={closePanelWithDelay}
    >
      <Button
        variant="outline"
        size="icon"
        className="card-glass border-indigo-500/40 hover:border-indigo-400 hover:bg-space-800/80 rounded-full h-12 w-12 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-[background-color,border-color,box-shadow]"
        onClick={handleClick}
        title={isMuted ? "Invocar cantos de batalla" : "Silenciar cantos de batalla"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-indigo-400/50" />
        ) : (
          <div className="relative">
            <Volume2 className="h-5 w-5 text-indigo-300 drop-shadow-[0_0_5px_rgba(165,180,252,0.8)]" />
            <Music className="absolute -top-1 -right-1 h-2.5 w-2.5 text-indigo-400 animate-pulse" />
          </div>
        )}
      </Button>

      <div
        className={`absolute left-0 bottom-12 w-44 p-3 card-glass border border-indigo-500/30 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-[opacity,transform] ${
          isHovering ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        onMouseEnter={openPanel}
        onMouseLeave={closePanelWithDelay}
      >
        <div className="text-[10px] font-audiowide tracking-wider uppercase text-indigo-300 mb-2">Pulso Arcano</div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Math.round(masterVolume * 100)]}
          onValueChange={handleVolumeChange}
          aria-label="Control de volumen"
        />
        <div className="mt-2 text-[11px] text-indigo-300/80">{Math.round(masterVolume * 100)}%</div>
      </div>
    </div>
  )
}
