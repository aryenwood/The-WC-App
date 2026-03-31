---
name: canvas-particle-engine
description: "High-performance browser particle systems for celebration effects, win moments, and ambient backgrounds. Use this skill whenever the user wants confetti, fireworks, sparks, snow, rain, particle explosions, or any real-time particle effect. Trigger on: confetti, fireworks, celebrate, win animation, OTD moment, particle effect, sparks, explosion, burst, ambient particles, stars background, or any request for a reactive visual effect that responds to user actions. ALWAYS use this for WC App OTD win moments and leaderboard celebrations. Distinct from algorithmic-art (artistic/generative) - this skill is for real-time reactive effects that respond to events. No external dependencies required - all patterns use Canvas 2D API."
---

# Canvas Particle Engine Skill

All patterns use the native Canvas 2D API — zero dependencies, maximum performance.

## Architecture Pattern

Every particle system follows this structure:

```js
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.running = false;
    this.raf = null;
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  spawn(x, y, count = 50) { /* override */ }

  update() {
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => p.update());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => p.draw(this.ctx));
  }

  loop() {
    this.update();
    this.draw();
    if (this.particles.length > 0 || this.running) {
      this.raf = requestAnimationFrame(() => this.loop());
    }
  }

  start() { this.running = true; this.loop(); }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
}
```

## Pattern 1 — Confetti Burst (OTD Win Moment)

```js
class ConfettiSystem extends ParticleSystem {
  spawn(x, y, count = 80) {
    const colors = ["#58c0d0", "#ffffff", "#2a7a8a", "#FFD700", "#FF6B6B"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? "rect" : "circle",
        life: 1,
        decay: Math.random() * 0.012 + 0.008,
        gravity: 0.3,
        update() {
          this.vy += this.gravity;
          this.vx *= 0.99;
          this.x += this.vx;
          this.y += this.vy;
          this.rotation += this.rotationSpeed;
          this.life -= this.decay;
        },
        draw(ctx) {
          ctx.save();
          ctx.globalAlpha = this.life;
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation);
          ctx.fillStyle = this.color;
          if (this.shape === "rect") {
            ctx.fillRect(-this.size/2, -this.size/4, this.size, this.size/2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });
    }
    if (!this.raf) this.loop();
  }
}
```

## Pattern 2 — Firework Burst

```js
function fireParticle(ctx, x, y, particles) {
  const count = 60;
  const colors = ["#58c0d0", "#fff", "#FFD700", "#FF6B6B", "#A8E6CF"];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: Math.random() * 0.02 + 0.015,
      size: Math.random() * 3 + 1,
      trail: [],
      update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 6) this.trail.shift();
        this.vx *= 0.97;
        this.vy = this.vy * 0.97 + 0.1;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
      },
      draw(ctx) {
        ctx.beginPath();
        this.trail.forEach((p, i) => {
          ctx.globalAlpha = (i / this.trail.length) * this.life * 0.5;
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size * 0.5;
        ctx.stroke();
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    });
  }
}
```

## Pattern 3 — Ambient Stars / Twinkling Background

```js
function initStarfield(canvas, count = 120) {
  const ctx = canvas.getContext("2d");
  const stars = [];
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2
    });
  }
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.016;
    stars.forEach(s => {
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 100 + s.phase));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#58c0d0";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
```

## Pattern 5 — Leaderboard Rank-Up Burst

```js
function rankUpEffect(rowElement) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;width:100vw;height:100vh;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const rect = rowElement.getBoundingClientRect();
  const system = new ConfettiSystem(canvas);
  system.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
  setTimeout(() => canvas.remove(), 3000);
}
```

## Canvas Setup for WC App

```html
<canvas id="particles" style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;"></canvas>
```

## Performance Guidelines

- Cap particles at 200 for mobile devices
- Use cancelAnimationFrame when particle array is empty
- Avoid ctx.shadowBlur — use multiple layered circles instead for glow
- globalAlpha once per draw call where possible
- Pool particles for high-frequency effects
