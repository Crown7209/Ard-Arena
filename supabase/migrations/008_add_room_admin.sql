-- Add admin_id and selected_game columns to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS admin_id TEXT,
ADD COLUMN IF NOT EXISTS selected_game TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN rooms.admin_id IS 'ID of the first player to join the room (becomes admin)';
COMMENT ON COLUMN rooms.selected_game IS 'Game ID selected by the admin';
