import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateDesignMd } from '../src/index.js';

const BASE = readFileSync(join(import.meta.dirname, 'fixtures/design-md/good/minimal.md'), 'utf8');
const squadraFindings = (content: string) =>
  validateDesignMd(content).findings.filter((f) => f.source === 'squadra');
const withLine = (from: string, to: string) => {
  if (!BASE.includes(from)) throw new Error(`base fixture has no ${from}`);
  return BASE.replace(from, to);
};

describe('front matter', () => {
  it('requires YAML front matter', () => {
    expect(squadraFindings('# Just markdown\n')).toMatchObject([
      { severity: 'error', message: expect.stringContaining('front matter') },
    ]);
  });

  it('reports YAML syntax errors with a location', () => {
    const [f] = squadraFindings(withLine('  fonts: [Inter]', '  fonts: [Inter'));
    expect(f).toMatchObject({ severity: 'error', line: expect.any(Number) });
  });

  it('reports duplicate keys', () => {
    const [f] = squadraFindings(withLine('    fill: flat', '    fill: flat\n    fill: tonal'));
    expect(f).toMatchObject({ severity: 'error', line: 13 });
  });

  it('requires an x-squadra block', () => {
    const content = BASE.replace(/^x-squadra:[\s\S]*?(?=^---$)/m, '');
    expect(squadraFindings(content)).toMatchObject([
      { severity: 'error', path: 'x-squadra', message: expect.stringContaining('missing x-squadra') },
    ]);
  });
});

describe('x-squadra fields', () => {
  it('accepts a local style file', () => {
    expect(squadraFindings(withLine('  style: paper', '  style: ./brand.yaml'))).toEqual([]);
  });

  it('suggests a preset name for a typo in style', () => {
    expect(squadraFindings(withLine('  style: paper', '  style: pebbel'))).toMatchObject([
      { severity: 'error', path: 'x-squadra.style', message: expect.stringContaining('Did you mean "pebble"?') },
    ]);
  });

  it('style is optional', () => {
    expect(squadraFindings(withLine('  style: paper\n', ''))).toEqual([]);
  });

  it('only accepts version 1', () => {
    expect(squadraFindings(withLine('  version: 1', '  version: 2'))).toMatchObject([
      { severity: 'error', path: 'x-squadra.version' },
    ]);
  });

  it('requires at least one font', () => {
    expect(squadraFindings(withLine('  fonts: [Inter]', '  fonts: []'))).toMatchObject([
      { severity: 'error', path: 'x-squadra.fonts' },
    ]);
  });

  it('rejects an invalid dark color value', () => {
    expect(squadraFindings(withLine('        primary: "#3B82F6"', '        primary: "blue-ish"'))).toMatchObject([
      { severity: 'error', path: 'x-squadra.modes.dark.colors.primary', line: 27 },
    ]);
  });

  it('accepts oklch() with alpha in dark colors', () => {
    expect(
      squadraFindings(withLine('        primary: "#3B82F6"', '        primary: "oklch(0.9221 0.0322 254 / 0.15)"')),
    ).toEqual([]);
  });

  it('suggests a light key for a mistyped dark key', () => {
    expect(squadraFindings(withLine('        primary: "#3B82F6"', '        primay: "#3B82F6"'))).toMatchObject([
      { severity: 'error', message: expect.stringContaining('Did you mean "primary"?') },
    ]);
  });

  it('accepts known rule ids, groups and globs', () => {
    const rules = '  rules:\n    motion/*: warn\n    tokens/no-arbitrary-*: off\n    shadow/none: error\n';
    expect(squadraFindings(withLine('  modes:\n', `${rules}  modes:\n`))).toEqual([]);
  });

  it('warns on an unknown rule id', () => {
    const rules = '  rules:\n    shadow/nope: warn\n';
    expect(squadraFindings(withLine('  modes:\n', `${rules}  modes:\n`))).toMatchObject([
      { severity: 'warning', path: 'x-squadra.rules.shadow/nope' },
    ]);
  });

  it('rejects an invalid severity', () => {
    const rules = '  rules:\n    shadow/none: block\n';
    expect(squadraFindings(withLine('  modes:\n', `${rules}  modes:\n`))).toMatchObject([
      { severity: 'error', path: 'x-squadra.rules.shadow/none' },
    ]);
  });

  it('zones cannot change type', () => {
    const zones = '  zones:\n    - paths: ["docs/**"]\n      settings: { type: editorial }\n';
    expect(squadraFindings(withLine('  modes:\n', `${zones}  modes:\n`))).toMatchObject([
      {
        severity: 'error',
        path: 'x-squadra.zones[0].settings.type',
        message: 'zones can only change fill, edges, shadow and motion; type is global, because its rules read x-squadra.fonts.',
      },
    ]);
  });

  it('zones need at least one path', () => {
    const zones = '  zones:\n    - paths: []\n      effects: { gradients: true }\n';
    expect(squadraFindings(withLine('  modes:\n', `${zones}  modes:\n`))).toMatchObject([
      { severity: 'error', path: 'x-squadra.zones[0].paths' },
    ]);
  });
});

describe('review regressions', () => {
  it('reports an unresolved YAML alias instead of throwing', () => {
    expect(squadraFindings(withLine('name: Minimal', 'name: *missing'))).toMatchObject([
      { severity: 'error', message: expect.stringContaining('YAML error') },
    ]);
  });

  it('reports an alias bomb instead of expanding it', () => {
    const bomb = [
      'a: &a [x, x, x, x, x, x, x, x, x, x]',
      'b: &b [*a, *a, *a, *a, *a, *a, *a, *a, *a, *a]',
      'c: &c [*b, *b, *b, *b, *b, *b, *b, *b, *b, *b]',
      'd: [*c, *c, *c, *c, *c, *c, *c, *c, *c, *c]',
    ].join('\n');
    expect(squadraFindings(withLine('name: Minimal', `name: Minimal\n${bomb}`))).toMatchObject([
      { severity: 'error', message: expect.stringContaining('YAML error') },
    ]);
  });

  it.each(['toString', 'constructor', '__proto__'])('dark key "%s" is not a light key', (key) => {
    expect(squadraFindings(withLine('        primary: "#3B82F6"', `        primary: "#3B82F6"\n        ${key}: "#3B82F6"`))).toMatchObject([
      { severity: 'error', path: `x-squadra.modes.dark.colors.${key}` },
    ]);
  });

  it.each(['bananas', 'rgb(bananas)', 'oklch(0.5 0.1)', 'rgb(0 0 0 0)', 'oklch(0.5, 0.1, 200 / 0.5)', 'rgb(0 0 0 / 1 / 2)'])(
    'rejects the dark color %s',
    (color) => {
      expect(squadraFindings(withLine('        primary: "#3B82F6"', `        primary: "${color}"`))).toMatchObject([
        { severity: 'error', path: 'x-squadra.modes.dark.colors.primary' },
      ]);
    },
  );

  it.each([
    'oklch(0.9221 0.0322 254 / 0.15)',
    'oklch(0.34 0.088 256)',
    'rgb(0 0 0)',
    'rgba(0, 0, 0, 0.5)',
    'hsl(240deg 5% 96%)',
    'oklch(none 0 0)',
    'color-mix(in oklch, #0D2D55 40%, transparent)',
    'navy',
    'currentColor',
  ])('accepts the dark color %s', (color) => {
    expect(squadraFindings(withLine('        primary: "#3B82F6"', `        primary: "${color}"`))).toEqual([]);
  });

  it('accepts a color function split over lines', () => {
    expect(squadraFindings(withLine('        primary: "#3B82F6"', '        primary: |-\n          rgb(0\n          0 0)'))).toEqual([]);
  });

  it.each(['/abs/styles.css', 'C:\\app\\styles.css', '\\\\server\\share\\styles.css', 'https://example.com/styles.css'])(
    'rejects the non-relative css path %s',
    (css) => {
      expect(squadraFindings(withLine('  fonts: [Inter]', `  fonts: [Inter]\n  css: '${css}'`))).toMatchObject([
        { severity: 'error', path: 'x-squadra.css' },
      ]);
    },
  );

  it.each(['src/styles.css', '../shared/styles.css', './app/globals.css'])('accepts the css path %s', (css) => {
    expect(squadraFindings(withLine('  fonts: [Inter]', `  fonts: [Inter]\n  css: ${css}`))).toEqual([]);
  });

  it('accepts a narrower glob over a known rule family', () => {
    const rules = '  rules:\n    motion/no-*: warn\n    tokens/no-*: off\n';
    expect(squadraFindings(withLine('  modes:\n', `${rules}  modes:\n`))).toEqual([]);
  });

  it('locates design.md findings on keys that contain dots', () => {
    const content = withLine('  primary: "#2563EB"', '  primary: "#2563EB"\n  primary.bad: "not-a-color"');
    const f = validateDesignMd(content).findings.find((x) => x.source === 'design.md' && x.severity === 'error');
    expect(f).toMatchObject({ path: 'colors.primary.bad', line: 8, col: 16 });
  });
});
