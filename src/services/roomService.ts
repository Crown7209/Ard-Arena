import { supabase } from "@/lib/supabase";
import { Room } from "@/lib/types";

export const roomService = {
  async createRoom(hostId: string): Promise<Room | null> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: hostId,
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
};
