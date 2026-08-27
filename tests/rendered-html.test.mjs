import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";

const host = "127.0.0.1";
const port = 3110;
const baseUrl = `http://${host}:${port}`;
let server;
let serverOutput = "";

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next.js exited before becoming ready.\n${serverOutput}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for Next.js.\n${serverOutput}`);
}

async function render(path = "/") {
  return fetch(`${baseUrl}${path}`, { headers: { accept: "text/html" } });
}

before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", host, "-p", String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  await waitForServer();
});

after(() => {
  if (server?.exitCode === null) server.kill("SIGTERM");
});

test("renders the production portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Suchay Janbandhu — Senior Full Stack Engineer<\/title>/i);
  assert.match(html, /I build software that moves from complex ideas/);
  assert.match(html, /Edvora/);
  assert.match(html, /Rentora/);
  assert.doesNotMatch(html, /Streamora/);
  assert.doesNotMatch(html, /Available within 15 days/);
  assert.match(html, /href="https:\/\/rentora\.suchay\.dev"/);
  assert.match(html, /href="https:\/\/edvoraschool\.com"/);
  assert.match(html, /href="https:\/\/loom\.suchay\.dev"/);
  assert.match(html, /href="https:\/\/rentora\.suchay\.dev" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /href="\/work\/rentora"/);
  assert.match(html, /brands\/rentora\/rentora-mark\.png/);
  assert.match(html, /brands\/edvora\/edvora-mark-(?:white|blue)\.svg/);
  assert.match(html, /brands\/loom\/loom-logo(?:-dark)?\.png/);
  assert.match(html, /suchay-color-cutout-original\.png/);
  assert.doesNotMatch(html, /suchay-bw-original\.png/);
  assert.match(html, /Full-stack engineer building AI-native products/);
  assert.doesNotMatch(html, /Key engineering decision/);
  assert.doesNotMatch(html, /deterministic interpretation first/);
  assert.match(html, /Engineering technologies and domains/);
  assert.match(html, /GitHub/);
  assert.match(html, /GitLab/);
  assert.match(html, /OpenShift/);
  assert.match(html, /aria-label="CareerOS login"/);
  assert.match(html, />SUCHAY\.</);
  assert.match(html, /href="\/login"/);
  assert.doesNotMatch(html, /Portrait \/ Pune/);
  assert.equal((html.match(/mailto:suchayjanbandhu@gmail\.com/g) ?? []).length, 1);
  assert.match(html, /Contact Suchay/);
  assert.match(html, /Hello%20Suchay%20%E2%80%94%20reaching%20out%20from%20suchay\.dev/);
  assert.match(html, /href="\/timeline"[^>]*>Work Timeline<\/a>/);
  assert.doesNotMatch(html, /href="\/work"/);
  assert.match(html, /href="\/capabilities"/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /href="\/resume"/);
  assert.doesNotMatch(html, /href="\/[^"]*\?/);
});

test("renders the biography and an optimized authentic image", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>About Suchay Janbandhu — Engineer, Product Builder<\/title>/i);
  assert.match(html, /turning ambiguous, operational problems/);
  assert.match(html, /A working philosophy/);
  assert.match(html, /Beyond the code/);
  assert.match(html, /beach-goggle\.jpg/);
  assert.doesNotMatch(html, /silver-dress\.jpg/);

  const optimizedPath = html.match(/src="([^" ]*\/_next\/image[^" ]*)"/)?.[1]?.replaceAll("&amp;", "&");
  assert.ok(optimizedPath, "Expected next/image to render an optimization URL");
  const imageResponse = await fetch(new URL(optimizedPath, baseUrl), { headers: { accept: "image/avif,image/webp,image/*" } });
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get("content-type") ?? "", /^image\//);
  assert.ok((await imageResponse.arrayBuffer()).byteLength > 1_000);
});

test("serves every primary and case-study route", async () => {
  const paths = [
    "/timeline",
    "/capabilities",
    "/contact",
    "/resume",
    "/resume/print",
    "/work/edvora",
    "/work/rentora",
    "/work/loom",
  ];
  for (const path of paths) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.doesNotMatch(html, /href="\/[^"]*\?/);
  }
});

test("redirects only the retired work index to Work Timeline", async () => {
  const response = await fetch(`${baseUrl}/work`, { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "/timeline");

  for (const path of ["/work/edvora", "/work/rentora", "/work/loom"]) {
    const caseStudy = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert.equal(caseStudy.status, 200, path);
    assert.equal(caseStudy.headers.get("location"), null, path);
  }
  const retiredPrivateProject = await fetch(`${baseUrl}/work/streamora`, { redirect: "manual" });
  assert.equal(retiredPrivateProject.status, 404);
});

test("renders a semantic, canonical two-page resume and print surface", async () => {
  for (const path of ["/resume", "/resume/print"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /Senior Full Stack Engineer/);
    assert.match(html, /10\+ years/);
    assert.match(html, /Vocalink[\s\S]*by Mastercard/);
    assert.doesNotMatch(html, /Mastercard Vocalink/);
    assert.match(html, /Barclays Identification &amp; Verification \(BIDV\)/);
    assert.match(html, /Amazon Connect — Voice Systems/);
    assert.match(html, /Priyadarshini Institute of Engineering and Technology/);
    assert.equal((html.match(/data-resume-page=/g) ?? []).length, 2);
    assert.match(html, /Resilience4j/);
    assert.match(html, /dedicated retry\/recovery topic/);
    assert.doesNotMatch(html, /Dead Letter Queue|\bDL[QT]\b/i);
    assert.doesNotMatch(html, /<img/i);
    assert.doesNotMatch(html, /href="\/[^"]*\?/);
  }
});

test("renders the historical retry topic without presenting it as a DLT", async () => {
  const response = await render("/timeline");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Work Timeline — Suchay Janbandhu<\/title>/i);
  assert.match(html, /Vocalink[\s\S]*by Mastercard/);
  assert.doesNotMatch(html, /<strong>Mastercard Vocalink<\/strong>/);
  assert.match(html, /feedback-retry/);
  assert.match(html, /Resilience4j/);
  assert.match(html, /25 October 2021 — 01 May 2026/);
  assert.match(html, />Barclays</);
  assert.match(html, /4 years 6 months(?:<!-- -->)? building within enterprise financial systems/);
  assert.doesNotMatch(html, /More than four and a half years/);
  assert.match(html, /May 2026 — Present/);
  assert.doesNotMatch(html, /March 2026 — Present/);
  assert.doesNotMatch(html, /Dead Letter Queue|\bDL[QT]\b/i);
});

test("serves metadata routes from the Next.js runtime", async () => {
  const expectations = [
    ["/robots.txt", /^text\/plain/],
    ["/sitemap.xml", /^(application|text)\/xml/],
    ["/manifest.webmanifest", /^application\/manifest\+json/],
  ];
  for (const [path, contentType] of expectations) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type") ?? "", contentType, path);
    const body = await response.text();
    assert.ok(body.length > 20, path);
    if (path === "/robots.txt") {
      assert.match(body, /Disallow: \/career/);
      assert.match(body, /Disallow: \/login/);
      assert.match(body, /Disallow: \/api\//);
    }
    if (path === "/sitemap.xml") {
      assert.doesNotMatch(body, /streamora|career|login/i);
      assert.match(body, /work\/rentora/);
      assert.match(body, /work\/edvora/);
      assert.match(body, /work\/loom/);
    }
  }
});

test("renders canonical social metadata and truthful structured data", async () => {
  const home = await (await render("/")).text();
  assert.match(home, /rel="canonical" href="https:\/\/suchay\.dev\/?"/);
  assert.match(home, /property="og:title"/);
  assert.match(home, /name="twitter:card" content="summary_large_image"/);
  assert.match(home, /"@type":"Person"/);
  assert.match(home, /"@type":"ProfilePage"/);
  assert.match(home, /https:\/\/github\.com\/suchayj/);

  const caseStudy = await (await render("/work/rentora")).text();
  assert.match(caseStudy, /rel="canonical" href="https:\/\/suchay\.dev\/work\/rentora"/);
  assert.match(caseStudy, /property="og:type" content="article"/);
  assert.match(caseStudy, /"@type":"CreativeWork"/);
  assert.match(caseStudy, /"name":"Rentora case study"/);
});

test("renders authentic product marks beside visible case-study names", async () => {
  const expectations = [
    ["rentora", /brands\/rentora\/rentora-mark\.png/],
    ["edvora", /brands\/edvora\/edvora-mark-white\.svg/],
    ["loom", /brands\/loom\/loom-logo\.png/],
  ];
  for (const [slug, asset] of expectations) {
    const html = await (await render(`/work/${slug}`)).text();
    assert.match(html, asset);
    assert.match(html, new RegExp(`<h1[^>]*>[\\s\\S]*${slug}`, "i"));
  }
});
