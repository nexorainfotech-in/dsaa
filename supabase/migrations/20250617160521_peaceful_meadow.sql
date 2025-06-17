/*
  # Add User Journey Tracking

  1. New Tables
    - `user_journey`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `journey_start_date` (date)
      - `current_day` (integer, default 1)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_journey` table
    - Add policies for authenticated users to manage their own journey

  3. Changes
    - Add journey tracking for personalized learning paths
    - Track user's current day independent of calendar dates
*/

CREATE TABLE IF NOT EXISTS user_journey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  journey_start_date date NOT NULL DEFAULT CURRENT_DATE,
  current_day integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journey"
  ON user_journey
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey"
  ON user_journey
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey"
  ON user_journey
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create unique constraint to ensure one active journey per user
CREATE UNIQUE INDEX IF NOT EXISTS user_journey_active_unique 
  ON user_journey (user_id) 
  WHERE is_active = true;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_journey_updated_at'
  ) THEN
    CREATE TRIGGER update_user_journey_updated_at
      BEFORE UPDATE ON user_journey
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;