interface RoomCodeProps {
  code: string;
}

export function RoomCode({ code }: RoomCodeProps) {
  return (
    <div className="flex flex-col items-center gap-2 md:gap-4">
      <span className="text-[10px] md:text-sm text-white/60 uppercase tracking-[0.2em] md:tracking-widest font-bold">
        Room Code
      </span>
      <div className="flex items-center gap-2 md:gap-4 bg-black/60 px-3 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl border border-white/20">
        <div className="text-2xl md:text-7xl font-mono font-black text-[#64ccc5] tracking-[0.15em] md:tracking-[0.2em]">
          {code}
        </div>
      </div>
    </div>
  );
}
