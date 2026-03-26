export class SlimeBoss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp = 20;
    this.maxHp = 20;
    this.dead = false;
    this.invincible = false;
    this.phase = 1;
    this.jumpTimer = 0;
    this.jumpDelay = 2000;

    this.sprite = scene.physics.add.sprite(x, y, "slime-boss-idle");
    this.sprite.setScale(1.5);
    this.sprite.setCollideWorldBounds(true);

    scene.anims.create({
      key: "boss-idle",
      frames: scene.anims.generateFrameNumbers("slime-boss-idle", {
        start: 0,
        end: 4,
      }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: "boss-jump",
      frames: scene.anims.generateFrameNumbers("slime-boss-jump", {
        start: 0,
        end: 12,
      }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: "boss-hit",
      frames: scene.anims.generateFrameNumbers("slime-boss-hit", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.sprite.anims.play("boss-idle", true);
  }

  takeDamage() {
    if (this.dead || this.invincible) return false;
    if (!this.sprite) return false;

    this.invincible = true;
    this.hp--;

    if (this.sprite.anims) this.sprite.anims.play("boss-hit", true);
    this.scene.time.delayedCall(500, () => {
      if (!this.dead && this.sprite && this.sprite.anims) {
        this.sprite.anims.play("boss-idle", true);
        this.invincible = false;
      }
    });

    // this.scene.tweens.add({
    //   targets: this.sprite,
    //   alpha: 0.3,
    //   duration: 100,
    //   yoyo: true,
    //   repeat: 2,
    //   onComplete: () => {
    //     if (this.sprite) this.sprite.setAlpha(1)
    //   }
    // })
    // Fase 2 al 50% de vida
    if (this.hp <= this.maxHp / 2 && this.phase === 1) {
      this._enterPhase2();
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  _enterPhase2() {
    this.phase = 2;
    this.jumpDelay = 1000;

    // Flash de transición
    this.scene.cameras.main.shake(500, 0.03);
    this.scene.cameras.main.flash(400, 0, 100, 255);

    // Boss se hace más grande
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
    });
  }

  die() {
    this.dead = true;
    this.scene.cameras.main.shake(800, 0.03);

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 3,
      scaleY: 0,
      duration: 600,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  update(playerX, playerY, delta) {
    if (this.dead || this.invincible) return;
    if (!this.sprite || !this.sprite.active) return;

    this.jumpTimer += delta;

    if (this.jumpTimer >= this.jumpDelay) {
      this.jumpTimer = 0;
      this._jumpTowardPlayer(playerX, playerY);
    }
  }

  _jumpTowardPlayer(playerX, playerY) {
    if (!this.sprite || !this.sprite.active) return;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY,
    );

    const speed = this.phase === 1 ? 120 : 200;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    this.sprite.anims.play("boss-jump", true);
    this.sprite.setVelocity(vx, vy);

    this.scene.time.delayedCall(600, () => {
      if (!this.dead && this.sprite && this.sprite.active) {
        this.sprite.setVelocity(0, 0);
        this.sprite.anims.play("boss-idle", true);
      }
    });
  }

  getSprite() {
    return this.sprite;
  }
}
