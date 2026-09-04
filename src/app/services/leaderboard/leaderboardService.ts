import { getSupabaseClient } from './supabaseClient';

export async function submitScore(
  playerName: string,
  score: number,
  itemsCollected: Record<string, number>
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('scores')
      .insert([
        {
          player_name: playerName,
          score,
          items_collected: itemsCollected,
        }
      ]);
      
    if (error) {
      console.error('[Leaderboard] Error submitting score:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Leaderboard] Exception submitting score:', err);
    return false;
  }
}

export async function getTopScores(
  limit: number = 5
): Promise<Array<{ id: string; player_name: string; score: number; created_at: string }>> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id, player_name, score, created_at')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Leaderboard] Error fetching top scores:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Leaderboard] Exception fetching top scores:', err);
    return [];
  }
}

export async function getPlayerRank(
  score: number
): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .gt('score', score);

    if (error) {
      console.error('[Leaderboard] Error fetching player rank:', error);
      return 0;
    }

    return (count || 0) + 1;
  } catch (err) {
    console.error('[Leaderboard] Exception fetching player rank:', err);
    return 0;
  }
}
