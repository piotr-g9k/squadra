# Dogfood log

Add one line each time the agent does something off-system in the dogfood app. The app is in a private repo, so describe what happened rather than linking to it. Once the hook is on ([build guide, Step 3](start-guide.md#step-3-hook-on-in-the-dogfood-app--alpha-nov-16--dec-6)), also log every block as a true or false positive, whether Claude fixed it on its own, and why you reached for `SQUADRA=off`, if you did.

Format:

```text
date · what it did · file · which rule would catch it (or "none") · did the CLAUDE.md pointer alone prevent it?
```

## Entries

Before the hook (hand-written foundation, Nov 4–5; the AGENTS.md pointer was only added at the end, so the last column is n/a):

- 2026-11-05 · wrote `px-[0.4em]` in the `Meta` component, then reverted to `px-1.5` itself · `src/components/brand/` · none (arbitrary spacing isn't in `tokens/no-arbitrary-*`) · n/a
- 2026-11-05 · vendored shadcn shipped translucent hovers and `ring/50` focus rings that failed contrast once measured; replaced with tokens (`highlight-hover`, ring 55%) · `src/components/ui/` · none (contrast isn't a v0.1 rule) · n/a
- 2026-11-05 · Sonner brought its own font, a black shadow, 13px text and 400ms motion; overridden with `!important` · `src/components/ui/sonner.tsx` · none (library CSS, not classes) · n/a
- 2026-11-05 · navy poster block on the navy dark page, and a sand badge on the sand page, both invisible; moved to sky and added a Don't · home route, `/design` · none (block-vs-page relations aren't expressible) · n/a
- 2026-11-05 · `shadcn add sonner` installed `next-themes` against the brief; removed · `package.json` · none · n/a
