-- Set coins to 1000 for user with email n.munkhpurev@gmail.com
UPDATE public.users
SET coins = 1000
WHERE email = 'n.munkhpurev@gmail.com';

-- If the user doesn't exist yet, this will be handled by the trigger when they sign up
-- But we can also ensure they get 1000 coins if they exist
-- Note: This will only work if the user already exists in the users table

