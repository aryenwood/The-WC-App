import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {TIMING} from '../constants';

export const CityAtmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - TIMING.ATMOSPHERE_START;

  if (localFrame < 0) return null;

  // Layer 1 — Deep void
  const voidOpacity = interpolate(localFrame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});

  // Layer 2 — Amber city glow (bottom 30%)
  const amberOpacity = interpolate(localFrame, [0, 40], [0, 0.18], {extrapolateRight: 'clamp'});

  // Layer 3 — Teal sky (top 40%)
  const tealOpacity = interpolate(localFrame, [0, 35], [0, 0.6], {extrapolateRight: 'clamp'});

  // Layer 4 — Purple district (right 30%)
  const purpleOpacity = interpolate(localFrame, [0, 50], [0, 0.15], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Base — near black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `#020509`,
          opacity: voidOpacity,
        }}
      />

      {/* Amber city horizon glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 40% at 50% 85%, rgba(255,100,20,${amberOpacity}) 0%, transparent 100%)`,
        }}
      />

      {/* Teal sky top */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom, rgba(0,25,35,${tealOpacity}) 0%, transparent 40%)`,
        }}
      />

      {/* Purple district right */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 50% 60% at 85% 50%, rgba(80,20,140,${purpleOpacity}) 0%, transparent 100%)`,
        }}
      />

      {/* Subtle city silhouette suggestion */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '28%',
          background: `linear-gradient(to top, rgba(2,5,9,${voidOpacity * 0.8}) 0%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
