import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json' with { type: 'json' };
import { runCli } from './helpers.js';

const FIXTURES = join(import.meta.dirname, 'fixtures/design-md');

describe('squadra --version', () => {
  it('prints the package version', async () => {
    const r = await runCli(['--version']);
    expect(r.code).toBe(0);
    expect(r.stdout).toBe(`${pkg.version}\n`);
  });
});

describe('squadra validate', () => {
  it('passes the PostDAR fixture with warnings (exit 0)', async () => {
    const r = await runCli(['validate', 'good/postdar.md'], FIXTURES);
    expect(r.code).toBe(0);
    expect(r.stdout).toMatchSnapshot();
  });

  it('fails a bad fixture (exit 1) and prints the located error', async () => {
    const r = await runCli(['validate', 'bad/unknown-setting-step.md'], FIXTURES);
    expect(r.code).toBe(1);
    expect(r.stdout).toMatchSnapshot();
  });

  it('prints design.md errors as errors (exit 1)', async () => {
    const r = await runCli(['validate', 'bad/designmd-error.md'], FIXTURES);
    expect(r.code).toBe(1);
    expect(r.stdout).toMatchSnapshot();
  });

  it('exits 2 when the file does not exist', async () => {
    const r = await runCli(['validate', 'nope/DESIGN.md'], FIXTURES);
    expect(r.code).toBe(2);
    expect(r.stderr).toContain('nope/DESIGN.md');
  });

  it('defaults to ./DESIGN.md', async () => {
    const r = await runCli(['validate'], FIXTURES);
    expect(r.code).toBe(2);
    expect(r.stderr).toContain('DESIGN.md');
  });

  it('exits 2 on an unknown command', async () => {
    const r = await runCli(['frobnicate']);
    expect(r.code).toBe(2);
  });
});
