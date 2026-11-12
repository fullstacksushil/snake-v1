# Snake v1

A browser Snake game for one player: steer the snake with the arrow keys, eat food, grow, and avoid the walls and your own body.

## Language

**Board**:
The 20×20 grid of cells the game is played on. Its edges are walls.
_Avoid_: Map, field, arena

**Cell**:
One square of the board. A cell is empty, part of the snake, or holds the food.
_Avoid_: Tile, square

**Snake**:
The player's line of segments that moves across the board.
_Avoid_: Worm, player

**Segment**:
One cell of the snake.
_Avoid_: Block, piece

**Head**:
The first segment of the snake. Only the head can eat food or collide.

**Direction**:
Where the snake moves on each tick: up, down, left or right.
_Avoid_: Heading, velocity

**Turn**:
A change of the snake's direction. At most one turn counts per tick, and a turn that reverses the snake 180° is ignored.

**Tick**:
One step of the game, every 150 ms, in which the snake moves one cell.
_Avoid_: Frame, step

**Status**:
The game's phase. `ready`: waiting for the first arrow key. `playing`: the snake moves each tick. `game over`: a collision ended the game. `win`: the snake fills the board.

**Collision**:
The head moving past an edge of the board or into one of the snake's own segments. Moving into the cell the tail leaves on the same tick is not a collision, unless the snake eats on that tick: then the tail stays.
_Avoid_: Crash, death

**Food**:
The one item on an empty cell of the board. When the head reaches it the snake eats it: the snake grows by one segment, the score goes up by one and new food appears on a random empty cell.
_Avoid_: Apple, fruit, pellet

**Score**:
The number of food items eaten in the current game.
_Avoid_: Points

**Win**:
The status when the snake fills every cell, so no food can be placed. The snake stops and the game waits for a restart.
_Avoid_: Victory, clear

**Game over**:
The status after a collision. The snake stops and the game waits for a restart.
_Avoid_: Loss, dead

**Restart**:
Starting a fresh game from game over or a win, with the Restart button, Enter or Space. The new game is `ready`, with a new snake, new food and a score of 0.
_Avoid_: Reset, replay

**Game**:
One round of Snake: the snake, its direction, the food, the score and the status.
