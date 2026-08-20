# FundIt Design System

Use this document as the visual source of truth for FundIt. Future work should follow these tokens and rules rather than inventing a new look per page.

FundIt is a modern discovery platform for products, ideas, and opportunities. It should feel funky, approachable, energetic, and trustworthy — not like a bank, trading terminal, or VC firm.

Marketing voice: **Discover ideas. Back what you believe in.** Domain terms such as Investment, Investor, Portfolio, and Funding stay as-is until the business model is confirmed.

## Color tokens

All colors are semantic. Change the palette in [`src/config/theme.ts`](../config/theme.ts). Do not hard-code hex values in components.

### Brand

| Token | Usage |
|-------|--------|
| `primary` | Primary CTAs (Explore, Invest, Join), key emphasis |
| `secondary` | Supporting actions (Learn more, View project, filters) |
| `accent` | Warm highlight. Use sparingly |

Utilities: `bg-primary`, `text-primary-foreground`, `bg-secondary`, `bg-accent`.

### Surface

| Token | Usage |
|-------|--------|
| `background` | App canvas — warm cream, never plain white everywhere |
| `surface` / `surface-muted` | Recessed sections |
| `surface-elevated` | Raised panels, form fields |
| `card` | Default card fill |

### Text

| Token | Usage |
|-------|--------|
| `foreground` | Headings and body |
| `muted-foreground` | Supporting copy |
| `foreground-subtle` | Least-emphasis labels |

Never use pastel colors as text on pastel backgrounds.

### Status

| Token | Usage |
|-------|--------|
| `success` | Confirmed, funded, completed |
| `warning` | Pending payment, attention |
| `destructive` | Errors, failed payments |
| `info` | Neutral informational callouts |

### Pastel

Decorative only: backgrounds, sections, badges, category treatments, blobs.

| Token | Typical use |
|-------|-------------|
| `pastel-pink` | Occasional highlight |
| `pastel-peach` | Warm section accent |
| `pastel-yellow` | Warning-adjacent surfaces, highlights |
| `pastel-mint` | Categories, empty-state icons |
| `pastel-blue` | Image wells, soft cards |
| `pastel-lavender` | Header hovers, footer, section wash |

Each pastel has a matching `*-foreground` that is always dark and readable.

**Do not** paint every section a different pastel. Personality, not noise.

## Typography

Single family: **Plus Jakarta Sans** via `next/font` (`--font-plus-jakarta` → `font-sans`).

| Role | When | Classes |
|------|------|---------|
| Display | Hero headlines, section titles, large numbers | `font-display text-3xl sm:text-4xl` |
| Body | Descriptions, forms, supporting copy | `text-base leading-relaxed` or `text-sm leading-relaxed` |
| Meta | Categories, tags, funding labels, status | `text-meta` |

Do not make everything bold. Do not add extra font families without a performance reason.

## Radius

Configured as `themeConfig.radius` (`0.75rem`).

| Element | Token / class |
|---------|----------------|
| Buttons, inputs | `rounded-lg` (`--radius`) |
| Cards, images | `rounded-2xl` |
| Badges, avatars | `rounded-full` (pills for badges only) |

Do not make every control a pill.

## Shadows

| Token | Usage |
|-------|--------|
| `shadow-soft` | Buttons, light elevation |
| `shadow-card` | Default cards |
| `shadow-elevated` | Auth cards, hover/interactive cards |

No heavy drop shadows, glassmorphism, or neumorphism.

## Buttons

[`src/components/ui/button.tsx`](../components/ui/button.tsx)

| Variant | Role |
|---------|------|
| `default` | Primary CTA |
| `secondary` | Supporting action |
| `outline` / `ghost` | Tertiary |
| `accent` | Warm emphasis |
| `destructive` | Destructive action |
| `link` | Inline text action |

States: hover, active (`scale-[0.98]`), focus-visible ring, disabled, optional `loading` (`aria-busy`).

## Cards

[`src/components/ui/card.tsx`](../components/ui/card.tsx)

| Variant | Role |
|---------|------|
| `default` | Standard content card |
| `elevated` | Auth and important panels |
| `interactive` | Hover lift — project cards |
| `pastel` | Tinted surface; set `pastel="mint"` etc. |

## Badges

Pills. Use pastel variants (`pastelMint`, `pastelLavender`, …) for categories and **status labels** (Draft / Published / Open). Always show the text label — never color-only status.

## Admin workspace

Admin is operational, not marketing. Use the same tokens with compact density, warm `bg-background`, and neutral cards. Pastel only on status badges. No decorative blobs, display heroes, or placeholder nav items.

## Motion

CSS transitions only. No animation library.

- Duration ~180ms
- Buttons: small lift / press
- Cards: elevation + optional image zoom
- Links: color transition
- Respect `prefers-reduced-motion` (global reduce + `motion-reduce:` utilities)
- Classes: `motion-safe-transition`, `motion-safe-hover-lift`

FundIt should feel alive, not distracting. No bounce, parallax, or page-wide motion.

## Responsive breakpoints

| Width | Intent |
|-------|--------|
| 390px | Mobile — stacked nav, 44px touch targets |
| 768px (`md`) | Tablet — desktop nav appears |
| 1024px (`lg`) | Comfortable content |
| 1280px (`xl`) | Standard desktop |
| 1440px+ | `max-w-7xl` centered |

Mobile is a first-class layout, not a squeezed desktop.

## Accessibility

- WCAG-conscious contrast; dark text on pastels
- Visible `focus-visible` rings on controls and links
- Semantic HTML in empty/error/not-found states
- Mobile menus: `aria-expanded`, `aria-label`, body scroll lock
- Loading buttons: `aria-busy` and disabled
- Reduced motion honored globally

## Changing the palette

1. Edit hex values in `src/config/theme.ts`.
2. Tokens are converted to HSL CSS variables in the root layout.
3. Components already consume `bg-primary`, `bg-pastel-pink`, etc.

Do not introduce `components/v2` or a second styling system.
