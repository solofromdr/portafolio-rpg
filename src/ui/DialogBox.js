export class DialogBox {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;

    const w = scene.scale.width;
    const h = scene.scale.height;

    this.box = scene.add.rectangle(w / 2, h - 60, w - 20, 100, 0x000000, 0.8);
    this.box.setScrollFactor(0);
    this.box.setVisible(false);

    this.text = scene.add.text(w / 2, h - 110, "", {
      fontSize: "12px",
      fill: "#ffffff",
      wordWrap: { width: w - 40 },
      align: "center",
    });
    this.text.setOrigin(0.5, 0);
    this.text.setScrollFactor(0);
    this.text.setVisible(false);
  }

  show(message) {
    this.box.setVisible(true);
    this.text.setVisible(true);
    this.text.setText(message);
    this.visible = true;
  }

  hide() {
    this.box.setVisible(false);
    this.text.setVisible(false);
    this.visible = false;
  }

  typewrite(fullText, onComplete) {
    this.show("...");
    this.scene.time.delayedCall(1000, () => {
      let index = 0;
      this.text.setText("");
      this.scene.time.addEvent({
        delay: 40,
        repeat: fullText.length - 1,
        callback: () => {
          this.text.setText(this.text.text + fullText[index]);
          if (fullText[index] !== " " && fullText[index] !== "\n") {
            this.scene.sound.play("sfx-dialog", { volume: 0.4 });
          }
          index++;
          if (index === fullText.length && onComplete) {
            onComplete();
          }
        },
      });
    });
  }

  getObjects() {
    return [this.box, this.text];
  }

  setDepth(depth) {
    this.box.setDepth(depth);
    this.text.setDepth(depth + 1);
  }
}
