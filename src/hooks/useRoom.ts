import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRoomStore } from "@/store/roomStore";
import { Room } from "@/lib/types";

export function useRoom(roomIdOrCode?: string, isCode: boolean = false) {
  const { room, setRoom, updateRoom } = useRoomStore();
  const [loading, setLoading] = useState(false);
  const [resolvedRoomId, setResolvedRoomId] = useState<string | undefined>(
    isCode ? undefined : roomIdOrCode
  );

  // Resolve roomId from code if needed
  useEffect(() => {
    if (!roomIdOrCode) {
      setResolvedRoomId(undefined);
      return;
    }

    if (isCode) {
      const fetchRoomId = async () => {
        const { data } = await supabase
          .from("rooms")
          .select("id")
          .eq("code", roomIdOrCode)
          .single();

        if (data) {
          setResolvedRoomId(data.id);
        }
      };
      fetchRoomId();
    } else {
      setResolvedRoomId(roomIdOrCode);
    }
  }, [roomIdOrCode, isCode]);

  useEffect(() => {
    if (!resolvedRoomId) return;

    // Initial fetch
    const fetchRoom = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", resolvedRoomId)
        .single();

      if (data) setRoom(data);
      setLoading(false);
    };

    fetchRoom();

    // Realtime subscription
    const channel = supabase
      .channel(`room:${resolvedRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${resolvedRoomId}`,
        },
        (payload: any) => {
          console.log("🔄 Room update received:", payload.new);
          updateRoom(payload.new as Partial<Room>);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedRoomId]); // Only depend on resolvedRoomId to prevent re-subscriptions

  return { room, loading };
}
