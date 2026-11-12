export {
  BOARD_SIZE,
  TICK_MS,
  advance,
  createGame,
  directionForKey,
  isRestartKey,
  placeFood,
  queueDirection,
  restart,
  waitsForRestart,
} from "./game";
export type { Cell, Direction, Game, Random, Status } from "./game";
