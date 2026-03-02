"use client"

import { useEffect, useState } from "react"

interface TimerRingProps {
  duration: number
  timeLeft: number
  size?: number
  strokeWidth?: number
}

export function TimerRing({ duration, timeLeft, size = 60, strokeWidth = 4 }: TimerRingProps) {
  const [dashOffset, setDashOffset] = useState(0)

  // Calculate constants
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    // Calculate the dash offset based on time remaining
    const percentComplete = 1 - timeLeft / duration
    const offset = circumference * percentComplete
    setDashOffset(offset)
  }, [timeLeft, duration, circumference])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="absolute top-0 left-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(99, 102, 241, 0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          fill="transparent"
          stroke="rgba(99, 102, 241, 0.05)"
          strokeWidth={1}
          strokeDasharray="4 4"
          className="animate-[spin_10s_linear_infinite]"
        />
      </svg>

      {/* Timer progress circle */}
      <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={timeLeft < 30 ? "#ef4444" : "#6366f1"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
        />
      </svg>

      {/* Timer text */}
      <div className={`absolute inset-0 flex items-center justify-center font-audiowide text-sm tracking-wider ${timeLeft < 30 ? "text-red-400 animate-pulse" : "text-indigo-300"}`}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </div>
    </div>
  )
}
