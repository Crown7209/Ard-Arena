"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Users, User } from "lucide-react";

export default function GameModePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleModeSelect = async (mode: "1player" | "2player") => {
    setLoading(true);
    
    if (mode === "2player") {
      // Go to normal 2 player flow - create room
      const { roomService } = await import("@/services/roomService");
      const { playerService } = await import("@/services/playerService");
      const { usePlayerStore } = await import("@/store/playerStore");
      
      const hostId = Math.random().toString(36).substring(7);
      localStorage.setItem("hostId", hostId);
      
      try {
        const room = await roomService.createRoom(hostId);
        if (room) {
          const player = await playerService.joinRoom(room.id, "Host");
          if (player) {
            localStorage.setItem("playerId", player.id);
            localStorage.setItem("currentRoomCode", room.code);
            const { setCurrentPlayerId } = usePlayerStore.getState();
            setCurrentPlayerId(player.id);
            await playerService.toggleReady(player.id, true);
            router.push(`/lobby/${room.code}`);
            return;
          }
        }
        alert("Failed to create room");
      } catch (error) {
        console.error(error);
        alert("Error creating room");
      } finally {
        setLoading(false);
      }
    } else {
      // Go to 1 player matchmaking page
      router.push("/1player");
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-black">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.3em] mb-2">
              SELECT MODE
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[#64ccc5]">
              Choose Your Battle Style
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleModeSelect("1player")}
              disabled={loading}
              className="w-full p-6 rounded-xl bg-black/60 border border-white/20 hover:border-[#64ccc5] transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#64ccc5]/10 border border-[#64ccc5]/30 flex items-center justify-center group-hover:bg-[#64ccc5]/20">
                <User className="w-6 h-6 text-[#64ccc5]" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-bold text-white">1 Player</div>
                <div className="text-xs text-white/60">Match with random player</div>
              </div>
            </button>

            <button
              onClick={() => handleModeSelect("2player")}
              disabled={loading}
              className="w-full p-6 rounded-xl bg-black/60 border border-white/20 hover:border-[#64ccc5] transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#64ccc5]/10 border border-[#64ccc5]/30 flex items-center justify-center group-hover:bg-[#64ccc5]/20">
                <Users className="w-6 h-6 text-[#64ccc5]" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-bold text-white">2 Player</div>
                <div className="text-xs text-white/60">Create room with code</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

