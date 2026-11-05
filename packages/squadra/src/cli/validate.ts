import { readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DESIGN_MD_VERSION } from '../model/designmd.js';
import { validateDesignMd, type Finding, type ValidationResult } from '../model/validate.js';
import type { Io } from './main.js';

const ICON = { error: '✖', warning: '⚠', info: 'ℹ' } as const;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function runValidate(pathArg: string | undefined, io: Io): number {
  let display = pathArg ?? 'DESIGN.md';
  let file = resolve(io.cwd, display);
  let content: string;
  try {
    if (statSync(file).isDirectory()) {
      display = join(display, 'DESIGN.md');
      file = join(file, 'DESIGN.md');
    }
    content = readFileSync(file, 'utf8');
  } catch (err) {
    const reason = (err as NodeJS.ErrnoException).code === 'ENOENT' ? 'no such file' : (err as Error).message;
    io.stderr(`squadra: cannot read ${display}: ${reason}\n`);
    return 2;
  }

  const result = validateDesignMd(content);
  io.stdout(formatValidation(display, result));
  return result.ok ? 0 : 1;
}

/** `token-like-ignored` on x-squadra is expected: design.md export doesn't know Squadra's block. */
const isExpectedIgnore = (f: Finding) => f.rule === 'token-like-ignored' && f.path === 'x-squadra';

export function formatValidation(display: string, result: ValidationResult): string {
  const lines: string[] = [display];
  const line = (f: Finding) => {
    const at = f.line ? `${display}:${f.line}:${f.col ?? 1}  ` : '';
    const path = f.path ? `${f.path}: ` : '';
    const rule = f.rule ? `  [${f.rule}]` : '';
    return `    ${ICON[f.severity]} ${at}${path}${f.message}${rule}`;
  };

  const own = result.findings.filter((f) => f.source === 'squadra');
  const ownErrors = own.filter((f) => f.severity === 'error').length;
  if (ownErrors === 0 && result.config) {
    const { config } = result;
    const dark = config.modes?.dark?.colors;
    const parts = [
      config.style ? `style ${config.style}` : 'no style label',
      '8 settings',
      dark ? `${plural(Object.keys(dark).length, 'dark color')}, all in colors` : 'no dark mode',
    ];
    lines.push(`  x-squadra ✔  ${parts.join(' · ')}`);
  } else {
    lines.push(`  x-squadra ✖  ${plural(ownErrors, 'error')}`);
  }
  for (const f of own) lines.push(line(f));

  const dm = result.findings.filter((f) => f.source === 'design.md');
  const expected = dm.filter(isExpectedIgnore);
  const shown = dm.filter((f) => !isExpectedIgnore(f));
  const count = (s: Finding['severity']) => shown.filter((f) => f.severity === s).length;
  lines.push(
    `  design.md lint ${DESIGN_MD_VERSION}: ${plural(count('error'), 'error')}, ${plural(count('warning'), 'warning')}, ${plural(count('info'), 'info')}`,
  );
  const order = { error: 0, warning: 1, info: 2 } as const;
  for (const f of [...shown].sort((a, b) => order[a.severity] - order[b.severity])) lines.push(line(f));
  if (expected.length) lines.push('    ℹ x-squadra is ignored by design.md export, as expected.  [token-like-ignored]');

  const errors = result.findings.filter((f) => f.severity === 'error').length;
  const warnings = result.findings.filter((f) => f.severity === 'warning' && !isExpectedIgnore(f)).length;
  lines.push(
    errors
      ? `✖ invalid (${plural(errors, 'error')}${warnings ? `, ${plural(warnings, 'warning')}` : ''})`
      : `✔ valid${warnings ? ` (${plural(warnings, 'warning')})` : ''}`,
  );
  return `${lines.join('\n')}\n`;
}
