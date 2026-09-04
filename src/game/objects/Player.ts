import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { Perspective } from '../utils/Perspective';

export class Player extends Phaser.GameObjects.Container {
  public currentLane: number = 1;
  public currentLaneFloat: number = 1;
  public z: number = GAME_CONFIG.PERSPECTIVE.PLAYER_Z;
  
  public _isJumping: boolean = false;
  public _isStunned: boolean = false;
  public _isInvulnerable: boolean = false;

  private sprite: Phaser.GameObjects.Sprite;
  private jumpTween?: Phaser.Tweens.Tween;
  private laneTween?: Phaser.Tweens.Tween;
  
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    
    this.sprite = scene.add.sprite(0, 0, 'player');
    this.add(this.sprite);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 50);
    body.setOffset(-18, -25);
    
    this.setDepth(50);
    
    this.updateProjection();
  }

  public get isJumping(): boolean { return this._isJumping; }
  public get isStunned(): boolean { return this._isStunned; }
  public get isInvulnerable(): boolean { return this._isInvulnerable; }

  private updateProjection() {
    const p = Perspective.project(this.currentLaneFloat, this.z);
    this.x = p.x;
    this.y = p.y;
    const mediaScale = GAME_CONFIG.MIXED_MEDIA_SCALING.player || 1.0;
    this.setScale(p.scale * mediaScale);
  }

  preUpdate() {
    this.updateProjection();
  }

  public switchLane(direction: -1 | 1) {
    if (this._isStunned) return;
    
    const targetLane = this.currentLane + direction;
    if (targetLane < 0 || targetLane >= GAME_CONFIG.LANE_COUNT) return;

    this.currentLane = targetLane;

    if (this.laneTween) this.laneTween.stop();
    this.laneTween = this.scene.tweens.add({
      targets: this,
      currentLaneFloat: targetLane,
      duration: GAME_CONFIG.PLAYER.LANE_SWITCH_DURATION,
      ease: 'Sine.easeOut'
    });
  }

  public jump() {
    if (this._isJumping || this._isStunned) return;
    this._isJumping = true;

    if (this.jumpTween) this.jumpTween.stop();
    
    this.jumpTween = this.scene.tweens.add({
      targets: this.sprite,
      y: -GAME_CONFIG.PLAYER.JUMP_HEIGHT,
      duration: GAME_CONFIG.PLAYER.JUMP_DURATION / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.sprite.y = 0;
        this._isJumping = false;
      }
    });
  }

  public stun() {
    if (this._isInvulnerable || this._isStunned) return;

    this._isStunned = true;
    this._isInvulnerable = true;

    // Shake and flash effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 7, // Total ~1600ms invulnerability
    });

    this.scene.time.delayedCall(GAME_CONFIG.PLAYER.STUN_DURATION, () => {
      this._isStunned = false;
    });

    this.scene.time.delayedCall(GAME_CONFIG.PLAYER.INVULNERABLE_DURATION, () => {
      this._isInvulnerable = false;
      this.sprite.alpha = 1;
    });
  }
}
