import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface GameMove {
  playerId: string;
  move: string; // MoveType is a string union
  timestamp: number;
}

export interface GamePosition {
  playerId: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface GameLife {
  playerId: string;
  life: number;
  timestamp: number;
}

export interface GameState {
  playerId: string;
  gameState: "playing" | "round-winner" | "final-winner";
  roundWinner?: number;
  finalWinner?: number;
  player1Wins: number;
  player2Wins: number;
  currentRound: number;
  timestamp: number;
}

export class GameRealtimeService {
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private playerId: string;

  constructor(roomId: string, playerId: string) {
    this.roomId = roomId;
    this.playerId = playerId;
  }

  /**
   * Subscribe to game events for this room
   */
  subscribe(callbacks: {
    onMove?: (data: GameMove) => void;
    onPosition?: (data: GamePosition) => void;
    onLife?: (data: GameLife) => void;
    onGameState?: (data: GameState) => void;
  }) {
    this.channel = supabase.channel(`game:${this.roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own messages
      },
    });

    // Listen for move events
    if (callbacks.onMove) {
      this.channel.on("broadcast", { event: "move" }, ({ payload }) => {
        if (payload.playerId !== this.playerId) {
          callbacks.onMove!(payload as GameMove);
        }
      });
    }

    // Listen for position updates
    if (callbacks.onPosition) {
      this.channel.on("broadcast", { event: "position" }, ({ payload }) => {
        if (payload.playerId !== this.playerId) {
          callbacks.onPosition!(payload as GamePosition);
        }
      });
    }

    // Listen for life updates
    if (callbacks.onLife) {
      this.channel.on("broadcast", { event: "life" }, ({ payload }) => {
        if (payload.playerId !== this.playerId) {
          callbacks.onLife!(payload as GameLife);
        }
      });
    }

    // Listen for game state updates (round winner, final winner, wins, etc.)
    if (callbacks.onGameState) {
      this.channel.on("broadcast", { event: "gameState" }, ({ payload }) => {
        callbacks.onGameState!(payload as GameState);
      });
    }

    this.channel.subscribe();
  }

  /**
   * Broadcast a move to other players (fire-and-forget for zero delay)
   */
  sendMove(move: string) {
    if (!this.channel) return;
    // Fire and forget - don't await to avoid any delay
    this.channel.send({
      type: "broadcast",
      event: "move",
      payload: {
        playerId: this.playerId,
        move,
        timestamp: Date.now(),
      } as GameMove,
    }).catch(() => {
      // Silently ignore errors to avoid blocking
    });
  }

  /**
   * Broadcast position update (fire-and-forget for zero delay)
   */
  sendPosition(x: number, y: number) {
    if (!this.channel) return;
    // Fire and forget - don't await to avoid any delay
    this.channel.send({
      type: "broadcast",
      event: "position",
      payload: {
        playerId: this.playerId,
        x,
        y,
        timestamp: Date.now(),
      } as GamePosition,
    }).catch(() => {
      // Silently ignore errors to avoid blocking
    });
  }

  /**
   * Broadcast life update (fire-and-forget for zero delay)
   */
  sendLife(life: number) {
    if (!this.channel) return;
    // Fire and forget - don't await to avoid any delay
    this.channel.send({
      type: "broadcast",
      event: "life",
      payload: {
        playerId: this.playerId,
        life,
        timestamp: Date.now(),
      } as GameLife,
    }).catch(() => {
      // Silently ignore errors to avoid blocking
    });
  }

  /**
   * Broadcast game state update (round winner, final winner, wins, round number)
   */
  sendGameState(gameState: {
    gameState: "playing" | "round-winner" | "final-winner";
    roundWinner?: number;
    finalWinner?: number;
    player1Wins: number;
    player2Wins: number;
    currentRound: number;
  }) {
    if (!this.channel) return;
    // Fire and forget - don't await to avoid any delay
    this.channel.send({
      type: "broadcast",
      event: "gameState",
      payload: {
        playerId: this.playerId,
        ...gameState,
        timestamp: Date.now(),
      } as GameState,
    }).catch(() => {
      // Silently ignore errors to avoid blocking
    });
  }

  /**
   * Unsubscribe and cleanup
   */
  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
