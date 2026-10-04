import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveVisitorLocation as resolve } from "../lib/analytics/visitor-location.ts";

const empty = { country: null, region: null, city: null };
const record = { country_code: "IN", state1: "Maharashtra", city: "Nagpur" };
const location = { country: "India", region: "Maharashtra", city: "Nagpur" };

test("location lookup is automatic, without an enable setting", async () => {
  let calls = 0;
  assert.deepEqual(await resolve(new Headers({ "x-real-ip": "8.8.8.8", "x-geo-city": "Forged" }), {
    trustGeoHeaders: false, lookup: async (ip) => { calls++; assert.equal(ip, "8.8.8.8"); return record; },
  }), location);
  assert.equal(calls, 1);
});

test("forwarded and untrusted geographic headers cannot set location", async () => {
  assert.deepEqual(await resolve(new Headers({ "x-geo-city": "Forged", "x-forwarded-for": "1.1.1.1" }), {
    trustGeoHeaders: false, lookup: async () => assert.fail("unexpected lookup"),
  }), empty);
});

test("trusted proxy geographic fields take priority", async () => {
  assert.deepEqual(await resolve(new Headers({ "x-geo-country": " India ", "x-geo-city": "Nagpur" }), {
    trustGeoHeaders: true, lookup: async () => assert.fail("unexpected lookup"),
  }), { country: "India", region: null, city: "Nagpur" });
});

test("private, local, reserved and malformed addresses do not produce invented locations", async () => {
  const options = { trustGeoHeaders: false, lookup: async () => assert.fail("unexpected lookup") };
  for (const ip of ["", "127.0.0.1", "10.0.0.1", "192.168.1.2", "172.16.1.2", "169.254.1.2",
    "100.64.0.1", "0.0.0.0", "192.0.2.1", "198.51.100.1", "203.0.113.1", "255.255.255.255",
    "::1", "fc00::1", "fe80::1", "2001:db8::1", "::ffff:127.0.0.1", "8.8.8.8, 1.1.1.1", "example.com"]) {
    assert.deepEqual(await resolve(new Headers({ "x-real-ip": ip }), options), empty, ip);
  }
});

test("IPv6 and IPv4-mapped addresses reach the local reader", async () => {
  const ips = [];
  const options = { trustGeoHeaders: false, lookup: async (ip) => { ips.push(ip); return record; } };
  assert.deepEqual(await resolve(new Headers({ "x-real-ip": "2001:4860:4860::8888" }), options), location);
  assert.deepEqual(await resolve(new Headers({ "x-real-ip": "::ffff:8.8.4.4" }), options), location);
  assert.deepEqual(ips, ["2001:4860:4860::8888", "8.8.4.4"]);
});

test("missing records and lookup errors preserve empty location without failing visits", async () => {
  for (const lookup of [async () => null, async () => { throw new Error("missing database"); }]) {
    assert.deepEqual(await resolve(new Headers({ "x-real-ip": "8.8.8.8" }), { trustGeoHeaders: false, lookup }), empty);
  }
  assert.deepEqual(await resolve(new Headers({ "x-real-ip": "8.8.8.8" }), {
    trustGeoHeaders: false, lookup: async () => ({ country_code: "US", state1: "", city: null }),
  }), { country: "United States", region: null, city: null });
});

test("packaged IPv4 and IPv6 databases resolve real addresses entirely offline", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => assert.fail("location must not use an external service");
  try {
    for (const ip of ["8.8.8.8", "2001:4860:4860::8888"]) {
      const result = await resolve(new Headers({ "x-real-ip": ip }), { trustGeoHeaders: false });
      assert.ok(result.country && result.country.length > 2, `Expected a country name for ${ip}`);
      if (ip === "8.8.8.8") assert.equal(result.country, "United States");
      assert.ok(result.city, `Expected city coverage for ${ip}`);
      assert.ok(result.region, `Expected region coverage for ${ip}`);
    }
  } finally { globalThis.fetch = originalFetch; }
});
