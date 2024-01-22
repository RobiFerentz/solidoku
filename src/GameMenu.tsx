import { Show } from 'solid-js'
import { Difficulty } from './game/generate'
import styles from './GameMenu.module.css'
import { gameController } from './stores/GameStore'

type GameMenuProps = {
  canResume: boolean,
  onNewGame: () => void,
  onResumeGame: () => void,
}
export const GameMenu = (props: GameMenuProps) => {
  const handleNewGame = (difficulty: Difficulty) => {
    gameController.createGame(difficulty)
    props.onNewGame()
  }

  const handleResumeGame = () => {
    props.onResumeGame()
  }

  return (
    <div class={styles.container}>
      <h1>Game Menu</h1>
      <div class={styles.buttonContainer}>
        <Show when={props.canResume}>
          <button type="button" onClick={handleResumeGame}>
            Resume Game
          </button>
        </Show>
        <button type="button" onClick={() => handleNewGame('Easy')}>
          New Game - Easy
        </button>
        <button type="button" onClick={() => handleNewGame('Medium')}>
          New Game - Medium
        </button>
        <button type="button" onClick={() => handleNewGame('Hard')}>
          New Game - Hard
        </button>
      </div>
    </div>
  )
}
