import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";

export const LOCAL_BUILD_LIMIT = 2;
const commitPattern = /^[a-f0-9]{40}$/;

function validateApp(app) {
  if (!/^[a-z][a-z0-9-]*$/.test(app))
    throw new Error("Invalid application name.");
}

function buildInfo(directory, app, commit) {
  const name = `${app}-${commit}-linux-x64.tar.gz`;
  const expected = [name, `${name}.sha256`];
  if (
    lstatSync(directory).isSymbolicLink() ||
    !lstatSync(directory).isDirectory()
  )
    return null;
  const names = readdirSync(directory);
  if (names.length !== 2 || !expected.every((file) => names.includes(file)))
    return null;
  for (const file of expected) {
    const stat = lstatSync(path.join(directory, file));
    if (!stat.isFile() || stat.isSymbolicLink() || !stat.size) return null;
  }
  const fields = readFileSync(path.join(directory, `${name}.sha256`), "utf8")
    .trim()
    .split(/\s+/);
  if (
    fields.length !== 2 ||
    !/^[a-f0-9]{64}$/.test(fields[0]) ||
    fields[1] !== name
  )
    return null;
  return {
    commit,
    directory,
    name,
    digest: fields[0],
    modified: lstatSync(path.join(directory, name)).mtimeMs,
  };
}

export function pruneLocalBuilds({
  app,
  root = path.resolve("artifacts"),
  currentCommit,
} = {}) {
  validateApp(app);
  if (currentCommit !== undefined && !commitPattern.test(currentCommit))
    throw new Error("Invalid commit.");
  if (!existsSync(root)) {
    if (currentCommit) throw new Error("Current release output is missing.");
    return { kept: [], removed: [] };
  }
  if (lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory())
    throw new Error("Unsafe artifacts root.");
  const builds = readdirSync(root)
    .filter((name) => commitPattern.test(name))
    .map((commit) => buildInfo(path.join(root, commit), app, commit))
    .filter(Boolean)
    .sort(
      (a, b) => b.modified - a.modified || b.commit.localeCompare(a.commit),
    );
  const current = builds.find((build) => build.commit === currentCommit);
  if (currentCommit && !current)
    throw new Error("Current release is incomplete; cleanup stopped.");
  const ordered = current
    ? [current, ...builds.filter((build) => build !== current)]
    : builds;
  const kept = ordered.slice(0, LOCAL_BUILD_LIMIT);
  const removed = ordered.slice(LOCAL_BUILD_LIMIT);
  for (const build of removed) rmSync(build.directory, { recursive: true });
  console.log(
    `Local release retention: kept ${kept.length}, removed ${removed.length} ${app} bundles.`,
  );
  return {
    kept: kept.map((build) => build.commit),
    removed: removed.map((build) => build.commit),
  };
}

export function storeLocalBuild({
  app,
  commit,
  staged,
  root = path.resolve("artifacts"),
}) {
  validateApp(app);
  if (!commitPattern.test(commit)) throw new Error("Invalid commit.");
  const info = buildInfo(staged, app, commit);
  if (!info)
    throw new Error("Build did not produce a complete archive and checksum.");
  const digest = createHash("sha256")
    .update(readFileSync(path.join(staged, info.name)))
    .digest("hex");
  if (digest !== info.digest)
    throw new Error(
      "Release checksum does not match; previous builds were preserved.",
    );
  mkdirSync(root, { recursive: true });
  if (lstatSync(root).isSymbolicLink())
    throw new Error("Unsafe artifacts root.");
  const destination = path.join(root, commit);
  if (existsSync(destination) && !buildInfo(destination, app, commit)) {
    throw new Error("Existing release output is unrecognized.");
  }
  // Copy onto the artifacts filesystem before renaming: tmpdir may be another mount.
  const incoming = mkdtempSync(path.join(root, ".incoming-"));
  try {
    cpSync(staged, path.join(incoming, "bundle"), { recursive: true });
    if (existsSync(destination)) rmSync(destination, { recursive: true });
    renameSync(path.join(incoming, "bundle"), destination);
    rmSync(staged, { recursive: true });
  } finally {
    rmSync(incoming, { recursive: true, force: true });
  }
  return pruneLocalBuilds({ app, root, currentCommit: commit });
}

export function pruneDockerBuildCache(run = execFileSync) {
  // The bundle exporter creates archives, not runtime images. Keep no build history.
  // BuildKit protects records in use; containers, tagged images and volumes are untouched.
  run("docker", ["buildx", "prune", "--all", "--force"], { stdio: "inherit" });
}
