import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRoomStore } from "@/store/roomStore";
import { Room } from "@/lib/types";

export function useRoom(roomId?: string) {
  const { room, setRoom, updateRoom } = useRoomStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    const fetchRoom = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (data) setRoom(data);
      setLoading(false);
    };

    fetchRoom();

    // Realtime subscription
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload: any) => {
          updateRoom(payload.new as Partial<Room>);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, setRoom, updateRoom]);

  return { room, loading };
}
