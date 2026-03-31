---
name: skill-coach
description: "Coaching layer that helps the user understand, combine, and apply their full WC skill library. Use this skill when the user asks 'what can you do', 'what skills do I have', 'help me pick the right tool', 'how do I combine X and Y', or when the user seems unaware of capabilities available to them. This skill maps the entire WC ecosystem, provides per-skill coaching, suggests cross-skill combinations, and enforces a quality gate."
---

# Skill Coach — WC Ecosystem Navigator

## Purpose

You have a library of specialized skills. This coach helps you:
1. Know what each skill does and when to trigger it
2. Combine skills for compound results
3. Avoid under-using your toolkit

---

## The WC Ecosystem

Wood Consulting LLC operates multiple divisions. Every skill should be understood in this context:

| Division | Focus | Key Builds |
|----------|-------|------------|
| **Capital Energy** | Solar D2D sales | Rep leaderboards, OTD win moments, recruiting pages |
| **Honest Water** | Water solutions | Product pages, lead capture |
| **D2D Consulting** | Sales training | Course pages, content hubs |
| **Recruiting** | Talent pipeline | Application flows, culture pages |
| **WC App** | Internal PWA | Hub tabs, gamification, dashboards |

---

## Per-Skill Coaching

### gsap-animation
**What it does:** Advanced scroll-triggered animations, timeline sequences, SVG morphing, text splitting, and complex choreographed motion using the GreenSock Animation Platform.
**When to use:** When CSS transitions aren't enough. Hero entrances with staggered elements, scroll-driven narratives, interactive timelines, parallax effects, trade show presentations.
**Key trigger phrases:** "animate this section", "scroll animation", "parallax", "stagger effect", "timeline animation", "make this feel alive"
**Pairs with:** wc-html-build (motion layer for pages), lottie-animation (GSAP controlling Lottie playback), audio-sync (audio synced to animation timeline)

### motion-typography
**What it does:** Kinetic text effects — split text animations, variable font interpolation, text reveal effects, scroll-driven type scaling, and typographic motion design.
**When to use:** Hero headlines that animate in, stat callouts that type themselves, trade show title slides, any moment where text IS the design element.
**Key trigger phrases:** "animated text", "type animation", "headline effect", "text reveal", "kinetic typography"
**Pairs with:** gsap-animation (GSAP drives the motion), wc-html-build (hero sections), audio-sync (text reveals synced to audio beats)

### canvas-particle-engine
**What it does:** HTML5 Canvas particle systems — confetti bursts, ambient floating particles, fire/smoke/spark effects, interactive particle fields that respond to mouse/touch.
**When to use:** Win moment celebrations (confetti), ambient background effects (floating particles), trade show visuals, loading screens, any moment that needs to feel dynamic and alive.
**Key trigger phrases:** "confetti", "particles", "celebration effect", "ambient background", "canvas effect"
**Pairs with:** audio-sync (particles synced to sound), lottie-animation (Lottie for structured animation + canvas for particles), wc-html-build (embedded in pages)

### firebase-core
**What it does:** Firebase Firestore reads/writes, Authentication, Realtime Database, Firebase Hosting config, security rules, and data modeling patterns.
**When to use:** Any feature that needs persistent data — leaderboards, user profiles, rep stats, form submissions, real-time updates, authentication flows.
**Key trigger phrases:** "save this data", "database", "login", "authentication", "real-time", "leaderboard", "user data"
**Pairs with:** firebase-functions (backend logic), wc-html-build (data-driven pages), wc-ai (AI features backed by Firestore)

### firebase-functions
**What it does:** Cloud Functions for Firebase — serverless backend logic, scheduled tasks, Firestore triggers, HTTP endpoints, third-party API proxying.
**When to use:** Any backend logic — sending notifications, processing form submissions, scheduled reports, API proxying (especially for AI calls), webhook handlers.
**Key trigger phrases:** "backend", "server function", "cron job", "scheduled task", "webhook", "API endpoint", "send notification"
**Pairs with:** firebase-core (data layer), wc-ai (proxy AI API calls through functions), wc-html-build (form processing)

### mapbox-maps
**What it does:** Interactive maps with Mapbox GL JS — custom markers, clustering, route visualization, territory mapping, heatmaps, 3D terrain.
**When to use:** Territory visualization for sales reps, install location maps, service area displays, office/event location pages, any geographic data visualization.
**Key trigger phrases:** "map", "territory", "location", "geographic", "where are", "service area", "route"
**Pairs with:** firebase-core (location data from Firestore), wc-html-build (embedded in pages), gsap-animation (animated map transitions)

### remotion-video
**What it does:** Programmatic video generation using React/Remotion — automated highlight reels, stat recap videos, personalized recruiting videos, social media clips.
**When to use:** Automated video content — weekly stat recaps, rep highlight reels, recruiting pitch videos, social media content, trade show loop videos.
**Key trigger phrases:** "generate video", "video recap", "highlight reel", "social clip", "automated video"
**Pairs with:** firebase-core (pull stats for video content), lottie-animation (Lottie animations in video), audio-sync (background music/sfx in video)

### wc-ai
**What it does:** AI integration patterns — model selection, Firebase proxy for API calls, streaming responses, structured output, tool use patterns.
**When to use:** Any AI-powered feature — chat interfaces, content generation, data analysis, smart suggestions, automated reporting, natural language queries.
**Key trigger phrases:** "AI feature", "chat", "generate content", "smart", "automated analysis", "natural language"
**Pairs with:** firebase-functions (proxy API calls), firebase-core (store AI results), wc-html-build (AI-powered UI components)

### wc-html-build
**What it does:** The master HTML build workflow — design philosophy, brand standards, deployment, gamification patterns, tool stack integration.
**When to use:** ANY web page build. Period. Landing pages, recruiting pages, sales pages, culture pages, dashboards, trade show screens.
**Key trigger phrases:** "build a page", "landing page", "website", "HTML", "recruiting page", "sales page"
**Pairs with:** Everything. This is the orchestration layer. It calls wc-design-brief first, then pulls in gsap-animation, audio-sync, lottie-animation, etc. as needed.

### wood-consulting-comms
**What it does:** Communication templates and patterns for Wood Consulting — email sequences, SMS templates, notification copy, recruiting outreach, client follow-ups.
**When to use:** Any written communication — recruiting emails, client proposals, follow-up sequences, push notifications, in-app messaging.
**Key trigger phrases:** "write an email", "follow up", "outreach", "notification", "message", "recruiting email"
**Pairs with:** Gmail MCP (send emails), firebase-functions (triggered email sequences), wc-html-build (email template HTML)

### creative-ops
**What it does:** Creative workflow management — asset organization, brand consistency checks, design review processes, creative brief templates, asset naming conventions.
**When to use:** When managing multiple creative outputs, organizing assets, ensuring brand consistency across builds, or planning a creative sprint.
**Key trigger phrases:** "organize assets", "brand check", "creative workflow", "design review", "asset management"
**Pairs with:** Canva MCP (asset generation), wc-design-brief (brief enforcement), wc-html-build (consistent output)

### idea-gauntlet
**What it does:** Idea validation and stress-testing framework — forces ideas through a gauntlet of questions to separate good ideas from exciting-but-bad ones.
**When to use:** Before committing to a new feature, product, page, or initiative. When the user says "I have an idea" or "what if we built X."
**Key trigger phrases:** "I have an idea", "what if we", "should we build", "new feature", "brainstorm"
**Pairs with:** wc-design-brief (brief comes after idea survives the gauntlet), skill-coach (identify which skills the idea needs)

---

## Cross-Skill Combination Patterns

### The Full Win Moment
**Skills:** canvas-particle-engine + lottie-animation + audio-sync + gsap-animation
**Result:** Rep closes a deal → confetti particles burst (canvas) + trophy animation plays (Lottie) + celebration sound fires (audio-sync) + stat counter animates up (GSAP) — all synchronized.

### The Premium Landing Page
**Skills:** wc-design-brief + wc-html-build + gsap-animation + motion-typography + audio-sync
**Result:** Design brief locks direction → page builds with scroll-driven narrative → headlines animate with kinetic type → stats count up on scroll → subtle ambient audio on trade show mode.

### The Data Dashboard
**Skills:** firebase-core + wc-html-build + gsap-animation + mapbox-maps
**Result:** Real-time Firestore data → premium dark dashboard layout → animated chart transitions → territory map with rep markers and clustering.

### The Recruiting Pipeline
**Skills:** wc-html-build + firebase-core + firebase-functions + wood-consulting-comms + Jotform MCP + Gmail MCP
**Result:** Recruiting landing page → Jotform application embed → Firebase stores submissions → Cloud Function triggers → Gmail sends personalized follow-up sequence.

### The AI-Powered Feature
**Skills:** wc-ai + firebase-functions + firebase-core + wc-html-build
**Result:** AI model selection → Firebase Function proxies API calls → results stored in Firestore → premium UI displays AI output with streaming.

### The Trade Show Experience
**Skills:** wc-html-build + gsap-animation + lottie-animation + audio-sync + canvas-particle-engine + remotion-video
**Result:** Full-screen dark military aesthetic → looping animations → ambient audio → particle background → auto-playing video reels — zero interaction required, pure visual impact.

---

## Quality Gate

Before delivering any build, the skill coach asks:

1. **Did you run the design brief?** If no, stop and run it.
2. **Did you check for available MCP connections?** Jotform, Canva, Netlify, Gmail — use what's connected.
3. **Did you consider which skills could enhance this?** A page without motion is under-built. A win moment without audio is half-done.
4. **Did you run the slop checklist?** Inter font, purple gradients, centered-everything layouts — kill them.
5. **Would Aryen look at this and say "this is premium"?** If not, it's not done.
