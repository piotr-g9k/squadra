import { main } from '../src/cli/main.js';

export async function runCli(argv: string[], cwd = process.cwd()) {
  let stdout = '';
  let stderr = '';
  const code = await main(argv, {
    stdout: (t) => { stdout += t; },
    stderr: (t) => { stderr += t; },
    cwd,
  });
  return { code, stdout, stderr };
}
