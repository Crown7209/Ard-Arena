"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { PlayerList } from "@/components/room/PlayerList";
import { RoomCode } from "@/components/room/RoomCode";
import { Player } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Play,
  QrCode,
  Users,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type LobbyShellProps = {
  loading?: boolean;
  code?: string;
  players?: Player[];
  isHost?: boolean;
  joinUrl?: string;
  playersReady?: boolean;
  currentPlayerId?: string | null;
  currentPlayerReady?: boolean;
  onStartGame?: () => void;
  onToggleReady?: () => void;
};

const panelClass =
  "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)]";

export function LobbyShell({
  loading,
  code = "",
  players = [],
  isHost = false,
  joinUrl = "",
  playersReady = false,
  currentPlayerId,
  currentPlayerReady = false,
  onStartGame,
  onToggleReady,
}: LobbyShellProps) {
  const router = useRouter();
  const neonBg = (
    <>
      <Image
        src="/images/fighting-grid.svg"
        alt="Neon grid"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/80" />
    </>
  );

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden text-white">
        {neonBg}
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#64ccc5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white portrait-lock bg-black">
      <div className="fixed inset-0 -z-10 hidden md:block">{neonBg}</div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-12 md:py-10">
          <button
            onClick={() => router.push("/")}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 transition-all duration-200"
            aria-label="Go back"
          >
            <XCircle className="h-5 w-5 text-[#64ccc5]" />
          </button>

          <div className="hidden md:flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/5 px-6 text-xs font-semibold uppercase tracking-[0.4em] text-white/80"
            >
              Fight Game
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-white/50">
                Lobby
              </p>
              <p className="text-3xl font-black text-[#e0fdfb] drop-shadow-[0_0_15px_rgba(100,204,197,0.5)]">
                Code {code}
              </p>
            </div>
          </div>

          {/* Mobile: Room Code */}
          <div className="md:hidden flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                Room Code
              </p>
              <p className="text-xl font-black text-[#64ccc5] tracking-widest">
                {code}
              </p>
            </div>
          </div>

          {/* Desktop: Stats */}
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/25 bg-black/50 px-5 backdrop-blur">
              <Users className="h-5 w-5 text-[#64ccc5]" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Players
                </p>
                <p className="text-xl font-bold">
                  {players.length}
                  <span className="text-sm text-white/60"> online</span>
                </p>
              </div>
            </div>
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/25 bg-black/50 px-5 backdrop-blur">
              <CheckCircle2
                className={`h-5 w-5 ${
                  playersReady ? "text-[#64ccc5]" : "text-white/40"
                }`}
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Status
                </p>
                <p className="text-xl font-semibold">
                  {playersReady ? "All Ready" : "Waiting"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 pb-8 flex flex-col md:block md:px-8 md:py-10">
          <div className="max-w-5xl mx-auto w-full h-full flex flex-col md:block">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-5 h-full">
              {/* Box 1: Room Info (QR & Code) */}
              <section className="bg-black/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-12 flex flex-col items-center justify-center gap-6">
                <div className="w-full">
                  <RoomCode code={code} />
                </div>

                {isHost && joinUrl && (
                  <div className="hidden md:block rounded-3xl border border-white/20 bg-black/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                    <QRCodeSVG
                      value={joinUrl}
                      size={200}
                      className="w-[200px] h-[200px]"
                    />
                  </div>
                )}

                {isHost && (
                  <p className="hidden md:block text-center text-sm text-white/60 max-w-xs">
                    Players can scan this QR to connect instantly. Keep the
                    screen visible.
                  </p>
                )}
              </section>

              {/* Box 2: Players & Actions */}
              <section className="bg-black/60 backdrop-blur-sm rounded-2xl border border-white/20 p-4 md:p-12 flex flex-col flex-1 min-h-0">
                <div className="flex-1 mb-4 overflow-hidden flex flex-col">
                  <div className="mb-4 flex items-center justify-between shrink-0">
                    <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-widest">
                      Players ({players.length})
                    </h3>
                    <div className="md:hidden flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          playersReady ? "bg-[#64ccc5]" : "bg-amber-400"
                        }`}
                      />
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                        {playersReady ? "Ready" : "Waiting"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    <PlayerList
                      players={players}
                      currentPlayerId={currentPlayerId}
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10 shrink-0">
                  {isHost ? (
                    <>
                      <Button
                        onClick={onStartGame}
                        disabled={players.length === 0 || !playersReady}
                        className="flex w-full h-14 md:h-16 items-center justify-center gap-3 rounded-xl md:rounded-2xl border-0 bg-[#64ccc5] text-base md:text-lg font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_20px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] disabled:opacity-40 disabled:shadow-none transition-all active:scale-95"
                      >
                        <Play className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                        Launch Match
                      </Button>
                      {!playersReady && players.length > 0 && (
                        <p className="mt-3 text-center text-[10px] md:text-sm uppercase tracking-widest text-amber-400 animate-pulse font-medium">
                          Waiting for all players...
                        </p>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={onToggleReady}
                      className={`flex w-full h-14 md:h-16 items-center justify-center gap-3 rounded-xl md:rounded-2xl text-base md:text-lg font-bold tracking-[0.2em] transition-all active:scale-95 ${
                        currentPlayerReady
                          ? "border-2 border-[#64ccc5] bg-[#64ccc5]/10 text-[#64ccc5] shadow-[0_0_15px_rgba(100,204,197,0.2)]"
                          : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {currentPlayerReady ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                          Ready
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 md:h-6 md:w-6" />
                          Tap to Ready
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
