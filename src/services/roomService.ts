import { supabase } from "@/lib/supabase";
import { Room, RoomStatus } from "@/lib/types";

export const roomService = {
  async createRoom(hostId: string): Promise<Room | null> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: hostId,
        admin_id: null, // Will be set when first player joins
        selected_game: null,
        status: "waiting",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating room:", error);
      return null;
    }
    return data;
  },

  async getRoomByCode(code: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      // console.error('Error fetching room:', error);
      return null;
    }
    return data;
  },

  async startGame(roomId: string) {
    // Try RPC first (safer)
    const { error } = await supabase.rpc("start_game", {
      p_room_id: roomId,
    });

    if (!error) return;

    console.warn(
      "RPC start_game failed, falling back to direct update:",
      error
    );

    // Fallback: Direct update (if RPC missing)
    const { error: fallbackError } = await supabase
      .from("rooms")
      .update({ status: "playing" })
      .eq("id", roomId);

    if (fallbackError) {
      console.error("Error starting game (fallback):", fallbackError);
      throw fallbackError;
    }
  },
  async updateRoomStatus(roomId: string, status: RoomStatus) {
    const { error } = await supabase
      .from("rooms")
      .update({ status })
      .eq("id", roomId);

    if (error) {
      console.error(`Error updating room status to ${status}:`, error);
      throw error;
    }
  },

  async setAdmin(roomId: string, playerId: string) {
    const { error } = await supabase
      .from("rooms")
      .update({ admin_id: playerId })
      .eq("id", roomId)
      .is("admin_id", null); // Only set if no admin yet

    if (error) {
      console.error("Error setting admin:", error);
      throw error;
    }
  },

  async selectGame(roomId: string, gameId: string, adminId: string) {
    // Verify the person selecting is the admin
    const room = await supabase
      .from("rooms")
      .select("admin_id")
      .eq("id", roomId)
      .single();

    if (room.data?.admin_id !== adminId) {
      throw new Error("Only the admin can select a game");
    }

    const { error } = await supabase
      .from("rooms")
      .update({ selected_game: gameId })
      .eq("id", roomId);

    if (error) {
      console.error("Error selecting game:", error);
      throw error;
    }
  },
};
