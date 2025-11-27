"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/app/hooks/useRoom";
import { usePlayers } from "@/app/hooks/usePlayers";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { LobbyShell } from "@/components/lobby/LobbyShell";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const { room, loading: roomLoading } = useRoom(roomId || undefined);
  const { players } = usePlayers(roomId || undefined);
  const { setCurrentPlayerId } = usePlayerStore();
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

  useEffect(() => {
    if (room?.status === "playing") {
      router.push("/game");
    }
  }, [room?.status, router]);
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
    return <LobbyShell loading />;
  }

  const currentPlayer = players.find((p) => p.id === playerId);
  const allReady = players.length > 0 && players.every((p) => p.is_ready);

  return (
    <LobbyShell
      code={code}
      players={players}
      isHost={isHost}
      joinUrl={joinUrl}
      playersReady={allReady}
      currentPlayerId={playerId}
      currentPlayerReady={Boolean(currentPlayer?.is_ready)}
      onStartGame={handleStartGame}
      onToggleReady={handleToggleReady}
    />
  );
}
