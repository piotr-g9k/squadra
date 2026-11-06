import { parseArgs } from 'node:util';
import { VERSION } from '../version.js';
import { runValidate } from './validate.js';

export interface Io {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  cwd: string;
}

const HELP = `squadra ${VERSION}: your app's style as 8 settings, enforced on your agent.

Usage:
  squadra validate [path]   Check DESIGN.md: x-squadra schema, dark keys, design.md lint.
                            path defaults to ./DESIGN.md; a directory means <dir>/DESIGN.md.
  squadra --version
  squadra --help

Exit codes: 0 valid (warnings allowed), 1 errors found, 2 usage or file error.
`;

export async function main(argv: string[], io: Io): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: {
        version: { type: 'boolean', short: 'v' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (err) {
    io.stderr(`squadra: ${err instanceof Error ? err.message : String(err)}\n\n${HELP}`);
    return 2;
  }

  const { values, positionals } = parsed;
  if (values.version) {
    io.stdout(`${VERSION}\n`);
    return 0;
  }
  const [command, ...args] = positionals;
  if (values.help || command === undefined || command === 'help') {
    io.stdout(HELP);
    return 0;
  }

  switch (command) {
    case 'validate':
      if (args.length > 1) {
        io.stderr(`squadra validate takes one path, got ${args.length}.\n`);
        return 2;
      }
      return runValidate(args[0], io);
    default:
      io.stderr(`squadra: unknown command "${command}".\n\n${HELP}`);
      return 2;
  }
}
