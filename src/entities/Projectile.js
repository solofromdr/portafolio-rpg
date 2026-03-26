export class ProjectileManager {
  constructor(scene, wallsLayer, uiCamera) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    scene.physics.add.collider(this.group, wallsLayer, (lance) => {
      lance.destroy();
    });

    scene.input.on("pointerdown", () => {
      if (!this.enabled) return;
      const now = this.scene.time.now;
      if (now - this.shootCooldown < this.shootDelay) return;
      this.shootCooldown = now;
      if (this.scene.ammoBar && !this.scene.ammoBar.canShoot()) return;
      if (this.scene.ammoBar) this.scene.ammoBar.shoot();
      this.shoot();
    });

    this.shootCooldown = 0;
    this.shootDelay = 800;
    this.enabled = false;
    if (uiCamera) {
      uiCamera.ignore(this.group);
    }
  }

  shoot() {
    const player = this.scene.player.getSprite();
    const lance = this.group.create(player.x, player.y, "lance");
    lance.setScale(0.75);
    if (this.scene.uiCamera) this.scene.uiCamera.ignore(lance);

    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(
      pointer.x,
      pointer.y,
    );

    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      worldPoint.x,
      worldPoint.y,
    );

    lance.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);
    lance.setRotation(angle);

    this.scene.time.delayedCall(1000, () => {
      if (lance && lance.active) lance.destroy();
    });
  }

  enable() {
    this.enabled = true;
  }

  getGroup() {
    return this.group;
  }
}
