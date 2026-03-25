import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {TEAL_RGBA, TIMING, WIDTH} from '../constants';
import {ProgressBar} from '../components/ProgressBar';

type Props = {
  platformDoors: number;
  platformCloses: number;
};

export const StatsBar: React.FC<Props> = ({platformDoors, platformCloses}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - TIMING.STATS_START;

  if (localFrame < 0) return null;

  // Slide up from y+20
  const slideY = interpolate(localFrame, [0, 18], [20, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const containerOpacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Stats count-up: frames 175-230
  const countStart = 175 - TIMING.STATS_START;
  const countEnd = 230 - TIMING.STATS_START;
  const countProgress = interpolate(localFrame, [countStart, countEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });

  const doorsVal = Math.round(countProgress * platformDoors);
  const closesVal = Math.round(countProgress * platformCloses);
  const rate = platformDoors > 0 ? ((platformCloses / platformDoors) * 100).toFixed(1) : '0.0';
  const rateVal = (countProgress * parseFloat(rate)).toFixed(1);

  // Flash on landing
  const landed = localFrame >= countEnd;
  const flashFrame = localFrame - countEnd;
  const flashBrightness =
    landed && flashFrame < 2
      ? 1.2
      : 1;

  const stats = [
    {label: 'DOORS', value: doorsVal.toLocaleString()},
    {label: 'CLOSES', value: closesVal.toLocaleString()},
    {label: 'RATE', value: rateVal + '%'},
  ];

  const barWidth = Math.min(360, WIDTH * 0.88);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          left: '50%',
          transform: `translateX(-50%) translateY(${slideY}px)`,
          opacity: containerOpacity,
          width: barWidth,
        }}
      >
        {/* Stats container */}
        <div
          style={{
            background: 'rgba(3,7,12,0.94)',
            border: `1px solid ${TEAL_RGBA(0.18)}`,
            borderTop: `1px solid ${TEAL_RGBA(0.4)}`,
            clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
            padding: '20px 24px 16px',
            filter: `brightness(${flashBrightness})`,
          }}
        >
          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: 20,
            }}
          >
            {stats.map((s) => (
              <div key={s.label} style={{textAlign: 'center'}}>
                <div
                  style={{
                    fontFamily: '"Big Shoulders Display", sans-serif',
                    fontWeight: 800,
                    fontSize: 28,
                    color: 'white',
                    lineHeight: 1,
                    textShadow: `0 0 12px ${TEAL_RGBA(0.6)}, 0 0 24px ${TEAL_RGBA(0.3)}`,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 8,
                    color: TEAL_RGBA(0.5),
                    letterSpacing: 3,
                    marginTop: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: TEAL_RGBA(0.12),
              marginBottom: 16,
            }}
          />

          {/* Progress bar */}
          <ProgressBar />
        </div>
      </div>
    </AbsoluteFill>
  );
};
