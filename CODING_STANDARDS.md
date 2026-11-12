# Coding standards

<!--
Only rules that no automated check can enforce. /code-review reads this file.
Add a rule when the same review comment appears twice. Delete a rule once a check enforces it.

## Rule as an instruction

Why it matters, in two or three lines, with a short example.
-->

## Import game helpers from `~/modules/game`

Routes and tests import cell helpers such as `cellKey` and `sameCell` from the game module. A helper a route or test needs that the module lacks gets added to the module and exported. Reviews of PR #5 and PR #7 both found a route with its own copy of `cellKey`.

## Build test fixtures a real game can reach

A hand-built `Game` in a test matches the game's own invariants: `direction` agrees with the neck, food sits on an empty cell. A fixture the game can never produce tests a rule no player meets. When a test must guard a state real play cannot reach, its name says so.
