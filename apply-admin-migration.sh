#!/bin/bash

# Admin Feature Database Migration Script
# This script helps you apply the admin feature migration to your Supabase database

echo "=================================="
echo "Admin Feature Migration"
echo "=================================="
echo ""
echo "This migration adds admin_id and selected_game columns to the rooms table."
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to: SQL Editor"
echo "3. Click 'New Query'"
echo "4. Copy and paste the following SQL:"
echo ""
echo "------- SQL START -------"
cat << 'EOF'
-- Add admin_id and selected_game columns to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS admin_id TEXT,
ADD COLUMN IF NOT EXISTS selected_game TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN rooms.admin_id IS 'ID of the first player to join the room (becomes admin)';
COMMENT ON COLUMN rooms.selected_game IS 'Game ID selected by the admin';
EOF
echo "------- SQL END -------"
echo ""
echo "5. Click 'Run' to execute the migration"
echo "6. Verify the migration was successful"
echo ""
echo "=================================="
