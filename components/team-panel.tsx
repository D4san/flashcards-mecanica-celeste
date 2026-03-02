"use client"

import type { TeamMember } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Check, X, Zap } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

interface TeamPanelProps {
  teamMembers: TeamMember[]
  onMemberAnswer: (memberId: string, correct: boolean) => void
  onContinue: () => void
  allAnswered: boolean
  isFlipped: boolean
  isInBonusMode?: boolean
  buttonText?: string
}

export function TeamPanel({
  teamMembers,
  onMemberAnswer,
  onContinue,
  allAnswered,
  isFlipped,
  isInBonusMode = false,
  buttonText,
}: TeamPanelProps) {
  if (!isFlipped) return null

  const correctAnswers = teamMembers.filter((member) => member.answeredCorrectly).length
  const totalMembers = teamMembers.length

  return (
    <div className="w-full max-w-7xl font-rajdhani">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 mb-3 drop-shadow-lg">
          {isInBonusMode
            ? "¡FURIA ASTRAL! ¿Quién asestó el golpe crítico?"
            : "EVALUACIÓN TÁCTICA DEL ESCUADRÓN"}
        </h3>
        {allAnswered && (
          <div className="text-xl text-yellow-300 font-audiowide mt-4 bg-indigo-950/40 inline-block px-6 py-2 rounded-full border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            {correctAnswers}/{totalMembers} GOLPES CERTEROS
            {isInBonusMode && <span className="ml-2 animate-pulse">🌟 +{correctAnswers * 20} DAÑO EXTRA</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border transition-[background-color,border-color,box-shadow] duration-500 ${
              member.hasAnswered
                ? member.answeredCorrectly
                  ? `${
                      isInBonusMode
                        ? "bg-yellow-900/30 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                        : "bg-emerald-900/30 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    }`
                  : "bg-red-900/30 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                : "card-glass border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
            }`}
          >
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="text-center space-y-4">
              {/* RECTANGULAR Character Image */}
              <div className="relative -mt-10 mb-4 z-10 w-full flex justify-center">
                <motion.div
                  className="relative w-20 h-24 rounded-lg overflow-hidden bg-space-900 border border-indigo-400/50 shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                  whileHover={{ scale: 1.05, borderColor: "rgba(129, 140, 248, 0.8)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent z-10 pointer-events-none"></div>
                  {member.image ? (
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.class}
                      fill
                      sizes="80px"
                      className="object-contain object-center p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{member.icon}</div>
                  )}
                </motion.div>

                {/* Status Indicator */}
                {member.hasAnswered && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -bottom-3 right-auto z-20 w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-space-900 ${
                      member.answeredCorrectly ? (isInBonusMode ? "bg-yellow-500" : "bg-emerald-500") : "bg-red-500"
                    }`}
                  >
                    {member.answeredCorrectly ? "✓" : "✗"}
                  </motion.div>
                )}
              </div>

              <div className="font-bold text-lg text-indigo-100 tracking-wide pt-2">{member.name}</div>
              <div className="text-xs font-audiowide text-indigo-400/80 uppercase tracking-widest line-clamp-2 px-2">{member.class}</div>

              {!member.hasAnswered ? (
                <div className="flex space-x-3 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Respuesta correcta de ${member.name}`}
                    className="flex-1 text-emerald-400 border-emerald-500/50 hover:bg-emerald-950/50 hover:border-emerald-400 bg-space-900/50 transition-all font-audiowide"
                    onClick={() => onMemberAnswer(member.id, true)}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Respuesta incorrecta de ${member.name}`}
                    className="flex-1 text-red-400 border-red-500/50 hover:bg-red-950/50 hover:border-red-400 bg-space-900/50 transition-all font-audiowide"
                    onClick={() => onMemberAnswer(member.id, false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`text-lg font-audiowide mt-2 text-shadow-sm ${
                    member.answeredCorrectly ? (isInBonusMode ? "text-yellow-400" : "text-emerald-400") : "text-red-400"
                  }`}
                >
                  {member.answeredCorrectly ? "IMPACTO" : "FALLO"}
                  {member.answeredCorrectly && isInBonusMode && <span className="ml-2 animate-pulse">⚡</span>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      {allAnswered && (
        <div className="text-center space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <Button
              onClick={onContinue}
              size="lg"
              className={`${
                isInBonusMode
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              } px-14 py-6 text-xl font-audiowide tracking-widest border border-white/20`}
            >
              {buttonText ? (
                buttonText
              ) : isInBonusMode ? (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  Continuar Furia Astral
                </>
              ) : (
                "Continuar al Siguiente Enfrentamiento"
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
