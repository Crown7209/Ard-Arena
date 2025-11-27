-- Fix coins for existing users and set specific user to 1000
-- First, ensure all existing users have coins set (if NULL, set to 100)
UPDATE public.users
SET coins = 100
WHERE coins IS NULL;

-- Set specific user to 1000 coins
UPDATE public.users
SET coins = 1000
WHERE email = 'n.munkhpurev@gmail.com';

-- Ensure the coins column has a default value for future inserts
ALTER TABLE public.users
ALTER COLUMN coins SET DEFAULT 100;

