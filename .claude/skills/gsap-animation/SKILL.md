---
name: gsap-animation
description: "Timeline-based keyframe animation using GSAP (GreenSock). Use this skill for entrance effects, exit effects, scroll-triggered reveals, staggered sequences, and any motion that needs precise timing control."
---

# GSAP Animation Skill

## CDN Links

```html
<!-- Core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<!-- Plugins (load only what you need) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/MotionPathPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/TextPlugin.min.js"></script>

<!-- Register plugins -->
<script>
  gsap.registerPlugin(ScrollTrigger);
</script>
```

## Core Primitives

### gsap.to() — Animate TO target values

```js
gsap.to('.box', {
  x: 200,
  y: 50,
  rotation: 360,
  opacity: 0.5,
  duration: 1,
  ease: 'power2.out',
  delay: 0.3,
  onComplete: () => console.log('done')
});
```

### gsap.from() — Animate FROM values (element ends at its natural CSS state)

```js
gsap.from('.card', {
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: 'back.out(1.7)'
});
```

### gsap.fromTo() — Define both start and end states

```js
gsap.fromTo('.badge',
  { scale: 0, rotation: -180 },
  { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }
);
```

### gsap.set() — Instantly set properties (no animation)

```js
gsap.set('.hidden-element', { autoAlpha: 0, y: 30 }); // autoAlpha = opacity + visibility
```

## Timelines

Timelines let you sequence multiple animations with precise control:

```js
const tl = gsap.timeline({
  defaults: { duration: 0.6, ease: 'power2.out' },
  onComplete: () => console.log('timeline done')
});

tl.from('.logo', { scale: 0, ease: 'back.out(1.7)' })
  .from('.title', { y: 40, opacity: 0 }, '-=0.3')          // 0.3s overlap
  .from('.subtitle', { y: 30, opacity: 0 }, '-=0.2')
  .from('.cta-button', { scale: 0.8, opacity: 0 }, '+=0.1') // 0.1s gap
  .from('.stats-row', { y: 20, opacity: 0, stagger: 0.1 });
```

### Position Parameter

| Value | Meaning |
|-------|---------|
| `'-=0.3'` | Start 0.3s before previous ends (overlap) |
| `'+=0.3'` | Start 0.3s after previous ends (gap) |
| `2` | Start at absolute time 2s |
| `'<'` | Start at same time as previous |
| `'<0.5'` | Start 0.5s after previous starts |
| `'>-0.2'` | Start 0.2s before previous ends |

## Stagger

Animate multiple elements with incremental delay:

```js
gsap.from('.card', {
  y: 60,
  opacity: 0,
  duration: 0.5,
  stagger: 0.1,        // Each card starts 0.1s after the previous
  ease: 'power2.out'
});

// Advanced stagger
gsap.from('.grid-item', {
  scale: 0,
  opacity: 0,
  duration: 0.4,
  stagger: {
    each: 0.05,
    from: 'center',     // 'start', 'center', 'end', 'random', or index
    grid: [4, 4],       // If items are in a grid
    ease: 'power1.in'
  }
});
```

## Easing Reference

| Ease | Feel | Use Case |
|------|------|----------|
| `'none'` | Linear | Progress bars |
| `'power1.out'` | Gentle decel | Subtle moves |
| `'power2.out'` | Standard decel | Default for most animations |
| `'power3.out'` | Snappy decel | Cards, modals |
| `'power4.out'` | Very snappy | Quick reveals |
| `'back.out(1.7)'` | Overshoot | Buttons, badges, playful UI |
| `'elastic.out(1, 0.5)'` | Bouncy | Notifications, celebrations |
| `'bounce.out'` | Ball bounce | Dropped elements |
| `'expo.out'` | Fast start, slow end | Dramatic entrances |
| `'circ.out'` | Circular motion feel | Smooth transitions |
| `'steps(5)'` | Stepped | Sprite animation |

### Custom Ease

```js
// CSS cubic-bezier equivalent
gsap.to('.el', { x: 100, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });

// Custom ease with CustomEase plugin
gsap.registerPlugin(CustomEase);
CustomEase.create('wcSnap', 'M0,0 C0.14,0 0.27,0.58 0.32,0.82 0.38,1.08 0.46,1 1,1');
```

## ScrollTrigger

### Basic Scroll-Triggered Animation

```js
gsap.registerPlugin(ScrollTrigger);

gsap.from('.section', {
  y: 80,
  opacity: 0,
  duration: 1,
  scrollTrigger: {
    trigger: '.section',
    start: 'top 80%',      // animation starts when top of trigger hits 80% of viewport
    end: 'top 20%',
    toggleActions: 'play none none reverse',
    // markers: true        // debug: show start/end markers
  }
});
```

### Scrub (Animation Tied to Scroll Position)

```js
gsap.to('.parallax-bg', {
  y: -200,
  scrollTrigger: {
    trigger: '.parallax-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true             // true = 1:1 with scroll, or number for smoothing (e.g. 0.5)
  }
});
```

### Pin Section

```js
gsap.to('.horizontal-panels', {
  x: () => -(document.querySelector('.horizontal-panels').scrollWidth - window.innerWidth),
  scrollTrigger: {
    trigger: '.horizontal-section',
    start: 'top top',
    end: () => `+=${document.querySelector('.horizontal-panels').scrollWidth}`,
    scrub: 1,
    pin: true
  }
});
```

## WC App Win Moment Pattern

Orchestrated animation for when a rep logs a "closed" door:

```js
function playWinMoment(container) {
  const tl = gsap.timeline({
    defaults: { ease: 'back.out(1.7)' },
    onComplete: () => {
      // Clean up after animation
      gsap.set(container.querySelectorAll('.win-element'), { clearProps: 'all' });
    }
  });

  // Flash overlay
  tl.fromTo('.win-flash',
    { opacity: 0 },
    { opacity: 0.8, duration: 0.15, ease: 'power4.in' }
  )
  .to('.win-flash', { opacity: 0, duration: 0.4 })

  // Badge scale in with overshoot
  .fromTo('.win-badge',
    { scale: 0, rotation: -30 },
    { scale: 1, rotation: 0, duration: 0.6 },
    '-=0.2'
  )

  // Stats counter
  .from('.win-stat', {
    textContent: 0,
    duration: 1.2,
    ease: 'power1.in',
    snap: { textContent: 1 },
    stagger: 0.2
  }, '-=0.3')

  // Subtitle text
  .from('.win-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.4
  }, '-=0.8')

  // Auto-dismiss
  .to(container, {
    opacity: 0,
    y: -30,
    duration: 0.5,
    delay: 2,
    ease: 'power2.in'
  });

  return tl;
}
```

## Trade Show Scene Transition

Smooth transition between trade show slides:

```js
function transitionSlides(outgoing, incoming) {
  const tl = gsap.timeline();

  // Exit current slide
  tl.to(outgoing, {
    opacity: 0,
    scale: 0.95,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => outgoing.style.display = 'none'
  })

  // Enter new slide
  .set(incoming, { display: 'flex', opacity: 0, scale: 1.05 })
  .to(incoming, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: 'power2.out'
  })

  // Stagger in slide content
  .from(incoming.querySelectorAll('.slide-content > *'), {
    y: 30,
    opacity: 0,
    duration: 0.4,
    stagger: 0.08,
    ease: 'power2.out'
  }, '-=0.2');

  return tl;
}
```

## Performance Rules

1. **Use `will-change` sparingly** — GSAP handles GPU promotion automatically via transforms. Adding `will-change` yourself can hurt performance.

2. **Prefer transforms over layout properties** — `x`, `y`, `scale`, `rotation` are GPU-accelerated. Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`.

3. **Kill tweens when not needed** — prevents memory leaks:
   ```js
   const tween = gsap.to('.el', { x: 100 });
   tween.kill(); // Cleanup
   // or kill all tweens on a target:
   gsap.killTweensOf('.el');
   ```

4. **Use `autoAlpha` instead of `opacity`** — it also toggles `visibility:hidden` when opacity reaches 0, removing the element from the accessibility tree.

5. **Batch ScrollTrigger refreshes** — call `ScrollTrigger.refresh()` once after DOM changes, not per element.

6. **Reduce motion preference** — respect the user's system setting:
   ```js
   const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (prefersReduced) {
     gsap.globalTimeline.timeScale(100); // Instant, skip animation
   }
   ```

## Common Patterns Quick Reference

```js
// Fade in
gsap.from(el, { opacity: 0, duration: 0.5 });

// Slide up + fade
gsap.from(el, { y: 40, opacity: 0, duration: 0.6, ease: 'power2.out' });

// Scale pop
gsap.from(el, { scale: 0, duration: 0.5, ease: 'back.out(1.7)' });

// Number counter
gsap.from(el, { textContent: 0, duration: 2, snap: { textContent: 1 } });

// Infinite pulse
gsap.to(el, { scale: 1.05, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });

// Shake
gsap.to(el, { x: 10, duration: 0.05, repeat: 5, yoyo: true, ease: 'power1.inOut' });

// Flip (layout animation)
const state = Flip.getState('.items');
// ...modify DOM...
Flip.from(state, { duration: 0.5, ease: 'power2.out', stagger: 0.05 });
```
