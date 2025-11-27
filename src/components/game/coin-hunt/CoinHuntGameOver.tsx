import React from "react";
import { Loot } from "./types";

interface CoinHuntGameOverProps {
  score: number;
  timer: number;
  playerLevel: number;
  playerXP: number;
  xpProgress: number;
  collectedLoot: Loot[];
  startGame: () => void;
  setGameState: (state: "menu" | "playing" | "gameover") => void;
  xpToLevel: (level: number) => number;
  xpPerPoint: number;
}

const CoinHuntGameOver: React.FC<CoinHuntGameOverProps> = ({
  score,
  timer,
  playerLevel,
  playerXP,
  xpProgress,
  collectedLoot,
  startGame,
  setGameState,
  xpToLevel,
  xpPerPoint,
}) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 mb-8">
          GAME OVER
        </h1>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-cyan-500/20">
          <div className="flex justify-around mb-6">
            <div>
              <div className="text-3xl font-bold text-cyan-400">{score}</div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">{timer}s</div>
              <div className="text-sm text-slate-400">Survived</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                +{score * xpPerPoint}
              </div>
              <div className="text-sm text-slate-400">XP Earned</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">Level {playerLevel}</span>
              <span className="text-slate-400 text-sm">
                {playerXP} / {xpToLevel(playerLevel)} XP
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-linear-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          <div className="text-left">
            <h3 className="text-white font-bold mb-3">
              Your Collection ({collectedLoot.length}):
            </h3>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
              {collectedLoot.map((loot, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg border-2 border-white/20"
                  style={{ backgroundColor: loot.color }}
                  title={loot.type}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={startGame}
            className="w-full bg-linear-to-r from-cyan-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={() => setGameState("menu")}
            className="w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-600 transition"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinHuntGameOver;
