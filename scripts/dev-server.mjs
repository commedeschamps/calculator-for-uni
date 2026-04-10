import { execFileSync, spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const nextCli = resolve(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const nextCacheDir = resolve(projectRoot, '.next');

function runLsof(args) {
  try {
    return execFileSync('lsof', args, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stdout = error.stdout?.toString().trim();

    if (error.status === 1) {
      return stdout ?? '';
    }

    throw error;
  }
}

function getListeningPids(targetPort) {
  const output = runLsof([`-tiTCP:${targetPort}`, '-sTCP:LISTEN']);

  if (!output) {
    return [];
  }

  return Array.from(new Set(
    output
      .split(/\s+/)
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isInteger(value) && value !== process.pid),
  ));
}

function getProcessCwd(pid) {
  const output = runLsof(['-a', '-p', String(pid), '-d', 'cwd', '-Fn']);
  const cwdLine = output.split('\n').find((line) => line.startsWith('n'));

  return cwdLine ? cwdLine.slice(1) : null;
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function waitForPortToClear(targetPort, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (getListeningPids(targetPort).length === 0) {
      return true;
    }

    await sleep(100);
  }

  return getListeningPids(targetPort).length === 0;
}

const existingPids = getListeningPids(port);

for (const pid of existingPids) {
  const cwd = getProcessCwd(pid);

  if (cwd && cwd !== projectRoot) {
    console.error(`[dev] Port ${port} is already in use by PID ${pid} from ${cwd}. Stop that process or set PORT to another value.`);
    process.exit(1);
  }

  console.log(`[dev] Stopping stale dev server PID ${pid} on port ${port}`);

  try {
    process.kill(pid, 'SIGTERM');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[dev] Failed to stop PID ${pid}: ${message}`);
    console.error('[dev] Close the existing server manually, then run the command again.');
    process.exit(1);
  }
}

if (existingPids.length > 0) {
  const portFreed = await waitForPortToClear(port);

  if (!portFreed) {
    console.error(`[dev] Port ${port} did not clear after stopping the stale process.`);
    process.exit(1);
  }
}

console.log('[dev] Clearing stale .next output');
rmSync(nextCacheDir, { recursive: true, force: true });

const child = spawn(process.execPath, [nextCli, 'dev', '-p', String(port)], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
