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

  it('zones need at least one path', () => {
    const zones = '  zones:\n    - paths: []\n      effects: { gradients: true }\n';
    expect(squadraFindings(withLine('  modes:\n', `${zones}  modes:\n`))).toMatchObject([
      { severity: 'error', path: 'x-squadra.zones[0].paths' },
    ]);
  });
});
