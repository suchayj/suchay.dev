import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the production portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Suchay Janbandhu — Senior Full Stack Engineer<\/title>/i);
  assert.match(html, /I build software that moves from complex ideas/);
  assert.match(html, /Edvora/);
  assert.match(html, /Rentora/);
  assert.match(html, /Streamora/);
  assert.match(html, /Available within 15 days/);
  assert.match(html, /mailto:suchayj@gmail\.com/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("renders the About page biography and image slots", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>About Suchay Janbandhu — Engineer, Product Builder<\/title>/i);
  assert.match(html, /turning ambiguous, operational problems/);
  assert.match(html, /Enterprise foundations/);
  assert.match(html, /Product systems and AI/);
  assert.doesNotMatch(html, /silver-dress\.jpg/);
  assert.match(html, /Architecture through operation/);
  assert.match(html, /gym-potrait\.jpg/);
  assert.match(html, /black-thsirt-walking\.jpg/);
  assert.match(html, /beach-goggle\.jpg/);
  assert.match(html, /Authentic image/);
  assert.doesNotMatch(html, /salary|testimonial|years of experience/i);
});
