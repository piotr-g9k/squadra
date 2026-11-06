import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateDesignMd, type Finding } from '../src/index.js';

const FIXTURES = join(import.meta.dirname, 'fixtures/design-md');
const read = (name: string) => readFileSync(join(FIXTURES, name), 'utf8');
const errorsOf = (findings: Finding[]) =>
  findings
    .filter((f) => f.severity === 'error')
    .map(({ source, path, line, col, message }) => ({ source, path, line, col, message }));

describe('good fixtures validate', () => {
  it.each(['good/postdar.md', 'good/minimal.md', 'good/plan-example.md'])('%s has no errors', (name) => {
    const result = validateDesignMd(read(name));
    expect(errorsOf(result.findings)).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('postdar.md: parses x-squadra and passes design.md warnings through', () => {
    const result = validateDesignMd(read('good/postdar.md'));
    expect(result.config?.style).toBe('pebble');
    expect(result.config?.settings).toEqual({
      fill: 'tonal',
      edges: 'none',
      shadow: 'soft',
      color: 'tinted',
      shape: 'round',
      density: 'spacious',
      type: 'friendly',
      motion: 'standard',
    });
    expect(Object.keys(result.config?.modes?.dark?.colors ?? {})).toHaveLength(28);

    const warnings = result.findings.filter((f) => f.severity === 'warning');
    expect(warnings.every((f) => f.source === 'design.md')).toBe(true);
    expect(warnings.map((f) => f.rule).sort()).toEqual([
      'contrast-ratio',
      ...Array(10).fill('orphaned-tokens'),
      'token-like-ignored',
    ]);
    // design.md paths are located in the file.
    const contrast = warnings.find((f) => f.rule === 'contrast-ratio');
    expect(contrast).toMatchObject({ path: 'components.poster-orange', line: 189, col: 3 });
  });
});

describe('bad fixtures fail with one located error', () => {
  const cases: Array<[string, Omit<Finding, 'severity' | 'rule'>]> = [
    [
      'bad/unknown-setting-step.md',
      {
        source: 'squadra',
        path: 'x-squadra.settings.fill',
        line: 12,
        col: 11,
        message: '"raise" is not a fill step. Use flat, tonal or raised. Did you mean "raised"?',
      },
    ],
    [
      'bad/missing-setting.md',
      {
        source: 'squadra',
        path: 'x-squadra.settings',
        line: 11,
        col: 3,
        message: 'missing "density" (compact, comfortable or spacious). All 8 settings are required.',
      },
    ],
    [
      'bad/dark-key-not-in-light.md',
      {
        source: 'squadra',
        path: 'x-squadra.modes.dark.colors.sidebar',
        line: 28,
        col: 9,
        message: 'has a dark value but no light value. Add colors.sidebar or remove it.',
      },
    ],
    [
      'bad/effects-blur-invalid.md',
      {
        source: 'squadra',
        path: 'x-squadra.effects.blur',
        line: 20,
        col: 51,
        message: '"overlay" is not a blur value. Use none, overlays or anywhere. Did you mean "overlays"?',
      },
    ],
    [
      'bad/effects-gradients-off.md',
      {
        source: 'squadra',
        path: 'x-squadra.effects.gradients',
        line: 20,
        col: 25,
        message: 'expected true or false, got "off" (YAML 1.2 reads on/off as text).',
      },
    ],
    [
      'bad/unknown-key.md',
      {
        source: 'squadra',
        path: 'x-squadra.font',
        line: 21,
        col: 3,
        message: 'unknown key "font" in x-squadra. Did you mean "fonts"?',
      },
    ],
    [
      'bad/zone-guidance-setting.md',
      {
        source: 'squadra',
        path: 'x-squadra.zones[0].settings.shape',
        line: 24,
        col: 19,
        message: 'zones can only change fill, edges, shadow and motion; shape is guidance only.',
      },
    ],
    [
      'bad/designmd-error.md',
      {
        source: 'design.md',
        path: 'colors.primary',
        line: 7,
        col: 12,
        message:
          "'not-a-color' is not a valid color. Expected a CSS color value (e.g., #ffffff, rgb(0 0 0), oklch(0.5 0.2 240)).",
      },
    ],
  ];

  it.each(cases)('%s', (name, expected) => {
    const result = validateDesignMd(read(name));
    expect(result.ok).toBe(false);
    expect(errorsOf(result.findings)).toEqual([expected]);
  });
});

describe('design.md adapter', () => {
  it('reports the exact version pinned in package.json', async () => {
    const { DESIGN_MD_VERSION } = await import('../src/model/designmd.js');
    const pkg = (await import('../package.json', { with: { type: 'json' } })).default;
    expect(pkg.dependencies['@google/design.md']).toBe(DESIGN_MD_VERSION);
  });
});
