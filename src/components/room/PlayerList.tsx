import { Player } from "@/lib/types";
import { CheckCircle2, Circle, User } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string | null;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wider">
          Players
        </h3>
        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-medium text-gray-400 border border-gray-700">
          {players.length} / 2
        </span>
      </div>

      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
              player.id === currentPlayerId
                ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                : "border-gray-700 bg-gray-800/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg ${
                  player.id === currentPlayerId
                    ? "bg-indigo-500/20"
                    : "bg-gray-700"
                }`}
              >
                <User
                  className={`w-5 h-5 ${
                    player.id === currentPlayerId
                      ? "text-indigo-400"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`font-bold ${
                  player.id === currentPlayerId ? "text-white" : "text-gray-300"
                }`}
              >
                {player.name} {player.id === currentPlayerId && "(You)"}
              </span>
            </div>

            <div className="flex items-center">
              {player.is_ready ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-400/20">
                  <CheckCircle2 className="w-4 h-4" />
                  READY
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 bg-gray-700/50 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-700">
                  <Circle className="w-4 h-4" />
                  WAITING
                </div>
              )}
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-800">
            <User className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Waiting for players...</p>
          </div>
        )}
      </div>
    </div>
  );
}
