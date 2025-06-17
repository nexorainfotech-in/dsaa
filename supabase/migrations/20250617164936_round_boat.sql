/*
  # Profile Enhancements

  1. New Columns
    - Add bio, goals, preferred_topics, target_completion_date to profiles table
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'goals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN goals text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_topics'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_topics text[];
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'target_completion_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN target_completion_date date;
  END IF;
END $$;