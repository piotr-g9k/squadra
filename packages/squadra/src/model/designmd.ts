// The only module that imports @google/design.md (one adapter per upstream dependency).
// Pinned to exactly 0.4.0; re-test on every bump.
import { lint } from '@google/design.md/linter';

export const DESIGN_MD_VERSION = '0.4.0';

export interface DesignMdFinding {
  severity: 'error' | 'warning' | 'info';
  /** Dotted path into the front matter, e.g. `colors.border`. */
  path?: string;
  message: string;
  /** Missing for model errors such as an invalid color. */
  rule?: string;
}

export function lintDesignMd(content: string): DesignMdFinding[] {
  try {
    return lint(content).findings.map((f) => ({
      severity: f.severity,
      ...(f.path ? { path: f.path } : {}),
      message: f.message,
      ...(f.rule ? { rule: f.rule } : {}),
    }));
  } catch (err) {
    return [
      {
        severity: 'error',
        message: `design.md lint failed: ${err instanceof Error ? err.message : String(err)}`,
      },
    ];
  }
}
