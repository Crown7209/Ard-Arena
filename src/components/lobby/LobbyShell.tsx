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
      <div className="fixed inset-0 -z-10 hidden md:block">
        {neonBg}
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between gap-3 pl-4 pr-0 py-4 md:gap-4 md:pl-12 md:pr-0 md:py-10">
          <button
            onClick={() => router.push("/")}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 transition-all duration-200"
            aria-label="Go back"
          >
            <XCircle className="h-4 w-4 text-[#64ccc5]" />
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
              <p className="text-lg font-black text-[#64ccc5]">
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
                className={`h-5 w-5 ${playersReady ? "text-[#64ccc5]" : "text-white/40"}`}
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

        {/* Mobile: Vertical 2-box layout */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-10">
          <div className="max-w-5xl mx-auto">
            {/* Mobile: Stack vertically */}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-5">
              {/* Box 1: Room Code & QR */}
              <section className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-3 md:p-6">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="md:hidden w-full">
                    <RoomCode code={code} />
                  </div>
                  {isHost && joinUrl && (
                    <div className="rounded-lg md:rounded-3xl border border-white/20 bg-black/60 p-2 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                      <QRCodeSVG value={joinUrl} size={120} className="md:w-[200px] md:h-[200px]" />
                    </div>
                  )}
                  {isHost && (
                    <p className="text-center text-[10px] md:text-sm text-white/60">
                      Players can scan this QR to connect instantly. Keep the screen visible.
                    </p>
                  )}
                </div>
              </section>

              {/* Box 2: Players & Action Button */}
              <section className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-3 md:p-6 flex flex-col">
                <div className="flex-1 mb-3 md:mb-4">
                  <div className="mb-2 md:mb-3 flex items-center justify-between">
                    <h3 className="text-xs md:text-base font-bold text-white uppercase tracking-[0.2em] md:tracking-wider">
                      Players ({players.length})
                    </h3>
                    <div className="md:hidden flex items-center gap-1.5">
                      <CheckCircle2
                        className={`h-3 w-3 ${playersReady ? "text-[#64ccc5]" : "text-white/40"}`}
                      />
                      <span className="text-[10px] text-white/60">
                        {playersReady ? "Ready" : "Waiting"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <PlayerList players={players} currentPlayerId={currentPlayerId} />
                  </div>
                </div>
                <div className="mt-auto">
                  {isHost ? (
                    <>
                      <Button
                        onClick={onStartGame}
                        disabled={players.length === 0 || !playersReady}
                        className="flex w-full h-10 md:h-16 items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-2xl border-0 bg-[#64ccc5] text-xs md:text-lg font-bold uppercase tracking-[0.15em] md:tracking-[0.3em] text-slate-950 shadow-[0_0_15px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] disabled:opacity-40"
                      >
                        <Play className="h-3 w-3 md:h-6 md:w-6" />
                        Launch Match
                      </Button>
                      {!playersReady && players.length > 0 && (
                        <p className="mt-1.5 md:mt-2 text-center text-[10px] md:text-sm uppercase tracking-[0.15em] md:tracking-[0.3em] text-amber-400 animate-pulse">
                          Waiting for all players...
                        </p>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={onToggleReady}
                      className={`flex w-full h-10 md:h-16 items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-2xl text-xs md:text-lg font-bold tracking-[0.15em] md:tracking-[0.3em] ${
                        currentPlayerReady
                          ? "border border-[#64ccc5] bg-[#64ccc5]/10 text-[#64ccc5]"
                          : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {currentPlayerReady ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 md:h-6 md:w-6" />
                          Ready
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 md:h-6 md:w-6" />
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

