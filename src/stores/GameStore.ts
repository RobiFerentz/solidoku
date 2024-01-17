import { createStore } from 'solid-js/store'

const [board, setBoard] = createStore<number[][]>([])
const [solution, setSolution] = createStore<number[][]>([])

export const boardStore = { board, setBoard }
export const solutionStore = { solution, setSolution }
