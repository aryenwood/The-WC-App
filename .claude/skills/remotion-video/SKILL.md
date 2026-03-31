---
name: remotion-video
description: "Programmatic video creation using Remotion - React components rendered to MP4. Use this skill for splash screens, animated intros, video exports, promotional videos."
---

# Remotion Video Skill

## Setup

The WC App has a Remotion project at `remotion-splash/`:

```
remotion-splash/
  src/
    Root.tsx              ← Composition registry
    WCSplash.tsx          ← Main splash screen component
    constants.ts          ← Dimensions, timing, easing, colors
    components/
      Particle.tsx        ← Individual particle component
      RainDrop.tsx        ← Rain drop animation
      HUDBracket.tsx      ← HUD corner bracket overlay
      ProgressBar.tsx     ← Animated progress bar
    scenes/
      LightStreak.tsx     ← Opening light streak effect
      CityAtmosphere.tsx  ← City skyline atmosphere
      RainSystem.tsx      ← Full rain system + grid
      TextReveal.tsx      ← Animated text reveal
      StatsBar.tsx        ← Platform stats counter
  package.json
```

### Install

```bash
cd remotion-splash
npm install
```

### Dependencies

```json
{
  "remotion": "^4.x",
  "@remotion/cli": "^4.x",
  "@remotion/google-fonts": "^4.x",
  "@remotion/player": "^4.x",
  "@remotion/renderer": "^4.x",
  "react": "^18.x",
  "react-dom": "^18.x"
}
```

## Core Concepts

### Frame-Based Animation

Remotion renders React components frame-by-frame. There is no CSS animation or requestAnimationFrame — everything is a pure function of `frame`:

```tsx
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp'
  });

  return <div style={{ opacity }}>Hello</div>;
};
```

### interpolate()

Maps a frame number to an output range:

```tsx
// Fade in from frame 0 to 30
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

// Slide from right: 100px → 0px between frames 10 and 40
const translateX = interpolate(frame, [10, 40], [100, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic)
});

// Multi-keyframe: scale up, hold, scale down
const scale = interpolate(frame, [0, 20, 80, 100], [0, 1, 1, 0]);
```

### Sequence & Series

```tsx
import { Sequence, Series } from 'remotion';

// Sequence: absolute positioning in time
<Sequence from={30} durationInFrames={60}>
  <MyScene />   {/* Renders from frame 30 to 90 */}
</Sequence>

// Series: sequential stacking (no overlap)
<Series>
  <Series.Sequence durationInFrames={60}>
    <IntroScene />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <MainScene />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <OutroScene />
  </Series.Sequence>
</Series>
```

## WC App Splash Screen — Full Spec

### Constants (constants.ts)

```ts
import { Easing } from 'remotion';

export const WIDTH = 1170;
export const HEIGHT = 2532;
export const FPS = 60;
export const DURATION = 300; // 5 seconds at 60fps

export const TIMING = {
  STREAK_START: 3,
  STREAK_END: 12,
  ATMOSPHERE_START: 8,
  RAIN_START: 12,
  GRID_SNAP: 15,
  HUD_IN: 18,
  LOGO_PARTICLES_START: 60,
  LOGO_COLLISION: 95,
  LOGO_REVEAL: 98,
  TEXT_START: 120,
  STATS_START: 160,
  LOOP_POINT: 230,
} as const;

export const SPRING_CONFIG = { mass: 0.8, stiffness: 80, damping: 14 } as const;

export const EASE = {
  OVERSHOOT: Easing.back(1.6),
  EXPO_OUT: Easing.out(Easing.exp),
  POWER3: Easing.out(Easing.cubic),
  POWER2_IN: Easing.in(Easing.quad),
} as const;

export const TEAL = '#14C8D7';
export const TEAL_RGBA = (a: number) => `rgba(20,200,215,${a})`;
```

### WCSplash Component (WCSplash.tsx)

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { HEIGHT, TEAL_RGBA, TIMING, WIDTH } from './constants';
import { HUDBracket } from './components/HUDBracket';
import { CityAtmosphere } from './scenes/CityAtmosphere';
import { LightStreak } from './scenes/LightStreak';
import { RainSystem } from './scenes/RainSystem';
import { StatsBar } from './scenes/StatsBar';
import { TextReveal } from './scenes/TextReveal';

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
  const { width, height } = useVideoConfig();

  const showHUD = frame >= TIMING.HUD_IN;
  const MARGIN = 32;

  return (
    <AbsoluteFill style={{ background: '#000000', width, height, overflow: 'hidden' }}>
      <CityAtmosphere />
      <LightStreak />
      <RainSystem />
      {showHUD && (
        <>
          <HUDBracket corner="tl" x={MARGIN} y={MARGIN} />
          <HUDBracket corner="tr" x={WIDTH - MARGIN - 50} y={MARGIN} />
          <HUDBracket corner="bl" x={MARGIN} y={HEIGHT - MARGIN - 50} />
          <HUDBracket corner="br" x={WIDTH - MARGIN - 50} y={HEIGHT - MARGIN - 50} />
        </>
      )}
      <TextReveal />
      <StatsBar doors={platformDoors} closes={platformCloses} />
    </AbsoluteFill>
  );
};
```

### Root.tsx

```tsx
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { WCSplash, WCSplashProps } from './WCSplash';
import { DURATION, FPS, HEIGHT, WIDTH } from './constants';

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WCSplash"
      component={WCSplash}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        orgName: '',
        orgColor: '#14C8D7',
        orgLogoUrl: '',
        platformDoors: 1204,
        platformCloses: 31,
      } satisfies WCSplashProps}
    />
  );
};

registerRoot(RemotionRoot);
```

## Render Commands

```bash
# Preview in browser (dev server)
npx remotion studio

# Render to MP4
npx remotion render WCSplash out/splash.mp4

# Render with custom props
npx remotion render WCSplash out/splash.mp4 --props='{"platformDoors":2500,"platformCloses":75}'

# Render specific frame range
npx remotion render WCSplash out/splash.mp4 --frames=0-150

# Render as GIF
npx remotion render WCSplash out/splash.gif --image-format=png

# Render single frame (thumbnail)
npx remotion still WCSplash out/thumbnail.png --frame=98
```

## Static Asset Setup

Place static assets in `public/`:

```
remotion-splash/
  public/
    logo.png
    city-bg.jpg
```

Reference them with `staticFile()`:

```tsx
import { staticFile, Img } from 'remotion';

<Img src={staticFile('logo.png')} style={{ width: 200 }} />
```

For base64-encoded assets, embed directly in constants (the WC App logo is stored as `WC_LOGO_B64` in constants.ts).

## Runtime MP4 Playback

To play the rendered MP4 in the WC App at runtime:

```html
<video
  id="splash-video"
  autoplay
  muted
  playsinline
  webkit-playsinline
  style="position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;z-index:9999;"
>
  <source src="assets/splash.mp4" type="video/mp4" />
</video>

<script>
  const video = document.getElementById('splash-video');
  video.addEventListener('ended', () => {
    video.style.opacity = '0';
    video.style.transition = 'opacity 0.5s';
    setTimeout(() => video.remove(), 600);
  });
</script>
```

## Interpolate Options Reference

```tsx
interpolate(
  input,       // Current frame number
  inputRange,  // [startFrame, endFrame] or multi-keyframe array
  outputRange, // [startValue, endValue] or matching multi-keyframe array
  {
    easing: Easing.out(Easing.cubic),    // Easing function
    extrapolateLeft: 'clamp',            // 'clamp' | 'extend' | 'identity'
    extrapolateRight: 'clamp',           // 'clamp' | 'extend' | 'identity'
  }
);
```

### Common Easing Functions

```tsx
import { Easing } from 'remotion';

Easing.linear            // Linear (default)
Easing.ease              // CSS ease equivalent
Easing.in(Easing.quad)   // Accelerate (quadratic)
Easing.out(Easing.quad)  // Decelerate (quadratic)
Easing.inOut(Easing.quad) // Accelerate then decelerate
Easing.out(Easing.cubic) // Smooth decelerate
Easing.out(Easing.exp)   // Fast decelerate (exponential)
Easing.back(1.6)         // Overshoot
Easing.bounce            // Bounce at end
```

## Performance Tips

- Keep component tree shallow — deep nesting slows render
- Avoid `useEffect` — Remotion renders are synchronous per frame
- Pre-calculate arrays in constants, not per-frame
- Use `<Img>` from Remotion (not `<img>`) for static assets — it waits for load
- For loops, use `spring()` with `from` offset instead of modular arithmetic
