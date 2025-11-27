"use client";

import Image from "next/image";
import { Users, Gamepad2 } from "lucide-react";

type GameCardProps = {
  title: string;
  description: string;
  rating: number;
  players: string;
  image: string;
  onClick: () => void;
};

const GameCard = ({
  title,
  description,
  rating,
  players,
  image,
  onClick,
}: GameCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl md:rounded-2xl bg-black/60 border border-white/20 transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_30px_rgba(100,204,197,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ccc5]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="flex flex-col gap-1.5 md:gap-3 p-2 md:p-4">
        <div className="flex items-start justify-between gap-1 md:gap-2">
          <h3 className="text-xs md:text-lg font-bold text-white line-clamp-1 text-left">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm text-white/70">
          <Users className="h-2.5 w-2.5 md:h-4 md:w-4 text-[#64ccc5]" />
          <span className="line-clamp-1">{players}</span>
        </div>

        <p className="text-[9px] md:text-sm text-white/80 line-clamp-2 md:line-clamp-2 text-left hidden md:block">
          {description}
        </p>

        {/* Mobile: Play button at bottom */}
        <div className="md:hidden mt-1.5">
          <div className="w-full flex items-center justify-center gap-1.5 h-7 px-3 rounded-lg bg-[#64ccc5] text-slate-950 text-[10px] font-semibold shadow-[0_0_15px_rgba(100,204,197,0.3)]">
            <Gamepad2 className="h-3 w-3" />
            <span>Play</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default GameCard;

