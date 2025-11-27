# Admin-Based Game Selection - User Flow

## Scenario 1: Desktop User Creates Room

```
┌─────────────────────────────────────────────────────────────┐
│                        HOME PAGE                             │
│                                                              │
│  [User clicks "PLAY NOW"]                                   │
│         ↓                                                    │
│  Creates room with admin_id = null                          │
│         ↓                                                    │
│  Redirects to /lobby/[code]                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      LOBBY PAGE                              │
│                                                              │
│  [First player joins]                                       │
│         ↓                                                    │
│  Sets admin_id = player.id                                  │
│         ↓                                                    │
│  [Host clicks "Start Game"]                                 │
│         ↓                                                    │
│  Room status → "selecting"                                  │
│         ↓                                                    │
│  Redirects back to HOME PAGE                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    HOME PAGE (Admin)                         │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │           ROOM 1234                            │        │
│  │      You are the Admin                         │        │
│  │   Select a game below to start                 │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  [Game Browser Visible]                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Fight    │  │ Racing   │  │ Puzzle   │                │
│  │ Game     │  │ Game     │  │ Game     │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                              │
│  [Admin clicks "Fight Game"]                                │
│         ↓                                                    │
│  Saves selected_game = "fighting-game"                      │
│  Room status → "playing"                                    │
│         ↓                                                    │
│  Redirects to /game?code=1234                               │
└─────────────────────────────────────────────────────────────┘
```

## Scenario 2: Mobile User Joins Room

```
┌─────────────────────────────────────────────────────────────┐
│                        HOME PAGE                             │
│                                                              │
│  [User clicks "JOIN ROOM"]                                  │
│         ↓                                                    │
│  Redirects to /join                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                       JOIN PAGE                              │
│                                                              │
│  [User enters code: 1234]                                   │
│  [User enters name: "Player 2"]                             │
│  [Clicks "JOIN ROOM"]                                       │
│         ↓                                                    │
│  Joins room (admin already set)                             │
│         ↓                                                    │
│  Redirects to /lobby/1234                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      LOBBY PAGE                              │
│                                                              │
│  Waiting for host to start...                               │
│  [Host starts game]                                         │
│         ↓                                                    │
│  Room status → "selecting"                                  │
│         ↓                                                    │
│  Redirects to HOME PAGE                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  HOME PAGE (Non-Admin)                       │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │           ROOM 1234                            │        │
│  │       Waiting for Admin                        │        │
│  │  The admin will select a game soon...          │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  [Game Browser NOT Visible]                                 │
│                                                              │
│  [Waiting for admin to select game...]                      │
│         ↓                                                    │
│  [Admin selects game]                                       │
│  Room status → "playing"                                    │
│         ↓                                                    │
│  Redirects to /game?code=1234                               │
└─────────────────────────────────────────────────────────────┘
```

## Key Points

1. **Admin Assignment**: First player to join becomes admin automatically
2. **Admin Privileges**: Only admin can see and select games
3. **Non-Admin Experience**: Other players see "Waiting for Admin" message
4. **Game Selection**: Admin's choice is saved and all players redirect to game
5. **Security**: Game selection is verified server-side to ensure only admin can select

## Database States

### Room Creation

```
rooms table:
- id: "uuid-1"
- code: "1234"
- host_id: "host-xyz"
- admin_id: null          ← Not set yet
- selected_game: null     ← Not set yet
- status: "waiting"
```

### First Player Joins

```
rooms table:
- id: "uuid-1"
- code: "1234"
- host_id: "host-xyz"
- admin_id: "player-1"    ← Set to first player
- selected_game: null
- status: "waiting"
```

### Admin Selects Game

```
rooms table:
- id: "uuid-1"
- code: "1234"
- host_id: "host-xyz"
- admin_id: "player-1"
- selected_game: "fighting-game"  ← Set by admin
- status: "playing"               ← Changed to playing
```
