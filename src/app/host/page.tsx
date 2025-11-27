"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { roomService } from "@/services/roomService";
import { Loader2, MonitorPlay } from "lucide-react";

export default function HostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    // Generate a random host ID (in real app this is auth ID)
    const hostId = Math.random().toString(36).substring(7);

    // Store host ID to identify as host later
    localStorage.setItem("hostId", hostId);

    const room = await roomService.createRoom(hostId);

    if (room) {
      router.push(`/lobby/${room.code}`);
    } else {
      setLoading(false);
      alert("Failed to create room");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
          <MonitorPlay className="w-10 h-10 text-indigo-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Host a Game</h1>
          <p className="text-gray-500">
            Create a room and invite players to join with their phones.
          </p>
        </div>

        <Button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full py-4 text-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Room...
            </div>
          ) : (
            "Create Room"
          )}
        </Button>
      </div>
    </div>
  );
}
