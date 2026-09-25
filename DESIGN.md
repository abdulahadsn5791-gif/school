# OS-Grade UI — Complete Design System Specification

**Tailwind CSS · Dark + Light · 360px → 1440px+ · Web, Android and iOS webviews**

Version 2.0 — full specification
Supersedes the dark-only master prompt. Every rule below holds in both themes.

---

## Table of contents

**Part I — Foundations**
1. [Philosophy: what makes an interface feel like an OS](#1-philosophy)
2. [How to use this document](#2-how-to-use-this-document)
3. [Stack rules](#3-stack-rules)
4. [The eleven non-negotiables](#4-the-eleven-non-negotiables)

**Part II — Tokens**
5. [Token architecture](#5-token-architecture)
6. [Colour reference — both themes](#6-colour-reference)
7. [`tailwind.config.js` — complete](#7-tailwindconfigjs--complete)
8. [`tokens.css` — complete](#8-tokenscss--complete)
9. [Theme switching — complete implementation](#9-theme-switching)
10. [Light mode is not inverted dark mode](#10-light-mode-is-not-inverted-dark-mode)

**Part III — Form**
11. [Spacing and the 4px grid](#11-spacing-and-the-4px-grid)
12. [Radius scale and concentric corners](#12-radius-scale-and-concentric-corners)
13. [Elevation model](#13-elevation-model)
14. [Materials: blur, scrims, dividers](#14-materials)
15. [Typography](#15-typography)
16. [Iconography](#16-iconography)
17. [Motion](#17-motion)

**Part IV — Layout**
18. [Responsive system](#18-responsive-system)
19. [Navigation patterns](#19-navigation-patterns)
20. [Page archetypes with wireframes](#20-page-archetypes)

**Part V — Components**
21. [Component library](#21-component-library)
22. [Density and enterprise views](#22-density-and-enterprise-views)
23. [Data visualisation without gradients](#23-data-visualisation)
24. [Feedback: toasts, banners, empty and error states](#24-feedback-states)

**Part VI — Quality**
25. [Content and copywriting](#25-content-and-copywriting)
26. [Accessibility](#26-accessibility)
27. [Platform notes](#27-platform-notes)
28. [Performance](#28-performance)
29. [Implementation guide](#29-implementation-guide)
30. [QA checklist](#30-qa-checklist)
31. [Troubleshooting](#31-troubleshooting)
32. [Migrating a dark-only build](#32-migrating-a-dark-only-build)

**Appendices**
- [A. Token export (JSON)](#appendix-a--token-export-json)
- [B. Paste-ready AI prompt block](#appendix-b--paste-ready-ai-prompt-block)
- [C. One-page cheat sheet](#appendix-c--one-page-cheat-sheet)
- [D. Glossary](#appendix-d--glossary)

---

# Part I — Foundations

## 1. Philosophy

> Someone opening your product should feel they entered **a system**, not visited **a site**.

An interface reads as native because of physics, not palette. iOS Settings, One UI, macOS System
Settings and Windows 11 Settings look nothing alike, yet all four feel like an operating system
for the same seven reasons.

### The seven signals

| # | Signal | Why it reads as "system" | How this spec delivers it |
|---|---|---|---|
| 1 | **Layered flat surfaces** | Real OS chrome is stacked panes, not painted depth | `canvas → surface-1 → 2 → 3 → 4`, flat fills only |
| 2 | **One radius family** | Every OS picks a corner language and never breaks it | 8 / 14 / 20 / 28, stepping down when nested |
| 3 | **Hairline separation** | System UI separates with 1px rules, not whitespace alone | `border-line/10`, `divide-line/5` |
| 4 | **Blurred floating chrome** | Translucent material over moving content is the single most OS-specific effect on any platform | `backdrop-blur-sm bg-surface-3/72` |
| 5 | **The system typeface** | The interface renders in the same face as the OS around it | `-apple-system`, `Segoe UI Variable`, `Roboto` |
| 6 | **Motion that answers you** | Nothing moves unprompted in an OS; everything moves when you touch it | `ease-spring`, 150–300ms, interaction-only |
| 7 | **Layout that recomposes** | A phone screen and a desktop window are different compositions of one system, not one scaled | `flex-col` → `md:flex-row` split → `lg:` multi-pane |

### The three failure modes

- **Website tells.** A boxed page centred on a grey background, a hero section, a footer with
  four link columns, scroll-triggered fade-ups. These say "document", not "system".
- **Template tells.** Identical `rounded-lg` cards with identical `shadow-md`, gradient washes
  used as decoration, an accent colour on every third element.
- **Dead flatness.** Removing gradients without replacing them with anything. Flat is not the
  goal; *layered* is. A flat screen with no elevation cues is as wrong as a gradient-heavy one.

### What "comfortable" means here

The brief asked for an interface that feels comfortable to live in. Concretely that is:

- **Low luminance range in dark, low glare in light.** Nothing on screen is pure black or a
  large field of pure white.
- **Predictable geography.** Navigation is in the same place on every screen. The back affordance
  never moves.
- **Nothing competes.** One accent, one primary action, one display heading per screen.
- **No surprises.** Nothing animates, expands or appears unless the person caused it.
- **Readable at arm's length.** 16px body minimum, 4.5:1 contrast, 44px touch targets.

---

## 2. How to use this document

| You want to… | Go to |
|---|---|
| Start a new project | §7 config, §8 tokens, then §21 components |
| Brief an AI build tool | Appendix B — paste the prompt block |
| Check a colour value | §6 |
| Decide a layout at a breakpoint | §18, §20 |
| Build a specific component | §21 |
| Add light mode to an existing dark build | §32 |
| Debug something that looks wrong | §31 |
| Ship | §30 |

Copy `tailwind.config.js` (§7) and `tokens.css` (§8) verbatim into a new project. Everything else
in this document is derived from those two files.

---

## 3. Stack rules

**Allowed**

- Tailwind utility classes, applied directly in markup.
- One `tailwind.config.js` holding every token.
- One raw CSS file, containing **only**:
  - the three `@tailwind` directives,
  - the CSS custom properties that define the two themes,
  - `@keyframes` if a flow genuinely needs one (most do not),
  - the `prefers-reduced-motion` guard,
  - at most a handful of `@layer base` resets (focus ring reset, `::selection`, scrollbar).
- Tailwind arbitrary values — `rounded-[14px]`, `w-[1200px]`, `text-[10px]` — for one-off cases.
- Official Tailwind plugins if needed (`@tailwindcss/forms` is usually unnecessary here since
  every input is styled explicitly).

**Not allowed**

- Component `.css` / `.scss` / `.module.css` files.
- styled-components, emotion, vanilla-extract, or any CSS-in-JS.
- Bootstrap, Bulma, Material UI, Ant Design, DaisyUI, Chakra — or their class names (`btn`,
  `card`, `container`, `row`, `col-md-6`).
- Inline `style=""` attributes carrying design decisions. (Runtime-computed values — a progress
  bar width, a transform driven by drag — are fine.)
- A second `<style>` block anywhere in the app.

**Why this strictness**

Every token lives in one file. Changing the accent, the corner language, or the entire theme is a
one-file edit that propagates to every screen. The moment styling leaks into component CSS, that
guarantee is gone, and the system drifts back into the inconsistency Tailwind was adopted to
prevent.

---

## 4. The eleven non-negotiables

1. **No gradients anywhere.** No `bg-gradient-to-*`, no `from-*` / `via-*` / `to-*`, no
   `linear-gradient` or `radial-gradient` inside an arbitrary value, no gradient borders, no
   gradient text. Depth comes from §13.
2. **Never pure black.** Dark canvas is `#0A0B0D`. Pure black destroys perceived depth on OLED
   (the panel switches pixels fully off, so there is nothing for a surface step to sit against)
   and reads as "a webpage with the lights out".
3. **Pure white is reserved.** In light mode `#FFFFFF` is `surface-4` only — modals, sheets,
   active segments. The canvas is `#E9EAEE`. A white canvas leaves nothing for elevation to
   climb toward.
4. **No sharp edges.** Every container, card, button, input, sheet, icon tile and chip uses the
   radius scale. `rounded-none` and `rounded-sm` never appear on a container.
5. **Depth is layering.** Order of reach: surface step → hairline border → tight shadow. Never
   start with the shadow.
6. **One accent.** One accent colour, one primary action per screen. Everything else neutral.
7. **Four solid text tokens.** `ink`, `ink-2`, `ink-3`, `ink-4`. Not white at four opacities —
   that is dark-only thinking and it fails in light mode (§5.4).
8. **The markup never branches on theme.** Zero `dark:` variants in components. If you are
   writing them, the token layer is wrong.
9. **Both themes ship together.** Neither is a retrofit. Every screen, modal, sheet, toast and
   empty state is checked in both.
10. **Motion only answers an action.** No scroll reveals, no staggered entrances, no decorative
    `animate-*`. `prefers-reduced-motion` always honoured.
11. **360px is the floor, not an edge case.** Build and verify the compact phone column before
    adding a single responsive prefix.

---

# Part II — Tokens

## 5. Token architecture

### 5.1 Why not `dark:` variants

The default Tailwind approach looks like this:

```html
<div class="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800
            text-zinc-900 dark:text-zinc-100 shadow-sm dark:shadow-none">
```

Four problems, all of which get worse with scale:

- **Every class string doubles.** Real components reach 200+ characters of class attribute.
- **One missed variant is a bug you will ship.** A forgotten `dark:` is a white flash in the
  middle of a dark app, and it only appears on one device state so it survives review.
- **Adding a third theme means touching every file.** High-contrast, OLED-black, a brand
  variant — each one is a full refactor.
- **Design and code drift.** The palette lives in a thousand class strings, not in one place.

### 5.2 The alternative: semantic names bound to variables

```js
// tailwind.config.js
colors: {
  'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
}
```

```css
/* tokens.css */
:root                  { --surface-2: 248 249 251; }  /* light */
:root[data-theme=dark] { --surface-2:  27  29  33; }  /* dark  */
```

```html
<div class="bg-surface-2 border-line/10 text-ink shadow-sm">
```

One class string. Both themes. No variants.

### 5.3 Why channels, not hex

The variables hold **space-separated RGB channels** (`27 29 33`), not `#1B1D21`. This is what
makes `<alpha-value>` work, which is what keeps Tailwind's opacity modifiers alive:

```
bg-surface-3/72   → rgb(36 38 43 / 0.72)   ✓ frosted chrome
border-line/10    → rgb(255 255 255 / 0.1) ✓ hairline
bg-accent/12      → rgb(61 139 255 / 0.12) ✓ tinted icon tile
```

If you store hex in the variable, all of those silently produce an invalid colour and render as
nothing. This is the single most common implementation mistake in this pattern.

### 5.4 Semantic naming, and the text-token correction

Tokens are named for **role**, never for appearance. `surface-2` works in both themes;
`grey-800` is meaningless in light mode.

The dark-only version of this system used opacity tiers for text — `text-white`, `text-white/60`,
`text-white/38`, `text-white/24`. That is genuinely elegant, and it is correct **on dark only**.

On light backgrounds it fails for two reasons:

- **Contrast.** Near-black at 45% over `#F8F9FB` computes to roughly 3.4:1 — below the 4.5:1
  minimum for body text. The tier that looked like "quiet metadata" on dark becomes illegible.
- **Perception.** Translucent black over a light surface reads as *muddy* — it desaturates toward
  the background rather than receding from it. Translucent white over dark recedes cleanly
  because it is subtractive against a dark field.

So text uses **four solid tokens**, each tuned per theme:

| Role | Token | Light | Dark | Contrast on `surface-2` | Use |
|---|---|---|---|---|---|
| Primary | `text-ink` | `#0B0D12` | `#F5F6F8` | 18.5:1 / 16.2:1 | Headings, values, anything that must be read |
| Secondary | `text-ink-2` | `#4C5260` | `#A9AEB8` | 7.4:1 / 7.6:1 | Supporting sentences, inactive labels |
| Tertiary | `text-ink-3` | `#676D7B` | `#868B96` | 4.9:1 / 4.9:1 | Captions, metadata, timestamps, placeholders |
| Disabled | `text-ink-4` | `#A2A7B2` | `#565A63` | 2.3:1 / 2.4:1 | Unavailable controls **only** |

`ink-4` is deliberately below AA. Disabled controls are exempt from contrast minimums, and that
low contrast is the signal. Never put live content in it.

**Borders keep alpha.** `--line` is a single channel triple (ink in light, white in dark) used at
5–15% opacity. A hairline sits over an unpredictable backdrop, so transparency is genuinely the
right model, and at those alphas both themes stay within tolerance.

### 5.5 Token layers

```
┌─────────────────────────────────────────────────────┐
│ Layer 3 — Components   bg-surface-2 border-line/10  │  ← what you write
├─────────────────────────────────────────────────────┤
│ Layer 2 — Tailwind     surface-2 → rgb(var(--…))    │  ← tailwind.config.js
├─────────────────────────────────────────────────────┤
│ Layer 1 — Themes       --surface-2: 248 249 251     │  ← tokens.css
└─────────────────────────────────────────────────────┘
```

Layer 3 never knows which theme is active. Layer 1 is the only file that changes when a theme
changes. Layer 2 is written once and never touched again.

---

## 6. Colour reference

### 6.1 Surfaces

| Token | Light | Dark | Elevation role | Typical treatment |
|---|---|---|---|---|
| `canvas` | `#E9EAEE` | `#0A0B0D` | Root background, the "desktop" | No border, no shadow |
| `surface-1` | `#F1F2F5` | `#131417` | Panels, sidebars, rails, inset wells | `border-line/10` |
| `surface-2` | `#F8F9FB` | `#1B1D21` | Cards, list groups, table body | `border-line/10 shadow-sm` |
| `surface-3` | `#FCFCFD` | `#24262B` | Raised cards, popovers, inputs, chrome | `border-line/10 shadow-sm` |
| `surface-4` | `#FFFFFF` | `#2E3036` | Modals, sheets, active segment thumbs | `border-line/10 shadow-lg` |

Note the asymmetry. Dark steps span 36 luminance points and separate on their own. Light steps
span 22 and rely on shadow. That is intentional, not a rounding artefact — see §10.

### 6.2 Text

| Token | Light | Dark |
|---|---|---|
| `ink` | `#0B0D12` | `#F5F6F8` |
| `ink-2` | `#4C5260` | `#A9AEB8` |
| `ink-3` | `#676D7B` | `#868B96` |
| `ink-4` | `#A2A7B2` | `#565A63` |

### 6.3 Line

| Token | Light | Dark | Usage |
|---|---|---|---|
| `line` | `#0B0D12` (ink) | `#FFFFFF` | `border-line/5` subtle · `/10` default · `/15` emphasis · `/20` handle grips |

### 6.4 Accent and semantics

| Token | Light | Dark | Contrast (light / dark, on `surface-2`) |
|---|---|---|---|
| `accent` | `#0B63E5` | `#3D8BFF` | 5.1:1 / 5.1:1 |
| `accent-ink` | `#FFFFFF` | `#07142B` | 5.4:1 / 5.5:1 *(on the accent fill)* |
| `success` | `#0F7B52` | `#34C77B` | 5.0:1 / 7.7:1 |
| `warning` | `#9A6212` | `#F0B23D` | 4.8:1 / 9.0:1 |
| `danger` | `#CE2B2B` | `#FF5C5C` | 5.0:1 / 5.6:1 |
| `info` | `#0B63E5` | `#3D8BFF` | = accent |

**`accent-ink` is the token most people get wrong.** In light mode, white sits on the accent fill.
In dark mode it must *not* — white on `#3D8BFF` is 3.3:1, which fails for button labels. A very
dark navy (`#07142B`) on that same fill is 5.5:1. This is why Material 3 uses a dark "on-primary"
in dark themes, and it is why the token exists separately from `ink`.

### 6.5 Choosing a different accent

Swap `--accent` and `--accent-ink` only. Never introduce a second accent.

| Product type | Light accent | Dark accent | Dark `accent-ink` |
|---|---|---|---|
| Business / productivity | `#0B63E5` | `#3D8BFF` | `#07142B` |
| Finance / health | `#0F7B52` | `#34C77B` | `#05210F` |
| Consumer / warm | `#C2410C` | `#FF6B4A` | `#2B0A02` |
| Media / creative | `#6D28D9` | `#A78BFA` | `#1A0B33` |
| Neutral / tooling | `#3F3F46` | `#D4D4D8` | `#18181B` |

Rule of thumb for any candidate: it must reach ≥4.5:1 against `surface-2` **in both themes**, and
whatever text sits on the fill must reach ≥4.5:1 against the fill.

### 6.6 Shadows

| Token | Light | Dark |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgb(15 18 26/.06), 0 1px 3px rgb(15 18 26/.04)` | `0 1px 2px rgb(0 0 0/.35)` |
| `shadow` | `0 4px 14px rgb(15 18 26/.08), 0 1px 3px rgb(15 18 26/.05)` | `0 4px 12px rgb(0 0 0/.40)` |
| `shadow-lg` | `0 16px 40px rgb(15 18 26/.14), 0 2px 8px rgb(15 18 26/.06)` | `0 8px 28px rgb(0 0 0/.50)` |

Light shadows are two-layer (a tight contact shadow plus a wide ambient one) and tinted cool
(`15 18 26`, not pure black) so they read as shadow rather than grey haze. Dark shadows are
single-layer and near-black because they only need to reinforce a surface step that is already
doing the work.

---

## 7. `tailwind.config.js` — complete

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}'],

  // Enables `dark:` for the rare third-party component you cannot restyle.
  // Your own components must never use it.
  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    // ─── REPLACED, not extended ────────────────────────────────────────────
    // Extended screens are appended AFTER Tailwind's defaults, so an extended
    // `xs: 360px` emits after lg/xl and wins at every width above 360px — a
    // silent cascade bug. Declaring the full scale fixes the order, and lets
    // `sm` mean 480px (large phone) instead of Tailwind's 640px.
    //
    // Unprefixed utilities target 320px — a 5" phone, not 360px. See §18.
    screens: {
      xs:   '360px',  // standard phone (most Android, iPhone SE 2/3)
      sm:   '480px',  // large phone 6.7", phone landscape short edge
      md:   '768px',  // small tablet portrait, iPad Split View
      lg:  '1024px',  // tablet landscape, 13" laptop — rail appears
      xl:  '1440px',  // 15–16" laptop — third pane
      '2xl': '1920px', // 24" desktop at 100%
      '3xl': '2560px', // 27–32", 40" 4K at 150% scaling
      '4xl': '3200px', // 40" 4K at 100% — fourth region

      // Height guards. Stack them: `md:tall:flex-row` splits into panes only
      // when there is vertical room. Without this, a 6.7" phone in landscape
      // (932×430) gets the tablet two-pane layout in 430px of height.
      tall:  { raw: '(min-height: 560px)' },
      short: { raw: '(max-height: 559px)' },

      // Input guards. A 1366×768 touchscreen laptop is `lg:` AND `touch:`.
      touch: { raw: '(pointer: coarse)' },
      fine:  { raw: '(pointer: fine)' },
    },

    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: {
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
          4: 'rgb(var(--surface-4) / <alpha-value>)',
        },
        ink:          'rgb(var(--ink)        / <alpha-value>)',
        'ink-2':      'rgb(var(--ink-2)      / <alpha-value>)',
        'ink-3':      'rgb(var(--ink-3)      / <alpha-value>)',
        'ink-4':      'rgb(var(--ink-4)      / <alpha-value>)',
        line:         'rgb(var(--line)       / <alpha-value>)',
        accent:       'rgb(var(--accent)     / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        success:      'rgb(var(--success)    / <alpha-value>)',
        warning:      'rgb(var(--warning)    / <alpha-value>)',
        danger:       'rgb(var(--danger)     / <alpha-value>)',
        info:         'rgb(var(--info)       / <alpha-value>)',
      },

      borderRadius: {
        sm: '8px',        // chips, tags, checkboxes, small icon tiles
        DEFAULT: '14px',  // buttons, inputs, list rows, small cards
        lg: '20px',       // cards, panels, dropdowns, popovers
        xl: '28px',       // modals, sheets, large containers
        // rounded-full already covers pills, avatars, switches
      },

      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text',
               'Segoe UI Variable', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },

      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        none: 'none',
      },

      backdropBlur: {
        xs: '20px',   // scrims, light overlays
        sm: '30px',   // nav bars, sheets, control panels
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',   // fast out, long settle
        exit:   'cubic-bezier(0.4, 0, 1, 1)',        // dismissals only
      },

      transitionDuration: {
        instant: '120ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },

      zIndex: {
        base: '0', raised: '10', sticky: '20', chrome: '30',
        overlay: '40', modal: '50', toast: '60',
      },

      maxWidth: {
        prose: '68ch',       // reading column
        shell: '1200px',     // desktop content shell
      },

      spacing: {
        11: '2.75rem',       // 44px — minimum touch target (Tailwind default, pinned here)
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
    },
  },

  plugins: [],
}
```

---

## 8. `tokens.css` — complete

This is the entire raw-CSS surface of the system. Nothing else.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── LIGHT (default) ──────────────────────────────────────────────────── */
:root {
  color-scheme: light;

  --canvas:    233 234 238;  /* #E9EAEE */
  --surface-1: 241 242 245;  /* #F1F2F5 */
  --surface-2: 248 249 251;  /* #F8F9FB */
  --surface-3: 252 252 253;  /* #FCFCFD */
  --surface-4: 255 255 255;  /* #FFFFFF — topmost layer only */

  --ink:       11 13 18;     /* #0B0D12 */
  --ink-2:     76 82 96;     /* #4C5260 */
  --ink-3:     103 109 123;  /* #676D7B */
  --ink-4:     162 167 178;  /* #A2A7B2 */

  --line:      11 13 18;     /* hairlines = ink at 5–15% */

  --accent:     11 99 229;   /* #0B63E5 */
  --accent-ink: 255 255 255; /* white sits ON the accent fill */

  --success: 15 123 82;      /* #0F7B52 */
  --warning: 154 98 18;      /* #9A6212 */
  --danger:  206 43 43;      /* #CE2B2B */
  --info:    11 99 229;      /* #0B63E5 */

  --shadow-sm: 0 1px 2px rgb(15 18 26 / .06), 0 1px 3px rgb(15 18 26 / .04);
  --shadow-md: 0 4px 14px rgb(15 18 26 / .08), 0 1px 3px rgb(15 18 26 / .05);
  --shadow-lg: 0 16px 40px rgb(15 18 26 / .14), 0 2px 8px rgb(15 18 26 / .06);
}

/* ─── DARK (follows the OS) ────────────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;

    --canvas:    10 11 13;    /* #0A0B0D */
    --surface-1: 19 20 23;    /* #131417 */
    --surface-2: 27 29 33;    /* #1B1D21 */
    --surface-3: 36 38 43;    /* #24262B */
    --surface-4: 46 48 54;    /* #2E3036 */

    --ink:       245 246 248; /* #F5F6F8 */
    --ink-2:     169 174 184; /* #A9AEB8 */
    --ink-3:     134 139 150; /* #868B96 */
    --ink-4:     86 90 99;    /* #565A63 */

    --line:      255 255 255;

    --accent:     61 139 255; /* #3D8BFF */
    --accent-ink: 7 20 43;    /* #07142B — DARK ink on the accent fill */

    --success: 52 199 123;    /* #34C77B */
    --warning: 240 178 61;    /* #F0B23D */
    --danger:  255 92 92;     /* #FF5C5C */
    --info:    61 139 255;

    --shadow-sm: 0 1px 2px rgb(0 0 0 / .35);
    --shadow-md: 0 4px 12px rgb(0 0 0 / .40);
    --shadow-lg: 0 8px 28px rgb(0 0 0 / .50);
  }
}

/* ─── DARK (explicit override) — identical values ──────────────────────── */
:root[data-theme="dark"] {
  color-scheme: dark;

  --canvas:    10 11 13;
  --surface-1: 19 20 23;
  --surface-2: 27 29 33;
  --surface-3: 36 38 43;
  --surface-4: 46 48 54;

  --ink:       245 246 248;
  --ink-2:     169 174 184;
  --ink-3:     134 139 150;
  --ink-4:     86 90 99;

  --line:      255 255 255;

  --accent:     61 139 255;
  --accent-ink: 7 20 43;

  --success: 52 199 123;
  --warning: 240 178 61;
  --danger:  255 92 92;
  --info:    61 139 255;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / .35);
  --shadow-md: 0 4px 12px rgb(0 0 0 / .40);
  --shadow-lg: 0 8px 28px rgb(0 0 0 / .50);
}

/* ─── Base resets ──────────────────────────────────────────────────────── */
@layer base {
  html { -webkit-tap-highlight-color: transparent; }

  body {
    background-color: rgb(var(--canvas));
    color: rgb(var(--ink));
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  ::selection {
    background-color: rgb(var(--accent) / .25);
  }

  /* Scrollbars follow the theme. color-scheme handles most of this;
     this covers WebKit where the native styling is too heavy. */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb {
    background-color: rgb(var(--line) / .18);
    border-radius: 8px;
    border: 3px solid transparent;
    background-clip: content-box;
  }
  ::-webkit-scrollbar-thumb:hover { background-color: rgb(var(--line) / .28); }
  ::-webkit-scrollbar-track { background: transparent; }
}

/* ─── Reduced motion ───────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

**Note on the duplication.** The dark block appears twice by design. The media-query copy handles
"Auto"; the attribute copy handles an explicit user choice. Do not try to collapse them with a
shared class — the `:root:not([data-theme="light"])` guard is what lets "Light" override a dark
OS, and that only works as a separate selector. If the repetition bothers you, generate both from
one source in your build step; do not restructure the selectors.

---

## 9. Theme switching

### 9.1 The three states

**Auto (default) → Light → Dark**, in that order, and Auto comes first. Following the device is
itself an OS signal: a native app respects the system setting unless told otherwise.

### 9.2 No flash of the wrong theme

This script must run **before any stylesheet or markup paints**. Inline it in `<head>`, above the
CSS link. Do not move it to a bundle; a deferred bundle is too late and the person sees a white
flash on every load.

```html
<script>
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
</script>
```

Three details that matter:

- `try/catch` — private browsing and some webviews throw on `localStorage` access.
- No value written when the choice is Auto. The absence of the attribute *is* Auto.
- `data-theme`, not a class, so it never collides with a utility class.

### 9.3 The control

```js
function setTheme(choice) {            // 'auto' | 'light' | 'dark'
  const root = document.documentElement;
  if (choice === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  try { localStorage.setItem('theme', choice === 'auto' ? '' : choice); } catch (e) {}
  syncMetaThemeColor();
}
```

### 9.4 System bars

```html
<meta name="theme-color" content="#E9EAEE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0A0B0D" media="(prefers-color-scheme: dark)">
```

The `media` attribute only covers Auto. When the person overrides, update the tag directly:

```js
function syncMetaThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
  const [r, g, b] = bg.split(/\s+/);
  let tag = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'theme-color';
    document.head.appendChild(tag);
  }
  tag.content = `rgb(${r} ${g} ${b})`;
}
```

On Android this colours the status bar and the task-switcher card. On iOS it tints the Safari
surround in standalone PWA mode. Skipping it is why a "dark" web app still shows a white status
bar on Android — the most common single tell that it is not native.

### 9.5 React hook

```jsx
import { useCallback, useEffect, useState } from 'react';

export function useTheme() {
  const [choice, setChoice] = useState(() => {
    try { return localStorage.getItem('theme') || 'auto'; } catch { return 'auto'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (choice === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
    try { localStorage.setItem('theme', choice === 'auto' ? '' : choice); } catch {}
  }, [choice]);

  const resolved = choice !== 'auto'
    ? choice
    : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  return { choice, resolved, setTheme: useCallback(setChoice, []) };
}
```

### 9.6 Do not animate the transition

Never put `transition: background-color` on `*` or on `body` for theme changes. Watching every
surface tween between palettes is the definitive "website theme toggle" tell — no OS does it.

Instant is correct. If you want a softening, cross-fade the root only, once, for 120ms:

```js
document.documentElement.style.transition = 'opacity 120ms linear';
```

and remove it as soon as the frame commits.

---

## 10. Light mode is not inverted dark mode

This is where most dual-theme systems fall apart. Each row below is a genuine inversion of the
physics, not a colour swap.

| | Dark | Light |
|---|---|---|
| **Elevation direction** | Surfaces get **lighter** as they come forward | Surfaces get **whiter**, and shadow does most of the work |
| **Elevation range** | Wide — four clearly distinct greys | Narrow — four near-whites; shadow separates them |
| **Shadow role** | Reinforces a surface step that already reads | *Is* the elevation cue |
| **Shadow value** | Near-black, .35–.50, single layer | Cool-tinted, .04–.14, two layers (contact + ambient) |
| **Hairlines** | White at 5–15% | Ink at 5–12% |
| **Accent** | Can be bright (`#3D8BFF`); text on the fill goes **dark** | Must be deeper (`#0B63E5`); text on the fill goes **white** |
| **Status hues** | Bright and saturated | Deepened — `#34C77B` on white is 1.9:1 and unreadable; `#0F7B52` is 5.0:1 |
| **Frosted chrome** | `bg-surface-3/72 backdrop-blur-sm` | Same, plus `backdrop-saturate-150` — blur over near-white goes flat without a saturation lift |
| **Emphasis mechanism** | Brightness (`ink` vs `ink-2`) | Weight (`font-medium` vs `font-normal`) |
| **Reserved value** | Pure black — never used | Pure white — `surface-4` only |
| **Characteristic failure** | Grey mud: everything within 4% of everything else | Glare: a large `#FFFFFF` field with hard black shadows |
| **Disabled state** | Dims toward the background | Lightens toward the background |

### 10.1 Three rules that only apply to light mode

**Reach for weight, not darkness.** When something needs emphasis in light mode, go
`font-medium` → `font-semibold` before going darker. Light UI reads by weight; dark UI reads by
brightness. Making light-mode text darker for emphasis produces a harsh, top-heavy screen.

**Saturate the blur.** `backdrop-blur` over a dark backdrop naturally increases contrast between
the blurred content and the panel. Over near-white it does the opposite — the panel and the
content behind it converge into flat grey. `backdrop-saturate-150` restores the sense of material.

**Shadow before border on the topmost layer.** In dark mode a modal reads as raised because
`surface-4` is visibly lighter than everything behind it. In light mode `surface-4` is white and
the canvas is nearly white, so `shadow-lg` is carrying the entire separation. Never drop it.

### 10.2 The accent is still one accent

`--accent` differing between themes is a **tuning**, not a second brand colour. `#0B63E5` and
`#3D8BFF` are the same accent at two luminances, chosen so each clears 4.5:1 in its own context.
Never introduce a light-only or dark-only accent hue.

---

# Part III — Form

## 11. Spacing and the 4px grid

Every spacing value is a multiple of 4px. Tailwind's default scale already is; the rule is to
never break it with arbitrary values like `p-[13px]`.

| Utility | px | Use |
|---|---|---|
| `gap-1` / `p-1` | 4 | Icon-to-label inside a chip |
| `gap-2` / `p-2` | 8 | Between tightly-related items, dense table cells |
| `gap-3` / `p-3` | 12 | Row internals, icon-to-text in a list row |
| `gap-4` / `p-4` | 16 | **Default.** Card padding, phone screen padding |
| `gap-5` / `p-5` | 20 | Consumer-density rows, sheet padding |
| `gap-6` / `p-6` | 24 | Desktop panel padding, section separation |
| `gap-8` | 32 | Between major page sections |
| `mt-12` | 48 | Between top-level screen sections |

### Density pairs

| Context | Row padding | Card padding | Between cards |
|---|---|---|---|
| Consumer (phone) | `py-3 px-4` | `p-4` | `gap-3` |
| Consumer (desktop) | `py-4 px-5` | `p-5` | `gap-4` |
| Data-dense table | `py-2 px-3` | `p-4` | `gap-3` |
| Ultra-dense (finance grid) | `py-1.5 px-2.5` | `p-3` | `gap-2` |

Density changes **padding only**. Colours, radii, borders and materials are identical across all
four. If your dense table has different card colours from your settings screen, the system broke.

### Vertical rhythm

- Label → value: `gap-0.5` (2px) or `mt-1`
- Heading → body: `mt-1` for a subtitle, `mt-3` for a paragraph
- Body → next control: `mt-4`
- Section → section: `mt-8` phone, `mt-12` desktop

### Touch targets

`min-h-11 min-w-11` (44×44) on every interactive element, including icon buttons inside dense
tables. Visual size may be smaller — pad the hit area rather than growing the icon:

```html
<button class="-m-2 flex h-11 w-11 items-center justify-center rounded">
  <svg class="h-4 w-4">…</svg>
</button>
```

---

## 12. Radius scale and concentric corners

| Class | Value | Applies to |
|---|---|---|
| `rounded-sm` | 8px | Chips, tags, checkboxes, small icon tiles, badges |
| `rounded` | 14px | Buttons, inputs, list rows, small cards, segment thumbs |
| `rounded-lg` | 20px | Cards, panels, dropdowns, popovers |
| `rounded-xl` | 28px | Modals, sheets, large containers, device frames |
| `rounded-full` | — | Pills, avatars, switches, status dots, progress tracks |

### The concentric rule

**A nested element always uses one step smaller than its parent. Never the same.**

```
rounded-xl  (28)  modal
└ rounded-lg (20)  card inside it
  └ rounded  (14)  row inside the card
    └ rounded-sm (8) chip inside the row
```

Repeating a radius on parent and child is the single most reliable tell of a templated Tailwind
build — `rounded-lg` on the card, `rounded-lg` on the button inside it, `rounded-lg` on the badge
inside that. The corners visually collide and the hierarchy flattens.

### The optical rule

The precise version: **child radius ≈ parent radius − parent padding.**

A `rounded-xl` (28px) container with `p-4` (16px) wants a child at ~12px, so `rounded` (14px) is
the closest step. A `rounded-lg` (20px) card with `p-1` (4px) — a segmented control — wants
~16px, so `rounded` (14px) again. This is why the scale steps are 8 / 14 / 20 / 28 rather than
evenly spaced: the gaps match common padding values.

### Edge-attached surfaces

A bottom sheet rounds only the corners that are not touching an edge:

```html
<div class="rounded-t-xl">   <!-- bottom sheet: top corners only -->
<div class="rounded-l-xl">   <!-- right side panel: left corners only -->
```

---

## 13. Elevation model

Five levels. Each is a combination of surface, border and shadow — never one alone.

| Level | Surface | Border | Shadow | Examples |
|---|---|---|---|---|
| **0 — Ground** | `bg-canvas` | none | none | Root background |
| **1 — Structural** | `bg-surface-1` | `border-line/10` | none | Sidebars, rails, inset wells, progress tracks |
| **2 — Content** | `bg-surface-2` | `border-line/10` | `shadow-sm` | Cards, list groups, table bodies |
| **3 — Raised** | `bg-surface-3` | `border-line/10` | `shadow-sm` → `shadow` on hover | Inputs, popovers, dropdowns, hovered rows |
| **4 — Overlay** | `bg-surface-4` | `border-line/10` | `shadow-lg` | Modals, sheets, menus, active segment thumbs |

### Order of reach

1. **Surface step.** Move up one level. This alone is often enough.
2. **Hairline border.** `border-line/10`. Cheap, crisp, works in both themes.
3. **Shadow.** Only when the element genuinely floats above content that scrolls under it.

A card that is `bg-surface-2` with `border-line/10` and no shadow is a perfectly good card. Adding
a shadow to everything is how a design becomes the SaaS-card kit.

### Never skip levels

A modal (4) sitting directly on the canvas (0) with nothing between is fine, because the scrim
supplies the missing steps. But a card (2) containing a card (2) is wrong — the inner one must be
3, or it must not be a card at all.

### Interactive elevation

| State | Change |
|---|---|
| Rest | Level 2 |
| Hover | Level 3, `shadow-sm` → `shadow` |
| Active / pressed | Back to level 2, `active:scale-[0.97]` |
| Selected | Level 3 + `border-accent/40` or a `border-l-2 border-accent` rule |
| Disabled | Level 2, `text-ink-4`, `cursor-not-allowed`, no hover |

Note: hover moves a surface step, it does **not** change hue. A row that turns blue on hover is a
website; a row that lifts one surface step is an OS.

---

## 14. Materials

### 14.1 Frosted chrome

The single most OS-specific effect available on the web.

```html
<header class="sticky top-0 z-sticky border-b border-line/10
               bg-surface-3/72 backdrop-blur-sm backdrop-saturate-150">
```

| Parameter | Value | Why |
|---|---|---|
| Blur | `backdrop-blur-sm` (30px) | Below ~20px it reads as a bug; above ~40px it reads as frosted glass in a shower |
| Opacity | `/72` | Below 60% the text on the bar loses contrast; above 85% the blur is invisible |
| Saturation | `backdrop-saturate-150` | Essential in light mode, harmless in dark |
| Border | `border-line/10` on the content-facing edge | Defines the boundary the blur cannot |

**Use it for:** top bars, bottom tab bars, sheet headers, floating toolbars, command palettes,
context menus, control panels.

**Do not use it for:** cards, list rows, page content, anything that does not float over
scrolling content. A blurred card over a static background is doing nothing but costing GPU.

### 14.2 Scrims

| Purpose | Class |
|---|---|
| Modal backdrop | `bg-black/55 backdrop-blur-xs` |
| Sheet backdrop (phone) | `bg-black/50` |
| Popover backdrop (invisible, click-to-close) | `bg-transparent` |

Scrims are black in both themes. A light-mode scrim made of white does not read as "behind" —
it reads as a wash. This is the one place where black is correct in light mode.

### 14.3 Dividers

| Class | Use |
|---|---|
| `divide-y divide-line/5` | Dense table rows |
| `divide-y divide-line/10` | List rows, settings groups |
| `border-line/10` | Between structural regions (sidebar/main) |
| `border-line/15` | Where a divider must be noticed (a group boundary inside a list) |

Inset dividers — a divider that starts after the row's icon rather than at the container edge —
are an iOS convention worth borrowing for icon lists:

```html
<div class="pl-12"><div class="h-px bg-line/10"></div></div>
```

### 14.4 Grabber handles

Bottom sheets get a handle. It is a visual affordance even when the sheet is not draggable.

```html
<div class="mx-auto h-1 w-10 rounded-full bg-line/20"></div>
```

---

## 15. Typography

### 15.1 The scale

| Role | Classes | Size | Use |
|---|---|---|---|
| Display | `text-3xl font-bold tracking-tight` | 30px | Screen title — **one per screen** |
| Title | `text-xl font-semibold tracking-tight` | 20px | Section headers, modal titles, sheet titles |
| Body | `text-base` | 16px | Default reading text, row labels |
| Body strong | `text-base font-medium` | 16px | Row labels that carry a value beside them |
| Subtext | `text-sm text-ink-2` | 14px | Helper text, descriptions, secondary rows |
| Micro | `text-xs text-ink-3 font-medium` | 12px | Timestamps, counters, table headers, tab labels |

Do not invent sizes between these. If something needs to be "a bit bigger", it is probably the
next role up.

### 15.2 The system font stack

```
-apple-system, BlinkMacSystemFont, 'SF Pro Text',
'Segoe UI Variable', 'Segoe UI', Roboto, Inter, sans-serif
```

This resolves to San Francisco on Apple platforms, Segoe UI Variable on Windows 11, Roboto on
Android, and Inter as a web fallback. The interface renders in the same face as the OS chrome
around it — the cheapest and strongest native cue in the entire system.

**Do not load a webfont for UI text.** A custom face immediately reads as "brand", which is the
opposite of "system". Reserve webfonts for a logo or a marketing surface, never for the app.

### 15.3 Weight, spacing, rhythm

| Property | Rule |
|---|---|
| Weight | 400 body · 500 emphasis and row labels · 600 titles · 700 display. Never 300 or lighter — thin weights collapse on dark backgrounds. |
| Tracking | `tracking-tight` on `text-xl` and up. Default below. Never `tracking-wide` on body text. |
| Leading | Default Tailwind leading is correct for UI. `leading-relaxed` only on paragraphs over three lines. |
| Line length | `max-w-prose` (68ch) on any real paragraph. |
| Alignment | Left, always. No centred body copy, no justified text. Centre only a single line in an empty state or a modal. |

### 15.4 Hierarchy comes from weight and tier

Never fake hierarchy with colour. A blue heading, a coloured "link" in the middle of a
paragraph, a green number to mean "good" — all of these break the one-accent rule and stop
working the moment the palette changes.

```html
<!-- correct -->
<p class="text-base font-medium">Storage plan</p>
<p class="text-sm text-ink-2">200 GB, renews 12 October</p>

<!-- wrong -->
<p class="text-base text-accent">Storage plan</p>
<p class="text-sm text-ink-3">200 GB, renews 12 October</p>
```

### 15.5 Numbers

```html
<span class="font-mono tabular-nums text-sm text-ink-2">84.2 GB</span>
```

Monospace with tabular figures for anything in a column — file sizes, prices, counts, durations,
percentages. Right-align numeric table columns. Proportional figures in a table cause the digits
to shimmer as values update.

### 15.6 Truncation

Every text node that can receive unbounded content needs a truncation strategy, and the flex
parent needs `min-w-0` or truncation silently does nothing.

```html
<div class="flex min-w-0 items-center gap-3">
  <p class="truncate text-sm font-medium">A very long device name that will not fit</p>
  <span class="ml-auto shrink-0 text-xs text-ink-3">2 min ago</span>
</div>
```

Two lines: `line-clamp-2`. Never clamp a heading — shorten the heading instead.

---

## 16. Iconography

### 16.1 Specification

| Property | Value |
|---|---|
| Style | Outline, single stroke |
| Stroke width | `stroke-width="2"` at 24px viewBox, `1.75` at 20px |
| Corners | `stroke-linecap="round" stroke-linejoin="round"` |
| Colour | `currentColor`, always — never a hardcoded fill |
| Library | Lucide, Phosphor (regular), Heroicons (outline). Pick one and never mix. |

Filled icons are permitted in exactly one place: the **active** item in a bottom tab bar or rail,
where the fill is the selection signal.

### 16.2 Size scale

| Context | Class | px |
|---|---|---|
| Inside a chip or badge | `h-3 w-3` | 12 |
| Inline with `text-sm`, table actions | `h-4 w-4` | 16 |
| List row leading icon, buttons | `h-5 w-5` | 20 |
| Tab bar, rail, empty state | `h-6 w-6` | 24 |
| Empty-state hero | `h-8 w-8` | 32 |

### 16.3 Icon tiles

A leading icon in a settings row sits in a tile, not loose against the text:

```html
<!-- accent tile: the row's category identity -->
<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent/12 text-accent">
  <svg class="h-4 w-4">…</svg>
</div>

<!-- neutral tile: everything else -->
<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm
            border border-line/10 bg-surface-4 text-ink-2">
  <svg class="h-4 w-4">…</svg>
</div>
```

Tile radius is `rounded-sm` inside a `rounded` row inside a `rounded-lg` card — the concentric
rule again.

### 16.4 Alignment

Icons optically centre slightly high next to text. If an icon looks low beside a label, nudge it
`-mt-px`. Always `shrink-0` on an icon inside a flex row, or it compresses when the label is long.

---

## 17. Motion

### 17.1 The spec

```
duration:  150–300ms  (default 200)
easing:    cubic-bezier(0.32, 0.72, 0, 1)   →  ease-spring
```

`ease-spring` is fast out of the gate with a long settle. It is the closest single cubic-bezier
to the iOS and One UI feel, and after the frosted blur it is the strongest native cue available.
The default `ease-in-out` reads as "web transition" immediately.

### 17.2 Durations by interaction

| Interaction | Duration | Easing |
|---|---|---|
| Hover, focus, colour change | 120ms | `ease-spring` |
| Press feedback | 100ms | `ease-spring` |
| Toggle, checkbox, segment | 200ms | `ease-spring` |
| Row expand / collapse | 300ms | `ease-spring` |
| Modal open | 200ms | `ease-spring` |
| Modal close | 150ms | `ease-exit` |
| Sheet open | 300ms | `ease-spring` |
| Sheet close | 200ms | `ease-exit` |
| Page / pane transition | 250ms | `ease-spring` |
| Toast in | 200ms | `ease-spring` |

Dismissals are always faster than entrances, and use `ease-exit` (`cubic-bezier(0.4, 0, 1, 1)`).
Something arriving should feel considered; something leaving should just go.

### 17.3 Patterns

```html
<!-- press -->
class="transition-all duration-200 ease-spring active:scale-[0.97]"

<!-- hover lift -->
class="transition-all duration-200 ease-spring hover:bg-surface-3 hover:shadow"

<!-- bottom sheet -->
class="translate-y-full transition-transform duration-slow ease-spring
       data-[open=true]:translate-y-0"

<!-- centred modal -->
class="scale-95 opacity-0 transition-all duration-200 ease-spring
       data-[open=true]:scale-100 data-[open=true]:opacity-100"

<!-- side panel -->
class="translate-x-full transition-transform duration-slow ease-spring
       data-[open=true]:translate-x-0"

<!-- expanding row: grid-rows trick, animates to auto height -->
class="grid grid-rows-[0fr] transition-all duration-slow ease-spring
       data-[open=true]:grid-rows-[1fr]"
<!-- the child needs overflow-hidden -->
```

The `grid-rows-[0fr] → [1fr]` technique is the only reliable way to animate to an unknown height
without measuring in JavaScript. The inner wrapper must have `overflow-hidden`.

### 17.4 What never moves

- Nothing animates on scroll. No fade-ups, no parallax, no reveal-on-intersect.
- No staggered entrance of cards or list items on page load.
- No decorative `animate-pulse` / `animate-bounce` / `animate-spin` except a genuine loading
  spinner or a skeleton.
- No looping animation anywhere in the interface.
- No hover animation on a non-interactive element.

### 17.5 One orchestrated moment per flow

If a flow deserves a designed moment — a success confirmation, a first-run welcome — give it
**one**, and keep everything around it still. A checkmark that draws itself once after a payment
succeeds is memorable. The same energy spread across every card entrance is noise.

### 17.6 Reduced motion

The `prefers-reduced-motion` block in §8 reduces every duration to 1ms. Verify the interface is
still fully usable and comprehensible with it enabled — in particular, that a sheet still appears
and disappears rather than getting stuck mid-transition.

---

# Part IV — Layout

## 18. Responsive system — 320px to 3840px

One adaptive system covering every device from a 5-inch phone to a 40-inch display. Unprefixed
utilities target the **320px** floor; prefixes layer upward.

Three things break a design across that range, and they are independent problems:

| Problem | Symptom | Lever |
|---|---|---|
| Too little **width** | Overflow, clipped labels, horizontal scroll | The width ladder (§18.2) |
| Too little **height** | Phone landscape gets a tablet layout in 430px of height | Height guards (§18.3) |
| Too much **space** | 200-character line lengths, or 1300px of dead canvas either side | Large-display strategy (§18.5) |

Solving only the first is why most "responsive" builds still break on a phone turned sideways and
on a 40-inch monitor.

### 18.1 The device contract

Every row below is a real device at its real CSS viewport. If any of them breaks, the system has
failed — this table is the definition of "no broken UI".

| Device | Physical | CSS viewport | Tier | Composition |
|---|---|---|---|---|
| iPhone SE (1st), budget Android | 4–5″ | **320 × 568** | *(none)* | Single column, tab bar |
| 5″ Android | 5.0″ | **360 × 640** | `xs` | Single column, tab bar |
| iPhone 13 mini | 5.4″ | **375 × 812** | `xs` | Single column, tab bar |
| iPhone 15 / Pixel 8 | 6.1″ | **393 × 852** | `xs` | Single column, tab bar |
| Pixel 8 Pro / S24 Ultra | 6.7″ | **412 × 892** | `xs` | Single column, tab bar |
| iPhone 15 Pro Max | 6.7″ | **430 × 932** | `xs` | Single column, tab bar |
| **Phone, landscape** | 6.1–6.7″ | **852 × 393**, **932 × 430** | `md` + `short` | **Single column + left rail.** Never a split pane |
| 7″ tablet | 7″ | **600 × 960** | `md` + `tall` | Single column, wider gutters |
| iPad mini | 8.3″ | **744 × 1133** | `md` + `tall` | Two panes |
| iPad Split View (½) | — | **507 × 1024** | `sm` + `tall` | Single column |
| iPad Split View (⅓) | — | **375 × 1024** | *(none)* | Single column — phone layout, correctly |
| iPad Air portrait | 10.9″ | **820 × 1180** | `md` + `tall` | Two panes |
| iPad Air landscape | 10.9″ | **1180 × 820** | `lg` + `tall` | Rail + two panes |
| iPad Pro portrait | 12.9″ | **1024 × 1366** | `lg` + `tall` | Rail + two panes |
| iPad Pro landscape | 12.9″ | **1366 × 1024** | `lg` + `tall` | Rail + two panes |
| Laptop, common Windows | 14–15″ | **1366 × 768** | `lg` + `tall` | Rail + two panes, **short height** |
| MacBook Air / Pro 13″ | 13.6″ | **1280 × 800** | `lg` + `tall` | Rail + two panes |
| MacBook Pro 16″ | 16.2″ | **1728 × 1117** | `xl` | Rail + sidebar + main + inspector |
| **24″ desktop** | 24″ | **1920 × 1080** | `2xl` | Four regions, 3-column content grid |
| 27″ QHD | 27″ | **2560 × 1440** | `3xl` | Four regions, 4-column grid, root +1px |
| Ultrawide | 34″ | **3440 × 1440** | `3xl` | Four regions, 5-column grid |
| **40″ 4K @ 100%** | 40″ | **3840 × 2160** | `4xl` | Four regions + secondary column, 6-column grid, root +2px |
| 40″ 4K @ 150% | 40″ | **2560 × 1440** | `3xl` | Same as 27″ QHD |

Two entries deserve attention because they are the ones that actually break real builds:

- **Phone landscape at 932 × 430.** By width alone this is `md:` territory and would receive the
  tablet split-pane. In 430px of height, a two-pane layout with a top bar and a tab bar leaves
  roughly 280px of content. Fixed with height guards (§18.3).
- **1366 × 768.** Still one of the most common laptop resolutions in the world. It is `lg:` by
  width but only 768px tall — a `h-dvh` three-pane shell with 24px section spacing runs out of
  vertical room. Verify it explicitly.

### 18.2 The width ladder

| Tier | Min width | Device class | What changes |
|---|---|---|---|
| *(none)* | **320** | 5″ phone, iPad ⅓ Split View | Single column · `px-4` full-bleed · bottom tab bar · `min-h-11` targets · `p-4` content · `text-base` |
| `xs:` | **360** | 5–6.7″ phone | Same structure. `xs:px-4` stays; slightly looser vertical rhythm |
| `sm:` | **480** | Large phone, phone landscape | Two-column card grids become possible · `sm:px-5` |
| `md:` | **768** | Small tablet, Split View half | **Split** (with `tall`) · `md:w-64` master list · tab bar → sidebar |
| `lg:` | **1024** | Tablet landscape, 13–15″ laptop | Icon rail `lg:w-[72px]` + sidebar `lg:w-72` + main · `lg:max-w-shell` on prose |
| `xl:` | **1440** | 16″ laptop | **Third pane** — inspector `xl:w-80` |
| `2xl:` | **1920** | 24″ desktop | Content grid to 3 columns · tables reveal secondary columns |
| `3xl:` | **2560** | 27–32″, ultrawide | 4–5 column grid · optional root size +1px |
| `4xl:` | **3200** | 40″ 4K at 100% | **Fourth region** · 6-column grid · optional root size +2px |

Thresholds are set where a **composition** changes, not at round numbers. 768 is where a second
pane first fits; 1024 is where a rail fits beside it; 1440 is where a third pane fits; 1920 is
where a fixed three-pane shell leaves enough main-pane width to subdivide.

### 18.3 Height and pointer guards

```js
tall:  { raw: '(min-height: 560px)' },
short: { raw: '(max-height: 559px)' },
touch: { raw: '(pointer: coarse)' },
fine:  { raw: '(pointer: fine)' },
```

Tailwind stacks variants, so `md:tall:flex-row` emits a nested media query — valid CSS,
universally supported.

**The split-pane rule.** Never split on width alone:

```html
<!-- wrong: a phone in landscape gets two panes in 430px of height -->
<div class="flex flex-col md:flex-row">

<!-- right: panes only when there is vertical room -->
<div class="flex flex-col md:tall:flex-row">
```

**The short-viewport rule.** Below 560px of height, vertical chrome is the scarcest resource.
Collapse it rather than compressing the content:

```html
<!-- bottom tab bar becomes a left rail when the viewport is short -->
<nav class="fixed inset-x-0 bottom-0 flex flex-row justify-around
            short:inset-x-auto short:inset-y-0 short:left-0 short:w-16 short:flex-col
            md:tall:hidden">
```

Also at `short:`: drop the display heading from `text-3xl` to `text-xl`, drop section spacing
from `mt-8` to `mt-4`, and hide the top bar's subtitle line. Three changes recover about 90px of
vertical space, which is the difference between usable and not.

**The pointer rule.** A 1366 × 768 touchscreen laptop is `lg:` **and** `touch:`. Hover-revealed
row actions must stay visible there:

```html
<div class="opacity-0 group-hover:opacity-100 touch:opacity-100
            transition-opacity duration-200 ease-spring">
```

Never assume "large screen" means "mouse". Never assume "small screen" means "touch" either — a
resized desktop window is 400px wide with a mouse.

### 18.4 The recomposition ladder

```
320–767                768–1023              1024–1439
┌──────────────┐      ┌────────┬────────┐   ┌──┬───────┬──────────┐
│   top bar    │      │ master │ detail │   │  │ side  │   main   │
├──────────────┤      │  list  │        │   │ra│ bar   │          │
│              │      │  256   │        │   │il│ 288   │          │
│   content    │      │        │        │   │72│       │          │
│  (1 column)  │      │        │        │   │  │       │          │
├──────────────┤      │        │        │   │  │       │          │
│   tab bar    │      └────────┴────────┘   └──┴───────┴──────────┘
└──────────────┘

1440–1919                          1920–2559
┌──┬───────┬──────────┬────────┐  ┌──┬───────┬────────────────────┬────────┐
│  │ side  │   main   │inspect │  │  │ side  │  ┌────┐┌────┐┌────┐│inspect │
│ra│ bar   │          │  or    │  │ra│ bar   │  └────┘└────┘└────┘│  or    │
│il│ 288   │          │  320   │  │il│ 288   │  ┌────┐┌────┐┌────┐│  380   │
│72│       │          │        │  │72│       │  └────┘└────┘└────┘│        │
└──┴───────┴──────────┴────────┘  └──┴───────┴────────────────────┴────────┘
                                              main subdivides into columns

3200+  (40" 4K)
┌──┬───────┬─────────────────────────────────────────────┬────────┬────────┐
│  │ side  │ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐        │ detail │ activity│
│ra│ bar   │ └────┘└────┘└────┘└────┘└────┘└────┘        │  400   │   340   │
│il│ 288   │ ┌─────────────────────────────────────────┐ │        │         │
│72│       │ │ table — secondary columns now revealed  │ │        │         │
│  │       │ └─────────────────────────────────────────┘ │        │         │
└──┴───────┴─────────────────────────────────────────────┴────────┴────────┘
  fixed     fixed          fluid, subdivides               fixed    fixed
```

Chrome widths are **fixed at every size above 1024**. A rail is 72px because that is the
ergonomic size of a 40px target with padding, not because it is 5% of something. Only the main
pane is fluid, and it absorbs extra width by **subdividing**, never by stretching.

```html
<div class="flex flex-col md:tall:flex-row md:tall:h-dvh md:tall:overflow-hidden">

  <!-- rail: fixed 72, appears at lg -->
  <aside class="hidden lg:flex lg:w-[72px] lg:shrink-0 lg:flex-col
                lg:border-r lg:border-line/10 lg:bg-surface-1">…</aside>

  <!-- sidebar: 256 at md, 288 at lg, never grows again -->
  <aside class="hidden md:tall:flex md:w-64 lg:w-72 md:shrink-0 md:flex-col
                md:border-r md:border-line/10 md:bg-surface-1">…</aside>

  <!-- main: the only fluid region -->
  <main class="min-w-0 flex-1 overflow-y-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-6 gap-4 p-4 lg:p-6">
      …
    </div>
  </main>

  <!-- inspector: 320 at xl, 380 at 2xl -->
  <aside class="hidden xl:block xl:w-80 2xl:w-[380px] xl:shrink-0
                xl:border-l xl:border-line/10 xl:bg-surface-1">…</aside>

  <!-- fourth region: 40" only -->
  <aside class="hidden 4xl:block 4xl:w-[340px] 4xl:shrink-0
                4xl:border-l 4xl:border-line/10 4xl:bg-surface-1">…</aside>
</div>
```

`min-w-0` on the fluid child is mandatory. Without it a long word or a wide table pushes the pane
past the viewport and the whole shell scrolls sideways — the single most common large-screen bug.

### 18.5 Large displays: 24″, 32″, 40″

At 1920px and beyond there are two *separate* problems, and conflating them is why big-screen
layouts go wrong.

| Problem | Cause | Wrong fix | Right fix |
|---|---|---|---|
| **More space** | The viewport got wider | Stretch content to fill | Add panes, add grid columns |
| **More distance** | 40″ sits ~85cm away vs ~55cm for a laptop | Bump every `text-*` with `3xl:` prefixes | One root font-size step |

**Space: the shell fills, the content subdivides.**

The forbidden option is `max-w-[1200px] mx-auto` on a 3840px display. That leaves 1320px of empty
canvas on each side, which is exactly the "boxed webpage floating on a wallpaper" anti-pattern.
The interface must fill the display, the way a maximised Finder or Explorer window does.

The mechanism is progressive subdivision:

| Content | 1440 | 1920 | 2560 | 3840 |
|---|---|---|---|---|
| Card grid | 2 col | 3 col | 4 col | 6 col |
| Stat row | 3 across | 4 across | 6 across | 8 across |
| Table columns | 5 visible | 7 visible | 9 visible | all visible |
| Panes | 3 | 3 | 3 | 4 |
| Prose column | capped 68ch | capped 68ch | capped 68ch | capped 68ch |

**Tables gain columns, not width.** Reverse progressive disclosure: secondary columns hidden on
small screens reappear as space allows, rather than existing columns growing to 400px each.

```html
<th class="hidden 2xl:table-cell px-3 py-2 text-xs font-medium text-ink-3">Last sync</th>
<th class="hidden 3xl:table-cell px-3 py-2 text-xs font-medium text-ink-3">OS version</th>
<th class="hidden 4xl:table-cell px-3 py-2 text-xs font-medium text-ink-3">IP address</th>
```

**Prose is capped but never centred alone.** A reading column stays at `max-w-prose` (68ch). On a
40″ display, do not centre it in 3800px of nothing — pair it with a persistent contents pane on
one side and a related-items pane on the other, so every region of the display is doing work:

```html
<main class="min-w-0 flex-1 overflow-y-auto">
  <div class="mx-auto flex max-w-[1400px] gap-8 p-6 4xl:max-w-none">
    <nav class="hidden 2xl:block 2xl:w-56 2xl:shrink-0">…contents…</nav>
    <article class="min-w-0 max-w-prose flex-1">…</article>
  </div>
</main>
```

**Distance: one root step, opt-in.**

A 40″ 4K panel is roughly 110 PPI — about the same physical pixel size as a 24″ 1080p monitor —
but it is typically viewed from further away. If the product will be used at desk distance on a
large panel, step the root size once. Because Tailwind's spacing scale is rem-based, this scales
type, padding, radii and gaps together, proportionally, which is the correct behaviour.

```css
/* tokens.css — optional, opt-in per product */
@media (min-width: 2560px) { :root { font-size: 17px; } }
@media (min-width: 3200px) { :root { font-size: 18px; } }
```

Two cautions. Do not go past 18px — beyond that the interface reads as a kiosk. And do not
combine this with `3xl:text-lg` prefixes scattered through components; pick one mechanism. The
root step is the one that stays consistent.

**Ultrawide (3440 × 1440).** Wide but not tall. Add horizontal regions and grid columns; do not
add anything that consumes vertical space. A four-region shell at 1440px of height is
comfortable; a stacked header plus four regions is not.

### 18.6 The 320px floor

`320 × 568` is the real floor, not 360. It covers the iPhone SE 1st generation, a large number of
budget Android devices still in service, and — importantly — the ⅓ Split View pane on any iPad,
which is 375px and behaves like a small phone.

What breaks at 320 and how to fix it:

| Breaks | Fix |
|---|---|
| A row with icon tile + two-line label + value + chevron | `min-w-0` + `truncate` on the label block, `shrink-0` on everything else |
| `px-4` gutters plus a 44px target on each side | Icon buttons use `-m-2` negative margin so the hit area overlaps the gutter |
| Five tab-bar items with labels | Four maximum below `xs:`; the fifth moves into "More" |
| A modal at `max-w-md` with `p-6` | `p-4` below `sm:`; `p-6` from `sm:` up |
| Numbers like "1,284.55 GB" in a table | `font-mono tabular-nums` + `text-xs` below `xs:` |
| Two buttons side by side | `flex-col sm:flex-row` — stack them |
| A segmented control with three labels | Shorten labels, or switch to a `select` below `xs:` |

Verify at 320 with the longest realistic content, not with "Device 1". Long names are where 320
actually fails.

### 18.7 Rules at every size

- **Build 320 first, then 1920, then fill in between.** The two extremes are where the structure
  is decided; everything else is interpolation. Building only at 1440 guarantees both ends break.
- **Never hide functionality to make something fit.** Relocate it — into a sheet, a menu, a "More"
  tab. Hiding is only allowed in the reverse direction: revealing *extra* columns and panes as
  space becomes available.
- **Chrome is fixed-width above 1024.** Rails, sidebars and inspectors never scale with the
  viewport. Only the main pane is fluid.
- **No horizontal page scroll, ever.** Wide content (tables, code, charts) scrolls inside its own
  `overflow-x-auto` container.
- **Full-bleed on phone.** `px-4`, no side margins, no card floating on a page background.
- **Safe areas.** `pb-[max(0.5rem,env(safe-area-inset-bottom))]` on the tab bar,
  `pt-[env(safe-area-inset-top)]` on fixed top chrome, plus `viewport-fit=cover`.
- **Use `dvh`, not `vh`.** `h-dvh` accounts for the mobile URL bar; `h-screen` (`100vh`) leaves
  content behind it.
- **Test both orientations on every phone and tablet size.** Orientation is a different layout
  problem from width, and it is where most builds break.

### 18.8 Container queries

Where a component appears in panes of different widths — a card that sits in both the 1200px main
pane and the 340px inspector — container queries are correct and viewport prefixes are not. This
matters much more once there are four regions, because the same card can be in a 2000px region or
a 340px one on the same screen.

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row @md:items-center">…</div>
</div>
```

Requires `@tailwindcss/container-queries`, or Tailwind v4 where it is built in. This is an allowed
exception to the "no plugins" preference, and on a four-region layout it is close to mandatory.

### 18.9 Testing matrix

Minimum set. Every one of these must render with no clipping, no horizontal page scroll, and no
element smaller than 44px that is meant to be tapped.

```
PHONE          320×568    360×640    375×812    393×852    412×892    430×932
PHONE LANDSCAPE           667×375    812×375    852×393    932×430
TABLET         600×960    744×1133   820×1180   1024×1366
TABLET LANDSCAPE          1133×744   1180×820   1366×1024
SPLIT VIEW     375×1024   507×1024   678×1024
LAPTOP         1280×800   1366×768   1512×982   1728×1117
DESKTOP        1920×1080  2560×1440
ULTRAWIDE      3440×1440
40" 4K         3840×2160
```

In Chrome DevTools, add 320×568, 932×430, 1366×768 and 3840×2160 as custom devices — those four
catch the overwhelming majority of real breakage. For 3840, set device pixel ratio to 1 and zoom
the DevTools pane to 50% so the whole viewport is visible at once.

---

## 19. Navigation patterns

### 19.1 By tier

| Device class | Primary nav | Secondary nav |
|---|---|---|
| Phone portrait (320–479) | Fixed bottom tab bar, 3–4 items at 320, up to 5 from `xs:` | Sheet, or a segmented control under the title |
| Phone landscape (`short:`) | **Left rail, 64px** — a bottom bar costs height the viewport does not have | Sheet |
| Tablet (`md:tall:`) | Sidebar `md:w-64` | Master list is itself the secondary nav |
| Laptop / desktop (`lg:`) | Icon rail 72px + sidebar 288px | Inspector pane, or tabs in the content header |
| 24″+ (`2xl:`) | Same rail + sidebar — **never wider** | Inspector, plus a contents pane inside main |
| 40″ (`4xl:`) | Same rail + sidebar | Inspector + a fourth activity region |

### 19.2 Bottom tab bar

```html
<nav class="fixed inset-x-0 bottom-0 z-chrome flex items-center justify-around
            border-t border-line/10 bg-surface-3/72 px-2 py-2
            pb-[max(0.5rem,env(safe-area-inset-bottom))]
            backdrop-blur-sm backdrop-saturate-150
            short:inset-x-auto short:inset-y-0 short:left-0 short:w-16 short:flex-col
            short:border-r short:border-t-0 short:py-4
            md:tall:hidden">
  <a class="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded text-accent">
    <svg class="h-5 w-5">…</svg>
    <span class="text-[10px] font-medium">Home</span>
  </a>
  <!-- inactive items: text-ink-3 -->
</nav>
```

- Three to five items. Five is the maximum; a sixth means the information architecture is wrong.
- Labels always visible. Icon-only tab bars fail for anyone who does not already know the app.
- Active state is accent colour plus a filled icon. No pill background, no underline.
- `md:hidden` — it is replaced by the sidebar, not kept alongside it.

### 19.3 Icon rail

```html
<aside class="hidden lg:flex lg:w-[72px] lg:shrink-0 lg:flex-col lg:items-center lg:gap-2
              lg:border-r lg:border-line/10 lg:bg-surface-1 lg:py-4">
  <button class="flex h-10 w-10 items-center justify-center rounded bg-surface-3 text-ink">…</button>
  <button class="flex h-10 w-10 items-center justify-center rounded text-ink-3
                 transition-all duration-200 ease-spring hover:bg-surface-2 hover:text-ink">…</button>
</aside>
```

Active item: `bg-surface-3 text-ink`. Not accent — the rail is chrome, and accent is reserved for
actions. Every rail item needs a tooltip or an `aria-label`.

### 19.4 Master–detail

The defining tablet and desktop pattern, and the reason `md:` is a real breakpoint rather than a
resize.

```html
<div class="flex flex-col md:flex-row md:h-dvh md:overflow-hidden">
  <!-- master: full screen on phone, fixed column from md -->
  <div class="md:w-80 md:shrink-0 md:overflow-y-auto md:border-r md:border-line/10 md:bg-surface-1">
    <div class="divide-y divide-line/5">
      <button class="flex w-full items-center gap-3 px-4 py-3 text-left
                     transition-all duration-200 ease-spring hover:bg-surface-2
                     data-[selected=true]:bg-surface-3">…</button>
    </div>
  </div>
  <!-- detail: a pushed route on phone, a pane from md -->
  <div class="min-w-0 flex-1 md:overflow-y-auto">…</div>
</div>
```

On phone the detail is a separate route with a back affordance. From `md:` both are visible and
selection updates the detail in place. Selected state is a surface step, not an accent fill.

### 19.5 Back and titles

- Phone: back chevron top-left, screen title centred or left-aligned below it. The chevron never
  moves between screens.
- Desktop: no back button. Navigation is the sidebar. A detail pane closes, it does not navigate
  back.
- Breadcrumbs are a website pattern. Use the sidebar's selected state instead.

---

## 20. Page archetypes

### 20.1 Settings screen

```
┌─────────────────────────────┐
│ ← Settings          [blur]  │  sticky, backdrop-blur-sm
├─────────────────────────────┤
│ Storage                     │  text-3xl font-bold
│ 156 GB of 200 GB used       │  text-sm text-ink-2
│                             │
│ ┌─────────────────────────┐ │  rounded-lg bg-surface-2
│ │ ▓▓▓▓▓▓░░░░░░░░░░░░░     │ │  meter
│ │ ● Photos        84 GB   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │  grouped list
│ │ Optimise photos     On  │ │  divide-y divide-line/10
│ │ Offload apps       Off  │ │
│ └─────────────────────────┘ │
│                             │
│ [ Upgrade storage ]         │  one accent action
├─────────────────────────────┤
│  ⌂      ⌕      ☺           │  tab bar, blur
└─────────────────────────────┘
```

### 20.2 Dashboard

Three stat cards across the top, one primary chart, one dense table below. Stat cards use
`text-3xl font-bold` for the value and `text-xs text-ink-3` for the label — the value is the
content, the label is metadata, and the size difference should be dramatic.

### 20.3 List + detail

Covered in §19.4.

### 20.4 Form / wizard

- One column, `max-w-prose`, even on desktop. Multi-column forms are slower to complete.
- Labels above inputs, never floating placeholders — a floating label disappears exactly when the
  person needs it.
- Group into `rounded-lg bg-surface-2` sections with a `text-xl font-semibold` header each.
- Primary action bottom-right on desktop, full-width fixed bottom on phone.
- Errors inline below the field, `text-sm text-danger`, plus `border-danger/50` on the field.

### 20.5 Empty screen

Centred in the pane, `max-w-[40ch]`: a 32px `text-ink-3` icon, a `text-xl font-semibold` line
saying what is missing, a `text-sm text-ink-2` line saying why, and one accent button that fixes
it. No illustration, no apology.

---

# Part V — Components

## 21. Component library

Every recipe below is identical in both themes. There is no `dark:` anywhere.

### 21.1 Buttons

```html
<!-- Primary — one per screen -->
<button class="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-accent px-4
               text-sm font-semibold text-accent-ink shadow-sm
               transition-all duration-200 ease-spring
               hover:brightness-105 active:scale-[0.97]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
               focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
               disabled:pointer-events-none disabled:bg-surface-3 disabled:text-ink-4 disabled:shadow-none">
  Save changes
</button>

<!-- Secondary -->
<button class="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line/10
               bg-surface-3 px-4 text-sm font-medium
               transition-all duration-200 ease-spring
               hover:bg-surface-4 active:scale-[0.97]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
               focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
  Cancel
</button>

<!-- Ghost -->
<button class="inline-flex min-h-11 items-center justify-center gap-2 rounded px-4
               text-sm font-medium text-ink-2
               transition-all duration-200 ease-spring
               hover:bg-surface-3 hover:text-ink active:scale-[0.97]">
  Learn more
</button>

<!-- Destructive -->
<button class="inline-flex min-h-11 items-center justify-center gap-2 rounded px-4
               text-sm font-semibold text-danger
               transition-all duration-200 ease-spring
               hover:bg-danger/10 active:scale-[0.97]">
  Delete
</button>

<!-- Icon button -->
<button aria-label="More options"
        class="flex h-11 w-11 items-center justify-center rounded text-ink-2
               transition-all duration-200 ease-spring hover:bg-surface-3 hover:text-ink
               active:scale-[0.97]">
  <svg class="h-5 w-5">…</svg>
</button>
```

**Sizes:** `min-h-11 px-4 text-sm` default · `min-h-9 px-3 text-sm` compact (toolbars) ·
`min-h-12 px-5 text-base` prominent (a single full-width phone CTA).

**Destructive actions never get the accent fill.** A red *fill* is reserved for a confirmed
destructive action inside a confirmation dialog. In-context, destructive is text-only.

### 21.2 Segmented control

```html
<div class="inline-flex rounded-full border border-line/10 bg-surface-1 p-1" role="tablist">
  <button role="tab" aria-selected="true"
          class="rounded-full bg-surface-4 px-4 py-2 text-sm font-medium text-ink shadow-sm
                 transition-all duration-200 ease-spring">Day</button>
  <button role="tab" aria-selected="false"
          class="rounded-full px-4 py-2 text-sm font-medium text-ink-2
                 transition-all duration-200 ease-spring">Week</button>
</div>
```

The thumb is `surface-4` + `shadow-sm` — it is an overlay-level element sitting in a
structural-level track. That two-level jump is what makes it look physical.

### 21.3 Switch

```html
<button role="switch" aria-checked="true"
        class="flex h-7 w-12 shrink-0 items-center rounded-full border border-accent bg-accent
               px-1 justify-end transition-all duration-200 ease-spring">
  <span class="block h-5 w-5 rounded-full bg-white shadow-sm"></span>
</button>

<!-- off state -->
<button role="switch" aria-checked="false"
        class="flex h-7 w-12 shrink-0 items-center rounded-full border border-line/15 bg-surface-1
               px-1 justify-start transition-all duration-200 ease-spring">
  <span class="block h-5 w-5 rounded-full bg-white shadow-sm"></span>
</button>
```

The thumb is `bg-white` in **both** themes — a physical object, not a themed surface. This is
correct; every OS does it.

### 21.4 Checkbox and radio

```html
<!-- checkbox, checked -->
<span class="flex h-5 w-5 items-center justify-center rounded-sm bg-accent text-accent-ink">
  <svg class="h-3 w-3" stroke-width="3"><path d="m5 13 4 4L19 7"/></svg>
</span>
<!-- unchecked -->
<span class="h-5 w-5 rounded-sm border border-line/20 bg-surface-3"></span>

<!-- radio, selected -->
<span class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent">
  <span class="h-2.5 w-2.5 rounded-full bg-accent"></span>
</span>
```

Checkbox is `rounded-sm`; radio is `rounded-full`. Never round a checkbox fully — the shape
distinction is how people know whether the choice is exclusive.

### 21.5 Inputs

```html
<label class="block">
  <span class="mb-1.5 block text-sm font-medium">Device name</span>
  <div class="flex items-center gap-2 rounded border border-line/10 bg-surface-3 px-3 py-2.5
              transition-all duration-200 ease-spring
              focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/25">
    <input class="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
           placeholder="Studio desktop">
  </div>
  <span class="mt-1.5 block text-xs text-ink-3">Shown on every synced device.</span>
</label>

<!-- error -->
<div class="… border-danger/50 ring-2 ring-danger/20">…</div>
<span class="mt-1.5 block text-xs text-danger">Name is already in use.</span>
```

The focus ring lives on the **wrapper**, not the input, so the icon and the field share one ring.
Placeholders are `text-ink-3`, never `ink-2` — a placeholder must be visibly lighter than a real
value or people mistake it for content.

**Never use floating labels.** They vanish exactly when the field is being filled.

### 21.6 Grouped list rows

The signature OS pattern. Rows live in a group, not as individual cards.

```html
<div class="divide-y divide-line/10 overflow-hidden rounded-lg border border-line/10 bg-surface-2">
  <div class="flex min-h-11 items-center gap-3 px-4 py-3">
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent/12 text-accent">
      <svg class="h-4 w-4">…</svg>
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-medium">Wi-Fi sync</p>
      <p class="truncate text-xs text-ink-3">Upload only on Wi-Fi</p>
    </div>
    <span class="ml-auto shrink-0 text-xs text-ink-3">On</span>
  </div>
  <!-- more rows -->
</div>
```

`overflow-hidden` on the group clips the first and last rows to the container radius — without
it, a hovered first row paints square corners over the rounded container. `divide-y` on the
group, never `border-b` on each row (which leaves a stray line at the bottom).

### 21.7 Cards

```html
<div class="rounded-lg border border-line/10 bg-surface-2 p-4 shadow-sm">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <p class="text-sm font-medium">Sync activity</p>
      <p class="mt-0.5 text-xs text-ink-3">Last seven days</p>
    </div>
    <button class="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-ink-3
                   transition-all duration-200 ease-spring hover:bg-surface-3 hover:text-ink">
      <svg class="h-4 w-4">…</svg>
    </button>
  </div>
  <div class="mt-4">…</div>
</div>
```

**Not every group of content is a card.** A screen made entirely of identical cards is the
templated look. Use a card when content genuinely needs to be separable from what surrounds it;
otherwise a heading and some spacing is enough.

### 21.8 Dropdown / menu

```html
<div class="min-w-[220px] overflow-hidden rounded-lg border border-line/10 bg-surface-4 p-1 shadow-lg">
  <button class="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-left text-sm
                 transition-all duration-200 ease-spring hover:bg-surface-3">
    <svg class="h-4 w-4 text-ink-3">…</svg>Rename
  </button>
  <div class="my-1 h-px bg-line/10"></div>
  <button class="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-left text-sm text-danger
                 transition-all duration-200 ease-spring hover:bg-danger/10">
    <svg class="h-4 w-4">…</svg>Delete
  </button>
</div>
```

`p-1` on the container with `rounded` items inside `rounded-lg` — the padding is what creates the
concentric relationship.

### 21.9 Modal (desktop)

```html
<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/55 p-4
            backdrop-blur-xs opacity-0 pointer-events-none transition-opacity duration-200 ease-spring
            data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto">
  <div role="dialog" aria-modal="true"
       class="w-full max-w-md scale-95 rounded-xl border border-line/10 bg-surface-4 p-6 shadow-lg
              transition-transform duration-200 ease-spring data-[open=true]:scale-100">
    <h2 class="text-xl font-semibold tracking-tight">Add a device</h2>
    <p class="mt-1 text-sm text-ink-2">Open the app on the new device and enter this code.</p>
    <div class="mt-4">…</div>
    <div class="mt-5 flex gap-2">
      <button class="min-h-11 flex-1 rounded border border-line/10 bg-surface-3 text-sm font-medium">Close</button>
      <button class="min-h-11 flex-1 rounded bg-accent text-sm font-semibold text-accent-ink">Copy code</button>
    </div>
  </div>
</div>
```

Escape closes. Backdrop click closes. Focus traps inside and returns to the trigger on close.

### 21.10 Bottom sheet (phone)

```html
<div class="fixed inset-x-0 bottom-0 z-modal translate-y-full rounded-t-xl border-t border-line/10
            bg-surface-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg
            transition-transform duration-slow ease-spring data-[open=true]:translate-y-0">
  <div class="mx-auto h-1 w-10 rounded-full bg-line/20"></div>
  <h2 class="mt-4 text-xl font-semibold tracking-tight">Choose a plan</h2>
  …
</div>
```

**Never stretch this across a desktop viewport.** At `md:` and up the same content becomes a
centred modal or a side panel. A full-width bottom sheet on a 1440px monitor is the clearest sign
a design was built phone-only and scaled.

### 21.11 Side panel (desktop)

```html
<div class="fixed inset-y-0 right-0 z-modal w-full max-w-md translate-x-full
            border-l border-line/10 bg-surface-4 shadow-lg
            transition-transform duration-slow ease-spring data-[open=true]:translate-x-0">
```

### 21.12 Toast

```html
<div class="fixed bottom-4 left-1/2 z-toast -translate-x-1/2
            md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
  <div class="flex items-center gap-3 rounded-lg border border-line/10 bg-surface-4 px-4 py-3 shadow-lg">
    <span class="h-2 w-2 shrink-0 rounded-full bg-success"></span>
    <p class="text-sm">Changes saved</p>
    <button class="ml-2 text-xs font-medium text-accent">Undo</button>
  </div>
</div>
```

Centred above the tab bar on phone, bottom-right on desktop. Four seconds, or until dismissed if
it carries an action. Never stack more than three.

### 21.13 Badge, chip, tag

```html
<span class="inline-flex items-center rounded-sm bg-surface-4 px-2 py-0.5
             font-mono text-xs text-ink-2 border border-line/10">4</span>

<span class="inline-flex items-center gap-1.5 rounded-sm bg-accent/12 px-2.5 py-1
             text-xs font-medium text-accent">Beta</span>

<span class="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1
             text-xs font-medium border border-line/10">
  <span class="h-1.5 w-1.5 rounded-full bg-success"></span>Active
</span>
```

### 21.14 Progress and meters

```html
<!-- single value -->
<div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-1">
  <div class="h-full rounded-full bg-accent transition-all duration-slow ease-spring" style="width:78%"></div>
</div>

<!-- segmented meter -->
<div class="flex h-2 overflow-hidden rounded-full bg-surface-1">
  <span class="w-[42%] bg-accent"></span>
  <span class="w-[1%]"></span>
  <span class="w-[21%] bg-success"></span>
</div>
```

The track is `surface-1` — an inset well, one level *below* the card holding it. That inversion is
what makes it read as carved in rather than sitting on.

### 21.15 Skeleton

```html
<div class="animate-pulse space-y-2">
  <div class="h-4 w-1/3 rounded-sm bg-line/8"></div>
  <div class="h-4 w-2/3 rounded-sm bg-line/8"></div>
</div>
```

The one sanctioned `animate-*` class. Skeletons mirror the real layout's shape — same number of
lines, same widths — or the transition to loaded content jumps.

### 21.16 Table

```html
<div class="overflow-hidden rounded-lg border border-line/10 bg-surface-2 shadow-sm">
  <div class="max-h-[420px] overflow-auto">
    <table class="w-full min-w-[640px] text-left">
      <thead class="sticky top-0 z-raised bg-surface-2">
        <tr class="border-b border-line/10">
          <th class="px-3 py-2 text-xs font-medium text-ink-3">Device</th>
          <th class="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
          <th class="px-3 py-2 text-right text-xs font-medium text-ink-3">Used</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line/5">
        <tr class="transition-colors duration-150 hover:bg-surface-3">
          <td class="px-3 py-2 text-sm">MacBook Pro</td>
          <td class="px-3 py-2">
            <span class="inline-flex items-center gap-1.5 text-xs text-ink-2">
              <span class="h-2 w-2 rounded-full bg-success"></span>Synced
            </span>
          </td>
          <td class="px-3 py-2 text-right font-mono tabular-nums text-sm text-ink-2">84.2 GB</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

`min-w-[640px]` plus `overflow-auto` means the table scrolls horizontally inside its container
rather than forcing the page sideways. The sticky header needs an explicit `bg-surface-2` or rows
show through it.

**No zebra striping.** `divide-line/5` is enough, and striping doubles the surface count for no
gain.

### 21.17 Tabs

```html
<div class="flex gap-1 border-b border-line/10">
  <button class="relative px-3 py-2.5 text-sm font-medium text-ink
                 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent">
    Overview
  </button>
  <button class="px-3 py-2.5 text-sm font-medium text-ink-2
                 transition-all duration-200 ease-spring hover:text-ink">
    Activity
  </button>
</div>
```

Tabs switch views inside a screen. A segmented control filters or scopes one view. They are not
interchangeable, and using tabs for filtering is a common IA mistake.

### 21.18 Avatar

```html
<img class="h-9 w-9 shrink-0 rounded-full border border-line/10 object-cover" alt="">

<!-- initials fallback -->
<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
             bg-surface-4 border border-line/10 text-xs font-semibold text-ink-2">JM</span>
```

Never colour-code avatar fallbacks by name hash — that introduces a dozen uncontrolled accent
colours, which is the one-accent rule broken at scale.

---

## 22. Density and enterprise views

### 22.1 Density changes padding only

| | Consumer | Dense |
|---|---|---|
| Row padding | `py-4 px-5` | `py-2 px-3` |
| Card padding | `p-5` | `p-4` |
| Gap between cards | `gap-4` | `gap-3` |
| Body size | `text-base` | `text-sm` |
| Metadata | `text-sm` | `text-xs` |

Colours, radii, borders, shadows and materials are **identical** in both. If your dense table has
different card colours from your settings screen, the system has forked.

### 22.2 Status in data views

```html
<span class="h-2 w-2 rounded-full bg-success"></span>          <!-- dot -->
<div class="border-l-2 border-warning">…</div>                  <!-- rule -->
<span class="text-danger">Failed</span>                         <!-- text -->
```

Never a full-bleed coloured banner. A row of green-filled cells in a table destroys the neutral
field the eye uses to scan. Status is a small mark on a neutral surface.

### 22.3 Enterprise specifics

- **Bulk selection.** A checkbox column, and a `surface-4` action bar that appears at the bottom
  when anything is selected — not a permanently visible toolbar.
- **Column sorting.** A `h-3 w-3` chevron beside the header label, `text-ink-3` inactive,
  `text-ink` active. Never colour the whole header.
- **Filters.** Chips above the table, each removable. A filter sheet on phone.
- **Pagination.** Bottom-right, `text-xs text-ink-3`, with `min-h-11` chevron buttons.
- **Row actions.** Icon buttons revealed on `group-hover` at `md:` and up; always visible on
  touch, because there is no hover.

---

## 23. Data visualisation

No gradients applies to charts too. This is the constraint people find hardest, and the solution
is the same as everywhere else: opacity steps of one flat colour.

### 23.1 Series colours

| Series | Fill |
|---|---|
| Primary | `bg-accent` |
| Secondary | `bg-accent/55` |
| Tertiary | `bg-accent/30` |
| Rest / baseline | `bg-line/10` |

For categorical data needing genuinely distinct colours, use the semantic tokens
(`success`, `warning`, `danger`, `accent`) — that is four categories, which is usually the right
maximum anyway. If you need more than four, the chart is doing too much.

### 23.2 Chart chrome

| Element | Treatment |
|---|---|
| Grid lines | `stroke-line/8`, horizontal only |
| Axis labels | `text-xs text-ink-3` |
| Axis lines | None. The grid implies them. |
| Tooltip | `rounded border border-line/10 bg-surface-4 px-3 py-2 shadow-lg` |
| Highlighted point/bar | Full `bg-accent`, others drop to `/30` |
| Area fill under a line | `fill-accent/12` — flat, not a gradient fade |
| Empty chart | Grid only, plus a centred `text-sm text-ink-3` line |

### 23.3 Bars

```html
<div class="flex h-24 items-end gap-1.5">
  <span class="h-[40%] w-full rounded-sm bg-accent/30"></span>
  <span class="h-[85%] w-full rounded-sm bg-accent"></span>
  <span class="h-[55%] w-full rounded-sm bg-accent/30"></span>
</div>
```

`rounded-sm` on the bar caps — the no-sharp-edges rule applies to data marks too. Highlight one
bar at full accent; the rest sit at `/30`. That single highlight replaces every gradient, glow
and drop shadow a chart would otherwise reach for.

---

## 24. Feedback states

### 24.1 Which pattern when

| Situation | Pattern |
|---|---|
| Action succeeded, no decision needed | Toast, 4s |
| Action succeeded, reversible | Toast with Undo, 8s |
| Persistent condition affecting the screen | Inline banner at the top of the content |
| Field-level problem | Inline text under the field |
| Destructive confirmation | Modal (desktop) / sheet (phone) |
| Nothing to show yet | Empty state |
| Loading known-shaped content | Skeleton |
| Loading unknown-shaped content | Spinner, centred, after 300ms |

### 24.2 Inline banner

```html
<div class="flex items-start gap-3 rounded-lg border-l-2 border-warning bg-surface-2 p-4">
  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning"></span>
  <div class="min-w-0">
    <p class="text-sm font-medium">Storage is nearly full</p>
    <p class="mt-0.5 text-sm text-ink-2">Uploads will stop at 200 GB. Free up space or upgrade.</p>
  </div>
  <button class="ml-auto shrink-0 text-sm font-medium text-accent">Upgrade</button>
</div>
```

A neutral `surface-2` body with a coloured left rule. Not a coloured background — a full-width
warning-yellow panel is a website alert, and at three of them a screen is unreadable.

### 24.3 Empty state

```html
<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
  <svg class="h-8 w-8 text-ink-3">…</svg>
  <p class="mt-4 text-xl font-semibold tracking-tight">No devices yet</p>
  <p class="mt-1 max-w-[40ch] text-sm text-ink-2">Add a device to start syncing files between them.</p>
  <button class="mt-5 min-h-11 rounded bg-accent px-4 text-sm font-semibold text-accent-ink">Add device</button>
</div>
```

An empty screen is an invitation to act. One icon, what is missing, why it matters, one button.
No illustration, no "Oops!", no apology.

### 24.4 Error state

```html
<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
  <span class="h-2 w-2 rounded-full bg-danger"></span>
  <p class="mt-4 text-xl font-semibold tracking-tight">Couldn't load devices</p>
  <p class="mt-1 max-w-[40ch] text-sm text-ink-2">The request timed out. Check the connection and try again.</p>
  <button class="mt-5 min-h-11 rounded border border-line/10 bg-surface-3 px-4 text-sm font-medium">Try again</button>
</div>
```

Say what happened and what to do. Errors do not apologise and they are never vague. "Something
went wrong" is not an error message.

---

# Part VI — Quality

## 25. Content and copywriting

Words are design content, not decoration. Bring the same minimalism to copy as to spacing.

| Rule | Bad | Good |
|---|---|---|
| Name the action | "Submit" | "Save changes" |
| Keep the name through the flow | "Publish" → "Successfully submitted" | "Publish" → "Published" |
| Sentence case | "Delete This Device" | "Delete this device" |
| Active voice | "The file was not uploaded" | "The upload failed" |
| User's vocabulary | "Configure webhook endpoints" | "Choose where to send alerts" |
| No filler | "Please note that you can optionally…" | "You can…" |
| Specific errors | "Something went wrong" | "The name is already in use" |
| Empty states invite | "No data available" | "No devices yet — add one to start syncing" |

**Never use ALL CAPS for labels.** It reads as shouting and it wrecks the type scale. Use
`text-xs font-medium text-ink-3` instead.

**Numbers in copy:** spell out one to nine in prose, use numerals in data. Always numerals with a
unit ("4 GB", not "four GB").

---

## 26. Accessibility

This is a floor, not a stretch goal. Every item is verified **in both themes**.

### 26.1 Contrast

| Content | Minimum | Where it usually fails |
|---|---|---|
| Body text | 4.5:1 | `ink-3` on light surfaces |
| Large text (≥18.66px bold / ≥24px) | 3:1 | — |
| UI component boundaries, icons | 3:1 | Hairlines at `/5` on light |
| Focus indicators | 3:1 vs adjacent | Accent ring on an accent button |
| Disabled | exempt | — |

Light mode is where semantic colours fail. `#34C77B` on white is 1.9:1 — invisible. Always verify
the light palette independently; do not assume a dark-passing colour passes light.

### 26.2 Focus

```html
class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
       focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
```

Use `focus-visible`, not `focus`, so a mouse click does not leave a ring. `ring-offset-canvas`
must match the actual background behind the element — on a card it is `ring-offset-surface-2`.
Never remove focus styling without replacing it.

### 26.3 Targets and gestures

- 44×44 minimum, including icon buttons in dense tables. Pad the hit area, do not grow the icon.
- Any swipe gesture has a visible equivalent. Swipe-to-delete also needs a menu item.
- No hover-only functionality. Touch has no hover; row actions must be reachable another way.

### 26.4 Semantics

```html
<button role="switch" aria-checked="true" aria-label="Wi-Fi sync">
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
<nav aria-label="Primary">
<table> <thead> <th scope="col">
```

- Real `<button>` for actions, real `<a href>` for navigation. Never a clickable `<div>`.
- Icon-only controls always carry `aria-label`.
- Modals trap focus, close on Escape, and return focus to the trigger.
- Status is never colour alone — pair every dot with a word.
- Live regions (`aria-live="polite"`) for toasts.

### 26.5 Motion and zoom

- `prefers-reduced-motion` honoured, and the interface is fully usable with it on.
- Text reflows at 200% zoom without horizontal scrolling.
- No `user-scalable=no` in the viewport meta.

---

## 27. Platform notes

### 27.1 Android webview

- `<meta name="theme-color">` per scheme, updated on manual theme change (§9.4). Without it the
  status bar stays white in dark mode.
- `overscroll-behavior-y: contain` on scroll containers to prevent pull-to-refresh firing inside
  a sheet.
- `-webkit-tap-highlight-color: transparent` (already in §8) — the default grey flash on tap is
  an instant "this is a webview" tell.
- `backdrop-blur` is supported in Chrome 76+, so it is safe on any current Android webview.
- `100vh` is wrong when the URL bar is visible. Use `100dvh` (`h-dvh`).
- Android phones report widths from 320 to 430 CSS px. Foldables report two: 344×882 folded,
  674×841 unfolded — the unfolded state is `md:` by width but nearly square, so guard the split
  with `tall:` and verify the fold transition does not remount the layout.

### 27.2 iOS Safari / WKWebView

- Safe areas: `env(safe-area-inset-bottom)` on the tab bar, `env(safe-area-inset-top)` on fixed
  top chrome. Requires `viewport-fit=cover` in the viewport meta.
- Momentum scrolling is default in modern iOS; `-webkit-overflow-scrolling` is no longer needed.
- Inputs below 16px trigger auto-zoom on focus. `text-base` (16px) is the minimum on any input.
- `position: fixed` inside a scrolling container is unreliable. Anchor fixed chrome to the
  viewport, not to a parent.
- Rubber-band overscroll shows the `body` background — `bg-canvas` on `body` (already in §8)
  means the reveal is the correct colour.
- iPad Split View and Stage Manager hand the app arbitrary widths — 375, 507, 678, 981 — with no
  orientation change and no reload. Every layout decision must come from CSS breakpoints or
  container queries, never from a width measured once at startup.
- Phone landscape is 393–430px **tall**. Test it; it is the most commonly broken viewport in
  production apps.

### 27.3 PWA / installed

```json
{
  "display": "standalone",
  "background_color": "#0A0B0D",
  "theme_color": "#0A0B0D"
}
```

`background_color` is the splash screen. Matching the dark canvas avoids a white flash on launch
for the majority of users, who will be in dark mode.

### 27.4 Windows / desktop browsers

- `Segoe UI Variable` resolves on Windows 11, `Segoe UI` on 10.
- Custom scrollbars (§8) matter more here; Windows scrollbars are visually heavy by default.
- Hover states are real. Everything in §13's interactive elevation table applies.

---

## 28. Performance

### 28.1 backdrop-blur is expensive

Each blurred element forces a compositor layer and a per-frame blur of everything behind it. Two
or three on screen is fine; twenty is a dropped-frame scroll on a mid-range Android.

- Use it only for floating chrome (§14.1).
- Never on list items, cards, or anything repeated.
- Never on an element inside a scroll container that also blurs.

### 28.2 Transitions

- `transition-all` is convenient but animates every property. On anything in a long list, name
  the properties: `transition-[background-color,transform]`.
- Animate `transform` and `opacity` only. Animating `width`, `height`, `top` or `margin` triggers
  layout on every frame.
- The `grid-rows-[0fr]→[1fr]` expand trick (§17.3) does trigger layout. It is acceptable for one
  expanding row; do not apply it to fifty simultaneously.

### 28.3 Long lists

Virtualise above ~200 rows. Keep the row markup shallow — the grouped-list recipe (§21.6) is
three elements deep, which is deliberate.

### 28.4 Tailwind build

- `content` globs must cover every file containing class names, or classes get purged in
  production and the app ships unstyled. Dynamically constructed class names
  (`` `bg-${color}` ``) are invisible to the scanner — always write full class strings.
- Production CSS for this system lands around 12–18 KB gzipped. If it is much larger, the
  `content` glob is too wide or arbitrary values are being generated at runtime.

---

## 29. Implementation guide

### 29.1 File structure

```
src/
  styles/
    tokens.css          ← the ONLY css file (§8)
  components/
    ui/
      Button.tsx
      Card.tsx
      ListRow.tsx
      Sheet.tsx
      Switch.tsx
      Toast.tsx
    …
  hooks/
    useTheme.ts         ← §9.5
tailwind.config.js      ← §7
```

One CSS file. If a second appears, the system is leaking.

### 29.2 Variant handling without a dependency

```jsx
const styles = {
  base: 'inline-flex min-h-11 items-center justify-center gap-2 rounded px-4 text-sm ' +
        'transition-all duration-200 ease-spring active:scale-[0.97] ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
        'focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  primary:   'bg-accent font-semibold text-accent-ink shadow-sm hover:brightness-105',
  secondary: 'border border-line/10 bg-surface-3 font-medium hover:bg-surface-4',
  ghost:     'font-medium text-ink-2 hover:bg-surface-3 hover:text-ink',
  danger:    'font-semibold text-danger hover:bg-danger/10',
};

export function Button({ variant = 'secondary', className = '', ...props }) {
  return <button className={`${styles.base} ${styles[variant]} ${className}`} {...props} />;
}
```

`clsx` and `tailwind-merge` are worth adding if consumers override classes; neither is required.

### 29.3 Next.js — no flash

```jsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
          } catch (e) {}
        ` }} />
      </head>
      <body className="bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required, because the script mutates the element before
React hydrates.

### 29.4 Tailwind v4

In v4 the config moves into CSS:

```css
@import "tailwindcss";

@theme {
  --color-canvas: rgb(var(--canvas));
  --color-surface-2: rgb(var(--surface-2));
  --radius: 14px;
  --radius-lg: 20px;
  --breakpoint-xs: 360px;
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
}
```

The token variables from §8 stay exactly as they are. The breakpoint-ordering problem in §7
disappears, since v4 sorts `--breakpoint-*` by value.

---

## 30. QA checklist

**Layout — the device contract (§18.1)**
- [ ] 320×568 renders with the longest realistic content, nothing clipped, no horizontal scroll
- [ ] 430×932 (6.7″ phone) comfortable, not stretched
- [ ] **932×430 (phone landscape)** does not get the tablet split-pane; tab bar became a rail
- [ ] 820×1180 and 1180×820 (iPad, both orientations) both compose correctly
- [ ] 375×1024 and 507×1024 (iPad Split View) get the phone and small-tablet layouts
- [ ] **1366×768** — three-pane shell fits in 768px of height
- [ ] 1920×1080 (24″) — shell fills the display, content grid at 3 columns
- [ ] 2560×1440 and 3440×1440 — 4–5 columns, no dead canvas
- [ ] **3840×2160 (40″)** — four regions, no centred 1200px column stranded in empty canvas
- [ ] No line of body text exceeds ~75 characters at any size
- [ ] Chrome (rail, sidebar, inspector) is the same pixel width at 1440 and at 3840
- [ ] Layout *recomposes* — panes and columns, not scaled padding and type
- [ ] No full-width bottom sheet on desktop
- [ ] Safe-area insets respected on notched devices
- [ ] `h-dvh` used, never `h-screen`

**Theme**
- [ ] No flash of the wrong theme on first paint
- [ ] Every screen checked in light and dark, including modals, sheets, toasts, empty and error states
- [ ] Zero `dark:` variants in component markup
- [ ] `color-scheme` set — scrollbars, caret, native controls all follow
- [ ] `theme-color` meta updates on manual theme change
- [ ] Theme control offers Auto, and Auto is the default

**Visual**
- [ ] Not one gradient anywhere in the codebase
- [ ] No `bg-black`, no full-white canvas
- [ ] Nested radii step down; no repeated radius on parent and child
- [ ] One accent, one primary action per screen
- [ ] Every container has a radius from the scale

**Motion**
- [ ] Motion only on interaction
- [ ] `prefers-reduced-motion` honoured and the interface still works
- [ ] Dismissals faster than entrances

**Accessibility**
- [ ] 4.5:1 body contrast verified in **both** themes
- [ ] Status colours verified on light surfaces specifically
- [ ] Visible `focus-visible` ring on every interactive element
- [ ] 44×44 targets throughout
- [ ] Status never communicated by colour alone
- [ ] Modals trap focus, close on Escape, restore focus on close

**Content**
- [ ] Buttons name their action; the name is consistent through the flow
- [ ] Sentence case everywhere, no ALL CAPS labels
- [ ] Errors say what happened and what to do
- [ ] Empty states offer an action

---

## 31. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `bg-surface-2/70` renders as nothing | Variable holds hex, not channels | `--surface-2: 27 29 33;` not `#1B1D21` |
| `xs:` styles win at desktop widths | `screens` extended instead of replaced | Replace the whole `screens` object (§7) |
| White flash on load | Theme script deferred or bundled | Inline it in `<head>` above the CSS (§9.2) |
| White scrollbar in dark mode | `color-scheme` missing | Add it to both `:root` blocks (§8) |
| White status bar on Android | `theme-color` missing or stale | §9.4 |
| Light mode looks washed out | Canvas is pure white, so nothing elevates | Canvas `#E9EAEE`, white only on `surface-4` |
| Light mode looks harsh | Dark shadows reused | Use the light shadow tokens (§6.6) |
| Frosted bar looks flat in light mode | No saturation lift | Add `backdrop-saturate-150` |
| Button label unreadable on accent (dark) | White used instead of `accent-ink` | `text-accent-ink`; it is dark in dark mode (§6.4) |
| Tertiary text illegible in light | Opacity tier carried over from dark | Use the solid `ink-3` token (§5.4) |
| Corners look "collided" | Same radius on parent and child | Step down one level (§12) |
| Truncation not working | Flex parent lacks `min-w-0` | Add it (§15.6) |
| First list row shows square corners on hover | Group missing `overflow-hidden` | Add it to the group (§21.6) |
| Sticky table header shows rows through it | No background on `thead` | `bg-surface-2` on `thead` (§21.16) |
| Sheet stuck open with reduced motion | Transition-only open state | Toggle a data attribute, not just the transition |
| Classes missing in production | `content` glob too narrow, or dynamic class names | Widen the glob; write full class strings (§28.4) |
| Scroll janks on Android | Too many `backdrop-blur` elements | Chrome only (§28.1) |
| Phone in landscape shows a cramped two-pane layout | Split triggered on width alone | `md:tall:flex-row`, not `md:flex-row` (§18.3) |
| Content cut off at the bottom on a 1366×768 laptop | Vertical chrome sized for a 1080p viewport | Test at 768px height; collapse chrome under `short:` |
| Whole shell scrolls sideways on a large screen | Fluid pane missing `min-w-0` | Add it to the flex child (§18.4) |
| 40″ display shows a narrow column in a sea of canvas | `max-w-shell mx-auto` applied to the shell | Cap prose per column; let the shell fill (§18.5) |
| Text lines are 200 characters on a 40″ display | Main pane stretched instead of subdividing | Grid columns at `2xl:`/`3xl:`/`4xl:` (§18.5) |
| Row actions unreachable on a touchscreen laptop | Hover-only reveal | Add `touch:opacity-100` (§18.3) |
| Layout wrong after iPad Split View resize | Width measured once in JS | Use CSS breakpoints or container queries (§27.2) |
| Labels clipped at 320px but fine at 360px | Floor assumed to be 360 | Unprefixed targets 320 (§18.6) |
| Bottom chrome hidden behind the mobile URL bar | `h-screen` / `100vh` | `h-dvh` |

---

## 32. Migrating a dark-only build

Roughly a day for a medium app, in this order.

**1. Add the token layer.** Drop in `tokens.css` (§8) and the config (§7). Nothing changes yet.

**2. Sweep colour utilities, mechanically.**

| Find | Replace |
|---|---|
| `bg-[#0A0B0D]`, `bg-zinc-950` | `bg-canvas` |
| `bg-[#131417]`, `bg-zinc-900` | `bg-surface-1` |
| `bg-[#1B1D21]`, `bg-zinc-800` | `bg-surface-2` |
| `bg-[#24262B]` | `bg-surface-3` |
| `bg-[#2E3036]` | `bg-surface-4` |
| `text-white` | `text-ink` |
| `text-white/60` | `text-ink-2` |
| `text-white/38`, `/40` | `text-ink-3` |
| `text-white/24`, `/25` | `text-ink-4` |
| `border-white/5` | `border-line/5` |
| `border-white/10` | `border-line/10` |
| `bg-[#3D8BFF]` | `bg-accent` |

**3. Delete every `dark:` variant.** They are now redundant. This is the step that proves the
token layer is complete — anything that breaks was relying on a variant instead of a token.

**4. Fix `accent-ink`.** Every `bg-accent text-white` becomes `bg-accent text-accent-ink`.

**5. Switch to light and walk every screen.** Expect to find: hardcoded `#FFF` thumbs and icons
that are correct, hardcoded darks that are not, shadows that are too heavy, status colours that
vanish, and at least one modal that never got a background token.

**6. Add the theme control and the head script** (§9).

**7. Run the QA checklist** (§30) in both themes.

---

# Appendix A — Token export (JSON)

For Figma variables, Style Dictionary, or any design-token pipeline.

```json
{
  "surface": {
    "canvas":    { "light": "#E9EAEE", "dark": "#0A0B0D" },
    "surface-1": { "light": "#F1F2F5", "dark": "#131417" },
    "surface-2": { "light": "#F8F9FB", "dark": "#1B1D21" },
    "surface-3": { "light": "#FCFCFD", "dark": "#24262B" },
    "surface-4": { "light": "#FFFFFF", "dark": "#2E3036" }
  },
  "text": {
    "ink":   { "light": "#0B0D12", "dark": "#F5F6F8" },
    "ink-2": { "light": "#4C5260", "dark": "#A9AEB8" },
    "ink-3": { "light": "#676D7B", "dark": "#868B96" },
    "ink-4": { "light": "#A2A7B2", "dark": "#565A63" }
  },
  "line":       { "light": "#0B0D12", "dark": "#FFFFFF" },
  "accent":     { "light": "#0B63E5", "dark": "#3D8BFF" },
  "accent-ink": { "light": "#FFFFFF", "dark": "#07142B" },
  "semantic": {
    "success": { "light": "#0F7B52", "dark": "#34C77B" },
    "warning": { "light": "#9A6212", "dark": "#F0B23D" },
    "danger":  { "light": "#CE2B2B", "dark": "#FF5C5C" },
    "info":    { "light": "#0B63E5", "dark": "#3D8BFF" }
  },
  "radius":     { "sm": 8, "default": 14, "lg": 20, "xl": 28 },
  "breakpoint": { "xs": 360, "sm": 480, "md": 768, "lg": 1024, "xl": 1440, "2xl": 1600 },
  "motion": {
    "easing":   { "spring": "cubic-bezier(0.32,0.72,0,1)", "exit": "cubic-bezier(0.4,0,1,1)" },
    "duration": { "instant": 120, "default": 200, "slow": 300 }
  }
}
```

---

# Appendix B — Paste-ready AI prompt block

Paste everything between the fences into an AI design or coding tool at the start of a UI task.

```
Build this interface as a native OS surface, not a webpage. Reference: iOS Settings, One UI
panels, macOS System Settings. The person should feel they entered a system.

STACK
Tailwind utilities only, in the markup. One tailwind.config.js for tokens. One raw CSS file for
@tailwind directives + theme variables + base resets + prefers-reduced-motion — nothing else. No
component .css files, no CSS-in-JS, no Bootstrap/MUI/Bulma/DaisyUI. Arbitrary values over <style>.

THEMES — dark and light are both first-class
Bind semantic Tailwind colours to CSS variables holding space-separated RGB channels:
surface: { 2: 'rgb(var(--surface-2) / <alpha-value>)' }. Channels, never hex — hex breaks every
opacity modifier. Swap variables at :root. NEVER write dark: variants in components; the markup
must be theme-blind.

Light (:root, color-scheme: light)
  canvas #E9EAEE  surface-1 #F1F2F5  surface-2 #F8F9FB  surface-3 #FCFCFD  surface-4 #FFFFFF
  ink #0B0D12  ink-2 #4C5260  ink-3 #676D7B  ink-4 #A2A7B2  line = ink
  accent #0B63E5 (accent-ink #FFFFFF)  success #0F7B52  warning #9A6212  danger #CE2B2B
  shadows two-layer, cool-tinted, .04–.14 alpha
Dark (@media prefers-color-scheme: dark on :root:not([data-theme="light"]), and :root[data-theme="dark"])
  canvas #0A0B0D  surface-1 #131417  surface-2 #1B1D21  surface-3 #24262B  surface-4 #2E3036
  ink #F5F6F8  ink-2 #A9AEB8  ink-3 #868B96  ink-4 #565A63  line = white
  accent #3D8BFF (accent-ink #07142B — DARK ink on the fill; white fails contrast there)
  success #34C77B  warning #F0B23D  danger #FF5C5C
  shadows single-layer near-black, .35–.50 alpha
Theme control order: Auto (default, follows the OS), Light, Dark. Persist in localStorage, apply
in an inline <head> script before first paint, set color-scheme and <meta name="theme-color">.
Never animate the whole page across a theme change.

CONFIG
screens REPLACED not extended (extended screens sort after the defaults and break the cascade):
xs 360, sm 480, md 768, lg 1024, xl 1440, 2xl 1920, 3xl 2560, 4xl 3200.
Unprefixed targets 320px — a 5" phone, not 360.
Plus raw guards, stackable as md:tall:flex-row —
  tall  (min-height: 560px)   short (max-height: 559px)
  touch (pointer: coarse)     fine  (pointer: fine)
borderRadius: sm 8, DEFAULT 14, lg 20, xl 28.
boxShadow sm/DEFAULT/lg point at --shadow-* variables so light gets its own values.
backdropBlur xs 20px, sm 30px.
transitionTimingFunction: spring cubic-bezier(0.32,0.72,0,1), exit cubic-bezier(0.4,0,1,1).
fontFamily sans: -apple-system, BlinkMacSystemFont, Segoe UI Variable, Roboto, sans-serif.
No webfont for UI text — the system face IS the native cue.

NON-NEGOTIABLE
1 No gradients anywhere — no bg-gradient-to-*, no from/via/to, none inside arbitrary values, none
  in charts.
2 Never pure black. Pure white only on surface-4, the topmost layer.
3 No sharp edges — no rounded-none/rounded-sm on any container. Nested radii step DOWN
  (xl 28 → lg 20 → DEFAULT 14 → sm 8), never repeat parent and child. Child radius ≈ parent
  radius − parent padding.
4 Depth = surface step, then border-line/10 hairline, then a tight shadow. In that order.
5 One accent, one primary action per screen. Hover moves a surface step; it never changes hue.
6 Text uses four solid tokens (ink, ink-2, ink-3, ink-4) — never white at four opacities, which
  is unreadable in light mode. ink-4 is disabled states only.

MATERIALS Floating chrome = backdrop-blur-sm bg-surface-3/72 border-line/10 backdrop-saturate-150
(the saturation is essential in light mode). Chrome only — never on cards or repeated elements.
shadow-sm resting, shadow raised, shadow-lg modals only. No coloured shadows or glows. Scrims are
black in both themes: bg-black/55 backdrop-blur-xs.

TYPE Display text-3xl font-bold tracking-tight (one per screen) · Title text-xl font-semibold
tracking-tight · Body text-base · Subtext text-sm text-ink-2 · Micro text-xs text-ink-3
font-medium. Hierarchy from weight and ink tier, never colour. In light mode reach for weight,
not darkness. Numbers font-mono tabular-nums, right-aligned in tables. Sentence case, no ALL CAPS
labels, active voice; a button names what happens ("Save changes") and keeps that name through
the flow.

MOTION transition-all duration-200 ease-spring, 150–300ms, only in response to an action.
active:scale-[0.97] on press. Dismissals faster than entrances and use ease-exit. No scroll
reveals, no staggered entrances, no decorative animate-* (skeletons excepted). Phone sheets
translate-y-full → translate-y-0; desktop uses a centred modal (scale-95 → scale-100) or a side
panel (translate-x-full → translate-x-0) — never a full-width bottom sheet on desktop. Honour
prefers-reduced-motion.

RESPONSIVE — 320px to 3840px, recompose upward, nothing may break
Support every one of these real viewports:
  320x568 360x640 375x812 393x852 412x892 430x932      phones 5"-7"
  667x375 852x393 932x430                              PHONE LANDSCAPE — short, not wide
  375x1024 507x1024 678x1024                           iPad Split View / Stage Manager
  600x960 744x1133 820x1180 1024x1366 + landscapes     tablets 7"-13"
  1280x800 1366x768 1512x982 1728x1117                 laptops 13"-16"
  1920x1080  2560x1440  3440x1440  3840x2160           24" / 27" / ultrawide / 40"

Composition by tier:
  (none) 320  single column, px-4 full-bleed, bottom tab bar (4 items at 320, 5 from xs),
              min-h-11 min-w-11 targets, p-4 content
  sm 480      two-column card grids become possible, sm:px-5
  md 768      SPLIT — md:tall:flex-row, md:w-64 master list beside detail, tab bar to sidebar
  lg 1024     icon rail 72 + sidebar 288 + main, max-w-prose on reading content
  xl 1440     third pane, inspector xl:w-80
  2xl 1920    24" — content grid to 3 columns, tables reveal secondary columns
  3xl 2560    27"/32"/ultrawide — 4-5 columns
  4xl 3200    40" — FOURTH region, 6 columns

HEIGHT IS A SEPARATE AXIS. Never split on width alone: a 6.7" phone in landscape is 932x430 and
would get the tablet two-pane layout in 430px of height. Use md:tall:flex-row. Under short:
(height < 560) the bottom tab bar becomes a 64px LEFT RAIL, the display heading drops to text-xl,
and section spacing drops from mt-8 to mt-4. Verify 1366x768 — a very common laptop — where a
three-pane shell must fit in 768px of height.

LARGE DISPLAYS — two independent problems.
  Space: the shell FILLS the display; the main pane SUBDIVIDES into more grid columns. Chrome
  (rail 72, sidebar 288, inspector 320-380) is FIXED px at every size above 1024 and never scales.
  Tables gain columns via hidden 2xl:table-cell / 3xl:table-cell, they do not widen. Prose stays
  capped at max-w-prose (68ch) but is paired with a contents pane and an inspector so no region
  is dead. NEVER max-w-[1200px] mx-auto on the shell at 3840px — that is the forbidden boxed page
  floating on a wallpaper.
  Distance: ONE root font-size step, opt-in, in CSS — 17px at 2560, 18px at 3200. Never past 18px,
  and never combined with scattered 3xl:text-* prefixes.

min-w-0 on every fluid flex child or the whole shell scrolls sideways. h-dvh, never h-screen.
touch: guard so hover-revealed actions stay visible on touchscreen laptops. Container queries for
any component that appears in both a 2000px region and a 340px one. Build 320 first, then 1920,
then interpolate.

DENSITY Data-dense rows py-2 px-3, consumer rows py-4 px-5 — padding changes, materials never do.
Tables: divide-y divide-line/5, no zebra striping, sticky top-0 bg-surface-2 header, min-w +
overflow-auto so the page never scrolls sideways. Status = a small dot, a border-l-2 rule, or
coloured text — never a full-bleed coloured banner. Charts: one flat accent at /100, /55, /30
opacity steps, grid stroke-line/8, rounded-sm bar caps, flat fill-accent/12 under lines.

ACCESSIBILITY 4.5:1 body and 3:1 large/UI, verified in BOTH themes — light mode is where semantic
colours fail. focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-canvas on everything
interactive. 44×44 targets. Status never colour alone. Real <button>/<a>, aria-label on icon-only
controls, modals trap focus and close on Escape.

AVOID gradients · custom .css or foreign framework classes · bg-black or a full-white canvas ·
text-white/60 in light mode · dark: variants in components · inverting the dark palette to make
the light one · identical rounded-lg + shadow-md cards everywhere · two competing accents ·
floating labels · zebra striping · centre-aligned boxed page on a grey background · hover-only
functionality · ALL CAPS labels · "Something went wrong".
```

---

# Appendix C — One-page cheat sheet

```
SURFACES   canvas · surface-1 · surface-2 · surface-3 · surface-4
TEXT       ink · ink-2 · ink-3 · ink-4          (solid tokens, not opacity)
LINE       border-line/5 /10 /15 · divide-line/5 /10
COLOUR     accent · accent-ink · success · warning · danger · info

RADIUS     sm 8 chips · DEFAULT 14 buttons/rows · lg 20 cards · xl 28 sheets · full pills
           nested ALWAYS steps down one level

ELEVATION  0 canvas —             1 surface-1 +border
           2 surface-2 +border +shadow-sm     3 surface-3 +border +shadow-sm
           4 surface-4 +border +shadow-lg
           reach: surface step → border → shadow

TYPE       text-3xl font-bold tracking-tight   display, one per screen
           text-xl  font-semibold              title
           text-base                           body
           text-sm  text-ink-2                 subtext
           text-xs  text-ink-3 font-medium     micro

SPACING    4px grid · p-4 default · py-2 px-3 dense · py-4 px-5 consumer
           min-h-11 min-w-11 targets · max-w-prose (68ch) · max-w-shell (1200px)

MOTION     transition-all duration-200 ease-spring
           active:scale-[0.97] · 150–300ms · interaction only
           sheets translate-y · modals scale-95→100 · panels translate-x

CHROME     sticky top-0 border-b border-line/10
           bg-surface-3/72 backdrop-blur-sm backdrop-saturate-150

BREAK      320 stack · 360 xs · 480 sm · 768 md split · 1024 lg rail
           1440 xl +inspector · 1920 2xl 3-col · 2560 3xl 4-col · 3200 4xl 4 regions
           md:tall: to split · short: rail · touch: keep hover actions visible
           chrome fixed px above 1024 · main subdivides · recompose, never scale

FOCUS      focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-canvas

NEVER      gradients · pure black · white canvas · dark: variants · repeated radius
           two accents · scroll animation · full-width bottom sheet on desktop
```

---

# Appendix D — Glossary

| Term | Meaning here |
|---|---|
| **Canvas** | The root background. The "desktop" the interface sits on. |
| **Surface** | A flat, opaque fill representing one elevation level. |
| **Elevation** | How far forward an element sits, expressed as surface + border + shadow together. |
| **Hairline** | A 1px border at 5–15% opacity. The primary separator in this system. |
| **Material** | A translucent, blurred panel that floats over scrolling content. |
| **Chrome** | Persistent interface furniture — top bars, tab bars, rails, sidebars. |
| **Scrim** | The dimming layer behind a modal or sheet. |
| **Ink** | Foreground/text colour. Four tiers, solid, theme-tuned. |
| **Accent** | The single colour used for the primary action. One per product. |
| **`accent-ink`** | The text colour that sits *on* the accent fill. White in light, dark navy in dark. |
| **Concentric** | Nested radii that step down so corners read as parallel rather than colliding. |
| **Recomposition** | Changing layout *structure* across breakpoints, not just size. |
| **Density** | Row and card padding. Never colour, radius, or material. |
| **Token** | A named design value with one definition per theme. |
| **Semantic naming** | Naming by role (`surface-2`) not appearance (`grey-800`). |

---

*End of specification. The companion visual reference renders every token, component and
breakpoint in both themes — use it to eyeball changes before shipping them.*