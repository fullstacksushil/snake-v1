# Snake v1

<!-- One sentence: what the product does and who for. -->

## Language

<!--
One entry per concept. Say what the term means, not how the code does it.
Take terms from the words your users use. Put rejected synonyms under _Avoid_.

**Term**:
Definition in one or two sentences.
_Avoid_: Synonym, Other synonym
-->

**Board**:
The 20×20 grid of cells the game is played on.

**Cell**:
One square of the board.

**Snake**:
The player's line of segments that moves across the board.
_Avoid_: Worm, player

**Segment**:
One cell of the snake. The first segment is the head.

**Direction**:
Where the snake moves on each tick: up, down, left or right.

**Turn**:
A change of the snake's direction. At most one turn counts per tick, and a turn that reverses the snake 180° is ignored.

**Tick**:
One step of the game, every 150 ms, in which the snake moves one cell.

**Status**:
The game's phase. `ready`: waiting for the first arrow key. `playing`: the snake moves each tick. `game over`: a collision ended the game. `win`: the snake fills the board.

**Collision**:
The head moving past an edge of the board or into one of the snake's own segments. Moving into the cell the tail leaves on the same tick is not a collision, unless the snake eats on that tick: then the tail stays.

**Food**:
The one item on an empty cell of the board. When the head reaches it the snake eats it: the snake grows by one segment, the score goes up by one and new food appears on a random empty cell.

**Score**:
The number of food items eaten in the current game.

**Win**:
The status when the snake fills every cell, so no food can be placed. The snake stops and the game waits for a restart.

**Game over**:
The status after a collision. The snake stops and the game waits for a restart.

**Restart**:
Starting a fresh game from game over or a win, with the Restart button, Enter or Space. The new game is `ready`, with a new snake, new food and a score of 0.

**Game**:
One round of Snake: the snake, its direction, the food, the score and the status.
