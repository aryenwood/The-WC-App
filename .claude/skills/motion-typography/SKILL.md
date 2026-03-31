---
name: motion-typography
description: "Kinetic text animation - character-by-character stagger, word split reveals, text scramble/glitch effects, typewriter, and countdown timers."
---

# Motion Typography Skill

## Decision Tree

| Effect | Technique | Best For |
|--------|-----------|----------|
| Letters appear one by one with stagger | Character Stagger | Headlines, hero text |
| Words slide/fade in sequentially | Word Reveal | Taglines, feature lists |
| Text scrambles then resolves | Scramble / Glitch | Tech feel, hacker aesthetic |
| Text types out like a terminal | Typewriter | AI chat, code display |
| Numbers count down dramatically | Countdown Timer | Trade shows, launches |
| Text has animated gradient fill | Gradient Text | Branding, emphasis |
| Lines reveal on scroll | Scroll Line Reveal | Long-form, storytelling |

## CDN Links

```html
<!-- GSAP (for timeline-based motion typography) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>

<!-- SplitType (for character/word splitting) -->
<script src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>
```

If no external dependencies are desired, all effects below include pure CSS/JS alternatives.

## Pattern 1 — Character Stagger

Split text into individual characters and animate each with a stagger delay.

### Pure CSS/JS (No Dependencies)

```js
function charStagger(element, { duration = 600, stagger = 30, easing = 'cubic-bezier(0.16,1,0.3,1)' } = {}) {
  const text = element.textContent;
  element.textContent = '';
  element.style.display = 'inline-block';

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.cssText = `
      display:inline-block;
      opacity:0;
      transform:translateY(20px) rotateX(-90deg);
      animation: charReveal ${duration}ms ${easing} ${i * stagger}ms forwards;
    `;
    element.appendChild(span);
  });
}

// CSS keyframe (add to stylesheet)
const charRevealCSS = `
@keyframes charReveal {
  to { opacity:1; transform:translateY(0) rotateX(0deg); }
}
`;
```

### With GSAP + SplitType

```js
function charStaggerGSAP(selector) {
  const split = new SplitType(selector, { types: 'chars' });
  gsap.from(split.chars, {
    y: 40,
    opacity: 0,
    rotateX: -90,
    stagger: 0.03,
    duration: 0.6,
    ease: 'back.out(1.7)'
  });
}
```

## Pattern 2 — Word Reveal

Each word slides in from below or fades in sequentially.

```js
function wordReveal(element, { stagger = 80, duration = 500 } = {}) {
  const words = element.textContent.trim().split(/\s+/);
  element.textContent = '';
  element.style.overflow = 'hidden';

  words.forEach((word, i) => {
    const wrapper = document.createElement('span');
    wrapper.style.cssText = 'display:inline-block; overflow:hidden; margin-right:0.3em;';

    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.cssText = `
      display:inline-block;
      transform:translateY(100%);
      opacity:0;
      animation: wordSlideUp ${duration}ms cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms forwards;
    `;

    wrapper.appendChild(inner);
    element.appendChild(wrapper);
  });
}

const wordSlideUpCSS = `
@keyframes wordSlideUp {
  to { transform:translateY(0); opacity:1; }
}
`;
```

## Pattern 3 — Scramble / Glitch Effect

Text appears to randomly cycle through characters before resolving to the final text.

```js
function textScramble(element, finalText, { duration = 1500, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*' } = {}) {
  const length = finalText.length;
  const startTime = performance.now();

  function update() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    let result = '';
    for (let i = 0; i < length; i++) {
      const charProgress = (progress * length - i) / 3;
      if (charProgress >= 1) {
        result += finalText[i];
      } else if (charProgress > 0) {
        result += chars[Math.floor(Math.random() * chars.length)];
      } else {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = result;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = finalText;
    }
  }

  requestAnimationFrame(update);
}

// Usage
textScramble(document.querySelector('.hero-title'), 'WOOD CONSULTING');
```

## Pattern 4 — Typewriter

```js
function typewriter(element, text, { speed = 50, cursor = true, cursorChar = '|' } = {}) {
  element.textContent = '';
  let i = 0;

  if (cursor) {
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'tw-cursor';
    cursorSpan.textContent = cursorChar;
    element.appendChild(cursorSpan);
  }

  const style = document.createElement('style');
  style.textContent = `
    .tw-cursor { animation: blink 0.7s step-end infinite; }
    @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  `;
  document.head.appendChild(style);

  return new Promise(resolve => {
    function type() {
      if (i < text.length) {
        const cursorEl = element.querySelector('.tw-cursor');
        const textNode = document.createTextNode(text[i]);
        if (cursorEl) {
          element.insertBefore(textNode, cursorEl);
        } else {
          element.appendChild(textNode);
        }
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

// Usage
await typewriter(document.querySelector('.ai-response'), 'Analyzing your territory data...');
```

## Pattern 5 — Countdown Timer

Dramatic countdown with number roll animation, perfect for trade shows and launch events.

```js
function countdown(element, seconds, { onComplete, size = '120px', color = '#58c0d0' } = {}) {
  element.style.cssText = `
    font-family: 'Outfit', sans-serif;
    font-size: ${size};
    font-weight: 900;
    color: ${color};
    text-align: center;
    line-height: 1;
    text-shadow: 0 0 40px rgba(88,192,208,0.4);
  `;

  let remaining = seconds;

  function tick() {
    // Animate out old number
    element.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
    element.style.transform = 'scale(0.8)';
    element.style.opacity = '0';

    setTimeout(() => {
      element.textContent = remaining;

      // Animate in new number
      element.style.transition = 'none';
      element.style.transform = 'scale(1.4)';
      element.style.opacity = '0';

      requestAnimationFrame(() => {
        element.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease-out';
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
      });

      remaining--;

      if (remaining >= 0) {
        setTimeout(tick, 1000);
      } else {
        if (onComplete) onComplete();
      }
    }, 250);
  }

  tick();
}

// Usage
countdown(document.querySelector('#timer'), 10, {
  onComplete: () => showTradeShowSlide()
});
```

## Pattern 6 — Gradient Animated Text

```css
.gradient-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 48px;
  background: linear-gradient(
    90deg,
    #58c0d0 0%,
    #ffffff 25%,
    #FFD700 50%,
    #ffffff 75%,
    #58c0d0 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

## Pattern 7 — Scroll-Triggered Line Reveal

Each line of text reveals as it enters the viewport.

```js
function scrollLineReveal(container) {
  const lines = container.querySelectorAll('.reveal-line');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  lines.forEach((line, i) => {
    line.style.cssText = `
      opacity:0;
      transform:translateY(30px);
      transition: opacity 0.6s ease ${i * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s;
    `;
    observer.observe(line);
  });
}

// CSS
const revealCSS = `
.reveal-line.revealed {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
`;
```

## WC Brand Typography Specs

| Usage | Font | Weight | Size |
|-------|------|--------|------|
| Hero headlines | Outfit | 800-900 | 36-64px |
| Section headers | Outfit | 700 | 24-32px |
| Body text | Inter | 400 | 14-16px |
| Labels / metadata | Inter | 500-600 | 11-13px |
| Code / monospace | JetBrains Mono | 400-500 | 13-14px |
| Stats / numbers | JetBrains Mono | 600 | 24-48px |

### Font Loading (already in WC App)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

## Cleanup

Always clean up animation resources when they are no longer needed:

```js
// Remove IntersectionObserver
observer.disconnect();

// Cancel any running requestAnimationFrame
cancelAnimationFrame(rafId);

// Clear timeouts
clearTimeout(timerId);

// Remove injected style elements
styleEl.remove();
```
