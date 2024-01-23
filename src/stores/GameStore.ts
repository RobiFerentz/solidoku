import { createStore, reconcile } from 'solid-js/store'
import { generateSudoku } from '../game/generate'
import { Difficulty, Game } from '../game/types'
import { createSignal } from 'solid-js'

const [puzzle, setPuzzle] = createStore<number[][]>([])
const [solution, setSolution] = createStore<number[][]>([])
const [current, setCurrent] = createStore<number[][]>([])
const [difficulty, setDifficulty] = createSignal<Difficulty>('Easy')
const [mistakes, setMistakes] = createSignal<number>(0)

class GameController {
  private storeGame(game: Game) {
    setSolution(reconcile(game.solution))
    setPuzzle(reconcile(game.puzzle))
    setCurrent(reconcile(game.current))
    setDifficulty(game.difficulty)
    setMistakes(game.mistakes)
  }
  createGame(difficulty: Difficulty): void {
    const game = generateSudoku(difficulty)
    this.storeGame(game)
    this.saveGame()
  }

  get currentBoard(): number[][] {
    return current
  }

  get solutionBoard(): number[][] {
    return solution
  }

  get puzzleBoard(): number[][] {
    return puzzle
  }

  get difficulty(): Difficulty {
    return difficulty()
  }

  get mistakes(): number {
    return mistakes()
  }
  get isSolved(): boolean {
    return gameController.currentBoard.flatMap((m) => m).every((m) => !!m)
  }

  setCurrentBoardValue(row: number, col: number, value: number): void {
    setCurrent(row, col, value)
  }

  saveGame(): void {
    if (!this.currentBoard.length) return
    localStorage.setItem(
      'game',
      btoa(JSON.stringify({ solution, puzzle, current, difficulty: difficulty(), mistakes: mistakes() }))
    )
  }

  loadGame(): boolean {
    const game = localStorage.getItem('game')
    if (game) {
      this.storeGame(JSON.parse(atob(game)))
      return true
    }
    return false
  }

  deleteGame(): void {
    localStorage.removeItem('game')
    this.storeGame({
      solution: [],
      puzzle: [],
      current: [],
      difficulty: 'Easy',
      mistakes: 0,
    })
  }

  isCorrectGuess(row: number, col: number, value: number): boolean {
    if(!value) return false
    const correctAnswer = this.solutionBoard[row][col]
    return value === correctAnswer
  }

  isMistakenGuess(row: number, col: number, value: number): boolean {
    if(!value) return false
    return !this.isCorrectGuess(row, col, value)
  }

  isFixedValue(row: number, col: number): boolean {
    return this.puzzleBoard[row][col] !== 0
  } 
}

export const gameController = new GameController()
