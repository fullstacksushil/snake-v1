import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import {
  BOARD_SIZE,
  TICK_MS,
  advance,
  createGame,
  directionForKey,
  isRestartKey,
  queueDirection,
  restart,
  type Cell,
  type Game,
} from "~/modules/game";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Snake" },
    { name: "description", content: "Steer the snake with the arrow keys." },
  ];
}

export default function Home() {
  const [game, setGame] = useState(createGame);
  const over = game.status === "game over";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const direction = directionForKey(event.key);
      if (direction !== null) {
        event.preventDefault();
        setGame((g) => queueDirection(g, direction));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Enter and Space restart only at game over. Cancelling their default
  // stops a focused Restart button from also getting a click or scroll.
  useEffect(() => {
    if (!over) return;
    function onKeyDown(event: KeyboardEvent) {
      if (!isRestartKey(event.key)) return;
      event.preventDefault();
      setGame(restart);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [over]);

  const playing = game.status === "playing";
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setGame(advance), TICK_MS);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Board game={game} />
      <div
        className="flex h-10 items-center gap-4 text-gray-700 dark:text-gray-300"
        role="status"
      >
        {game.status === "ready" && <p>Press an arrow key to start</p>}
        {over && (
          <>
            <p className="font-semibold">Game over</p>
            <button
              type="button"
              onClick={() => setGame(restart)}
              className="rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-gray-950 dark:hover:bg-emerald-400"
            >
              Restart
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function Board({ game }: { game: Game }) {
  const head = game.snake[0];
  const otherSegments = new Set(game.snake.slice(1).map(cellKey));

  const cells = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const kind =
        head.x === x && head.y === y
          ? "head"
          : otherSegments.has(cellKey({ x, y }))
            ? "segment"
            : "empty";
      cells.push(
        <div
          key={cellKey({ x, y })}
          data-cell={kind}
          className={CELL_CLASS[kind]}
        />,
      );
    }
  }

  return (
    <div
      aria-label="Board"
      className="grid aspect-square w-[min(90vw,80vh)] gap-px rounded border border-gray-300 bg-gray-200 p-px dark:border-gray-700 dark:bg-gray-800"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  );
}

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

const CELL_CLASS = {
  head: "rounded-sm bg-emerald-700 dark:bg-emerald-400",
  segment: "rounded-sm bg-emerald-500 dark:bg-emerald-600",
  empty: "bg-white dark:bg-gray-950",
} as const;
