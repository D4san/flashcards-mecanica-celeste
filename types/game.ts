export interface TeamMember {
  id: string
  name: string
  class: string
  icon: string
  image?: string
  hasAnswered: boolean
  answeredCorrectly: boolean
}

export interface GameState {
  currentCardIndex: number
  monsterHealth: number
  maxMonsterHealth: number
  teamMembers: TeamMember[]
  isFlipped: boolean
  gamePhase: "setup" | "playing" | "bonus" | "victory" | "gameOver"
  bonusScore: number
}

export interface RPGClass {
  id: string
  name: string
  icon: string
  image?: string
  description: string
}

export interface Flashcard {
  question: string
  answer: string
  nanswer?: string // Added property for the "fake" answer shown before trap reveal
  isTrap?: boolean
}
