# Workflow

Build a game in small steps and validate every change. Treat each iteration as: implement -> act -> pause -> observe -> adjust.

Keep referring to `$GAME_ROOT/DESIGN-DOCUMENT.md` since this specifies the implementation details, the story, the logic, and the overall
look and feel of the game.

Initialize and keep up to date a development log inside `$GAME_ROOT/PROGRESS.md`; this should contain what works, what doesn't, TODOs, and key
implementation decisions.

The general workflow sequence should be as follows:

1. **Read the DESIGN-DOCUMENT.md.**. Understand what the game is trying to achieve and ensure the current implementation adheres to the design spec.
2. **Pick a goal.** Define a single feature or behavior to implement.
3. **Implement small.** Make the smallest change that moves the game forward.
4. **Udate PROGRESS.md.** If `PROGRESS.md` exists, read it first and confirm the original user prompt is recorded at the top (prefix with `Original prompt:`). Also note any TODOs and suggestions left by the previous agent. If missing, create it and write `Original prompt: <prompt>` at the top before appending updates.
5. **Dry-run the game loop.** Use any necessary tools to run or simulate the game loop with the latest implementation changes.
6. **Inspect state.** Capture the state (logs, screenshots, outputs) during the dry-run.
7. **Verify controls and state (multi-step focus).** Exhaustively exercise all important interactions. For each, think through the full multi-step sequence it implies (cause → intermediate states → outcome) and verify the entire chain works end-to-end. If anything is off, fix and rerun. Examples of important interactions: move, jump, shoot/attack, interact/use, select/confirm/cancel in menus, pause/resume, restart, and any special abilities or puzzle actions defined by the request. Multi-step examples: shooting an enemy should reduce its health; when health reaches 0 it should disappear and update the score; collecting a key should unlock a door and allow level progression.
8. **Check errors.** Review console errors and fix the first new issue before continuing.
9. **Reset between scenarios.** Avoid cross-test state when validating distinct features.
10. **Iterate with small deltas.** Change one variable at a time (frames, inputs, timing, positions), then repeat steps 3-9 until stable.
