"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { start, reset } from "@/components/game/game";
import { Loader2 } from "lucide-react";

export default function GamePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;

    initialized.current = true;

    start({
      arena: {
        container: containerRef.current!,
        arena: 0,
      },
      fighters: [{ name: "subzero" }, { name: "kano" }],
      gameType: "multiplayer",
      callbacks: {
        "game-end": (winner) => {
          console.log("Game Over", winner);
          alert(`Game Over! Winner: ${winner.getName()}`);
          setTimeout(() => router.push("/"), 2000);
        },
      },
    }).ready(() => {
      setGameReady(true);
    });

    return () => {
      reset();
      initialized.current = false;
    };
  }, [router]);

  return (
    <div className="max-h-screen h-auto w-full flex flex-col items-center justify-center bg-gray-950 text-white">
      {!gameReady && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span className="text-xs text-gray-500">Initializing game...</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden bg-black w-full flex justify-center"
      />

      {/* <Button
          variant="secondary"
          onClick={() => {
            if (confirm("Are you sure you want to exit?")) {
              router.push("/");
            }
          }}
          className="px-6"
        >
          Exit Game
        </Button> */}
    </div>
  );
}
