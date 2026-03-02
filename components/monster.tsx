"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"

interface MonsterProps {
  health: number
  maxHealth: number
  isDead: boolean
  isInBonusMode?: boolean
  previousHealth?: number
  playSound: (soundType: string) => void
  stopSound: (soundType: string) => void
}

export function Monster({ health, maxHealth, isDead, isInBonusMode = false, previousHealth, playSound, stopSound }: MonsterProps) {
  const [isAttacking, setIsAttacking] = useState(false)
  const [showDamage, setShowDamage] = useState(false)
  const [damageAmount, setDamageAmount] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [damageAnimationKey, setDamageAnimationKey] = useState(0)

  const lastDamageTimeRef = useRef<number>(0)
  const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const damageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const soundTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const monsterControls = useAnimation()
  const flashControls = useAnimation()
  const damageControls = useAnimation()

  const healthPercentage = (health / maxHealth) * 100

  // Clear all timeouts and animations on unmount
  useEffect(() => {
    return () => {
      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current)
      if (damageTimeoutRef.current) clearTimeout(damageTimeoutRef.current)
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current)

      monsterControls.stop()
      flashControls.stop()
      damageControls.stop()

      stopSound("bossDamage")
    }
  }, [monsterControls, flashControls, damageControls, stopSound])

  // Define animation sequences
  const attackAnimation = {
    scale: [1, 1.15, 0.9, 1.05, 1],
    rotate: [0, -5, 5, -2, 0],
  }

  const flashAnimation = {
    opacity: [0, 0.8, 0.4, 0],
    scale: [0.8, 1.3, 1.1, 0.8],
  }

  const damageNumberAnimation = {
    opacity: [1, 1, 0.9, 0],
    y: [0, -40, -80, -120],
    scale: [1.8, 2.5, 2.2, 2.8],
  }

  // Handle health change and trigger attack animation
  useEffect(() => {
    if (previousHealth !== undefined && health < previousHealth) {
      const currentTime = Date.now()
      const timeSinceLastDamage = currentTime - lastDamageTimeRef.current

      if (timeSinceLastDamage >= 1000) {
        const damage = previousHealth - health
        setDamageAmount(damage)

        if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current)
        if (damageTimeoutRef.current) clearTimeout(damageTimeoutRef.current)
        if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current)

        monsterControls.stop()
        flashControls.stop()
        damageControls.stop()

        stopSound("bossDamage")

        setAnimationKey((prev) => prev + 1)
        setDamageAnimationKey((prev) => prev + 1)

        setIsAttacking(true)
        setShowDamage(true)
        lastDamageTimeRef.current = currentTime

        playSound("bossDamage")

        const runAttackSequence = async () => {
          try {
            for (let i = 0; i < 3; i++) {
              await monsterControls.start(attackAnimation)
            }
            setIsAttacking(false)
          } catch (error) {
            console.error("Animation error:", error)
            setIsAttacking(false)
          }
        }

        const runFlashSequence = async () => {
          try {
            for (let i = 0; i < 3; i++) {
              await flashControls.start(flashAnimation)
            }
          } catch (error) {
            console.error("Flash animation error:", error)
          }
        }

        const runDamageNumberSequence = async () => {
          try {
            await damageControls.start(damageNumberAnimation)
            setShowDamage(false)
          } catch (error) {
            console.error("Damage number animation error:", error)
            setShowDamage(false)
          }
        }

        runAttackSequence()
        runFlashSequence()
        runDamageNumberSequence()

        attackTimeoutRef.current = setTimeout(() => {
          setIsAttacking(false)
          setShowDamage(false)
          stopSound("bossDamage")
          monsterControls.stop()
          flashControls.stop()
          damageControls.stop()
          attackTimeoutRef.current = null
        }, 3500)
      }
    }

    if (previousHealth !== undefined && previousHealth > 0 && health <= 0) {
      const currentTime = Date.now()
      const timeSinceLastDamage = currentTime - lastDamageTimeRef.current

      if (timeSinceLastDamage >= 1000) {
        playSound("monsterDeath")
      } else {
        setTimeout(() => playSound("monsterDeath"), 1000 - timeSinceLastDamage)
      }
    }
  }, [health, previousHealth, playSound, stopSound, monsterControls, flashControls, damageControls])

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 relative px-4">
      {/* Damage Number Animation - Responsive */}
      {showDamage && damageAmount > 0 && (
        <motion.div
          key={`damage-${damageAnimationKey}`}
          className="absolute -top-16 sm:-top-24 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
          initial={{ opacity: 1, y: 0, scale: 1.5 }}
          animate={damageControls}
          transition={{
            duration: 3.0,
            times: [0, 0.2, 0.8, 1],
            ease: "easeOut",
          }}
        >
          <motion.div
            className="text-5xl sm:text-8xl font-black text-red-500 drop-shadow-2xl"
            style={{
              textShadow: "4px 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,0,0,0.9), 0 0 40px rgba(255,255,255,0.6)",
              WebkitTextStroke: "2px white",
            }}
            animate={{
              scale: [1, 1.3, 1.1, 1.2, 1],
              rotate: [0, -3, 3, -2, 0],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.2, 0.4, 0.6, 1],
              ease: "easeInOut",
            }}
          >
            -{damageAmount}
          </motion.div>
          <motion.div
            className="text-lg sm:text-3xl font-bold text-yellow-400 text-center mt-1 sm:mt-2"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.4, 1.2, 1],
            }}
            transition={{
              duration: 2.0,
              times: [0, 0.3, 0.7, 1],
              ease: "easeOut",
            }}
          >
            DAÑO ASTRAL
          </motion.div>
        </motion.div>
      )}

      {/* Monster Image Container - Responsive */}
      <div className="relative">
        {!isAttacking && (
          <motion.div
            className={`relative ${isDead ? "grayscale opacity-70" : ""} ${
              isInBonusMode ? "hue-rotate-60 brightness-125" : ""
            }`}
            animate={{ y: isDead ? 0 : [0, -15, 0], rotate: isDead ? 0 : [0, 3, -3, 0] }}
            transition={{
              y: {
                duration: 3.5,
                repeat: isDead ? 0 : Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
              rotate: {
                duration: 8,
                repeat: isDead ? 0 : Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            <div className="relative w-48 h-60 sm:w-80 sm:h-96 flex items-center justify-center">
              <Image
                src="/boss.png"
                alt="Bestia Astral Primordial"
                fill
                className="object-contain drop-shadow-2xl"
                style={{ imageRendering: "pixelated" }}
                priority
                sizes="(max-width: 640px) 192px, 320px"
              />
            </div>

            <div className="absolute inset-0 bg-purple-600 rounded-full opacity-25 blur-2xl -z-10"></div>
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-15 blur-3xl -z-20"></div>
          </motion.div>
        )}

        {isAttacking && (
          <motion.div
            key={`attack-${animationKey}`}
            className={`relative ${isDead ? "grayscale opacity-70" : ""} ${
              isInBonusMode ? "hue-rotate-60 brightness-125" : ""
            }`}
            animate={monsterControls}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
          >
            <div className="relative w-48 h-60 sm:w-80 sm:h-96 flex items-center justify-center">
              <Image
                src="/boss.png"
                alt="Devorador Astral Enfurecido"
                fill
                className="object-contain drop-shadow-2xl"
                style={{ imageRendering: "pixelated" }}
                priority
                sizes="(max-width: 640px) 192px, 320px"
              />
            </div>

            <motion.div
              key={`flash-${animationKey}`}
              className="absolute inset-0 bg-red-600 rounded-full opacity-60 mix-blend-screen"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={flashControls}
              transition={{
                duration: 1.0,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}

        {isInBonusMode && (
          <motion.div
            className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 blur-2xl"
            animate={{ opacity: [0.2, 0.35, 0.2] }}
            transition={{
              duration: 2.0,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* Health Bar Container - Cyber/Arcane */}
      <div className="w-full max-w-[280px] sm:max-w-md space-y-2 relative z-10 font-rajdhani">
        <div className="flex justify-between items-center text-indigo-300 text-sm sm:text-base font-bold px-1 uppercase tracking-widest font-audiowide drop-shadow-md">
          <span>CRIATURA ASTRAL</span>
          <span className="text-white">
            {health} <span className="text-indigo-500/50">/</span> {maxHealth}
          </span>
        </div>

        <div className="relative h-4 sm:h-5 bg-space-900/80 rounded-sm border border-indigo-500/40 p-0.5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          {/* Health Bar Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:10px_100%] z-10 pointer-events-none opacity-50"></div>
          
          <motion.div
            className="h-full rounded-[2px] relative overflow-hidden"
            initial={{ width: "100%" }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{
              background: healthPercentage > 50 
                ? "linear-gradient(90deg, #3730a3, #6366f1)" 
                : healthPercentage > 25 
                  ? "linear-gradient(90deg, #b45309, #f59e0b)" 
                  : "linear-gradient(90deg, #991b1b, #ef4444)",
              boxShadow: healthPercentage > 50 
                ? "0 0 10px rgba(99, 102, 241, 0.5)" 
                : healthPercentage > 25 
                  ? "0 0 10px rgba(245, 158, 11, 0.5)" 
                  : "0 0 10px rgba(239, 68, 68, 0.5)"
            }}
          >
            {/* Energy scanline inside health bar */}
            <motion.div
              className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Status Messages - Responsive */}
      {isDead && !isInBonusMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, filter: "blur(5px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 text-center font-cinzel drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] tracking-widest mt-6"
        >
          ¡CRIATURA DERROTADA!
        </motion.div>
      )}

      {isInBonusMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl sm:text-4xl font-bold text-yellow-400 text-center font-audiowide drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] mt-6"
        >
          FURIA DE BATALLA
        </motion.div>
      )}
    </div>
  )
}
