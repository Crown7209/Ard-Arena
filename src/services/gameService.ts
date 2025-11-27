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

    this.channel.subscribe();
  }

  /**
   * Broadcast a move to other players
   */
  async sendMove(move: string) {
    if (!this.channel) return;
    await this.channel.send({
      type: "broadcast",
      event: "move",
      payload: {
        playerId: this.playerId,
        move,
        timestamp: Date.now(),
      } as GameMove,
    });
  }

  /**
   * Broadcast position update
   */
  async sendPosition(x: number, y: number) {
    if (!this.channel) return;
    await this.channel.send({
      type: "broadcast",
      event: "position",
      payload: {
        playerId: this.playerId,
        x,
        y,
        timestamp: Date.now(),
      } as GamePosition,
    });
  }

  /**
   * Broadcast life update
   */
  async sendLife(life: number) {
    if (!this.channel) return;
    await this.channel.send({
      type: "broadcast",
      event: "life",
      payload: {
        playerId: this.playerId,
        life,
        timestamp: Date.now(),
      } as GameLife,
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
