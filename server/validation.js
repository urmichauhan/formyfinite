import { z } from "zod";
export const types = [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "dropdown",
  "date",
  "file",
  "number",
  "email",
  "password",
  "info",
  "link",
];
export const fieldSchema = z.object({
  id: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,80}$/)
    .refine(
      (id) => !Object.getOwnPropertyNames(Object.prototype).includes(id),
      "Reserved field identifier",
    ),
  type: z.enum(types),
  label: z.string().trim().min(1).max(200),
  help: z.string().max(1000).default(""),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(200)).max(100).default([]),
  min: z.number().finite().nullable().optional(),
  max: z.number().finite().nullable().optional(),
  condition: z
    .object({
      fieldId: z.string(),
      operator: z.enum(["equals", "notEquals", "contains", "notEmpty"]),
      value: z.string().max(1000),
    })
    .nullable()
    .optional(),
});
export const formSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(2000).default(""),
    fields: z.array(fieldSchema).max(100),
    theme: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .default("#6754d8"),
    thankYou: z
      .string()
      .min(1)
      .max(1000)
      .default("Thank you! Your response has been received."),
  })
  .superRefine((f, ctx) => {
    const seen = new Set();
    f.fields.forEach((x, i) => {
      const err = (m) =>
        ctx.addIssue({ code: "custom", message: m, path: ["fields", i] });
      if (seen.has(x.id)) err("Field IDs must be unique");
      if (x.condition && !seen.has(x.condition.fieldId))
        err("Conditions must reference an earlier field");
      if (
        ["radio", "checkbox", "dropdown"].includes(x.type) &&
        (!x.options.length || new Set(x.options).size !== x.options.length)
      )
        err("Provide unique choices");
      if (x.min != null && x.max != null && x.min > x.max)
        err("Minimum must not exceed maximum");
      if (x.type !== "number" && ((x.min ?? 0) < 0 || (x.max ?? 0) < 0))
        err("Length limits must not be negative");
      seen.add(x.id);
    });
  });
export function visible(field, answers, visibleIds) {
  const c = field.condition;
  if (!c) return true;
  if (!visibleIds.has(c.fieldId)) return false;
  const a = answers[c.fieldId];
  const s = Array.isArray(a) ? a.map(String) : String(a ?? "");
  if (c.operator === "notEmpty")
    return Array.isArray(s) ? s.length > 0 : s !== "";
  if (c.operator === "contains") return s.includes(c.value);
  const eq = Array.isArray(s) ? s.includes(c.value) : s === c.value;
  return c.operator === "equals" ? eq : !eq;
}
export function validateAnswers(fields, raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw Object.assign(new Error("Answers must be an object"), {
      status: 400,
    });
  const clean = {},
    errors = {},
    shown = new Set();
  for (const f of fields) {
    if (!visible(f, raw, shown)) continue;
    shown.add(f.id);
    if (["info", "link"].includes(f.type)) continue;
    const v = raw[f.id],
      empty =
        v === undefined ||
        v === null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0);
    if (empty) {
      if (f.required) errors[f.id] = "This field is required";
      continue;
    }
    if (f.type === "file") {
      if (
        typeof v !== "object" ||
        typeof v.name !== "string" ||
        typeof v.data !== "string" ||
        !/^data:(application\/pdf|image\/(png|jpeg)|text\/plain);base64,[A-Za-z0-9+/]*={0,2}$/.test(
          v.data,
        ) ||
        v.data.length > 1400000 ||
        Buffer.from(v.data.split(",")[1] || "", "base64").length > 1048576
      )
        errors[f.id] = "Use a PDF, PNG, JPEG or text file up to 1 MB";
      else clean[f.id] = { name: v.name.slice(0, 150), data: v.data };
      continue;
    }
    if (f.type === "checkbox") {
      if (
        !Array.isArray(v) ||
        v.some((x) => typeof x !== "string" || !f.options.includes(x)) ||
        new Set(v).size !== v.length
      )
        errors[f.id] = "Choose valid options";
      else clean[f.id] = v;
      continue;
    }
    if (f.type === "number") {
      const n = typeof v === "number" ? v : NaN;
      if (
        !Number.isFinite(n) ||
        (f.min != null && n < f.min) ||
        (f.max != null && n > f.max)
      )
        errors[f.id] = "Enter a number within the allowed range";
      else clean[f.id] = n;
      continue;
    }
    if (typeof v !== "string" || v.length > 10000) {
      errors[f.id] = "Enter valid text (up to 10,000 characters)";
      continue;
    }
    if (
      (f.min != null && v.length < f.min) ||
      (f.max != null && v.length > f.max)
    )
      errors[f.id] = "Check the allowed length";
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      errors[f.id] = "Enter a valid email";
    if (
      f.type === "date" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
        !Number.isFinite(Date.parse(v)) ||
        new Date(v).toISOString().slice(0, 10) !== v)
    )
      errors[f.id] = "Enter a valid date";
    if (["radio", "dropdown"].includes(f.type) && !f.options.includes(v))
      errors[f.id] = "Choose a valid option";
    clean[f.id] = v;
  }
  if (Object.keys(errors).length)
    throw Object.assign(new Error("Please check the highlighted answers"), {
      status: 400,
      details: errors,
    });
  return clean;
}
export function csvCell(value) {
  let s =
    typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
