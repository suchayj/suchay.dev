import assert from "node:assert/strict";
import { after, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { isTrackablePublicPath } from "../lib/analytics/public-paths.ts";

const prisma = new PrismaClient();
after(() => prisma.$disconnect());

const normalize = (value) => value.normalize("NFKD").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "");

test("resolves JPMorgan aliases deterministically", async () => {
  const company = await prisma.company.findUnique({ where: { slug: "jpmorgan-chase" } });
  assert.ok(company);
  for (const input of ["J.P. Morgan", "JP Morgan", "jpmorgan"]) {
    assert.ok([company.name, ...company.aliases].some((value) => normalize(value) === normalize(input)));
  }
});

test("keeps Barclays excluded and the company seed unique", async () => {
  const [barclays, count, uniqueSlugs] = await Promise.all([
    prisma.company.findUnique({ where: { slug: "barclays" } }),
    prisma.company.count(),
    prisma.company.findMany({ select: { slug: true }, distinct: ["slug"] }),
  ]);
  assert.equal(barclays?.targetStatus, "EXCLUDED");
  assert.equal(count, 62);
  assert.equal(uniqueSlugs.length, count);
});

test("tracks portfolio routes and rejects non-public boundaries", () => {
  assert.equal(isTrackablePublicPath("/about"), true);
  assert.equal(isTrackablePublicPath("/work/edvora"), true);
  assert.equal(isTrackablePublicPath("/career"), false);
  assert.equal(isTrackablePublicPath("/login"), false);
  assert.equal(isTrackablePublicPath("/api/analytics/visit"), false);
});
