"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { matchmakingService, MatchmakingPlayer } from "@/services/matchmakingService";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { supabase } from "@/lib/supabase";
import { Loader2, Users, ArrowLeft } from "lucide-react";

export default function MatchmakingPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { setCurrentPlayerId } = usePlayerStore();
  const [activePlayers, setActivePlayers] = useState<MatchmakingPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) {
      router.push("/login");
      return;
    }

    // Join matchmaking queue
    const joinQueue = async () => {
      await matchmakingService.joinQueue(authUser.id);
      await refreshActivePlayers();
      setLoading(false);
    };

    joinQueue();

    // Refresh active players every 5 seconds - reduced frequency
    const interval = setInterval(refreshActivePlayers, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      matchmakingService.leaveQueue(authUser.id);
    };
  }, [authUser, router]);

  const refreshActivePlayers = async () => {
    const players = await matchmakingService.getActivePlayers();
    setActivePlayers(players);
  };

  const handleReady = async () => {
    if (!authUser?.id || isMatching) return;

    // Check if there are at least 2 players (including current user)
    if (activePlayers.length < 2) {
      alert("No active players available. Please wait for more players to join.");
      return;
    }

    setIsReady(true);
    setIsMatching(true);

    // Find a match
    const matchedUserId = await matchmakingService.findMatch(authUser.id);

    if (!matchedUserId) {
      // No match found
      setIsMatching(false);
      setIsReady(false);
      alert("No players available for matching. Please try again.");
      return;
    }

    await startGameWithMatch(matchedUserId);
  };

  const startGameWithMatch = async (matchedUserId: string) => {
    try {
      if (!authUser?.id) {
        throw new Error("User not authenticated");
      }

      // Create a room for the match
      const hostId = Math.random().toString(36).substring(7);
      const room = await roomService.createRoom(hostId);
      
      if (!room) {
        throw new Error("Failed to create room");
      }

      // Get current user's player name
      const currentUserName = authUser.email?.split("@")[0] || "Player 1";
      
      // Get matched user's info for player name
      const { data: matchedUser } = await supabase
        .from("users")
        .select("username, email")
        .eq("id", matchedUserId)
        .single();
      
      const matchedUserName = matchedUser?.username || matchedUser?.email?.split("@")[0] || "Player 2";

      // Current user joins as player 1 (host)
      const player1 = await playerService.joinRoom(room.id, currentUserName);
      
      if (!player1) {
        throw new Error("Failed to join room as player 1");
      }

      // Store current player info
      localStorage.setItem("playerId", player1.id);
      localStorage.setItem("hostId", hostId);
      localStorage.setItem("currentRoomCode", room.code);
      setCurrentPlayerId(player1.id);

      // Current user is ready
      await playerService.toggleReady(player1.id, true);

      // Note: The matched user needs to be notified to join the room
      // For now, we'll navigate to lobby and wait for the matched player to join
      // In a full implementation, you'd use realtime to notify the matched user
      router.push(`/lobby/${room.code}`);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game. Please try again.");
      setIsMatching(false);
      setIsReady(false);
    }
  };

  const handleLeave = async () => {
    if (authUser?.id) {
      await matchmakingService.leaveQueue(authUser.id);
    }
    router.push("/");
  };

  return (
    <div className="relative min-h-screen text-white bg-black">
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 pl-4 pr-0 py-4">
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-[#64ccc5]" />
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-[#64ccc5]/10 rounded-xl mb-4 border border-[#64ccc5]/30">
                <Users className="w-8 h-8 text-[#64ccc5]" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-2">
                MATCHMAKING
              </h1>
              <p className="text-xs uppercase tracking-[0.1em] text-[#64ccc5]">
                Find Your Opponent
              </p>
            </div>

            {/* Active Players List */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-white/20 p-4 mb-6">
              <div className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wider">
                Active Players ({activePlayers.length})
              </div>
              {loading ? (
                <div className="text-center py-8 text-white/60">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#64ccc5]" />
                  <div className="text-xs">Loading players...</div>
                </div>
              ) : activePlayers.length === 0 ? (
                <div className="text-center py-8 text-white/60 text-sm">
                  No active players
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activePlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border ${
                        player.id === authUser?.id
                          ? "bg-[#64ccc5]/10 border-[#64ccc5]/30"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="text-sm font-medium text-white">
                        {player.username || player.email.split("@")[0]}
                        {player.id === authUser?.id && (
                          <span className="ml-2 text-xs text-[#64ccc5]">(You)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ready Button */}
            <button
              onClick={handleReady}
              disabled={isMatching || activePlayers.length < 2 || loading}
              className="w-full py-4 rounded-xl bg-[#64ccc5] text-slate-950 font-semibold shadow-[0_0_15px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Matching...</span>
                </>
              ) : (
                <span>Ready to Play</span>
              )}
            </button>

            {activePlayers.length < 2 && !loading && (
              <p className="text-center text-xs text-white/60 mt-4">
                {activePlayers.length === 0 
                  ? "No active players. Waiting for players to join..." 
                  : "Need at least 2 players to start"}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

