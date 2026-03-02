"use client"

import { useEffect, useRef } from "react"

interface StarLayer {
  x: number
  y: number
  radius: number
  alpha: number
  alphaMin: number
  alphaMax: number
  pulseOffset: number
  twinkleSpeed: number
  driftX: number
  driftY: number
}

interface Orbit {
  rx: number
  ry: number
  rotation: number
  stroke: string
  lineWidth: number
  dash: [number, number]
}

interface OrbitBody {
  orbitIndex: number
  phase: number
  speed: number
  radius: number
  color: string
  glow: string
  trail: { x: number; y: number }[]
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const getScene = (width: number, height: number) => {
      const minSide = Math.min(width, height)
      const orbitBase = minSide * 0.22

      const orbits: Orbit[] = [
        {
          rx: orbitBase,
          ry: orbitBase * 0.45,
          rotation: -Math.PI / 10,
          stroke: "rgba(120, 198, 255, 0.16)",
          lineWidth: 1,
          dash: [5, 9],
        },
        {
          rx: orbitBase * 1.45,
          ry: orbitBase * 0.68,
          rotation: Math.PI / 8,
          stroke: "rgba(168, 149, 255, 0.12)",
          lineWidth: 1.2,
          dash: [3, 8],
        },
        {
          rx: orbitBase * 2.05,
          ry: orbitBase * 0.86,
          rotation: -Math.PI / 7,
          stroke: "rgba(222, 187, 255, 0.09)",
          lineWidth: 0.9,
          dash: [7, 12],
        },
        {
          rx: orbitBase * 2.75,
          ry: orbitBase * 1.08,
          rotation: Math.PI / 5,
          stroke: "rgba(121, 207, 255, 0.07)",
          lineWidth: 1,
          dash: [2, 10],
        },
      ]

      const starCount = Math.min(240, Math.max(120, Math.floor((width * height) / 7500)))
      const stars: StarLayer[] = Array.from({ length: starCount }).map(() => {
        const alphaMin = Math.random() * 0.1 + 0.08
        const alphaMax = alphaMin + Math.random() * 0.24 + 0.14
        return {
        x: Math.random() * width,
        y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.25,
          alpha: Math.random() * (alphaMax - alphaMin) + alphaMin,
          alphaMin,
          alphaMax,
          pulseOffset: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.028 + 0.014,
          driftX: (Math.random() - 0.5) * 0.02,
          driftY: (Math.random() - 0.5) * 0.02,
        }
      })

      const bodies: OrbitBody[] = [
        { orbitIndex: 0, phase: Math.random() * Math.PI * 2, speed: 0.011, radius: 2.8, color: "rgba(129, 212, 255, 0.95)", glow: "rgba(129, 212, 255, 0.55)", trail: [] },
        { orbitIndex: 0, phase: Math.random() * Math.PI * 2, speed: -0.009, radius: 2.1, color: "rgba(210, 189, 255, 0.9)", glow: "rgba(210, 189, 255, 0.5)", trail: [] },
        { orbitIndex: 1, phase: Math.random() * Math.PI * 2, speed: 0.006, radius: 3.2, color: "rgba(250, 217, 159, 0.95)", glow: "rgba(250, 217, 159, 0.5)", trail: [] },
        { orbitIndex: 1, phase: Math.random() * Math.PI * 2, speed: -0.0055, radius: 2.4, color: "rgba(157, 210, 255, 0.9)", glow: "rgba(157, 210, 255, 0.45)", trail: [] },
        { orbitIndex: 2, phase: Math.random() * Math.PI * 2, speed: 0.0038, radius: 3.6, color: "rgba(252, 197, 216, 0.9)", glow: "rgba(252, 197, 216, 0.45)", trail: [] },
        { orbitIndex: 3, phase: Math.random() * Math.PI * 2, speed: -0.0029, radius: 4.2, color: "rgba(190, 228, 255, 0.9)", glow: "rgba(190, 228, 255, 0.4)", trail: [] },
      ]

      return { orbits, stars, bodies }
    }

    let { orbits, stars, bodies } = getScene(canvas.width, canvas.height)

    let animationFrameId: number
    let time = 0

    const rotatePoint = (x: number, y: number, angle: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
      }
    }

    const drawBodyTrail = (trail: { x: number; y: number }[], color: string) => {
      if (trail.length < 2) return

      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1]
        const curr = trail[i]
        const alpha = i / trail.length
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(curr.x, curr.y)
        ctx.strokeStyle = color.replace(/\d+(\.\d+)?\)/, `${(alpha * 0.35).toFixed(2)})`)
        ctx.lineWidth = alpha * 1.6
        ctx.stroke()
      }
    }

    // Animation function
    const animate = () => {
      time += 1

      ctx.fillStyle = "rgba(7, 11, 20, 0.34)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      stars.forEach((star) => {
        const pulse = (Math.sin(time * star.twinkleSpeed + star.pulseOffset) + 1) * 0.5
        star.alpha = star.alphaMin + pulse * (star.alphaMax - star.alphaMin)

        star.x += star.driftX
        star.y += star.driftY

        if (star.x < -2) star.x = canvas.width + 2
        if (star.x > canvas.width + 2) star.x = -2
        if (star.y < -2) star.y = canvas.height + 2
        if (star.y > canvas.height + 2) star.y = -2

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx.fill()
      })

      orbits.forEach((orbit) => {
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(orbit.rotation + Math.sin(time * 0.0006 + orbit.rx * 0.003) * 0.045)

        ctx.beginPath()
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = orbit.stroke
        ctx.lineWidth = orbit.lineWidth
        ctx.setLineDash(orbit.dash)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      })

      bodies.forEach((body) => {
        const orbit = orbits[body.orbitIndex]
        body.phase += body.speed

        const localX = Math.cos(body.phase) * orbit.rx
        const localY = Math.sin(body.phase) * orbit.ry
        const rotated = rotatePoint(localX, localY, orbit.rotation)
        const worldX = centerX + rotated.x
        const worldY = centerY + rotated.y

        body.trail.push({ x: worldX, y: worldY })
        if (body.trail.length > 15) {
          body.trail.shift()
        }

        drawBodyTrail(body.trail, body.glow)

        ctx.shadowBlur = 14
        ctx.shadowColor = body.glow
        ctx.beginPath()
        ctx.arc(worldX, worldY, body.radius, 0, Math.PI * 2)
        ctx.fillStyle = body.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      const cometPhase = time * 0.0045
      const cometX = (cometPhase * 420) % (canvas.width + 260) - 130
      const cometY = ((Math.sin(cometPhase * 0.7) + 1) * 0.22 + 0.08) * canvas.height

      ctx.beginPath()
      ctx.moveTo(cometX - 48, cometY + 16)
      ctx.lineTo(cometX, cometY)
      ctx.strokeStyle = "rgba(161, 228, 255, 0.18)"
      ctx.lineWidth = 1.6
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cometX, cometY, 2.2, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(220, 248, 255, 0.65)"
      ctx.fill()

      const centerVeil = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.min(canvas.width, canvas.height) * 0.08,
        centerX,
        centerY,
        Math.min(canvas.width, canvas.height) * 0.55,
      )
      centerVeil.addColorStop(0, "rgba(7, 11, 20, 0.42)")
      centerVeil.addColorStop(0.45, "rgba(7, 11, 20, 0.26)")
      centerVeil.addColorStop(1, "rgba(7, 11, 20, 0)")
      ctx.fillStyle = centerVeil
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      ;({ orbits, stars, bodies } = getScene(canvas.width, canvas.height))
      ctx.fillStyle = "#070b14"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    window.removeEventListener("resize", resizeCanvas)
    window.addEventListener("resize", handleResize)

    ctx.fillStyle = "#070b14"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{ pointerEvents: "none" }}
    />
  )
}
