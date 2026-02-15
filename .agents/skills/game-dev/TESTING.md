# Testing / Running

3) Run the game locally
- Start a local web server from the project root:
  python3 -m http.server 8000
- Game URL:
  http://127.0.0.1:8000

4) Open a Playwright browser session
- Use a named session so you can run multiple commands against the same browser:
  npx playwright-cli -s=gothic open http://127.0.0.1:8000 --headed

5) Basic game-loop test flow
- Capture a screenshot:
  npx playwright-cli -s=gothic screenshot --filename output/playwright/smoke-1.png
- Press keys for menu/game start:
  npx playwright-cli -s=gothic press Enter
  npx playwright-cli -s=gothic press Enter
- Check in-game state text hook:
  npx playwright-cli -s=gothic eval "() => window.render_game_to_text()"
- Move player for a short interval:
  npx playwright-cli -s=gothic keydown d
  npx playwright-cli -s=gothic eval "async () => { await new Promise((r) => setTimeout(r, 600)); return window.render_game_to_text(); }"
  npx playwright-cli -s=gothic keyup d
- Test jump / attacks:
  npx playwright-cli -s=gothic press w
  npx playwright-cli -s=gothic press j
  npx playwright-cli -s=gothic press k
- Capture another screenshot:
  npx playwright-cli -s=gothic screenshot --filename output/playwright/smoke-2.png

6) Useful checks for this project
- Current scene + status:
  npx playwright-cli -s=gothic eval "() => window.render_game_to_text()"
- Pause/resume:
  npx playwright-cli -s=gothic press Escape
  npx playwright-cli -s=gothic press Escape
- Force a scripted probe:
  npx playwright-cli -s=gothic run-code "(async (page) => { return await page.evaluate(() => window.render_game_to_text()); })"

7) Clean up
- Close Playwright session:
  npx playwright-cli -s=gothic close
- Stop local server (Ctrl+C in server terminal)

Notes
- Keep screenshots under:
  output/playwright/
- If element refs become stale, run:
  npx playwright-cli -s=gothic snapshot
- If a browser session is stuck:
  npx playwright-cli kill-all

## Test Checklist

Test any new features added for the request and any areas your logic changes could affect.
Identify issues, fix them, and re-run the tests to confirm they’re resolved.

Examples of things to test:

- Primary movement/interaction inputs (e.g., move, jump, shoot, confirm/select).
- Win/lose or success/fail transitions.
- Score/health/resource changes.
- Boundary conditions (collisions, walls, screen edges).
- Menu/pause/start flow if present.
- Any special actions tied to the request (powerups, combos, abilities, puzzles, timers).
