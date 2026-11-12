/**
 * Game rules for Snake: create a game, queue a direction, advance one tick,
 * eat food and grow, end the game on a collision or a win, restart.
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
 * `win`: the snake fills the board, so no food can be placed.
 */
export type Status = "ready" | "playing" | "game over" | "win";

/** A source of randomness: returns a number in [0, 1), like `Math.random`. */
export type Random = () => number;

export type Game = {
  readonly status: Status;
  /** Segments, head first. */
  readonly snake: readonly Cell[];
  /** The direction the snake moved on the last tick (or faces at the start). */
  readonly direction: Direction;
  /** The one turn accepted for the next tick, if any. */
  readonly queuedDirection: Direction | null;
  /** The cell with the food on it. `null` only after a win, when no cell is empty. */
  readonly food: Cell | null;
  /** Food eaten this game. */
  readonly score: number;
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

/**
 * A new game: 3 segments in the centre, facing right, status `ready`, score 0,
 * and food on an empty cell picked with `random`.
 */
export function createGame(random: Random): Game {
  const centre = BOARD_SIZE / 2;
  const snake = [
    { x: centre, y: centre },
    { x: centre - 1, y: centre },
    { x: centre - 2, y: centre },
  ];
  return {
    status: "ready",
    snake,
    direction: "right",
    queuedDirection: null,
    food: placeFood(snake, random),
    score: 0,
  };
}

/**
 * Picks an empty cell (one not on the snake) with `random`, or `null` when the
 * snake fills the board.
 */
export function placeFood(snake: readonly Cell[], random: Random): Cell | null {
  const taken = new Set(snake.map(cellKey));
  const empty: Cell[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (!taken.has(cellKey({ x, y }))) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.min(Math.floor(random() * empty.length), empty.length - 1)];
}

/**
 * Queues a turn for the next tick. The first valid arrow key starts the game.
 * Ignored when it would reverse the snake 180° against the direction it moved
 * on the last tick, or when a turn is already queued for this tick (first wins).
 */
export function queueDirection(game: Game, direction: Direction): Game {
  if (isOver(game)) return game;
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
 * When the head reaches the food, the snake grows by one segment, the score
 * goes up by one and new food is placed with `random`; with no empty cell
 * left for it, the game is won.
 */
export function advance(game: Game, random: Random): Game {
  if (game.status !== "playing") return game;

  const direction = game.queuedDirection ?? game.direction;
  const head = game.snake[0];
  const step = STEP[direction];
  const newHead = { x: head.x + step.x, y: head.y + step.y };
  const eats = game.food !== null && sameCell(game.food, newHead);
  // The tail leaves its cell on this tick, so the head may move into it,
  // unless the snake eats: then the tail stays.
  const blocked = eats ? game.snake : game.snake.slice(0, -1);

  if (!isOnBoard(newHead) || blocked.some((cell) => sameCell(cell, newHead))) {
    return { ...game, status: "game over", queuedDirection: null };
  }

  const snake = [newHead, ...blocked];
  if (!eats) {
    return { ...game, snake, direction, queuedDirection: null };
  }

  const food = placeFood(snake, random);
  return {
    ...game,
    status: food === null ? "win" : "playing",
    snake,
    direction,
    queuedDirection: null,
    food,
    score: game.score + 1,
  };
}

const RESTART_KEYS: ReadonlySet<string> = new Set(["Enter", " "]);

/** Whether a `KeyboardEvent.key` restarts the game: Enter or Space. */
export function isRestartKey(key: string): boolean {
  return RESTART_KEYS.has(key);
}

/** A fresh game after game over or a win. Does nothing during `ready` or `playing`. */
export function restart(game: Game, random: Random): Game {
  return isOver(game) ? createGame(random) : game;
}

/** Whether the game has ended: `game over` or `win`. */
export function isOver(game: Game): boolean {
  return game.status === "game over" || game.status === "win";
}

function isOnBoard(cell: Cell): boolean {
  return cell.x >= 0 && cell.x < BOARD_SIZE && cell.y >= 0 && cell.y < BOARD_SIZE;
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}
