"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { TeamMember } from "@/types/game"
import { Monster } from "./monster"

interface BattleFormationProps {
  teamMembers: TeamMember[]
  monsterHealth: number
  maxMonsterHealth: number
  isDead: boolean
  isInBonusMode?: boolean
  isFiringProjectiles?: boolean
  previousHealth?: number
  playSound: (soundType: string) => void
  stopSound: (soundType: string) => void
}

export function BattleFormation({
  teamMembers,
  monsterHealth,
  maxMonsterHealth,
  isDead,
  isInBonusMode = false,
  isFiringProjectiles = false,
  previousHealth,
  playSound,
  stopSound,
}: BattleFormationProps) {
  // ARC FORMATION - Calculate position for each character
  const getArcPosition = (index: number, total: number) => {
    // MUCH HIGHER: Position characters so their BASE is above the boss name
    // Boss image height: ~240px (mobile) / ~384px (desktop)
    // Character height: ~64px (mobile) / ~96px (desktop)
    // Position at roughly 40px from center = characters will be in the lower-middle section of boss
    const baseY = 40
    const spacing = 70

    // First character: center-right
    if (index === 0) {
      return { x: 35, y: baseY }
    }
    // Second character: center-left
    if (index === 1) {
      return { x: -35, y: baseY }
    }

    // Rest: alternate expanding outward
    const pairNumber = Math.floor(index / 2)
    const isRightSide = index % 2 === 0
    const direction = isRightSide ? 1 : -1
    const distance = 35 + pairNumber * spacing

    return { x: direction * distance, y: baseY }
  }

  return (
    <div className="relative w-full min-h-[600px] sm:min-h-[700px] flex items-center justify-center">
      {/* Central Boss */}
      <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
        <Monster
          health={monsterHealth}
          maxHealth={maxMonsterHealth}
          isDead={isDead}
          isInBonusMode={isInBonusMode}
          previousHealth={previousHealth}
          playSound={playSound}
          stopSound={stopSound}
        />
      </div>

      {/* Team Members - Each with unique position */}
      {teamMembers.map((member, index) => {
        const pos = getArcPosition(index, teamMembers.length)
        const isAnswered = member.hasAnswered
        const isCorrect = member.answeredCorrectly

        // Calculate absolute position
        const leftPos = `calc(50% + ${pos.x}px)`
        const topPos = `calc(50% + ${pos.y}px)`

        return (
          <motion.div
            key={`${member.id}-${index}`}
            className="absolute"
            style={{
              left: leftPos,
              top: topPos,
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
          >
            {/* Character Image - Responsive size */}
            <motion.div
              className="relative w-12 h-16 sm:w-16 sm:h-24"
              animate={{
                scale: isAnswered && isCorrect ? [1, 1.1, 1] : [1, 1.02, 1],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                scale: { duration: 0.5, repeat: isAnswered && isCorrect ? 1 : 0 },
                rotate: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
            >
              {member.image ? (
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.class}
                  fill
                  sizes="(max-width: 640px) 48px, 64px"
                  loading="lazy"
                  className="object-contain"
                  style={{ filter: "drop-shadow(0 0 0 transparent)" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg sm:text-xl text-white">
                  {member.icon}
                </div>
              )}

              {/* Status Indicator */}
              {isAnswered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                    isCorrect ? (isInBonusMode ? "bg-yellow-500" : "bg-green-500") : "bg-red-500"
                  }`}
                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
                >
                  {isCorrect ? "✓" : "✗"}
                </motion.div>
              )}

              {/* Attack glow */}
              {isAnswered && isCorrect && (
                <motion.div
                  className={`absolute inset-0 rounded-lg opacity-25 blur-sm ${
                    isInBonusMode ? "bg-yellow-400" : "bg-green-400"
                  }`}
                  animate={{ opacity: [0, 0.25, 0] }}
                  transition={{ duration: 0.8, repeat: 1 }}
                />
              )}
            </motion.div>

            {/* Character Name - Responsive text */}
            <motion.div
              className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.3 }}
            >
              <div className="text-[9px] sm:text-[11px] font-audiowide uppercase tracking-wider text-indigo-200 bg-space-900/90 border border-indigo-500/40 px-2 py-0.5 sm:py-1 rounded-[4px] backdrop-blur-md whitespace-nowrap shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                {member.name}
              </div>
            </motion.div>

            {/* Attack Projectile */}
            {!isFiringProjectiles && isAnswered && isCorrect && (
              <motion.div
                className="absolute pointer-events-none z-30"
                style={{
                  left: "50%",
                  top: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Static charging core over player */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <motion.div 
                    className={`absolute inset-0 rounded-full blur-[4px] ${isInBonusMode ? "bg-yellow-400" : "bg-cyan-400"}`}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className={`w-2.5 h-2.5 rounded-full z-10 ${isInBonusMode ? "bg-white shadow-[0_0_15px_#fef08a]" : "bg-white shadow-[0_0_15px_#a5f3fc]"}`} />
                </div>
              </motion.div>
            )}

            {isFiringProjectiles && isAnswered && isCorrect && (
              <motion.div
                className="absolute pointer-events-none z-30"
                style={{
                  left: "50%",
                  top: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 1, 
                  opacity: 1,
                }}
                animate={{ 
                  x: [0, -pos.x * 0.4, -pos.x * 0.8, -pos.x],
                  y: [0, -40, -pos.y - 80, -pos.y],
                  scale: [0, 1.8, 1.2, 0.5],
                  opacity: [0, 0.9, 0.8, 0],
                }}
                transition={{ 
                  duration: 1.2, 
                  times: [0, 0.4, 0.8, 1], 
                  ease: ["easeInOut", "easeIn", "easeIn"] 
                }}
              >
                {/* Glowing Core */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <motion.div 
                    className={`absolute inset-0 rounded-full blur-sm ${isInBonusMode ? "bg-yellow-300" : "bg-cyan-300"}`}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className={`w-2 h-2 rounded-full z-10 ${isInBonusMode ? "bg-white shadow-[0_0_10px_#fef08a]" : "bg-white shadow-[0_0_10px_#a5f3fc]"}`} />
                  
                  {/* Trail rings */}
                  <motion.div 
                    className={`absolute inset-[-4px] rounded-full border ${isInBonusMode ? "border-yellow-200/40" : "border-cyan-200/40"}`}
                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
