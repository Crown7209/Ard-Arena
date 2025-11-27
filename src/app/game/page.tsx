"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { start, reset } from "@/components/game/game";
import { Loader2 } from "lucide-react";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const [gameReady, setGameReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentPlayerId } = usePlayerStore();

  useEffect(() => {
    const initGame = async () => {
      try {
        // Get room code from URL or localStorage
        const code =
          searchParams.get("code") || localStorage.getItem("currentRoomCode");

        if (!code) {
          setError("No room code found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Get room info
        const room = await roomService.getRoomByCode(code);
        if (!room) {
          setError("Room not found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Get player info
        const playerId = currentPlayerId || localStorage.getItem("playerId");
        if (!playerId) {
          setError("Player not found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Get all players to determine order
        const players = await playerService.getPlayers(room.id);
        const currentPlayer = players.find((p) => p.id === playerId);

        if (!currentPlayer) {
          setError("You are not in this room");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Determine player index (host is always player 0, first joiner is player 1)
        const storedHostId = localStorage.getItem("hostId");
        const isHost = room.host_id === storedHostId;
        const playerIndex = isHost ? 0 : 1;

        setLoading(false);

        // Initialize game
        if (!containerRef.current || initialized.current) return;
        initialized.current = true;

        start({
          arena: {
            container: containerRef.current!,
            arena: 0,
          },
          fighters: [{ name: "subzero" }, { name: "kano" }],
          gameType: "realtime",
          roomId: room.id,
          playerId: playerId,
          playerIndex: playerIndex,
          callbacks: {
            "game-end": (winner) => {
              console.log("Game Over", winner);
              alert(`Game Over! Winner: ${winner.getName()}`);
              setTimeout(() => router.push("/"), 2000);
            },
          },
        }).ready(() => {
          setGameReady(true);
        });
      } catch (err: any) {
        console.error("Error initializing game:", err);
        setError(err.message || "Failed to initialize game");
      }
    };

    initGame();

    return () => {
      if (initialized.current) {
        reset();
        initialized.current = false;
      }
    };
  }, [router, searchParams, currentPlayerId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-lg">Loading game...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen h-auto w-full flex flex-col items-center justify-center bg-gray-950 text-white">
      {!gameReady && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span className="text-xs text-gray-500">Initializing game...</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden bg-black w-full flex justify-center"
      />
    </div>
  );
}
