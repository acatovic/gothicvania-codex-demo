Original prompt: Implement a single level according to the DESIGN-DOCUMENT and $game-dev skills. For now focus only on the level setup (backgrounds and tiles) and the correct player mechanics. No enemies.

## 2026-02-15

- Created a runnable Phaser SPA with centered 336x224 canvas, pixel-art settings, and scaling.
- Added a title scene with moving background/columns and Enter-to-start flow.
- Implemented one gameplay level scene with:
  - Repeating far/mid parallax backgrounds.
  - Tilemap foreground loaded from `assets/tilemaps/maps/map.json`.
  - Collision enabled from tile `collides` properties.
- Implemented player mechanics only (no enemies):
  - Move left/right (`A`/`D`) with facing direction.
  - Jump (`W`) with jump SFX.
  - Crouch (`S`) on ground.
  - Attack (`J`) randomly picks punch/kick on ground, flying kick in air, with attack SFX.
  - Combo behavior support: jump + attack triggers air kick animation.
  - Pause toggle (`ESC`) with centered `PAUSED` text.
- Added top-right heart HUD (4 hearts) and debug hooks:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Validation done:
  - `node --check main.js` passed.

### Follow-up Prompt

- Add wizard enemies with fireballs, hurt/destroy mechanisms, and game-over/restart behavior.

### Follow-up Updates

- Added wizard + fireball + enemy-death asset loading and animation setup.
- Spawned wizard enemies across the level on collidable tile surfaces.
- Implemented wizard AI casting loop:
  - Wizards face the player.
  - Wizards periodically cast and spawn head-height fireballs toward the player.
- Implemented enemy hurt/destroy flow:
  - Player attacks now damage wizards.
  - Wizards flash on hit, die at 0 HP, and play death animation + kill SFX.
- Implemented player hurt flow:
  - Fireballs and direct wizard contact damage player hearts.
  - Added invulnerability window and hurt reaction.
- Implemented full game-over flow:
  - Triggered when hearts reach 0.
  - Triggered when player falls below the level (through floating gaps).
  - Displays `GAME OVER` and `PRESS ENTER TO RESTART`.
  - ENTER restarts the level scene.
- Validation done:
  - `node --check main.js` passed.

### TODO

- Tune collision body and movement feel against full gameplay expectations after visual/interactive playtesting.
- Add remaining design elements in a later step (additional enemy archetypes, end-of-level/win state, polish pass).

### Follow-up Prompt

- Fix enemies/fighting sequence so enemies always face player direction, player hits trigger enemy death sequence, and enemy hits trigger player hurt sequence.

### Follow-up Updates

- Combat flow updates in `main.js`:
  - Enemies now consistently sync facing direction against player position every frame (`syncWizardFacing`), including overlap/tie fallback behavior.
  - Wizard health was reduced to `1` so a successful player strike immediately starts enemy death sequence/animation.
  - Player hurt handling now has an explicit hurt-sequence window (`playerHurtUntil`) so enemy/fireball impacts force hurt animation reliably.
  - Enemy overlap logic now only skips player hurt when the current overlap is a valid player hit; otherwise enemy contact damages player.
  - Player hurt now clears current attack state to ensure hurt sequence is not suppressed by attack animation state.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime checks passed for:
    - Enemy facing flip behavior when moving player from left side to right side of enemy (`wizardFlipX: true -> false`).
    - Player hit reducing active wizard count from `2` to `1` and starting death sequence sprite.
    - Enemy overlap reducing player health (`4 -> 3`) and forcing `player-hurt` animation with active hurt-sequence timer.

### Follow-up Prompt

- Fix visual scaling so player and enemies are larger and closer to reference proportions.

### Follow-up Updates

- Increased character scales in `main.js`:
  - `PLAYER_SCALE`: `0.58 -> 0.9`
  - `WIZARD_SCALE`: `0.62 -> 0.92`
- Increased wizard foot placement offset to keep enemy grounding correct with larger scale:
  - `WIZARD_FOOT_OFFSET`: `21 -> 31`
- Validation done:
  - `node --check main.js` passed.
  - Playwright screenshot captured for visual verification: `output/playwright/scale-fix-side-by-side.png`.

### Follow-up Prompt

- Enemy sprite is scaled correctly now, but still facing away from player while attacking.

### Follow-up Updates

- Corrected wizard visual facing rule in `syncWizardFacing` to match sprite authoring direction.
  - Wizards now face toward the player while still firing in the player's direction.
- Validation done:
  - `node --check main.js` passed.
  - Playwright screenshots verify both directions:
    - `output/playwright/enemy-facing-fixed-left.png`
    - `output/playwright/enemy-facing-fixed-right.png`

### Follow-up Prompt

- Hearts disappear after player death/restart; reset HUD to initial 4 hearts state on restart.

### Follow-up Updates

- Fixed heart HUD lifecycle on scene restart:
  - Reset `heartGraphics` reference at scene `create()` start so restart never reuses stale graphics instance.
  - Hardened `drawHearts()` creation guard to recreate graphics when the existing reference is not attached to the active scene.
- Validation done:
  - `node --check main.js` passed.
  - Playwright restart-cycle check confirms post-restart state includes `health: 4` and visible heart HUD:
    - `output/playwright/hearts-initial.png`
    - `output/playwright/hearts-after-restart.png`

### Follow-up Prompt

- While crouching, player should remain in crouch mode and not start kick/punch attack.

### Follow-up Updates

- Added a crouch guard in `tryStartAttack()`:
  - If player is on floor and `S` is held (`keys.down.isDown`), attack start is blocked.
  - Standing and air attacks still work as before.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime probe confirms:
    - crouch + attack does not start attack (`crouchAttackStarted: false`)
    - standing attack still starts (`standingAttackStarted: true`)

### Follow-up Prompt

- Add background soundtrack from `music/` and ensure action SFX mappings are in place.

### Follow-up Updates

- Added low-volume looping background soundtrack:
  - Loaded `assets/audio/music/ockaie_temple.ogg` as `bgm-music`.
  - Implemented `ensureBackgroundMusic(scene)` helper to:
    - create/reuse one BGM sound instance,
    - enforce looped playback and low volume (`0.16`),
    - start playback immediately when unlocked, or defer until audio unlock event.
  - Invoked BGM setup in both `TitleScene.create()` and `LevelScene.create()` to keep soundtrack active across scene transitions/restarts.
- Confirmed SFX mapping remains active:
  - `attack.ogg` on player attack,
  - `hurt.ogg` on player hurt and enemy hit flash flow,
  - `jump.ogg` on jump,
  - `kill.ogg` on enemy death.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime checks confirm:
    - BGM asset is cached and instantiated,
    - BGM starts playing after audio unlock (`soundLocked: false`, `bgmPlaying: true`, `bgmConfigVolume: 0.16`),
    - SFX sound objects exist in-level (`attack/hurt/jump/kill`).

### Follow-up Prompt

- Player still kicks when crouching; crouch input should fully suppress kick/punch.

### Follow-up Updates

- Strengthened crouch priority in `updatePlayerState()`:
  - Crouch state is computed before attack input handling.
  - Attack input is ignored while crouch is held on floor.
  - Jump input is also ignored while crouch is held on floor.
  - If crouch becomes active while a grounded attack is active, grounded attack state is cleared so crouch animation takes over immediately.
- Hardened BGM helper:
  - `ensureBackgroundMusic(scene)` now checks cache existence for `bgm-music` before trying to create the sound object, avoiding edge-case runtime errors when scenes are forced early in test harnesses.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime checks confirm crouch blocks attack start (`crouchTry1/2.attacking: false`) while standing attack path remains available (`standTry.attacking: true`).

### Follow-up Prompt

- Crouch should be strict: player should only crouch, no kick/attack while `S` is held.

### Follow-up Updates

- Enforced strict crouch behavior:
  - `tryStartAttack()` now immediately exits whenever `S` is held (not only while grounded).
  - `updatePlayerState()` now treats `S` as a high-priority input modifier:
    - blocks attack input processing while held,
    - blocks jump input processing while held,
    - clears any active attack state while held.
- Validation done:
  - `node --check main.js` passed.
  - Playwright key-input verification confirms while holding `S`, pressing `J` repeatedly keeps:
    - `crouching: true`
    - `attacking: false`
    - `attackKind: null`

### Follow-up Prompt

- Add a ghoul enemy that runs back and forth on an elevated platform.

### Follow-up Updates

- Added burning ghoul enemy support:
  - Loaded `burning-ghoul` spritesheet + JSON frame map.
  - Added `ghoul-run` animation from `burning-ghoul-run1-*` frames.
  - Added ghoul constants for frame sizing, scale, foot offset, and patrol speed.
- Added ghoul spawn/patrol behavior:
  - New `spawnGhouls()` spawns one ghoul on elevated platform tile range (`x` tiles `37..44`).
  - New `updateGhouls()` applies left-right patrol within fixed bounds and flips sprite by movement direction.
- Integrated ghoul into gameplay systems:
  - Added physics group + ground collider.
  - Added player overlap damage handling (same hurt flow as other enemies).
  - Added player attack hit processing for ghouls (same kill/death-sequence flow).
  - Added ghoul count to debug state under `enemies.ghoulsAlive`.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime confirms one active ghoul and patrol direction/position changes inside patrol bounds (`602..710`).
  - Visual check screenshot: `output/playwright/ghoul-visible-platform.png`.

### Follow-up Prompt

- Player sprite JSON was updated to remove crouch-kick behavior; update game logic to follow available player animations.

### Follow-up Updates

- Made player animation/attack logic JSON-driven:
  - Added prefix availability detection (`hasFramesForPrefix`) and `playerCapabilities` map in `createAnimations()`.
  - Player-only animations (`crouch`, `punch`, `kick`, `flying-kick`, `hurt`) are now created only if matching frame prefixes exist.
  - Animation creation now skips empty frame sequences safely.
- Updated attack logic to use available animations only:
  - Air attack only starts if `player-flying-kick-*` frames exist.
  - Ground attack candidate list is built from available `punch`/`kick` animations; if none exist, no attack starts.
- Added safe fallbacks in movement/hurt animation selection:
  - Crouch falls back to idle if crouch frames are missing.
  - Hurt animation playback is guarded by `playerCapabilities.hurt`; otherwise falls back to idle/no forced hurt anim.
- Kept strict crouch behavior:
  - Holding `S` still blocks attack start.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime confirms capability detection and expected behavior (`crouchAttack.active: false`, standing attack still available when supported).

### Follow-up Prompt

- Ghoul appears to run backwards; it should face movement direction while patrolling.

### Follow-up Updates

- Corrected ghoul facing rule to match sprite authoring direction:
  - Set initial ghoul flip to right-facing for initial rightward patrol.
  - In patrol update, ghoul now flips when moving right (and unflips when moving left).
- Validation done:
  - `node --check main.js` passed.
  - Playwright patrol probe confirms facing alignment with patrol direction (`dir: 1 -> flipX: true`, `dir: -1 -> flipX: false`).
  - Visual check screenshot: `output/playwright/ghoul-facing-fixed.png`.

### Follow-up Prompt

- Ghoul should follow player farther instead of turning around early, but still avoid falling off cliffs.

### Follow-up Updates

- Replaced fixed-bounds ghoul patrol with chase behavior:
  - Removed hard patrol-left/right clamps from ghoul update logic.
  - Ghoul now chooses movement direction based on player position each frame.
- Added cliff/wall safety checks:
  - New `canGhoulMoveDirection(ghoul, direction)` tile probes prevent stepping into walls or walking into no-ground-ahead gaps.
  - If desired chase direction is unsafe, ghoul picks a safe fallback direction or stops.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime probe shows ghoul moving beyond old right bound (~710) toward player (`x` progressed into 730+ / 780+) while staying on-platform (`y` stable).
  - Visual check screenshot: `output/playwright/ghoul-chase-cliff-safe.png`.

### Follow-up Prompt

- Ghoul AI is jittering/spinning left-right in place.

### Follow-up Updates

- Stabilized ghoul chase turning:
  - Added chase deadzone (`GHOUL_CHASE_DEADZONE`) so tiny x-offsets do not force constant turn attempts.
  - Added turn cooldown (`GHOUL_TURN_COOLDOWN_MS`) so ghoul cannot flip direction every frame.
  - Updated chase selection to prefer safe desired turns, otherwise keep current direction, reverse only when blocked, or stop if neither side is safe.
- Refined movement safety probes:
  - Wall probe now uses body center height (reduces false positive wall hits near floor).
  - Ground-ahead probe slightly below feet to detect cliffs reliably.
  - Airborne ghouls do not get forced-stop by ground probe during transient physics steps.
- Validation done:
  - `node --check main.js` passed.
  - Playwright direction sampling over multiple ticks showed `flips: 1` (initial correction only), then stable movement direction instead of frame-to-frame spinning.
  - Visual check screenshot: `output/playwright/ghoul-spin-fix.png`.

### Follow-up Prompt

- Ghoul is floating in air after chase behavior changes.

### Follow-up Updates

- Fixed enemy gravity + airborne steering:
  - Added gravity to wizard and ghoul bodies (`setGravityY(PLAYER_GRAVITY)`), matching player/world feel.
  - In `updateGhouls()`, ghoul no longer applies horizontal chase steering while airborne; it waits to re-ground first.
  - Removed permissive airborne branch in `canGhoulMoveDirection()` that previously allowed in-air movement decisions.
- Validation done:
  - `node --check main.js` passed.
  - Playwright runtime sampling reported `floatingSamples: 0` (no airborne + zero-vertical-velocity float state).
  - Visual check screenshot: `output/playwright/ghoul-no-floating-fix.png`.

### Follow-up Prompt

- Ghoul is still flipping left-right when player approaches; make him patrol his platform edges instead of reacting to player proximity.

### Follow-up Updates

- Reworked ghoul AI to be edge-patrol driven (not player-chase driven):
  - Removed player-direction influence from `updateGhouls()`.
  - Ghouls now patrol between explicit platform bounds and only reverse at bounds or blocked/cliff checks.
- Updated ghoul spawn behavior on the elevated platform:
  - Spawn is now near the right side of the patrol lane.
  - Initial patrol direction is leftward so it approaches an edge first.
  - Stored per-ghoul patrol bounds (`patrolLeftX`, `patrolRightX`) for deterministic turning.
- Kept grounded movement guard so ghoul does not steer while airborne.

### Validation

- `node --check main.js` passed.
- Playwright runtime probe (with player positioned near ghoul) showed bounded patrol and non-jitter movement:
  - Ghoul X stayed within patrol range (`604..708` bounds, sampled `610.17..705.87`).
  - Direction changes matched edge turns rather than rapid proximity-based flipping.
- Screenshots captured:
  - `output/playwright/ghoul-edge-patrol.png`
  - `output/playwright/ghoul-edge-patrol-focus.png`

### Follow-up Prompt

- Ghoul patrol is still constrained to a too-short local segment; it should patrol to the true right edge of the walkable platform before turning.

### Follow-up Updates

- Removed hardcoded ghoul patrol tile bounds and switched to map-derived bounds:
  - Added `findSolidSpanAtTileRow(seedTileX, tileY)` to compute the full contiguous collidable tile span for the ghoul's platform.
  - `spawnGhouls()` now derives `patrolLeftX` / `patrolRightX` from that full span instead of fixed `[37..44]`.
- Updated initial ghoul behavior:
  - Spawn point is now set toward the right side of the full platform span (`72%` across).
  - Initial movement direction is rightward so it runs to the real right edge first, then turns back.

### Validation

- `node --check main.js` passed.
- Tilemap probe confirmed platform span from seed tile `43` is `37..65`.
- Playwright runtime sample confirmed extended patrol range:
  - Patrol bounds: `left=604`, `right=1044`
  - Observed sampled movement range: `minX=661.73`, `maxX=1038.73`
  - Direction switched only at edge turn points (no jitter flipping).
- Screenshot captured: `output/playwright/ghoul-right-edge-patrol-clean.png`.

### Follow-up Prompt

- Player should not bounce when jump reaches top of map/screen; jump should complete naturally unless collidable tiles are overhead.

### Follow-up Updates

- Fixed world-bound jump behavior for the player:
  - Added `this.physics.world.setBoundsCollision(true, true, false, true)` so the world top boundary does not block/reflect bodies.
  - Changed player world-bound setup from `setCollideWorldBounds(true, true, true, false)` to `setCollideWorldBounds(true)` to remove unintended bounce coefficients.
- Result:
  - No top-bound bounce/reflection at screen/map top.
  - Ground/side bounds still active.
  - Tile collisions remain active via `this.physics.add.collider(this.player, this.groundLayer)`.

### Validation

- `node --check main.js` passed.
- Playwright probe (forced upward velocity near top) showed:
  - `minY = -18.31`
  - no top collision flags (`blocked.up`/`touching.up` stayed false)
  - jump apex and descent followed gravity (no bounce impulse).

### Follow-up Prompt

- Create a small icon at `/favicon.ico`.

### Follow-up Updates

- Added root `favicon.ico` (32x32) generated from the fireball sprite for a crisp pixel-art browser tab icon.
- Added explicit favicon link tag in `index.html`:
  - `<link rel="icon" href="favicon.ico" type="image/x-icon" />`

### Validation

- `favicon.ico` exists and is a valid icon resource (`32x32`, `32bpp`).
- Browser requests to `/favicon.ico` now resolve to a real file instead of 404.
