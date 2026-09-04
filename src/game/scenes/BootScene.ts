import * as Phaser from 'phaser';
import { ASSET_MANIFEST } from '../config/assetManifest';
import { GAME_CONFIG } from '../config/gameConfig';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Environment & Buildings
    this.load.image(ASSET_MANIFEST.road.key, '/game/assets/road.png');
    this.load.image(ASSET_MANIFEST.building_left.key, '/game/assets/building_left.png');
    this.load.image(ASSET_MANIFEST.building_right.key, '/game/assets/building_right.png');
    this.load.image(ASSET_MANIFEST.skyline.key, '/game/assets/skyline.png');

    // Collectibles
    this.load.image(ASSET_MANIFEST.collectible_guitar.key, '/game/assets/guitar.png');
    this.load.image(ASSET_MANIFEST.collectible_microphone.key, '/game/assets/microphone.png');
    this.load.image(ASSET_MANIFEST.collectible_drum.key, '/game/assets/drum.png');
    this.load.image(ASSET_MANIFEST.collectible_merch.key, '/game/assets/merch.png');
    this.load.image(ASSET_MANIFEST.collectible_ticket.key, '/game/assets/ticket.png');
    this.load.image(ASSET_MANIFEST.collectible_rare.key, '/game/assets/rare.png');

    // Obstacles
    this.load.image(ASSET_MANIFEST.obstacle_taxi.key, '/game/assets/taxi.png');
    this.load.image(ASSET_MANIFEST.obstacle_car.key, '/game/assets/car.png');
    this.load.image(ASSET_MANIFEST.obstacle_trash.key, '/game/assets/trash.png');
    this.load.image(ASSET_MANIFEST.obstacle_barrier.key, '/game/assets/barrier.png');
    this.load.image(ASSET_MANIFEST.obstacle_bike.key, '/game/assets/bike.png');
    this.load.image(ASSET_MANIFEST.obstacle_rat.key, '/game/assets/rat.png');
    this.load.image(ASSET_MANIFEST.obstacle_pothole.key, '/game/assets/pothole.png');

    // Player (try loading player.png if added)
    this.load.image(ASSET_MANIFEST.player.key, '/game/assets/player.png');
  }

  create() {
    // Generate fallback programmatic textures for any missing assets
    this.generateFallbackTextures();
    this.scene.start('GameScene');
  }

  private generateFallbackTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Player (fallback if player.png doesn't exist)
    if (!this.textures.exists(ASSET_MANIFEST.player.key)) {
      graphics.clear();
      graphics.fillStyle(0x8b008b, 1); // Dark magenta
      graphics.fillRoundedRect(0, 15, 36, 35, 8); // Body
      graphics.fillStyle(0xffc0cb, 1);
      graphics.fillCircle(18, 10, 10); // Head
      graphics.generateTexture(ASSET_MANIFEST.player.key, 36, 50);
    }

    // Building Left (fallback)
    if (!this.textures.exists(ASSET_MANIFEST.building_left.key)) {
      graphics.clear();
      graphics.fillStyle(0x1a1a3a, 1);
      graphics.fillRect(0, 0, 60, 200);
      graphics.fillStyle(0xffff00, 0.5);
      graphics.fillRect(10, 20, 15, 20);
      graphics.fillRect(35, 80, 15, 20);
      graphics.generateTexture(ASSET_MANIFEST.building_left.key, 60, 200);
    }

    // Building Right (fallback)
    if (!this.textures.exists(ASSET_MANIFEST.building_right.key)) {
      graphics.clear();
      graphics.fillStyle(0x201a3a, 1);
      graphics.fillRect(0, 0, 60, 200);
      graphics.fillStyle(0xffff00, 0.5);
      graphics.fillRect(10, 50, 15, 20);
      graphics.fillRect(35, 120, 15, 20);
      graphics.generateTexture(ASSET_MANIFEST.building_right.key, 60, 200);
    }

    graphics.destroy();
  }

  private createRectTexture(graphics: Phaser.GameObjects.Graphics, key: string, w: number, h: number, color: number) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, w, h);
    graphics.generateTexture(key, w, h);
  }
}
