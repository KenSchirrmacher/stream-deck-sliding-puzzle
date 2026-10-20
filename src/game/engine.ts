import streamDeck, { type KeyAction } from "@elgato/streamdeck";
import { blankFrame, tileFrame, tileWinFrame } from "./render.js";

const APPEAR_DEBOUNCE_MS = 400;
const SHUFFLE_MOVES = 120;
const WIN_PAUSE_MS = 2_500;

type CellState = {
  action: KeyAction;
  row: number;
  col: number;
};

type DeviceState = {
  cells: Map<string, CellState>;
  boardOrder: string[];
  width: number;
  height: number;
  tiles: number[];
  blankIndex: number;
  started: boolean;
  celebrating: boolean;
  appearDebounce: ReturnType<typeof setTimeout> | null;
  resetTimer: ReturnType<typeof setTimeout> | null;
};

function freshState(): DeviceState {
  return {
    cells: new Map(),
    boardOrder: [],
    width: 0,
    height: 0,
    tiles: [],
    blankIndex: -1,
    started: false,
    celebrating: false,
    appearDebounce: null,
    resetTimer: null,
  };
}

class GameEngine {
  private devices = new Map<string, DeviceState>();

  registerCell(deviceId: string, action: KeyAction, row: number, col: number): void {
    const state = this.getOrCreate(deviceId);
    state.cells.set(action.id, { action, row, col });
    void action.setImage(blankFrame()).catch((err) =>
      streamDeck.logger.error(`sliding-puzzle: setImage(blank) failed for ${action.id}: ${String(err)}`),
    );
    this.scheduleStart(state);
  }

  unregisterCell(deviceId: string, actionId: string): void {
    const state = this.devices.get(deviceId);
    if (!state) return;
    state.cells.delete(actionId);
    if (state.cells.size === 0) {
      if (state.appearDebounce) clearTimeout(state.appearDebounce);
      if (state.resetTimer) clearTimeout(state.resetTimer);
      this.devices.delete(deviceId);
    }
  }

  handlePress(deviceId: string, action: KeyAction): void {
    const state = this.devices.get(deviceId);
    if (!state || !state.started || state.celebrating) return;

    const idx = state.boardOrder.indexOf(action.id);
    if (idx < 0 || idx === state.blankIndex) return;
    if (!this.isAdjacent(state, idx, state.blankIndex)) return;

    const oldBlank = state.blankIndex;
    state.tiles[oldBlank] = state.tiles[idx];
    state.tiles[idx] = 0;
    state.blankIndex = idx;

    this.renderCell(state, oldBlank, tileFrame(state.tiles[oldBlank]));
    this.renderCell(state, idx, blankFrame());

    this.checkWin(state);
  }

  private isAdjacent(state: DeviceState, a: number, b: number): boolean {
    const rowA = Math.floor(a / state.width);
    const colA = a % state.width;
    const rowB = Math.floor(b / state.width);
    const colB = b % state.width;
    return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
  }

  private checkWin(state: DeviceState): void {
    const total = state.width * state.height;
    const solved = state.tiles.every((v, i) => (i === total - 1 ? v === 0 : v === i + 1));
    if (solved) this.celebrate(state);
  }

  private celebrate(state: DeviceState): void {
    state.celebrating = true;
    const total = state.width * state.height;
    for (let i = 0; i < total - 1; i++) this.renderCell(state, i, tileWinFrame(state.tiles[i]));

    state.resetTimer = setTimeout(() => {
      state.celebrating = false;
      this.newGame(state);
    }, WIN_PAUSE_MS);
  }

  private renderCell(state: DeviceState, idx: number, image: string): void {
    const id = state.boardOrder[idx];
    const cell = state.cells.get(id);
    if (cell) void cell.action.setImage(image);
  }

  private scheduleStart(state: DeviceState): void {
    if (state.appearDebounce) clearTimeout(state.appearDebounce);
    state.appearDebounce = setTimeout(() => {
      state.appearDebounce = null;
      if (state.started || state.cells.size === 0) return;

      const cells = [...state.cells.values()];
      const minRow = Math.min(...cells.map((c) => c.row));
      const maxRow = Math.max(...cells.map((c) => c.row));
      const minCol = Math.min(...cells.map((c) => c.col));
      const maxCol = Math.max(...cells.map((c) => c.col));
      const width = maxCol - minCol + 1;
      const height = maxRow - minRow + 1;

      if (cells.length !== width * height || width * height < 4) {
        streamDeck.logger.warn(
          `sliding-puzzle: registered cells (${cells.length}) don't form a solid rectangle (${width}x${height}); not starting.`,
        );
        return;
      }

      const boardOrder = new Array<string>(width * height);
      for (const c of cells) {
        const idx = (c.row - minRow) * width + (c.col - minCol);
        boardOrder[idx] = c.action.id;
      }

      state.boardOrder = boardOrder;
      state.width = width;
      state.height = height;
      state.started = true;
      this.newGame(state);
    }, APPEAR_DEBOUNCE_MS);
  }

  private newGame(state: DeviceState): void {
    const total = state.width * state.height;
    const tiles = new Array<number>(total);
    for (let i = 0; i < total - 1; i++) tiles[i] = i + 1;
    tiles[total - 1] = 0;
    state.tiles = tiles;
    state.blankIndex = total - 1;

    let lastBlank = -1;
    for (let i = 0; i < SHUFFLE_MOVES; i++) {
      const neighbors = this.neighborsOf(state, state.blankIndex).filter((n) => n !== lastBlank);
      const candidates = neighbors.length > 0 ? neighbors : this.neighborsOf(state, state.blankIndex);
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      state.tiles[state.blankIndex] = state.tiles[pick];
      state.tiles[pick] = 0;
      lastBlank = state.blankIndex;
      state.blankIndex = pick;
    }

    for (let i = 0; i < total; i++) {
      this.renderCell(state, i, i === state.blankIndex ? blankFrame() : tileFrame(state.tiles[i]));
    }
  }

  private neighborsOf(state: DeviceState, idx: number): number[] {
    const row = Math.floor(idx / state.width);
    const col = idx % state.width;
    const out: number[] = [];
    if (row > 0) out.push(idx - state.width);
    if (row < state.height - 1) out.push(idx + state.width);
    if (col > 0) out.push(idx - 1);
    if (col < state.width - 1) out.push(idx + 1);
    return out;
  }

  private getOrCreate(deviceId: string): DeviceState {
    let state = this.devices.get(deviceId);
    if (!state) {
      state = freshState();
      this.devices.set(deviceId, state);
    }
    return state;
  }
}

export const gameEngine = new GameEngine();
