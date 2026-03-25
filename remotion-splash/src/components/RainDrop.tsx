import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HEIGHT, TIMING} from '../constants';

export type RainDropData = {
  id: number;
  x: number;
  startY: number;
  length: number;
  width: number;
  speed: number;
  color: string;
  isNeon: boolean;
  startFrame: number; // offset from RAIN_START
};

export const RainDrop: React.FC<{d: RainDropData}> = ({d}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - TIMING.RAIN_START - d.startFrame;

  if (localFrame < 0) return null;

  const totalFrames = Math.ceil((HEIGHT - d.startY) / d.speed);
  const y = interpolate(localFrame, [0, totalFrames], [d.startY, HEIGHT + d.length], {
    extrapolateRight: 'clamp',
  });

  // Fade in at top
  const opacity = interpolate(localFrame, [0, 4], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: d.x,
        top: y,
        width: d.width,
        height: d.length,
        background: `linear-gradient(to bottom, ${d.color} 0%, transparent 100%)`,
        opacity: d.isNeon ? opacity * 0.85 : opacity * 0.55,
        borderRadius: 1,
        boxShadow: d.isNeon ? `0 0 4px ${d.color}` : undefined,
        willChange: 'transform',
      }}
    />
  );
};
