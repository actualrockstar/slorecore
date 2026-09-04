import * as Phaser from 'phaser';

export class InputManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private lastInputTime: number = 0;
  private debounceThreshold: number = 150;
  private swipeThreshold: number = 30;

  private keys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  private downX: number = 0;
  private downY: number = 0;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;

    if (!scene.input || !scene.input.keyboard) {
      throw new Error("Input plugin not available.");
    }

    this.keys = {
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Keyboard events
    scene.input.keyboard.on('keydown', this.handleKeydown, this);

    // Touch / Swipe events
    scene.input.on('pointerdown', this.handlePointerDown, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
  }

  private handleKeydown(event: KeyboardEvent) {
    const time = this.scene.time.now;
    if (time - this.lastInputTime < this.debounceThreshold) return;

    let handled = false;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.emit('move-left');
      handled = true;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.emit('move-right');
      handled = true;
    } else if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'Space') {
      this.emit('jump');
      handled = true;
    }

    if (handled) {
      this.lastInputTime = time;
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    this.downX = pointer.x;
    this.downY = pointer.y;
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    const time = this.scene.time.now;
    if (time - this.lastInputTime < this.debounceThreshold) return;

    const upX = pointer.x;
    const upY = pointer.y;

    const diffX = upX - this.downX;
    const diffY = upY - this.downY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > this.swipeThreshold) {
        if (diffX > 0) {
          this.emit('move-right');
        } else {
          this.emit('move-left');
        }
        this.lastInputTime = time;
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > this.swipeThreshold && diffY < 0) { // Up swipe
        this.emit('jump');
        this.lastInputTime = time;
      }
    }
  }

  destroy() {
    this.removeAllListeners();
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown', this.handleKeydown, this);
    }
    if (this.scene.input) {
      this.scene.input.off('pointerdown', this.handlePointerDown, this);
      this.scene.input.off('pointerup', this.handlePointerUp, this);
    }
  }
}
