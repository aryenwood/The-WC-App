import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {HEIGHT, TEAL_RGBA, TIMING, WIDTH} from '../constants';
import {RainDrop, RainDropData} from '../components/RainDrop';

// Seeded random for deterministic output
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildRainDrops(): RainDropData[] {
  const rand = seededRandom(42);
  const count = Math.floor(WIDTH / 6);
  const drops: RainDropData[] = [];

  for (let i = 0; i < count; i++) {
    const r = rand();
    const isNeon = rand() < 0.03;
    let color: string;
    const colorR = rand();
    if (colorR < 0.55) color = 'rgba(20,200,215,1)';
    else if (colorR < 0.75) color = 'rgba(120,60,220,1)';
    else if (colorR < 0.90) color = 'rgba(255,140,40,1)';
    else color = 'rgba(220,230,240,1)';

    drops.push({
      id: i,
      x: rand() * WIDTH,
      startY: -rand() * HEIGHT * 0.5,
      length: isNeon ? rand() * 180 + 90 : rand() * 100 + 20,
      width: rand() * 0.8 + 0.6,
      speed: rand() * 10 + 8,
      color,
      isNeon,
      startFrame: Math.floor(rand() * 60),
    });
  }
  return drops;
}

const RAIN_DROPS = buildRainDrops();

function buildSteamWisps() {
  const rand = seededRandom(99);
  return Array.from({length: 16}, (_, i) => ({
    id: i,
    x: rand() * WIDTH,
    startY: HEIGHT * 0.85 + rand() * HEIGHT * 0.1,
    radius: rand() * 90 + 30,
    driftX: (rand() - 0.5) * 4,
    delay: Math.floor(rand() * 40),
  }));
}
const STEAM_WISPS = buildSteamWisps();

export const RainSystem: React.FC = () => {
  const frame = useCurrentFrame();

  // Grid
  const gridLocalFrame = frame - TIMING.GRID_SNAP;
  const gridOpacity = interpolate(
    gridLocalFrame,
    [0, 1, 8, 20],
    [0, 0.8, 0.6, 0.6],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Steam (starts frame 20)
  const steamStart = 20;

  const GRID_SPACING = 55;
  const hLines = Math.ceil(HEIGHT / GRID_SPACING);
  const vLines = Math.ceil(WIDTH / GRID_SPACING);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Rain drops */}
      {frame >= TIMING.RAIN_START &&
        RAIN_DROPS.map((d) => <RainDrop key={d.id} d={d} />)}

      {/* Steam wisps */}
      {frame >= steamStart &&
        STEAM_WISPS.map((w) => {
          const wFrame = frame - steamStart - w.delay;
          if (wFrame < 0) return null;
          const rise = interpolate(wFrame, [0, 120], [0, -180], {
            extrapolateRight: 'clamp',
          });
          const opacity = interpolate(wFrame, [0, 20, 80, 120], [0, 0.05, 0.04, 0], {
            extrapolateRight: 'clamp',
          });
          const drift = Math.sin(wFrame * 0.05) * w.driftX;
          return (
            <div
              key={w.id}
              style={{
                position: 'absolute',
                left: w.x + drift,
                top: w.startY + rise,
                width: w.radius * 2,
                height: w.radius * 2,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(20,143,152,${opacity}) 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}

      {/* Grid overlay */}
      {gridLocalFrame >= 0 && (
        <svg
          style={{position: 'absolute', inset: 0, opacity: gridOpacity}}
          width={WIDTH}
          height={HEIGHT}
        >
          {/* Horizontal lines */}
          {Array.from({length: hLines}, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * GRID_SPACING}
              x2={WIDTH}
              y2={i * GRID_SPACING}
              stroke="white"
              strokeWidth={0.5}
              strokeOpacity={i % 4 === 0 ? 0.12 : 0.04}
            />
          ))}
          {/* Vertical lines */}
          {Array.from({length: vLines}, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * GRID_SPACING}
              y1={0}
              x2={i * GRID_SPACING}
              y2={HEIGHT}
              stroke="white"
              strokeWidth={0.5}
              strokeOpacity={i % 4 === 0 ? 0.12 : 0.04}
            />
          ))}
          {/* Diagonal accent lines at -7 degrees */}
          <line
            x1={-200}
            y1={HEIGHT * 0.5}
            x2={WIDTH + 200}
            y2={HEIGHT * 0.5 + Math.tan((7 * Math.PI) / 180) * (WIDTH + 400)}
            stroke={TEAL_RGBA(0.06)}
            strokeWidth={1}
          />
          <line
            x1={-200}
            y1={HEIGHT * 0.4}
            x2={WIDTH + 200}
            y2={HEIGHT * 0.4 + Math.tan((7 * Math.PI) / 180) * (WIDTH + 400)}
            stroke={TEAL_RGBA(0.04)}
            strokeWidth={0.8}
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};
