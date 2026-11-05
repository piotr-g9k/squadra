import { describe, expect, it } from 'vitest';
import pkg from '../package.json' with { type: 'json' };
import { runCli } from './helpers.js';

describe('squadra --version', () => {
  it('prints the package version', async () => {
    const r = await runCli(['--version']);
    expect(r.code).toBe(0);
    expect(r.stdout).toBe(`${pkg.version}\n`);
  });
});
