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
      className="relative w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-full border-2 touch-none"
      style={{ borderColor: "rgba(10, 94, 176, 0.4)" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full transition-transform duration-75 shadow-lg"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          backgroundColor: "#0A5EB0",
          boxShadow: "0 0 20px rgba(10, 94, 176, 0.5)"
        }}
      />
    </div>
  );
};

export default Joystick;
