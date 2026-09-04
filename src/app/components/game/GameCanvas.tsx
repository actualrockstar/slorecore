'use client';

import { useEffect, useRef } from 'react';
import type { GameResults } from './GamePage';

interface GameCanvasProps {
  onGameOver: (results: GameResults) => void;
}

interface GameBridge {
  destroy: () => void;
}

export default function GameCanvas({ onGameOver }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let bridge: GameBridge | null = null;
    let mounted = true;

    (async () => {
      try {
        const { createGame } = await import('@/game/PhaserGameBridge');
        if (!mounted || !containerRef.current) return;
        bridge = await createGame(containerRef.current, onGameOver);
      } catch (err) {
        console.error("Failed to initialize game:", err);
      }
    })();

    const preventDefault = (e: Event) => e.preventDefault();
    const container = containerRef.current;
    
    if (container) {
      container.addEventListener('touchmove', preventDefault, { passive: false });
    }

    return () => {
      mounted = false;
      bridge?.destroy();
      if (container) {
        container.removeEventListener('touchmove', preventDefault);
      }
    };
  }, [onGameOver]);

  return (
    <div 
      ref={containerRef} 
      className="gts-game-wrapper" 
      style={{ touchAction: 'none' }}
    />
  );
}
