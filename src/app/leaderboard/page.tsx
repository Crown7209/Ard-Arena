"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as DbUser } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Medal, User as UserIcon, Star } from "lucide-react";

export default function LeaderboardPage() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // 1. Fetch Top 50
      const { data: topUsers, error } = await supabase
        .from("users")
        .select("*")
        .order("wins", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        setUsers(topUsers || []);
      }

      // 2. Fetch Current User Stats if logged in
      if (authUser) {
        // Check if already in top list
        const inList = topUsers?.find((u) => u.id === authUser.id);
        if (inList) {
          setCurrentUserStats(inList);
        } else {
          const { data: myStats } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (myStats) setCurrentUserStats(myStats);
        }
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

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-4 ring-1 ring-yellow-500/50">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          LEADERBOARD
        </h1>
        <p className="text-gray-400">Top champions of the arena</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading rankings...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No players yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {users.map((user, index) => {
              const isMe = authUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-6 transition-colors ${
                    isMe
                      ? "bg-indigo-500/10 hover:bg-indigo-500/20"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center font-black text-xl text-gray-500">
                      {index === 0 && (
                        <Medal className="w-8 h-8 text-yellow-500" />
                      )}
                      {index === 1 && (
                        <Medal className="w-8 h-8 text-gray-400" />
                      )}
                      {index === 2 && (
                        <Medal className="w-8 h-8 text-amber-700" />
                      )}
                      {index > 2 && `#${index + 1}`}
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isMe
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          className={`font-bold text-lg ${
                            isMe ? "text-indigo-400" : "text-white"
                          }`}
                        >
                          {user.username || user.email.split("@")[0]}{" "}
                          {isMe && "(You)"}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                          Player
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-2xl font-black ${
                        isMe ? "text-indigo-400" : "text-gray-300"
                      }`}
                    >
                      {user.wins}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                      Wins
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Current User Stats (if logged in) */}
      {authUser && currentUserStats && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-md border-t border-gray-800 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="font-bold text-white">Your Stats</div>
                <div className="text-sm text-gray-400">
                  {currentUserStats.username ||
                    currentUserStats.email.split("@")[0]}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-indigo-400">
                {currentUserStats.wins}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Total Wins
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
