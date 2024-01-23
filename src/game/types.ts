
export const Difficulties =  {
  Easy: {
    min: 36,
    max: 40
  },
  Medium: {
    min: 40,
    max: 47
  },
  Hard: {
    min: 48,
    max:54
  },
  Expert: {
    min: 55,
    max: 59
  },
  Insane: {
    min: 60,
    max: 64
  }
} as const;
export type Difficulty = keyof typeof Difficulties

export type Game = {
  solution: number[][]
  puzzle: number[][]
  current: number[][]
  mistakes: number
  difficulty: Difficulty
}