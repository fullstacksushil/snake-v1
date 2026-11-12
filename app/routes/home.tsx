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
  waitsForRestart,
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
  // The food is placed with Math.random, so the first game is created after
  // mount: the server and the client would place it on different cells.
  const [game, setGame] = useState<Game | null>(null);
  useEffect(() => setGame(createGame(Math.random)), []);
  const waitingForRestart = game !== null && waitsForRestart(game);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const direction = directionForKey(event.key);
      if (direction !== null) {
        event.preventDefault();
        setGame((g) => g && queueDirection(g, direction));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Enter and Space restart only at game over or a win. Cancelling their
  // default stops a focused Restart button from also getting a click or scroll.
  useEffect(() => {
    if (!waitingForRestart) return;
    function onKeyDown(event: KeyboardEvent) {
      if (!isRestartKey(event.key)) return;
      event.preventDefault();
      setGame((g) => g && restart(g, Math.random));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [waitingForRestart]);

  const playing = game?.status === "playing";
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setGame((g) => g && advance(g, Math.random)),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [playing]);

  const score = game?.score ?? 0;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="font-semibold text-gray-700 tabular-nums dark:text-gray-300">
        Score: {score}
      </p>
      <Board game={game} />
      <div
        className="flex h-10 items-center gap-4 text-gray-700 dark:text-gray-300"
        role="status"
      >
        {game?.status === "ready" && <p>Press an arrow key to start</p>}
        {waitingForRestart && (
          <>
            <p className="font-semibold">
              {game.status === "win" ? "You win!" : "Game over."} Final
              score: {score}
            </p>
            <button
              type="button"
              onClick={() => setGame((g) => g && restart(g, Math.random))}
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

/** Draws the board. With no game yet (the server render), every cell is empty. */
function Board({ game }: { game: Game | null }) {
  const head = game?.snake[0];
  const otherSegments = new Set(game?.snake.slice(1).map(cellKey));
  const food = game?.food;

  const cells = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const kind =
        head?.x === x && head?.y === y
          ? "head"
          : otherSegments.has(cellKey({ x, y }))
            ? "segment"
            : food?.x === x && food?.y === y
              ? "food"
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
  food: "rounded-full bg-red-500 dark:bg-red-400",
  empty: "bg-white dark:bg-gray-950",
} as const;
