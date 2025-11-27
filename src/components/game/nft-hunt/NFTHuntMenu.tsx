import React from "react";
import { Star, Trophy } from "lucide-react";
import { LeaderboardEntry } from "./types";

interface NFTHuntMenuProps {
  playerLevel: number;
  playerXP: number;
  xpProgress: number;
  startGame: () => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  leaderboard: LeaderboardEntry[];
  xpToLevel: (level: number) => number;
}

const NFTHuntMenu: React.FC<NFTHuntMenuProps> = ({
  playerLevel,
  playerXP,
  xpProgress,
  startGame,
  showLeaderboard,
  setShowLeaderboard,
  leaderboard,
  xpToLevel,
}) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Player Stats */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Level {playerLevel}</span>
            </div>
            <span className="text-slate-400 text-sm">
              {playerXP} / {xpToLevel(playerLevel)} XP
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-linear-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 mb-4">
          NFT HUNT
        </h1>
        <p className="text-xl text-cyan-300 mb-2">Vertical Survival</p>
        <p className="text-slate-400 mb-8">Collect rare NFTs and survive!</p>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-cyan-500/20">
          <h2 className="text-lg font-bold text-white mb-4">How to Play</h2>
          <ul className="text-left text-slate-300 space-y-2 text-sm">
            <li>🎮 Use Arrow Keys or WASD to move</li>
            <li>💎 Collect colored NFT loot</li>
            <li>⚡ Power-ups: Speed, Magnet, Time (+10s)</li>
            <li>🔥 Build combos for multipliers!</li>
            <li>🧱 Avoid gray obstacles!</li>
            <li>🤖 Escape the red AI bot!</li>
            <li>⏱️ Survive for 60 seconds</li>
            <li>📈 Earn XP and level up!</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={startGame}
            className="w-full bg-linear-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
          >
            START GAME
          </button>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-600 transition"
          >
            {showLeaderboard ? "Hide" : "View"} Leaderboard
          </button>
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Daily Leaderboard
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No scores yet. Be the first!
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      idx === 0
                        ? "bg-yellow-500/20"
                        : idx === 1
                        ? "bg-slate-500/20"
                        : idx === 2
                        ? "bg-orange-500/20"
                        : "bg-slate-700/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold w-6">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-white font-medium">
                          {entry.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Level {entry.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-cyan-400 font-bold">{entry.score}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTHuntMenu;
