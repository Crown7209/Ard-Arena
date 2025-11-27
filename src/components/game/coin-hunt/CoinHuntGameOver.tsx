import React from "react";
import { Loot } from "./types";
import { RotateCcw } from "lucide-react";

interface CoinHuntGameOverProps {
  score: number;
  timer: number;
  playerLevel: number;
  playerXP: number;
  xpProgress: number;
  collectedLoot: Loot[];
  startGame: () => void;
  resumeGame: () => void;
  canResume: boolean;
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
  resumeGame,
  canResume,
  setGameState,
  xpToLevel,
  xpPerPoint,
}) => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ backgroundColor: "#021526" }}
    >
      <div className="max-w-md w-full text-center space-y-4 md:space-y-6">
        <h1 className="text-3xl md:text-5xl font-black text-white">
          GAME OVER
        </h1>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-[#0A5EB0]/30">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#0A5EB0]">{score}</div>
              <div className="text-xs md:text-sm text-white/60 mt-1">Score</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#0A5EB0]">{timer}s</div>
              <div className="text-xs md:text-sm text-white/60 mt-1">Survived</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#0A5EB0]">
                +{score * xpPerPoint}
              </div>
              <div className="text-xs md:text-sm text-white/60 mt-1">XP Earned</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-sm md:text-base">Level {playerLevel}</span>
              <span className="text-white/60 text-xs md:text-sm">
                {playerXP} / {xpToLevel(playerLevel)} XP
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 md:h-3">
              <div
                className="h-2 md:h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${xpProgress}%`,
                  backgroundColor: "#0A5EB0"
                }}
              />
            </div>
          </div>

          {/* Collection */}
          <div className="text-left">
            <h3 className="text-white font-bold mb-2 md:mb-3 text-sm md:text-base">
              Your Collection ({collectedLoot.length}):
            </h3>
            <div className="grid grid-cols-5 gap-1.5 md:gap-2 max-h-32 md:max-h-40 overflow-y-auto">
              {collectedLoot.map((loot, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg border border-white/20"
                  style={{ backgroundColor: loot.color }}
                  title={loot.type}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 md:space-y-3">
          {canResume && (
            <button
              onClick={resumeGame}
              className="w-full bg-[#10B981] text-white font-bold py-3 md:py-4 px-6 rounded-xl md:rounded-2xl hover:bg-[#10B981]/90 active:scale-95 transition-all duration-200 shadow-lg shadow-[#10B981]/30 text-base md:text-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              RESUME (20 coins)
            </button>
          )}
          <button
            onClick={startGame}
            className="w-full bg-[#0A5EB0] text-white font-bold py-3 md:py-4 px-6 rounded-xl md:rounded-2xl hover:bg-[#0A5EB0]/90 active:scale-95 transition-all duration-200 shadow-lg shadow-[#0A5EB0]/30 text-base md:text-lg"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={() => setGameState("menu")}
            className="w-full bg-white/5 text-white font-semibold py-2.5 md:py-3 px-6 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-200 border border-white/10 text-sm md:text-base"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinHuntGameOver;
