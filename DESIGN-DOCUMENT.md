---
title: Gothicvania Codex Demo
project: gothicvania-codex
document: DESIGN-DOCUMENT.md
version: 0.1.0
status: active
last_updated: 2026-02-14
authors: Armin Catovic, GPT-5.3-Codex
---

# Gothicvania Design Specification

## Table of Contents

```
1. Purpose and Scope
2. Technical Foundation
3. Story
4. Game Composition
4.1 Main Menu
4.2 Level Composition
5. Game Mechanics
```

## 1. Purpose and Scope

This document defines the target structure and behavior of the current gothic side-scrolling combat platformer implemented in Phaser game engine.

Primary scope:
- One sandbox scene with a long horizontal level.
- A controllable melee player with jump and action states.
- Two enemy archetypes (wizard and burning ghoul) plus projectile threat.
- Layered gothic environment with explicit foreground/mid/far depth composition.
- Tile-based walkable and non-walkable foreground, including elevated reachable routes.
- Start menu / title screen as well as a pause screen; control indicators
- Action sound effects

Out of scope:
- Save system, multi-level progression, music soundtrack and narrative flow.

## 2. Technical Foundation

- Engine: Phaser
- Runtime: Single page app (`index.html`) with one Phaser game instance
- Size and Positioning: 336 x 224 pixels, centered in the middle of the screen/page
- Other: pixel graphics without antialiasing but with round pixels; game is centered in the middle of the screen
  and can be maximized to full screen - Phaser takes care of proper scaling so all the proportions remain the same

## 3. Story

Single level Castlevania-style no-narrative game where the player is a monk with nifty martial arts skills
who punches and kicks his way through gothic monsters (ghouls and flame throwing wizards). When the player reaches the
last (right-most) pixels of the level, the game is over. The player is presented with a small "Well Done" screen.

## 4. Game Composition

### 4.1 Main Menu

When the game starts, the user is presented with a title screen and slowly flashing "press enter" text below it.
In the background/behind the title screen there is a slow but smooth moving (repeated) background imagery, consisting
of the far background images and columns super-imposed. All these images should be used from the images folder.

When the user hits the ENTER key the game begins - the level is generated with all the sprites and the player
presumes control.

When the user hits ESC kep the game is paused with "PAUSED" message written in small pixel font, in the dead center
of the screen.

### 4.2 Level Composition

The level is a long level going from left to right. The player starts on the far left hand side.
There are no visible enemies until the player starts moving to the right after some time.

The level is layed out in three layers with a strong sense of depth and parallax effects:

- Far background layer that is repeating left-right
- Mid background layer with large columns superimposed on the far background layer, also repeating left-right
- Foreground layer with the tiles, the player and the enemies/NPCs

When it comes to the tiles follow the tilemap configuration and the relevant tiles png.

In the top right hand corner of the screen is the player health. There will be four pixel-graphics style red hearts
representing the player's health.

Enemies will be scattered randomly throughout the level, but at sufficient distance and always placed on top
of the collidable tiles.

## Game Mechanics

There is overall very smooth mechanics to both the player and the enemies.

The player controls are:

- W: jump
- S: crouch
- A: move left (and face left)
- D: move right (and face right)
- J: action key - it will randomly select punch or kick
- Combos: player can jump and kick

When enemies fire or attack the player, it is at slow-to-medium speed. The fireballs should be at
player's head height.

The enemies are always facing the player and attacking in his direction. If the player jumps over them, they turn
to face him.

The player should always be grounded on blocks/tiles - he should never be "floating" in mid air. If he jumps on the blocks
he should land on them properly and with conviction.

When the player jumps or attacks there should be a sfx, and similarly when he is hurt, or when an enemy is destroyed.

When the player gets hit, he will lose one of his health hearts.

When it comes to the actual collision with the player, it should be basically right into him, i.e. it shouldn't be that it's
"near him", but really it should be entering into his frame.
