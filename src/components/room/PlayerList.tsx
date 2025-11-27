import { Player } from "@/lib/types";
import { CheckCircle2, Circle, User } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string | null;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="space-y-2 md:space-y-3 w-full">
      <div className="grid gap-2 md:gap-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all duration-200 ${
              player.id === currentPlayerId
                ? "border-[#64ccc5]/50 bg-[#64ccc5]/10"
                : "border-white/20 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className={`p-2 rounded-lg ${
                  player.id === currentPlayerId
                    ? "bg-[#64ccc5]/20"
                    : "bg-white/10"
                }`}
              >
                <User
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    player.id === currentPlayerId
                      ? "text-[#64ccc5]"
                      : "text-white/60"
                  }`}
                />
              </div>
              <span
                className={`text-sm md:text-base font-bold ${
                  player.id === currentPlayerId ? "text-white" : "text-white/90"
                }`}
              >
                {player.name} {player.id === currentPlayerId && (
                  <span className="text-xs text-[#64ccc5]">(You)</span>
                )}
              </span>
            </div>

            <div className="flex items-center">
              {player.is_ready ? (
                <div className="flex items-center gap-1.5 md:gap-2 text-[#64ccc5] bg-[#64ccc5]/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold border border-[#64ccc5]/30">
                  <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">READY</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 md:gap-2 text-white/60 bg-white/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold border border-white/10">
                  <Circle className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">WAITING</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 md:py-12 text-white/60 bg-white/5 rounded-xl border-2 border-dashed border-white/10">
            <User className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 opacity-40" />
            <p className="text-sm md:text-base font-medium">Waiting for players...</p>
          </div>
        )}
      </div>
    </div>
  );
}
