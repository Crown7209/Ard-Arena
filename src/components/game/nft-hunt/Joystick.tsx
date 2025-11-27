import React, { useRef, useState } from "react";

const Joystick = ({ onMove }: { onMove: (x: number, y: number) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDist = rect.width / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setPosition({ x: dx, y: dy });

    // Normalize output -1 to 1
    onMove(dx / maxDist, dy / maxDist);
  };

  const handleTouchEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-20 h-20 bg-slate-800/50 rounded-full border-2 border-slate-600 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute w-8 h-8 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 transition-transform duration-75"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  );
};

export default Joystick;
