import { describe, expect, it } from "vitest";
import {
  BOARD_SIZE,
  advance,
  createGame,
  directionForKey,
  isRestartKey,
  placeFood,
  queueDirection,
  restart,
  sameCell,
  type Cell,
  type Direction,
  type Game,
  type Random,
} from "./index";

/**
 * A fixed random source. `() => 0` picks the first empty cell in reading
 * order, (0,0) for a fresh game: off every path these tests walk.
 */
const random: Random = () => 0;

function play(game: Game, ...steps: (Direction | "tick")[]): Game {
  return steps.reduce(
    (g, step) => (step === "tick" ? advance(g, random) : queueDirection(g, step)),
    game,
  );
}

describe("createGame", () => {
  it("starts as 3 segments in the centre, facing right, ready", () => {
    const game = createGame(random);
    expect(BOARD_SIZE).toBe(20);
    expect(game.status).toBe("ready");
    expect(game.direction).toBe("right");
    expect(game.snake).toEqual([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
  });

  it("stays still on ticks until an arrow key is pressed", () => {
    const game = createGame(random);
    expect(play(game, "tick", "tick")).toEqual(game);
  });
});

describe("starting the game", () => {
  it("starts on the first arrow key and moves that way on the next tick", () => {
    const started = queueDirection(createGame(random), "up");
    expect(started.status).toBe("playing");
    expect(started.snake).toEqual(createGame(random).snake);

    const moved = advance(started, random);
    expect(moved.direction).toBe("up");
    expect(moved.snake[0]).toEqual({ x: 10, y: 9 });
  });

  it("starts with Right, the direction the snake already faces", () => {
    const game = play(createGame(random), "right", "tick");
    expect(game.status).toBe("playing");
    expect(game.snake[0]).toEqual({ x: 11, y: 10 });
  });

  it("ignores Left at the start", () => {
    const game = queueDirection(createGame(random), "left");
    expect(game).toEqual(createGame(random));
    expect(advance(game, random)).toEqual(createGame(random));
  });
});

describe("advance", () => {
  it.each([
    ["right", { x: 11, y: 10 }],
    ["up", { x: 10, y: 9 }],
    ["down", { x: 10, y: 11 }],
  ] as const)("moves one cell %s", (direction, head) => {
    const game = play(createGame(random), direction, "tick");
    expect(game.snake[0]).toEqual(head);
    expect(game.snake).toHaveLength(3);
  });

  it("moves one cell left", () => {
    const game = play(createGame(random), "up", "tick", "left", "tick");
    expect(game.snake).toEqual([
      { x: 9, y: 9 },
      { x: 10, y: 9 },
      { x: 10, y: 10 },
    ]);
  });

  it("keeps moving in its direction with no key pressed", () => {
    const game = play(createGame(random), "down", "tick", "tick", "tick");
    expect(game.snake).toEqual([
      { x: 10, y: 13 },
      { x: 10, y: 12 },
      { x: 10, y: 11 },
    ]);
  });
});

/** Ticks until the status leaves `playing`, or `limit` ticks pass. */
function runUntilGameOver(game: Game, limit = BOARD_SIZE * 2): Game {
  for (let i = 0; i < limit && game.status === "playing"; i++) game = advance(game, random);
  return game;
}

/**
 * A playing game with a hand-built snake, head first, that moved `direction`
 * on the last tick and has `turn` queued for the next.
 */
function playingGame(
  snake: Game["snake"],
  direction: Direction,
  turn: Direction | null,
  food: Cell | null = { x: 0, y: 0 },
): Game {
  return {
    status: "playing",
    snake,
    direction,
    queuedDirection: turn,
    food,
    score: 0,
  };
}

describe("collisions", () => {
  it.each([
    ["right", { x: 19, y: 10 }],
    ["up", { x: 10, y: 0 }],
    ["down", { x: 10, y: 19 }],
  ] as const)("ends the game at the %s edge", (direction, lastHead) => {
    const game = runUntilGameOver(queueDirection(createGame(random), direction));
    expect(game.status).toBe("game over");
    expect(game.snake[0]).toEqual(lastHead);
  });

  it("ends the game at the left edge", () => {
    const game = runUntilGameOver(play(createGame(random), "up", "tick", "left"));
    expect(game.status).toBe("game over");
    expect(game.snake[0]).toEqual({ x: 0, y: 9 });
  });

  it("moves up to the last cell before the edge without a collision", () => {
    let game = queueDirection(createGame(random), "right");
    for (let i = 0; i < 9; i++) game = advance(game, random);
    expect(game.status).toBe("playing");
    expect(game.snake[0]).toEqual({ x: 19, y: 10 });
  });

  it("ends the game when the head moves into one of the snake's own segments", () => {
    const snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ];
    const game = advance(playingGame(snake, "left", "down"), random);
    expect(game.status).toBe("game over");
    expect(game.snake).toEqual(snake);
  });

  it("lets the head move into the cell the tail is leaving on the same tick", () => {
    const game = advance(
      playingGame(
        [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 6, y: 6 },
          { x: 5, y: 6 },
        ],
        "left",
        "down",
      ),
      random,
    );
    expect(game.status).toBe("playing");
    expect(game.snake).toEqual([
      { x: 5, y: 6 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
    ]);
  });
});

describe("game over", () => {
  const gameOver = runUntilGameOver(queueDirection(createGame(random), "right"));

  it("stops the snake: ticks do not move it", () => {
    expect(gameOver.status).toBe("game over");
    expect(advance(advance(gameOver, random), random)).toEqual(gameOver);
  });

  it("ignores arrow keys", () => {
    expect(queueDirection(gameOver, "up")).toEqual(gameOver);
  });
});

describe("restart", () => {
  it("gives a fresh starting state after game over", () => {
    const gameOver = runUntilGameOver(queueDirection(createGame(random), "up"));
    expect(gameOver.status).toBe("game over");
    expect(restart(gameOver, random)).toEqual(createGame(random));
  });

  it("does nothing while ready or playing", () => {
    const ready = createGame(random);
    expect(restart(ready, random)).toBe(ready);
    const playing = play(createGame(random), "up", "tick");
    expect(restart(playing, random)).toBe(playing);
  });

  it("is triggered by Enter and Space only", () => {
    expect(isRestartKey("Enter")).toBe(true);
    expect(isRestartKey(" ")).toBe(true);
    expect(isRestartKey("ArrowUp")).toBe(false);
    expect(isRestartKey("r")).toBe(false);
  });
});

describe("turning", () => {
  it.each([
    ["right", "left"],
    ["up", "down"],
    ["down", "up"],
  ] as const)("ignores a 180° turn: moving %s, pressing %s", (moving, reverse) => {
    const game = play(createGame(random), moving, "tick", reverse, "tick");
    expect(game.direction).toBe(moving);
  });

  it("ignores a 180° turn while moving left", () => {
    const game = play(createGame(random), "up", "tick", "left", "tick", "right", "tick");
    expect(game.direction).toBe("left");
  });

  it("counts only the first turn in one tick: Up then Left cannot reverse a snake moving right", () => {
    const game = play(createGame(random), "right", "tick", "up", "left", "tick");
    expect(game.direction).toBe("up");
    expect(game.snake[0]).toEqual({ x: 11, y: 9 });

    const next = advance(game, random);
    expect(next.snake[0]).toEqual({ x: 11, y: 8 });
  });

  it("accepts a new turn on the next tick", () => {
    const game = play(createGame(random), "right", "tick", "up", "tick", "left", "tick");
    expect(game.direction).toBe("left");
    expect(game.snake[0]).toEqual({ x: 10, y: 9 });
  });

  it("does not let a press of the current direction use up the tick's turn", () => {
    const game = play(createGame(random), "right", "tick", "right", "up", "tick");
    expect(game.direction).toBe("up");
  });
});

describe("directionForKey", () => {
  it("maps arrow keys to directions and ignores other keys", () => {
    expect(directionForKey("ArrowUp")).toBe("up");
    expect(directionForKey("ArrowDown")).toBe("down");
    expect(directionForKey("ArrowLeft")).toBe("left");
    expect(directionForKey("ArrowRight")).toBe("right");
    expect(directionForKey("a")).toBeNull();
  });

  it("ignores key names that match built-in object properties", () => {
    expect(directionForKey("toString")).toBeNull();
    expect(directionForKey("constructor")).toBeNull();
  });
});

/** Every cell of the board, row by row, snaking left-right then right-left. */
function boardPath(): Cell[] {
  const path: Cell[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      path.push({ x: y % 2 === 0 ? i : BOARD_SIZE - 1 - i, y });
    }
  }
  return path;
}

function onSnake(snake: readonly Cell[], cell: Cell | null): boolean {
  return cell !== null && snake.some((s) => sameCell(s, cell));
}

describe("food", () => {
  it("starts on a cell not on the snake, with a score of 0", () => {
    const game = createGame(random);
    expect(game.food).toEqual({ x: 0, y: 0 });
    expect(game.score).toBe(0);
  });

  it.each([0, 0.25, 0.5, 0.999999])(
    "is never placed on the snake (random source returns %s)",
    (value) => {
      const fixed = () => value;
      const snake = boardPath().slice(0, 397);
      const food = placeFood(snake, fixed);
      expect(food).not.toBeNull();
      expect(onSnake(snake, food)).toBe(false);
      expect(onSnake(createGame(fixed).snake, createGame(fixed).food)).toBe(false);
    },
  );

  it("picks from the empty cells using the random source", () => {
    const snake = boardPath().slice(0, 397);
    // The 3 empty cells are the last 3 on the path: (2,19), (1,19), (0,19).
    expect(placeFood(snake, () => 0)).toEqual({ x: 0, y: 19 });
    expect(placeFood(snake, () => 0.5)).toEqual({ x: 1, y: 19 });
    expect(placeFood(snake, () => 0.99)).toEqual({ x: 2, y: 19 });
  });

  it("returns no cell when the snake fills the board", () => {
    expect(placeFood(boardPath(), random)).toBeNull();
  });
});

describe("eating", () => {
  const snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ];

  it("grows the snake by one segment, keeping the tail, and adds 1 to the score", () => {
    const game = advance(playingGame(snake, "right", null, { x: 6, y: 5 }), random);
    expect(game.status).toBe("playing");
    expect(game.snake).toEqual([{ x: 6, y: 5 }, ...snake]);
    expect(game.score).toBe(1);
  });

  it("places new food on an empty cell at once", () => {
    const game = advance(playingGame(snake, "right", null, { x: 6, y: 5 }), () => 0.5);
    expect(game.food).not.toBeNull();
    expect(onSnake(game.snake, game.food)).toBe(false);
  });

  it("does not grow or score on a tick without food", () => {
    const game = advance(playingGame(snake, "right", null), random);
    expect(game.snake).toHaveLength(3);
    expect(game.score).toBe(0);
    expect(game.food).toEqual({ x: 0, y: 0 });
  });

  it("counts the score across several meals", () => {
    let game = advance(playingGame(snake, "right", null, { x: 6, y: 5 }), () => 0);
    game = { ...game, food: { x: 7, y: 5 } };
    game = advance(game, random);
    expect(game.score).toBe(2);
    expect(game.snake).toHaveLength(5);
  });

  it("makes the tail's cell a collision on a tick when the snake eats", () => {
    // Hand-built: the food sits on the tail's cell, so the tail stays put.
    const loop = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
    ];
    const game = advance(playingGame(loop, "left", "down", { x: 5, y: 6 }), random);
    expect(game.status).toBe("game over");
    expect(game.snake).toEqual(loop);
    expect(game.score).toBe(0);
  });
});

describe("win", () => {
  // A 399-segment snake on every cell but (0,19), head at (1,19) moving left.
  const path = boardPath();
  const lastFood = path[path.length - 1];
  const fullSnake = path.slice(0, -1).reverse();
  const almostWon = { ...playingGame(fullSnake, "left", null, lastFood), score: 396 };

  it("is the status once the snake fills the board and no food can be placed", () => {
    expect(fullSnake).toHaveLength(BOARD_SIZE * BOARD_SIZE - 1);
    const won = advance(almostWon, random);
    expect(won.status).toBe("win");
    expect(won.snake).toHaveLength(BOARD_SIZE * BOARD_SIZE);
    expect(won.food).toBeNull();
    expect(won.score).toBe(397);
  });

  it("stops the snake and ignores arrow keys", () => {
    const won = advance(almostWon, random);
    expect(advance(won, random)).toBe(won);
    expect(queueDirection(won, "up")).toBe(won);
  });

  it("restarts to a fresh game, resetting the snake, food and score", () => {
    const won = advance(almostWon, random);
    expect(restart(won, random)).toEqual(createGame(random));
  });
});
