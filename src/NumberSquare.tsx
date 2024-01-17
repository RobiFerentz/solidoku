import { Match, Switch, createEffect, createSignal, createUniqueId, on } from 'solid-js'
import styles from './NumberSquare.module.css'

type Coords = {
  x: number
  y: number
}
type NumberSquareProps = {
  value: number
  rightBorderDark?: boolean
  bottomBorderDark?: boolean
  onGuess: (guess: number) => boolean
  tabIndex: number
  coords: Coords
  isSelected: boolean
  onSelected: (coords: Coords) => void
}

export const NumberSquare = (props: NumberSquareProps) => {
  const [val, setVal] = createSignal('')
  const [mistake, setMistake] = createSignal(false)
  let root: HTMLDivElement | undefined
  const handleInput = (e: KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.key.startsWith('Arrow')) {
      switch (e.key) {
        case 'ArrowUp':
          props.onSelected({ x: props.coords.x, y: props.coords.y - 1 })
          break
        case 'ArrowDown':
          props.onSelected({ x: props.coords.x, y: props.coords.y + 1 })
          break
        case 'ArrowLeft':
          props.onSelected({ x: props.coords.x - 1, y: props.coords.y })
          break
        case 'ArrowRight':
          props.onSelected({ x: props.coords.x + 1, y: props.coords.y })
          break
      }
      return
    }

    if (props.value) return
    const allowInputs = /([1-9]{1,1})/gi

    if (!allowInputs.test(e.key)) {
      setVal('')
      return
    }
    setVal(e.key)
    const guess = parseInt(e.key, 10)
    setMistake(!props.onGuess(guess))
  }

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    props.onSelected(props.coords)
  }

  createEffect(() => {
    if (props.isSelected) {
      root?.focus()
    }
  })

  return (
    <div
      ref={root}
      class={styles.square}
      classList={{
        [styles.rightBorderDark]: props.rightBorderDark,
        [styles.bottomBorderDark]: props.bottomBorderDark,
        [styles.mistake]: mistake(),
        [styles.selected]: props.isSelected,
      }}
      tabIndex={props.tabIndex}
      onKeyDown={handleInput}
      onClick={handleClick}
    >
      <div>{props.value || val()}</div>
    </div>
  )
}
