"use client";

import Image from "next/image";
import { Star, Users } from "lucide-react";

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
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl bg-black/60 border border-white/20 transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_30px_rgba(100,204,197,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ccc5]"
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

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-white line-clamp-1 text-left">
            {title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < fullStars
                    ? "fill-[#64ccc5] text-[#64ccc5]"
                    : i === fullStars && hasHalfStar
                    ? "fill-[#64ccc5]/50 text-[#64ccc5]/50"
                    : "fill-transparent text-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/70">
          <Users className="h-4 w-4 text-[#64ccc5]" />
          <span>{players}</span>
        </div>

        <p className="text-sm text-white/80 line-clamp-2 text-left">
          {description}
        </p>
      </div>
    </button>
  );
};

export default GameCard;

