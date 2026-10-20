# Sliding Puzzle for Stream Deck

A classic 15-puzzle on your key grid. Tiles numbered 1 through N-1 share the board with one
empty gap — press a tile next to the gap to slide it in. Put every tile back in order and the
whole board flashes green, then shuffles itself for another round.

All the key art is generated as plain SVG at runtime — no image files.

## Build

```
npm install
npm run build
npx @elgato/cli link com.homedeck.slidingpuzzle.sdPlugin
```

Dev watch: `npm run watch`

If `npm run build` fails on `sharp` (native binary), just re-run `npm install` once — sharp
downloads a prebuilt binary for your platform on install.

## Setting it up

This plugin ships one action, **Tile** — it doesn't come with a prebuilt layout, because Stream
Deck plugins can't create pages/profiles on your behalf. You build the board once, the same way
you'd lay out any other folder:

1. Create a folder (or a whole profile) on your Stream Deck and drag **Tile** (under the
   "Sliding Puzzle" category) onto a solid rectangular block of keys — no gaps, no L-shapes. The
   plugin reads each key's actual position on the deck to build the board; the classic size is a
   4x4 block (15 tiles + 1 gap).
2. The board shuffles itself automatically a moment after the page becomes visible. The shuffle
   is done by making random legal moves from the solved state, so every puzzle is guaranteed
   solvable.
3. Press a tile next to the empty gap to slide it in. Tiles not touching the gap won't move.

**Handing the deck to a kid without worry:** put the board on its own folder page, and use Stream
Deck's built-in **Parent Folder** action (no plugin needed) on one key as the way out. Launch the
folder from your main page with the built-in **Create Folder** / navigation action.

## Game internals

- `src/game/engine.ts` — one shared state machine per Stream Deck device: the board (built from
  each key's real `coordinates`, not registration order), the shuffle-by-random-walk routine,
  adjacency checks for sliding, win detection, and the pause before reshuffling.
- `src/game/render.ts` — all the key art (numbered tile, win glow, the empty gap), generated at
  runtime.
- Tuning constants live at the top of `engine.ts`: `SHUFFLE_MOVES` (how scrambled a fresh board
  is) and `WIN_PAUSE_MS` (how long the win flash holds before reshuffling).

## License

MIT
