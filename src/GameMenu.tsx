import { For, Show } from 'solid-js'
import { Difficulty } from './game/generate'
import styles from './GameMenu.module.css'
import { gameController } from './stores/GameStore'

type GameMenuProps = {
  canResume: boolean
  onNewGame: () => void
  onResumeGame: () => void
}
export const GameMenu = (props: GameMenuProps) => {
  const levels = ['Easy', 'Medium', 'Hard'] as const
  const handleNewGame = (difficulty: Difficulty) => {
    gameController.createGame(difficulty)
    props.onNewGame()
  }

  const handleResumeGame = () => {
    props.onResumeGame()
  }

  return (
    <div class={styles.container}>      
      <div class={styles.buttonContainer}>
        <Show when={props.canResume}>
          <button type="button" onClick={handleResumeGame}>
            Resume Game
          </button>
        </Show>
        <h2>New Game</h2>
        <For each={levels}>
          {(level) => (
            <button type="button" onClick={() => handleNewGame(level)}>
              {level}
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
