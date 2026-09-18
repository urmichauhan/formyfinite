import { test } from "node:test";
import assert from "node:assert/strict";
import { answersFor, csv } from "../api/rules.js";
import { vault, hashPassword, matches } from "../api/security.js";
import { randomBytes } from "node:crypto";
test("Hidden dependency chains discard stale answers", () => {
  assert.deepEqual(
    answersFor(
      [
        { id: "a", kind: "text" },
        {
          id: "b",
          kind: "text",
          required: true,
          when: { field: "a", operator: "equals", value: "yes" },
        },
        {
          id: "c",
          kind: "text",
          required: true,
          when: { field: "b", operator: "differs", value: "no" },
        },
      ],
      { a: "no", b: "stale", c: "stale" },
    ),
    { a: "no" },
  );
});
test("Empty required checkbox rejected", () =>
  assert.throws(() =>
    answersFor(
      [{ id: "a", kind: "checkbox", required: true, choices: ["A"] }],
      { a: [] },
    ),
  ));
test("Encryption rejects tampering", () => {
  const v = vault(randomBytes(32).toString("hex")),
    sealed = v.seal({ hello: "world" });
  assert.deepEqual(v.open(sealed), { hello: "world" });
  sealed.tag = "00".repeat(16);
  assert.throws(() => v.open(sealed));
});
test("Passwords are salted and verified", async () => {
  const a = await hashPassword("a-good-password"),
    b = await hashPassword("a-good-password");
  assert.notEqual(a, b);
  assert.equal(await matches("a-good-password", a), true);
  assert.equal(await matches("wrong-password", a), false);
});
test("CSV escapes quotes and formulas", () => {
  assert.equal(csv('a"b'), '"a""b"');
  assert.equal(csv("=1+1"), '"\'=1+1"');
});
