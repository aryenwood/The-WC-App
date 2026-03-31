---
name: lottie-animation
description: "Lottie animation skill for rendering After Effects animations via Bodymovin JSON in the WC App. Use this skill for any animated illustration, icon animation, loading spinner, celebration effect, onboarding animation, or win moment visual. Covers basic playback, controls, events, segment playback, WC App win moment pattern, inline JSON, dynamic color override, free animation sources, renderer choice, performance rules, and Bodymovin export instructions."
---

# Lottie Animation Skill

## CDN Setup

```html
<!-- Lottie Web Player -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

Or use the lighter `lottie_light` build if you only need SVG rendering:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js"></script>
```

---

## Basic Playback

```javascript
const anim = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg',           // 'svg', 'canvas', or 'html'
  loop: true,
  autoplay: true,
  path: '/animations/hero-animation.json'  // URL to JSON file
});
```

**Container element:**
```html
<div id="lottie-container" style="width: 300px; height: 300px;"></div>
```

---

## Controls

```javascript
anim.play();
anim.pause();
anim.stop();

// Go to specific frame
anim.goToAndStop(30, true);    // frame 30, isFrame = true
anim.goToAndPlay(0, true);     // restart from frame 0

// Speed
anim.setSpeed(2);              // 2x speed
anim.setSpeed(0.5);            // half speed

// Direction
anim.setDirection(-1);         // reverse
anim.setDirection(1);          // forward
```

---

## Events

```javascript
anim.addEventListener('complete', () => {
  console.log('Animation finished');
});

anim.addEventListener('loopComplete', () => {
  console.log('Loop cycle complete');
});

anim.addEventListener('enterFrame', (e) => {
  // Fires every frame — use sparingly
  // e.currentTime, e.totalTime
});

anim.addEventListener('DOMLoaded', () => {
  console.log('Animation DOM elements loaded');
});

anim.addEventListener('data_ready', () => {
  console.log('JSON data parsed and ready');
});
```

---

## Segment Playback

Play only a portion of the animation — useful for multi-state animations packed into one file.

```javascript
// Play frames 0-30 (intro)
anim.playSegments([0, 30], true);  // true = force from this frame

// Play frames 30-60 (main loop)
anim.playSegments([30, 60], true);

// Queue multiple segments
anim.playSegments([[0, 30], [60, 90]], false);  // false = queue after current
```

**Use case:** A single Lottie file with idle (frames 0-30), active (30-60), and success (60-90) states. Switch segments based on app state instead of loading three separate files.

---

## WC App Win Moment Pattern

Combine Lottie with the audio-sync skill for the full OTD win celebration.

```javascript
const confettiAnim = lottie.loadAnimation({
  container: document.getElementById('win-lottie'),
  renderer: 'canvas',   // canvas for particle-heavy confetti
  loop: false,
  autoplay: false,
  path: '/animations/confetti-burst.json'
});

function triggerWinMoment(repName, amount) {
  const overlay = document.querySelector('.win-overlay');
  overlay.classList.add('active');
  overlay.querySelector('.rep-name').textContent = repName;
  overlay.querySelector('.amount').textContent = `$${amount.toLocaleString()}`;

  // Play confetti animation
  confettiAnim.goToAndPlay(0, true);

  // Auto-dismiss after animation completes
  confettiAnim.addEventListener('complete', () => {
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.classList.remove('fade-out'), 500);
    }, 1500);
  });
}
```

```html
<div class="win-overlay">
  <div id="win-lottie" style="position:absolute;inset:0;pointer-events:none;"></div>
  <div class="win-content">
    <h1 class="rep-name"></h1>
    <p class="amount"></p>
  </div>
</div>
```

---

## Inline JSON (No External File)

For small animations, embed the JSON directly to avoid an extra HTTP request.

```javascript
const animationData = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "layers": [
    // ... layer data
  ]
};

const anim = lottie.loadAnimation({
  container: document.getElementById('inline-anim'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  animationData: animationData  // Use animationData instead of path
});
```

**When to inline:** Animations under 20KB JSON. Anything larger should be loaded via `path` to keep the HTML/JS bundle lean.

---

## Dynamic Color Override

Change colors at runtime without editing the JSON file — useful for theming or brand customization.

```javascript
anim.addEventListener('DOMLoaded', () => {
  // SVG renderer: target elements by CSS
  const svgElements = anim.renderer.svgElement.querySelectorAll('path, rect, circle');
  svgElements.forEach(el => {
    const fill = el.getAttribute('fill');
    if (fill && fill.toLowerCase() === '#ff0000') {
      el.setAttribute('fill', '#58c0d0'); // Replace red with WC teal
    }
  });
});
```

**Programmatic color replacement (before loading):**
```javascript
function replaceColors(animData, colorMap) {
  const str = JSON.stringify(animData);
  let result = str;
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    result = result.replaceAll(oldColor, newColor);
  }
  return JSON.parse(result);
}

const recolored = replaceColors(animationData, {
  '0.949,0.286,0.286': '0.345,0.753,0.816',  // RGB decimal: red → teal
  '1,0,0': '0.345,0.753,0.816'
});

lottie.loadAnimation({
  container: document.getElementById('recolored'),
  animationData: recolored,
  renderer: 'svg',
  loop: true,
  autoplay: true
});
```

---

## Free Animation Sources

| Source | URL | Notes |
|--------|-----|-------|
| LottieFiles | https://lottiefiles.com | Largest library, free tier available |
| IconScout Lottie | https://iconscout.com/lottie-animations | Free + premium |
| LottieFiles Marketplace | https://lottiefiles.com/marketplace | Premium animations |
| Lordicon | https://lordicon.com | Animated icons, free tier |

**Search tips:** Use terms like "confetti", "success check", "loading spinner", "celebration", "trophy" for WC App win moments.

---

## Renderer Choice

| Renderer | Best For | Trade-off |
|----------|----------|-----------|
| `svg` | Icons, illustrations, small animations | Crisp at all sizes, DOM-heavy for complex scenes |
| `canvas` | Particle effects, confetti, complex scenes | Better performance, no DOM overhead, not scalable |
| `html` | Simple transforms, opacity animations | Lightest, limited feature support |

**Default to `svg`** for most WC App use cases. Switch to `canvas` for confetti/particle win moments or animations with 50+ layers.

---

## Performance Rules

1. **Destroy when done** — call `anim.destroy()` when removing the element or navigating away. Lottie does not garbage-collect itself.
2. **Pause off-screen animations** — use IntersectionObserver to pause/play based on visibility.
3. **Use `canvas` for heavy animations** — 50+ layers, particle effects, full-screen celebrations.
4. **Keep JSON under 500KB** — compress with LottieFiles optimizer if needed. Animations over 1MB are a red flag.
5. **Avoid `enterFrame` listeners** — they fire 30-60 times per second. Use `complete` or `loopComplete` instead.
6. **One renderer per animation** — don't mix SVG and canvas in the same animation instance.
7. **Preload critical animations** — load win moment animations at app start, not on trigger.

```javascript
// IntersectionObserver pattern for pause/play
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      anim.play();
    } else {
      anim.pause();
    }
  });
}, { threshold: 0.1 });

observer.observe(document.getElementById('lottie-container'));
```

---

## Bodymovin Export Instructions (After Effects)

1. Install the Bodymovin plugin from `aescripts.com/bodymovin` or via ZXP Installer
2. In After Effects: `Window → Extensions → Bodymovin`
3. Select your composition
4. Settings:
   - **Standard** export (not compressed)
   - Enable **Glyphs** if using text layers
   - Enable **Extra Comps** if using pre-comps
5. Click **Render**
6. Output: `.json` file ready for `lottie.loadAnimation({ path: ... })`

**Tips for AE artists:**
- Avoid expressions — Bodymovin supports only basic expressions
- Use shape layers instead of Illustrator layers for smaller file size
- Pre-compose complex groups to reduce layer count
- Trim work area to exact animation length before export
