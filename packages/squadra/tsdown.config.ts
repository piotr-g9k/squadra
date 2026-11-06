import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    eslint: 'src/eslint.ts',
    cli: 'src/cli/bin.ts',
  },
  format: 'esm',
  platform: 'node',
  target: 'node22',
  dts: true,
  clean: true,
});
