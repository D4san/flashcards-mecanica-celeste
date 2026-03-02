"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { RotateCcw, Trophy, Star, Users, Target, Skull, AlertTriangle, Zap } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingParticles } from "@/components/floating-particles"
import { TimerRing } from "@/components/timer-ring"
import { TeamSetup } from "@/components/team-setup"
import { TeamPanel } from "@/components/team-panel"
import { BattleFormation } from "@/components/battle-formation"
import { SoundControl } from "@/components/sound-control"
import { LaTeXRenderer } from "@/components/latex-renderer"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import type { TeamMember, GameState, Flashcard } from "@/types/game"

const initialFlashcards: Flashcard[] = [
  {
    "question": "El telescopio JWST está en una órbita alrededor del Sol más lejos que la Tierra, pero mantiene un periodo orbital de un año (sincronizado con la Tierra) para asegurar la comunicación constante. Si la Tercera Ley de Kepler establece que el cuerpo más lejano debe tener un periodo mayor, conceptualice por qué la existencia de esta órbita tecnológicamente crucial demuestra que la teoría de los dos cuerpos es \"miserablemente fallida\" para estos sistemas.",
    "answer": "La Tercera Ley de Kepler (el teorema armónico) establece una relación directa entre el semieje mayor ($a$) y el periodo orbital, $n \\propto (\\mu/a^3)^{1/2}$. Si el JWST estuviera solo en interacción con el Sol (problema de dos cuerpos), su periodo sería mayor que el de la Tierra. El hecho de que mantenga el mismo periodo revela que la fuerza gravitacional del tercer cuerpo (la Tierra) es lo suficientemente significativa como para alterar las leyes del movimiento kepleriano. Esto obliga a utilizar una teoría nueva (el problema de tres cuerpos) para describir las reglas bajo las cuales ocurre esta sincronía."
  },
  {
    "question": "Si los sistemas dinámicos caóticos, como los que se encuentran en la atmósfera (el clima) o en las órbitas planetarias (como la posible expulsión de Mercurio en 700 millones de años), son gobernados por ecuaciones newtonianas deterministas, ¿por qué se afirma que el caos implica la imposibilidad de la predicción a largo plazo para los científicos?",
    "answer": "El caos se define como una extrema sensibilidad a las condiciones iniciales. Aunque las ecuaciones son deterministas, en la naturaleza es imposible medir las condiciones iniciales (posición y velocidad) con infinita precisión. Si un cambio mínimo (como un error de 10 cm/s en el quinto dígito decimal de una velocidad) provoca una evolución futura completamente distinta, el inevitable margen de error en la medición se amplifica exponencialmente. Por lo tanto, el problema de la impredictibilidad es natural, no numérico, ya que nuestro conocimiento inicial del sistema es intrínsecamente imperfecto.",
    "nanswer": "El caos implica que, a largo plazo, las leyes deterministas de Newton dejan de ser válidas debido a la complejidad del sistema. Cuando un sistema entra en régimen caótico, las ecuaciones diferenciales lineales se rompen y el comportamiento pasa a ser probabilístico, similar a la mecánica cuántica. Por eso es imposible predecir el clima: las leyes físicas cambian de deterministas a aleatorias cuando hay demasiadas variables.",
    "isTrap": true
  },
  {
    "question": "El formalismo newtoniano (vectorial) requiere la aplicación de $\\vec{F} = m\\vec{a}$. ¿Cuál es el principal obstáculo práctico y conceptual que enfrentan los ingenieros o físicos al aplicar este formalismo a sistemas mecánicos con restricciones (como barras, cables o superficies) que lleva a la necesidad de la Mecánica Analítica?",
    "answer": "El formalismo vectorial exige el conocimiento de todas las fuerzas que actúan sobre el sistema. El obstáculo principal son las fuerzas de ligadura o restricción (como las tensiones $\\vec{T}$, las reacciones $\\vec{N}$ o los esfuerzos internos), las cuales no tienen una fórmula explícita. En el enfoque de Newton, el cálculo o la eliminación algebraica de estas fuerzas indeterminadas hace que la resolución del problema sea complicada y no sistemática."
  },
  {
    "question": "La \"idea genial\" de D’Alembert y Lagrange para superar el obstáculo de las fuerzas de restricción se basa en el trabajo virtual ($\\vec{F} \\cdot \\delta\\vec{r}$). Explique por qué el desplazamiento virtual ($\\delta\\vec{r}$) debe ser compatible con las restricciones del sistema para que el formalismo logre su objetivo principal: deshacerse de las fuerzas \"malucas\" (de restricción).",
    "answer": "La compatibilidad es esencial porque, por definición, el trabajo realizado por una fuerza de restricción ideal (como una tensión en una cuerda inextensible) es cero si el desplazamiento virtual $\\delta\\vec{r}$ es perpendicular a la fuerza. Al imponer esta condición, se garantiza que las fuerzas de restricción, que son las más difíciles de modelar, desaparezcan automáticamente de la ecuación del principio de los trabajos virtuales, simplificando el problema.",
    "nanswer": "El desplazamiento virtual es una herramienta matemática que representa el movimiento real que experimenta el sistema en un intervalo de tiempo extremadamente pequeño ($dt \\to 0$). Al hacer el tiempo casi cero, las fuerzas de restricción no tienen tiempo suficiente para realizar trabajo significativo, y por eso podemos eliminarlas de las ecuaciones, simplificando el cálculo newtoniano mediante aproximaciones infinitesimales.",
    "isTrap": true
  },
  {
    "question": "El principio de D'Alembert original aplica a sistemas en equilibrio. Para adaptarlo a la dinámica (sistemas en movimiento), Lagrange postuló el principio $\\sum (\\vec{F}_i^a - \\vec{\\dot{p}}_i) \\cdot \\delta\\vec{r}_i = 0$. ¿Qué justificación conceptual hay para incluir el término del momentum ($\\vec{\\dot{p}}$) con signo negativo, y cómo transforma esto el problema dinámico en uno de \"equilibrio\"?",
    "answer": "La justificación es que el principio se aplica desde el sistema de referencia de la partícula en movimiento (un sistema no inercial). Al hacer esto, aparecen las fuerzas ficticias (o resultantes), que son proporcionales a la inercia ($\\vec{F}_{\\text{inercia}} = -\\vec{\\dot{p}}$). Al incluir estas fuerzas junto a las fuerzas aplicadas ($\\vec{F}^a$), la sumatoria total se comporta como si el sistema estuviera en equilibrio en ese marco de referencia en movimiento."
  },
  {
    "question": "Considere un péndulo simple que se mueve en el espacio tridimensional (3 coordenadas: $x, y, z$). Explique por qué, a pesar de tener 3 coordenadas, el sistema se describe completamente con solo $M=1$ grado de libertad. ¿Qué papel fundamental juegan las restricciones holónomas en la definición de estos grados de libertad?",
    "answer": "Los grados de libertad ($M$) representan el número mínimo de variables independientes necesarias para especificar la posición del sistema. En este caso, la partícula tiene 3 coordenadas, pero hay dos restricciones holónomas (que se pueden escribir como ecuaciones de igualdad): 1) la longitud de la cuerda es fija ($x^2 + y^2 - L^2 = 0$), y 2) la partícula se restringe a moverse en un plano (por ejemplo, $z=0$). Las restricciones holónomas ($K$) reducen el número de coordenadas ($N$): $M = N - K$, resultando en $3 - 2 = 1$ grado de libertad."
  },
  {
    "question": "En un sistema con $M$ grados de libertad, se eligen $M$ variables generalizadas (${q_j}$). La condición crítica es que estas variables sean independientes. Si para un péndulo elástico (que tiene $M=2$ grados de libertad), usted elige el par (Energía Potencial Gravitatoria $V$, Ángulo $\\theta$), ¿por qué este conjunto es una mala elección de variables generalizadas?",
    "answer": "El conjunto es malo porque las variables no son independientes. La energía potencial gravitatoria $V$ es una función directa de la altura vertical ($y$) del cuerpo, y la altura $y$ depende del ángulo $\\theta$ (y de la elongación). Si usted varía virtualmente el ángulo $\\theta$, la altura $y$ (y por ende $V$) cambia forzosamente, violando la condición de independencia, donde al variar una, la otra debe poder permanecer constante."
  },
  {
    "question": "Se describe a la Mecánica Analítica (Lagrangiana) como un \"procedimiento\" o una \"receta\" para resolver problemas de mecánica, a diferencia del enfoque newtoniano. ¿Qué característica intrínseca de la formulación Lagrangiana permite que los problemas se resuelvan de manera tan sistemática?",
    "answer": "La naturaleza sistemática se debe a que la formulación reduce el problema a la manipulación de cantidades escalares (energía cinética $T$ y fuerzas generalizadas $Q_k$), en lugar de vectores de fuerza. La estructura final de las Ecuaciones de Lagrange proporciona un marco fijo para obtener las ecuaciones de movimiento, haciendo que el proceso sea casi automático: se calcula la función cinética ($T$), se halla la fuerza generalizada ($Q_k$), y se sustituye en la fórmula canónica."
  }
]

const processText = (text: string) => {
  try {
    let processedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    processedText = processedText.replace(/\*([^*]+)\*/g, "<em>$1</em>")
    processedText = processedText.replace(/`([^`]+)`/g, "<code>$1</code>")
    processedText = processedText.replace(/\n\n/g, "</p><p>")
    processedText = processedText.replace(/\n/g, "<br>")
    return processedText
  } catch (e) {
    console.error("Error processing text:", e)
    return text
  }
}

const renderContentWithLaTeX = (content: string) => {
  const processedMarkdown = processText(content)
  return <LaTeXRenderer content={processedMarkdown} />
}

const getIntroArcPosition = (index: number) => {
  const baseY = 88
  const spacing = 120

  if (index === 0) return { x: 72, y: baseY }
  if (index === 1) return { x: -72, y: baseY }

  const pairNumber = Math.floor(index / 2)
  const isRightSide = index % 2 === 0
  const direction = isRightSide ? 1 : -1
  const distance = 72 + pairNumber * spacing

  return { x: direction * distance, y: baseY }
}

export default function FlashcardApp() {
  const [gameState, setGameState] = useState<GameState>({
    currentCardIndex: 0,
    monsterHealth: 100,
    maxMonsterHealth: 100,
    teamMembers: [],
    isFlipped: false,
    gamePhase: "setup",
    bonusScore: 0,
  })

  const [previousHealth, setPreviousHealth] = useState<number | undefined>(undefined)
  const [flashcards, setFlashcards] = useState(initialFlashcards)
  const [timer, setTimer] = useState(5)
  const [canFlip, setCanFlip] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [processedCards, setProcessedCards] = useState<Flashcard[]>([])
  const [questionTimer, setQuestionTimer] = useState(120)
  const [timerActive, setTimerActive] = useState(false)
  const [trapStage, setTrapStage] = useState<"hidden" | "bait" | "reveal" | "resolved">("hidden")
  const [showEncounterIntro, setShowEncounterIntro] = useState(false)
  const [gameStats, setGameStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    totalDamage: 0,
    questionsCompleted: 0,
  })

  const {
    playSound,
    stopSound,
    stopAllSounds,
    playBackgroundMusic,
    stopBackgroundMusic,
    initializeAudio,
    masterVolume,
    setMasterVolume,
    isMuted,
    toggleMute,
  } = useSoundEffects()

  const calculateMaxHealth = (teamSize: number, totalQuestions: number) => {
    const requiredCorrectAnswers = Math.ceil(totalQuestions * 0.8 * teamSize)
    return requiredCorrectAnswers * 10
  }

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true)
        setProcessedCards(initialFlashcards)
        setFlashcards(initialFlashcards)
        setIsLoading(false)
      } catch (error) {
        console.error("Error setting flashcards:", error)
        setIsLoading(false)
      }
    }

    fetchFlashcards()
  }, [])

  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudio()
      playBackgroundMusic()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      stopBackgroundMusic()
      stopAllSounds()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [initializeAudio, playBackgroundMusic, stopBackgroundMusic, stopAllSounds])

  useEffect(() => {
    if (timerActive && questionTimer > 0) {
      // Alerta sonora cuando quedan 10s o menos
      if (questionTimer <= 10 && !gameState.isFlipped) {
        playSound("timerWarning")
      }
      const interval = setInterval(() => {
        setQuestionTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (questionTimer === 0 && timerActive) {
      if (!gameState.isFlipped) {
        setGameState((prev) => ({ ...prev, isFlipped: true }))
        setShowEvaluation(true)
        setTimerActive(false)
        playSound("wrongAnswer")
      }
    }
  }, [timerActive, questionTimer, gameState.isFlipped, playSound])

  // Removed unused useEffect for trap reveal, now handled by handleTrapReveal and main render logic
  // useEffect(() => {
  //   const currentCard = processedCards[gameState.currentCardIndex]
  //   if (showEvaluation && currentCard?.isTrap) {
  //     setShowTrapReveal(false)
  //     setShowTrapRealAnswer(false) // Initially show nanswer

  //     // Phase 1: Show "IT'S A TRAP" overlay after a delay
  //     const trapAlertTimer = setTimeout(() => {
  //       setShowTrapReveal(true)
  //       playSound("wrongAnswer") // Or a specific trap sound
  //     }, 1500)

  //     // Phase 2: Reveal real answer
  //     const realAnswerTimer = setTimeout(() => {
  //       setShowTrapRealAnswer(true)
  //       playSound("correctAnswer") // Reveal sound
  //     }, 4500)

  //     return () => {
  //       clearTimeout(trapAlertTimer)
  //       clearTimeout(realAnswerTimer)
  //     }
  //   } else {
  //     setShowTrapReveal(false)
  //     setShowTrapRealAnswer(false)
  //   }
  // }, [showEvaluation, gameState.currentCardIndex, processedCards, playSound])

  const startGame = (team: TeamMember[]) => {
    playBackgroundMusic()
    playSound("gameStart")

    const maxHealth = calculateMaxHealth(team.length, flashcards.length)
    setGameState({
      currentCardIndex: 0,
      monsterHealth: maxHealth,
      maxMonsterHealth: maxHealth,
      teamMembers: team.map((member) => ({
        ...member,
        hasAnswered: false,
        answeredCorrectly: false,
      })),
      isFlipped: false,
      gamePhase: "playing",
      bonusScore: 0,
    })
    setPreviousHealth(maxHealth)
    setGameStats({
      totalQuestions: flashcards.length,
      correctAnswers: 0,
      totalDamage: 0,
      questionsCompleted: 0,
    })
    setShowQuestion(false)
    setShowEvaluation(false)
    setTimerActive(false)
    setShowEncounterIntro(true)

    setTimeout(() => {
      setShowEncounterIntro(false)
      resetCard()
    }, 3200)
  }

  const resetCard = () => {
    setGameState((prev) => ({
      ...prev,
      isFlipped: false,
      teamMembers: prev.teamMembers.map((member) => ({
        ...member,
        hasAnswered: false,
        answeredCorrectly: false,
      })),
    }))
    setShowQuestion(true)
    setShowEvaluation(false)
    setCanFlip(false)
    setTimer(5)
    setQuestionTimer(120)
    setTimerActive(true)
    setTrapStage("hidden") // Reset trap stage

    setTimeout(() => {
      startAnswerTimer()
    }, 1000)
  }

  const startAnswerTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval)
          setCanFlip(true)
        }
        return prevTimer > 0 ? prevTimer - 1 : 0
      })
    }, 1000)
  }

  const handleFlip = () => {
    if (canFlip) {
      const newFlippedState = !gameState.isFlipped
      setGameState((prev) => ({ ...prev, isFlipped: newFlippedState }))
      setShowEvaluation(newFlippedState)
      playSound("cardFlip")

      if (!gameState.isFlipped) {
        setTimerActive(false)
        const currentCard = processedCards[gameState.currentCardIndex]
        if (currentCard?.isTrap) {
          setTrapStage("bait")
        }
      }
    }
  }

  const handleMemberAnswer = (memberId: string, correct: boolean) => {
    if (correct) {
      playSound("correctAnswer")
    } else {
      playSound("wrongAnswer")
    }

    setGameState((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member) =>
        member.id === memberId ? { ...member, hasAnswered: true, answeredCorrectly: correct } : member,
      ),
    }))
  }

  const handleTrapReveal = () => {
    setTrapStage("reveal")
    playSound("trapReveal")

    // Invert answers: Those who thought they were right (agreed with bait) are wrong.
    // Those who marked wrong (disagreed with bait) are right.
    setGameState((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member) => ({
        ...member,
        answeredCorrectly: !member.answeredCorrectly,
      })),
    }))

    // After animation, show real answer and move to resolved
    setTimeout(() => {
      setTrapStage("resolved")
      playSound("correctAnswer")
    }, 2000)
  }

  const handleNextQuestion = () => {
    const currentCard = processedCards[gameState.currentCardIndex]
    const isTrapQuestion = currentCard?.isTrap === true

    if (isTrapQuestion && trapStage === "bait") {
      handleTrapReveal()
      return
    }

    let actualCorrectAnswers: TeamMember[]
    if (isTrapQuestion) {
      actualCorrectAnswers = gameState.teamMembers.filter((member) => member.hasAnswered && !member.answeredCorrectly)
      // Trap reveal is handled by effect now, but we keep this flag if needed
    } else {
      actualCorrectAnswers = gameState.teamMembers.filter((member) => member.answeredCorrectly)
    }

    const correctCount = actualCorrectAnswers.length
    const damage = correctCount * 12
    const newHealth = Math.max(0, gameState.monsterHealth - damage)

    if (damage === 0) {
      playSound("monsterHit")
    }

    setPreviousHealth(gameState.monsterHealth)

    setGameStats((prev) => ({
      ...prev,
      correctAnswers: prev.correctAnswers + correctCount,
      totalDamage: prev.totalDamage + damage,
      questionsCompleted: prev.questionsCompleted + 1,
    }))

    let bonusPoints = 0
    if (gameState.gamePhase === "bonus") {
      bonusPoints = correctCount * 20
      setGameState((prev) => ({ ...prev, bonusScore: prev.bonusScore + bonusPoints }))
    }

    if (correctCount > 0) {
      confetti({
        particleCount: correctCount * 15,
        spread: 70,
        origin: { y: 0.6 },
        colors: gameState.gamePhase === "bonus" ? ["#FFD700", "#FFA500", "#FF6347"] : undefined,
      })
    }

    setShowQuestion(false)
    setShowEvaluation(false)

    setGameState((prev) => ({ ...prev, monsterHealth: newHealth }))

    const isLastQuestion = gameState.currentCardIndex >= flashcards.length - 1

    // const damageAnimationDelay = 3500 // This was commented out in the original update, so I'm removing it.
    // const trapDelay = isTrapQuestion ? 2000 : 0 // This was commented out in the original update, so I'm removing it.
    // const totalDelay = damageAnimationDelay + trapDelay // This was commented out in the original update, so I'm removing it.

    if (newHealth <= 0 && gameState.gamePhase !== "bonus") {
      setGameState((prev) => ({ ...prev, gamePhase: "bonus" }))
      startCoinCelebration()

      if (isLastQuestion) {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, gamePhase: "victory" }))
          playSound("victory")
          startVictoryCelebration()
        }, 3500) // Simplificado delay
        return
      } else {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, currentCardIndex: prev.currentCardIndex + 1 }))
          resetCard()
        }, 3500)
        return
      }
    }

    if (isLastQuestion) {
      if (gameState.gamePhase === "bonus" || newHealth <= 0) {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, gamePhase: "victory" }))
          playSound("victory")
          startVictoryCelebration()
        }, 3500)
        return
      } else {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, gamePhase: "gameOver" }))
          playSound("monsterDeath")
        }, 3500)
        return
      }
    }

    setTimeout(() => {
      setGameState((prev) => ({ ...prev, currentCardIndex: prev.currentCardIndex + 1 }))
      resetCard()
    }, 1500) // Reduced delay for normal questions
  }

  const startVictoryCelebration = () => {
    const duration = 8 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }
      const particleCount = 100 * (timeLeft / duration)
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ["#FFD700", "#FFA500", "#FFFF00", "#DAA520", "#B8860B"],
        }),
      )
    }, 150)
  }

  const startCoinCelebration = () => {
    const duration = 4 * 1000
    const animationEnd = Date.now() + duration

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      confetti({
        particleCount: 15,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() * 0.3 + 0.1 },
        colors: ["#FFD700", "#FFA500", "#FFFF00", "#DAA520", "#B8860B"],
        shapes: ["circle"],
        scalar: 1.2,
        gravity: 0.8,
        drift: Math.random() * 2 - 1,
        ticks: 200,
      })
    }, 300)
  }

  const restartGame = () => {
    setGameState({
      currentCardIndex: 0,
      monsterHealth: 100,
      maxMonsterHealth: 100,
      teamMembers: [],
      isFlipped: false,
      gamePhase: "setup",
      bonusScore: 0,
    })
    setPreviousHealth(undefined)
    setTrapStage("hidden") // Ensure trap stage is reset
    setShowEncounterIntro(false)
    setShowQuestion(false)
    setShowEvaluation(false)
    setGameStats({
      totalQuestions: 0,
      correctAnswers: 0,
      totalDamage: 0,
      questionsCompleted: 0,
    })
  }

  const allMembersAnswered = gameState.teamMembers.every((member) => member.hasAnswered)
  const currentCard = processedCards[gameState.currentCardIndex]
  const isTrapQuestion = currentCard?.isTrap === true

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
        <AnimatedBackground />
        <FloatingParticles />
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-8">Invocando criatura astral…</h1>
      </div>
    )
  }

  if (gameState.gamePhase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
        <AnimatedBackground />
        <FloatingParticles />
        <SoundControl
          toggleMute={toggleMute}
          isMuted={isMuted}
          initializeAudio={initializeAudio}
          masterVolume={masterVolume}
          setMasterVolume={setMasterVolume}
        />
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-8 text-center">Cacería Astral de Mecánica Celeste</h1>
        <TeamSetup onStartGame={startGame} />
      </div>
    )
  }

  if (gameState.gamePhase === "gameOver") {
    const accuracy =
      gameStats.totalQuestions > 0
        ? Math.round((gameStats.correctAnswers / (gameStats.totalQuestions * gameState.teamMembers.length)) * 100)
        : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#20080f] via-[#120b1d] to-black flex flex-col items-center justify-center p-4">
        <AnimatedBackground />
        <FloatingParticles />
        <SoundControl
          toggleMute={toggleMute}
          isMuted={isMuted}
          initializeAudio={initializeAudio}
          masterVolume={masterVolume}
          setMasterVolume={setMasterVolume}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-red-950/25 backdrop-blur-xl rounded-2xl p-4 sm:p-8 max-w-4xl w-full text-center border border-red-400/30 shadow-[0_0_60px_rgba(239,68,68,0.16)] relative overflow-hidden"
        >
          <div className="absolute -top-20 -left-10 w-44 h-44 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-8 w-48 h-48 rounded-full bg-orange-500/15 blur-3xl" />

          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-6 relative z-10"
          >
            <Skull className="w-16 h-16 sm:w-24 sm:h-24 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-5xl font-bold text-red-400 mb-2">¡DERROTA!</h1>
            <p className="text-lg sm:text-2xl text-red-200">La criatura astral resistió el asalto</p>
            <p className="text-sm sm:text-base text-red-300/80 mt-2">La bitácora queda registrada para la siguiente expedición.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mb-8 relative z-10"
          >
            <div className="relative">
              <BattleFormation
                teamMembers={gameState.teamMembers}
                monsterHealth={gameState.monsterHealth}
                maxMonsterHealth={gameState.maxMonsterHealth}
                isDead={false}
                isInBonusMode={false}
                previousHealth={previousHealth}
                playSound={playSound}
                stopSound={stopSound}
              />
              <motion.div
                className="absolute inset-0 bg-red-500 rounded-full opacity-20 blur-2xl"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </div>
            <p className="text-base sm:text-xl text-red-300 mt-4">
              La bestia conserva <span className="font-bold text-red-400">{gameState.monsterHealth} HP</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 relative z-10"
          >
            <div className="bg-red-900/35 rounded-lg p-3 sm:p-4 border border-red-400/25">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Resultado</h3>
              <p className="text-lg sm:text-2xl font-bold text-red-300">Derrota</p>
            </div>

            <div className="bg-red-900/35 rounded-lg p-3 sm:p-4 border border-red-400/25">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Precisión</h3>
              <p className="text-lg sm:text-2xl font-bold text-orange-300">{accuracy}%</p>
            </div>

            <div className="bg-red-900/35 rounded-lg p-3 sm:p-4 border border-red-400/25">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Equipo</h3>
              <p className="text-lg sm:text-2xl font-bold text-yellow-300">{gameState.teamMembers.length}</p>
            </div>

            <div className="bg-red-900/35 rounded-lg p-3 sm:p-4 border border-red-400/25">
              <Skull className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">HP Restante</h3>
              <p className="text-lg sm:text-2xl font-bold text-red-300">{gameState.monsterHealth}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="space-y-4 relative z-10"
          >
            <p className="text-base sm:text-xl text-gray-300">La horda astral sigue acechando… pero ya conocen sus patrones.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={restartGame}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 sm:px-8 py-3 shadow-[0_0_18px_rgba(239,68,68,0.35)]"
              >
                🔄 Intentar de Nuevo
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (gameState.gamePhase === "victory") {
    const accuracy =
      gameStats.totalQuestions > 0
        ? Math.round((gameStats.correctAnswers / (gameStats.totalQuestions * gameState.teamMembers.length)) * 100)
        : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#110b28] via-[#111f47] to-[#1a1455] flex flex-col items-center justify-center p-4">
        <AnimatedBackground />
        <FloatingParticles />
        <SoundControl
          toggleMute={toggleMute}
          isMuted={isMuted}
          initializeAudio={initializeAudio}
          masterVolume={masterVolume}
          setMasterVolume={setMasterVolume}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-indigo-950/25 backdrop-blur-xl rounded-2xl p-4 sm:p-8 max-w-4xl w-full text-center border border-indigo-300/25 shadow-[0_0_70px_rgba(99,102,241,0.22)] relative overflow-hidden"
        >
          <div className="absolute -top-20 left-10 w-52 h-52 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -bottom-24 right-6 w-56 h-56 rounded-full bg-violet-400/20 blur-3xl" />

          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-6 relative z-10"
          >
            <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">¡VICTORIA ÉPICA!</h1>
            <p className="text-lg sm:text-2xl text-yellow-300">¡Criatura astral neutralizada!</p>
            <p className="text-sm sm:text-base text-indigo-200/80 mt-2">La expedición cierra con dominio orbital total.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 relative z-10"
          >
            <div className="bg-indigo-900/35 rounded-lg p-3 sm:p-4 border border-indigo-300/25">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Equipo</h3>
              <p className="text-lg sm:text-2xl font-bold text-blue-300">{gameState.teamMembers.length}</p>
            </div>

            <div className="bg-indigo-900/35 rounded-lg p-3 sm:p-4 border border-indigo-300/25">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Precisión</h3>
              <p className="text-lg sm:text-2xl font-bold text-green-300">{accuracy}%</p>
            </div>

            <div className="bg-indigo-900/35 rounded-lg p-3 sm:p-4 border border-indigo-300/25">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Furia</h3>
              <p className="text-lg sm:text-2xl font-bold text-yellow-300">{gameState.bonusScore}</p>
            </div>

            <div className="bg-indigo-900/35 rounded-lg p-3 sm:p-4 border border-indigo-300/25">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm sm:text-lg font-semibold text-white">Daño</h3>
              <p className="text-lg sm:text-2xl font-bold text-purple-300">{gameStats.totalDamage}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="space-y-4 relative z-10"
          >
            <p className="text-base sm:text-xl text-gray-200">La amenaza astral fue contenida por el escuadrón.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={restartGame}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 shadow-[0_0_20px_rgba(99,102,241,0.45)]"
              >
                🔄 Nueva Cacería
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Updated styling for the root container
  return (
    <div className="min-h-screen bg-transparent overflow-hidden relative text-space-100 selection:bg-purple-500/30">
      <AnimatedBackground />
      <FloatingParticles />
      <SoundControl
        toggleMute={toggleMute}
        isMuted={isMuted}
        initializeAudio={initializeAudio}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
      />

      {/* FONDO PERMANENTE: Battle Formation siempre visible */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-full max-w-7xl transition-opacity duration-500 ${showEncounterIntro ? "opacity-0" : "opacity-100"}`}>
          {/* Progress Indicator - MOVIDO A LA IZQUIERDA SUPERIOR */}
          <div className="absolute top-4 left-4 z-10 text-space-100">
            <div className="text-sm md:text-base card-glass px-5 py-2.5 rounded-xl border border-indigo-500/30 font-audiowide flex items-center gap-3">
              <span className="text-indigo-400">FASE</span>
              <span className="text-xl text-white">{gameState.currentCardIndex + 1}</span> 
              <span className="text-indigo-500/50">/</span>
              <span className="text-indigo-300">{flashcards.length}</span>
              {gameState.gamePhase === "bonus" && <span className="text-yellow-400 ml-2 animate-pulse flex items-center"><Star className="w-4 h-4 mr-1"/> FURIA</span>}
              {/* Updated Progress Indicator to hide Trap label until reveal */}
              {isTrapQuestion && (trapStage === "reveal" || trapStage === "resolved") && (
                <span className="text-red-500 ml-2 font-bold animate-pulse tracking-widest text-shadow-red"><AlertTriangle className="w-4 h-4 inline mr-1" /> TRAMPA</span>
              )}
            </div>
          </div>

          {/* Battle Formation de fondo */}
          <BattleFormation
            teamMembers={gameState.teamMembers}
            monsterHealth={gameState.monsterHealth}
            maxMonsterHealth={gameState.maxMonsterHealth}
            isDead={gameState.monsterHealth <= 0}
            isInBonusMode={gameState.gamePhase === "bonus"}
            previousHealth={previousHealth}
            playSound={playSound}
            stopSound={stopSound}
          />
        </div>
      </div>

      {/* OVERLAYS AL FRENTE */}
      <AnimatePresence>
        {showEncounterIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/35 via-space-900/20 to-space-900/50" />

            <motion.div
              className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 1.6, y: 20, filter: "blur(10px)" }}
              animate={{
                opacity: [0, 1, 1, 1],
                scale: [1.6, 1.6, 1.35, 1],
                y: [20, 0, 0, 0],
                filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(0px)"],
              }}
              transition={{ duration: 1.8, times: [0, 0.2, 0.62, 1], ease: "easeOut" }}
            >
              <div className="relative w-64 h-80 sm:w-96 sm:h-[28rem]">
                <Image src="/boss.png" alt="Bestia Astral" fill className="object-contain drop-shadow-[0_0_30px_rgba(129,140,248,0.4)]" priority />
              </div>
            </motion.div>

            {gameState.teamMembers.map((member, index) => {
              const pos = getIntroArcPosition(index)
              const isRight = pos.x > 0

              return (
                <motion.div
                  key={`intro-${member.id}`}
                  className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, x: isRight ? 90 : -90, y: 90, scale: 1.75, filter: "blur(8px)" }}
                  animate={{
                    opacity: [0, 1, 1],
                    x: [isRight ? 90 : -90, 0, pos.x],
                    y: [90, -8, pos.y],
                    scale: [1.75, 1.2, 1],
                    filter: ["blur(8px)", "blur(0px)", "blur(0px)"],
                  }}
                  transition={{ delay: 1.15 + index * 0.22, duration: 1.05, times: [0, 0.38, 1], ease: "easeOut" }}
                >
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32">
                    {member.image ? (
                      <Image src={member.image || "/placeholder.svg"} alt={member.class} fill className="object-contain drop-shadow-[0_0_18px_rgba(224,231,255,0.35)]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl text-white">{member.icon}</div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: [0, 0, 1], y: [16, 16, 0] }}
              transition={{ duration: 1.5, delay: 2.0, times: [0, 0.65, 1], ease: "easeOut" }}
              className="absolute inset-x-4 top-[13vh] sm:top-[15vh] mx-auto max-w-2xl"
            >
              <div className="text-center rounded-2xl border border-indigo-400/35 bg-indigo-950/45 backdrop-blur-xl px-5 py-4 sm:px-8 sm:py-6 shadow-[0_0_60px_rgba(99,102,241,0.32)]">
                <p className="font-audiowide text-indigo-300 text-xs sm:text-sm tracking-[0.25em] uppercase">Encuentro Primordial</p>
                <h2 className="mt-2 font-cinzel text-2xl sm:text-4xl text-white font-bold">Comienza la Cacería Astral</h2>
              </div>
            </motion.div>
          </motion.div>
        )}

        {trapStage === "reveal" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-red-950/80 backdrop-blur-md text-red-500 px-12 py-8 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] border border-red-500/50 transform rotate-[-3deg] relative overflow-hidden flex flex-col items-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 Mix-blend-overlay"></div>
              <AlertTriangle className="w-16 h-16 mb-4 animate-pulse text-red-500" />
              <h2 className="text-7xl font-cinzel font-black uppercase tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] text-shadow-red relative z-10">
                ¡EMBOSCADA!
              </h2>
              <div className="mt-2 text-red-400/80 font-audiowide tracking-widest text-lg">EMBRUJO DETECTADO</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-6">
          {/* Timer Ring - Posición fija cuando está activo */}
          {timerActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              className="fixed top-6 right-6 z-50 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            >
              <TimerRing duration={120} timeLeft={questionTimer} size={60} />
            </motion.div>
          )}

          {/* Trap Reveal Banner */}
          <AnimatePresence>
            {isTrapQuestion && trapStage === "resolved" && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="mb-6 z-30 relative"
              >
                <div className="bg-space-900/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-500/40 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
                  <div className="flex items-center justify-center gap-4 relative z-10">
                    <Zap className="w-8 h-8 text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-red-100 tracking-wide drop-shadow-md">TRAMPA DESACTIVADA</h3>
                      <p className="text-sm sm:text-base font-rajdhani text-red-300/80 mt-1">
                        {gameState.teamMembers.filter((m) => m.answeredCorrectly).length > 0
                          ? "La escuadra leyó la emboscada"
                          : "La emboscada rompió la formación..."}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question/Answer Card - Emergente */}
          <AnimatePresence mode="wait">
            {showQuestion && (
              <motion.div
                key="flashcard"
                initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50, rotateX: -10 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                className="card-glass rounded-2xl p-8 cursor-pointer border hover:border-indigo-400/50 transition-colors duration-300 relative group"
                onClick={handleFlip}
              >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/50 rounded-tl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500/50 rounded-tr-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500/50 rounded-bl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/50 rounded-br-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="min-h-[220px] max-h-[450px] flex items-center justify-center overflow-auto custom-scrollbar relative z-10 px-4">
                  <AnimatePresence mode="wait">
                    {!gameState.isFlipped ? (
                      <motion.div
                        key="question"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.4 }}
                        className="text-base sm:text-xl text-center font-medium w-full"
                      >
                        <div className="latex-content mb-8">
                          {renderContentWithLaTeX(currentCard?.question || "No hay pregunta disponible")}
                        </div>
                        <div className="mt-8 flex flex-col items-center">
                          {canFlip ? (
                            <div className="text-sm font-audiowide text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 px-6 py-2.5 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                              [ INICIAR ASALTO ]
                            </div>
                          ) : (
                            <div className="text-3xl font-audiowide text-indigo-400 bg-indigo-950/60 border-2 border-indigo-500/40 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                              {timer}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="answer"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.4 }}
                        className="text-sm sm:text-lg text-center w-full"
                      >
                        <div className="latex-content">
                          {renderContentWithLaTeX(
                            isTrapQuestion && trapStage === "bait"
                              ? currentCard?.nanswer || currentCard?.answer
                              : currentCard?.answer || "No hay respuesta disponible",
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Team Evaluation Panel - Solo visible cuando showEvaluation es true */}
          <AnimatePresence>
            {showEvaluation && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                <div className="relative">
                  <TeamPanel
                    teamMembers={gameState.teamMembers}
                    onMemberAnswer={handleMemberAnswer}
                    onContinue={handleNextQuestion}
                    allAnswered={allMembersAnswered}
                    isFlipped={gameState.isFlipped}
                    isInBonusMode={gameState.gamePhase === "bonus"}
                    buttonText={isTrapQuestion && trapStage === "bait" ? "⚠️ ROMPER EMBRUJO ⚠️" : undefined}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back Button */}
          {gameState.isFlipped && !allMembersAnswered && showEvaluation && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
              <Button
                onClick={handleFlip}
                variant="outline"
                size="lg"
                className="bg-space-900/80 backdrop-blur-md hover:bg-indigo-900/40 text-indigo-300 border-indigo-500/50 font-audiowide tracking-wider hover:text-indigo-200 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]"
              >
                <RotateCcw className="h-4 w-4 mr-3" />
                REPLANTEAR ESTRATEGIA
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
