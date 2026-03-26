import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { GAME_CONFIG } from "./config/constants.js";
import { PauseScene } from "./scenes/PauseScene.js";
import { IntroScene } from "./scenes/IntroScene.js";
import { BattleScene } from "./scenes/BattleScene.js";
import { UIScene } from "./ui/UIScene.js";

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [MenuScene, IntroScene, GameScene, PauseScene, BattleScene, UIScene],
};

new Phaser.Game(config);
