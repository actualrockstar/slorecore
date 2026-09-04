import * as Phaser from 'phaser';
import { GAME_CONFIG, GameResults, ObstacleType, CollectibleType } from '../config/gameConfig';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Collectible } from '../objects/Collectible';
import { ScrollManager } from '../systems/ScrollManager';
import { SpawnSystem } from '../systems/SpawnSystem';
import { InputManager } from '../systems/InputManager';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private scrollManager!: ScrollManager;
  private spawnSystem!: SpawnSystem;
  private inputManager!: InputManager;

  private obstacles!: Phaser.GameObjects.Group;
  private collectibles!: Phaser.GameObjects.Group;

  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  private score: number = 0;
  private timeRemaining: number = 0;
  private itemsCollected: Record<string, number> = {};
  private isGameOver: boolean = false;
  
  private currentScrollSpeed: number = 0;
  private gameTimerEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super('GameScene');
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.timeRemaining = GAME_CONFIG.GAME_DURATION;
    this.itemsCollected = {};
    this.currentScrollSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SCROLL_SPEED;

    this.scrollManager = new ScrollManager(this);
    this.player = new Player(this);
    
    this.obstacles = this.add.group({ runChildUpdate: true });
    this.collectibles = this.add.group({ runChildUpdate: true });

    this.inputManager = new InputManager(this);
    this.inputManager.on('move-left', () => this.player.switchLane(-1));
    this.inputManager.on('move-right', () => this.player.switchLane(1));
    this.inputManager.on('jump', () => this.player.jump());

    this.spawnSystem = new SpawnSystem(
      (lane: number, type: ObstacleType) => {
        const obs = new Obstacle(this, lane, type, this.currentScrollSpeed);
        this.obstacles.add(obs);
      },
      (lane: number, type: CollectibleType) => {
        const col = new Collectible(this, lane, type, this.currentScrollSpeed);
        this.collectibles.add(col);
      }
    );

    this.createHUD();

    this.gameTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tickTime,
      callbackScope: this,
      loop: true
    });
  }

  private createHUD() {
    // Top bar background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, 40);
    bg.setDepth(100);

    this.scoreText = this.add.text(10, 10, 'SCORE: 0', {
      fontSize: '18px',
      color: '#fff',
      fontStyle: 'bold'
    }).setDepth(101);

    this.timeText = this.add.text(GAME_CONFIG.DESIGN_WIDTH - 10, 10, `TIME: ${this.timeRemaining}`, {
      fontSize: '18px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(101);
  }

  private tickTime() {
    if (this.isGameOver) return;
    
    this.timeRemaining--;
    this.timeText.setText(`TIME: ${this.timeRemaining}`);

    if (this.timeRemaining <= 0) {
      this.endGame();
    }
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    // Increase difficulty speed
    const progress = 1 - (this.timeRemaining / GAME_CONFIG.GAME_DURATION);
    this.currentScrollSpeed = Phaser.Math.Linear(
      GAME_CONFIG.DIFFICULTY.INITIAL_SCROLL_SPEED,
      GAME_CONFIG.DIFFICULTY.MAX_SCROLL_SPEED,
      progress
    );

    this.scrollManager.update(this.currentScrollSpeed);
    this.spawnSystem.update(delta);

    // Collision checks based on depth (z) and lane
    const collisionThresholdZ = 0.05;
    
    this.obstacles.getChildren().forEach((child: any) => {
      const obs = child as Obstacle;
      if (
        Math.abs(obs.z - GAME_CONFIG.PERSPECTIVE.PLAYER_Z) < collisionThresholdZ &&
        this.player.currentLane === obs.lane
      ) {
        this.handleObstacleCollision(this.player, obs);
      }
      if (obs.isOffScreen()) obs.destroy();
    });
    
    this.collectibles.getChildren().forEach((child: any) => {
      const col = child as Collectible;
      if (
        Math.abs(col.z - GAME_CONFIG.PERSPECTIVE.PLAYER_Z) < collisionThresholdZ &&
        this.player.currentLane === col.lane
      ) {
        this.handleCollectibleCollision(this.player, col);
      }
      if (col.isOffScreen()) col.destroy();
    });
  }

  private handleObstacleCollision(player: Player, obstacle: Obstacle) {
    if (this.isGameOver || player.isInvulnerable) return;
    
    if (player.isJumping) {
      // Jumped over
      return;
    }

    player.stun();
    this.score = Math.max(0, this.score - GAME_CONFIG.OBSTACLE_PENALTY.SCORE_LOSS);
    this.scoreText.setText(`SCORE: ${this.score}`);
    
    // Flash camera red
    this.cameras.main.flash(200, 255, 0, 0);
  }

  private handleCollectibleCollision(player: Player, collectible: Collectible) {
    // Only collect if not already collecting (active is checked by whether it's destroyed soon, but we need a flag)
    // We can rely on `collectible.active` or physics body `enable`, but we removed physics usage partly.
    // However Collectible's collect() method disables its body. Let's add a boolean to it or check active.
    if (this.isGameOver || !collectible.active) return;
    // We might have just called collect, but it takes 300ms to destroy.
    // Let's rely on checking if it's already in the process of being collected.
    // In Collectible.ts we disabled physics, so let's check a custom flag if needed,
    // or just check if it's tweening out.
    if ((collectible as any)._isCollected) return;
    (collectible as any)._isCollected = true;

    const type = collectible.collectibleType;
    const points = GAME_CONFIG.SCORING[type.toUpperCase() as keyof typeof GAME_CONFIG.SCORING] || 100;
    
    this.score += points;
    this.scoreText.setText(`SCORE: ${this.score}`);
    
    this.itemsCollected[type] = (this.itemsCollected[type] || 0) + 1;
    
    collectible.collect();
  }

  private endGame() {
    this.isGameOver = true;
    this.physics.pause();
    this.gameTimerEvent.remove();
    this.inputManager.destroy();
    this.spawnSystem.destroy();
    
    let totalItems = 0;
    for (const val of Object.values(this.itemsCollected)) {
      totalItems += val;
    }

    const results: GameResults = {
      score: this.score,
      itemsCollected: this.itemsCollected,
      totalItems,
      timeElapsed: GAME_CONFIG.GAME_DURATION - Math.max(0, this.timeRemaining)
    };

    this.events.emit('game-over', results);
  }
}
