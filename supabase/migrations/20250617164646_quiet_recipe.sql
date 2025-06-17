/*
  # Enhanced Streak System Migration

  1. Improvements to daily_streaks table
    - Add last_activity_date for better tracking
    - Add streak_broken_date to track when streaks were broken
    - Add motivational_message_sent to prevent spam
    
  2. Functions for streak management
    - Function to calculate streak properly
    - Function to check for broken streaks
    
  3. Indexes for performance
*/

-- Add new columns to daily_streaks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_streaks' AND column_name = 'last_activity_date'
  ) THEN
    ALTER TABLE daily_streaks ADD COLUMN last_activity_date date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_streaks' AND column_name = 'streak_broken_date'
  ) THEN
    ALTER TABLE daily_streaks ADD COLUMN streak_broken_date date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_streaks' AND column_name = 'motivational_message_sent'
  ) THEN
    ALTER TABLE daily_streaks ADD COLUMN motivational_message_sent boolean DEFAULT false;
  END IF;
END $$;

-- Create index for better performance on streak queries
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date 
  ON daily_streaks (user_id, date DESC);

-- Function to get current streak for a user
CREATE OR REPLACE FUNCTION get_current_streak(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  current_streak_count integer := 0;
  check_date date := CURRENT_DATE;
  streak_record record;
BEGIN
  -- Start from today and go backwards to find consecutive days
  LOOP
    SELECT * INTO streak_record
    FROM daily_streaks
    WHERE user_id = user_uuid AND date = check_date;
    
    -- If no record for this date, streak is broken
    IF NOT FOUND THEN
      EXIT;
    END IF;
    
    -- If found, add to streak count
    current_streak_count := current_streak_count + 1;
    
    -- Move to previous day
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN current_streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if streak warning should be sent
CREATE OR REPLACE FUNCTION should_send_streak_warning(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  yesterday_record record;
  today_record record;
  yesterday_date date := CURRENT_DATE - INTERVAL '1 day';
  today_date date := CURRENT_DATE;
BEGIN
  -- Check if user had activity yesterday
  SELECT * INTO yesterday_record
  FROM daily_streaks
  WHERE user_id = user_uuid AND date = yesterday_date;
  
  -- Check if user has activity today
  SELECT * INTO today_record
  FROM daily_streaks
  WHERE user_id = user_uuid AND date = today_date;
  
  -- Send warning if:
  -- 1. User had activity yesterday (streak exists)
  -- 2. User has no activity today
  -- 3. Warning hasn't been sent yet
  IF FOUND AND yesterday_record.streak_count > 0 AND 
     NOT FOUND AND (today_record IS NULL OR NOT today_record.motivational_message_sent) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Update existing records to set last_activity_date
UPDATE daily_streaks 
SET last_activity_date = date 
WHERE last_activity_date IS NULL;