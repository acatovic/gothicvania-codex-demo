# Assets

The assets generally fall into the following structure:

```
assets/
  images/
    backgrounds/
    misc/
  tilemaps/
    tiles/
    maps/
  spritesheets/
  audio/
    sfx/
    music/
  fonts/
```

If the assets structure within `$GAME_ROOT/` directory does not follow the above then try
to infer it on your own.

## Images and Backgrounds

These are typically `.png` files and are used as-is without any extraction.
Backgrounds are typically just joined/repeated together left-to-right. There may be "far" backgrounds, and backgrounds closer to the player
(e.g. columns or walls) that are overlayed on top of the far backgrounds. These may require different scaling and parallax effects.
Backgrounds should **NOT** be joined/repeated vertically (up-down).

Misc images contain menus, pause screens, instruction screens, game over screens, etc.
Similar to backgrounds, these are used as-is, i.e. no specific extraction nor configuration is required.

## Tilemaps and Tilesets

Tilemaps consist of both `.png` files (in the `tiles/` folder) as well as corresponding JSON configuration files
(in the `maps/` folder). The JSON configuration is a map export from Tiled Map Editor. It specifies the metadata
in terms of the width and height of a level (in number of tiles), and tile size. It also provides an array of
tile placements and various properties associated with the tiles, such as whether they are collidable (e.g. whether
the player/NPCs can stand on them, or collide with them). This map should be used for level layout (superimposed on
the backgrounds) and for guiding the placement of NPCs and player movement.

- X-position
- Y-position
- Width (in pixels)
- Height (in pixels)
- Whether the tile is "collidable", i.e. whether the player, enemies and NPCs can "stand" on the tile, or
  bump into the tile
- Description specifying any other details important to consider during the game implementation


## Spritesheets

Spritesheets consist of both `.png` files as well as corresponding JSON configuration files.
The JSON configuration specifies different sprite movements/frames and their properties. The properties include:

- X-position
- Y-position
- Width (in pixels)
- Height (in pixels)

The sprite frame name identifies the type of sprite, the movement, and the sequence number. E.g. "player-jump-0" means
it's a player jump sequence, first frame.

Example:

```json
...
  "player-flying-kick-0": { "x": 328, "y": 0, "w": 82, "h": 60 },
  "player-flying-kick-1": { "x": 410, "y": 0, "w": 82, "h": 60 },
...
```

## Fonts

Use the fonts in the `assets/fonts` folder.

## Audio

Audio is split into sound effects (`sfx/` directory) and music (`music/` directory).
The sfx should be named accordingly (e.g. "hurt", "kill", "jump", etc), if not try to infer based on `DESIGN-DOCUMENT.md` or
developer instructions.
