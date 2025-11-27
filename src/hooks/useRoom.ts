import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRoomStore } from "@/store/roomStore";
import { Room } from "@/lib/types";

export function useRoom(roomId?: string) {
  const { room: storedRoom, setRoom, updateRoom } = useRoomStore();
  const [loading, setLoading] = useState(false);

  // Prevent returning stale room data
  const room = storedRoom?.id === roomId ? storedRoom : null;

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    const fetchRoom = async () => {
      setLoading(true);
      // Clear stale data from store if IDs don't match
      if (storedRoom?.id !== roomId) {
        setRoom(null);
      }

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
  }, [roomId, setRoom, updateRoom]); // Removed storedRoom from deps to avoid loop

  return { room, loading };
}
