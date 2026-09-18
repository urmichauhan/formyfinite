import { Injectable, signal } from "@angular/core";
export interface Person {
  id: string;
  name: string;
  email: string;
  admin: boolean;
  disabled?: boolean;
}
export interface Question {
  id: string;
  kind: string;
  label: string;
  hint: string;
  required: boolean;
  choices: string[];
  min?: number | null;
  max?: number | null;
  when?: { field: string; operator: string; value: string } | null;
}
export interface Survey {
  _id?: string;
  title: string;
  description: string;
  accent: string;
  confirmation: string;
  fields: Question[];
  revision: number;
  state: string;
  access: string;
  members: { email: string; role: string; accepted: boolean }[];
  responses?: number;
  updatedAt?: string;
}
export function blank(): Survey {
  return {
    title: "Untitled form",
    description: "",
    accent: "#6850d8",
    confirmation: "Thank you! Your response has been saved.",
    fields: [],
    revision: 1,
    state: "draft",
    access: "owner",
    members: [],
  };
}
@Injectable({ providedIn: "root" })
export class Api {
  person = signal<Person | null>(null);
  ready: Promise<void>;
  constructor() {
    this.ready = this.call("/account")
      .then((p) => {
        this.person.set(p);
      })
      .catch(() => {});
  }
  async call(path: string, method = "GET", data?: unknown): Promise<any> {
    const r = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-FormYfinite": "1" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const result = await r.json();
    if (!r.ok)
      throw Object.assign(new Error(result.message || "Request failed"), {
        status: r.status,
        details: result.details,
      });
    return result;
  }
}
export function shown(fields: Question[], answers: Record<string, any>) {
  const visible = new Set();
  return fields.filter((f) => {
    let yes = true;
    if (f.when) {
      const c = f.when,
        v = answers[c.field],
        a = Array.isArray(v) ? v.map(String) : String(v ?? "");
      const equal = Array.isArray(a) ? a.includes(c.value) : a === c.value;
      yes =
        visible.has(c.field) &&
        (c.operator === "answered"
          ? a.length > 0
          : c.operator === "contains"
            ? a.includes(c.value)
            : c.operator === "equals"
              ? equal
              : !equal);
    }
    if (yes) visible.add(f.id);
    return yes;
  });
}
