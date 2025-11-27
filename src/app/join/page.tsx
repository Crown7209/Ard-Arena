"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { Loader2, Smartphone } from "lucide-react";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentPlayerId } = usePlayerStore();

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    setLoading(true);

    try {
      // 1. Find room
      const room = await roomService.getRoomByCode(code);

      if (!room) {
        alert("Room not found");
        setLoading(false);
        return;
      }

      if (room.status !== "waiting") {
        alert("Game already started");
        setLoading(false);
        return;
      }

      // 2. Join room
      const player = await playerService.joinRoom(room.id, name);

      if (player) {
        setCurrentPlayerId(player.id);
        localStorage.setItem("playerId", player.id);
        router.push(`/lobby/${code}`);
      } else {
        alert("Failed to join room");
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error joining room");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-800 p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-indigo-500/50">
          <Smartphone className="w-10 h-10 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Join Game</h1>
          <p className="text-gray-400 mt-2">
            Enter your name and the room code
          </p>
        </div>
      </div>

      <form onSubmit={handleJoin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            Room Code
          </label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="1234"
            maxLength={4}
            className="text-center text-3xl tracking-[0.5em] uppercase font-mono bg-gray-800 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 h-16"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            Your Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={12}
            className="text-center text-xl bg-gray-800 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 h-14"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !code || !name}
          className="w-full py-4 text-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 border-0 h-16"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              Joining...
            </div>
          ) : (
            "JOIN ROOM"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
      <Suspense
        fallback={<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />}
      >
        <JoinContent />
      </Suspense>
    </div>
  );
}
