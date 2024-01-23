import styles from './Header.module.css'
export const Header = () => {
  return (
    <header class={styles.header}>
      <h1 class={styles.appName}>Solidoku</h1>
    </header>
  )
}
