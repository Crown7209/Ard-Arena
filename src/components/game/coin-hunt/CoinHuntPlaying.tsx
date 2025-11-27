import React from "react";
import {
  Coins,
  Timer as TimerIcon,
  Zap,
  Magnet,
  TrendingUp,
} from "lucide-react";
import Joystick from "./Joystick";

interface CoinHuntPlayingProps {
  score: number;
  timer: number;
  playerLevel: number;
  combo: number;
  comboMultiplier: number;
  speedBoostActive: boolean;
  magnetActive: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
}

const CoinHuntPlaying: React.FC<CoinHuntPlayingProps> = ({
  score,
  timer,
  playerLevel,
  combo,
  comboMultiplier,
  speedBoostActive,
  magnetActive,
  canvasRef,
  joystickRef,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
}) => {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden touch-none"
      style={{ backgroundColor: "#021526" }}
    >
      {/* Stats Bar - Mobile Optimized */}
      <div className="w-full max-w-md mb-2 md:mb-4 flex justify-between items-center bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-[#0A5EB0]/30 z-10">
        <div className="flex items-center gap-1.5 md:gap-2">
          <Coins className="w-4 h-4 md:w-5 md:h-5 text-[#0A5EB0]" />
          <span className="text-white font-bold text-sm md:text-base">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <TimerIcon className="w-4 h-4 md:w-5 md:h-5 text-[#0A5EB0]" />
          <span className="text-white font-bold text-sm md:text-base">{timer}s</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#0A5EB0]" />
          <span className="text-white font-bold text-sm md:text-base">Lv.{playerLevel}</span>
        </div>
      </div>

      {/* Combo Display - Absolute to prevent layout shift */}
      <div className="absolute top-16 md:top-24 left-0 right-0 flex justify-center pointer-events-none z-20 h-8 md:h-10">
        {combo > 0 && (
          <div 
            className="text-white font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full animate-pulse shadow-lg text-sm md:text-base"
            style={{ backgroundColor: "#0A5EB0", boxShadow: "0 0 20px rgba(10, 94, 176, 0.5)" }}
          >
            {combo} COMBO! x{comboMultiplier.toFixed(1)}
          </div>
        )}
      </div>

      {/* Active Power-Ups - Absolute to prevent layout shift */}
      <div className="absolute top-28 md:top-36 left-0 right-0 flex justify-center gap-2 pointer-events-none z-20 h-6 md:h-8">
        {speedBoostActive && (
          <div 
            className="border px-3 md:px-4 py-0.5 md:py-1 rounded-full flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold backdrop-blur-sm"
            style={{ 
              backgroundColor: "rgba(10, 94, 176, 0.2)", 
              borderColor: "#0A5EB0",
              color: "#0A5EB0"
            }}
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4" />
            SPEED
          </div>
        )}
        {magnetActive && (
          <div 
            className="border px-3 md:px-4 py-0.5 md:py-1 rounded-full flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold backdrop-blur-sm"
            style={{ 
              backgroundColor: "rgba(10, 94, 176, 0.2)", 
              borderColor: "#0A5EB0",
              color: "#0A5EB0"
            }}
          >
            <Magnet className="w-3 h-3 md:w-4 md:h-4" />
            MAGNET
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full border-2 md:border-4 rounded-xl md:rounded-2xl shadow-2xl object-contain"
          style={{ 
            borderColor: "rgba(10, 94, 176, 0.5)",
            boxShadow: "0 0 30px rgba(10, 94, 176, 0.2)",
            maxWidth: "100%",
            maxHeight: "calc(100vh - 200px)"
          }}
        />
      </div>

      {/* Mobile Controls - Joystick (Absolute position) */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 md:hidden z-50">
        <Joystick
          onMove={(x, y) => {
            joystickRef.current = { x, y };
          }}
        />
      </div>

      {/* Desktop Instructions */}
      <p className="hidden md:block text-white/60 text-sm mb-4">
        Use Arrow Keys or WASD to move
      </p>
    </div>
  );
};

export default CoinHuntPlaying;
