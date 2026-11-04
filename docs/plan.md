# Squadra — v0.1 plan, rev 2 (styles and settings guardrail)

Nov 3, 2026 · @Piotr Grzegorczyk · supersedes the Oct 29 draft

## Summary

Squadra v0.1 is an open-source CLI that describes a Tailwind v4 web app's style as **8 settings**, records them in DESIGN.md, and turns each setting into lint rules that coding agents get fed back after every edit and **can't finish a turn while breaking**. Claude Code is first-class; Codex and other agents get AGENTS.md plus a pre-commit/CI backstop.

**Headline:** *Your app's style as 8 settings: read from your code, enforced on your agent.*

The enforcement loop on its own is no longer novel. Impeccable, `@shadcn/lint` and onsystem all ship parts of it. What no one ships is the step from **design decisions** (fill, edges, shadow, motion…) to **rules**. That is Squadra's differentiator, so the settings model leads and the guardrail is the proof.

The primary user is a solo developer or indie hacker building with agents. The goal is OSS and audience building in public, not revenue. **The first dogfood app is Piotr's new web app, started in November 2026 as a new app inside an existing monorepo, using the Pebble preset.** The order of work follows what that app needs: `init` from a preset first (monorepo-aware), then the Claude hook, then reading existing apps.

## What changed from the Oct 29 draft, and why

Six reviews (DX, design-language coverage, simplicity/scope, technical feasibility, rule precision, positioning) and a strategy review by GPT-6 Astra (High) fed into this revision.

| # | Change | Why |
| --- | --- | --- |
| 1 | Settings stored **explicitly**; `style:` is only a label for the preset you started from. No "store only diffs", no overrides layer | A guardrail must not change which rules block your agent when you upgrade the package. Diffs also hide the system from other DESIGN.md readers (shadcn's skill reads DESIGN.md) |
| 2 | DESIGN.md schema rewritten to be **valid `@google/design.md`**: light values in the spec's top-level `colors`/`rounded`/`spacing`/`typography`; dark values, shadows and motion in `x-squadra` | The draft's `tokens.color.x.{light,dark}` gets flattened by design.md 0.4.0, and `export` then fails with `INVALID_TOKEN_NAME`. design.md has no modes yet (issue #13) |
| 3 | **Tiered enforcement**: 7 high-precision rules block at end of turn (Stop hook, max 2 rounds); everything else is warning feedback after each edit | PostToolUse can't undo an edit. Stock shadcn components break about half of the original 21 rules. Warnings sent via exit 0 + stderr never reach Claude |
| 4 | **21 → ~14 rules**, readable slug IDs (`shadow/none`), and 2 rules turned into advice / `validate` checks | SQ-CLR-003 and SQ-FIL-002 can't be decided from class strings. SQ-TOK-001 as written also hits layout values and `data-[…]:` variants |
| 5 | Rules are an **ESLint plugin used as an internal engine**; classes are resolved through **Tailwind v4's own design system**, not regexes | `@shadcn/lint` is already an ESLint/Oxlint plugin built for agents. ESLint gives editor squiggles, `eslint-disable -- reason` and one pass alongside shadcn. Tailwind's resolver handles variants, `!`, `bg-(--x)` and v4 renames for free |
| 6 | **Settings switch rules on; they don't generate tokens in v0.1.** New apps get one hand-written preset CSS per style | Existing apps already have tokens in `@theme`, so generating them would fight the user's CSS. The `build` generator moves to v0.1.x with the studio, where it has something visible to drive |
| 7 | Advanced settings deferred; `material` folds into an **effects** block (`gradients`, `glow`, `blur`) | Fewer concepts. No v0.1 rule needs contrast, controls, headings or mode as settings |
| 8 | **Zones-lite**: path globs that change rule-switching settings, effects and severities (e.g. a marketing area allows gradients) | A typical indie repo is marketing site + app in one Next.js project. Without zones, half the rules get turned off |
| 9 | **Vendored components** (`components/ui/**`) get a definitions mode | Stock shadcn Card ships `shadow-sm`, Sheet uses `duration-500`, popovers zoom and slide. Adoption can't open with a wall of errors |
| 10 | Baseline = **counts per (file, rule, offending class)** plus diff-scoped blocking; hidden behind `init` | Node content hashes break when `prettier-plugin-tailwindcss` re-sorts classes or a class is added |
| 11 | **7 commands → 2 user-facing ones** (`init`, `check`) plus an internal `hook`; **1 npm package** (`squadra`, which you own) | 5 packages and 7 commands is overhead at 5 h/week |
| 12 | Codex hook, `squadra-setup` skill, plugin packaging, DTCG export and docs site leave v0.1 | Each is real work with little demo value. The setup skill can't run in a fresh clone anyway, because Squadra is what installs it |
| 13 | Milestones re-cut around the dogfood app, each with a public post; real checkpoints and kill criteria | The draft's "M1+M2 in two weeks" meant about 10 h of work against an estimate of 70–110 h |

## Decisions

| Topic | Decision |
| --- | --- |
| Name | **Squadra** (kept). Known collisions are accepted: `github.com/dagoSte/squadra` (a Claude Code plugin) and `usesquadra.com` (a design-collaboration product). npm: unscoped `squadra` (owned) is the only published package; the `usesquadra` npm org (owned) is held for future scoped packages. Code lives in Piotr's personal GitHub account (`piotr-g9k/squadra`); docs at squadra.g9k.it |
| Headline | Settings, extracted: "your app's style as 8 settings, read from your code, enforced on your agent" |
| Scope | Guardrail + settings model first. Studio/generator, components and Figma/Paper later, not blocked by v0.1 choices |
| Primary user | Solo devs and indie hackers building with agents |
| Goal | OSS + building in public · MIT |
| Platform | Web, Tailwind v4 (+ shadcn conventions) only in v0.1; React Native/Expo after web shows repeat users |
| Style model | 8 main settings with named steps + effects; presets ("styles") are starting points; settings stored explicitly |
| Enforcement | Tiered: Tier 1 blocks at Stop (max 2 rounds), Tier 2 warns after each edit, Tier 3 lives in DESIGN.md only. Per-rule `error / warn / off` |
| Agents | Claude Code first-class (hooks + skill). Codex/others: AGENTS.md + pre-commit + GitHub Action |
| Engine | ESLint plugin used internally by `squadra check`, with Tailwind v4 design-system resolution; `@shadcn/lint` reused where it fits (decided by the M0 spike) |
| Packaging | One npm package, `squadra`, with subpath exports (`squadra/eslint`) |
| Pace | ~5 h/week, heavily agent-assisted (T3 Code + Claude Code). Planned by milestones with optimistic target dates and explicit re-cut triggers |

## Style model

Users start from a **style** (a preset) or from their existing code, and end up with **8 explicit settings** plus **effects**. A setting either **switches rules on** or is **guidance only** in v0.1 (written into DESIGN.md's Do's and Don'ts and the preset CSS, but not linted). Saying so per setting keeps the abstraction honest.

**Surfaces.** In-flow surfaces are cards, sections and panels; floating surfaces are popovers, menus, dialogs, sheets and toasts. Controls (buttons, inputs, badges, toggles) are not surfaces. They are detected in this order:

1. shadcn `data-slot` at the definition site (`card` = in-flow; `*-content`, `toast` = floating).
2. Imports of those components at call sites.
3. Optional name/path globs.
4. A raw-element heuristic, which only ever warns.

### Settings in v0.1

| Setting | Steps | v0.1 role |
| --- | --- | --- |
| fill | flat / tonal / raised | **Rules**: no shadow on in-flow surfaces unless raised (`fill/no-surface-shadow`); hover lift (warn). Which surfaces get a fill is guidance only |
| edges | none / hairline / bold | **Rules (warn)**: borders on surfaces when none; >1px under hairline (spinners, rings and focus outlines exempt) |
| shadow | none / soft / strong / hard | **Rules**: `shadow/none` blocks every `shadow-*` / `drop-shadow-*` / `inset-shadow-*` |
| color | mono + accent / tinted / colorful | **validate check**: under mono, any non-primary/status/chart token must have OKLCH chroma < ~0.02. Usage is guidance |
| shape | sharp / soft / round | Guidance + preset radius tokens; arbitrary radius blocked by the always-on token rule |
| density | compact / comfortable / spacious | Guidance + preset spacing; not linted (Tailwind v4 spacing is open-ended) |
| type | neutral / editorial / technical / friendly | **Rules**: `type/declared-fonts` (font-family classes, `font-['X']`, `next/font` imports) |
| motion | none / minimal / standard / expressive | **Rules (warn)**: explicit durations above the cap, transform transitions under minimal, transitions under none. `animate-spin`/`pulse` are always allowed. Floating enter/exit (`animate-in`, `zoom-in-*`) is allowed under minimal |

**Effects:** `gradients: on|off`, `glow: on|off`, `blur: none|overlays|anywhere`. Functional fades (`mask-*`, a semantic color fading to transparent) are always allowed.

**Deferred to later** (expressible in preset CSS, not as settings): contrast, controls (match/pill), headings, a separate shadow/material scope for controls vs surfaces, a `floating` treatment override, a `bars` surface class, typography tracking/base size, elevation levels.

### Styles (presets)

Five presets, each = 8 settings + effects + one hand-written shadcn-shaped CSS file (`:root`/`.dark`, `@theme inline`, `@custom-variant dark`). A preset can also be a local file (`style: ./brand.yaml`, with `extends:`).

| Preset (was) | Feel | Settings |
| --- | --- | --- |
| **Paper** (Clean) | Vercel/shadcn default | flat, hairline, soft shadow, mono, soft, comfortable, neutral, minimal motion |
| **Pebble** (Soft) — *dogfood preset* | Friendly consumer app | tonal, no edges, soft shadow, tinted, round (pill controls in the CSS), spacious, friendly, standard motion |
| **Studio** (replaces Classic) | Dark-first pro tool, Linear/Raycast | tonal, hairline, soft shadow, mono, soft, compact, technical, minimal motion, blur: overlays |
| **Ledger** (Sharp) | Dense, technical, ruled | flat, hairline, no shadow, mono, sharp, compact, technical, no motion |
| **Poster** (Bold) | Neo-brutalist/playful | tonal, bold edges, hard shadow, colorful, round, comfortable, friendly, expressive motion |

All presets start with effects `gradients: off, glow: off, blur: none` (Studio: `blur: overlays`). Names are nouns so they never clash with step names (soft, sharp, bold). Under `minimal` motion, floating enter/exit animations (`animate-in`, `zoom-in-*`, `slide-in-from-*`) are allowed, so Paper and Studio accept stock shadcn popovers and dialogs.

**Claim wording:** settings can **describe** the 14 reference products (Vercel … Material 3 Expressive). "Lints them without false positives" is only claimed once checked on real repos (M2).

## DESIGN.md schema

The file stays valid `@google/design.md` (pinned 0.4.x). Spec fields hold light/default values so other tools (shadcn's skill, design.md `lint`/`diff`) see the system. `x-squadra` holds everything the spec can't express yet. Field names must match the spec exactly (M0 task).

```yaml
---
version: alpha
name: Acme App
colors:                      # spec field: light/default values
  background: "#ffffff"
  foreground: "#0a0a0a"
  primary: "#2563eb"
  muted: "#f4f4f5"
  border: "#e4e4e7"
  chart-1: "#2563eb"         # chart-* and label-* roles are first-class
rounded: { sm: 4px, md: 6px, lg: 8px }
# spacing, typography: spec fields, copied from the app's CSS or the preset

x-squadra:
  version: 1
  style: pebble              # label: the preset this file started from
  settings:                  # always all 8, explicit
    fill: tonal
    edges: none
    shadow: soft
    color: tinted
    shape: round
    density: spacious
    type: friendly
    motion: standard
  effects: { gradients: false, glow: false, blur: none }
  fonts: [Inter, JetBrains Mono]
  icons: { library: lucide-react, brands: simple-icons }
  modes:
    dark:
      colors: { background: "#0a0a0a", foreground: "#fafafa", primary: "#3b82f6" }
  vendored: ["components/ui/**"]
  zones:
    - paths: ["app/(marketing)/**"]
      effects: { gradients: true, glow: true }
      settings: { motion: expressive }
  rules:
    motion/*: warn
    fill/no-surface-shadow: error
---
```

Zones change only rule-switching settings, effects and severities. Tokens stay global, because there is one `@theme`.

The Markdown body follows design.md's sections. Squadra generates **Do's and Don'ts**, and every line carries its rule ID, so the agent reads intent and `check` enforces the same line. Tier-3 guidance lines carry no ID:

```markdown
## Do's and Don'ts
- Don't put shadows on cards or sections; separate them with tone and a hairline border. [fill/no-surface-shadow]
- Don't use gradients outside the marketing pages. [effects/no-gradients]
- Do keep cards on bg-muted, not bg-background, so they read against the page.
```

## Rules (v0.1)

**Mechanics.**
- Each class is resolved through Tailwind v4's design system (`@tailwindcss/node` `__unstable__loadDesignSystem` → `parseCandidate` / `candidatesToCss`), so rules check CSS properties (`box-shadow`, `transition-duration`, `backdrop-filter`, `background-image`…).
- Resolution runs in a worker via `synckit` and is cached by theme hash, behind one adapter. Pin `tailwindcss >=4.1 <5`.
- Classes come from `className`/`class`, the `cn`/`clsx`/`cx`/`twMerge` family, `cva`/`tv` (base, variant values, compoundVariants) and template/conditional strings. Context-free rules scan every string literal, so tone maps are caught too.
- Arbitrary *variants* (`data-[state=open]:`, `[&_svg]:`) are never flagged.
- When rules overlap, only the most specific one is reported (`shadow/none` over `fill/no-surface-shadow`).

**Tier 1: blocks at Stop** (and is reported after each edit):

| ID (old) | Fails when | Notes |
| --- | --- | --- |
| `color/no-undeclared` (CLR-001) | Palette classes or hex/rgb literals that aren't declared tokens | Allow `white`, `black`, `transparent`, `current`, `inherit`, and opacity modifiers (`bg-primary/10`). Possibly via `@shadcn/lint` `no-raw-colors` |
| `tokens/no-arbitrary-*` (TOK-001) | Arbitrary values in token families: color, radius, font size/weight/family, tracking, leading, shadow, border/ring/outline width | Layout/geometry is always allowed (size, inset, translate, grid, z-index, `url()`, `[--x:…]`), as are values made only of token references (`var(--x)`, `(--x)`, `--spacing()`). Arbitrary *spacing* is Tier 2 |
| `shadow/none` (SHD-001) | Any shadow when `shadow: none` | |
| `effects/no-gradients` (FX-001) | `bg-linear/radial/conic-*`, `bg-gradient-to-*`, `from/via/to-*`, `bg-[linear-gradient…]` when gradients are off | Functional fades allowed |
| `effects/no-backdrop-blur` (MAT-001) | `backdrop-blur-*` when `blur: none` | Location under `overlays` is Tier 2 |
| `type/declared-fonts` (TYP-001) | Undeclared font families | Weights (`font-medium`) are not families |
| `icons/single-library` (ICN-001) | Imports from an undeclared icon library | A brand library is allowed |

**Candidate for Tier 1 after the precision gate:** `fill/no-surface-shadow` (FIL-001), scoped to Card (`data-slot="card"`) and its call sites. This is the headline demo rule.

**Tier 2: warnings fed back after each edit:**
- `fill/no-surface-shadow` (heuristic surfaces)
- `fill/no-hover-lift` (FIL-003)
- `edges/none` (EDG-001)
- `edges/hairline` (EDG-002)
- `surface/floating-treatment` (SRF-001, `components/ui` only)
- `effects/blur-location`
- `effects/no-glow` (FX-002: shadow or blur on a chromatic token)
- `color/no-dark-override` (CLR-002)
- `motion/*` (MOT-001/002/003)
- `tokens/no-arbitrary-spacing`
- `style/no-inline-literal` (STY-001: literal values on tokenised properties only; `--*` keys, `var()` and data-driven values exempt)
- `meta/new-suppression`: a new `eslint-disable` for a Squadra rule; CI fails it without a `-- reason`

**Tier 3: DESIGN.md guidance only.** Which surfaces get fills (FIL-002); color usage under mono (CLR-003, now a `validate` token check); spacing rhythm; density.

**Precision gate before a rule can block:** ≥98% precision over ≥30 hand-labelled findings, 0 false positives on the agent-generated corpus, ≥80% recall on injected violations. A rule that misses the gate ships as warn. `--strict` promotes Tier 2 for people who want it.

**Vendored components.** Files under `vendored` globs, and files that match the shadcn registry (`npx shadcn add` runs through Bash, so the Edit hook never sees them), run in a *definitions* mode. Only setting rules apply there (shadow, Card fill, edges, blur, motion durations); shadcn idioms (`ring-[3px]`, `text-white`, `dark:bg-input/30`, inline `--sidebar-width`) are skipped. Leftover findings sit in a separate `vendored` baseline section. Later, `squadra fix --ui` rewrites vendored components for the chosen settings as one reviewable diff.

## Commands and agent integration

| Command | What it does |
| --- | --- |
| `squadra init [--style X] [--agent claude\|codex\|generic] [--local] [--yes]` | **New app:** writes DESIGN.md + the preset CSS. **Existing app (M2):** reads the app's CSS/`@theme` and class usage, proposes settings with evidence as YAML comments ("cards: 41 `bg-muted`, 38 `border`, 2 `shadow-sm` → fill: tonal"), shows "Closest style: Paper, 3 differences", writes tokens from existing values (no visual change). In both cases it then records the baseline, installs the agent integration and the skill, and adds a CLAUDE.md/AGENTS.md pointer. The git diff is the confirmation step; no interactive wizard. `--local` writes hooks to `.claude/settings.local.json` (uncommitted, for trying it in a shared repo). Safe to re-run to add an agent |
| `squadra check [files] [--changed] [--format text\|json\|agent] [--strict] [--update-baseline]` | Validates DESIGN.md (schema, design.md lint, mono chroma check, odd-combination warnings), then runs the rules |
| `squadra hook claude\|codex` | Internal entry point for hooks. Reads the hook JSON from stdin and checks only the edited file(s) |

**Claude Code** (files committed to the repo; no plugin in v0.1):

- **PostToolUse** on `Edit|Write|MultiEdit`, run through the local binary (never `npx`) and filtered by file extension:
  - checks only `tool_input.file_path`;
  - reports only violations that are new against the baseline *and* inside the edited range;
  - sends Tier 1 back as `decision: "block"` + reason, and Tier 2 as `hookSpecificOutput.additionalContext` (exit 0);
  - records the touched files for the session.
- **Stop**: re-checks every file touched in the session. On new Tier-1 errors it blocks with a summary, honouring `stop_hook_active`, for at most 2 rounds. After that it lets the turn end and prints a user-visible warning, so a false positive can't loop.
- **PreToolUse**: asks the user before the agent edits DESIGN.md or `.squadra/baseline.json`.
- **Loop breaker**: if the same violation fails twice, the message tells the agent to stop and propose a DESIGN.md change to the user.
- **Developer override**: `SQUADRA=off` or `squadra pause`. Latency target < 1 s p95 per edit, no daemon.

**Codex / generic:**
- An AGENTS.md section with the style, settings and Do's/Don'ts, plus "run `squadra check --changed` before finishing".
- A pre-commit hook and a GitHub Action template.
- A Codex PostToolUse hook (`.codex/hooks.json`, verified to exist) comes after v0.1. It needs folder trust and re-review whenever the hook changes, and `codex exec` support is unconfirmed.

**`--format agent`.** At most about 10 items. Nothing is printed when there are no new violations. Example:

```text
squadra: 1 blocking issue in app/pricing/page.tsx — change only these lines
✖ shadow/none  L42  `shadow-lg` on <div class="rounded-lg border p-6 shadow-lg">
  Why: this app uses shadow: none (DESIGN.md › x-squadra.settings).
  Fix: remove `shadow-lg`; separate the card with `bg-muted` (fill: tonal).
If the design really needs a shadow, stop and ask the user to change `shadow` in DESIGN.md. Don't add eslint-disable.
```

**Skill.**
- `squadra` (Agent Skills `SKILL.md`), written to both `.claude/skills/` and `.agents/skills/`. It stays generic and points to DESIGN.md:
  - read DESIGN.md before UI work;
  - translate "make it pop" into allowed tokens;
  - apply the suggested fix;
  - never add suppressions on its own;
  - propose DESIGN.md changes instead of working around rules.
- The `squadra-setup` skill and plugin packaging (Claude/Codex marketplaces) come after v0.1.

## Architecture

- **One package**, `squadra` (TypeScript, Node 20+), with internal folders:
  - `model/`: schema, presets, settings → rules, Do's/Don'ts generator
  - `rules/`: one module per rule, good/bad fixtures
  - `resolve/`: Tailwind design-system adapter + synckit worker
  - `scan/`: class collector; `oxc-parser` for the whole-repo scan in `init`
  - `baseline/`
  - `agents/`: Claude/Codex/generic templates + hook entry
  - `cli/`

  Subpath export `squadra/eslint` for people who want squiggles in their editor.
- **`squadra check`** runs ESLint programmatically (`new ESLint({ overrideConfig })`) with Squadra's plugin (+ the `@shadcn/lint` rules it reuses). Results then go through the baseline filter and a text/json/agent formatter. Users don't need their own ESLint config; Biome-only users still get `check`.
- **Baseline** `.squadra/baseline.json`: counts per (file, rule, normalized offending class). A violation is new when its count rises, and blocking only applies inside edited ranges. `--update-baseline` only shrinks it.
- **Wrapped / reused:**
  - `@google/design.md` (exact pin, used for `lint`/`diff` only, not `export`, which is light-only)
  - `@shadcn/lint` (exact pin, rules reused per the M0 spike)
  - Tailwind's design-system API (behind one adapter, `__unstable__`)
- **Deferred:** DTCG export (until Figma sync), the settings → tokens generator, and opt-in theme resets (`--shadow-*: initial`), which let Tailwind itself reject off-system classes.

## Milestones

Target dates are optimistic on purpose (agent-assisted). **Re-cut rule:** if a milestone slips by more than 1 week, cut its scope rather than move the date. The first things to cut are zones and Tier-2 rules, then `extract`.

### M0 — Foundations + dogfood seed (target Sun Nov 15, ~10 h)

- Repo, CI. DESIGN.md schema checked field by field against design.md 0.4.x. `init --style pebble` writes DESIGN.md + the Pebble preset CSS (lifted from the dogfood app's hand-written `globals.css`) + the `squadra` skill + a CLAUDE.md pointer.
- **Monorepo support from day one** (the dogfood app needs it): `init` runs in an app folder (`apps/<app>`); every command and hook finds the **nearest DESIGN.md above the edited file** and does nothing for files with none, so other apps in the repo are untouched; the Tailwind CSS entry is configurable per DESIGN.md (`x-squadra.css: app/globals.css`); `vendored` globs can point outside the app (e.g. `../../packages/ui/src/components/**`).
- Tailwind resolver adapter; class collector; `check` with 3 Tier-1 rules (`color/no-undeclared`, `effects/no-gradients`, `shadow/none`).
- **Spike:** run `@shadcn/lint` + the 3 rules on shadcn `apps/v4` and 2 OSS Tailwind v4 apps, then decide what to reuse vs own.
- **Done when:** `squadra check` runs on the dogfood app from the monorepo root and only reports on that app; its agent reads DESIGN.md; on 50 hand-checked hits, < 5% are false positives.
- **Post:** "Every famous app is 8 settings": a grid of 14 products mapped to settings.

### M1 — The hook loop + public alpha (target Sun Dec 6, ~15 h)

- All 7 Tier-1 rules + Card-scoped `fill/no-surface-shadow`; severity config; vendored definitions mode; baseline (counts + diff scope); `--format agent`.
- `squadra hook claude` with PostToolUse feedback, the Stop gate (2 rounds), the PreToolUse guard on DESIGN.md and the loop breaker.
- Daily use in the dogfood app.
- **Done when:**
  - In a demo repo using Pebble, "add a pricing section with a gradient hero and cards with a nice shadow" gets the gradient blocked (`effects/no-gradients`) and the card shadow blocked if `fill/no-surface-shadow` passed the gate (warned otherwise); Claude fixes both on its own in ≥4 of 5 runs.
  - Flipping `effects.gradients: true` (or a marketing zone) in DESIGN.md makes the gradient pass.
  - Hook output stays under 15 lines; p95 latency is under 1 s.
- **Post:** `squadra@0.0.x` on npm + the 60-second GIF in three beats: init → block-and-fix → flip a setting. Show the rendered UI before and after the fix next to the terminal; a terminal rejecting a class alone doesn't prove anything.

### Checkpoint (target Sun Dec 20)

Two weeks with the hook on in the dogfood app. Publish the numbers (blocks, false positives, fixes without help).

**Kill/pivot signals:**
- Piotr turns the hook off because of false positives.
- After the GIF: fewer than ~30 outside users or stars, and no outside issues.

**Pivots:**
- (a) warn-only reporting;
- (b) skill + DESIGN.md template, no CLI;
- (c) focus on agent-generated landing pages.

### M2 — Existing apps + breadth (target mid-January 2027, ~15 h)

- `init` on existing apps (evidence, closest style, tokens read from CSS).
- Tier-2 rules; zones-lite; `validate` mono chroma check.
- Codex/generic: AGENTS.md + pre-commit + GitHub Action.
- Precision run on **6 public Tailwind v4 repos** spanning design languages (dashboard, marketing site, dense app…) + 30 agent-generated pages. Every misfire becomes a regression fixture.
- **Done when:**
  - On 2 real apps, inferred settings match a hand-written DESIGN.md with at most 1 setting off.
  - Tier-1 rules pass the precision gate.
  - Codex is stopped by pre-commit.
- **Post:** "I ran Squadra on 6 popular OSS apps: here's how many false positives" + "it read 41 cards and guessed `fill: tonal`".

### M3 — v0.1 launch (target mid-February 2027, ~10 h)

- All 5 presets (renamed, with the dark-first one); README as the docs.
- A fresh clone running `npx squadra init --agent claude` gets a working hook in under 2 minutes.
- A **preset image grid** in the README and launch post: 5 presets × the same reference components (card, button, input, popover), screenshotted from the demo app. The interactive gallery/playground comes right after launch, with the studio (v0.1.x).
- **Launch:** X + Bluesky, r/ClaudeAI / r/ClaudeCode / r/tailwindcss, shadcn Discord, PRs to awesome-design-md and skills lists, one Show HN. Skip Product Hunt (another Squadra is listed).

**Test strategy for all milestones:**
- Every rule is written test-first with good/bad fixtures.
- Snapshot of all shadcn registry components × 5 presets.
- Mutation set for recall.
- Corpora pinned by SHA.

## Not doing in v0.1

Settings → tokens generator, `build`, DTCG; overrides, three-layer resolution and storing diffs; advanced settings; Codex PostToolUse hook; `squadra-setup` skill and plugin packaging; interactive prompts; docs site; studio (only the stretch static gallery); multiple packages; AST content hashes; a style registry; React Native.

## Risks

| Risk | Mitigation |
| --- | --- |
| False positives make the gate unbearable | Tiering + precision gate; Stop gate capped at 2 rounds; vendored mode; diff-scoped blocking; dogfood checkpoint with kill criteria |
| Crowded space (Impeccable, `@shadcn/lint`, onsystem) | Lead with settings → rules. Reuse shadcn rules rather than compete; document running next to Impeccable's hook |
| shadcn ships "preset → lint rules" itself | Stay compatible (data-slot, shadcn variable names, map shadcn's preset styles in `init`); keep the integration thin and the format portable |
| Upstream churn (`@shadcn/lint` pre-1.0, design.md alpha, Tailwind `__unstable__` API) | Exact pins; one adapter per dependency; `x-squadra` isolated; re-test on every bump |
| Name collisions (`dagoSte/squadra`, `usesquadra.com`) | Accepted. Brand on the personal account + `squadra` on npm, not on the `usesquadra` handle; always say "Squadra for DESIGN.md / Tailwind" in launch copy |
| The agent games the rules (edits the baseline/DESIGN.md, suppressions, fakes it with inline style) | PreToolUse guard, `meta/new-suppression`, inline-literal rule, CSS/`@apply` linted at warn |
| Abstraction leaks (a raised pricing card under flat, charts under mono) | Zones, chart/label roles, explicit per-rule severity, the "propose a DESIGN.md change" path |
| Side-project time | Re-cut rule; one milestone at a time; one weekly hour reserved for posts and user conversations |

## Metrics

- **North star:** public repos with an `x-squadra` DESIGN.md.
- **Launch + 3 months:** 300–800 stars, 150–500 npm downloads/week, 25–50 `x-squadra` repos, 20+ issues from people outside the project.
- **Before that:** 10 alpha testers, at least 3 of them still using it after the second week.

## Later

- **v0.1.x**:
  - `squadra studio` (local) + playground on squadra.g9k.it, exporting DESIGN.md;
  - the settings → tokens generator (`build`) with opt-in theme resets;
  - `squadra fix --ui`;
  - Claude/Codex plugin packaging + `squadra-setup` skill;
  - Codex PostToolUse hook.

  Start the studio once ≥3 outside users have adopted Squadra and ask to adjust their settings visually.
- **v0.2:**
  - React Native/Expo, gated on repeat web users (Uniwind vs NativeWind v5 decided then);
  - shadow/material scope split for surfaces vs controls, a `bars` surface class, a `floating` setting;
  - typography tracking/base size, focus-ring style, more presets;
  - remote presets (`npm:`/`github:`); declared button variants; `diff`.
- **v0.3:** a component layer that reads the settings (one Card that renders flat, tonal or raised).
- **v0.4:** Figma/Paper variable sync through DTCG 2025.10 + the Resolver module.

## Decisions log

**Nov 3 (founder review of rev 2):**
1. Dogfood app = a new web app inside Piotr's existing monorepo, preset **Pebble**. → M0 adds monorepo support.
2. Presets renamed to Paper / Pebble / Studio / Ledger / Poster; Classic replaced by the dark-first Studio.
3. Under `minimal` motion, floating enter/exit animations are allowed (Paper keeps minimal).
4. `@shadcn/lint` reuse decided by the M0 spike; its `no-restyle` stays off by default.
5. GitHub: personal account; npm: unscoped `squadra` + `usesquadra` org held in reserve; docs at squadra.g9k.it. Revisit an org only if contributors arrive.
6. Launch ships a static preset image grid, not an interactive gallery; the gallery/playground follows with the studio.

**Still open:** publish the kill criteria in the README roadmap? → Recommended yes.
