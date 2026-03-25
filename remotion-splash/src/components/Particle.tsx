import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING_CONFIG, TEAL_RGBA, TIMING} from '../constants';

export type ParticleData = {
  id: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  delay: number; // frames after LOGO_PARTICLES_START
};

export const Particle: React.FC<{p: ParticleData; targetX: number; targetY: number}> = ({
  p,
  targetX,
  targetY,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - TIMING.LOGO_PARTICLES_START - p.delay;

  const progress = spring({
    frame: localFrame,
    fps,
    config: SPRING_CONFIG,
    durationInFrames: 35,
  });

  const x = interpolate(progress, [0, 1], [p.startX, targetX]);
  const y = interpolate(progress, [0, 1], [p.startY, targetY]);

  // Near center: accelerate
  const distToCenter = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
  const nearCenter = distToCenter < 60;

  // Shimmer between teal and white in last 5 frames of travel
  const shimmerFrame = localFrame - 30;
  const shimmer =
    shimmerFrame > 0
      ? interpolate(Math.sin(shimmerFrame * 1.2), [-1, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  const baseColor = p.color;
  const opacity =
    localFrame < 0
      ? 0
      : interpolate(localFrame, [0, 3], [0, 1], {
          extrapolateRight: 'clamp',
        });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: p.size,
        height: p.size,
        borderRadius: '50%',
        background: shimmer > 0.5 ? TEAL_RGBA(0.9) : baseColor,
        opacity,
        boxShadow: nearCenter ? `0 0 ${p.size * 3}px ${TEAL_RGBA(0.6)}` : undefined,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform',
      }}
    />
  );
};
