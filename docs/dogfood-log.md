# Dogfood log

Add one line each time the agent does something off-system in the dogfood app. The app is in a private repo, so describe what happened rather than linking to it. Once the hook is on ([build guide, Step 3](start-guide.md#step-3-hook-on-in-the-dogfood-app--alpha-nov-16--dec-6)), also log every block as a true or false positive, whether Claude fixed it on its own, and why you reached for `SQUADRA=off`, if you did.

Format:

```text
date · what it did · file · which rule would catch it (or "none") · did the CLAUDE.md pointer alone prevent it?
```

## Entries

