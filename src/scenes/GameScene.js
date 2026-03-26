import { Player } from "../entities/Player.js";
import { NPC } from "../entities/NPC.js";
import { ProjectileManager } from "../entities/Projectile.js";
import { DialogBox } from "../ui/DialogBox.js";
import {
  PLAYER_CONFIG,
  NPC_CONFIG,
  GAME_CONFIG,
  GAME_STATE,
} from "../config/constants.js";
import { GateManager } from "../entities/GateManager.js";
import { AmmoBar } from "../ui/AmmoBar.js";
import { SlimeMinion } from "../entities/SlimeMinion.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("mapa", "/map/map.json");

    this.load.image("floor", "/map/floor.png");
    this.load.image("floor2", "/map/floor-v2.png");
    this.load.image("floordetail", "/map/floordetails.png");
    this.load.image("nature", "/map/nature.png");
    this.load.image("relief", "/map/relief.png");
    this.load.image("water", "/map/TilesetWater.png");

    this.load.spritesheet("idle", "/assets/idle/idle.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("walk", "/assets/walk/walk.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("npc-idle", "/assets/cavegirl/SpriteSheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("lance", "/assets/weapon/Shuriken.png");

    this.load.image("guardian", "/assets/cutscenes/2da.png");

    this.load.image("shuriken-active", "/assets/ui/Shuriken.png");
    this.load.image("shuriken-disabled", "/assets/ui/ShurikenDisabled.png");

    this.load.spritesheet("slime-minion", "/assets/enemies/Slime3.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    // Mapa
    const map = this.make.tilemap({ key: "mapa" });
    const floorTiles = map.addTilesetImage("floor");
    const floorV2Tiles = map.addTilesetImage("floor2", "floor2");
    const floorDetailTiles = map.addTilesetImage("floordetails", "floordetail");
    const natureTiles = map.addTilesetImage("nature");
    const reliefTiles = map.addTilesetImage("relief");
    const waterTiles = map.addTilesetImage("water");

    const floorLayer = map.createLayer("floor", [
      floorTiles,
      floorV2Tiles,
      floorDetailTiles,
      waterTiles,
    ]);
    const detailsLayer = map.createLayer("details", [
      floorDetailTiles,
      natureTiles,
      reliefTiles,
    ]);
    const objectsLayer = map.createLayer("objects", [
      natureTiles,
      reliefTiles,
      floorV2Tiles,
    ]);
    const wallsLayer = map.createLayer("wall", [
      floorTiles,
      floorV2Tiles,
      natureTiles,
      reliefTiles,
    ]);
    wallsLayer.setCollisionByExclusion([-1]);

    // Cámara principal
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(GAME_CONFIG.zoom);

    // Cámara UI — debe crearse antes del cursor
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.setScroll(0, 0);

    this.uiCamera.ignore([floorLayer, detailsLayer, objectsLayer, wallsLayer]);

    // Barra de munición
    this.ammoBar = new AmmoBar(this);
    this.cameras.main.ignore(this.ammoBar.getObjects());

    // Cursor personalizado
    this.input.setDefaultCursor("none");
    this.cursor = this.add
      .image(0, 0, "cursor-interact")
      .setDepth(999)
      .setScrollFactor(0)
      .setScale(1);
    this.uiCamera.ignore(this.cursor);
    this.input.on("pointerdown", () => this.cursor.setTexture("cursor-hit"));
    this.input.on("pointerup", () => this.cursor.setTexture("cursor-interact"));

    // Diálogo
    const dialogBox = new DialogBox(this);
    this.cameras.main.ignore(dialogBox.getObjects());

    // Jugador
    this.player = new Player(this, PLAYER_CONFIG.startX, PLAYER_CONFIG.startY);
    const playerSprite = this.player.getSprite();
    this.physics.add.collider(playerSprite, wallsLayer);
    this.cameras.main.startFollow(playerSprite);
    this.uiCamera.ignore(playerSprite);

    // NPC
    this.npc = new NPC(this, NPC_CONFIG.x, NPC_CONFIG.y, dialogBox, () => {
      this.projectiles.enable();
    });
    this.npc.setupOverlap(playerSprite);
    this.uiCamera.ignore(this.npc.getSprite());

    // Proyectiles
    this.projectiles = new ProjectileManager(this, wallsLayer, this.uiCamera);

    // Gate system
    this.gateManager = new GateManager(this, playerSprite, dialogBox);
    this.uiCamera.ignore([
      this.gateManager.gate2,
      this.gateManager.gate3,
      this.gateManager.gate4south,
      this.gateManager.gate4north,
    ]);

    // Pausa con ESC
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.pause("GameScene");
      this.scene.launch("PauseScene");
    });

    // Slimes del bioma 2
    this.slimes = [];
    this.slimesDefeated = 0;
    this.slimeGroup = this.physics.add.group();

    const slimePositions = [
      { x: 439, y: 122 },
      { x: 486, y: 83 },
      { x: 505, y: 145 },
    ];

    if (!GAME_STATE.boss2Defeated) {
      const slimePositions = [
        { x: 439, y: 122 },
        { x: 486, y: 83 },
        { x: 505, y: 145 },
      ];

      slimePositions.forEach((pos) => {
        const slime = new SlimeMinion(this, pos.x, pos.y);
        this.uiCamera.ignore(slime.getSprite());
        slime.getSprite().slimeRef = slime;
        this.slimeGroup.add(slime.getSprite());
        this.slimes.push(slime);
      });
    }

    // Aquí va el collider
    this.physics.add.collider(this.slimeGroup, wallsLayer);

    this.physics.add.collider(this.slimeGroup, this.gateManager.wall2);
    this.physics.add.collider(this.slimeGroup, this.gateManager.wall3);
    this.physics.add.collider(this.slimeGroup, this.gateManager.wall4south);
    this.physics.add.collider(this.slimeGroup, this.gateManager.wall4north);

    // Colisión shuriken con slimes
    this.physics.add.overlap(
      this.projectiles.getGroup(),
      this.slimeGroup,
      (lance, slimeSprite) => {
        if (!lance.active) return;
        lance.destroy();
        const slime = slimeSprite.slimeRef;
        if (slime && !slime.dead && !slime.invincible) {
          const died = slime.takeDamage();
          if (died) {
            this.slimesDefeated++;
            if (this.slimesDefeated >= 3) {
              this._triggerBossFight();
            }
          }
        }
      },
    );

    // Colisión player con slimes
    this.physics.add.overlap(this.player.getSprite(), this.slimeGroup, () => {
      this.cameras.main.shake(200, 0.01);
      this.cameras.main.flash(100, 255, 0, 0);
    });

    // Restaurar estado si ya se habló con la guardiana
    if (GAME_STATE.hasWeapon) {
      this.projectiles.enable();
      this.ammoBar.setVisible(true);
      this.gateManager.openGate(2);
    }

    if (GAME_STATE.boss2Defeated) {
      // Portal místico donde estaban los slimes
      const px = 480;
      const py = 110;

      const portalBg = this.add.circle(px, py, 20, 0x9900ff, 0.4).setDepth(5);
      const portalRing = this.add.circle(px, py, 20, 0x9900ff, 0).setDepth(5);
      portalRing.setStrokeStyle(2, 0xcc88ff);

      // Pulso
      this.tweens.add({
        targets: portalBg,
        alpha: 0.8,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      // Partículas girando
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dot = this.add
          .circle(
            px + Math.cos(angle) * 24,
            py + Math.sin(angle) * 24,
            3,
            0xcc88ff,
            1,
          )
          .setDepth(6);
        this.uiCamera.ignore(dot);

        this.tweens.add({
          targets: dot,
          angle: 360,
          duration: 2000,
          repeat: -1,
          onUpdate: () => {
            const a = angle + (this.time.now / 2000) * Math.PI * 2;
            dot.x = px + Math.cos(a) * 24;
            dot.y = py + Math.sin(a) * 24;
          },
        });
      }

      // Texto flotante
      const portalText = this.add
        .text(px, py - 36, "Presiona E", {
          fontSize: "8px",
          fill: "#cc88ff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(6);

      this.tweens.add({
        targets: portalText,
        y: py - 40,
        alpha: 0.6,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });

      this.uiCamera.ignore([portalBg, portalRing, portalText]);

      // Tecla E para entrar al boss
      this.portalKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E,
      );
      this.portalActive = true;
      this.portalX = px;
      this.portalY = py;
    }
  }

  _triggerBossFight() {
    GAME_STATE.boss2Defeated = false; //reset
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);
    this.time.delayedCall(1000, () => {
      this.cameras.main.fade(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start("BattleScene");
      });
    });
  }

  update(time, delta) {
    this.player.update(PLAYER_CONFIG.speed);
    this.npc.update(this.player.getSprite().x, this.player.getSprite().y);
    this.slimes.forEach((slime) =>
      slime.update(this.player.getSprite().x, this.player.getSprite().y, delta),
    );
    this.cursor.setPosition(
      this.input.activePointer.x,
      this.input.activePointer.y,
    );

    if (this.portalActive && this.portalKey.isDown) {
      const playerSprite = this.player.getSprite();
      const dist = Phaser.Math.Distance.Between(
        playerSprite.x,
        playerSprite.y,
        this.portalX,
        this.portalY,
      );
      if (dist < 40) {
        this.portalActive = false;
        this.scene.start("BattleScene");
      }
    }
  }
}
