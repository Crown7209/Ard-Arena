export interface Position {
  x: number;
  y: number;
}

export interface Loot {
  id: number;
  x: number;
  y: number;
  color: string;
  type: string;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: "speed" | "magnet" | "time";
  color: string;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIBot {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}
