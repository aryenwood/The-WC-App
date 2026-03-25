import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HEIGHT, TEAL_RGBA, TIMING, WIDTH, WC_LOGO_B64} from '../constants';
import {Particle, ParticleData} from '../components/Particle';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildParticles(): ParticleData[] {
  const rand = seededRandom(7);
  const count = 280;
  const particles: ParticleData[] = [];

  const COLORS = [
    TEAL_RGBA(0.9),
    'rgba(255,255,255,0.9)',
    'rgba(140,80,220,0.9)',
    TEAL_RGBA(0.7),
    'rgba(255,255,255,0.7)',
  ];

  for (let i = 0; i < count; i++) {
    const edge = Math.floor(rand() * 4);
    let startX: number, startY: number;

    switch (edge) {
      case 0: startX = rand() * WIDTH; startY = 0; break;         // top
      case 1: startX = WIDTH; startY = rand() * HEIGHT; break;    // right
      case 2: startX = rand() * WIDTH; startY = HEIGHT; break;    // bottom
      default: startX = 0; startY = rand() * HEIGHT; break;       // left
    }

    particles.push({
      id: i,
      startX,
      startY,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      size: rand() * 2 + 1,
      delay: Math.floor(rand() * 20),
    });
  }
  return particles;
}

const PARTICLES = buildParticles();

const CX = WIDTH / 2;
const CY = HEIGHT / 2 - 120;
const LOGO_SIZE = 140;

export const LogoAssembly: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Collision burst
  const burstFrame = frame - TIMING.LOGO_COLLISION;
  const burstRadius = interpolate(burstFrame, [0, 1, 2], [0, 160, 240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const burstOpacity = interpolate(burstFrame, [0, 1, 2], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo reveal
  const logoRevealFrame = frame - TIMING.LOGO_REVEAL;
  const logoOpacity = interpolate(logoRevealFrame, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo breathing (starts frame 120, loops every 90)
  const breathFrame = (frame - TIMING.TEXT_START) % 90;
  const breath = interpolate(breathFrame, [0, 45, 90], [1.0, 1.015, 1.0]);
  const bloomOpacity = interpolate(breathFrame, [0, 45, 90], [0.04, 0.08, 0.04]);

  // Sonar rings
  const sonarRings = [
    {start: TIMING.LOGO_REVEAL + 2, end: TIMING.LOGO_REVEAL + 32, maxR: 320, startOpacity: 0.6},
    {start: TIMING.LOGO_REVEAL + 14, end: TIMING.LOGO_REVEAL + 44, maxR: 380, startOpacity: 0.4},
    {start: TIMING.LOGO_REVEAL + 26, end: TIMING.LOGO_REVEAL + 56, maxR: 440, startOpacity: 0.25},
  ];

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Particles */}
      {frame >= TIMING.LOGO_PARTICLES_START &&
        frame <= TIMING.LOGO_REVEAL &&
        PARTICLES.map((p) => (
          <Particle key={p.id} p={p} targetX={CX} targetY={CY} />
        ))}

      {/* Collision burst ring */}
      {burstOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: CX - burstRadius,
            top: CY - burstRadius,
            width: burstRadius * 2,
            height: burstRadius * 2,
            borderRadius: '50%',
            border: `2px solid rgba(255,255,255,${burstOpacity})`,
            background: `radial-gradient(circle, rgba(255,255,255,${burstOpacity * 0.3}) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* WC Logo circle */}
      {logoOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: CX - LOGO_SIZE / 2,
            top: CY - LOGO_SIZE / 2,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            borderRadius: '50%',
            transform: `scale(${frame >= TIMING.TEXT_START ? breath : 1})`,
            opacity: logoOpacity,
          }}
        >
          {/* Outer bloom */}
          <div
            style={{
              position: 'absolute',
              inset: -30,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${TEAL_RGBA(bloomOpacity)} 0%, transparent 70%)`,
            }}
          />
          {/* Logo circle container */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, #162030, #060a12)',
              border: `2.5px solid ${TEAL_RGBA(0.9)}`,
              boxShadow: [
                `0 0 20px ${TEAL_RGBA(0.15)}`,
                `0 0 40px ${TEAL_RGBA(0.08)}`,
                `0 0 80px ${TEAL_RGBA(0.04)}`,
              ].join(', '),
              overflow: 'hidden',
            }}
          >
            {/* Inner ring */}
            <div
              style={{
                position: 'absolute',
                inset: 10,
                borderRadius: '50%',
                border: `1px solid ${TEAL_RGBA(0.18)}`,
              }}
            />
            {/* Logo image */}
            <Img
              src={WC_LOGO_B64}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>
      )}

      {/* Sonar rings */}
      {sonarRings.map((ring, i) => {
        const rFrame = frame - ring.start;
        if (rFrame < 0 || frame > ring.end) return null;
        const t = rFrame / (ring.end - ring.start);
        const radius = interpolate(t, [0, 1], [LOGO_SIZE / 2, ring.maxR / 2]);
        const opacity = interpolate(t, [0, 1], [ring.startOpacity, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CX - radius,
              top: CY - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              border: `1px solid ${TEAL_RGBA(opacity)}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
