---
name: wc-efficient-prompt
description: Use this skill when writing Claude Code prompts for the WC App project. Generates token-efficient, surgical prompts that minimize file reads and context window usage without losing execution quality. Trigger when user says "write a Claude Code prompt", "send to Claude Code", "prompt for Claude Code", or asks to fix/build something in the WC App.
---

# WC App Efficient Claude Code Prompt Generator

This skill generates token-efficient prompts for the WC App project (The-WC-App repo). The app lives at `~/claude-projects/The-WC-App/index.html` — a single large HTML file (~20,000+ lines). Every unnecessary full-file read wastes significant tokens.

## Core Principles

### 1. NEVER read the whole file unless absolutely required
Bad: "Read index.html before touching anything"
Good: "Find the function `bookAppointment()` in index.html and read only that section"

### 2. Always reference by function name or keyword, not line number
Line numbers shift with every edit. Function names are stable.
Good: "Find `renderBookingForm()` and the CSS for `.booking-modal`"

### 3. Batch related fixes into one prompt
Never send 3 prompts when 1 will do. Group by file proximity:
- All modal/sheet fixes → one prompt
- All Firestore read fixes → one prompt  
- All CSS fixes → one prompt

### 4. Suppress verbose output
Add to every prompt: "Report only: what you changed, function name, done."
This cuts response tokens by 60-80%.

### 5. Use grep-first pattern
Instead of reading a file, find the target first:
"grep for `bookAppointment` in index.html, read only the surrounding 50 lines, then fix X"

### 6. No explanations in prompts
Claude Code doesn't need context about WHY you want something.
Bad: "The booking form has a scroll issue because the modal container doesn't have overflow-y set, which means on mobile the user can't reach fields below the fold..."
Good: "Fix: `.booking-modal` needs `overflow-y:auto; max-height:92vh; -webkit-overflow-scrolling:touch`"

---

## Prompt Templates

### Template A — CSS Fix
```
In index.html, find CSS for [SELECTOR].
Add/change: [PROPERTY]: [VALUE]
Also fix same issue on: [OTHER_SELECTORS]
Report: changed selectors only.
```

### Template B — JavaScript Function Fix  
```
In index.html, find function [FUNCTION_NAME].
Fix: [SPECIFIC_ISSUE]
Do not touch anything else.
Report: function name + what changed.
```

### Template C — New Feature (small)
```
In index.html, find [NEAREST_EXISTING_FUNCTION].
After it, add: [NEW_FUNCTION_SPEC]
Wire it to: [TRIGGER_ELEMENT_OR_EVENT]
Report: what was added, where.
```

### Template D — Firestore/Data Fix
```
In index.html, find where [DATA_OPERATION] happens.
Fix: [SPECIFIC_ISSUE]
Ensure: [CONDITION]
Do not read unrelated sections.
Report: done.
```

### Template E — Multi-fix Batch
```
In index.html, make these targeted fixes:

1. Find [FUNCTION_1] → [FIX_1]
2. Find CSS [SELECTOR_1] → [FIX_2]  
3. Find [FUNCTION_2] → [FIX_3]

Each fix is independent. Do not read sections unrelated to each fix.
Report: 1/2/3 done, one line each.
```

### Template F — Deploy
```
cd ~/claude-projects/The-WC-App
git add -A && git commit -m "[MESSAGE]" && git push
Report: commit hash only.
```

---

## Token Budget Guidelines

| Task Type | Estimated Tokens | Approach |
|-----------|-----------------|----------|
| Single CSS fix | ~800 | Template A |
| Single JS fix | ~1,500 | Template B |
| New small feature | ~3,000 | Template C |
| Multi-fix batch (3-5) | ~4,000 | Template E |
| Full file read + edit | ~25,000 | AVOID — only for major refactors |

**Rule of thumb:** If a prompt would require reading more than 200 lines of index.html, split the task or be more specific about the target.

---

## WC App Quick Reference

Key functions to reference by name (avoids full file reads):

**Booking:**
- `openBookAppointment()` — opens booking sheet
- `renderBookingForm()` — builds form HTML  
- `submitBooking()` — saves to Firestore
- `.booking-modal` / `.booking-sheet` — CSS selectors

**Auth/Org:**
- `onAuthStateChanged()` — auth handler
- `applyOrgBranding()` — applies org colors/logo
- `loadOrgFromDomain()` — domain-based org lookup

**OTD:**
- `startOTD()` / `stopOTD()` — toggle OTD mode
- `openDispoSheet()` — shows dispo options
- `saveOTDEntry()` — saves to Firestore

**Admin:**
- `saveAdminSettings()` — saves org settings
- `renderAdminPanel()` — builds admin UI
- `generateInviteCode()` — creates invite

**Super Admin:**
- `openSuperAdminPanel()` — opens platform panel
- `createOrg()` — creates new org in Firestore
- `generateMasterAdminCode()` — creates master invite

**Navigation:**
- `showTab(tabName)` — switches tabs
- `renderDashboard()` — home screen
- `initApp()` — app initialization

**Modals:**
- `openModal()` / `closeModal()` — generic modal
- `lockBodyScroll()` / `unlockBodyScroll()` — scroll lock

**Firebase:**
- `drainToFirestore()` — syncs localStorage to Firestore
- `getActiveRole()` — returns current user role

---

## How To Use This Skill

When Aryen describes a fix or feature, generate a prompt using the appropriate template. Always:

1. Reference the specific function or CSS selector
2. Use Template E (batch) when there are 2+ related fixes
3. End every prompt with "Report: [minimal output description]"
4. Never include "Read index.html before touching anything" — replace with targeted grep/find instruction
5. Strip all explanatory context from the prompt — Claude Code doesn't need to know why

If the task is genuinely large (full feature, major refactor), flag it and suggest breaking it into multiple targeted sessions rather than one giant prompt.
