import * as Phaser from 'phaser';
import { GAME_CONFIG, ObstacleType } from '../config/gameConfig';
import { Perspective } from '../utils/Perspective';

export class Obstacle extends Phaser.GameObjects.Sprite {
  public lane: number;
  public obstacleType: ObstacleType;
  private scrollSpeed: number;
  public z: number = 0;

  constructor(scene: Phaser.Scene, lane: number, type: ObstacleType, speed: number) {
    super(scene, 0, 0, `obstacle_${type}`);
    
    this.lane = lane;
    this.obstacleType = type;
    this.scrollSpeed = speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.updateProjection();
  }

  update(time: number, delta: number) {
    // scrollSpeed is in pixels per second conceptually, but we need to convert it to z-speed.
    // Let's assume scrollSpeed is scaled to z-speed where max screen height is roughly the distance.
    const zSpeed = this.scrollSpeed / GAME_CONFIG.DESIGN_HEIGHT;
    this.z += zSpeed * (delta / 1000);
    
    this.updateProjection();
  }
  
  private updateProjection() {
    const p = Perspective.project(this.lane, this.z);
    this.x = p.x;
    this.y = p.y;
    const mediaScale = GAME_CONFIG.MIXED_MEDIA_SCALING[this.obstacleType as keyof typeof GAME_CONFIG.MIXED_MEDIA_SCALING] || 1.0;
    this.setScale(p.scale * mediaScale);
    
    // Depth sorting
    this.setDepth(40 + this.z);
  }

  isOffScreen(): boolean {
    return this.z > 1.2; // A bit past bottom
  }
}
