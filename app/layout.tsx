import type React from "react"
import type { Metadata } from "next"
import { Cinzel, Rajdhani, Audiowide } from "next/font/google"
import "./globals.css"

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
})

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
})

const audiowide = Audiowide({
  variable: "--font-audiowide",
  weight: "400",
  subsets: ["latin"],
})

export const viewport = {
  themeColor: '#0a0a0f',
}

export const metadata: Metadata = {
  title: "Asalto Astral de Mecánica Celeste",
  description: "Juego educativo de mecánica celeste con flashcards RPG",
    generator: 'v0.app',

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" style={{colorScheme: "dark"}}>
      <body className={`${cinzel.variable} ${rajdhani.variable} ${audiowide.variable} font-rajdhani antialiased bg-space-900 text-space-100`}>{children}</body>
    </html>
  )
}

