-- Get To The Show - Leaderboard Scores Table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Create the scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL CHECK (char_length(player_name) > 0 AND char_length(player_name) <= 50),
  score INTEGER NOT NULL CHECK (score >= 0),
  items_collected JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for leaderboard queries (top scores)
CREATE INDEX IF NOT EXISTS idx_scores_score_desc ON scores (score DESC);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read scores (leaderboard is public)
CREATE POLICY "Scores are viewable by everyone"
  ON scores
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert scores (using anon key)
-- NOTE: For production with prizes, move score submission behind
-- a Supabase Edge Function with server-side validation.
CREATE POLICY "Anyone can submit a score"
  ON scores
  FOR INSERT
  WITH CHECK (true);

-- No UPDATE or DELETE policies = scores are immutable from the client
-- This prevents tampering with existing scores via the anon key.
