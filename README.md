
# What is this?

This is a simple sudoku game built with [Solid](https://solidjs.com) and [TypeScript](https://www.typescriptlang.org/). I've named it Solidoku for obvious reasons.

The game is playable [here](https://robiferentz.github.io/solidoku/) using github pages.

## Why?
I love solving sudoku puzzles and play it on my phone. My daughter challenged me to make my own version so I did. I used the opportunity to learn Solid.

## Usage

You will need:

- Node.js 24 LTS (Vite 8 requires Node 22.12 or newer)
- pnpm 12.15.0 — run `corepack enable` to use the version pinned in `packageManager`

To get started, clone the repository and install the dependencies:

```bash
$ cd solidoku
$ pnpm install
```

Run the game locally in dev mode:

```bash
$ pnpm dev # or pnpm start
```

Go to [http://localhost:3000/solidoku/](http://localhost:3000/solidoku/) to view it in the browser.

## Features
- Playable classic sudoku game (9x9)
- Different difficulty levels
- Resumable game state (local, no server)
- KBD navigation (arrow keys)

## Future Plans
 - Timer
 - Settings (dark mode, maximum mistakes, etc.)
 - My daughter being interested in coding, maybe? 😅
