-- Add coins column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 100;

-- Update existing users to have 100 coins if they don't have any
UPDATE public.users
SET coins = 100
WHERE coins IS NULL;

-- Update trigger function to include coins for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, coins)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username', 100);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

