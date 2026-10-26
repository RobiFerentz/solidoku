export const Difficulties = {
  Easy: {
    min: 36,
    max: 40,
  },
  Medium: {
    min: 40,
    max: 47,
  },
  Hard: {
    min: 48,
    max: 54,
  },
  Expert: {
    min: 48,
    max: 52,
  },
  Insane: {
    min: 53,
    max: 58,
  },
} as const;
export type Difficulty = keyof typeof Difficulties;

export type Game = {
  solution: number[][];
  puzzle: number[][];
  current: number[][];
  mistakes: number;
  difficulty: Difficulty;
};
