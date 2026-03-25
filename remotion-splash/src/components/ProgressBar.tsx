import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {TEAL_RGBA, TIMING} from '../constants';

const LABELS = [
  {frame: TIMING.STATS_START + 5, text: 'INITIALIZING...'},
  {frame: 200, text: 'AUTHENTICATING...'},
  {frame: 240, text: 'LOADING ORG DATA...'},
  {frame: 270, text: 'SYNCING TEAM...'},
];

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();

  const localFrame = frame - TIMING.STATS_START;
  if (localFrame < 0) return null;

  const totalFrames = TIMING.LOOP_POINT - TIMING.STATS_START;
  const progress = interpolate(localFrame, [0, totalFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  // Find current label
  let label = LABELS[0].text;
  for (const l of LABELS) {
    if (frame >= l.frame) label = l.text;
  }

  const barWidth = 300;
  const tipX = progress * barWidth;

  return (
    <div style={{width: barWidth, position: 'relative'}}>
      {/* Track */}
      <div
        style={{
          width: barWidth,
          height: 2,
          background: TEAL_RGBA(0.1),
          borderRadius: 1,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: tipX,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${TEAL_RGBA(0.5)} 60%, ${TEAL_RGBA(0.9)})`,
            borderRadius: 1,
          }}
        />
        {/* Arrow-head tip */}
        <div
          style={{
            position: 'absolute',
            left: tipX - 4,
            top: -3,
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `8px solid ${TEAL_RGBA(1)}`,
            filter: `drop-shadow(0 0 8px ${TEAL_RGBA(1)}) drop-shadow(0 0 16px ${TEAL_RGBA(0.4)})`,
          }}
        />
      </div>
      {/* Label */}
      <div
        style={{
          marginTop: 8,
          fontSize: 9,
          fontFamily: 'JetBrains Mono, monospace',
          color: TEAL_RGBA(0.38),
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
};
