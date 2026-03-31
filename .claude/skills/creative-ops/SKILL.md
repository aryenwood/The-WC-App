---
name: creative-ops
description: "Smart intake and routing skill for any creative or marketing deliverable."
---

# Creative Ops Skill

## Tool Inventory

Before routing any creative request, know what is available:

| Tool / Skill | What It Does | Trigger Keywords |
|---|---|---|
| **canvas-particle-engine** | Confetti, fireworks, sparks, ambient effects | confetti, celebrate, win effect, particles |
| **gsap-animation** | Timeline animation, scroll reveals, stagger | animate, entrance, exit, scroll, timeline |
| **motion-typography** | Kinetic text, typewriter, scramble, countdown | text animation, typewriter, countdown, glitch text |
| **lottie-animation** | After Effects JSON animations, spinners | Lottie, animated icon, spinner, Bodymovin |
| **audio-sync** | Sound effects, background music, audio cues | sound, music, audio, SFX |
| **remotion-video** | React-rendered MP4 videos | video, splash screen, MP4, render video |
| **mapbox-maps** | Interactive maps, door pins, heatmaps | map, territory, pins, heatmap, geolocation |
| **ui-ux-pro-max** | Full UI/UX design system | UI, component, layout, design system |
| **design** | Logos, CIP, banners, icons, social photos | logo, banner, icon, brand identity |
| **slides** | HTML presentations with charts | slides, deck, presentation |
| **wc-html-build** | Full HTML page builds | page, site, landing page, recruiting |
| **wc-design-brief** | Pre-build design brief (mandatory) | build, create, design (runs first) |
| **brand** | Brand voice, messaging, tone | tone of voice, brand, messaging |
| **wood-consulting-comms** | Internal/external communications | email, memo, briefing, announcement |
| **wc-ai** | AI features, chat, structured output | AI, chatbot, smart suggestions |
| **firebase-core** | Database, auth, real-time data | Firestore, auth, data, users |
| **firebase-functions** | Server-side, API proxy, webhooks | Cloud Function, API, webhook |
| **idea-gauntlet** | Pressure-test any idea before building | validate, stress-test, challenge |
| **skill-auditor** | Audit skill quality and completeness | audit, review skills |
| **Canva MCP** | Design in Canva, export assets | Canva, design export, template |
| **Gmail MCP** | Draft emails from templates | email, send, draft |
| **Netlify MCP** | Deploy sites, check deploys | deploy, hosting, site status |

## 5 Diagnostic Questions

When a creative request comes in, answer these mentally before routing:

1. **What is the deliverable?** (page, video, animation, email, presentation, component, logo, etc.)
2. **Where does it live?** (WC App, standalone page, trade show, social media, print)
3. **Who is the audience?** (reps, managers, prospects, investors, recruits, general public)
4. **What feeling should it create?** (excitement, trust, urgency, professionalism, fun, authority)
5. **What constraints exist?** (timeline, brand compliance, mobile-first, no dependencies, offline-capable)

## Routing Decision Format

After diagnosing, output a routing decision in this format:

```
CREATIVE ROUTING
================
Deliverable: [what is being built]
Primary skill: [main skill to use]
Supporting skills: [1-3 additional skills]
Pre-flight: [wc-design-brief if visual, idea-gauntlet if strategic]
MCP connections: [any MCPs to leverage]
Quality gate: [what "done" looks like]
```

## Execution Quality Bar

Every creative deliverable must pass these checks before delivery:

1. **Brand compliance** — Uses WC brand colors (#148f98, #1ec8d5, #0d7882), fonts (Outfit, Inter, JetBrains Mono), and glass/teal aesthetic
2. **Mobile-first** — Works on 375px viewport, touch-friendly tap targets (44px min)
3. **Performance** — No layout shifts, animations run at 60fps, images optimized
4. **Accessibility** — Sufficient contrast ratios, readable font sizes, alt text on images
5. **Emotional impact** — Passes the "would I screenshot this?" test
6. **Polish** — No placeholder text, no broken layouts, no orphaned elements

## Routing Quick-Reference Table

| Request | Route To | Pre-Flight |
|---------|----------|------------|
| "Build a landing page" | wc-html-build + ui-ux-pro-max | wc-design-brief |
| "Add confetti to the win screen" | canvas-particle-engine | none |
| "Create a trade show deck" | slides + gsap-animation | wc-design-brief |
| "Write an email to the team" | wood-consulting-comms | none |
| "Design a new logo" | design | wc-design-brief |
| "Add a map to the dashboard" | mapbox-maps + firebase-core | none |
| "Make a splash video" | remotion-video | wc-design-brief |
| "Add AI chat to the app" | wc-ai + firebase-functions | none |
| "Animate the leaderboard" | gsap-animation + canvas-particle-engine | none |
| "Create social media graphics" | design + Canva MCP | wc-design-brief |
| "Write a recruiting pitch" | wood-consulting-comms + brand | none |
| "Should we build feature X?" | idea-gauntlet | none |
| "Review our skill files" | skill-auditor | none |
| "Add sound to the win moment" | audio-sync | none |
| "Show typing text on load" | motion-typography | none |
| "Deploy the site" | Netlify MCP | none |
