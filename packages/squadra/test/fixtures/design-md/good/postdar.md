---
version: alpha
name: PostDAR
description: Pebble design system for the PostDAR auction app (Duszpasterstwo Akademickie). Light mode values; dark overrides live in x-squadra.modes.dark.
colors:
  background: "#FFF1DC"
  foreground: "#0D2D55"
  card: "#FFFCF7"
  card-foreground: "#0D2D55"
  popover: "#FFFFFF"
  popover-foreground: "#0D2D55"
  primary: "#0D2D55"
  primary-foreground: "#FFF1DC"
  secondary: "#D7E7FB"
  secondary-foreground: "#0D2D55"
  muted: "#F6E3C4"
  muted-foreground: "#52627C"
  accent: "oklch(0.9 0.05 79)"
  accent-foreground: "#0D2D55"
  border: "oklch(0.2982 0.0815 255.86 / 0.15)"
  input: "oklch(0.2982 0.0815 255.86 / 0.52)"
  ring: "oklch(0.2982 0.0815 255.86 / 0.55)"
  overlay: "oklch(0.2982 0.0815 255.86 / 0.4)"
  destructive: "#C8102E"
  destructive-foreground: "#FFF1DC"
  highlight: "#B84605"
  highlight-foreground: "#FFF1DC"
  highlight-hover: "oklch(0.5 0.155 42.37)"
  brand-navy: "#0D2D55"
  brand-sky: "#D7E7FB"
  brand-sand: "#FFF1DC"
  brand-orange: "#DA550A"
  brand-pink: "#FFBCD0"
  brand-green: "#90DCA0"
  brand-violet: "#E8D7F6"
  brand-heart: "#FF1F3A"
  chart-1: "#0D2D55"
  chart-2: "#B84605"
  chart-3: "oklch(0.6 0.13 150)"
  chart-4: "oklch(0.6 0.17 0)"
  chart-5: "oklch(0.55 0.13 310)"
typography:
  display:
    fontFamily: DM Serif Display
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  title:
    fontFamily: DM Serif Display
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.015em
  heading:
    fontFamily: DM Serif Display
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.01em
  subheading:
    fontFamily: DM Serif Display
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: DM Sans Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: DM Sans Variable
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
  price:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    fontFeature: '"tnum" 1'
rounded: { sm: 8px, md: 12px, lg: 16px, xl: 24px, full: 9999px }
spacing:
  control-height: 44px
  card-padding: 24px
  card-padding-desktop: 32px
  page-gutter: 24px
  page-gutter-desktop: 32px
  page-max-width: 1152px
components:
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
  page-muted-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.meta}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"
  card-muted-text:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
  popover:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
    rounded: "{rounded.xl}"
  muted-surface:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
  menu-item-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "{spacing.control-height}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "{spacing.control-height}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "{spacing.control-height}"
  button-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.highlight-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "{spacing.control-height}"
  button-highlight-hover:
    backgroundColor: "{colors.highlight-hover}"
    textColor: "{colors.highlight-foreground}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "{spacing.control-height}"
  text-highlight:
    backgroundColor: "{colors.card}"
    textColor: "{colors.highlight}"
  text-destructive:
    backgroundColor: "{colors.background}"
    textColor: "{colors.destructive}"
  badge-sky:
    backgroundColor: "{colors.brand-sky}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
  badge-sand:
    backgroundColor: "{colors.brand-sand}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
  badge-pink:
    backgroundColor: "{colors.brand-pink}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
  badge-green:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
  badge-violet:
    backgroundColor: "{colors.brand-violet}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.full}"
  poster-navy:
    backgroundColor: "{colors.brand-navy}"
    textColor: "{colors.brand-sky}"
    typography: "{typography.display}"
  poster-navy-sand:
    backgroundColor: "{colors.brand-navy}"
    textColor: "{colors.brand-sand}"
    typography: "{typography.display}"
  poster-orange:
    backgroundColor: "{colors.brand-orange}"
    textColor: "{colors.brand-sand}"
    typography: "{typography.display}"
x-squadra:
  version: 1
  style: pebble
  settings:
    fill: tonal
    edges: none
    shadow: soft
    color: tinted
    shape: round
    density: spacious
    type: friendly
    motion: standard
  effects: { gradients: false, glow: false, blur: none }
  fonts: [DM Serif Display, DM Sans Variable]   # exactly as declared in CSS
  icons: { library: lucide-react }
  css: src/styles.css
  vendored: ["src/components/ui/**"]
  modes:
    dark:
      colors: { background: "#0D2D55", foreground: "#D7E7FB", card: "#173A68", card-foreground: "#D7E7FB", popover: "#1E4478", popover-foreground: "#D7E7FB", primary: "#D7E7FB", primary-foreground: "#0D2D55", secondary: "#23497F", secondary-foreground: "#D7E7FB", muted: "#143762", muted-foreground: "#9DB3D3", accent: "oklch(0.34 0.088 256)", accent-foreground: "#D7E7FB", border: "oklch(0.9221 0.0322 254 / 0.15)", input: "oklch(0.9221 0.0322 254 / 0.5)", ring: "oklch(0.9221 0.0322 254 / 0.55)", overlay: "oklch(0.16 0.05 256 / 0.6)", destructive: "oklch(0.8 0.14 15.4)", destructive-foreground: "#0D2D55", highlight: "#F2884A", highlight-foreground: "#0D2D55", highlight-hover: "oklch(0.77 0.135 50)", chart-1: "#D7E7FB", chart-2: "#F2884A", chart-3: "#90DCA0", chart-4: "#FFBCD0", chart-5: "#E8D7F6" }
---

## Overview
Warm, friendly and calm, like the community's posters: navy type on sand, flat fields of brand color, serif headlines. Surfaces separate by tone, never by borders or shadows.

The system is split in two files. `src/styles.css` is the reusable Pebble foundation: the semantic tokens, radius, shadow, type scale and motion, plus a reset that removes Tailwind's default palette, shadow and blur scales so only declared tokens exist. `src/brand.css` is PostDAR-specific: the self-hosted fonts and the `brand-*` poster palette. `/design` (dev and preview builds only) renders every token with its measured contrast.

## Colors
Brand hexes are used exactly where they are fills (navy, sky, sand, the poster blocks, the logo heart). Everything else is tuned in OKLCH with the brand hue kept. Approximate sRGB for the OKLCH values: accent `#F0DBB9` (dark `#153864`), highlight-hover `#A73B00` (dark `#F89961`), dark destructive `#FF96A0` (`#FF7A88` lifted so it reads on popovers), chart-3 `#3B9555`, chart-4 `#CC4A7C`, chart-5 `#8959AA`.

- **background / foreground**: the posters' sand field with navy type; in dark mode the navy field with sky type.
- **card**: tonal, visibly lighter than the page. No border, no shadow.
- **popover**: floating surfaces (popover, menu, dialog, sheet, toast).
- **primary**: navy (sky in dark). **secondary**: sky, the popular second color.
- **accent**: a neutral hover tone near muted (near card in dark), not a brand color.
- **border / input / ring**: navy (sky in dark) at 15 / 52 / 55 % alpha (input is 50 % in dark). Borders are only for inputs and dividers. Ring was raised from 45 % to 55 % so the focus indicator reaches 3:1; input was raised from 22 % so field outlines reach the 3:1 that WCAG 1.4.11 asks of form-field boundaries.
- **overlay**: the scrim behind dialogs and sheets. Navy, never black.
- **destructive**: from the logo heart's red family.
- **highlight**: burnt orange for the single most important action or state. **highlight-hover** darkens (lightens in dark mode); a translucent hover would drop the text below 4.5:1.
- **brand-***: the poster palette, identical in both modes. Use for poster blocks and category tags only. **brand-heart** is for the logo only.
- **chart-1…5**: declared for later; no chart components yet.

Text on poster blocks: navy on sky, sand, pink, green and violet; sky or sand on navy; sand on brand orange only as large text (3.57:1), so an orange block renders all of its text at 24 px or more. Small text on an orange area uses highlight instead.

Every pair the UI uses is measured by `pnpm --filter postdar-web contrast`, compositing translucent tokens over the surface they sit on. The script fails on any text, large-text, focus-ring or input-border pair below its threshold; the input border measures 3.1–3.9:1.

## Typography
- **Headings**: DM Serif Display, weight 400 only, `font-synthesis: none` (set on `html`). Tight leading (1.05–1.15) and slight negative tracking at large sizes. `display` and `title` are fluid in CSS: `clamp(2.75rem, 1.9rem + 3.6vw, 4.5rem)` and `clamp(2rem, 1.6rem + 1.8vw, 3rem)`; the tokens above give their maximum.
- **Body**: DM Sans Variable, 16 px / 1.5.
- **Meta lines**: DM Sans in sentence case, items joined with ` | `, as in "czwartek 28.11 | 19:15 | aula św. Tomasza". There are no eyebrow labels.
- **Prices**: DM Sans, `tabular-nums`, semibold (the `price` utility or `<Price>`), formatted as pl-PL złoty.

Fonts are self-hosted from `@fontsource/dm-serif-display` and `@fontsource-variable/dm-sans`, latin and latin-ext subsets only (Polish).

## Layout
Spacious. Controls are 44 px tall. Cards use 24 px padding on mobile and 32 px from `md`. Pages sit in a 1152 px column with 24 px gutters (32 px from `md`). Poster blocks are full-bleed with their content aligned to that column.

## Elevation & Depth
Flat by default. Only floating surfaces get the soft navy-tinted `shadow-float` (popover, dropdown, dialog, sheet, toast); cards and sections never get a shadow. Light: `0 16px 40px -16px` navy at 28 % plus `0 2px 8px -2px` navy at 12 %. Dark: the same geometry in a deeper navy at 70 % and 40 %. No gradients, glows or backdrop blur.

## Shapes
Radius scale from `--radius: 1rem`: 8 / 12 / 16 / 24 px (`sm` / `md` / `lg` / `xl`). Buttons and badges are pills (`full`). Inputs are `rounded-lg` with a 1 px border. Cards, popovers, menus and dialogs are `rounded-xl`. Menu items are `rounded-md`.

## Components
Vendored shadcn/ui (`new-york`) in `src/components/ui`, adjusted to Pebble:
- **Button**: pill, 44 px; variants default (navy), secondary (sky), highlight (orange, for "Licytuj"), outline, ghost, destructive, link; sizes xs, sm, default, lg and icon sizes.
- **Card**: `bg-card`, no border, no shadow; title in DM Serif.
- **Input**: 1 px `border-input`, `rounded-lg`, 44 px, focus turns the border to `ring`.
- **Popover, DropdownMenu, Dialog, Sheet**: `bg-popover`, `shadow-float`, no border; Sheet opens in 300 ms.
- **Badge**: pill; default, secondary, highlight, outline, destructive and one variant per brand pastel (sky, sand, pink, green, violet) with navy text.
- **Toaster (Sonner)**: popover colors, `rounded-xl`, `shadow-float`, DM Sans, ≤300 ms; reads the app's theme context.

Brand components in `src/components/brand`: `Logo` (mark in `currentColor`, heart in brand-heart), `Rule` (hairline with dot terminals), `Meta`, `PosterBlock` (tones navy, sky, sand, orange, pink, green, violet) and `Price`.

Theme: Jasny / Ciemny / Systemowy, default Systemowy, stored in `localStorage` and applied by a pre-paint `<head>` script.

## Do's and Don'ts
- Don't put shadows or borders on cards and sections; use bg-card on bg-background. [fill/no-surface-shadow]
- Don't use Tailwind palette colors (bg-blue-500, text-orange-600) or hex values; use the tokens above. [color/no-undeclared]
- Don't use arbitrary values for color, radius, font size or shadow. [tokens/no-arbitrary-*]
- Don't use gradients. [effects/no-gradients]
- Don't use backdrop blur. [effects/no-backdrop-blur]
- Do use only the declared font families. [type/declared-fonts]
- Do use only lucide-react icons in the UI. [icons/single-library]
- Do give popovers, menus, dialogs and sheets the soft navy shadow, without a border.
- Do make buttons pills; inputs keep a 1px border and rounded-lg.
- Never bold the serif headline font.
- Don't use eyebrow labels (small uppercase tracked text); use a sentence-case meta line with ` | ` separators.
- Use the orange highlight only for the single most important action or state on a screen (bid, ending soon). The `/design` styleguide is the one exception: it shows every variant as a specimen.
- Put brand pastels only on large blocks and tags, with the text colors listed for each tone.
- On a brand-orange block, all text is large (24px or more).
- Don't place a navy poster block directly on the dark page or a sand block on the light page; they merge with the background.
- brand-heart is for the logo only.
- Emoji are fine in user content, never as UI icons.
- Use hairline rules and ` | ` separators for structure, as the posters do.
