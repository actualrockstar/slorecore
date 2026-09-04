import * as Phaser from 'phaser';
import { GAME_CONFIG, CollectibleType, ObstacleType } from '../config/gameConfig';

export class SpawnSystem {
  private lastSpawnTime: number = 0;
  private currentSpawnInterval: number;
  private elapsedSinceStart: number = 0;
  
  private spawnObstacleCallback: (lane: number, type: ObstacleType) => void;
  private spawnCollectibleCallback: (lane: number, type: CollectibleType) => void;

  private obstacleTypes: ObstacleType[] = ['taxi', 'car', 'trash', 'barrier', 'bike', 'rat', 'pothole'];
  private collectibleTypes: CollectibleType[] = ['guitar', 'microphone', 'drum', 'merch', 'ticket'];

  constructor(
    spawnObstacle: (lane: number, type: ObstacleType) => void,
    spawnCollectible: (lane: number, type: CollectibleType) => void
  ) {
    this.spawnObstacleCallback = spawnObstacle;
    this.spawnCollectibleCallback = spawnCollectible;
    this.currentSpawnInterval = GAME_CONFIG.DIFFICULTY.INITIAL_SPAWN_INTERVAL;
  }

  update(elapsedTimeMs: number) {
    this.elapsedSinceStart += elapsedTimeMs;
    
    // Ramp up difficulty
    const progress = Math.min(this.elapsedSinceStart / (GAME_CONFIG.GAME_DURATION * 1000), 1);
    this.currentSpawnInterval = Phaser.Math.Linear(
      GAME_CONFIG.DIFFICULTY.INITIAL_SPAWN_INTERVAL,
      GAME_CONFIG.DIFFICULTY.MIN_SPAWN_INTERVAL,
      progress
    );

    if (this.elapsedSinceStart - this.lastSpawnTime >= this.currentSpawnInterval) {
      this.spawnEntity();
      this.lastSpawnTime = this.elapsedSinceStart;
    }
  }

  private spawnEntity() {
    const lane = Phaser.Math.Between(0, GAME_CONFIG.LANE_COUNT - 1);
    const isCollectible = Math.random() < GAME_CONFIG.COLLECTIBLE_SPAWN_CHANCE;

    if (isCollectible) {
      let type: CollectibleType;
      if (Math.random() < GAME_CONFIG.RARE_ITEM_CHANCE) {
        type = 'rare';
      } else {
        type = Phaser.Utils.Array.GetRandom(this.collectibleTypes) as CollectibleType;
      }
      this.spawnCollectibleCallback(lane, type);
    } else {
      const type = Phaser.Utils.Array.GetRandom(this.obstacleTypes) as ObstacleType;
      this.spawnObstacleCallback(lane, type);
    }
  }

  destroy() {
    this.spawnObstacleCallback = () => {};
    this.spawnCollectibleCallback = () => {};
  }
}
