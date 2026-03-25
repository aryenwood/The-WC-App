import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING_CONFIG, TEAL_RGBA, TIMING} from '../constants';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

export const HUDBracket: React.FC<{
  corner: Corner;
  x: number;
  y: number;
  size?: number;
}> = ({corner, x, y, size = 50}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - TIMING.HUD_IN;

  const progress = spring({
    frame: localFrame,
    fps,
    config: {...SPRING_CONFIG, stiffness: 120},
    durationInFrames: 20,
  });

  const offset = interpolate(progress, [0, 1], [30, 0]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'});

  const dx = corner === 'tl' || corner === 'bl' ? -offset : offset;
  const dy = corner === 'tl' || corner === 'tr' ? -offset : offset;

  const stroke = TEAL_RGBA(0.8);
  const tickLen = 10;

  // Corner path based on position
  const isLeft = corner === 'tl' || corner === 'bl';
  const isTop = corner === 'tl' || corner === 'tr';

  const hSign = isLeft ? 1 : -1;
  const vSign = isTop ? 1 : -1;

  // L-shape path: horizontal arm then vertical arm
  const path = `M ${isLeft ? 0 : size} ${isTop ? size * 0.4 : size * 0.6}
    L ${isLeft ? 0 : size} ${isTop ? 0 : size}
    L ${isLeft ? size * 0.4 : size * 0.6} ${isTop ? 0 : size}`;

  return (
    <div
      style={{
        position: 'absolute',
        left: x + dx,
        top: y + dy,
        width: size,
        height: size,
        opacity,
      }}
    >
      <svg width={size} height={size} style={{overflow: 'visible'}}>
        {/* Main L bracket */}
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Corner dot */}
        <circle
          cx={isLeft ? 0 : size}
          cy={isTop ? 0 : size}
          r={2.5}
          fill={TEAL_RGBA(1)}
        />
        {/* Tick marks */}
        <line
          x1={isLeft ? -tickLen / 2 : size + tickLen / 2}
          y1={isTop ? size * 0.2 : size * 0.8}
          x2={isLeft ? tickLen / 2 : size - tickLen / 2}
          y2={isTop ? size * 0.2 : size * 0.8}
          stroke={TEAL_RGBA(0.4)}
          strokeWidth={0.8}
        />
        {/* Side text (tiny HUD label) */}
        <text
          x={isLeft ? size * 0.55 : size * 0.45}
          y={isTop ? size * 0.7 : size * 0.3}
          fontSize={6}
          fill={TEAL_RGBA(0.25)}
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing={2}
        >
          {corner.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};
