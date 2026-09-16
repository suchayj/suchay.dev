import { cp, mkdir, readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const commit = process.argv[2];
if (!/^[0-9a-f]{40}$/.test(commit || '')) throw new Error('Full source commit required');
if (process.platform !== 'linux' || process.arch !== 'x64') throw new Error('Build requires Linux x64');
const root = '/bundle';
await mkdir(root, { recursive: true });
await cp('.next/standalone', root, { recursive: true, dereference: true });
await cp('.next/static', `${root}/.next/static`, { recursive: true });
await cp('public', `${root}/public`, { recursive: true });
await cp('prisma', `${root}/prisma`, { recursive: true, dereference: true });
await cp('node_modules', `${root}/node_modules`, { recursive: true, dereference: true });
await cp('deployment/start.cjs', `${root}/start.cjs`);
await writeFile(`${root}/package.json`, JSON.stringify({ private: true, type: 'module', scripts: { start: 'node start.cjs', 'db:migrate': 'node node_modules/prisma/build/index.js migrate deploy --schema prisma/schema.prisma' } }, null, 2));
const files = {};
async function walk(relative = '') {
  for (const name of await readdir(path.join(root, relative))) {
    if (name === '.env' || name.startsWith('.env.') || name === '.git' || /\.(db|sqlite)(-|$)/.test(name)) throw new Error(`Forbidden release entry: ${relative}/${name}`);
    const rel = path.posix.join(relative, name), file = path.join(root, rel), info = await lstat(file);
    if (info.isDirectory()) await walk(rel);
    else if (info.isFile()) files[rel] = createHash('sha256').update(await readFile(file)).digest('hex');
    else throw new Error(`Unsupported release entry: ${rel}`);
  }
}
await walk();
await writeFile(`${root}/bundle-manifest.json`, JSON.stringify({ format: 1, application: 'suchay-dev', commit, platform: 'linux', architecture: 'x64', nodeMajor: 22, files }, null, 2));
await mkdir('/export', { recursive: true });
const name = `suchay-dev-${commit}-linux-x64.tar.gz`;
execFileSync('tar', ['-czf', `/export/${name}`, '-C', root, '.']);
const checksum = createHash('sha256').update(await readFile(`/export/${name}`)).digest('hex');
await writeFile(`/export/${name}.sha256`, `${checksum}  ${name}\n`);
