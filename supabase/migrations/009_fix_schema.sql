-- Ensure color_match_points column exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS color_match_points INTEGER DEFAULT 0;

-- Ensure coins column exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 100;

-- Update existing users to have default values if null
UPDATE public.users 
SET color_match_points = 0 
WHERE color_match_points IS NULL;

UPDATE public.users
SET coins = 100
WHERE coins IS NULL;
