import type { Component } from 'solid-js';
import styles from './App.module.css';
import { GameContainer } from './GameContainer';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <GameContainer />
    </div>
  );
};

export default App;
