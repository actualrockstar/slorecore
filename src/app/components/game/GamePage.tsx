'use client';

import { useState, useCallback } from 'react';
import './game.css';
import IntroScreen from './IntroScreen';
import CountdownOverlay from './CountdownOverlay';
import GameCanvas from './GameCanvas';
import ResultsScreen from './ResultsScreen';

// This interface MUST match src/game/config/gameConfig.ts
export interface GameResults {
  score: number;
  itemsCollected: Record<string, number>;
  totalItems: number;
  timeElapsed: number;
}

type GameState = 'intro' | 'countdown' | 'playing' | 'results';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [playerName, setPlayerName] = useState('');
  const [results, setResults] = useState<GameResults | null>(null);

  const handleStart = useCallback((name: string) => {
    setPlayerName(name);
    setGameState('countdown');
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((gameResults: GameResults) => {
    setResults(gameResults);
    setGameState('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setResults(null);
    setGameState('intro');
  }, []);

  return (
    <div className="gts-container">
      {gameState === 'intro' && (
        <IntroScreen onStart={handleStart} />
      )}
      {gameState === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}
      {gameState === 'playing' && (
        <GameCanvas onGameOver={handleGameOver} />
      )}
      {gameState === 'results' && results && (
        <ResultsScreen
          playerName={playerName}
          results={results}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
