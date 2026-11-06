/** "a, b or c" */
export function listOr(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;
}

/** "a, b and c" */
export function listAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j]!;
      prev[j] = a[i - 1] === b[j - 1] ? diag : 1 + Math.min(diag, up, prev[j - 1]!);
      diag = up;
    }
  }
  return prev[b.length]!;
}

/** The closest candidate within edit distance 2, if any. */
export function closest(input: string, candidates: readonly string[]): string | undefined {
  let best: string | undefined;
  let bestDist = 3;
  for (const c of candidates) {
    const d = levenshtein(input.toLowerCase(), c.toLowerCase());
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}

export function didYouMean(input: string, candidates: readonly string[]): string {
  const match = closest(input, candidates);
  return match ? ` Did you mean "${match}"?` : '';
}

/** `x-squadra.zones[0].settings` */
export function formatPath(path: readonly PropertyKey[]): string {
  let out = '';
  for (const seg of path) {
    if (typeof seg === 'number') out += `[${seg}]`;
    else out += out ? `.${String(seg)}` : String(seg);
  }
  return out;
}
