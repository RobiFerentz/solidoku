import { createSignal, type Component, Show, onMount } from 'solid-js'
import { GameContainer } from './GameContainer'
import { GameMenu } from './GameMenu'
import { gameController } from './stores/GameStore'
import { Header } from './Header'

const App: Component = () => {
  const [hasPreviousGame, setHasPreviousGame] = createSignal(false)
  onMount(() => {
    setHasPreviousGame(gameController.loadGame())
  })
  const [showGame, setShowGame] = createSignal(false)

  return (
    <>
      <Header />
      <Show when={!showGame()}>
        <GameMenu
          canResume={hasPreviousGame()}
          onNewGame={() => setShowGame(true)}
          onResumeGame={() => setShowGame(true)}
        />
      </Show>
      <Show when={showGame()}>
        <GameContainer />
      </Show>
    </>
  )
}

export default App
