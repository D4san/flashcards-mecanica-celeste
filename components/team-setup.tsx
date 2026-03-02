"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { rpgClasses } from "@/data/rpg-classes"
import type { TeamMember } from "@/types/game"
import { Trash2, Plus } from "lucide-react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

interface TeamSetupProps {
  onStartGame: (team: TeamMember[]) => void
  onRecruit?: () => void
}

export function TeamSetup({ onStartGame, onRecruit }: TeamSetupProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMemberName, setNewMemberName] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [recentRecruit, setRecentRecruit] = useState<TeamMember | null>(null)
  const recruitAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (recruitAnimationTimeoutRef.current) {
        clearTimeout(recruitAnimationTimeoutRef.current)
      }
    }
  }, [])

  const addTeamMember = () => {
    if (newMemberName.trim() && selectedClass && teamMembers.length < 8) {
      const selectedRPGClass = rpgClasses.find((c) => c.id === selectedClass)
      if (selectedRPGClass) {
        const newMember: TeamMember = {
          id: Date.now().toString(),
          name: newMemberName.trim(),
          class: selectedRPGClass.name,
          icon: selectedRPGClass.icon,
          image: selectedRPGClass.image,
          hasAnswered: false,
          answeredCorrectly: false,
        }
        setTeamMembers([...teamMembers, newMember])
        setRecentRecruit(newMember)
        onRecruit?.()

        if (recruitAnimationTimeoutRef.current) {
          clearTimeout(recruitAnimationTimeoutRef.current)
        }

        recruitAnimationTimeoutRef.current = setTimeout(() => {
          setRecentRecruit(null)
        }, 1600)

        setNewMemberName("")
        setSelectedClass("")
      }
    }
  }

  const removeMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id))
  }

  const canStartGame = teamMembers.length >= 2;

  return (
    <div className="w-full max-w-7xl space-y-8 font-rajdhani">
      <AnimatePresence>
        {recentRecruit && (
          <motion.div
            key={recentRecruit.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.03, opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-indigo-400/40 bg-space-900/90 p-6 text-center shadow-[0_0_35px_rgba(99,102,241,0.45)]"
            >
              <p className="text-xs font-audiowide tracking-[0.2em] text-indigo-300/90 uppercase">Nuevo recluta</p>
              <div className="mx-auto mt-4 relative h-36 w-28 overflow-hidden rounded-xl border border-indigo-400/40 bg-space-950/80">
                {recentRecruit.image ? (
                  <Image
                    src={recentRecruit.image || "/placeholder.svg"}
                    alt={recentRecruit.class}
                    fill
                    sizes="112px"
                    className="object-contain object-center p-1"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-4xl text-indigo-200">{recentRecruit.icon}</div>
                )}
              </div>
              <h3 className="mt-4 text-2xl font-cinzel font-bold text-indigo-100 break-words">{recentRecruit.name}</h3>
              <p className="mt-1 text-sm uppercase tracking-[0.14em] text-indigo-300/80 font-audiowide">{recentRecruit.class}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-glass p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">ORDEN DEL VELO ASTRAL</h2>
            <p className="text-center text-indigo-300/80 font-audiowide tracking-widest text-sm md:text-base uppercase">
              Formación del escuadrón (Min: 2 / Max: 8)
            </p>
          </div>
          
          <div className="space-y-8">
          {/* Add Member Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-space-800/50 p-6 rounded-xl border border-indigo-500/20 backdrop-blur-sm">
            <div className="space-y-2">
              <Label htmlFor="memberName" className="text-indigo-200 text-sm font-audiowide tracking-widest uppercase ml-1">
                Nombre del Héroe
              </Label>
              <Input
                id="memberName"
                name="memberName"
                autoComplete="off"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Ej. Kepler-9"
                onKeyPress={(e) => e.key === "Enter" && addTeamMember()}
                className="bg-space-900 border-indigo-500/40 text-indigo-100 placeholder:text-indigo-800/60 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classSelect" className="text-indigo-200 text-sm font-audiowide tracking-widest uppercase ml-1">
                Clase de Combate
              </Label>
              <select
                id="classSelect"
                name="classSelect"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2.5 h-10 border rounded-md bg-space-900 border-indigo-500/40 text-indigo-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400 font-rajdhani text-lg"
              >
                <option value="" className="bg-space-900 text-indigo-400/50">
                  -- Seleccionar Clase --
                </option>
                {rpgClasses.map((rpgClass) => (
                  <option key={rpgClass.id} value={rpgClass.id} className="bg-space-900 text-indigo-100">
                    {rpgClass.icon} {rpgClass.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={addTeamMember}
                disabled={!newMemberName.trim() || !selectedClass || teamMembers.length >= 8}
                className="w-full h-11 bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-[background-color,border-color,box-shadow,transform] font-audiowide tracking-wider"
              >
                <Plus className="w-5 h-5 mr-3" />
                RECLUTAR
              </Button>
            </div>
          </div>

          {/* Class Grid - EXTRA TALL CARDS TO PREVENT CROPPING */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rpgClasses.map((rpgClass, index) => (
              <motion.div
                key={rpgClass.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                <Button
                  variant="ghost"
                  className={`relative w-full min-h-[148px] h-auto p-0 flex items-start justify-start space-x-4 hover:scale-102 transition-[background-color,border-color,box-shadow,transform] duration-300 bg-space-900/60 border rounded-xl overflow-hidden whitespace-normal ${
                    selectedClass === rpgClass.id
                      ? "border-indigo-400 bg-indigo-900/30 shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                      : "border-indigo-500/20 hover:border-indigo-400/60 hover:bg-indigo-900/10"
                  }`}
                  onClick={() => setSelectedClass(rpgClass.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
                  
                  {/* Character Image - EXTRA TALL CONTAINER */}
                  <div className="relative w-28 h-32 ml-4 mt-4 rounded-lg overflow-hidden bg-space-900/90 border border-indigo-500/30 flex-shrink-0 z-10 shadow-inner group-hover:border-indigo-400/80 transition-colors">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-50 Mix-blend-overlay"></div>
                    {rpgClass.image ? (
                      <Image
                        src={rpgClass.image || "/placeholder.svg"}
                        alt={rpgClass.name}
                        fill
                        sizes="112px"
                        className="object-contain object-center p-1 opacity-95 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl drop-shadow-[0_0_8px_white]">{rpgClass.icon}</div>
                    )}
                  </div>

                  {/* Character Info - FLEXIBLE HEIGHT */}
                  <div className="flex-1 text-left pr-4 py-4 space-y-3 min-h-[120px] flex flex-col justify-center relative z-10">
                    <div className="font-bold text-lg text-indigo-100 leading-tight font-audiowide uppercase tracking-widest whitespace-normal break-words">
                      {rpgClass.name}
                    </div>
                    <div className="text-sm text-indigo-300/80 leading-relaxed break-words whitespace-normal hyphens-auto font-rajdhani">
                      {rpgClass.description}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedClass === rpgClass.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-indigo-200 font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400 bg-indigo-900/80"
                    >
                      ✓
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Current Team - WITH IMAGES FIXED */}
          {teamMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-space-800/40 rounded-2xl p-6 md:p-8 border border-indigo-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
              
              <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-8 text-indigo-100 text-center tracking-wide drop-shadow-md">
                ESCUADRÓN ACTUAL ({teamMembers.length}/8)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-space-900/80 rounded-xl border border-indigo-500/20 shadow-inner group min-h-[90px] hover:border-indigo-400/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 w-full">
                      {/* FIXED: Character Image Display */}
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-space-800 border border-indigo-500/40 flex-shrink-0">
                        <div className="absolute inset-0 bg-indigo-500/10 opacity-50 Mix-blend-overlay"></div>
                        {member.image ? (
                          <Image
                            src={member.image || "/placeholder.svg"}
                            alt={member.class}
                            fill
                            className="object-contain object-center p-1"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-indigo-200 drop-shadow-[0_0_8px_white]">
                            {member.icon}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="font-bold text-indigo-100 text-lg leading-tight truncate">{member.name}</div>
                        <div className="text-xs text-indigo-400/80 uppercase font-audiowide tracking-widest truncate">{member.class}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      aria-label="Eliminar miembro"
                      className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 ml-2 h-10 w-10 p-0 rounded-full bg-space-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Start Game Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="pt-6">
            <Button
              onClick={() => onStartGame(teamMembers)}
              disabled={!canStartGame}
              className="w-full text-base md:text-xl py-8 font-audiowide tracking-[0.2em] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 border border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:shadow-none transition-[background-color,border-color,box-shadow,transform] duration-500 uppercase rounded-xl"
            >
              {canStartGame
                ? `INICIAR CACERÍA [${teamMembers.length} HÉROES]`
                : "SE REQUIERE MÍNIMO 2 HÉROES"}
            </Button>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
