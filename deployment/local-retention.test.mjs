import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  pruneDockerBuildCache,
  pruneLocalBuilds,
  storeLocalBuild,
} from "./local-retention.mjs";

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "local-retention-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function bundle(root, index, app = "edvora") {
  const commit = index.toString(16).padStart(40, "0");
  const directory = path.join(root, commit);
  mkdirSync(directory);
  const name = `${app}-${commit}-linux-x64.tar.gz`;
  const content = `archive ${index}`;
  writeFileSync(path.join(directory, name), content);
  writeFileSync(
    path.join(directory, `${name}.sha256`),
    `${createHash("sha256").update(content).digest("hex")}  ${name}\n`,
  );
  utimesSync(path.join(directory, name), index, index);
  return { commit, directory, name };
}

test("keeps newest two bundles and preserves source, foreign files, and symlink targets", (t) => {
  const root = fixture(t);
  const old = bundle(root, 1);
  const previous = bundle(root, 2);
  const latest = bundle(root, 3);
  const foreign = bundle(root, 4, "rentora");
  const unknown = path.join(root, "5".repeat(40));
  mkdirSync(unknown);
  writeFileSync(path.join(unknown, "source.ts"), "source");
  const outside = fixture(t);
  symlinkSync(outside, path.join(root, "6".repeat(40)));
  const result = pruneLocalBuilds({ app: "edvora", root });
  assert.deepEqual(result.kept, [latest.commit, previous.commit]);
  assert.equal(existsSync(old.directory), false);
  for (const p of [foreign.directory, unknown, outside])
    assert.equal(existsSync(p), true);
});

test("incomplete current build cannot delete previous good bundles", (t) => {
  const root = fixture(t);
  const builds = [bundle(root, 1), bundle(root, 2), bundle(root, 3)];
  assert.throws(
    () =>
      pruneLocalBuilds({ app: "edvora", root, currentCommit: "f".repeat(40) }),
    /incomplete/,
  );
  for (const b of builds) assert.equal(existsSync(b.directory), true);
});

test("new build is verified, installed, and retained with one previous build", (t) => {
  const root = fixture(t),
    stageRoot = fixture(t);
  const old = bundle(root, 1),
    previous = bundle(root, 2),
    next = bundle(stageRoot, 3);
  storeLocalBuild({
    app: "edvora",
    root,
    commit: next.commit,
    staged: next.directory,
  });
  assert.equal(existsSync(old.directory), false);
  assert.equal(existsSync(previous.directory), true);
  assert.equal(existsSync(path.join(root, next.commit, next.name)), true);
  assert.equal(existsSync(next.directory), false);
});

test("bad checksum leaves previous builds and staged output intact", (t) => {
  const root = fixture(t),
    stageRoot = fixture(t);
  const old = bundle(root, 1),
    next = bundle(stageRoot, 2);
  writeFileSync(path.join(next.directory, next.name), "corrupted");
  assert.throws(
    () =>
      storeLocalBuild({
        app: "edvora",
        root,
        commit: next.commit,
        staged: next.directory,
      }),
    /checksum/,
  );
  assert.equal(existsSync(old.directory), true);
  assert.equal(existsSync(next.directory), true);
});

test("rejects symlink artifact roots and malformed app/commit values", (t) => {
  const root = fixture(t),
    target = fixture(t);
  const link = path.join(root, "link");
  symlinkSync(target, link);
  assert.throws(
    () => pruneLocalBuilds({ app: "edvora", root: link }),
    /Unsafe/,
  );
  assert.throws(() => pruneLocalBuilds({ app: "../escape", root }), /Invalid/);
  assert.throws(
    () => pruneLocalBuilds({ app: "edvora", root, currentCommit: "../escape" }),
    /Invalid/,
  );
});

test("cache cleanup cannot prune containers, images, or volumes", () => {
  const calls = [];
  pruneDockerBuildCache((...args) => calls.push(args));
  assert.deepEqual(calls[0].slice(0, 2), [
    "docker",
    ["buildx", "prune", "--all", "--force"],
  ]);
});

test("rebuilding same commit preserves verified replacement and enforces two builds", (t) => {
  const root = fixture(t),
    stageRoot = fixture(t);
  const first = bundle(root, 1),
    second = bundle(root, 2),
    third = bundle(root, 3);
  const rebuilt = bundle(stageRoot, 2);
  storeLocalBuild({
    app: "edvora",
    root,
    commit: second.commit,
    staged: rebuilt.directory,
  });
  assert.equal(existsSync(first.directory), false);
  for (const b of [second, third]) assert.equal(existsSync(b.directory), true);
});
