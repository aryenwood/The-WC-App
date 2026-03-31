---
name: skill-auditor
description: "Audit existing skills for quality, gaps, and improvement opportunities."
---

# Skill Auditor

## Scope

This skill audits any SKILL.md file (or the entire skill library) for quality, completeness, and effectiveness. It evaluates how well a skill teaches Claude Code to execute a task, identifies gaps, and optionally rewrites the skill to fix issues.

## Step 1 — Read

Before auditing, read the full SKILL.md file. Never audit from memory or partial content. Use the Read tool to load the complete file.

## 9 Audit Dimensions

Score each dimension 1-5 (1 = missing/broken, 5 = excellent):

### 1. Trigger Accuracy (Description Field)
- Does the `description` in the frontmatter contain enough keywords to trigger on the right requests?
- Does it avoid false positives (triggering on unrelated requests)?
- Is it specific about what this skill IS and IS NOT?

### 2. Architecture Patterns
- Does the skill provide reusable code patterns, not just one-off snippets?
- Are patterns modular and composable?
- Do patterns reflect the actual WC App architecture (vanilla JS, no framework, single HTML file)?

### 3. Copy-Paste Readiness
- Can code blocks be copied directly into the project and work?
- Are all imports, CDN links, and dependencies declared?
- Are placeholder values clearly marked (not silently embedded)?

### 4. WC App Integration
- Does the skill reference actual WC App files, selectors, and conventions?
- Does it use WC design tokens (--amber, --bg, etc.)?
- Does it respect the scroll architecture (only #main scrolls)?

### 5. Error Handling & Edge Cases
- Does the skill cover what to do when things fail?
- Are common gotchas documented?
- Does it handle mobile/iOS/PWA edge cases?

### 6. Performance Guidance
- Are there performance rules or limits?
- Does it mention cleanup (removeEventListener, cancelAnimationFrame, etc.)?
- Does it consider mobile device constraints?

### 7. Completeness
- Does the skill cover the full scope claimed in the description?
- Are there obvious missing patterns?
- Is there enough depth to handle advanced use cases?

### 8. Clarity & Organization
- Is the skill scannable (clear headers, tables, code blocks)?
- Is it written for an AI (Claude Code) to consume, not a human tutorial?
- Does it avoid unnecessary prose and get to the point?

### 9. Cross-Skill Awareness
- Does the skill know when to hand off to other skills?
- Does it mention complementary skills?
- Does it avoid duplicating content from other skills?

## Audit Report Format

```
SKILL AUDIT: [skill-name]
========================

Overall Score: [X]/45

| Dimension | Score | Notes |
|-----------|-------|-------|
| Trigger Accuracy | X/5 | ... |
| Architecture Patterns | X/5 | ... |
| Copy-Paste Readiness | X/5 | ... |
| WC App Integration | X/5 | ... |
| Error Handling | X/5 | ... |
| Performance Guidance | X/5 | ... |
| Completeness | X/5 | ... |
| Clarity & Organization | X/5 | ... |
| Cross-Skill Awareness | X/5 | ... |

TOP 3 ISSUES
1. [Most critical gap or problem]
2. [Second most critical]
3. [Third most critical]

RECOMMENDED ACTIONS
- [ ] [Specific fix 1]
- [ ] [Specific fix 2]
- [ ] [Specific fix 3]
- [ ] [Additional fixes...]
```

## Offer to Rewrite

After presenting the audit report, always offer:

> "Would you like me to rewrite this skill with the issues fixed? I will preserve all existing correct content and add what is missing."

If the user accepts, rewrite the full SKILL.md and use the Write tool to save it.

## Full Library Audit

When asked to audit the entire skill library:

1. List all skills found in `.claude/skills/*/SKILL.md`
2. Read each one
3. Produce a summary table:

```
SKILL LIBRARY AUDIT
====================

| Skill | Score | Top Issue |
|-------|-------|-----------|
| canvas-particle-engine | 38/45 | Missing snow/rain patterns |
| firebase-core | 42/45 | Security rules need update |
| ... | ... | ... |

LIBRARY-LEVEL FINDINGS
- [Gap: no skill covers X]
- [Overlap: skills A and B both cover Y]
- [Missing: should have a skill for Z]

PRIORITY REWRITES (lowest scoring)
1. [skill-name] — [score] — [reason]
2. [skill-name] — [score] — [reason]
3. [skill-name] — [score] — [reason]
```

## Operating Principles

1. **Be constructive, not destructive** — every criticism comes with a specific fix
2. **Score honestly** — do not inflate scores to be nice; the user needs accurate signal
3. **Preserve working content** — never delete something that works just to restructure
4. **Think like Claude Code** — evaluate whether the skill helps Claude Code execute, not whether a human can read it
5. **Check the description field** — this is the most important part of a skill because it determines when the skill triggers. A perfect skill body with a bad description is worthless
