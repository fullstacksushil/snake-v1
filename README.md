# Snake

A browser Snake game for one player. Steer the snake around a 20×20 board. Each time the head reaches the food, the snake eats it, grows by one segment and the score goes up by one. A collision with a wall or with the snake's own body ends the game. If the snake fills the whole board, you win.

[`GLOSSARY.md`](GLOSSARY.md) defines every game term: board, cell, snake, segment, head, direction, turn, tick, status, collision, food, score, win, game over and restart.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Start the game, then steer the snake. A turn that would reverse the snake is ignored. |
| Enter or Space | Restart after game over or a win. |
| Restart button | Restart after game over or a win. |

The snake moves one cell every tick (150 ms).

## Commands

Install the dependencies first:

```bash
npm install
```

`npm install` also points git at `.githooks/`, so the pre-commit hook runs `npm run check` before every commit.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with hot reload at `http://localhost:5173`. |
| `npm run build` | Builds the app for production into `build/`. |
| `npm run start` | Serves the production build from `build/server/index.js`. |
| `npm run typecheck` | Generates the React Router route types, then runs `tsc`. |
| `npm run test` | Runs the Vitest tests once. |
| `npm run check` | Runs `typecheck`, then `test`. The pre-commit hook and CI run it. |

CI runs `npm run check` and `npm run build` on every pull request.

## Layout

```text
app/
├── modules/game/      # the game rules
│   ├── game.ts        # board, snake, ticks, collisions, food, score, status
│   ├── game.test.ts
│   └── index.ts       # the module's public API: import from "~/modules/game"
├── routes/home.tsx    # the UI: draws the board, reads the keys, runs the ticks
├── root.tsx
└── routes.ts
```

The game rules live in `app/modules/game` and the route only calls them. Routes and tests import through the public API in `index.ts` (`~/modules/game`), never from `game.ts` directly.

## Docker

The `Dockerfile` builds the app and serves it on port 3000:

```bash
docker build -t snake .
docker run -p 3000:3000 snake
```

## Contributing

- [`AGENTS.md`](AGENTS.md): the checks to run before a change is complete, and where things are.
- [`GLOSSARY.md`](GLOSSARY.md): the names to use for game concepts in code, UI text and tests.
- [`CODING_STANDARDS.md`](CODING_STANDARDS.md): review rules that no check enforces.

This repository is worked on by a software factory of agents. Labelling a GitHub issue `agent:explore` or `agent:implement`, or a pull request `agent:review`, starts an agent run. Each run's script and prompt live in `.sandcastle/agent-workflows/`. The label triggers and the `sf` CLI that drives the flow live outside this repository. A human merges every pull request. [`AGENTS.md`](AGENTS.md) describes the flow.
