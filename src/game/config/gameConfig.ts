/// <reference types="phaser" />

export const GAME_CONFIG = {
  GAME_DURATION: 60,
  LANE_COUNT: 3,
  DESIGN_WIDTH: 390,
  DESIGN_HEIGHT: 700,

  PERSPECTIVE: {
    VANISHING_POINT_Y: 220, // Horizon Y in pixels (out of 700)
    HORIZON_ROAD_WIDTH: 70, // Road width at horizon in pixels
    BOTTOM_ROAD_WIDTH: 340, // Road width at bottom of screen
    HORIZON_SCALE: 0.2,     // Scale multiplier for objects at horizon
    BOTTOM_SCALE: 1.0,      // Scale multiplier for objects at player depth
    PLAYER_Z: 0.88,         // Depth position of player (0.0 = horizon, 1.0 = bottom)
    HORIZON_Y: 220,         // Match vanishing point Y
    BOTTOM_Y: 670,          // Y position of screen bottom
  },

  MIXED_MEDIA_SCALING: {
    player: 1.0,
    taxi: 0.8,
    car: 0.9,
    trash: 0.6,
    barrier: 0.8,
    bike: 1.0,
    rat: 0.5,
    pothole: 0.7,
    guitar: 0.75,
    microphone: 0.5,
    drum: 0.7,
    merch: 0.9,
    ticket: 0.5,
    rare: 0.7,
  },
  
  PLAYER: {
    Y_POSITION: 0.82, // fraction of screen height
    LANE_SWITCH_DURATION: 150, // ms
    JUMP_DURATION: 500, // ms
    JUMP_HEIGHT: 80,
    STUN_DURATION: 800, // ms
    INVULNERABLE_DURATION: 1500, // ms
  },
  
  SCORING: {
    GUITAR: 100,
    MICROPHONE: 100,
    DRUM: 100,
    MERCH: 150,
    TICKET: 200,
    RARE: 500, // golden record
  },
  
  OBSTACLE_PENALTY: {
    SCORE_LOSS: 50,
    STUN_DURATION: 800,
  },
  
  DIFFICULTY: {
    INITIAL_SPAWN_INTERVAL: 1200,
    MIN_SPAWN_INTERVAL: 450,
    SPEED_INCREASE_RATE: 0.015,
    INITIAL_SCROLL_SPEED: 150,
    MAX_SCROLL_SPEED: 340,
  },
  
  COLLECTIBLE_SPAWN_CHANCE: 0.45,
  RARE_ITEM_CHANCE: 0.05,
};

export type CollectibleType = 'guitar' | 'microphone' | 'drum' | 'merch' | 'ticket' | 'rare';
export type ObstacleType = 'taxi' | 'car' | 'trash' | 'barrier' | 'bike' | 'rat' | 'pothole';

export interface GameResults {
  score: number;
  itemsCollected: Record<string, number>;
  totalItems: number;
  timeElapsed: number;
}
