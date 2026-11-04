# Squadra

**Your app's style as 8 settings: read from your code, enforced on your agent.**

> **Pre-alpha, built in public.** There's nothing to install yet. The plan and every decision are in [`docs/`](docs/). Follow along on X: [@piotrG9K](https://x.com/piotrG9K).

Squadra describes a Tailwind v4 app's style as 8 settings in DESIGN.md: fill, edges, shadow, color, shape, density, type and motion. Each setting switches on lint rules. Your coding agent gets them back after every edit and can't finish a turn while breaking them. Claude Code comes first.

## Roadmap

| Milestone | Target | What ships |
| --- | --- | --- |
| M0 · Foundations | Nov 15, 2026 | `squadra check` with the first 3 rules, running on the dogfood app |
| M1 · Public alpha | Dec 6, 2026 | `squadra@0.0.x` on npm: the Claude Code hook loop, blocking rules and a demo GIF |
| Checkpoint | Dec 20, 2026 | Two weeks with the hook on in my own app; numbers published |
| M2 · Existing apps | mid-Jan 2027 | `init` reads an existing app; warnings; Codex via pre-commit/CI; a false-positive run on 6 OSS apps |
| M3 · v0.1 launch | mid-Feb 2027 | 5 presets (Paper, Pebble, Studio, Ledger, Poster) |

The dates are optimistic on purpose. If a milestone slips by more than a week, I cut its scope instead of moving the date.

## Kill criteria

At the Dec 20 checkpoint, Squadra stops or pivots if either of these is true:

- I turn the hook off in my own app because of false positives.
- After the alpha GIF there are fewer than ~30 outside users or stars and no outside issues.

The pivot options are warn-only reporting, a skill + DESIGN.md template with no CLI, or a focus on agent-generated landing pages. I'll publish the numbers whichever way it goes.

## Docs

[Plan](docs/plan.md) · [Decisions](docs/decisions.md) · [Build guide](docs/start-guide.md) · [Dogfood log](docs/dogfood-log.md)

MIT licensed.
