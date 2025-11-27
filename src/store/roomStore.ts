import { create } from "zustand";
import { Room } from "@/lib/types";

interface RoomState {
  room: Room | null;
  setRoom: (room: Room | null) => void;
  updateRoom: (updates: Partial<Room>) => void;
  updateRoomStatus: (status: Room["status"]) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
  updateRoom: (updates) =>
    set((state) => (state.room ? { room: { ...state.room, ...updates } } : {})),
  updateRoomStatus: (status) =>
    set((state) => (state.room ? { room: { ...state.room, status } } : {})),
}));
