"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { roomService } from "@/services/roomService";
import { useDeviceType } from "@/hooks/useDeviceType";
import { Loader2, MonitorPlay, Smartphone, Gamepad2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isMobile } = useDeviceType();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHostGame = async () => {
    setLoading(true);
    const hostId = Math.random().toString(36).substring(7);
    localStorage.setItem("hostId", hostId);

    try {
      const room = await roomService.createRoom(hostId);
      if (room) {
        router.push(`/lobby/${room.code}`);
      } else {
        alert("Failed to create room");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating room");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl w-full text-center space-y-12 z-10">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 drop-shadow-lg">
            ARD ARENA
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
            The Ultimate Browser Party Game
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
          {!isMobile ? (
            // Desktop View
            <div className="w-full space-y-4">
              <Button
                onClick={handleHostGame}
                disabled={loading}
                className="w-full py-6 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all shadow-xl shadow-indigo-900/20 border-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    Creating Room...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <MonitorPlay className="w-8 h-8" />
                    START PLAY
                  </div>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                Click to host a game on this screen
              </p>
            </div>
          ) : (
            // Mobile View
            <div className="w-full space-y-4">
              <Button
                onClick={() => router.push("/game?mode=standalone")}
                className="w-full py-6 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/20 border-0"
              >
                <div className="flex items-center justify-center gap-3">
                  <Gamepad2 className="w-6 h-6" />
                  START PLAY
                </div>
              </Button>

              <Button
                onClick={() => router.push("/join")}
                variant="outline"
                className="w-full py-6 text-xl font-bold border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600"
              >
                <div className="flex items-center justify-center gap-3">
                  <Smartphone className="w-6 h-6" />
                  JOIN GAME
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
