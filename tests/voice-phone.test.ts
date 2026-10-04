import assert from "node:assert/strict";
import { test } from "node:test";
import { normalisePhoneInput, validOptionalPhone } from "../lib/voice/phone";
test("India defaults to +91 without duplicating pasted country codes", () => {
  for (const value of ["98765 43210", "+91 98765 43210", "919876543210", "09876543210", "0091 98765 43210"]) assert.equal(normalisePhoneInput(value), "+919876543210");
});
test("supports another selected country or a full international number", () => {
  assert.equal(normalisePhoneInput("2025550123", "+1"), "+12025550123");
  assert.equal(normalisePhoneInput("+44 7700 900123"), "+447700900123");
  assert.equal(normalisePhoneInput("+49 151 23456789", ""), "+4915123456789");
});

test("optional phone stays empty and rejects malformed numbers when supplied", () => {
  assert.equal(normalisePhoneInput("  ", "+91"), "");
  assert.equal(validOptionalPhone(""), true);
  assert.equal(validOptionalPhone("+919876543210"), true);
  for (const value of ["+91", "+910123456789", "9876543210", "+91hello"]) assert.equal(validOptionalPhone(value), false);
});
