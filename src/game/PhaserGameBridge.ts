import { GAME_CONFIG, GameResults } from './config/gameConfig';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

export interface GameBridge {
  destroy: () => void;
}

export async function createGame(
  parentElement: HTMLElement,
  onGameOver: (results: GameResults) => void
): Promise<GameBridge> {
  // Dynamically import Phaser
  const Phaser = await import('phaser');

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.DESIGN_WIDTH,
    height: GAME_CONFIG.DESIGN_HEIGHT,
    parent: parentElement,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0, x: 0 },
        debug: false
      }
    },
    scene: [BootScene, GameScene]
  };

  const game = new Phaser.Game(config);

  // Wait for game scene to be added and start listening to its events
  const onSceneReady = () => {
    const gameScene = game.scene.getScene('GameScene');
    if (gameScene) {
      gameScene.events.once('game-over', (results: GameResults) => {
        onGameOver(results);
      });
    } else {
      // If not immediately available, try again shortly
      setTimeout(onSceneReady, 50);
    }
  };
  
  game.events.once('ready', onSceneReady);

  return {
    destroy: () => {
      game.destroy(true);
    }
  };
}
