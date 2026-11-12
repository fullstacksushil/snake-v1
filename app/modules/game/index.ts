export {
  BOARD_SIZE,
  TICK_MS,
  advance,
  cellKey,
  createGame,
  directionForKey,
  isRestartKey,
  placeFood,
  queueDirection,
  restart,
  sameCell,
  waitsForRestart,
} from "./game";
export type { Cell, Direction, Game, Random, Status } from "./game";
