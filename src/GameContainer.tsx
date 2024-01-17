import { For, Show, createComputed, createEffect, createSignal, onMount } from 'solid-js'
import { NumberSquare } from './NumberSquare'
import styles from './GameContainer.module.css'
import { boardStore, solutionStore } from './stores/GameStore'
import { generateSudoku } from './game/generate'

const { solution, setSolution } = solutionStore
const { board, setBoard } = boardStore
const [selected, setSelected] = createSignal<{ x: number; y: number } | null>(null)
export const GameContainer = () => {
  onMount(() => {
    const game = generateSudoku('Easy')
    setSolution(game.solution)
    setBoard(game.puzzle)
  })

  const validateGuess = (row: number, col: number) => {
    return (guess: number) => {
      const solutionValue = solution[row][col]
      const isCorrect = guess === solutionValue
      if (isCorrect) {
        setBoard(row, col, guess)
      }
      return isCorrect
    }
  }

  const isSolved = () => board.flatMap((m) => m).every((m) => !!m)
  createEffect(() => {
    if (isSolved()) {
      setTimeout(() => {
        alert('Yay! You did it!')
      }, 1000)
    }
  })

  const handleSelect = ({ x, y }: { x: number; y: number }) => {
    if (x < 0) x = board[0].length - 1
    if (y < 0) y = board.length - 1
    if (x >= board[0].length) x = 0
    if (y >= board.length) y = 0
    setSelected({ x, y })
  }
  return (
    <Show when={board.length} fallback="Loading...">
      <div class={styles.container}>
        <For each={board}>
          {(row, rowIndex) => (
            <For each={row}>
              {(item, colIndex) => (
                <NumberSquare
                  tabIndex={(rowIndex() + 1) * (colIndex() + 1)}
                  onGuess={validateGuess(rowIndex(), colIndex())}
                  value={item}
                  bottomBorderDark={(rowIndex() + 1) % 3 === 0}
                  rightBorderDark={(colIndex() + 1) % 3 === 0}
                  coords={{ x: colIndex(), y: rowIndex() }}
                  isSelected={selected()?.x === colIndex() && selected()?.y === rowIndex()}
                  onSelected={handleSelect}
                />
              )}
            </For>
          )}
        </For>
      </div>
    </Show>
  )
}
