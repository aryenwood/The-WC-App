import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {TEAL_RGBA, TIMING, WIDTH} from '../constants';

export const LightStreak: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - TIMING.STREAK_START;

  if (frame < TIMING.STREAK_START) return null;

  // Main line grows from 0 to full width in frames 3-5
  const lineWidth = interpolate(localFrame, [0, 2], [0, WIDTH], {
    extrapolateRight: 'clamp',
  });

  // Line thickness: 2px → 4px over frames 3-6
  const lineThick = interpolate(localFrame, [0, 3], [2, 4], {
    extrapolateRight: 'clamp',
  });

  // Explode to band: frames 7-9
  const bandOpacity = interpolate(localFrame, [4, 7, 9], [0, 0.08, 0.08], {
    extrapolateRight: 'clamp',
  });
  const bandHeight = interpolate(localFrame, [4, 9], [4, 80], {
    extrapolateRight: 'clamp',
  });

  // Ghost copies above/below: appear at frame 4-6
  const ghostOpacity = interpolate(localFrame, [1, 3, 8, 12], [0, 0.15, 0.12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fading persistent ghost line after band (frame 10+)
  const persistOpacity = interpolate(localFrame, [7, 10, 50], [0, 0.06, 0.03], {
    extrapolateRight: 'clamp',
  });

  const y = 0.52; // 52% from top

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Expanding band */}
      <div
        style={{
          position: 'absolute',
          top: `${y * 100}%`,
          left: 0,
          right: 0,
          height: bandHeight,
          transform: 'translateY(-50%)',
          background: `linear-gradient(to bottom, transparent, ${TEAL_RGBA(bandOpacity * 2)} 50%, transparent)`,
        }}
      />

      {/* Ghost copies (motion blur sim) */}
      {[-8, -4, 4, 8].map((offset, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `calc(${y * 100}% + ${offset}px)`,
            left: `calc(50% - ${lineWidth / 2}px)`,
            width: lineWidth,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${TEAL_RGBA(ghostOpacity)}, transparent)`,
          }}
        />
      ))}

      {/* Main streak line */}
      <div
        style={{
          position: 'absolute',
          top: `${y * 100}%`,
          left: `calc(50% - ${lineWidth / 2}px)`,
          width: lineWidth,
          height: lineThick,
          transform: 'translateY(-50%)',
          background: `linear-gradient(90deg, transparent 0%, ${TEAL_RGBA(1)} 20%, ${TEAL_RGBA(1)} 80%, transparent 100%)`,
          boxShadow: `0 0 8px ${TEAL_RGBA(0.6)}, 0 0 20px ${TEAL_RGBA(0.3)}`,
        }}
      />

      {/* Persistent HUD ghost line */}
      <div
        style={{
          position: 'absolute',
          top: `${y * 100}%`,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${TEAL_RGBA(persistOpacity * 2)} 30%, ${TEAL_RGBA(persistOpacity * 2)} 70%, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
