# Admin-Based Game Selection Feature

## Overview

Implemented a system where the first person to join a room becomes the admin and can select which game to play. Other players wait for the admin's selection.

## Changes Made

### 1. Database Schema Updates

**File**: `supabase/migrations/008_add_room_admin.sql`

- Added `admin_id` column to `rooms` table (stores the ID of the first player to join)
- Added `selected_game` column to `rooms` table (stores the game ID selected by admin)

**To apply migration**: Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS admin_id TEXT,
ADD COLUMN IF NOT EXISTS selected_game TEXT;
```

### 2. Type Definitions

**File**: `src/lib/types.ts`

- Updated `Room` interface to include:
  - `admin_id: string | null` - First person to join becomes admin
  - `selected_game: string | null` - Game selected by admin

### 3. Room Service

**File**: `src/services/roomService.ts`

- Updated `createRoom()` to initialize `admin_id` and `selected_game` as null
- Added `setAdmin(roomId, playerId)` - Sets the admin (only if no admin exists)
- Added `selectGame(roomId, gameId, adminId)` - Allows admin to select a game (verifies admin status)

### 4. Player Service

**File**: `src/services/playerService.ts`

- Updated `joinRoom()` to automatically set the first player as admin
- Added `trySetAsAdmin()` helper method that attempts to set player as admin (fails silently if admin already exists)

### 5. Home Page

**File**: `src/app/page.tsx`

- Added admin detection: `isAdmin` checks if current player is the room admin
- Updated `handleStartSelectedGame()` to:
  - Verify the user is admin before allowing game selection
  - Call `selectGame()` to record the admin's choice
  - Start the game after selection
- Updated UI to show different states:
  - **No room**: Shows normal "PLAY NOW" / "JOIN ROOM" buttons
  - **In room as admin**: Shows "You are the Admin" message and game browser
  - **In room as non-admin**: Shows "Waiting for Admin" message (no game browser)
- GameBrowser only shows when:
  - User is not in a room, OR
  - User is the admin of the room

### 6. Game Browser

**File**: `src/components/game/GameBrowser.tsx`

- Already supports `onGameSelect` callback prop
- When admin clicks a game, it calls the callback instead of creating a new room

## How It Works

### Flow for Creating a Room (Desktop):

1. User clicks "PLAY NOW" on home page
2. System creates a room with `admin_id = null`
3. User is redirected to lobby
4. When first player joins the lobby, they become admin
5. Admin can start game selection from lobby

### Flow for Joining a Room:

1. User enters room code on join page
2. System checks if room exists and is in "waiting" status
3. Player joins the room
4. If `admin_id` is null, this player becomes admin
5. Player is redirected to lobby
6. Lobby redirects to home page when status becomes "selecting"
7. **Admin sees**: "You are the Admin - Select a game below to start"
8. **Non-admin sees**: "Waiting for Admin - The admin will select a game soon..."
9. Only admin can see and click on games in GameBrowser
10. When admin selects a game:
    - Game ID is saved to `selected_game` column
    - Room status changes to "playing"
    - All players are redirected to the game

## Testing Steps

1. **Apply the database migration** (see SQL above)
2. **Test as Admin**:
   - Open home page
   - Click "PLAY NOW" (desktop) or "JOIN ROOM" (mobile)
   - Join the room with a name
   - You should see "You are the Admin" message
   - Game browser should be visible below
   - Click on any game to start
3. **Test as Non-Admin**:
   - Get the room code from admin
   - Open join page in another browser/incognito
   - Enter room code and name
   - You should see "Waiting for Admin" message
   - Game browser should NOT be visible
   - Wait for admin to select a game
4. **Test Game Selection**:
   - Admin selects a game
   - Both admin and non-admin should be redirected to the game

## Notes

- The admin is determined by whoever joins first, not by who created the room
- This allows mobile users to create rooms and have the first person to join become admin
- The admin check is done on the client side using localStorage playerId
- Game selection is verified on the server side in `selectGame()` method
