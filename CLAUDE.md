# Squadra: agent rules

Squadra is an OSS CLI (MIT, npm `squadra`). It describes a Tailwind v4 app's style as 8 settings in DESIGN.md, and those settings switch on lint rules that coding agents are blocked on.

- The source of truth is `docs/plan.md` + `docs/decisions.md`. Stay inside the current milestone's scope.
- Rules are written test-first: good/bad fixtures first; Piotr reviews the fixtures before the rule is implemented.
- One published package; ask before adding a dependency; pin `@shadcn/lint`, `@google/design.md` and `tailwindcss` exactly.
- When a decision is made, append it to `docs/decisions.md`.

The repo layout, tooling and M0 session plan are in `docs/start-guide.md`.
