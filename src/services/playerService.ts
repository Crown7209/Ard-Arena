import { supabase } from "@/lib/supabase";
import { Player } from "@/lib/types";

export const playerService = {
  async joinRoom(roomId: string, name: string): Promise<Player | null> {
    // Try RPC first (safer)
    const { data, error } = await supabase.rpc("join_room", {
      p_room_id: roomId,
      p_player_name: name,
    });

    if (!error) return data as Player;

    console.warn("RPC join_room failed, falling back to direct insert:", error);

    // Fallback: Direct insert (if RPC missing)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("players")
      .insert({
        room_id: roomId,
        name,
        is_ready: false,
      })
      .select()
      .single();

    if (fallbackError) {
      console.error("Error joining room (fallback):", fallbackError);
      throw fallbackError; // Throw so UI can show message
    }

    return fallbackData as Player;
  },

  async getPlayers(roomId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId);

    if (error) {
      console.error("Error fetching players:", error);
      return [];
    }
    return data;
  },

  async toggleReady(playerId: string, isReady: boolean) {
    const { error } = await supabase
      .from("players")
      .update({ is_ready: isReady })
      .eq("id", playerId);

    if (error) throw error;
  },
};
