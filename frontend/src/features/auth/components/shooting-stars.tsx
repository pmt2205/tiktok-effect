import React, { useState } from 'react';

interface Star {
  id: number;
  top: string;
  right: string;
  width: string;
  height: string;
  color: string;
  duration: string;
  delay: string;
}

const generateStars = (): Star[] => {
  const colors = ['#ff0050', '#00f2fe', '#ffffff', '#9d4edd'];
  const starCount = 25;
  return Array.from({ length: starCount }).map((_, i) => {
    const top = `${Math.random() * 80 - 10}%`;
    const right = `${Math.random() * 100 - 10}%`;
    const width = `${Math.random() * 150 + 70}px`;
    const height = `${Math.random() * 1.2 + 1.2}px`;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = `${Math.random() * 3 + 2.5}s`;
    const delay = `${Math.random() * 8}s`;

    return {
      id: i,
      top,
      right,
      width,
      height,
      color,
      duration,
      delay,
    };
  });
};

export default function ShootingStars() {
  const [stars] = useState<Star[]>(generateStars);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute opacity-0 origin-left-center animate-shoot-diagonal bg-[linear-gradient(90deg,_var(--star-color)_0%,_transparent_100%)] filter-[drop-shadow(0_0_6px_var(--star-color))]"
          style={{
            top: star.top,
            right: star.right,
            width: star.width,
            height: star.height,
            '--star-color': star.color,
            animationDuration: star.duration,
            animationDelay: star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
