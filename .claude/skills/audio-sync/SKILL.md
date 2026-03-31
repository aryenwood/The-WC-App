---
name: audio-sync
description: "Audio playback and synchronization skill using Howler.js and Web Audio API. Use this skill for any audio feature: background music, sound effects, OTD win moments, trade show audio, countdown timers with audio cues, volume controls, and mobile audio unlock patterns. Covers Howler.js patterns, Web Audio API tone generation, mobile autoplay workarounds for iOS/WKWebView, and performance rules."
---

# Audio Sync Skill

## CDN Setup

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
```

---

## Basic Playback with Howler.js

```javascript
const sound = new Howl({
  src: ['/audio/effect.webm', '/audio/effect.mp3'],
  volume: 0.8,
  preload: true
});

sound.play();
```

Always provide multiple formats (`webm` + `mp3`) for cross-browser compatibility. WebM is smaller; MP3 is the fallback.

---

## WC OTD Win Moment Pattern

The "On The Day" win moment is a celebration audio+visual pattern used when a rep closes a deal, hits a milestone, or achieves an unlock in the WC App.

```javascript
const winSound = new Howl({
  src: ['/audio/win-moment.webm', '/audio/win-moment.mp3'],
  volume: 1.0,
  preload: true,
  onend: () => {
    // Trigger post-celebration UI (confetti fade, stat update)
    document.querySelector('.win-overlay')?.classList.add('fade-out');
  }
});

function triggerWinMoment(repName, statValue) {
  // Visual burst first
  const overlay = document.querySelector('.win-overlay');
  overlay.classList.add('active');
  overlay.querySelector('.rep-name').textContent = repName;
  overlay.querySelector('.stat-value').textContent = statValue;

  // Audio fires with visual
  winSound.play();
}
```

### Win Moment CSS Overlay
```css
.win-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(10, 22, 40, 0.95);
  opacity: 0; pointer-events: none;
  transition: opacity 0.3s ease;
}
.win-overlay.active { opacity: 1; pointer-events: all; }
.win-overlay.fade-out { opacity: 0; pointer-events: none; }
```

---

## Volume Control

```javascript
const bgMusic = new Howl({
  src: ['/audio/bg-loop.webm', '/audio/bg-loop.mp3'],
  volume: 0.3,
  loop: true
});

// Slider control
document.getElementById('volume-slider').addEventListener('input', (e) => {
  bgMusic.volume(parseFloat(e.target.value));
});

// Mute toggle
let muted = false;
document.getElementById('mute-btn').addEventListener('click', () => {
  muted = !muted;
  Howler.mute(muted); // Mutes ALL Howler instances globally
});
```

---

## Mobile Audio Unlock (iOS / WKWebView)

iOS requires a user gesture before any audio can play. This is critical for PWA standalone mode.

```javascript
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  // Create and play a silent buffer to unlock the audio context
  const silentSound = new Howl({
    src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYw'],
    volume: 0,
    onend: () => {
      audioUnlocked = true;
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    }
  });
  silentSound.play();
}

document.addEventListener('touchstart', unlockAudio, { once: true });
document.addEventListener('click', unlockAudio, { once: true });
```

**Rule:** Always wire up audio unlock on first user interaction. Never assume audio will autoplay on mobile.

---

## Trade Show Audio

For trade show booths, kiosks, and demo screens — audio loops continuously with no user interaction required (assumes desktop/connected speakers).

```javascript
const tradeShowAudio = new Howl({
  src: ['/audio/tradeshow-loop.webm', '/audio/tradeshow-loop.mp3'],
  volume: 0.5,
  loop: true,
  autoplay: true,
  html5: true // Use HTML5 Audio for long tracks to avoid memory issues
});

// Fade in on page load
tradeShowAudio.fade(0, 0.5, 2000);

// Cross-fade between tracks
function crossFadeTo(newSrc, duration = 2000) {
  const newTrack = new Howl({
    src: newSrc,
    volume: 0,
    loop: true,
    html5: true
  });

  newTrack.play();
  newTrack.fade(0, 0.5, duration);
  tradeShowAudio.fade(0.5, 0, duration);

  setTimeout(() => {
    tradeShowAudio.stop();
  }, duration);
}
```

---

## Countdown Timer with Audio Cues

```javascript
const tickSound = new Howl({
  src: ['/audio/tick.webm', '/audio/tick.mp3'],
  volume: 0.3
});

const alarmSound = new Howl({
  src: ['/audio/alarm.webm', '/audio/alarm.mp3'],
  volume: 1.0
});

function startCountdown(seconds, displayEl) {
  let remaining = seconds;

  const interval = setInterval(() => {
    remaining--;
    displayEl.textContent = formatTime(remaining);

    if (remaining <= 10 && remaining > 0) {
      tickSound.play(); // Tick for last 10 seconds
    }

    if (remaining <= 0) {
      clearInterval(interval);
      alarmSound.play();
      displayEl.classList.add('countdown-complete');
    }
  }, 1000);

  return interval; // Return so caller can cancel
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
```

---

## Web Audio API — Generated Tones

For lightweight audio cues without loading files (button clicks, notifications, error tones).

```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency = 440, duration = 0.15, type = 'sine', volume = 0.3) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

// Presets
const tones = {
  success: () => playTone(880, 0.2, 'sine', 0.3),
  error: () => playTone(200, 0.3, 'square', 0.2),
  click: () => playTone(1200, 0.05, 'sine', 0.15),
  notification: () => {
    playTone(523, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 120);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 240);
  }
};
```

**Resume audio context on iOS:**
```javascript
document.addEventListener('touchstart', () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });
```

---

## Sprite Audio (Multiple Effects in One File)

Reduce HTTP requests by packing multiple short effects into a single audio file with defined time regions.

```javascript
const sfx = new Howl({
  src: ['/audio/sfx-sprite.webm', '/audio/sfx-sprite.mp3'],
  sprite: {
    click: [0, 200],       // start ms, duration ms
    success: [300, 800],
    error: [1200, 600],
    whoosh: [2000, 500],
    ding: [2700, 400]
  }
});

sfx.play('success');
sfx.play('click');
```

---

## Performance Rules

1. **Preload critical sounds** — win moments, navigation clicks, notifications. Use `preload: true`.
2. **Use `html5: true` for long tracks** — background music, trade show loops. Streams instead of decoding entire file into memory.
3. **Never autoplay on mobile** — always gate behind user gesture.
4. **Limit concurrent sounds** — Howler handles this, but avoid firing 20+ sounds simultaneously.
5. **WebM first, MP3 fallback** — WebM is ~30% smaller for same quality.
6. **Unload when done** — call `sound.unload()` when navigating away or removing a component.
7. **Web Audio API for generated tones only** — don't use it for file playback when Howler is available.
8. **Always resume AudioContext on iOS** — check for `suspended` state after user gesture.
