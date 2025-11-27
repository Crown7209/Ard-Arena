"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { usePlayers } from "@/hooks/usePlayers";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { RoomCode } from "@/components/room/RoomCode";
import { PlayerList } from "@/components/room/PlayerList";
import { Button } from "@/components/ui/Button";
import { Loader2, Play, CheckCircle2, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState("");

  // Hooks
  const { room, loading: roomLoading } = useRoom(roomId || undefined);
  const { players } = usePlayers(roomId || undefined);
  const { setCurrentPlayerId } = usePlayerStore();

  // 1. Resolve Room Code to ID
  useEffect(() => {
    const initLobby = async () => {
      const fetchedRoom = await roomService.getRoomByCode(code);
      if (!fetchedRoom) {
        alert("Room not found");
        router.push("/");
        return;
      }
      setRoomId(fetchedRoom.id);

      // Check identity
      const storedHostId = localStorage.getItem("hostId");
      const storedPlayerId = localStorage.getItem("playerId");

      if (storedHostId === fetchedRoom.host_id) {
        setIsHost(true);
      }

      if (storedPlayerId) {
        setPlayerId(storedPlayerId);
        setCurrentPlayerId(storedPlayerId);
      }

      // Set Join URL
      if (typeof window !== "undefined") {
        setJoinUrl(`${window.location.origin}/join?code=${code}`);
      }
    };

    if (code) initLobby();
  }, [code, router, setCurrentPlayerId]);

  // 2. Watch for Game Start
  useEffect(() => {
    if (room?.status === "playing") {
      // Save room code for game page
      localStorage.setItem("currentRoomCode", code);
      router.push(`/game?code=${code}`);
    }
  }, [room?.status, router, code]);

  // Actions
  const handleStartGame = async () => {
    if (!roomId) return;
    try {
      await roomService.startGame(roomId);
    } catch (error: any) {
      alert(error.message || "Failed to start game");
    }
  };

  const handleToggleReady = async () => {
    if (!playerId) return;
    const currentPlayer = players.find((p) => p.id === playerId);
    if (currentPlayer) {
      await playerService.toggleReady(playerId, !currentPlayer.is_ready);
    }
  };

  if (!roomId || roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentPlayer = players.find((p) => p.id === playerId);
  const allReady = players.length > 0 && players.every((p) => p.is_ready);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-800 p-8 mt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            LOBBY
          </h1>
          <p className="text-gray-400">
            {isHost
              ? "Scan to join or enter code"
              : "Waiting for host to start..."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Code & QR */}
          <div className="flex flex-col items-center space-y-8">
            <RoomCode code={code} />

            {isHost && joinUrl && (
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={joinUrl} size={200} />
              </div>
            )}

            {isHost && (
              <p className="text-sm text-gray-500 max-w-xs text-center">
                Players can scan this QR code with their phone camera to join
                instantly.
              </p>
            )}
          </div>

          {/* Right Column: Players & Controls */}
          <div className="flex flex-col h-full justify-between space-y-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 min-h-[300px]">
              <PlayerList players={players} currentPlayerId={playerId} />
            </div>

            <div className="space-y-4">
              {isHost ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleStartGame}
                    disabled={players.length === 0 || !allReady}
                    className="w-full py-4 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Play className="w-6 h-6" />
                      START GAME
                    </div>
                  </Button>
                  {!allReady && players.length > 0 && (
                    <p className="text-center text-amber-500 font-medium animate-pulse">
                      Waiting for all players to be ready...
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleToggleReady}
                  variant={currentPlayer?.is_ready ? "outline" : "primary"}
                  className={`w-full py-4 text-xl font-bold transition-all duration-300 ${
                    currentPlayer?.is_ready
                      ? "bg-green-500/10 border-2 border-green-500 text-green-500 hover:bg-green-500/20"
                      : "bg-gray-700 hover:bg-gray-600 text-white border-0"
                  }`}
                >
                  {currentPlayer?.is_ready ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      READY!
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <XCircle className="w-6 h-6" />
                      NOT READY
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
