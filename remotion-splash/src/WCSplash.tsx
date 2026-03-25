import {loadFont as loadBigShoulders} from '@remotion/google-fonts/BigShoulders';
import {loadFont as loadJetBrains} from '@remotion/google-fonts/JetBrainsMono';
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {HEIGHT, TEAL_RGBA, TIMING, WIDTH} from './constants';
import {HUDBracket} from './components/HUDBracket';
import {CityAtmosphere} from './scenes/CityAtmosphere';
import {LightStreak} from './scenes/LightStreak';
import {LogoAssembly} from './scenes/LogoAssembly';
import {RainSystem} from './scenes/RainSystem';
import {StatsBar} from './scenes/StatsBar';
import {TextReveal} from './scenes/TextReveal';

// Load fonts — blocks render until ready
loadBigShoulders('normal', {weights: ['800'], subsets: ['latin']});
loadJetBrains('normal', {weights: ['400'], subsets: ['latin']});

export type WCSplashProps = {
  orgName: string;
  orgColor: string;
  orgLogoUrl: string;
  platformDoors: number;
  platformCloses: number;
};

export const WCSplash: React.FC<WCSplashProps> = ({
  platformDoors,
  platformCloses,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // HUD brackets visible from TIMING.HUD_IN
  const showHUD = frame >= TIMING.HUD_IN;
  const MARGIN = 32;

  return (
    <AbsoluteFill
      style={{
        background: '#000000',
        width,
        height,
        overflow: 'hidden',
      }}
    >
      {/* Scene 2: City atmosphere */}
      <CityAtmosphere />

      {/* Scene 1: Light streak */}
      <LightStreak />

      {/* Scene 2b: Rain + grid */}
      <RainSystem />

      {/* HUD brackets */}
      {showHUD && (
        <>
          <HUDBracket corner="tl" x={MARGIN} y={MARGIN} />
          <HUDBracket corner="tr" x={WIDTH - MARGIN - 50} y={MARGIN} />
          <HUDBracket corner="bl" x={MARGIN} y={HEIGHT - MARGIN - 50} />
          <HUDBracket corner="br" x={WIDTH - MARGIN - 50} y={HEIGHT - MARGIN - 50} />
        </>
      )}

      {/* Scene 3: Logo assembly */}
      <LogoAssembly />

      {/* Scene 4: Text reveal */}
      <TextReveal />

      {/* Scene 5: Stats bar */}
      <StatsBar platformDoors={platformDoors} platformCloses={platformCloses} />

      {/* Persistent scan line overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.04) 3px,
            rgba(0,0,0,0.04) 4px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Corner vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
