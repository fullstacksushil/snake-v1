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

**Tick**:
One step of the game, every 150 ms, in which the snake moves one cell.

**Status**:
The game's phase. `ready`: waiting for the first arrow key. `playing`: the snake moves each tick.
