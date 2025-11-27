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
    <div className="relative min-h-screen overflow-hidden text-white">
      {neonBg}
      <div className="relative z-10 flex min-h-screen flex-col items-center gap-8 px-4 py-6 md:px-8 md:py-10">
        <header className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
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
          <div className="flex flex-wrap items-center gap-4">
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

        <main className="grid w-full max-w-5xl flex-1 gap-5 lg:grid-cols-2">
          <section className={`${panelClass} space-y-7 p-5 lg:p-8`}>
            <div className="flex flex-col items-center gap-6">
              <RoomCode code={code} />
              {isHost && joinUrl && (
                <div className="rounded-3xl border border-white/20 bg-black/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                  <QRCodeSVG value={joinUrl} size={220} />
                </div>
              )}
              {isHost && (
                <p className="text-center text-sm text-white/60">
                  Players can scan this QR to connect instantly. Keep the screen visible.
                </p>
              )}
            </div>
          </section>

          <section className={`${panelClass} flex flex-col`}>
            <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-5">
              <PlayerList players={players} currentPlayerId={currentPlayerId} />
            </div>
            <div className="mt-6">
              {isHost ? (
                <>
                  <Button
                    onClick={onStartGame}
                    disabled={players.length === 0 || !playersReady}
                    className="flex w-full h-16 items-center justify-center gap-3 rounded-2xl border-0 bg-[#64ccc5] text-lg font-bold uppercase tracking-[0.3em] text-slate-950 shadow-[0_0_35px_rgba(100,204,197,0.35)] hover:bg-[#56b4ae] disabled:opacity-40"
                  >
                    <Play className="h-6 w-6" />
                    Launch Match
                  </Button>
                  {!playersReady && players.length > 0 && (
                    <p className="mt-3 text-center text-sm uppercase tracking-[0.3em] text-amber-400 animate-pulse">
                      Waiting for all players...
                    </p>
                  )}
                </>
              ) : (
                <Button
                  onClick={onToggleReady}
                  className={`flex w-full h-16 items-center justify-center gap-3 rounded-2xl text-lg font-bold tracking-[0.3em] ${
                    currentPlayerReady
                      ? "border border-[#64ccc5] bg-[#64ccc5]/10 text-[#64ccc5]"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {currentPlayerReady ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      Ready
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6" />
                      Tap to Ready
                    </>
                  )}
                </Button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

