const GAME_WIDTH = 336;
const GAME_HEIGHT = 224;

const PLAYER_FRAME_WIDTH = 82;
const PLAYER_FRAME_HEIGHT = 60;
const PLAYER_FRAME_COLUMNS = 13;
const PLAYER_SCALE = 0.9;
const PLAYER_MOVE_SPEED = 130;
const PLAYER_JUMP_SPEED = -370;
const PLAYER_GRAVITY = 980;
const PLAYER_INVULNERABLE_MS = 900;
const PLAYER_HURT_SEQUENCE_MS = 280;
const CONTROLS_TEXT = "Movement: W/A/S/D or Arrow Keys\nAction: J or SPACE";
const DEBUG_CONTROLS_TEXT = "W/UP jump, S/DOWN crouch, A/D or LEFT/RIGHT move, J/SPACE attack, ESC pause, ENTER restart on game over";
const LEVEL_COMPLETE_TRIGGER_PADDING = 42;
const LEVEL_COMPLETE_WALK_SPEED = 92;
const LEVEL_COMPLETE_OFFSCREEN_PADDING = 28;
const BGM_VOLUME = 0.16;

const WIZARD_FRAME_WIDTH = 81;
const WIZARD_FRAME_HEIGHT = 66;
const WIZARD_FRAME_COLUMNS = 15;
const WIZARD_SCALE = 0.92;
const WIZARD_FOOT_OFFSET = 31;

const GHOUL_FRAME_WIDTH = 57;
const GHOUL_FRAME_HEIGHT = 60;
const GHOUL_FRAME_COLUMNS = 16;
const GHOUL_SCALE = 0.95;
const GHOUL_FOOT_OFFSET = 28;
const GHOUL_MOVE_SPEED = 58;
const GHOUL_TURN_COOLDOWN_MS = 180;

const FIREBALL_FRAME_WIDTH = 26;
const FIREBALL_FRAME_HEIGHT = 26;
const FIREBALL_FRAME_COLUMNS = 3;
const FIREBALL_SCALE = 0.75;
const FIREBALL_SPEED = 150;

const ENEMY_DEATH_FRAME_WIDTH = 81;
const ENEMY_DEATH_FRAME_HEIGHT = 66;
const ENEMY_DEATH_FRAME_COLUMNS = 9;

window.__gothicvaniaState = {
  scene: "boot",
};

window.render_game_to_text = () => JSON.stringify(window.__gothicvaniaState, null, 2);
window.advanceTime = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function parseFrameIndexMap(frameConfig, frameWidth, frameHeight, columns) {
  const mapping = {};
  Object.entries(frameConfig).forEach(([name, frame]) => {
    const frameX = Math.floor(frame.x / frameWidth);
    const frameY = Math.floor(frame.y / frameHeight);
    mapping[name] = frameY * columns + frameX;
  });
  return mapping;
}

function animationFramesForPrefix(frameIndexMap, prefix, textureKey) {
  return Object.keys(frameIndexMap)
    .filter((name) => name.startsWith(prefix))
    .sort((left, right) => {
      const leftNum = Number(left.split("-").pop());
      const rightNum = Number(right.split("-").pop());
      return leftNum - rightNum;
    })
    .map((name) => ({ key: textureKey, frame: frameIndexMap[name] }));
}

function hasFramesForPrefix(frameIndexMap, prefix) {
  return Object.keys(frameIndexMap).some((name) => name.startsWith(prefix));
}

function ensureBackgroundMusic(scene) {
  if (!scene.cache.audio.exists("bgm-music")) {
    return;
  }

  const playbackConfig = { loop: true, volume: BGM_VOLUME };
  let bgm = scene.sound.get("bgm-music");
  if (!bgm) {
    bgm = scene.sound.add("bgm-music", playbackConfig);
  } else {
    bgm.setLoop(true);
    bgm.setVolume(BGM_VOLUME);
  }

  if (scene.sound.locked) {
    scene.sound.once("unlocked", () => {
      if (!bgm.isPlaying) {
        bgm.play(playbackConfig);
      }
    });
    return;
  }

  if (!bgm.isPlaying) {
    bgm.play(playbackConfig);
  }
}

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("background", "assets/images/backgrounds/background.png");
    this.load.image("columns", "assets/images/backgrounds/columns.png");
    this.load.image("title", "assets/images/misc/title-screen.png");
    this.load.image("press-enter", "assets/images/misc/press-enter-text.png");
    this.load.image("tileset", "assets/tilemaps/tiles/tileset.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/maps/map.json");

    this.load.spritesheet("player", "assets/spritesheets/player.png", {
      frameWidth: PLAYER_FRAME_WIDTH,
      frameHeight: PLAYER_FRAME_HEIGHT,
    });
    this.load.spritesheet("wizard", "assets/spritesheets/wizard.png", {
      frameWidth: WIZARD_FRAME_WIDTH,
      frameHeight: WIZARD_FRAME_HEIGHT,
    });
    this.load.spritesheet("burning-ghoul", "assets/spritesheets/burning-ghoul.png", {
      frameWidth: GHOUL_FRAME_WIDTH,
      frameHeight: GHOUL_FRAME_HEIGHT,
    });
    this.load.spritesheet("fireball", "assets/spritesheets/fireball.png", {
      frameWidth: FIREBALL_FRAME_WIDTH,
      frameHeight: FIREBALL_FRAME_HEIGHT,
    });
    this.load.spritesheet("enemy-death", "assets/spritesheets/enemy-death.png", {
      frameWidth: ENEMY_DEATH_FRAME_WIDTH,
      frameHeight: ENEMY_DEATH_FRAME_HEIGHT,
    });

    this.load.json("player-frames", "assets/spritesheets/player.json");
    this.load.json("wizard-frames", "assets/spritesheets/wizard.json");
    this.load.json("burning-ghoul-frames", "assets/spritesheets/burning-ghoul.json");
    this.load.json("fireball-frames", "assets/spritesheets/fireball.json");
    this.load.json("enemy-death-frames", "assets/spritesheets/enemy-death.json");

    this.load.audio("jump-sfx", "assets/audio/sfx/jump.ogg");
    this.load.audio("attack-sfx", "assets/audio/sfx/attack.ogg");
    this.load.audio("hurt-sfx", "assets/audio/sfx/hurt.ogg");
    this.load.audio("kill-sfx", "assets/audio/sfx/kill.ogg");
    this.load.audio("bgm-music", "assets/audio/music/ockaie_temple.ogg");
  }

  create() {
    this.scene.start("TitleScene");
  }
}

class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    ensureBackgroundMusic(this);

    this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "background").setOrigin(0, 0).setScrollFactor(0);
    this.columns = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "columns")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setAlpha(0.9);

    this.add.image(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.36, "title");
    this.pressEnter = this.add.image(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.76, "press-enter");
    this.instructionsText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.9, CONTROLS_TEXT, {
        fontFamily: "Pixuf, monospace",
        fontSize: "8px",
        color: "#f0f0f0",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);
    this.tweens.add({
      targets: this.pressEnter,
      alpha: 0.2,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.timeSinceStart = 0;
  }

  update(_, delta) {
    this.timeSinceStart += delta;
    this.background.tilePositionX = this.timeSinceStart * 0.025;
    this.columns.tilePositionX = this.timeSinceStart * 0.06;

    if (Phaser.Input.Keyboard.JustDown(this.enter)) {
      this.scene.start("LevelScene");
    }

    window.__gothicvaniaState = {
      scene: "title",
      waitingForStart: true,
    };
  }
}

class LevelScene extends Phaser.Scene {
  constructor() {
    super("LevelScene");
  }

  create() {
    ensureBackgroundMusic(this);

    this.isPaused = false;
    this.gameOver = false;
    this.levelComplete = false;
    this.levelCompleteScreenShown = false;
    this.health = 4;
    this.lastFacing = 1;
    this.playerInvulnerableUntil = 0;
    this.playerHurtUntil = 0;
    this.nextEnemyId = 1;
    this.heartGraphics = null;

    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("tileset", "tileset");

    this.farBackground = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "background")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-30);
    this.midBackground = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "columns")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-20)
      .setAlpha(0.95);

    this.groundLayer = this.map.createLayer("Tile Layer 1", tileset, 0, 0).setDepth(0);
    this.groundLayer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 320);
    this.physics.world.setBoundsCollision(true, true, false, true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.roundPixels = true;

    this.createAnimations();

    this.player = this.physics.add.sprite(40, 40, "player", this.playerFrameMap["player-idle-0"]);
    this.player.setScale(PLAYER_SCALE);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(26, 52);
    this.player.body.setOffset(29, 7);
    this.player.body.setGravityY(PLAYER_GRAVITY);
    this.player.anims.play("player-idle");

    this.physics.add.collider(this.player, this.groundLayer);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.05);

    this.keys = this.input.keyboard.addKeys({
      leftA: Phaser.Input.Keyboard.KeyCodes.A,
      rightD: Phaser.Input.Keyboard.KeyCodes.D,
      upW: Phaser.Input.Keyboard.KeyCodes.W,
      downS: Phaser.Input.Keyboard.KeyCodes.S,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
      attackJ: Phaser.Input.Keyboard.KeyCodes.J,
      attackSpace: Phaser.Input.Keyboard.KeyCodes.SPACE,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC,
      restart: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.togglePause();
    });

    this.attackState = {
      active: false,
      kind: null,
      expiresAt: 0,
      hitEnemyIds: new Set(),
    };

    this.player.on("animationcomplete", (animation) => {
      if (
        animation.key === "player-punch" ||
        animation.key === "player-kick" ||
        animation.key === "player-flying-kick"
      ) {
        this.clearAttackState();
      }
    });

    this.jumpSfx = this.sound.add("jump-sfx", { volume: 0.35 });
    this.attackSfx = this.sound.add("attack-sfx", { volume: 0.4 });
    this.hurtSfx = this.sound.add("hurt-sfx", { volume: 0.45 });
    this.killSfx = this.sound.add("kill-sfx", { volume: 0.45 });

    this.wizards = this.physics.add.group({ allowGravity: true });
    this.ghouls = this.physics.add.group({ allowGravity: true });
    this.fireballs = this.physics.add.group({ allowGravity: false, maxSize: 48 });

    this.spawnWizards();
    this.spawnGhouls();

    this.physics.add.collider(this.wizards, this.groundLayer);
    this.physics.add.collider(this.ghouls, this.groundLayer);
    this.physics.add.collider(this.fireballs, this.groundLayer, (fireball) => {
      this.recycleFireball(fireball);
    });
    this.physics.add.overlap(this.player, this.wizards, (_, wizard) => {
      this.onPlayerEnemyOverlap(wizard);
    });
    this.physics.add.overlap(this.player, this.ghouls, (_, ghoul) => {
      this.onPlayerEnemyOverlap(ghoul);
    });
    this.physics.add.overlap(this.player, this.fireballs, (_, fireball) => {
      this.onFireballHitsPlayer(fireball);
    });

    this.pauseText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, "PAUSED", {
        fontFamily: "Pixuf, monospace",
        fontSize: "16px",
        color: "#f0f0f0",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30)
      .setVisible(false);
    this.pauseInstructionsText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.62, CONTROLS_TEXT, {
        fontFamily: "Pixuf, monospace",
        fontSize: "8px",
        color: "#f0f0f0",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30)
      .setVisible(false);

    this.gameOverText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.45, "GAME OVER", {
        fontFamily: "Pixuf, monospace",
        fontSize: "18px",
        color: "#f5f5f5",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false);

    this.levelCompleteText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.43, "Congratulations!\nLevel Complete", {
        fontFamily: "Pixuf, monospace",
        fontSize: "16px",
        color: "#f5f5f5",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false);

    this.levelCompleteRestartText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.62, "PRESS ENTER TO RESTART", {
        fontFamily: "Pixuf, monospace",
        fontSize: "10px",
        color: "#f5f5f5",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false);

    this.restartText = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.6, "PRESS ENTER TO RESTART", {
        fontFamily: "Pixuf, monospace",
        fontSize: "10px",
        color: "#f5f5f5",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false);

    this.drawHearts();
  }

  createAnimations() {
    this.playerFrameMap = parseFrameIndexMap(
      this.cache.json.get("player-frames"),
      PLAYER_FRAME_WIDTH,
      PLAYER_FRAME_HEIGHT,
      PLAYER_FRAME_COLUMNS
    );
    this.wizardFrameMap = parseFrameIndexMap(
      this.cache.json.get("wizard-frames"),
      WIZARD_FRAME_WIDTH,
      WIZARD_FRAME_HEIGHT,
      WIZARD_FRAME_COLUMNS
    );
    this.ghoulFrameMap = parseFrameIndexMap(
      this.cache.json.get("burning-ghoul-frames"),
      GHOUL_FRAME_WIDTH,
      GHOUL_FRAME_HEIGHT,
      GHOUL_FRAME_COLUMNS
    );
    this.fireballFrameMap = parseFrameIndexMap(
      this.cache.json.get("fireball-frames"),
      FIREBALL_FRAME_WIDTH,
      FIREBALL_FRAME_HEIGHT,
      FIREBALL_FRAME_COLUMNS
    );
    this.enemyDeathFrameMap = parseFrameIndexMap(
      this.cache.json.get("enemy-death-frames"),
      ENEMY_DEATH_FRAME_WIDTH,
      ENEMY_DEATH_FRAME_HEIGHT,
      ENEMY_DEATH_FRAME_COLUMNS
    );

    this.playerCapabilities = {
      crouch: hasFramesForPrefix(this.playerFrameMap, "player-crouch-"),
      punch: hasFramesForPrefix(this.playerFrameMap, "player-punch-"),
      kick: hasFramesForPrefix(this.playerFrameMap, "player-kick-"),
      flyingKick: hasFramesForPrefix(this.playerFrameMap, "player-flying-kick-"),
      hurt: hasFramesForPrefix(this.playerFrameMap, "player-hurt-"),
    };

    const definitions = [
      { key: "player-idle", texture: "player", map: this.playerFrameMap, prefix: "player-idle-", frameRate: 6, repeat: -1 },
      { key: "player-walk", texture: "player", map: this.playerFrameMap, prefix: "player-walk-", frameRate: 10, repeat: -1 },
      { key: "player-jump", texture: "player", map: this.playerFrameMap, prefix: "player-jump-", frameRate: 10, repeat: -1 },
      { key: "player-fall", texture: "player", map: this.playerFrameMap, prefix: "player-fall-", frameRate: 10, repeat: -1 },
      {
        key: "player-crouch",
        texture: "player",
        map: this.playerFrameMap,
        prefix: "player-crouch-",
        frameRate: 8,
        repeat: -1,
        enabled: this.playerCapabilities.crouch,
      },
      {
        key: "player-punch",
        texture: "player",
        map: this.playerFrameMap,
        prefix: "player-punch-",
        frameRate: 14,
        repeat: 0,
        enabled: this.playerCapabilities.punch,
      },
      {
        key: "player-kick",
        texture: "player",
        map: this.playerFrameMap,
        prefix: "player-kick-",
        frameRate: 14,
        repeat: 0,
        enabled: this.playerCapabilities.kick,
      },
      {
        key: "player-flying-kick",
        texture: "player",
        map: this.playerFrameMap,
        prefix: "player-flying-kick-",
        frameRate: 11,
        repeat: 0,
        enabled: this.playerCapabilities.flyingKick,
      },
      {
        key: "player-hurt",
        texture: "player",
        map: this.playerFrameMap,
        prefix: "player-hurt-",
        frameRate: 8,
        repeat: 0,
        enabled: this.playerCapabilities.hurt,
      },
      { key: "wizard-idle", texture: "wizard", map: this.wizardFrameMap, prefix: "wizard-idle-", frameRate: 7, repeat: -1 },
      { key: "wizard-fire", texture: "wizard", map: this.wizardFrameMap, prefix: "wizard-fire-", frameRate: 11, repeat: 0 },
      { key: "ghoul-run", texture: "burning-ghoul", map: this.ghoulFrameMap, prefix: "burning-ghoul-run1-", frameRate: 10, repeat: -1 },
      { key: "fireball-loop", texture: "fireball", map: this.fireballFrameMap, prefix: "fireball-", frameRate: 12, repeat: -1 },
      { key: "enemy-death", texture: "enemy-death", map: this.enemyDeathFrameMap, prefix: "enemy-death-", frameRate: 14, repeat: 0 },
    ];

    definitions.forEach((definition) => {
      if (definition.enabled === false) {
        return;
      }
      if (this.anims.exists(definition.key)) {
        return;
      }

      const frames = animationFramesForPrefix(definition.map, definition.prefix, definition.texture);
      if (frames.length === 0) {
        return;
      }

      this.anims.create({
        key: definition.key,
        frames,
        frameRate: definition.frameRate,
        repeat: definition.repeat,
      });
    });
  }

  spawnWizards() {
    const desiredWorldX = [560, 940, 1320, 1700, 2120, 2520, 2930, 3330, 3740];

    desiredWorldX.forEach((worldX) => {
      const tileY = this.findTopSolidTileYAtWorldX(worldX);
      if (tileY === null) {
        return;
      }

      const wizard = this.wizards.create(
        worldX,
        tileY * this.map.tileHeight - WIZARD_FOOT_OFFSET,
        "wizard",
        this.wizardFrameMap["wizard-idle-0"]
      );
      wizard.setScale(WIZARD_SCALE);
      wizard.body.setSize(30, 58);
      wizard.body.setOffset(25, 8);
      wizard.body.setGravityY(PLAYER_GRAVITY);
      wizard.setDataEnabled();
      wizard.setData("enemyId", this.nextEnemyId);
      wizard.setData("health", 1);
      wizard.setData("dead", false);
      wizard.setData("casting", false);
      wizard.setData("invulnerableUntil", 0);
      wizard.setData("nextShotAt", this.time.now + Phaser.Math.Between(700, 2000));
      this.syncWizardFacing(wizard);
      wizard.anims.play("wizard-idle");
      this.nextEnemyId += 1;
    });
  }

  spawnGhouls() {
    const placements = [
      // Elevated opening encounter platform.
      { seedTileX: 43, spawnLerp: 0.72, patrolDir: 1 },
      // Mid-right flat platform before the late-level drop.
      { seedTileX: 146, spawnLerp: 0.34, patrolDir: -1 },
      // Far-right flat surface with no enemy coverage.
      { seedTileX: 252, spawnLerp: 0.85, patrolDir: -1 },
    ];

    placements.forEach((placement) => this.spawnGhoulAtPlacement(placement));
  }

  spawnGhoulAtPlacement({ seedTileX, spawnLerp = 0.5, patrolDir = 1 }) {
    const seedWorldX = seedTileX * this.map.tileWidth + this.map.tileWidth * 0.5;
    const tileY = this.findTopSolidTileYAtWorldX(seedWorldX);
    if (tileY === null) {
      return;
    }

    const span = this.findSolidSpanAtTileRow(seedTileX, tileY);
    if (!span) {
      return;
    }

    const patrolLeftX = span.leftTileX * this.map.tileWidth + 12;
    const patrolRightX = (span.rightTileX + 1) * this.map.tileWidth - 12;
    const clampedLerp = Phaser.Math.Clamp(spawnLerp, 0.08, 0.92);
    const spawnX = Phaser.Math.Linear(patrolLeftX, patrolRightX, clampedLerp);
    const direction = patrolDir < 0 ? -1 : 1;

    const ghoul = this.ghouls.create(
      spawnX,
      tileY * this.map.tileHeight - GHOUL_FOOT_OFFSET,
      "burning-ghoul",
      this.ghoulFrameMap["burning-ghoul-run1-0"]
    );
    ghoul.setScale(GHOUL_SCALE);
    ghoul.body.setSize(24, 50);
    ghoul.body.setOffset(16, 8);
    ghoul.body.setGravityY(PLAYER_GRAVITY);
    ghoul.setDataEnabled();
    ghoul.setData("enemyId", this.nextEnemyId);
    ghoul.setData("health", 1);
    ghoul.setData("dead", false);
    ghoul.setData("invulnerableUntil", 0);
    ghoul.setData("nextShotAt", 0);
    ghoul.setData("patrolDir", direction);
    ghoul.setData("nextTurnAt", 0);
    ghoul.setData("patrolLeftX", patrolLeftX);
    ghoul.setData("patrolRightX", patrolRightX);
    // Ghoul source frames are authored facing left; flip while moving right.
    ghoul.setFlipX(direction > 0);
    ghoul.anims.play("ghoul-run");

    this.nextEnemyId += 1;
  }

  findSolidSpanAtTileRow(seedTileX, tileY) {
    const clampedSeedX = Phaser.Math.Clamp(seedTileX, 0, this.map.width - 1);
    const seedTile = this.groundLayer.getTileAt(clampedSeedX, tileY);
    if (!seedTile || !seedTile.collides) {
      return null;
    }

    let leftTileX = clampedSeedX;
    while (leftTileX > 0) {
      const leftTile = this.groundLayer.getTileAt(leftTileX - 1, tileY);
      if (!leftTile || !leftTile.collides) {
        break;
      }
      leftTileX -= 1;
    }

    let rightTileX = clampedSeedX;
    while (rightTileX < this.map.width - 1) {
      const rightTile = this.groundLayer.getTileAt(rightTileX + 1, tileY);
      if (!rightTile || !rightTile.collides) {
        break;
      }
      rightTileX += 1;
    }

    return { leftTileX, rightTileX };
  }

  findTopSolidTileYAtWorldX(worldX) {
    const tileX = Phaser.Math.Clamp(Math.floor(worldX / this.map.tileWidth), 0, this.map.width - 1);
    for (let tileY = 0; tileY < this.map.height; tileY += 1) {
      const tile = this.groundLayer.getTileAt(tileX, tileY);
      if (tile && tile.collides) {
        return tileY;
      }
    }
    return null;
  }

  drawHearts() {
    if (!this.heartGraphics || this.heartGraphics.scene !== this) {
      this.heartGraphics = this.add.graphics().setDepth(30).setScrollFactor(0);
    }

    const heartPattern = ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"];
    const pixelSize = 2;
    const spacing = 19;
    const startX = GAME_WIDTH - 82;
    const startY = 8;

    this.heartGraphics.clear();
    this.heartGraphics.fillStyle(0x9e0b0f, 1);
    for (let heart = 0; heart < this.health; heart += 1) {
      heartPattern.forEach((row, rowIndex) => {
        row.split("").forEach((value, colIndex) => {
          if (value === "1") {
            this.heartGraphics.fillRect(
              startX + heart * spacing + colIndex * pixelSize,
              startY + rowIndex * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        });
      });
    }
  }

  togglePause() {
    if (this.gameOver || this.levelComplete) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.physics.world.isPaused = this.isPaused;
    this.pauseText.setVisible(this.isPaused);
    this.pauseInstructionsText.setVisible(this.isPaused);
  }

  isLeftDown() {
    return this.keys.leftA.isDown || this.keys.leftArrow.isDown;
  }

  isRightDown() {
    return this.keys.rightD.isDown || this.keys.rightArrow.isDown;
  }

  isDownDown() {
    return this.keys.downS.isDown || this.keys.downArrow.isDown;
  }

  isJumpJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.upW) || Phaser.Input.Keyboard.JustDown(this.keys.upArrow);
  }

  isAttackJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.attackJ) || Phaser.Input.Keyboard.JustDown(this.keys.attackSpace);
  }

  tryStartAttack() {
    if (this.attackState.active || this.isPaused || this.gameOver) {
      return;
    }

    if (this.isDownDown()) {
      return;
    }

    const onFloor = this.player.body.blocked.down;
    if (!onFloor) {
      if (this.playerCapabilities.flyingKick && this.anims.exists("player-flying-kick")) {
        this.startAttack("air-kick", "player-flying-kick", 260);
      }
      return;
    }

    const groundAttackAnims = [];
    if (this.playerCapabilities.punch && this.anims.exists("player-punch")) {
      groundAttackAnims.push("player-punch");
    }
    if (this.playerCapabilities.kick && this.anims.exists("player-kick")) {
      groundAttackAnims.push("player-kick");
    }
    if (groundAttackAnims.length === 0) {
      return;
    }

    const attackAnim = Phaser.Utils.Array.GetRandom(groundAttackAnims);
    const duration = attackAnim === "player-punch" ? 300 : 330;
    this.startAttack(attackAnim, attackAnim, duration);
  }

  startAttack(kind, animationKey, duration) {
    this.attackState.active = true;
    this.attackState.kind = kind;
    this.attackState.expiresAt = this.time.now + duration;
    this.attackState.hitEnemyIds.clear();

    this.player.setVelocityX(0);
    this.player.anims.play(animationKey, true);
    this.attackSfx.play();
  }

  clearAttackState() {
    this.attackState.active = false;
    this.attackState.kind = null;
    this.attackState.expiresAt = 0;
    this.attackState.hitEnemyIds.clear();
  }

  updatePlayerState() {
    const body = this.player.body;
    const onFloor = body.blocked.down;
    const inHurtSequence = this.time.now < this.playerHurtUntil;
    const downHeld = !inHurtSequence && this.isDownDown();
    const crouchHeld = downHeld && onFloor;

    if (downHeld && this.attackState.active) {
      this.clearAttackState();
    }

    if (!downHeld && !inHurtSequence && this.isAttackJustPressed()) {
      this.tryStartAttack();
    }

    if (!downHeld && !inHurtSequence && this.isJumpJustPressed() && onFloor && !this.isPaused && !this.attackState.active) {
      this.player.setVelocityY(PLAYER_JUMP_SPEED);
      this.jumpSfx.play();
    }

    const crouching = crouchHeld && !this.attackState.active;
    const allowHorizontalControl = !inHurtSequence && (!this.attackState.active || this.attackState.kind === "air-kick");

    if (crouching) {
      this.player.setVelocityX(0);
    } else if (allowHorizontalControl) {
      if (this.isLeftDown() && !this.isRightDown()) {
        this.player.setVelocityX(-PLAYER_MOVE_SPEED);
        this.lastFacing = -1;
      } else if (this.isRightDown() && !this.isLeftDown()) {
        this.player.setVelocityX(PLAYER_MOVE_SPEED);
        this.lastFacing = 1;
      } else {
        this.player.setVelocityX(0);
      }
    } else if (onFloor && !inHurtSequence) {
      this.player.setVelocityX(0);
    }

    this.player.setFlipX(this.lastFacing < 0);

    if (this.attackState.active && this.time.now > this.attackState.expiresAt) {
      this.clearAttackState();
    }

    if (inHurtSequence) {
      if (this.playerCapabilities.hurt && this.anims.exists("player-hurt")) {
        this.player.anims.play("player-hurt", true);
      } else {
        this.player.anims.play("player-idle", true);
      }
    } else if (!this.attackState.active) {
      if (!onFloor) {
        if (body.velocity.y < 0) {
          this.player.anims.play("player-jump", true);
        } else {
          this.player.anims.play("player-fall", true);
        }
      } else if (crouching) {
        if (this.playerCapabilities.crouch && this.anims.exists("player-crouch")) {
          this.player.anims.play("player-crouch", true);
        } else {
          this.player.anims.play("player-idle", true);
        }
      } else if (Math.abs(body.velocity.x) > 5) {
        this.player.anims.play("player-walk", true);
      } else if (this.time.now < this.playerInvulnerableUntil - 450 && this.playerCapabilities.hurt && this.anims.exists("player-hurt")) {
        this.player.anims.play("player-hurt", true);
      } else {
        this.player.anims.play("player-idle", true);
      }
    } else if (this.attackState.kind === "air-kick") {
      if (this.playerCapabilities.flyingKick && this.anims.exists("player-flying-kick")) {
        this.player.anims.play("player-flying-kick", true);
      } else {
        this.clearAttackState();
      }
    }
  }

  canPlayerAttackHitWizard(wizard) {
    const dx = wizard.x - this.player.x;
    const dy = Math.abs(wizard.y - this.player.y);

    if (dy > 42) {
      return false;
    }

    if (this.attackState.kind === "air-kick") {
      return Math.abs(dx) < 62;
    }

    if (this.lastFacing > 0 && dx < -8) {
      return false;
    }
    if (this.lastFacing < 0 && dx > 8) {
      return false;
    }
    return Math.abs(dx) < 66;
  }

  applyAttackHitsForGroup(group) {
    group.children.each((enemy) => {
      if (!enemy || !enemy.active || enemy.getData("dead")) {
        return;
      }

      const enemyId = enemy.getData("enemyId");
      if (this.attackState.hitEnemyIds.has(enemyId)) {
        return;
      }

      if (this.canPlayerAttackHitWizard(enemy)) {
        this.attackState.hitEnemyIds.add(enemyId);
        this.damageWizard(enemy);
      }
    });
  }

  applyAttackHits() {
    if (!this.attackState.active) {
      return;
    }

    this.applyAttackHitsForGroup(this.wizards);
    this.applyAttackHitsForGroup(this.ghouls);
  }

  damageWizard(wizard) {
    if (!wizard || !wizard.active || wizard.getData("dead")) {
      return;
    }

    if (this.time.now < wizard.getData("invulnerableUntil")) {
      return;
    }

    const nextHealth = wizard.getData("health") - 1;
    wizard.setData("health", nextHealth);
    wizard.setData("invulnerableUntil", this.time.now + 220);
    wizard.setData("nextShotAt", this.time.now + Phaser.Math.Between(700, 1200));
    wizard.setTintFill(0xffffff);
    this.time.delayedCall(120, () => {
      if (wizard.active) {
        wizard.clearTint();
      }
    });

    if (nextHealth <= 0) {
      this.destroyWizard(wizard);
      return;
    }

    this.hurtSfx.play();
  }

  destroyWizard(wizard) {
    if (!wizard.active) {
      return;
    }

    const { x, y, flipX } = wizard;
    wizard.setData("dead", true);
    wizard.disableBody(true, true);

    const death = this.add
      .sprite(x, y, "enemy-death", this.enemyDeathFrameMap["enemy-death-0"])
      .setScale(WIZARD_SCALE)
      .setFlipX(flipX)
      .setDepth(4);
    death.anims.play("enemy-death");
    death.once("animationcomplete", () => {
      death.destroy();
    });

    this.killSfx.play();
  }

  startWizardCast(wizard) {
    wizard.setData("casting", true);
    this.syncWizardFacing(wizard);
    wizard.anims.play("wizard-fire", true);

    this.time.delayedCall(260, () => {
      if (!this.gameOver && !this.levelComplete && !this.isPaused && wizard.active && !wizard.getData("dead")) {
        this.spawnFireball(wizard);
      }
    });

    this.time.delayedCall(760, () => {
      if (wizard.active && !wizard.getData("dead")) {
        wizard.setData("casting", false);
        wizard.setData("nextShotAt", this.time.now + Phaser.Math.Between(900, 1800));
        wizard.anims.play("wizard-idle", true);
      }
    });
  }

  updateWizards() {
    this.wizards.children.each((wizard) => {
      if (!wizard || !wizard.active || wizard.getData("dead")) {
        return;
      }

      this.syncWizardFacing(wizard);

      if (wizard.getData("casting")) {
        return;
      }

      const distance = Math.abs(this.player.x - wizard.x);
      if (this.time.now >= wizard.getData("nextShotAt")) {
        if (distance < 460) {
          this.startWizardCast(wizard);
        } else {
          wizard.setData("nextShotAt", this.time.now + Phaser.Math.Between(400, 800));
        }
      }
    });
  }

  updateGhouls() {
    this.ghouls.children.each((ghoul) => {
      if (!ghoul || !ghoul.active || ghoul.getData("dead")) {
        return;
      }

      const body = ghoul.body;
      const currentDirection = ghoul.getData("patrolDir") || -1;
      const nextTurnAt = ghoul.getData("nextTurnAt") || 0;
      const turnReady = this.time.now >= nextTurnAt;
      const patrolLeftX = ghoul.getData("patrolLeftX");
      const patrolRightX = ghoul.getData("patrolRightX");

      if (!body.blocked.down && !body.touching.down) {
        ghoul.setVelocityX(0);
        return;
      }

      let direction = currentDirection;
      if (patrolLeftX !== undefined && ghoul.x <= patrolLeftX + 2) {
        direction = 1;
      } else if (patrolRightX !== undefined && ghoul.x >= patrolRightX - 2) {
        direction = -1;
      }

      if (!this.canGhoulMoveDirection(ghoul, direction)) {
        if (turnReady) {
          direction *= -1;
          ghoul.setData("nextTurnAt", this.time.now + GHOUL_TURN_COOLDOWN_MS);
        } else {
          direction = 0;
        }
      }

      if (direction !== 0) {
        ghoul.setData("patrolDir", direction);
      }

      ghoul.setVelocityX(direction * GHOUL_MOVE_SPEED);
      // Ghoul source frames are authored facing left; flip while moving right.
      if (direction !== 0) {
        ghoul.setFlipX(direction > 0);
      }
      ghoul.anims.play("ghoul-run", true);
    });
  }

  canGhoulMoveDirection(ghoul, direction) {
    if (!ghoul || !ghoul.active || ghoul.getData("dead") || direction === 0) {
      return true;
    }

    const body = ghoul.body;
    if (!body) {
      return false;
    }

    const probeX = ghoul.x + direction * (body.width * 0.5 + 6);
    const wallProbeY = body.center.y;
    const groundProbeY = body.bottom + 2;

    const wallTile = this.groundLayer.getTileAtWorldXY(probeX, wallProbeY);
    if (wallTile && wallTile.collides) {
      return false;
    }

    const groundTile = this.groundLayer.getTileAtWorldXY(probeX, groundProbeY);
    return !!(groundTile && groundTile.collides);
  }

  spawnFireball(wizard) {
    if (this.levelComplete || this.gameOver) {
      return;
    }

    const direction = this.player.x >= wizard.x ? 1 : -1;
    const spawnX = wizard.x + direction * 24;
    const spawnY = wizard.y - 12;

    const fireball = this.fireballs.get(spawnX, spawnY, "fireball", this.fireballFrameMap["fireball-0"]);
    if (!fireball) {
      return;
    }

    fireball.enableBody(true, spawnX, spawnY, true, true);
    fireball.setScale(FIREBALL_SCALE);
    fireball.body.setAllowGravity(false);
    fireball.body.setSize(14, 14);
    fireball.body.setOffset(6, 6);
    fireball.setVelocity(direction * FIREBALL_SPEED, 0);
    if (!fireball.data) {
      fireball.setDataEnabled();
    }
    fireball.setData("bornAt", this.time.now);
    fireball.anims.play("fireball-loop", true);
  }

  recycleFireball(fireball) {
    if (!fireball || !fireball.active) {
      return;
    }

    fireball.disableBody(true, true);
  }

  onFireballHitsPlayer(fireball) {
    if (this.levelComplete) {
      this.recycleFireball(fireball);
      return;
    }

    const direction = Math.sign(fireball.body.velocity.x) || 1;
    this.recycleFireball(fireball);
    this.hurtPlayer(direction);
  }

  onPlayerEnemyOverlap(enemy) {
    if (!enemy || !enemy.active || enemy.getData("dead") || this.gameOver || this.levelComplete) {
      return;
    }

    if (this.attackState.active) {
      const enemyId = enemy.getData("enemyId");
      if (!this.attackState.hitEnemyIds.has(enemyId) && this.canPlayerAttackHitWizard(enemy)) {
        this.attackState.hitEnemyIds.add(enemyId);
        this.damageWizard(enemy);
        return;
      }
    }

    const knockbackDirection = Math.sign(this.player.x - enemy.x) || 1;
    this.hurtPlayer(knockbackDirection);
  }

  hurtPlayer(knockbackDirection) {
    if (this.gameOver || this.levelComplete || this.time.now < this.playerInvulnerableUntil) {
      return;
    }

    this.health = Math.max(0, this.health - 1);
    this.playerInvulnerableUntil = this.time.now + PLAYER_INVULNERABLE_MS;
    this.playerHurtUntil = this.time.now + PLAYER_HURT_SEQUENCE_MS;
    this.clearAttackState();
    this.hurtSfx.play();
    this.drawHearts();

    this.player.setVelocityX(knockbackDirection * 140);
    this.player.setVelocityY(-140);
    if (this.playerCapabilities.hurt && this.anims.exists("player-hurt")) {
      this.player.anims.play("player-hurt", true);
    }
    this.player.setTintFill(0xffffff);
    this.time.delayedCall(120, () => {
      if (this.player.active) {
        this.player.clearTint();
      }
    });

    if (this.health <= 0) {
      this.triggerGameOver();
    }
  }

  syncWizardFacing(wizard) {
    if (!wizard || !wizard.active || wizard.getData("dead")) {
      return;
    }

    const deltaX = this.player.x - wizard.x;
    const facingDirection = Math.abs(deltaX) < 1 ? this.lastFacing : Math.sign(deltaX);
    // Wizard source frames are authored facing left; flip when targeting to the right.
    wizard.setFlipX(facingDirection > 0);
  }

  cleanupFireballs() {
    this.fireballs.children.each((fireball) => {
      if (!fireball || !fireball.active) {
        return;
      }

      if (fireball.x < -40 || fireball.x > this.map.widthInPixels + 40 || this.time.now - fireball.getData("bornAt") > 4500) {
        this.recycleFireball(fireball);
      }
    });
  }

  triggerGameOver() {
    if (this.gameOver || this.levelComplete) {
      return;
    }

    this.gameOver = true;
    this.isPaused = false;
    this.pauseText.setVisible(false);
    this.pauseInstructionsText.setVisible(false);
    this.levelCompleteText.setVisible(false);
    this.levelCompleteRestartText.setVisible(false);
    this.physics.world.pause();
    this.clearAttackState();
    this.player.setVelocity(0, 0);
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  triggerLevelComplete() {
    if (this.levelComplete || this.gameOver) {
      return;
    }

    this.levelComplete = true;
    this.levelCompleteScreenShown = false;
    this.isPaused = false;
    this.pauseText.setVisible(false);
    this.pauseInstructionsText.setVisible(false);
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);
    this.clearAttackState();
    this.playerInvulnerableUntil = Number.POSITIVE_INFINITY;
    this.playerHurtUntil = 0;
    this.fireballs.children.each((fireball) => {
      this.recycleFireball(fireball);
    });
    this.physics.world.setBoundsCollision(true, false, false, true);
    this.player.setCollideWorldBounds(false);
  }

  updateLevelCompleteSequence() {
    if (this.levelCompleteScreenShown) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
        this.scene.restart();
      }
      return;
    }

    this.lastFacing = 1;
    this.player.setFlipX(false);
    this.player.setVelocityX(LEVEL_COMPLETE_WALK_SPEED);

    if (this.player.body.blocked.down || this.player.body.touching.down) {
      this.player.anims.play("player-walk", true);
    } else if (this.player.body.velocity.y < 0) {
      this.player.anims.play("player-jump", true);
    } else {
      this.player.anims.play("player-fall", true);
    }

    const cameraRightX = this.cameras.main.scrollX + GAME_WIDTH;
    if (this.player.x > cameraRightX + LEVEL_COMPLETE_OFFSCREEN_PADDING) {
      this.levelCompleteScreenShown = true;
      this.physics.world.pause();
      this.player.setVisible(false);
      this.levelCompleteText.setVisible(true);
      this.levelCompleteRestartText.setVisible(true);
    }
  }

  updateParallax() {
    const scrollX = this.cameras.main.scrollX;
    this.farBackground.tilePositionX = scrollX * 0.2;
    this.midBackground.tilePositionX = scrollX * 0.45;
  }

  updateDebugState() {
    window.__gothicvaniaState = {
      scene: "level",
      paused: this.isPaused,
      gameOver: this.gameOver,
      levelComplete: this.levelComplete,
      levelCompleteScreenShown: this.levelCompleteScreenShown,
      world: {
        width: this.physics.world.bounds.width,
        height: this.physics.world.bounds.height,
      },
      player: {
        x: Number(this.player.x.toFixed(2)),
        y: Number(this.player.y.toFixed(2)),
        vx: Number(this.player.body.velocity.x.toFixed(2)),
        vy: Number(this.player.body.velocity.y.toFixed(2)),
        onFloor: this.player.body.blocked.down,
        facing: this.lastFacing < 0 ? "left" : "right",
        crouching: this.isDownDown() && this.player.body.blocked.down,
        attacking: this.attackState.active,
        attackKind: this.attackState.kind,
        health: this.health,
      },
      enemies: {
        wizardsAlive: this.wizards.countActive(true),
        ghoulsAlive: this.ghouls.countActive(true),
        fireballsActive: this.fireballs.countActive(true),
      },
      controls: DEBUG_CONTROLS_TEXT,
    };
  }

  update() {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
        this.scene.restart();
      }
      this.updateParallax();
      this.updateDebugState();
      return;
    }

    if (this.levelComplete) {
      this.updateLevelCompleteSequence();
      this.updateParallax();
      this.updateDebugState();
      return;
    }

    if (!this.isPaused) {
      this.updatePlayerState();
      this.applyAttackHits();
      this.updateWizards();
      this.updateGhouls();
      this.cleanupFireballs();

      if (this.player.y > GAME_HEIGHT + 28) {
        this.triggerGameOver();
      }

      const cameraAtLevelEnd = this.cameras.main.scrollX >= this.map.widthInPixels - GAME_WIDTH - 1;
      const reachedRightBoundary =
        this.player.body.blocked.right || this.player.x >= this.map.widthInPixels - LEVEL_COMPLETE_TRIGGER_PADDING;
      if (cameraAtLevelEnd && reachedRightBoundary) {
        this.triggerLevelComplete();
      }
    }

    this.updateParallax();
    this.updateDebugState();
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, LevelScene],
};

window.game = new Phaser.Game(config);
