---
name: wc-html-build
description: "Wood Consulting HTML build workflow — use this skill for ANY HTML page, landing page, recruiting page, sales page, or web build for Wood Consulting LLC or its divisions (Capital Energy, Honest Water, D2D Consulting, Recruiting). Triggers on 'build a page', 'make a site', 'create a landing page', 'update the HTML', 'add to the site', or any request to create or edit a web file. This skill governs design philosophy, deployment workflow, terminal scripts, asset injection, and gamification patterns. Always use this for WC App OTD win moments. Always check for Jotform, Canva, Netlify, and Gmail MCP connections to enhance the build."
---

# Wood Consulting HTML Build Skill

## MANDATORY STEP 0 — Run the Design Brief First

Before writing a single line of HTML, load and run the `wc-design-brief` skill.

No exceptions. A 90-second brief prevents a full rebuild and prevents AI slop output.

The brief produces a confirmed direction block:
- Single job of the build
- Named aesthetic direction
- One unforgettable element
- Three explicit NOT statements

Only after the user confirms the brief does code begin.

**Font check — runs automatically on every build:**
- Inter font = immediate violation. Replace with Barlow Condensed + DM Sans.
- Check existing files before editing. If Inter is present, flag and fix before any other changes.

```html
<!-- WC Standard Font Stack — always use this, never Inter -->
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

```css
:root {
  --font-headline: 'Barlow Condensed', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
body { font-family: var(--font-body); }
h1, h2, h3, .stat-value, .section-heading { font-family: var(--font-headline); font-weight: 700; }
```

---

## Core Philosophy

Every page built for Wood Consulting should feel like a **premium product** — not a template. The baseline aesthetic is dark luxury: deep navy backgrounds, brand teal accents, bold condensed headlines, clean sans-serif body copy. The **vibe dial** should always be checked: is this page meant to convert recruits, sell product, or close a deal? Adjust intensity accordingly.

**Gamification is a priority.** Where appropriate, build in:
- Progress indicators (application steps, onboarding stages)
- Animated counters (installs, earnings, team size)
- Micro-interactions on CTAs (hover states, pulse effects)
- Social proof elements (live counters, review cards, leaderboards)
- Unlockable content patterns (scroll-triggered reveals)

---

## Brand Standards

**Capital Energy**
- Navy: `#0a1628`
- Teal: `#58c0d0`
- Teal dim: `#2a7a8a`
- Fonts: Barlow Condensed (headlines), DM Sans (body)
- Voice: Direct, professional, zero tolerance for order-takers

**General Wood Consulting**
- Same navy/teal palette
- Clean, premium, conversion-focused

---

## Design Principles

Before writing a single line of code, decide:

1. **Tone** — Recruiter page? Use bold authority. Sales page? Build trust fast. Culture page? Make it feel human.
2. **Gamification level** — Subtle (counters, animations) or overt (progress bars, achievement unlocks)?
3. **Scroll experience** — Is there a narrative arc as the user scrolls? There should be.
4. **One unforgettable element** — What's the single thing a visitor remembers? Build that first.

**Never use:**
- Generic AI aesthetics (purple gradients, Inter font, cookie-cutter layouts)
- Orange (not Capital Energy brand)
- Static pages with no motion or micro-interactions

**Always use:**
- CSS animations for hero entrance
- Scroll-triggered counter animations for stats
- Hover states on every CTA
- Fixed/sticky nav with logo
- Mobile-first layout

---

## Tool Stack — Check All Before Building

Before building, scan available connections and use everything relevant:

| Tool | Use For |
|------|---------|
| **Jotform MCP** | Embed application/inquiry forms |
| **Canva MCP** | Generate OG images, social preview graphics, brand assets |
| **Netlify MCP** | Check deploy status, env vars, form submissions |
| **Gmail MCP** | Draft follow-up sequences triggered by form submissions |
| **web_search** | Pull current stats, verify brand info, find CDN resources |

---

## Gamification Patterns — Use These

### Animated stat counters
```javascript
function animateCounter(el, target, duration) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    el.textContent = Math.floor(start).toLocaleString() + (el.dataset.suffix || '');
    if (start >= target) { el.textContent = target.toLocaleString() + (el.dataset.suffix || ''); clearInterval(timer); }
  }, 16);
}
```

### Scroll-triggered reveals
```css
.reveal { opacity: 0; transform: translateY(30px); transition: all 0.6s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
```

### Pulse CTA
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(88,192,208,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(88,192,208,0); }
}
.cta-pulse { animation: pulse 2s infinite; }
```

---

## Quality Checklist Before Delivering

- [ ] Mobile responsive (test at 375px, 768px, 1200px)
- [ ] All CTAs have hover states
- [ ] Stats use animated counters
- [ ] Scroll reveals on key sections
- [ ] Logo present and visible
- [ ] OG meta tags in head
- [ ] No orange — teal and navy only
- [ ] Fonts loaded from Google Fonts CDN
- [ ] Page loads fast
