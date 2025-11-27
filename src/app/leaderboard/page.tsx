"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User as DbUser } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Medal, User as UserIcon, Star, ArrowLeft, Swords, Palette } from "lucide-react";

export default function LeaderboardPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [currentUserStats, setCurrentUserStats] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [fightGameUsers, setFightGameUsers] = useState<DbUser[]>([]);
  const [colorMatchUsers, setColorMatchUsers] = useState<DbUser[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch Top 10 for fighting game - only signed-in users who have played and won
      // The wins field tracks fighting game wins
      const { data: topUsers, error } = await supabase
        .from("users")
        .select("*")
        .gt("wins", 0) // Only users who have won at least one fighting game
        .order("wins", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching fight game leaderboard:", error);
      } else {
        setFightGameUsers(topUsers || []);
      }

      // Fetch Top 10 for Color Match - sorted by points
      const { data: colorMatchTopUsers, error: colorMatchError } = await supabase
        .from("users")
        .select("*")
        .gt("color_match_points", 0) // Only users who have points
        .order("color_match_points", { ascending: false })
        .limit(10);

      if (colorMatchError) {
        console.error("Error fetching color match leaderboard:", colorMatchError);
      } else {
        setColorMatchUsers(colorMatchTopUsers || []);
      }

      // Fetch Current User Stats if logged in
      if (authUser) {
        const { data: myStats } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (myStats) setCurrentUserStats(myStats);
      }

      setLoading(false);
    };

    fetchLeaderboard();

    // Realtime subscription
    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  const renderLeaderboard = (gameName: string, gameIcon: React.ReactNode, gameUsers: DbUser[]) => {
    return (
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          {gameIcon}
          <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-[0.3em]">
            {gameName}
          </h2>
        </div>
        <div className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/60">
              Loading rankings...
            </div>
          ) : gameUsers.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              No players yet. Be the first!
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {gameUsers.map((user, index) => {
                const isMe = authUser?.id === user.id;
                // Medal colors for top 3
                const medalColor =
                  index === 0
                    ? "#FFD700" // Gold
                    : index === 1
                    ? "#C0C0C0" // Silver
                    : index === 2
                    ? "#CD7F32" // Bronze
                    : null;

                return (
                  <div
                    key={`${gameName}-${user.id}`}
                    className={`flex items-center justify-between p-3 md:p-6 transition-colors ${
                      isMe
                        ? "bg-[#64ccc5]/10 hover:bg-[#64ccc5]/20"
                        : index < 3
                        ? "bg-white/5 hover:bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-6">
                      <div
                        className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center font-black text-sm md:text-xl ${
                          medalColor ? "" : "text-white/60"
                        }`}
                      >
                        {index === 0 && (
                          <Medal className="w-5 h-5 md:w-8 md:h-8" style={{ color: medalColor ?? undefined }} />
                        )}
                        {index === 1 && (
                          <Medal className="w-5 h-5 md:w-8 md:h-8" style={{ color: medalColor ?? undefined }} />
                        )}
                        {index === 2 && (
                          <Medal className="w-5 h-5 md:w-8 md:h-8" style={{ color: medalColor ?? undefined }} />
                        )}
                        {index > 2 && `#${index + 1}`}
                      </div>

                      <div className="flex items-center gap-2 md:gap-4">
                        <div
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                            isMe
                              ? "bg-[#64ccc5] text-slate-950"
                              : index < 3
                              ? "bg-white/20 text-white"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <div
                            className={`font-bold text-xs md:text-lg ${
                              isMe
                                ? "text-[#64ccc5]"
                                : index < 3
                                ? "text-white"
                                : "text-white"
                            }`}
                          >
                            {user.username || user.email.split("@")[0]}{" "}
                            {isMe && (
                              <span className="text-[10px] md:text-xs">(You)</span>
                            )}
                          </div>
                          <div className="text-[9px] md:text-xs text-white/60 uppercase tracking-wider font-medium">
                            Player
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg md:text-2xl font-black ${
                          isMe
                            ? "text-[#64ccc5]"
                            : index < 3
                            ? medalColor
                              ? ""
                              : "text-white"
                            : "text-white"
                        }`}
                        style={medalColor ? { color: medalColor } : {}}
                      >
                        {gameName === "Color Match" 
                          ? (user.color_match_points || 0)
                          : user.wins}
                      </div>
                      <div className="text-[9px] md:text-xs text-white/60 uppercase tracking-wider font-medium">
                        {gameName === "Color Match" ? "Points" : "Wins"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen text-white bg-black">
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header matching landing page */}
        <header className="flex flex-wrap items-center justify-between gap-3 pl-4 pr-0 py-4 md:gap-4 md:pl-12 md:pr-0 md:py-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-[#64ccc5]" />
          </button>

          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 h-16 px-6 rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 text-[#64ccc5]" />
              Back
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="relative">
              <div className="inline-flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl border border-white/30 bg-white/5 text-white/90">
                <Trophy className="h-4 w-4 md:h-7 md:w-7 text-[#64ccc5]" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:p-8 max-w-4xl mx-auto w-full pb-24">
          {/* Mobile: Hero section matching landing page */}
          <div className="mb-8 md:hidden text-center">
            <div className="inline-flex items-center justify-center p-3 bg-[#64ccc5]/10 rounded-xl mb-4 border border-[#64ccc5]/30">
              <Trophy className="w-8 h-8 text-[#64ccc5]" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-[0.6em] mb-2">
              LEADERBOARD
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[#64ccc5]">
              Top Champions
            </p>
          </div>

          {/* Desktop: Original hero */}
          <div className="hidden md:block text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-[#64ccc5]/10 rounded-full mb-4 border border-[#64ccc5]/30">
              <Trophy className="w-12 h-12 text-[#64ccc5]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              LEADERBOARD
            </h1>
            <p className="text-gray-400">Top champions of the arena</p>
          </div>

          {/* Game-specific leaderboards */}
          <div className="space-y-6 md:space-y-8">
            {/* Fight Game - shows players who have played and won fighting games */}
            {renderLeaderboard(
              "Fight Game",
              <Swords className="w-5 h-5 md:w-6 md:h-6 text-[#64ccc5]" />,
              fightGameUsers // Fighting game uses the wins field
            )}
            {/* Color Match - empty until color match wins are tracked separately */}
            {renderLeaderboard(
              "Color Match",
              <Palette className="w-5 h-5 md:w-6 md:h-6 text-[#64ccc5]" />,
              colorMatchUsers // Empty array - no color match wins tracked yet
            )}
          </div>

          {/* Mobile: Sticky Current User Stats */}
          {authUser && currentUserStats && (
            <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-black/90 backdrop-blur-md border-t border-white/20 z-40">
              <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#64ccc5] rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(100,204,197,0.3)]">
                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-xs md:text-base text-white">Your Stats</div>
                    <div className="text-[10px] md:text-sm text-white/60">
                      {currentUserStats.username ||
                        currentUserStats.email.split("@")[0]}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-2xl font-black text-[#64ccc5]">
                    {currentUserStats.wins}
                  </div>
                  <div className="text-[9px] md:text-xs text-white/60 uppercase tracking-wider">
                    Fight Wins
                  </div>
                  <div className="text-lg md:text-2xl font-black text-[#64ccc5] mt-2">
                    {currentUserStats.color_match_points || 0}
                  </div>
                  <div className="text-[9px] md:text-xs text-white/60 uppercase tracking-wider">
                    Color Points
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
