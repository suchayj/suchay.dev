import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
const repository = 'suchayj/suchay.dev';
const run = (command, args, options = {}) => execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...options }).trim();
const check = (command, args) => spawnSync(command, args, { stdio: 'ignore' }).status === 0;
const fail = (message) => { throw new Error(message); };
if (!check('gh', ['--version'])) fail('Install GitHub CLI first: brew install gh');
if (!check('gh', ['auth', 'status', '--hostname', 'github.com'])) {
  console.log('GitHub sign-in is required once. Complete the browser authorization when it opens.');
  const login = spawnSync('gh', ['auth', 'login', '--hostname', 'github.com', '--git-protocol', 'ssh', '--web', '--skip-ssh-key'], { stdio: 'inherit' });
  if (login.status !== 0 || !check('gh', ['auth', 'status', '--hostname', 'github.com'])) fail('GitHub sign-in was not completed.');
}
if (!check('docker', ['info'])) fail('Start Docker Desktop before releasing.');
if (run('git', ['status', '--porcelain'])) fail('Commit all source changes before releasing.');
if (run('git', ['branch', '--show-current']) !== 'main') fail('Releases must be created from the main branch.');
if (!['git@github.com:suchayj/suchay.dev.git', 'https://github.com/suchayj/suchay.dev.git'].includes(run('git', ['remote', 'get-url', 'origin']))) fail('Unexpected origin remote.');
const commit = run('git', ['rev-parse', 'HEAD']);
console.log(`Checking source at ${commit}...`);
execFileSync('npm', ['run', 'lint'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'typecheck'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'release:build'], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:refs/heads/main'], { stdio: 'inherit' });
const tag = `bundle-${commit}`, name = `suchay-dev-${commit}-linux-x64.tar.gz`;
const archive = path.resolve('artifacts', commit, name), checksum = `${archive}.sha256`;
for (const file of [archive, checksum]) if (!existsSync(file) || !statSync(file).size) fail(`Missing release file: ${file}`);
const fields = readFileSync(checksum, 'utf8').trim().split(/\s+/);
if (!/^[a-f0-9]{64}$/.test(fields[0]) || fields[1] !== name || fields[2]) fail('Invalid checksum file.');
let release;
try { release = JSON.parse(run('gh', ['release', 'view', tag, '--repo', repository, '--json', 'isDraft,targetCommitish,assets,url'])); }
catch {
  execFileSync('gh', ['release', 'create', tag, '--repo', repository, '--target', commit, '--title', `suchay.dev ${commit.slice(0, 10)}`, '--notes', `Prebuilt Linux x64 bundle for ${commit}.`, '--draft'], { stdio: 'inherit' });
  release = { isDraft: true, targetCommitish: commit, assets: [] };
}
if (!release.isDraft) { console.log(`Release already published: ${release.url}`); process.exit(0); }
if (release.targetCommitish !== commit) fail(`Draft release ${tag} targets a different commit.`);
execFileSync('gh', ['release', 'upload', tag, archive, checksum, '--repo', repository, '--clobber'], { stdio: 'inherit' });
release = JSON.parse(run('gh', ['release', 'view', tag, '--repo', repository, '--json', 'isDraft,targetCommitish,assets,url']));
const assets = new Map(release.assets.map((asset) => [asset.name, asset.size]));
if (!release.isDraft || assets.get(name) !== statSync(archive).size || assets.get(`${name}.sha256`) !== statSync(checksum).size) fail('Release assets are incomplete; the draft was not published.');
execFileSync('gh', ['release', 'edit', tag, '--repo', repository, '--draft=false'], { stdio: 'inherit' });
console.log(`Published bundle for ${commit}. Deploy this exact commit from Loom.`);
