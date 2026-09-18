import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateAnswers,
  visible,
  csvCell,
  formSchema,
} from "../server/validation.js";
test("Hidden dependent questions never become required", () => {
  const fields = [
    { id: "a", type: "text", required: false },
    {
      id: "b",
      type: "text",
      required: true,
      condition: { fieldId: "a", operator: "equals", value: "yes" },
    },
    {
      id: "c",
      type: "text",
      required: true,
      condition: { fieldId: "b", operator: "notEquals", value: "no" },
    },
  ];
  assert.deepEqual(
    validateAnswers(fields, { a: "no", b: "injected", c: "injected" }),
    { a: "no" },
  );
});
test("Required checkboxes cannot be bypassed with an empty array", () => {
  assert.throws(() =>
    validateAnswers(
      [{ id: "a", type: "checkbox", required: true, options: ["X"] }],
      { a: [] },
    ),
  );
});
test("CSV escaping handles formulas, quotes and multiline values", () => {
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell("line\nline"), '"line\nline"');
});

test("Reserved field identifiers are rejected", () => {
  for (const id of ["__proto__", "constructor", "toString"]) {
    assert.equal(
      formSchema.safeParse({
        title: "Test",
        fields: [{ id, type: "text", label: "Unsafe" }],
      }).success,
      false,
    );
  }
});
