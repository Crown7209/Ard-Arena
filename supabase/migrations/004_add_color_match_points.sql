-- Add color_match_points column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS color_match_points INTEGER DEFAULT 0;

-- Update existing users to have 0 points if null
UPDATE public.users 
SET color_match_points = 0 
WHERE color_match_points IS NULL;

