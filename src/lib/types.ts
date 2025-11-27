export type RoomStatus = "waiting" | "selecting" | "playing";

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  is_ready: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  wins: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at">;
        Update: Partial<Omit<Room, "id" | "created_at">>;
      };
      players: {
        Row: Player;
        Insert: Omit<Player, "id" | "created_at">;
        Update: Partial<Omit<Player, "id" | "created_at">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "created_at">;
        Update: Partial<Omit<User, "created_at">>;
      };
    };
  };
}
