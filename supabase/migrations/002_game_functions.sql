-- Function to safely join a room
CREATE OR REPLACE FUNCTION join_room(p_room_id UUID, p_player_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_room_status TEXT;
  v_player_id UUID;
  v_result JSONB;
BEGIN
  -- Lock the room row for update to prevent race conditions
  SELECT status INTO v_room_status FROM rooms WHERE id = p_room_id FOR UPDATE;
  
  IF v_room_status IS NULL THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  IF v_room_status != 'waiting' THEN
    RAISE EXCEPTION 'Game already started';
  END IF;
  
  -- Insert player
  INSERT INTO players (room_id, name, is_ready)
  VALUES (p_room_id, p_player_name, false)
  RETURNING id INTO v_player_id;
  
  -- Return the player object
  SELECT jsonb_build_object(
    'id', id,
    'room_id', room_id,
    'name', name,
    'is_ready', is_ready,
    'created_at', created_at
  ) INTO v_result FROM players WHERE id = v_player_id;
  
  RETURN v_result;
END;
$$;

-- Function to safely start a game
CREATE OR REPLACE FUNCTION start_game(p_room_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_unready_count INTEGER;
BEGIN
  -- Check for unready players
  SELECT COUNT(*) INTO v_unready_count
  FROM players
  WHERE room_id = p_room_id AND is_ready = false;
  
  IF v_unready_count > 0 THEN
    RAISE EXCEPTION 'Not all players are ready';
  END IF;
  
  -- Update room status
  UPDATE rooms
  SET status = 'playing'
  WHERE id = p_room_id;
END;
$$;
