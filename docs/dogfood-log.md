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

Mock screens (phase 6a, Nov 5; the AGENTS.md → DESIGN.md pointer was on):

- 2026-11-05 · buttons on sky poster blocks hard-coded to `brand-navy`/`brand-sky`, because `primary` turns sky in dark mode and vanished on the block · auction/home screens · none (token *choice* per surface isn't checkable) · no: DESIGN.md had no rule for it, the agent improvised
- 2026-11-05 · no Textarea, Switch, Avatar or Skeleton in the system; it styled a textarea like Input and used Buttons as toggles · create/edit form · none · partly: it stayed on tokens but invented components
- 2026-11-05 · added `font-sans` inside a serif heading so a price wasn't set in the display serif · auction detail · none · yes: followed "prices are DM Sans"
- 2026-11-05 · dropped v1's orange "ending soon" dots to keep one highlight per screen · auction list · none (usage count is Tier 3 guidance) · yes

UI review round 1 (Nov 6–7; two reviewers across 320–1920 px in both themes, fixes by agents; the pointer was on):

- 2026-11-07 · used the vendored compact Button sizes (`sm`, `xs`, `icon-sm`, `icon-xs`) for filters, back links, copy and close buttons, so they were 36 px against DESIGN.md's 44 px · several screens · none (candidate `density/touch-size`) · no: DESIGN.md gave the size but no rule for when compact sizes are allowed
- 2026-11-07 · responsive grids with only `md:`/`lg:` columns; on phones a long title or bid row widened the whole page · lists, auction page · none (candidate `layout/grid-base-column`) · no
- 2026-11-07 · `w-auto` on an inset Separator and `motion-reduce:animate-none` on overlays did nothing, because the vendored `data-[…]:` utilities win · `/szukaj`, overlays · none (candidate `classes/losing-override`) · no
- 2026-11-07 · vendored Input and Textarea kept `bg-transparent` although DESIGN.md declares `background` for them · `src/components/ui/` · none (vendored drift, definitions mode) · no
- 2026-11-07 · forms showed one error at a time at the bottom, with no `aria-invalid` and no focus; DESIGN.md declared no error state · create/edit forms · none · no: the system had no pattern to follow
- 2026-11-07 · a sky badge on the `muted` photo placeholder measured 1.02:1; a same-hue light theme dropped card-on-page to 1.07:1 · auction cards, every light screen · none (candidates `surface/fill-contrast`, `surface/separation`) · n/a: token choices, not agent edits
