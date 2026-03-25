import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HEIGHT, TEAL_RGBA, TIMING, WIDTH} from '../constants';

const CX = WIDTH / 2;
const CY = HEIGHT / 2 - 120;
const LOGO_SIZE = 140;
const TEXT_Y = CY + LOGO_SIZE / 2 + 22;

const WC_LETTERS = ['W', 'C', ' ', 'A', 'P', 'P'];

export const TextReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (frame < TIMING.TEXT_START) return null;

  const localFrame = frame - TIMING.TEXT_START;

  // Divider: draws from center outward at frame 135-145
  const dividerStart = 135 - TIMING.TEXT_START;
  const dividerProgress = interpolate(localFrame, [dividerStart, dividerStart + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dividerHalf = dividerProgress * 80;

  // Tagline typewriter: frame 142
  const taglineStart = 142 - TIMING.TEXT_START;
  const TAGLINE = 'THE D2D SALES PLATFORM';
  const charsVisible = Math.floor(
    interpolate(localFrame, [taglineStart, taglineStart + TAGLINE.length], [0, TAGLINE.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const cursorVisible = localFrame < taglineStart + TAGLINE.length + 10;
  const cursorBlink = Math.floor(localFrame * 0.5) % 2 === 0;

  // HUD side text: frame 130-150
  const hudStart = 130 - TIMING.TEXT_START;
  const hudOpacity = interpolate(localFrame, [hudStart, hudStart + 20], [0, 0.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "WC APP" letters */}
      <div
        style={{
          position: 'absolute',
          top: TEXT_Y,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {WC_LETTERS.map((letter, i) => {
          const letterDelay = i * 5;
          const lFrame = localFrame - letterDelay;
          const lSpring = spring({
            frame: lFrame,
            fps,
            config: {mass: 0.5, stiffness: 200, damping: 12},
            durationInFrames: 20,
          });
          const translateY = interpolate(lSpring, [0, 1], [-20, 0]);
          const letterOpacity = interpolate(lFrame, [0, 5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          // Ghost copy
          const ghostOpacity = interpolate(lFrame, [0, 3], [0.3, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          if (letter === ' ') return <div key={i} style={{width: 16}} />;

          return (
            <div key={i} style={{position: 'relative'}}>
              {/* Ghost */}
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  left: 0,
                  right: 0,
                  fontFamily: '"Big Shoulders Display", sans-serif',
                  fontWeight: 800,
                  fontSize: 88,
                  color: 'white',
                  opacity: ghostOpacity,
                  lineHeight: 1,
                }}
              >
                {letter}
              </div>
              {/* Main letter */}
              <div
                style={{
                  fontFamily: '"Big Shoulders Display", sans-serif',
                  fontWeight: 800,
                  fontSize: 88,
                  color: 'white',
                  letterSpacing: 8,
                  opacity: letterOpacity,
                  transform: `translateY(${translateY}px)`,
                  lineHeight: 1,
                  textShadow: '0 0 30px rgba(255,255,255,0.15)',
                }}
              >
                {letter}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teal divider */}
      {dividerProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: TEXT_Y + 96,
            left: CX - dividerHalf,
            right: CX - dividerHalf,
            height: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: dividerHalf * 2,
              height: 1.5,
              background: `linear-gradient(90deg, transparent, ${TEAL_RGBA(0.9)}, transparent)`,
              position: 'relative',
            }}
          >
            {dividerProgress > 0.95 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: -3,
                    top: -3,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: TEAL_RGBA(0.9),
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: -3,
                    top: -3,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: TEAL_RGBA(0.9),
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Tagline */}
      <div
        style={{
          position: 'absolute',
          top: TEXT_Y + 108,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: TEAL_RGBA(0.65),
          letterSpacing: 5,
        }}
      >
        {TAGLINE.slice(0, charsVisible)}
        {cursorVisible && cursorBlink && (
          <span style={{opacity: 0.8}}>|</span>
        )}
      </div>

      {/* HUD side texts */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: HEIGHT / 2,
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'center center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 7,
          color: TEAL_RGBA(hudOpacity),
          letterSpacing: 3,
          whiteSpace: 'nowrap',
        }}
      >
        D2D · PLATFORM · SYS
      </div>
      <div
        style={{
          position: 'absolute',
          right: 24,
          top: HEIGHT / 2,
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'center center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 7,
          color: TEAL_RGBA(hudOpacity),
          letterSpacing: 3,
          whiteSpace: 'nowrap',
        }}
      >
        WC · ALPHA · 0.1
      </div>
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 32,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 7,
          color: TEAL_RGBA(Math.min(hudOpacity, 0.15)),
          letterSpacing: 3,
        }}
      >
        α ALPHA
      </div>
    </AbsoluteFill>
  );
};
