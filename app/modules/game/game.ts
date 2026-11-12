/**
 * Game rules for Snake: create a game, queue a direction, advance one tick,
 * end the game on a collision, restart.
 * Pure functions over immutable values. No React, DOM or timer code.
 */

export const BOARD_SIZE = 20;
export const TICK_MS = 150;

export type Direction = "up" | "down" | "left" | "right";

/** A square on the board. `x` grows to the right, `y` grows downwards. */
export type Cell = { readonly x: number; readonly y: number };

/**
 * `ready`: waiting for the first arrow key. `playing`: moving each tick.
 * `game over`: a collision ended the game; the snake no longer moves.
 */
export type Status = "ready" | "playing" | "game over";

export type Game = {
  readonly status: Status;
  /** Segments, head first. */
  readonly snake: readonly Cell[];
  /** The direction the snake moved on the last tick (or faces at the start). */
  readonly direction: Direction;
  /** The one turn accepted for the next tick, if any. */
  readonly queuedDirection: Direction | null;
};

const STEP: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const ARROW_KEYS: Readonly<Record<string, Direction>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

/** Maps a `KeyboardEvent.key` to a direction, or `null` if it is not an arrow key. */
export function directionForKey(key: string): Direction | null {
  return Object.hasOwn(ARROW_KEYS, key) ? ARROW_KEYS[key] : null;
}

/** A new game: 3 segments in the centre, facing right, status `ready`. */
export function createGame(): Game {
  const centre = BOARD_SIZE / 2;
  return {
    status: "ready",
    snake: [
      { x: centre, y: centre },
      { x: centre - 1, y: centre },
      { x: centre - 2, y: centre },
    ],
    direction: "right",
    queuedDirection: null,
  };
}

/**
 * Queues a turn for the next tick. The first valid arrow key starts the game.
 * Ignored when it would reverse the snake 180° against the direction it moved
 * on the last tick, or when a turn is already queued for this tick (first wins).
 */
export function queueDirection(game: Game, direction: Direction): Game {
  if (game.status === "game over") return game;
  if (game.queuedDirection !== null) return game;
  if (direction === OPPOSITE[game.direction]) return game;

  if (game.status === "ready") {
    return { ...game, status: "playing", queuedDirection: direction };
  }
  // Keeping the current direction is not a turn, so it does not use up the tick's turn.
  if (direction === game.direction) return game;
  return { ...game, queuedDirection: direction };
}

/**
 * Moves the snake one cell in its direction. Does nothing unless `playing`.
 * A collision (the head leaving the board or moving into one of the snake's
 * own segments) ends the game and leaves the snake where it was.
 */
export function advance(game: Game): Game {
  if (game.status !== "playing") return game;

  const direction = game.queuedDirection ?? game.direction;
  const head = game.snake[0];
  const step = STEP[direction];
  const newHead = { x: head.x + step.x, y: head.y + step.y };
  // The tail leaves its cell on this tick, so the head may move into it.
  const body = game.snake.slice(0, -1);

  if (!isOnBoard(newHead) || body.some((cell) => sameCell(cell, newHead))) {
    return { ...game, status: "game over", queuedDirection: null };
  }

  return {
    ...game,
    snake: [newHead, ...body],
    direction,
    queuedDirection: null,
  };
}

const RESTART_KEYS: ReadonlySet<string> = new Set(["Enter", " "]);

/** Whether a `KeyboardEvent.key` restarts the game: Enter or Space. */
export function isRestartKey(key: string): boolean {
  return RESTART_KEYS.has(key);
}

/** A fresh game after game over. Does nothing during `ready` or `playing`. */
export function restart(game: Game): Game {
  return game.status === "game over" ? createGame() : game;
}

function isOnBoard(cell: Cell): boolean {
  return cell.x >= 0 && cell.x < BOARD_SIZE && cell.y >= 0 && cell.y < BOARD_SIZE;
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}
