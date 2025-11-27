import { create } from "zustand";
import { Player } from "@/lib/types";

interface PlayerState {
  players: Player[];
  currentPlayerId: string | null;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setCurrentPlayerId: (id: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],
  currentPlayerId: null,
  setPlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, ...updates } : p
      ),
    })),
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
}));
