import { VERSION } from '../version.js';

export interface Io {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  cwd: string;
}

export async function main(argv: string[], io: Io): Promise<number> {
  if (argv.includes('--version') || argv.includes('-v')) {
    io.stdout(`${VERSION}\n`);
    return 0;
  }
  io.stdout(`squadra ${VERSION}\n`);
  return 0;
}
