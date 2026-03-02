"use client"

import { useRef, useEffect, useState, useCallback } from "react"

// ─── Volume config ───────────────────────────────────────────────────────────

const VOLUMES = {
  master: 0.5,
  music: 0.07,   // Música de fondo muy suave — no estorba
  sfx: 0.22,     // Efectos de juego moderados
} as const

const MUSIC_TRACK_PATHS = [
  "/music/Nebula_Bloom.mp3",
  "/Nebula_Bloom.mp3",
]

// ─── Cooldowns para evitar spam de sonidos ───────────────────────────────────

const COOLDOWNS: Record<string, number> = {
  bossDamage: 450,
  correctAnswer: 200,
  wrongAnswer: 200,
  monsterHit: 500,
  monsterDeath: 2000,
  bonusMode: 2000,
  cardFlip: 100,
  victory: 3000,
  trapReveal: 1000,
  timerWarning: 800,
  gameStart: 1000,
}

// ─── Hook principal ──────────────────────────────────────────────────────────

export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [masterVolume, setMasterVolumeState] = useState<number>(VOLUMES.master)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const musicGainRef = useRef<GainNode | null>(null)
  const sfxGainRef = useRef<GainNode | null>(null)
  const musicElementRef = useRef<HTMLAudioElement | null>(null)
  const musicElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Ambient music state
  const musicNodesRef = useRef<{
    oscillators: OscillatorNode[]
    gains: GainNode[]
    lfos: OscillatorNode[]
    filters: BiquadFilterNode[]
    noiseSource: AudioBufferSourceNode | null
    isPlaying: boolean
  }>({ oscillators: [], gains: [], lfos: [], filters: [], noiseSource: null, isPlaying: false })

  const lastPlayTimeRef = useRef<Map<string, number>>(new Map())
  const activeTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const isMutedRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // ─── Audio initialization ──────────────────────────────────────────────────

  const initializeAudio = useCallback(() => {
    if (audioCtxRef.current || typeof window === "undefined") return

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioCtxRef.current = ctx

      // Master → destination
      const master = ctx.createGain()
      master.gain.value = VOLUMES.master
      master.connect(ctx.destination)
      masterGainRef.current = master

      // Music bus → master
      const musicBus = ctx.createGain()
      musicBus.gain.value = VOLUMES.music
      musicBus.connect(master)
      musicGainRef.current = musicBus

      // SFX bus → master
      const sfxBus = ctx.createGain()
      sfxBus.gain.value = VOLUMES.sfx
      sfxBus.connect(master)
      sfxGainRef.current = sfxBus

      setAudioInitialized(true)
      setIsLoaded(true)
    } catch (error) {
      console.error("Error initializing audio:", error)
    }
  }, [])

  // ─── Utility: safe timeout with auto-cleanup ──────────────────────────────

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      activeTimeoutsRef.current.delete(id)
      fn()
    }, ms)
    activeTimeoutsRef.current.add(id)
    return id
  }, [])

  // ─── Utility: check cooldown ───────────────────────────────────────────────

  const canPlay = useCallback((key: string): boolean => {
    const now = Date.now()
    const last = lastPlayTimeRef.current.get(key) || 0
    const cd = COOLDOWNS[key] || 0
    if (now - last < cd) return false
    lastPlayTimeRef.current.set(key, now)
    return true
  }, [])

  // ─── Utility: white noise buffer ──────────────────────────────────────────

  const createNoiseBuffer = useCallback((seconds: number): AudioBuffer | null => {
    const ctx = audioCtxRef.current
    if (!ctx) return null
    const length = ctx.sampleRate * seconds
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }
    return buffer
  }, [])

  const connectMusicElementToBus = useCallback((audioEl: HTMLAudioElement) => {
    const ctx = audioCtxRef.current
    const musicBus = musicGainRef.current
    if (!ctx || !musicBus) return false

    try {
      if (!musicElementSourceRef.current) {
        musicElementSourceRef.current = ctx.createMediaElementSource(audioEl)
        musicElementSourceRef.current.connect(musicBus)
      }
      return true
    } catch (error) {
      console.error("Error connecting music element:", error)
      return false
    }
  }, [])

  const tryStartMusicTrack = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false
    const ctx = audioCtxRef.current
    if (!ctx || isMutedRef.current) return false

    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {})
    }

    if (musicElementRef.current) {
      const connected = connectMusicElementToBus(musicElementRef.current)
      if (!connected) return false
      const playResult = musicElementRef.current.play()
      if (playResult) {
        await playResult.catch(() => {})
      }
      return !musicElementRef.current.paused
    }

    for (const src of MUSIC_TRACK_PATHS) {
      const audioEl = new Audio(src)
      audioEl.loop = true
      audioEl.preload = "auto"
      audioEl.volume = 1

      const connected = connectMusicElementToBus(audioEl)
      if (!connected) continue

      try {
        await audioEl.play()
        musicElementRef.current = audioEl
        return true
      } catch {
        if (musicElementSourceRef.current) {
          try {
            musicElementSourceRef.current.disconnect()
          } catch { /* ignore */ }
          musicElementSourceRef.current = null
        }
      }
    }

    return false
  }, [connectMusicElementToBus])

  // ═══════════════════════════════════════════════════════════════════════════
  //  AMBIENT MUSIC — generative cosmic drone (muy suave)
  // ═══════════════════════════════════════════════════════════════════════════

  const startAmbientMusic = useCallback(() => {
    const ctx = audioCtxRef.current
    const musicBus = musicGainRef.current
    if (!ctx || !musicBus || musicNodesRef.current.isPlaying || isMutedRef.current) return

    // Resume context if suspended
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    const t = ctx.currentTime
    const oscs: OscillatorNode[] = []
    const gains: GainNode[] = []
    const lfos: OscillatorNode[] = []
    const filters: BiquadFilterNode[] = []

    // ── Layer 1: Deep drone (fundamental + quinta) ──────────────────────────
    const droneFreqs = [55, 82.5, 110] // A1, E2, A2
    droneFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = "sine"
      osc.frequency.value = freq
      osc.detune.value = (i - 1) * 3 // Leve desafinación para calidez

      filter.type = "lowpass"
      filter.frequency.value = 200
      filter.Q.value = 0.7

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25 / droneFreqs.length, t + 5) // Fade in 5s

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(musicBus)
      osc.start(t)

      oscs.push(osc)
      gains.push(gain)
      filters.push(filter)
    })

    // ── Layer 2: Pad evolving (tonos pentatónicos) ─────────────────────────
    const padFreqs = [220, 261.6, 329.6, 392] // A3, C4, E4, G4
    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = "sine"
      osc.frequency.value = freq
      osc.detune.value = (Math.random() - 0.5) * 8

      filter.type = "lowpass"
      filter.frequency.value = 400
      filter.Q.value = 0.5

      // LFO para swell suave de volumen
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.type = "sine"
      lfo.frequency.value = 0.04 + i * 0.015 // Muy lento (~20-25s por ciclo)
      lfoGain.gain.value = 0.06

      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      lfo.start(t)
      lfos.push(lfo)

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.1 / padFreqs.length, t + 7) // Fade in 7s

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(musicBus)
      osc.start(t)

      oscs.push(osc)
      gains.push(gain)
      filters.push(filter)
    })

    // ── Layer 3: Filtered noise (polvo cósmico) ────────────────────────────
    let noiseSource: AudioBufferSourceNode | null = null
    const noiseBuf = createNoiseBuffer(10)
    if (noiseBuf) {
      noiseSource = ctx.createBufferSource()
      noiseSource.buffer = noiseBuf
      noiseSource.loop = true

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0, t)
      noiseGain.gain.linearRampToValueAtTime(0.035, t + 6)

      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = "bandpass"
      noiseFilter.frequency.value = 300
      noiseFilter.Q.value = 0.3

      // LFO lento para barrido del filtro
      const noiseLfo = ctx.createOscillator()
      const noiseLfoGain = ctx.createGain()
      noiseLfo.type = "sine"
      noiseLfo.frequency.value = 0.018 // Un ciclo cada ~55s
      noiseLfoGain.gain.value = 150
      noiseLfo.connect(noiseLfoGain)
      noiseLfoGain.connect(noiseFilter.frequency)
      noiseLfo.start(t)
      lfos.push(noiseLfo)

      noiseSource.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(musicBus)
      noiseSource.start(t)

      gains.push(noiseGain)
      filters.push(noiseFilter)
    }

    musicNodesRef.current = {
      oscillators: oscs,
      gains,
      lfos,
      filters,
      noiseSource,
      isPlaying: true,
    }
  }, [createNoiseBuffer])

  const stopAmbientMusic = useCallback(() => {
    const ctx = audioCtxRef.current
    const music = musicNodesRef.current
    if (!music.isPlaying) return

    if (ctx) {
      const t = ctx.currentTime
      // Fade out 2s
      music.gains.forEach((g) => {
        try {
          g.gain.cancelScheduledValues(t)
          g.gain.setValueAtTime(g.gain.value, t)
          g.gain.linearRampToValueAtTime(0, t + 2)
        } catch { /* ignore */ }
      })
    }

    // Stop everything after fade
    safeTimeout(() => {
      const m = musicNodesRef.current
      m.oscillators.forEach((o) => { try { o.stop(); o.disconnect() } catch { /* ignore */ } })
      m.lfos.forEach((l) => { try { l.stop(); l.disconnect() } catch { /* ignore */ } })
      m.gains.forEach((g) => { try { g.disconnect() } catch { /* ignore */ } })
      m.filters.forEach((f) => { try { f.disconnect() } catch { /* ignore */ } })
      if (m.noiseSource) { try { m.noiseSource.stop(); m.noiseSource.disconnect() } catch { /* ignore */ } }
      musicNodesRef.current = { oscillators: [], gains: [], lfos: [], filters: [], noiseSource: null, isPlaying: false }
    }, 2200)
  }, [safeTimeout])

  // ═══════════════════════════════════════════════════════════════════════════
  //  SOUND EFFECTS — mini-game oriented
  // ═══════════════════════════════════════════════════════════════════════════

  // Helper: schedule a note (osc → gain → sfxBus) with ADSR
  const scheduleNote = useCallback((
    freq: number,
    type: OscillatorType,
    startOffset: number,
    duration: number,
    volume: number,
    envelope?: { attack?: number; decay?: number; sustain?: number; release?: number },
    detune?: number,
  ) => {
    const ctx = audioCtxRef.current
    const sfxBus = sfxGainRef.current
    if (!ctx || !sfxBus) return

    const t = ctx.currentTime + startOffset
    const env = { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.15, ...envelope }

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.value = freq
    if (detune) osc.detune.value = detune

    // ADSR envelope
    const attackEnd = t + duration * env.attack
    const decayEnd = attackEnd + duration * env.decay
    const sustainEnd = t + duration - duration * env.release
    const releaseEnd = t + duration

    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, attackEnd)
    gain.gain.linearRampToValueAtTime(volume * env.sustain, decayEnd)
    gain.gain.setValueAtTime(volume * env.sustain, Math.max(sustainEnd, decayEnd))
    gain.gain.exponentialRampToValueAtTime(0.001, releaseEnd)

    osc.connect(gain)
    gain.connect(sfxBus)
    osc.start(t)
    osc.stop(releaseEnd + 0.05)
  }, [])

  // ── Correct Answer: ascending major triad sparkle ────────────────────────

  const playCorrectAnswer = useCallback(() => {
    // C5 → E5 → G5 — bright, quick, satisfying
    const notes = [
      { freq: 523, delay: 0, dur: 0.18 },
      { freq: 659, delay: 0.1, dur: 0.18 },
      { freq: 784, delay: 0.2, dur: 0.30 },
    ]
    notes.forEach((n) => {
      scheduleNote(n.freq, "sine", n.delay, n.dur, 0.35,
        { attack: 0.05, decay: 0.15, sustain: 0.6, release: 0.3 })
      // Capa armónica
      scheduleNote(n.freq * 2, "sine", n.delay + 0.01, n.dur * 0.7, 0.08,
        { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.4 })
    })
  }, [scheduleNote])

  // ── Wrong Answer: soft descending minor second ───────────────────────────

  const playWrongAnswer = useCallback(() => {
    // Eb4 → D4 — gentle, not punishing
    const notes = [
      { freq: 311, delay: 0, dur: 0.25 },
      { freq: 277, delay: 0.15, dur: 0.35 },
    ]
    notes.forEach((n) => {
      scheduleNote(n.freq, "triangle", n.delay, n.dur, 0.25,
        { attack: 0.03, decay: 0.15, sustain: 0.5, release: 0.35 })
    })
  }, [scheduleNote])

  // ── Boss Damage: sonido positivo de impacto exitoso ──────────────────────

  const playBossDamage = useCallback(() => {
    const notes = [
      { freq: 659, delay: 0, dur: 0.14 },
      { freq: 784, delay: 0.1, dur: 0.14 },
      { freq: 988, delay: 0.2, dur: 0.22 },
    ]

    notes.forEach((n) => {
      scheduleNote(n.freq, "sine", n.delay, n.dur, 0.32, {
        attack: 0.03,
        decay: 0.12,
        sustain: 0.6,
        release: 0.28,
      })
      scheduleNote(n.freq * 0.5, "triangle", n.delay, n.dur * 1.1, 0.08, {
        attack: 0.02,
        decay: 0.14,
        sustain: 0.4,
        release: 0.3,
      })
    })
  }, [scheduleNote])

  // ── Card Flip: quick swoosh ──────────────────────────────────────────────

  const playCardFlip = useCallback(() => {
    const ctx = audioCtxRef.current
    const sfxBus = sfxGainRef.current
    if (!ctx || !sfxBus) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(800, t)
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.12)

    gain.gain.setValueAtTime(0.15, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)

    osc.connect(gain)
    gain.connect(sfxBus)
    osc.start(t)
    osc.stop(t + 0.18)
  }, [])

  // ── Monster Hit: 3 impact pulses synchronized ────────────────────────────

  const playMonsterHit = useCallback(() => {
    const pulses = [
      { freq: 180, delay: 0, dur: 0.25, vol: 0.4 },
      { freq: 140, delay: 0.35, dur: 0.25, vol: 0.35 },
      { freq: 100, delay: 0.7, dur: 0.35, vol: 0.45 },
    ]
    pulses.forEach((p) => {
      // Impacto principal
      scheduleNote(p.freq, "sawtooth", p.delay, p.dur, p.vol,
        { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.4 })
      // Sub-bass
      scheduleNote(p.freq * 0.5, "sine", p.delay, p.dur * 1.2, p.vol * 0.5,
        { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.5 })
    })
  }, [scheduleNote])

  // ── Monster Death: dramatic descending rumble ────────────────────────────

  const playMonsterDeath = useCallback(() => {
    const ctx = audioCtxRef.current
    const sfxBus = sfxGainRef.current
    if (!ctx || !sfxBus) return

    const t = ctx.currentTime

    // Barrido descendente
    const sweep = ctx.createOscillator()
    const sweepGain = ctx.createGain()
    sweep.type = "sawtooth"
    sweep.frequency.setValueAtTime(400, t)
    sweep.frequency.exponentialRampToValueAtTime(40, t + 1.5)
    sweepGain.gain.setValueAtTime(0.3, t)
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8)
    sweep.connect(sweepGain)
    sweepGain.connect(sfxBus)
    sweep.start(t)
    sweep.stop(t + 2)

    // Rumble grave
    const rumble = ctx.createOscillator()
    const rumbleGain = ctx.createGain()
    rumble.type = "sine"
    rumble.frequency.value = 50
    rumbleGain.gain.setValueAtTime(0, t)
    rumbleGain.gain.linearRampToValueAtTime(0.35, t + 0.3)
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2)
    rumble.connect(rumbleGain)
    rumbleGain.connect(sfxBus)
    rumble.start(t)
    rumble.stop(t + 2.2)

    // Burst de ruido para impacto
    const noiseBuf = createNoiseBuffer(0.5)
    if (noiseBuf) {
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuf
      const noiseGain = ctx.createGain()
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = "lowpass"
      noiseFilter.frequency.value = 500
      noiseGain.gain.setValueAtTime(0.2, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(sfxBus)
      noise.start(t)
      noise.stop(t + 0.8)
    }
  }, [createNoiseBuffer])

  // ── Bonus Mode: triumphant ascending fanfare ─────────────────────────────

  const playBonusMode = useCallback(() => {
    // C5→E5→G5→C6→E6 — arpegio mayor, celebratorio
    const notes = [
      { freq: 523, delay: 0, dur: 0.3 },
      { freq: 659, delay: 0.2, dur: 0.3 },
      { freq: 784, delay: 0.4, dur: 0.3 },
      { freq: 1047, delay: 0.6, dur: 0.4 },
      { freq: 1319, delay: 0.85, dur: 0.6 },
    ]
    notes.forEach((n) => {
      scheduleNote(n.freq, "sine", n.delay, n.dur, 0.28,
        { attack: 0.03, decay: 0.1, sustain: 0.7, release: 0.3 })
      // Shimmer de octava
      scheduleNote(n.freq * 2, "sine", n.delay + 0.015, n.dur * 0.6, 0.06,
        { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 })
    })
  }, [scheduleNote])

  // ── Victory: épica celebración en capas ──────────────────────────────────

  const playVictory = useCallback(() => {
    // Acorde de C mayor
    const chord1 = [523, 659, 784, 1047]
    chord1.forEach((freq, i) => {
      scheduleNote(freq, "sine", i * 0.08, 1.2, 0.2,
        { attack: 0.05, decay: 0.15, sustain: 0.7, release: 0.3 })
    })

    // Segundo acorde: F mayor (resolución)
    const chord2 = [349, 440, 523, 698]
    chord2.forEach((freq, i) => {
      scheduleNote(freq, "sine", 1.0 + i * 0.08, 1.0, 0.18,
        { attack: 0.05, decay: 0.15, sustain: 0.7, release: 0.3 })
    })

    // Final: C mayor con octava
    const chord3 = [523, 659, 784, 1047, 1568]
    chord3.forEach((freq, i) => {
      scheduleNote(freq, "sine", 1.8 + i * 0.06, 1.8, 0.22,
        { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.3 })
      // Armónicos cálidos
      scheduleNote(freq * 0.5, "sine", 1.85 + i * 0.06, 1.5, 0.08,
        { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.4 })
    })
  }, [scheduleNote])

  // ── Trap Reveal: cromático descendente ominoso ───────────────────────────

  const playTrapReveal = useCallback(() => {
    // D5→C#5→C5→B4 — suspenseful
    const notes = [
      { freq: 587, delay: 0, dur: 0.2 },
      { freq: 554, delay: 0.15, dur: 0.2 },
      { freq: 523, delay: 0.3, dur: 0.2 },
      { freq: 494, delay: 0.45, dur: 0.4 },
    ]
    notes.forEach((n) => {
      scheduleNote(n.freq, "triangle", n.delay, n.dur, 0.25,
        { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.3 })
    })
    // Rumble bajo
    scheduleNote(100, "sine", 0, 0.8, 0.15,
      { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.4 })
  }, [scheduleNote])

  // ── Timer Warning: pulso urgente ─────────────────────────────────────────

  const playTimerWarning = useCallback(() => {
    scheduleNote(880, "sine", 0, 0.12, 0.2,
      { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 })
    scheduleNote(880, "sine", 0.18, 0.12, 0.2,
      { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 })
  }, [scheduleNote])

  // ── Game Start: chime de bienvenida ──────────────────────────────────────

  const playGameStart = useCallback(() => {
    const notes = [
      { freq: 392, delay: 0, dur: 0.25 },    // G4
      { freq: 523, delay: 0.2, dur: 0.25 },   // C5
      { freq: 659, delay: 0.4, dur: 0.35 },   // E5
    ]
    notes.forEach((n) => {
      scheduleNote(n.freq, "sine", n.delay, n.dur, 0.22,
        { attack: 0.03, decay: 0.1, sustain: 0.6, release: 0.35 })
    })
  }, [scheduleNote])

  // ═══════════════════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  const playBackgroundMusic = useCallback(() => {
    if (isMutedRef.current) return
    if (!audioCtxRef.current) initializeAudio()

    void (async () => {
      const usingTrack = await tryStartMusicTrack()
      if (!usingTrack) {
        startAmbientMusic()
      } else {
        stopAmbientMusic()
      }
    })()
  }, [initializeAudio, startAmbientMusic, stopAmbientMusic, tryStartMusicTrack])

  const stopBackgroundMusic = useCallback(() => {
    if (musicElementRef.current) {
      musicElementRef.current.pause()
      musicElementRef.current.currentTime = 0
    }
    stopAmbientMusic()
  }, [stopAmbientMusic])

  const playSound = useCallback((soundType: string) => {
    if (!audioCtxRef.current) initializeAudio()
    const ctx = audioCtxRef.current
    if (!ctx || isMutedRef.current) return

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    if (!canPlay(soundType)) return

    switch (soundType) {
      case "bossDamage":      playBossDamage(); break
      case "correctAnswer":   playCorrectAnswer(); break
      case "wrongAnswer":     playWrongAnswer(); break
      case "cardFlip":        playCardFlip(); break
      case "monsterHit":      playMonsterHit(); break
      case "monsterDeath":    playMonsterDeath(); break
      case "bonusMode":       playBonusMode(); break
      case "victory":         playVictory(); break
      case "trapReveal":      playTrapReveal(); break
      case "timerWarning":    playTimerWarning(); break
      case "gameStart":       playGameStart(); break
      case "backgroundMusic": playBackgroundMusic(); break
      default:
        console.warn(`Sonido desconocido: ${soundType}`)
    }
  }, [
    initializeAudio, canPlay, playBackgroundMusic,
    playBossDamage,
    playCorrectAnswer, playWrongAnswer, playCardFlip,
    playMonsterHit, playMonsterDeath, playBonusMode,
    playVictory, playTrapReveal, playTimerWarning, playGameStart,
  ])

  const stopAllSounds = useCallback(() => {
    if (musicElementRef.current) {
      musicElementRef.current.pause()
      musicElementRef.current.currentTime = 0
    }
    stopAmbientMusic()
  }, [stopAmbientMusic])

  const stopSound = useCallback((soundType: string) => {
    if (soundType === "backgroundMusic") {
      if (musicElementRef.current) {
        musicElementRef.current.pause()
        musicElementRef.current.currentTime = 0
      }
      stopAmbientMusic()
    }
  }, [stopAmbientMusic])

  const setMasterVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0, Math.min(1, nextVolume))
    setMasterVolumeState(clamped)

    if (masterGainRef.current && audioCtxRef.current) {
      const t = audioCtxRef.current.currentTime
      masterGainRef.current.gain.cancelScheduledValues(t)
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, t)
      masterGainRef.current.gain.linearRampToValueAtTime(clamped, t + 0.15)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioCtxRef.current) initializeAudio()

    const newMuted = !isMutedRef.current
    setIsMuted(newMuted)
    isMutedRef.current = newMuted

    if (masterGainRef.current && audioCtxRef.current) {
      const t = audioCtxRef.current.currentTime
      masterGainRef.current.gain.cancelScheduledValues(t)
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, t)
      masterGainRef.current.gain.linearRampToValueAtTime(newMuted ? 0 : masterVolume, t + 0.3)
    }

    if (newMuted) {
      if (musicElementRef.current) {
        musicElementRef.current.pause()
      }
      stopAmbientMusic()
    } else {
      playBackgroundMusic()
    }
  }, [initializeAudio, masterVolume, playBackgroundMusic, stopAmbientMusic])

  // ─── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // Stop music
      const m = musicNodesRef.current
      m.oscillators.forEach((o) => { try { o.stop(); o.disconnect() } catch { /* */ } })
      m.lfos.forEach((l) => { try { l.stop(); l.disconnect() } catch { /* */ } })
      m.gains.forEach((g) => { try { g.disconnect() } catch { /* */ } })
      m.filters.forEach((f) => { try { f.disconnect() } catch { /* */ } })
      if (m.noiseSource) { try { m.noiseSource.stop(); m.noiseSource.disconnect() } catch { /* */ } }
      musicNodesRef.current = { oscillators: [], gains: [], lfos: [], filters: [], noiseSource: null, isPlaying: false }

      if (musicElementRef.current) {
        musicElementRef.current.pause()
        musicElementRef.current.src = ""
        musicElementRef.current.load()
        musicElementRef.current = null
      }

      if (musicElementSourceRef.current) {
        try {
          musicElementSourceRef.current.disconnect()
        } catch { /* ignore */ }
        musicElementSourceRef.current = null
      }

      // Clear timeouts
      activeTimeoutsRef.current.forEach(clearTimeout)
      activeTimeoutsRef.current.clear()

      // Close audio context
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  return {
    playSound,
    stopSound,
    stopAllSounds,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleMute,
    setMasterVolume,
    masterVolume,
    isMuted,
    isLoaded,
    initializeAudio,
  }
}
