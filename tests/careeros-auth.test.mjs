import assert from "node:assert/strict";
import { after, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../lib/auth/password.ts";

const prisma = new PrismaClient();
after(() => prisma.$disconnect());

test("hashes passwords and accepts only the matching value", async () => {
  const hash = await hashPassword("a-valid-password");
  assert.notEqual(hash, "a-valid-password");
  assert.equal(await verifyPassword("a-valid-password", hash), true);
  assert.equal(await verifyPassword("incorrect-password", hash), false);
});

test("seeded CareerOS account has a valid hash and rejects an invalid login", async () => {
  const user = await prisma.user.findUnique({ where: { email: "suchayj@mail.com" } });
  assert.ok(user, "Expected the seeded CareerOS account");
  assert.notEqual(user.passwordHash, "suchay@123");
  assert.equal(await verifyPassword("suchay@123", user.passwordHash), true);
  assert.equal(await verifyPassword("definitely-wrong", user.passwordHash), false);
});
