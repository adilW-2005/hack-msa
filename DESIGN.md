# Lumen — Design Language

> Quiet, clean, confident. A surface that feels like a well-run ledger: lots of white, generous space, considered type, one olive-green thread of intent running through it, and a single warm accent reserved for moments that matter.

---

## 1. Brand foundations

### 1.1 Personality

Lumen is for nonprofits handling restricted money. The UI has to feel three things at once:

- **Trustworthy** — numbers are correct, decisions are defensible, nothing is flashy.
- **Operational** — built for someone who opens it on a Tuesday morning with 20 other tabs and needs to find a decline reason in four seconds.
- **Humane** — the end beneficiary of this money is a person, not a line item. Warmth is baked in via the accent color and the copy, never via clutter.

### 1.2 Feel in one line

> *Stripe's structural honesty + Linear's spatial restraint + a warmer, more grounded palette.*

### 1.3 What we are not

- We are not fintech-neon (no purples, no gradients stacked on gradients).
- We are not enterprise-gray (no dense tables-of-death).
- We are not banking-beige (no drop shadows, no 2014 card chrome, no photograph-of-a-card hero image).

---

## 2. Color system

White is the default. Olive carries intent (primary actions, live data, selected states). Clay is reserved, used only for human-attention moments (pending approvals, flagged declines, calls-to-action that require judgment).

### 2.1 Core tokens

```
# Surfaces
--bg              #FFFFFF   pure white, the base everywhere
--surface         #FAF9F5   warm off-white, elevated panels and cards on the page
--surface-sunken  #F3F1EA   insets, empty states, chart backgrounds
--overlay         rgba(15, 15, 15, 0.48)   modal scrim

# Ink (text & icons)
--ink             #0F0F0F   primary text, icons, logo
--ink-muted       #5B5B57   secondary text, labels, metadata
--ink-subtle      #8A8A85   captions, placeholders, disabled
--ink-on-olive    #FAF9F5   text on olive surfaces
--ink-on-clay     #FFFFFF   text on clay surfaces

# Olive (primary)
--olive-900       #2A331A   hover on primary buttons, pressed
--olive-700       #3F4E26   default primary, primary text on light
--olive-500       #5C6B3A   the signature olive — headline accent, active nav
--olive-300       #A8B382   live indicators, chart fills, subtle positive states
--olive-100       #E8EAD6   selected row, tag bg, hover tint
--olive-50        #F4F5E8   very subtle wash, section bg if needed

# Clay (accent — use sparingly)
--clay-700        #9E4A32   hover
--clay-500        #C96442   the accent — flagged, attention, "needs you"
--clay-300        #E9A88C   warnings and alerts
--clay-100        #F7E3D8   attention pill bg

# Semantic
--success-700     #2F6340
--success-500     #3F7D4E   approved, in-budget
--success-100     #DEEDD8

--warning-700     #9A7A14
--warning-500     #C79A1F   near-limit, pending
--warning-100     #F5ECC9

--danger-700     #8E3A31
--danger-500     #B64A3C   declined, over-budget, revoked
--danger-100     #F4D9D3

# Borders & lines
--border          #E8E6DF   default hairline
--border-strong   #D3D0C5   table dividers, input borders
--border-focus    #5C6B3A   focus ring (olive-500)
```

### 2.2 Usage rules

- **Olive** is primary. Primary buttons, active nav pill, selected rows, the live-data dot on a ticking balance, link color, chart primary series.
- **Clay** is *earned*. It appears on exactly three kinds of things: (1) a pending approval that needs human action, (2) a flagged / policy-violating transaction, (3) the single CTA on an empty state or first-run card. If clay appears three times on one screen, something is wrong.
- **Semantic greens/reds** are narrower than olive/clay. Success green means *an authorization was approved*. Danger red means *an authorization was declined or a budget is exhausted*. These colors do not leak into the general chrome.
- **Black ink on white** is the default everywhere. Resist the urge to use olive for body copy.

### 2.3 Accessibility

- Body text meets WCAG AA on white (`--ink` on `--bg` is ~19:1).
- `--ink-muted` on `--bg` meets AA for normal body (7.3:1).
- Olive-500 on white meets AA for UI components and large text; use olive-700 for small body text on white.
- Clay-500 on white meets AA for large text / UI; for small body copy, use clay-700.
- Never rely on color alone to convey a state — always pair with an icon or a text label (Approved ✓ / Declined ✕ / Pending ●).

---

## 3. Typography

### 3.1 Type families

- **Display & UI**: `Inter` (variable) — clean, neutral, built for interfaces.
- **Numerals / tabular data**: `Inter` with `font-feature-settings: "tnum", "ss01"` for tabular figures. Every number in a table, balance, or transaction row uses tabular.
- **Optional editorial touch**: `Instrument Serif` (or `Söhne Breit`) for the one "hero" headline on the marketing/landing surface. Never inside the app.

### 3.2 Type scale

```
display-xl   48px / 56    -0.02em   600
display      36px / 44    -0.02em   600
h1           28px / 36    -0.01em   600
h2           22px / 30    -0.005em  600
h3           18px / 26     0        600
body-lg      16px / 24     0        450
body         14px / 22     0        450
label        13px / 20     0.02em   500    uppercase optional
caption      12px / 18     0.01em   450
micro        11px / 16     0.04em   500    uppercase
mono         13px / 20    — JetBrains Mono, for card numbers, IDs, tokens
```

### 3.3 Rules

- Headings sit on `--ink`, never on olive.
- Labels that precede big numbers (the `Total Revenue` label above `$689` in the references) use `label` size, `--ink-muted`, often uppercase with `letter-spacing: 0.04em`.
- Big number blocks (`$2,190.19`) use `display` or `h1`, always tabular, weight 600, sitting on `--ink`.
- Body copy uses 14–16px at a 1.55 line-height. Never smaller than 13px inside the app.
- Links are `--olive-700`, underline on hover, no underline at rest.

---

## 4. Space, grid, and layout

### 4.1 Base unit

4px. Every spacing value is a multiple: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

### 4.2 Layout primitives

- **App shell**: 240px sidebar on the left, flexible main content. Sidebar collapses to 64px icons-only below 1100px.
- **Main content padding**: 32px on desktop, 20px on tablet, 16px on mobile.
- **Page title row**: 72px tall, sticky top, white background, hairline border bottom.
- **Content grid**: 12 columns, 24px gutter on desktop. Cards snap to multiples of 3 or 4 columns (3-up stats row = 4 cols each; 4-up stats row = 3 cols each).

### 4.3 Density

Lumen is **roomy, not dense**. Rows in tables are 56px tall. Cards have 24px internal padding (20px on mobile). Never pack two actions into a single button cluster without space between them.

---

## 5. Radius, elevation, and borders

### 5.1 Radius

```
--radius-sm   8px    pills, tags, inputs
--radius-md   14px   buttons, secondary cards
--radius-lg   20px   primary cards, panels, modals
--radius-xl   28px   hero cards (the big "Balance $X" card)
--radius-full 9999px avatars, round status dots
```

### 5.2 Elevation

Lumen uses **borders before shadows**. A hairline border on an off-white card beats a shadow in almost every case. Shadows are reserved for things that actually float (dropdowns, popovers, modals).

```
--elev-0   none                                   flat on white
--elev-1   border 1px solid var(--border)         default cards
--elev-2   0 1px 2px rgba(15,15,15,0.04),         raised cards, the "hero" stat card
           0 8px 24px rgba(15,15,15,0.05)
--elev-3   0 4px 12px rgba(15,15,15,0.08),        dropdowns, popovers
           0 24px 48px rgba(15,15,15,0.08)
--elev-4   0 8px 24px rgba(15,15,15,0.12),        modals
           0 32px 80px rgba(15,15,15,0.16)
```

### 5.3 Borders

- Default border is 1px `--border`.
- Strong border (e.g. table divider, input) is 1px `--border-strong`.
- Focus ring is 2px `--olive-500` with a 2px offset (box-shadow: `0 0 0 2px #FFFFFF, 0 0 0 4px var(--olive-500)`).

---

## 6. Iconography

### 6.1 Library

**Lucide** (MIT). It pairs cleanly with Inter and keeps the minimal-line aesthetic. Consistent 1.75px stroke weight.

### 6.2 Rules

- Icons are **black by default** (`--ink`), not olive. Olive icons only appear inside active nav items, selected rows, or olive-tinted surfaces.
- Icon sizes: `14`, `16`, `18`, `20`, `24`. In buttons: 16. In nav: 18. In stat-card chips: 20. In empty-state illustrations: 40+.
- Never fill icons. Outline-only.
- Always pair icons with text in primary nav and buttons — icon-only is reserved for toolbar actions with tooltips.

### 6.3 Signature icons per concept

| Concept | Lucide icon |
|---|---|
| Policy | `scroll-text` |
| Card | `credit-card` |
| Grant | `landmark` |
| Approval | `check-circle-2` |
| Decline | `x-circle` |
| Pending | `clock` |
| Voucher / client aid | `gift` |
| Cardholder (staff) | `user-round` |
| Merchant | `store` |
| Audit / log | `history` |
| Report | `file-text` |
| Flag | `flag` |
| Swipe simulator | `zap` |

---

## 7. Component specifications

### 7.1 Buttons

Four variants, one size system.

```
Sizes:   sm (32h, 13px, px-12)   md (40h, 14px, px-16)   lg (48h, 15px, px-20)
Radius:  --radius-md
Weight:  500
```

- **Primary** — `bg: olive-700`, `text: ink-on-olive`, hover `olive-900`, active `olive-900` with inner shadow. Used once per view.
- **Secondary** — `bg: white`, `border: border-strong`, `text: ink`, hover `bg: surface`. The workhorse.
- **Ghost** — no background, no border, `text: ink`, hover `bg: surface`. For low-emphasis actions in toolbars.
- **Danger** — `bg: white`, `border: danger-500`, `text: danger-700`. For destructive (revoke card, archive policy). Confirm via modal.
- **Accent (clay)** — *only* on the "Approve" button inside an approval modal or the "Review" CTA on a flagged card. Never elsewhere.

Focus: 2px olive ring with 2px white offset. Disabled: 40% opacity, no pointer.

### 7.2 Cards

The card is the most important container in Lumen. Three archetypes:

**Stat card** (references: the big "Balance $2,190.19" hero card).

```
padding:    24px
radius:     --radius-xl   (28px)
border:     1px --border  (or elev-2 on the hero)
bg:         --bg
layout:     icon pill (top-left), title label (muted, 13px, uppercase-ish),
            huge number (display, 36–48px, tabular, weight 600),
            tiny delta below in olive-300 or clay-300
hero variant: bg: --olive-500, text: ink-on-olive, delta in olive-100
```

Only **one** stat card per screen may be the hero variant (the olive filled one). It carries the highest-priority number for that surface.

**Content panel** (tables, charts, forms).

```
padding:    24px
radius:     --radius-lg   (20px)
border:     1px --border
bg:         --bg
header:     48px tall, title + actions, hairline border-bottom
```

**Virtual card mockup** (when displaying an actual Lumen card).

```
aspect:     1.586 : 1 (standard card ratio)
radius:     --radius-lg
bg:         linear-gradient(135deg, olive-700 0%, olive-500 60%, olive-900 100%)
            with a subtle grain overlay at 4% opacity
text:       ink-on-olive, tabular mono for PAN, spaced in groups of 4
chip glyph: small brass-like pill, stroke olive-300
logo:       Lumen wordmark, olive-100, top-right
state pill: bottom-right, "ACTIVE" in olive-100 on olive-900, 10px uppercase
```

### 7.3 Navigation

**Sidebar (240px)** — white, hairline right border, 24px vertical padding.

- Brand block at top: 24px Lumen mark + wordmark, 56px tall.
- "Menu" label (micro, muted) + stacked items.
- Each item: 40px tall, 12px radius, 12px horizontal padding, 18px icon + 14px label, 12px gap.
- Rest state: transparent bg, ink text, ink icon.
- Hover: `--surface` bg.
- **Active**: `--olive-100` bg, `--olive-700` text & icon, 2px `--olive-500` accent bar on the left edge (full height minus 8px, centered vertically).
- Section gap: 24px with a micro uppercase label (e.g., "Spend", "Oversight", "Admin").
- Bottom pinned: role switcher (for the hackathon demo) + settings icon.

**Top bar (72px)** — white, hairline bottom border, sticky.

- Left: current page title (h1, 24–28px).
- Center: search (optional, collapsed on narrow widths). Pill input, `--surface` bg, 40px tall, lucide `search` icon left, placeholder `--ink-subtle`.
- Right: notification bell (outline, small olive dot if unread), avatar with dropdown.

### 7.4 Inputs and forms

```
height:     40 (md), 32 (sm)
bg:         --bg
border:     1px --border-strong
radius:     --radius-md
padding-x:  12
text:       14px ink; placeholder: ink-subtle
focus:      border olive-500, ring 2px olive-500 at 25% alpha
error:      border danger-500, helper text danger-700
label:      13px, weight 500, ink-muted, 8px below-gap to input
helper:     12px, ink-subtle, 6px above-gap from input
```

Labels sit **above** inputs, never inside (no floating labels). Required fields get a small olive dot after the label, not an asterisk.

**Select / dropdown** uses Radix primitives (or shadcn), matching input height and border. Option row has 36px height, 12px padding, check mark (olive) on selection.

**Toggle** — pill-shape, 24h/44w, off is `--border-strong`, on is `--olive-500`. Knob is white with a subtle border.

**Combobox / search-select** — same input shell; dropdown panel uses elev-3 and 8px offset.

### 7.5 Tables

The transactions table is the most-seen surface in Lumen. Make it beautiful.

```
header:         48h, bg white, sticky, border-bottom 1px --border
                text: label, 12px, uppercase, --ink-muted, weight 500
row:            56h, border-bottom 1px --border, bg white
                hover: bg --surface
                selected: bg --olive-50, left 2px olive-500 accent bar
cell padding:   16px vertical, 20px horizontal
numeric cells:  right-aligned, tabular figures
status cells:   status pill (see 7.6) with icon
first column:   often an avatar or icon (24px) + stacked text (name + 12px muted sub)
last column:    chevron or action menu (lucide `chevron-right` or `more-horizontal`)
```

No zebra striping. Rely on spacing and hairlines.

### 7.6 Status pills

Pills are information-dense and tightly styled.

```
height:    24px
padding:   0 10px
radius:    --radius-full
text:      12px, weight 500, tabular
icon:      12px, 4px right-gap from text
```

| State | bg | text | icon |
|---|---|---|---|
| Approved | `--success-100` | `--success-700` | `check-circle-2` |
| Declined | `--danger-100` | `--danger-700` | `x-circle` |
| Pending approval | `--clay-100` | `--clay-700` | `clock` |
| In policy | `--olive-100` | `--olive-700` | `shield-check` |
| Flagged | `--clay-100` | `--clay-700` | `flag` |
| Expired | `--surface-sunken` | `--ink-muted` | `circle-slash` |
| Active | `--olive-100` | `--olive-700` | small olive dot (no icon) |

### 7.7 Modals and dialogs

- Centered, max-width 560px (or 720px for complex forms).
- Radius `--radius-lg`, elev-4, bg `--bg`.
- 28px padding top/bottom, 32px horizontal.
- Title h2, 22px, weight 600.
- Close button: ghost icon, top-right, 32px hit target.
- Actions: footer with hairline top border, right-aligned, primary on the far right.

The **Approval modal** (Marcus's desktop alternative to SMS) is the one place clay shows up as a primary button color, because it is the moment of human judgment the product is built around.

### 7.8 Toasts

- Bottom-right, 340px wide, `--radius-md`, elev-3.
- Left colored bar (4px) indicating type: olive (success), clay (attention), danger (error), ink-muted (info).
- Title 14px weight 500, body 13px `--ink-muted`.
- Auto-dismiss at 6s; persistent for errors.

### 7.9 Charts

One chart library (`Recharts`) and a strict palette.

```
primary series:    --olive-500
secondary series:  --ink       (line) or --surface-sunken (fill)
attention series:  --clay-500  (only for flagged/declined data)
grid:              --border    dashed
axis text:         --ink-muted, 12px
tooltip:           white, elev-3, --radius-md, 12px padding,
                   tabular numbers, olive dot marker
```

- Line charts: 2px stroke, soft area gradient from olive-300@30% → transparent underneath.
- Bar charts: olive bars, 12px radius-top, 8px gap between bars, soft shadow optional.
- Donut charts: max 5 segments, olive/clay/ink-muted/olive-300/surface-sunken, 4px gap via `paddingAngle`.

### 7.10 Empty states

- Centered block, 48px icon (ink-muted), 16px gap, h3 title, body copy in ink-muted, 24px gap, primary or clay CTA.
- Background stays white. No illustration-heavy spots. If an illustration is used, it's a simple line drawing in ink at 40% opacity.

### 7.11 Avatars and identity

- Users: 32px circle, image or initials on `--olive-100` with `--olive-700` text, weight 500.
- Cardholders (clients): 32px circle, initials on `--surface-sunken` with `--ink` text (no olive — clients are not staff).
- Merchants in transaction rows: 24px rounded square (`--radius-sm`), store icon in `--ink-muted` on `--surface`.

### 7.12 The Swipe Simulator (demo-only component)

This is the on-stage magic trick. Style it to feel like a tool, not a toy.

```
container:  content panel, "Swipe Simulator" title with zap icon
layout:     2×2 or 1×4 grid of swipe buttons
each btn:   secondary button variant, left-aligned content
            top line: merchant name (14px, ink)
            bottom line: amount + MCC code (12px, ink-muted, tabular)
            right: subtle olive arrow (chevron-right, 16px)
after click: button flashes olive-50, then returns.
             toast slides in bottom-right with decision outcome.
```

---

## 8. Motion

Motion in Lumen is **small and fast**. Everything under 200ms. No springy bounces, no parallax, no page transitions.

```
--ease-standard   cubic-bezier(0.2, 0.8, 0.2, 1)
--ease-emphasize  cubic-bezier(0.2, 0.0, 0.0, 1)
--dur-fast        120ms    hovers, focus rings, color swaps
--dur-base        180ms    modals, toasts, menus
--dur-slow        240ms    layout shifts (rare)
```

Signature moments:

- **Approve flash**: when an authorization is approved, the row flashes `--olive-100` for 400ms then fades to white. The balance number on the grant card animates from old to new over 600ms with a `tabular-nums` tween.
- **Decline shake**: a 2-pixel horizontal shake over 180ms on the decline toast. No ragdoll, no exaggeration.
- **Live dot**: approved/live status pills have a 2px olive dot that pulses at 1.6s cadence (scale 1 → 1.3 → 1).

Respect `prefers-reduced-motion`: disable all decorative animation; keep only functional transitions (dropdown open/close) at half duration.

---

## 9. Voice and copy

- **Plain language.** Prefer "This category isn't allowed on this card" over "MCC_BLOCKED".
- **Subject-first.** "Marcus approved this at 2:14 PM" not "Approved by Marcus at 2:14 PM".
- **Currency is explicit.** Always `$1,400.00 USD` on report surfaces; `$1,400` on dashboards where space is tight.
- **Time.** Relative for the last 24h ("12 min ago"); absolute with timezone beyond ("Apr 14, 2:14 PM PT").
- **Reason codes are translated.** Every machine reason has a human label; the code itself is available on hover for auditors.

Reason code → label examples:

| Code | Label |
|---|---|
| `mcc_blocked` | "This category isn't allowed on this card." |
| `merchant_not_allowed` | "This merchant isn't on the card's allowlist." |
| `over_per_txn_limit` | "Amount is above the per-transaction limit." |
| `over_card_total` | "Card's total limit has been reached." |
| `grant_exhausted` | "The funding grant has no remaining budget." |
| `needs_sms_approval` | "Waiting for approval by text message." |
| `card_expired` | "Card is past its active window." |

---

## 10. The anatomy of key screens

### 10.1 Executive dashboard (Dana)

- **Top row, 4 stat cards**: *Deployed this month*, *Pending approvals*, *Flagged declines*, *Grants active*. The first is the olive hero card; the other three are bordered on white.
- **Middle row, 2 panels**:
  - Left (8 cols): *Spend over time* — a line chart of daily approved authorizations, olive primary, last 30 days.
  - Right (4 cols): *Attention* — a panel listing pending approvals and flagged declines, each a row with icon, amount, card, and a clay "Review" button.
- **Bottom row (12 cols)**: *Recent activity* — transactions table, 8 rows, "View all" link in the header.

### 10.2 Grant detail

- Hero row: grant name (h1), funder (body-lg muted), and a stat trio (*Total*, *Spent*, *Remaining*), with a compact progress bar underneath (olive fill on `--surface-sunken` track).
- Policies drawing from this grant: a horizontal scroll of small cards (one per policy), each with name + policy's own spent/total.
- Transactions table filtered to this grant.
- A pinned "Export Funder Report" ghost button, top-right of the hero row.

### 10.3 Issue card flow

- Left column (40%): a live preview of the virtual card mockup (see 7.2), updating as the user picks a policy. The card gradient stays olive; the "policy name" printed on the card updates in real time.
- Right column (60%): form — policy selector, cardholder selector or quick-create, optional notes. Primary "Issue card" button at the bottom right.

### 10.4 Approval inbox (Marcus)

- List of pending approvals, each a full-bleed row 88px tall:
  - Merchant name + amount on the left (h3 + ink-muted sub),
  - Card + cardholder + policy in the middle,
  - *Approve* (primary olive) and *Decline* (ghost danger) buttons on the right.
- A thin clay bar on the left edge of each pending row to signal attention without screaming.

---

## 11. Accessibility & inclusivity

- Minimum tap target 40×40 on touch surfaces; 32×32 acceptable in dense desktop toolbars.
- Focus visible on every interactive element. Never `outline: none` without a replacement.
- Live regions announce approval outcomes (`aria-live="polite"` on the decision toast).
- Color-blind pass: olive vs clay is distinguishable in protanopia and deuteranopia; we double every color signal with an icon (✓ approved, ✕ declined, ● pending).
- Language: default English, but currency/number formatting respects locale.

---

## 12. Quick-reference tokens (copy/paste into CSS or Tailwind config)

```css
:root {
  --bg: #FFFFFF;
  --surface: #FAF9F5;
  --surface-sunken: #F3F1EA;

  --ink: #0F0F0F;
  --ink-muted: #5B5B57;
  --ink-subtle: #8A8A85;

  --olive-900: #2A331A;
  --olive-700: #3F4E26;
  --olive-500: #5C6B3A;
  --olive-300: #A8B382;
  --olive-100: #E8EAD6;
  --olive-50:  #F4F5E8;

  --clay-700: #9E4A32;
  --clay-500: #C96442;
  --clay-300: #E9A88C;
  --clay-100: #F7E3D8;

  --success-700: #2F6340;
  --success-500: #3F7D4E;
  --success-100: #DEEDD8;

  --warning-700: #9A7A14;
  --warning-500: #C79A1F;
  --warning-100: #F5ECC9;

  --danger-700: #8E3A31;
  --danger-500: #B64A3C;
  --danger-100: #F4D9D3;

  --border: #E8E6DF;
  --border-strong: #D3D0C5;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  --dur-fast: 120ms;
  --dur-base: 180ms;
  --dur-slow: 240ms;
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-emphasize: cubic-bezier(0.2, 0.0, 0.0, 1);
}
```

### Tailwind config fragment

```js
// tailwind.config.ts (fragment)
theme: {
  extend: {
    colors: {
      bg: '#FFFFFF',
      surface: { DEFAULT: '#FAF9F5', sunken: '#F3F1EA' },
      ink: { DEFAULT: '#0F0F0F', muted: '#5B5B57', subtle: '#8A8A85' },
      olive: {
        50:  '#F4F5E8',
        100: '#E8EAD6',
        300: '#A8B382',
        500: '#5C6B3A',
        700: '#3F4E26',
        900: '#2A331A',
      },
      clay: {
        100: '#F7E3D8',
        300: '#E9A88C',
        500: '#C96442',
        700: '#9E4A32',
      },
      success: { 100: '#DEEDD8', 500: '#3F7D4E', 700: '#2F6340' },
      warning: { 100: '#F5ECC9', 500: '#C79A1F', 700: '#9A7A14' },
      danger:  { 100: '#F4D9D3', 500: '#B64A3C', 700: '#8E3A31' },
      border: { DEFAULT: '#E8E6DF', strong: '#D3D0C5' },
    },
    borderRadius: {
      sm: '8px', md: '14px', lg: '20px', xl: '28px',
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
    transitionTimingFunction: {
      standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      emphasize: 'cubic-bezier(0.2, 0.0, 0.0, 1)',
    },
  }
}
```

---

## 13. The one-sentence rule

If you are ever stuck on a styling decision, default to **white background, black ink, olive for intent, clay for attention, generous space, and a hairline before a shadow.** That rule alone will keep Lumen looking like Lumen.
