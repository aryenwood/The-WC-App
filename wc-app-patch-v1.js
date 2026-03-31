/**
 * WC APP — SKILL AUDIT PATCH v1
 * ─────────────────────────────────────────────────────────────────────
 * Source: pwa-ios-standalone + d2d-sales-domain + wc-copywriting skills
 * Apply: paste this into the WC App codebase, import in main entry point
 *
 * FIXES IN THIS FILE:
 *   1. iOS bottom nav safe area inset (home indicator overlap)
 *   2. #app fixed pixel min-height → 100dvh
 *   3. Tier threshold tooltip / progress bar
 *   4. Win moment overlay + confetti trigger on appointment set
 * ─────────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════
   FIX 1 — iOS SAFE AREA: BOTTOM NAV HOME INDICATOR
   Source: pwa-ios-standalone skill §2 Safe Area Insets
   Problem: bottomNavPadding was 0px — home indicator bar
            overlaps bottom navigation on iPhone.
   ═══════════════════════════════════════════════════════ */
const iosSafeAreaCSS = `
  /* pwa-ios-standalone: safe area bottom nav fix */
  .bottom-nav,
  [class*="bottom-nav"],
  [class*="tab-bar"],
  nav.app-nav:last-of-type {
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
  }

  /* Extra padding for content scrolled under bottom nav */
  #main {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
`;

/* ═══════════════════════════════════════════════════════
   FIX 2 — iOS: #APP MIN-HEIGHT MUST USE 100dvh NOT px
   Source: pwa-ios-standalone skill §2 100dvh vs 100vh
   Problem: appMinHeight was "814px" (fixed px value).
            Breaks on iPhone 15 Pro Max, SE, landscape, etc.
   ═══════════════════════════════════════════════════════ */
const appHeightCSS = `
  /* pwa-ios-standalone: use dynamic viewport height, never fixed px */
  #app {
    min-height: 100dvh !important;
    /* NOT height: 100vh — clips content when keyboard opens */
    /* NO overflow: hidden — traps scroll events on iOS */
  }
`;

/* ═══════════════════════════════════════════════════════
   FIX 3 — TIER THRESHOLD PROGRESS BAR
   Source: d2d-sales-domain skill §6 Leaderboard & Gamification
   Problem: Reps see "🌱 Rookie" with no context — they don't
            know that 8 appts/mo = Pro, 20 = Elite, 40 = Legend.
            Zero motivation signal.
   ═══════════════════════════════════════════════════════ */

// Tier thresholds from d2d-sales-domain SKILL.md
const TIERS = [
  { name: 'Legend', badge: '🏆', minMonthlyAppts: 40, color: '#F59E0B' },
  { name: 'Elite',  badge: '💎', minMonthlyAppts: 20, color: '#8B5CF6' },
  { name: 'Pro',    badge: '⚡', minMonthlyAppts: 8,  color: '#3B82F6' },
  { name: 'Rookie', badge: '🌱', minMonthlyAppts: 0,  color: '#6B7280' },
];

/**
 * Get current tier and progress to next tier
 * @param {number} monthlyAppts - appointments set this month
 * @returns {{ current, next, progress, appsToNext }}
 */
function getTierProgress(monthlyAppts) {
  const current = TIERS.find(t => monthlyAppts >= t.minMonthlyAppts) || TIERS[TIERS.length - 1];
  const currentIdx = TIERS.indexOf(current);
  const next = currentIdx > 0 ? TIERS[currentIdx - 1] : null;

  if (!next) {
    return { current, next: null, progress: 100, appsToNext: 0 };
  }

  const range = next.minMonthlyAppts - current.minMonthlyAppts;
  const earned = monthlyAppts - current.minMonthlyAppts;
  const progress = Math.min(Math.round((earned / range) * 100), 100);
  const appsToNext = next.minMonthlyAppts - monthlyAppts;

  return { current, next, progress, appsToNext };
}

/**
 * Render tier progress bar into an existing element
 * Call this wherever rep tier is shown in the dashboard
 * @param {HTMLElement} container - element to inject into
 * @param {number} monthlyAppts - rep's monthly appointment count
 */
function renderTierProgress(container, monthlyAppts) {
  const { current, next, progress, appsToNext } = getTierProgress(monthlyAppts);

  container.innerHTML = `
    <div class="tier-progress-wrap" style="
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 14px 16px;
      font-family: inherit;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:16px;font-weight:600;color:#fff">
          ${current.badge} ${current.name}
        </span>
        ${next ? `
          <span style="font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:0.5px">
            ${appsToNext} appt${appsToNext !== 1 ? 's' : ''} to ${next.badge} ${next.name}
          </span>
        ` : '<span style="font-size:11px;color:#F59E0B;letter-spacing:0.5px">MAX TIER 🏆</span>'}
      </div>
      <div style="
        height: 6px;
        background: rgba(255,255,255,0.08);
        border-radius: 3px;
        overflow: hidden;
      ">
        <div style="
          height: 100%;
          width: ${progress}%;
          background: linear-gradient(90deg, ${current.color}, ${next ? next.color : current.color});
          border-radius: 3px;
          transition: width 0.6s ease;
        "></div>
      </div>
      ${next ? `
        <div style="
          display:flex;justify-content:space-between;margin-top:7px;
          font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.5px
        ">
          <span>${current.badge} ${current.minMonthlyAppts} appts</span>
          <span>${next.badge} ${next.minMonthlyAppts} appts</span>
        </div>
      ` : ''}
    </div>
  `;
}

// Usage in dashboard:
// const tierEl = document.querySelector('[class*="tier"], [class*="rank"]');
// if (tierEl) renderTierProgress(tierEl, monthlyAppointmentCount);


/* ═══════════════════════════════════════════════════════
   FIX 4 — WIN MOMENT OVERLAY + CONFETTI
   Source: d2d-sales-domain skill §6 Win Moments
   Problem: hasConfetti was true (canvas-particle-engine
            code exists) but hasWinMoment was false — the
            overlay was never getting triggered. The confetti
            fires but there's no announcement moment.
   ═══════════════════════════════════════════════════════ */

const winOverlayCSS = `
  .win-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(6, 8, 16, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .win-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
  .win-overlay-badge {
    font-size: 64px;
    margin-bottom: 16px;
    animation: winBounce 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .win-overlay-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
    animation: winBounce 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    text-align: center;
    padding: 0 24px;
  }
  .win-overlay-sub {
    font-size: 16px;
    color: rgba(255,255,255,0.6);
    font-weight: 300;
    animation: winBounce 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    text-align: center;
    padding: 0 24px;
  }
  .win-overlay-tap {
    margin-top: 32px;
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: winFade 1s 1s ease both;
  }
  @keyframes winBounce {
    from { opacity: 0; transform: scale(0.6) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes winFade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

/**
 * Show a win moment overlay
 * @param {Object} opts
 * @param {string} opts.badge - emoji badge (e.g. '🎯')
 * @param {string} opts.title - headline text
 * @param {string} opts.subtitle - subtext
 * @param {number} [opts.duration=2500] - ms before auto-dismiss
 */
function showWinOverlay({ badge, title, subtitle, duration = 2500 }) {
  // Create or reuse overlay
  let overlay = document.getElementById('wc-win-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'wc-win-overlay';
    overlay.className = 'win-overlay';
    overlay.innerHTML = `
      <div class="win-overlay-badge" id="win-badge"></div>
      <div class="win-overlay-title" id="win-title"></div>
      <div class="win-overlay-sub" id="win-sub"></div>
      <div class="win-overlay-tap">Tap anywhere to dismiss</div>
    `;
    overlay.addEventListener('click', () => dismissWinOverlay());
    document.body.appendChild(overlay);
  }

  document.getElementById('win-badge').textContent = badge;
  document.getElementById('win-title').textContent = title;
  document.getElementById('win-sub').textContent = subtitle;

  // Force reflow so transition fires
  overlay.offsetHeight;
  overlay.classList.add('active');

  // Auto dismiss
  clearTimeout(overlay._timer);
  overlay._timer = setTimeout(() => dismissWinOverlay(), duration);
}

function dismissWinOverlay() {
  const overlay = document.getElementById('wc-win-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Trigger full appointment win moment
 * Call this immediately after a rep logs an appointment dispo
 * @param {string} repName - rep's name
 */
function triggerAppointmentWin(repName) {
  // Fire confetti — uses existing canvas-particle-engine in app
  if (typeof fireConfetti === 'function') {
    fireConfetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4A9BAD', '#2B3990', '#2ECC71', '#fff'],
    });
  } else if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  showWinOverlay({
    badge: '🎯',
    title: 'Appointment Set!',
    subtitle: `Nice work${repName ? ', ' + repName : ''}. Keep it going.`,
    duration: 2800,
  });
}

/**
 * Trigger rank-up win moment
 * Call when rep crosses a tier threshold
 * @param {Object} newTier - tier object from TIERS array
 * @param {string} repName - rep's name
 */
function triggerRankUp(newTier, repName) {
  if (typeof fireConfetti === 'function') {
    fireConfetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
  } else if (typeof confetti === 'function') {
    confetti({ particleCount: 150, spread: 90 });
  }

  showWinOverlay({
    badge: newTier.badge,
    title: `${newTier.name}!`,
    subtitle: `${repName ? repName + ' is now ' : ''}${newTier.badge} ${newTier.name}. Level up.`,
    duration: 3500,
  });
}


/* ═══════════════════════════════════════════════════════
   INJECT CSS PATCHES
   Call applyWCAppPatches() once on app init
   ═══════════════════════════════════════════════════════ */
function applyWCAppPatches() {
  if (document.getElementById('wc-skill-patch-v1')) return; // idempotent
  const style = document.createElement('style');
  style.id = 'wc-skill-patch-v1';
  style.textContent = [
    '/* WC App Skill Patch v1 — pwa-ios-standalone + d2d-sales-domain */',
    iosSafeAreaCSS,
    appHeightCSS,
    winOverlayCSS,
  ].join('\n');
  document.head.appendChild(style);

  console.log('[WC Patch] iOS safe area, dvh fix, tier progress, win overlay — applied');
}

// Auto-apply on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyWCAppPatches);
} else {
  applyWCAppPatches();
}


/* ═══════════════════════════════════════════════════════
   GLOBALS (no module system — loaded via <script> tag)
   ═══════════════════════════════════════════════════════ */

/*
 * ─── INTEGRATION GUIDE ────────────────────────────────────────────────
 *
 * 1. IMPORT in your main entry (main.js / app.js):
 *      import { applyWCAppPatches, triggerAppointmentWin,
 *               renderTierProgress } from './wc-app-patch-v1.js';
 *
 * 2. APPOINTMENT WIN — wire to your dispo submit handler:
 *      // When rep logs 'appointment' dispo:
 *      if (dispo === 'appointment') {
 *        triggerAppointmentWin(currentRep.name);
 *        incrementSession('appointmentsSet', orgId);
 *      }
 *
 * 3. TIER PROGRESS BAR — add to dashboard after loading rep stats:
 *      const tierEl = document.querySelector('[class*="tier"]');
 *      if (tierEl) renderTierProgress(tierEl, rep.monthlyAppts);
 *
 * 4. RANK-UP TRIGGER — check after every appointment increment:
 *      const prev = getTierProgress(rep.monthlyAppts - 1).current;
 *      const curr = getTierProgress(rep.monthlyAppts).current;
 *      if (prev.name !== curr.name) triggerRankUp(curr, rep.name);
 *
 * 5. MISSING DISPOS — add to your DISPOS config:
 *      CALLBACK: { id:'callback', label:'Callback', color:'#F59E0B', icon:'📞' }
 *      SOLD:     { id:'sold',     label:'Sold',     color:'#059669', icon:'🎉' }
 *
 * ─────────────────────────────────────────────────────────────────────
 */
