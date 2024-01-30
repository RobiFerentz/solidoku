import { createSignal, type Component, Show, onMount, onCleanup } from 'solid-js';
import { GameContainer } from './GameContainer';
import { GameMenu } from './GameMenu';
import { gameController } from './stores/GameStore';
import { Header } from './Header';

const App: Component = () => {
  const [hasPreviousGame, setHasPreviousGame] = createSignal(false);
  const [showGame, setShowGame] = createSignal(false);

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'game' && event.storageArea === localStorage) {
      const hasGame = gameController.loadGame();
      setHasPreviousGame(hasGame);
      setShowGame(hasGame);
    }
  };

  onMount(() => {
    setHasPreviousGame(gameController.loadGame());
    window.addEventListener('storage', handleStorageEvent);
  });

  const handleGameSolved = () => {
    setShowGame(false);
    setHasPreviousGame(false);
  };

  const handleBack = () => {
    setShowGame(false);
    setHasPreviousGame(gameController.loadGame());
  };

  onCleanup(() => {
    window.removeEventListener('storage', handleStorageEvent);
  });

  return (
    <>
      <Header onBack={handleBack} showBackButton={showGame()} />
      <Show when={!showGame()}>
        <GameMenu
          canResume={hasPreviousGame()}
          onNewGame={() => setShowGame(true)}
          onResumeGame={() => setShowGame(true)}
        />
      </Show>
      <Show when={showGame()}>
        <GameContainer onGameSolved={handleGameSolved} />
      </Show>
    </>
  );
};

export default App;
