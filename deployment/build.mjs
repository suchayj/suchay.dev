import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) throw new Error('Commit source changes before creating an exact-commit release.');
const context = mkdtempSync(path.join(tmpdir(), 'suchay-dev-bundle-'));
const output = path.resolve('artifacts', commit);
try {
  mkdirSync(output, { recursive: true });
  const archive = path.join(context, 'source.tar');
  writeFileSync(archive, execFileSync('git', ['archive', '--format=tar', commit], { maxBuffer: 100 * 1024 * 1024 }));
  execFileSync('tar', ['-xf', archive, '-C', context]);
  rmSync(archive);
  execFileSync('docker', ['buildx', 'build', '--platform', 'linux/amd64', '--file', path.join(context, 'deployment/Dockerfile'), '--build-arg', `COMMIT_SHA=${commit}`, '--target', 'bundle', '--output', `type=local,dest=${output}`, context], { stdio: 'inherit' });
  console.log(`Ready for GitHub Release bundle-${commit}: ${output}`);
} finally { rmSync(context, { recursive: true, force: true }); }
