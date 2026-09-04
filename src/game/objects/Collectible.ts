import * as Phaser from 'phaser';
import { GAME_CONFIG, CollectibleType } from '../config/gameConfig';
import { Perspective } from '../utils/Perspective';

export class Collectible extends Phaser.GameObjects.Container {
  public lane: number;
  public collectibleType: CollectibleType;
  private scrollSpeed: number;
  public z: number = 0;
  
  private sprite: Phaser.GameObjects.Sprite;
  private bobTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, lane: number, type: CollectibleType, speed: number) {
    super(scene, 0, 0);
    
    this.lane = lane;
    this.collectibleType = type;
    this.scrollSpeed = speed;

    this.sprite = scene.add.sprite(0, 0, `collectible_${type}`);
    this.add(this.sprite);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.sprite.width, this.sprite.height);
    body.setOffset(-this.sprite.width / 2, -this.sprite.height / 2);

    // Gentle bobbing effect
    this.bobTween = scene.tweens.add({
      targets: this.sprite,
      y: -10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.updateProjection();
  }

  update(time: number, delta: number) {
    const zSpeed = this.scrollSpeed / GAME_CONFIG.DESIGN_HEIGHT;
    this.z += zSpeed * (delta / 1000);
    
    this.updateProjection();
  }
  
  private updateProjection() {
    const p = Perspective.project(this.lane, this.z);
    this.x = p.x;
    this.y = p.y;
    const mediaScale = GAME_CONFIG.MIXED_MEDIA_SCALING[this.collectibleType as keyof typeof GAME_CONFIG.MIXED_MEDIA_SCALING] || 1.0;
    this.setScale(p.scale * mediaScale);
    
    this.setDepth(40 + this.z);
  }

  isOffScreen(): boolean {
    return this.z > 1.2;
  }

  collect() {
    this.bobTween.stop();
    // Disable physics body immediately
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
