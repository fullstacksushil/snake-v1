import { describe, expect, it } from "vitest";
import {
  BOARD_SIZE,
  advance,
  createGame,
  directionForKey,
  isRestartKey,
  queueDirection,
  restart,
  type Direction,
  type Game,
} from "./index";

function play(game: Game, ...steps: (Direction | "tick")[]): Game {
  return steps.reduce(
    (g, step) => (step === "tick" ? advance(g) : queueDirection(g, step)),
    game,
  );
}

describe("createGame", () => {
  it("starts as 3 segments in the centre, facing right, ready", () => {
    const game = createGame();
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
    const game = createGame();
    expect(play(game, "tick", "tick")).toEqual(game);
  });
});

describe("starting the game", () => {
  it("starts on the first arrow key and moves that way on the next tick", () => {
    const started = queueDirection(createGame(), "up");
    expect(started.status).toBe("playing");
    expect(started.snake).toEqual(createGame().snake);

    const moved = advance(started);
    expect(moved.direction).toBe("up");
    expect(moved.snake[0]).toEqual({ x: 10, y: 9 });
  });

  it("starts with Right, the direction the snake already faces", () => {
    const game = play(createGame(), "right", "tick");
    expect(game.status).toBe("playing");
    expect(game.snake[0]).toEqual({ x: 11, y: 10 });
  });

  it("ignores Left at the start", () => {
    const game = queueDirection(createGame(), "left");
    expect(game).toEqual(createGame());
    expect(advance(game)).toEqual(createGame());
  });
});

describe("advance", () => {
  it.each([
    ["right", { x: 11, y: 10 }],
    ["up", { x: 10, y: 9 }],
    ["down", { x: 10, y: 11 }],
  ] as const)("moves one cell %s", (direction, head) => {
    const game = play(createGame(), direction, "tick");
    expect(game.snake[0]).toEqual(head);
    expect(game.snake).toHaveLength(3);
  });

  it("moves one cell left", () => {
    const game = play(createGame(), "up", "tick", "left", "tick");
    expect(game.snake).toEqual([
      { x: 9, y: 9 },
      { x: 10, y: 9 },
      { x: 10, y: 10 },
    ]);
  });

  it("keeps moving in its direction with no key pressed", () => {
    const game = play(createGame(), "down", "tick", "tick", "tick");
    expect(game.snake).toEqual([
      { x: 10, y: 13 },
      { x: 10, y: 12 },
      { x: 10, y: 11 },
    ]);
  });
});

/** Ticks until the status leaves `playing`, or `limit` ticks pass. */
function runUntilOver(game: Game, limit = BOARD_SIZE * 2): Game {
  for (let i = 0; i < limit && game.status === "playing"; i++) game = advance(game);
  return game;
}

/** A playing game with a hand-built snake, head first. */
function playingGame(snake: Game["snake"], direction: Direction): Game {
  return { status: "playing", snake, direction, queuedDirection: null };
}

describe("collisions", () => {
  it.each([
    ["right", { x: 19, y: 10 }],
    ["up", { x: 10, y: 0 }],
    ["down", { x: 10, y: 19 }],
  ] as const)("ends the game at the %s wall", (direction, lastHead) => {
    const game = runUntilOver(queueDirection(createGame(), direction));
    expect(game.status).toBe("game over");
    expect(game.snake[0]).toEqual(lastHead);
  });

  it("ends the game at the left wall", () => {
    const game = runUntilOver(play(createGame(), "up", "tick", "left"));
    expect(game.status).toBe("game over");
    expect(game.snake[0]).toEqual({ x: 0, y: 9 });
  });

  it("moves up to the last cell before the wall without a collision", () => {
    let game = queueDirection(createGame(), "right");
    for (let i = 0; i < 9; i++) game = advance(game);
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
    const game = advance(playingGame(snake, "down"));
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
        "down",
      ),
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
  const over = runUntilOver(queueDirection(createGame(), "right"));

  it("stops the snake: ticks do not move it", () => {
    expect(over.status).toBe("game over");
    expect(advance(advance(over))).toEqual(over);
  });

  it("ignores arrow keys", () => {
    expect(queueDirection(over, "up")).toEqual(over);
  });
});

describe("restart", () => {
  it("gives a fresh starting state after game over", () => {
    const over = runUntilOver(queueDirection(createGame(), "up"));
    expect(over.status).toBe("game over");
    expect(restart(over)).toEqual(createGame());
  });

  it("does nothing while ready or playing", () => {
    const ready = createGame();
    expect(restart(ready)).toBe(ready);
    const playing = play(createGame(), "up", "tick");
    expect(restart(playing)).toBe(playing);
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
    const game = play(createGame(), moving, "tick", reverse, "tick");
    expect(game.direction).toBe(moving);
  });

  it("ignores a 180° turn while moving left", () => {
    const game = play(createGame(), "up", "tick", "left", "tick", "right", "tick");
    expect(game.direction).toBe("left");
  });

  it("counts only the first turn in one tick: Up then Left cannot reverse a snake moving right", () => {
    const game = play(createGame(), "right", "tick", "up", "left", "tick");
    expect(game.direction).toBe("up");
    expect(game.snake[0]).toEqual({ x: 11, y: 9 });

    const next = advance(game);
    expect(next.snake[0]).toEqual({ x: 11, y: 8 });
  });

  it("accepts a new turn on the next tick", () => {
    const game = play(createGame(), "right", "tick", "up", "tick", "left", "tick");
    expect(game.direction).toBe("left");
    expect(game.snake[0]).toEqual({ x: 10, y: 9 });
  });

  it("does not let a press of the current direction use up the tick's turn", () => {
    const game = play(createGame(), "right", "tick", "right", "up", "tick");
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
