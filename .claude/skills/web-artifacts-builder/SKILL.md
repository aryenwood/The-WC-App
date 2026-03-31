---
name: web-artifacts-builder
description: "Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui)."
---

# Web Artifacts Builder Skill

## Quick Start

### Init — Set Up a New Artifact Project

Create a self-contained HTML file that includes React, Tailwind CSS, and shadcn/ui components. All dependencies are loaded via CDN so the artifact works as a single file with no build step.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WC Artifact</title>

  <!-- Tailwind CSS (CDN) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              DEFAULT: '#148f98',
              light: '#1ec8d5',
              dark: '#0d7882',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            display: ['Outfit', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

  <!-- React (CDN) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel (for JSX in browser) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Lucide Icons (CDN) -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    // Your components go here
    function App() {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="font-display text-4xl font-bold text-brand">
            WC Artifact
          </h1>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

### Develop — Component Patterns

#### Card Component

```jsx
function Card({ title, description, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-brand">{icon}</div>}
        <h3 className="font-display text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}
      {children}
    </div>
  );
}
```

#### Button Component

```jsx
function Button({ variant = 'primary', size = 'md', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50';
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}
```

#### Modal / Dialog

```jsx
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

### Bundle — Single File Output

All artifacts are single HTML files. No bundler is needed. To bundle for distribution:

1. Everything goes in one `.html` file
2. CSS is either inline `<style>` or Tailwind CDN
3. JS/JSX is in `<script type="text/babel">` tags
4. Images are base64-encoded data URIs or external CDN URLs
5. No node_modules, no build step, no package.json

### Share — Distribution

Artifacts can be:
- Saved as a local `.html` file and opened in any browser
- Deployed to Netlify via drag-and-drop
- Embedded in the WC App via iframe
- Shared as a GitHub Gist

### Test — Validation Checklist

Before considering an artifact complete:

- [ ] Opens correctly in Chrome, Safari, and Firefox
- [ ] Responsive: works on 375px mobile and 1440px desktop
- [ ] No console errors
- [ ] All interactive elements work (buttons, inputs, modals)
- [ ] Fonts load correctly (check for FOUT/FOIT)
- [ ] Colors match WC brand palette
- [ ] Accessible: keyboard navigable, sufficient contrast

## Stack Info

| Layer | Technology | CDN |
|-------|-----------|-----|
| UI Framework | React 18 | unpkg.com/react@18 |
| Styling | Tailwind CSS | cdn.tailwindcss.com |
| JSX Transform | Babel Standalone | unpkg.com/@babel/standalone |
| Icons | Lucide | unpkg.com/lucide |
| Fonts | Google Fonts | fonts.googleapis.com |
| Charts (optional) | Chart.js | cdn.jsdelivr.net/npm/chart.js |
| Animation (optional) | GSAP | cdn.jsdelivr.net/npm/gsap |
| Maps (optional) | Leaflet | unpkg.com/leaflet |

## Design Guidelines

### Layout

- Use `max-w-4xl mx-auto` for content containers
- Use CSS Grid for dashboards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Use Flexbox for alignment: `flex items-center justify-between`
- Mobile-first: start with single column, expand with `md:` and `lg:` breakpoints

### Color Usage

| Color | Tailwind Class | Use Case |
|-------|---------------|----------|
| Brand teal | `text-brand` / `bg-brand` | Primary actions, links, active states |
| Brand light | `text-brand-light` / `bg-brand-light` | Hover states, highlights |
| Brand dark | `text-brand-dark` / `bg-brand-dark` | Pressed states, headers |
| Gray 900 | `text-gray-900` | Primary text |
| Gray 600 | `text-gray-600` | Secondary text |
| Gray 100 | `bg-gray-100` | Subtle backgrounds |
| White | `bg-white` | Cards, surfaces |
| Red 500 | `text-red-500` | Errors, destructive actions |
| Green 500 | `text-green-500` | Success states |
| Amber 500 | `text-amber-500` | Warnings |

### Typography

- Headlines: `font-display font-bold` (Outfit)
- Body text: `font-sans` (Inter) — default
- Code/numbers: `font-mono` (JetBrains Mono)
- Size scale: `text-xs` (12px) through `text-6xl` (60px)

### Spacing

- Use Tailwind's 4px base: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Card padding: `p-6`
- Section gaps: `gap-6` or `space-y-6`
- Page padding: `p-4` mobile, `p-6` tablet, `p-8` desktop

### Animation

```html
<style>
  @keyframes animate-in {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-in { animation: animate-in 0.3s ease-out; }
</style>
```

### Dark Mode (Optional)

```html
<script>
  tailwind.config = {
    darkMode: 'class',
    // ...
  }
</script>

<!-- Toggle -->
<body class="dark:bg-gray-950 dark:text-gray-100">
  <div class="bg-white dark:bg-gray-900 rounded-xl">
    <h2 class="text-gray-900 dark:text-gray-100">Title</h2>
  </div>
</body>
```
