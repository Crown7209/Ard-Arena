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
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">
      {/* Stats Bar */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20 z-10">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <TimerIcon className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-bold">{timer}s</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span className="text-white font-bold">Lv.{playerLevel}</span>
        </div>
      </div>

      {/* Combo Display - Absolute to prevent layout shift */}
      <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-20 h-10">
        {combo > 0 && (
          <div className="bg-linear-to-r from-yellow-500 to-orange-500 text-white font-black px-6 py-2 rounded-full animate-pulse shadow-lg shadow-orange-500/50">
            {combo} COMBO! x{comboMultiplier.toFixed(1)}
          </div>
        )}
      </div>

      {/* Active Power-Ups - Absolute to prevent layout shift */}
      <div className="absolute top-36 left-0 right-0 flex justify-center gap-2 pointer-events-none z-20 h-8">
        {speedBoostActive && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-4 py-1 rounded-full flex items-center gap-2 text-sm font-bold backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            SPEED BOOST
          </div>
        )}
        {magnetActive && (
          <div className="bg-purple-500/20 border border-purple-500 text-purple-400 px-4 py-1 rounded-full flex items-center gap-2 text-sm font-bold backdrop-blur-sm">
            <Magnet className="w-4 h-4" />
            MAGNET
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="max-w-full max-h-full border-4 border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/20 object-contain"
        />
      </div>

      {/* Mobile Controls - Joystick (Absolute position) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 md:hidden z-50">
        <Joystick
          onMove={(x, y) => {
            joystickRef.current = { x, y };
          }}
        />
      </div>

      {/* Desktop Instructions */}
      <p className="hidden md:block text-slate-400 text-sm mb-4">
        Use Arrow Keys or WASD to move
      </p>
    </div>
  );
};

export default CoinHuntPlaying;
