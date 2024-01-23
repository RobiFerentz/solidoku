import { For, createEffect, createSignal } from 'solid-js'
import { NumberSquare } from './NumberSquare'
import styles from './GameContainer.module.css'
import { gameController } from './stores/GameStore'

export const GameContainer = () => {
  const [selected, setSelected] = createSignal<{ x: number; y: number } | null>(null)
  const handleGuess = (row: number, col: number) => {
    return (guess: number) => {
      gameController.setCurrentBoardValue(row, col, guess)
      gameController.saveGame()      
    }
  }
  

  
  createEffect(() => {
    if (gameController.isSolved) {
      setTimeout(() => {
        alert('Yay! You did it!')
        gameController.deleteGame()
        setSelected(null)
      }, 1000)
    }
  })

  const handleSelect = ({ x, y }: { x: number; y: number }) => {
    const board = gameController.currentBoard
    if (x < 0) x = board[0].length - 1
    if (y < 0) y = board.length - 1
    if (x >= board[0].length) x = 0
    if (y >= board.length) y = 0
    setSelected({ x, y })
  }
  return (
    <>
    <div class={styles.info}>
      <span>Difficulty: {gameController.difficulty}</span>
      <span>Mistakes: {gameController.mistakes}</span>
    </div>
    <div class={styles.container}>
      <For each={gameController.currentBoard}>
        {(row, rowIndex) => (
          <For each={row}>
            {(item, colIndex) => (
              <NumberSquare
                tabIndex={(rowIndex() + 1) * (colIndex() + 1)}
                onGuess={handleGuess(rowIndex(), colIndex())}
                value={item}
                bottomBorderDark={(rowIndex() + 1) % 3 === 0}
                rightBorderDark={(colIndex() + 1) % 3 === 0}
                coords={{ x: colIndex(), y: rowIndex() }}
                isSelected={selected()?.x === colIndex() && selected()?.y === rowIndex()}
                onSelected={handleSelect}
                isCorrect={gameController.isCorrectGuess(rowIndex(), colIndex(), item)}
                isMistake={gameController.isMistakenGuess(rowIndex(), colIndex(), item)}
                isFixed={gameController.isFixedValue(rowIndex(), colIndex())}
              />
            )}
          </For>
        )}
      </For>
    </div>
    </>
  )
}
