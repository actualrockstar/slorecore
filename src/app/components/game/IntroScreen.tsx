'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTopScores } from '@/app/services/leaderboard/leaderboardService';

interface IntroScreenProps {
  onStart: (name: string) => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [name, setName] = useState('');
  const [scores, setScores] = useState<Array<{ id: string; player_name: string; score: number; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScores() {
      try {
        const topScores = await getTopScores(5);
        setScores(topScores);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScores();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="gts-screen">
      <div className="gts-logo">
        <Image src="/trans-logo-fix.png" alt="The Slores" width={200} height={80} priority />
      </div>
      <h1 className="gts-title">Get To The Show</h1>
      <h2 className="gts-subtitle">Arcade Runner</h2>

      <div className="gts-instructions">
        <span><strong>Mobile:</strong> Swipe Left/Right to Dodge, Swipe Up to Jump</span>
        <span><strong>Desktop:</strong> Arrow Keys / WASD to Move, Space to Jump</span>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="text"
          className="gts-input"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={15}
        />
        <button type="submit" className="gts-btn-start" disabled={!name.trim()}>
          Start Game
        </button>
      </form>

      <div className="gts-leaderboard">
        <h3 className="gts-leaderboard-title">Top Scores</h3>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading scores...</p>
        ) : scores.length > 0 ? (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr key={score.id || index}>
                  <td>#{index + 1}</td>
                  <td>{score.player_name}</td>
                  <td className="gts-score">{score.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>No scores yet or leaderboard unavailable.</p>
        )}
      </div>
    </div>
  );
}
