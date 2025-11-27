import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePlayerStore } from "@/store/playerStore";
import { Player } from "@/lib/types";
import { playerService } from "@/services/playerService";

export function usePlayers(roomId?: string) {
  const { players, setPlayers, addPlayer, removePlayer, updatePlayer } =
    usePlayerStore();

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    playerService.getPlayers(roomId).then(setPlayers);

    // Realtime subscription
    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          addPlayer(payload.new as Player);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          updatePlayer(payload.new.id, payload.new as Partial<Player>);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          removePlayer(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, setPlayers, addPlayer, updatePlayer, removePlayer]);

  return { players };
}
