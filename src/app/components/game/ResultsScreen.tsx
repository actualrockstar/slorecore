'use client';

import { useState, useEffect } from 'react';
import type { GameResults } from './GamePage';
import { submitScore, getTopScores, getPlayerRank } from '@/app/services/leaderboard/leaderboardService';

interface ResultsScreenProps {
  playerName: string;
  results: GameResults;
  onPlayAgain: () => void;
}

export default function ResultsScreen({ playerName, results, onPlayAgain }: ResultsScreenProps) {
  const [topScores, setTopScores] = useState<Array<{ id: string; player_name: string; score: number; created_at: string }>>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleResults() {
      try {
        await submitScore(playerName, results.score, results.itemsCollected);
        const [scores, currentRank] = await Promise.all([
          getTopScores(5),
          getPlayerRank(results.score)
        ]);
        setTopScores(scores);
        setRank(currentRank);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    handleResults();
  }, [playerName, results]);

  const itemIcons: Record<string, string> = {
    guitar: '🎸',
    mic: '🎙️',
    drum: '🥁',
    merch: '👕',
    ticket: '🎫',
    golden_record: '💿'
  };

  return (
    <div className="gts-screen">
      <div className="gts-results">
        <h1 className="gts-title">Game Over</h1>
        
        <div className="gts-score-display">
          {results.score}
        </div>

        {rank !== null && rank > 0 && (
          <div className="gts-rank">
            You placed #{rank}!
          </div>
        )}

        <div className="gts-items-grid">
          {Object.entries(results.itemsCollected).map(([item, count]) => (
            <div key={item} className="gts-item">
              <span className="gts-item-icon">{itemIcons[item] || '📦'}</span>
              <span className="gts-item-count">{count}</span>
            </div>
          ))}
        </div>

        <button onClick={onPlayAgain} className="gts-btn-play-again" style={{ marginBottom: '20px' }}>
          Play Again
        </button>

        <div className="gts-leaderboard" style={{ margin: '0 auto' }}>
          <h3 className="gts-leaderboard-title">Top Scores</h3>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading...</p>
          ) : topScores.length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {topScores.map((score, index) => (
                  <tr key={score.id || index}>
                    <td>#{index + 1}</td>
                    <td>{score.player_name}</td>
                    <td className="gts-score">{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>Leaderboard unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
