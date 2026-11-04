# Squadra: build guide, M0 to the checkpoint

Nov 3, 2026 · companion to [`plan.md`](plan.md), which says what to build and why. This guide gives the order and how each session runs.

| When | Step | Time | Output |
| --- | --- | --- | --- |
| This week | 1. Start the dogfood app with a **hand-written** DESIGN.md | ~2–3 h (app time) | DESIGN.md + Pebble CSS in the app |
| Nov 5–15 | 2. Build M0 in 5 sessions | ~10 h | `squadra check` running on the dogfood app |
| Nov 16 – Dec 6 | 3. Turn the Claude hook on in the dogfood app; ship the alpha | ~15 h | `squadra@0.0.x`, GIF |
| Dec 20 | 4. Checkpoint | 1 h | Published numbers, go/pivot |

**Repo setup, still open:**
- [ ] npm 2FA on the account that owns `squadra`.
- [ ] npm trusted publishing for `piotr-g9k/squadra`. Do this after S1 adds the publish workflow, because npm asks for its filename. No npm token goes in the repo.

## Layout and tooling

A pnpm workspace. Only one package is ever published. S1 creates everything except `docs/`.

```text
squadra/
  packages/squadra/            # npm: squadra (the only published package)
    src/{model,rules,resolve,scan,baseline,agents,cli}/
    presets/pebble.css         # first preset, lifted from the dogfood app
    test/fixtures/<rule-id>/{good,bad}/*.tsx
  examples/demo/               # Next.js + Tailwind v4 + shadcn, for the GIF (M1)
  corpus/                      # gitignored; script clones OSS apps pinned by SHA
  docs/{plan,decisions,start-guide,dogfood-log}.md
  CLAUDE.md
  README.md
```

**Tooling:** pnpm, TypeScript, Node 20+, tsdown (or tsup) to build and vitest for tests. A GitHub Action publishes on a git tag through npm trusted publishing. No changesets and no monorepo release tooling.

## Step 1: the dogfood app (this week, in its own project)

The app is PostDAR's new `apps/web` (TanStack Start + Convex + Tailwind v4 + shadcn `new-york`) in Piotr's existing **private** `postdar` monorepo, on Pebble. It's set up from its own prompt in a separate project. Squadra doesn't exist yet when the app starts, and that's fine. The hand-written DESIGN.md tests the format on a real app before any code exists.

The app repo is private, so nothing here links to it. Three things are **copied** into this repo, and copying makes them public:
- its DESIGN.md, which becomes the first schema fixture (S1);
- its Pebble foundation CSS (`src/styles.css`, kept apart from the PostDAR-specific `src/brand.css`), which becomes `packages/squadra/presets/pebble.css` (S5);
- lines in [`dogfood-log.md`](dogfood-log.md).

## Step 2: build M0 (Nov 5–15, ~10 h, 5 sessions)

Run one T3 thread per session. Start each one with: read the plan and decisions, use plan mode, write tests first. Independent rules can run in parallel worktree threads. Review the fixtures yourself.

| # | Session goal | Done when |
| --- | --- | --- |
| S1 | Scaffold (prompt below), DESIGN.md schema (zod) + `validate` that also runs `@google/design.md` lint | The dogfood DESIGN.md is the first schema fixture and validates |
| S2 | Tailwind resolver adapter (`__unstable__loadDesignSystem` from the app's CSS, in a synckit worker) + class collector (`className`, `cn`/`clsx`, `cva`/`tv`, template strings) | A test resolves `hover:shadow-md`, `data-[state=open]:animate-in` and `bg-(--x)` to CSS properties |
| S3 | 3 Tier-1 rules test-first (`color/no-undeclared`, `effects/no-gradients`, `shadow/none`) + `squadra check` text output + nearest-DESIGN.md discovery | Running `squadra check` from the monorepo root reports only the dogfood app |
| S4 | Spike: `@shadcn/lint` + our 3 rules on shadcn `apps/v4` and 2 OSS Tailwind v4 apps; hand-check 50 hits | Reuse-vs-own decision recorded in `docs/decisions.md`; false positives < 5% |
| S5 | `init --style pebble` (preset CSS, DESIGN.md, `squadra` skill, CLAUDE.md pointer) | Re-running `init` on a scratch copy of the dogfood app reproduces what you hand-wrote (modulo colors) |

**S1 prompt** (paste as-is):

> Read docs/plan.md and docs/decisions.md. Scaffold the repo for M0 exactly as in the plan's Architecture section: pnpm workspace, one package `packages/squadra` (TypeScript, Node 20+, tsdown, vitest), a `squadra` bin that prints its version, CI running typecheck + tests on PRs, and a tag-triggered publish workflow using npm trusted publishing. No rules yet. Use plan mode first.

**Using it in the monorepo before anything is published:** in `packages/squadra`, run `pnpm build && npm link`. That puts a global `squadra` command on your PATH, so you can run `squadra check` in the monorepo without touching its `package.json`.

## Step 3: hook on in the dogfood app + alpha (Nov 16 – Dec 6)

1. **Build the hook** (`squadra hook claude`: PostToolUse feedback, Stop gate, PreToolUse guard). It's one command that reads `hook_event_name` from stdin.
2. **Turn it on just for yourself** in `<monorepo>/.claude/settings.local.json` (`init --agent claude --local` writes this):
   ```json
   {
     "hooks": {
       "PreToolUse":  [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "squadra hook claude" }] }],
       "PostToolUse": [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "squadra hook claude" }] }],
       "Stop":        [{ "hooks": [{ "type": "command", "command": "squadra hook claude" }] }]
     }
   }
   ```
   Files without a DESIGN.md above them return immediately, so the other apps are unaffected.
3. **Build the app normally, every day.** Log each block in the dogfood log as a true or false positive, and note whether Claude fixed it on its own. If you reach for `SQUADRA=off`, log why. That's the most valuable data you'll get.
4. **Publish `squadra@0.0.x`** with the `next` tag. Once the monorepo can take it, switch the app to a pinned devDependency and drop `npm link`.
5. **Record the GIF** in `examples/demo`, also on Pebble: init, then "gradient hero + cards with a nice shadow" gets blocked and fixed, then flip `effects.gradients: true` and it passes. Show the rendered page next to the terminal.

## Step 4: checkpoint (Dec 20)

Publish the numbers from the dogfood log: blocks, false positives, fixes Claude made on its own and the times you turned it off. Then apply the kill/pivot criteria from the plan.

Whatever the outcome, M2 starts with reading existing apps, and the dogfood app is its first test case. Run `init` on a copy of the app and check whether it infers Pebble back.

## Weekly rhythm (5 h)

- **2 × 2 h build sessions**, one milestone item each.
- **1 h in public:** one post, update the dogfood log, reply to issues.
- Using Squadra while you build the app counts as app time, not Squadra time.

**Posts** ([@piotrG9K](https://x.com/piotrG9K)):
- ~Nov 8: "Every famous app is 8 settings" (grid image).
- Nov 15: "What my agent got wrong about design in week 1" (from the dogfood log) + the 3 rules.
- Dec 6: the alpha + GIF.
- Dec 20: the checkpoint numbers.
