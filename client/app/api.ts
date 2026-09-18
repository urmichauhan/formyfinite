import { Injectable, signal } from '@angular/core';
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  disabled?: boolean;
}
export interface Field {
  id: string;
  type: string;
  label: string;
  help: string;
  required: boolean;
  options: string[];
  min?: number | null;
  max?: number | null;
  condition?: { fieldId: string; operator: string; value: string } | null;
}
export interface FormModel {
  _id?: string;
  title: string;
  description: string;
  fields: Field[];
  theme: string;
  thankYou: string;
  version: number;
  status: string;
  access?: string;
  responseCount?: number;
  updatedAt?: string;
  collaborators: { email: string; role: string; accepted: boolean }[];
}
export const newForm = (): FormModel => ({
  title: 'Untitled form',
  description: '',
  fields: [],
  theme: '#6754d8',
  thankYou: 'Thank you! Your response has been received.',
  version: 1,
  status: 'draft',
  collaborators: [],
  access: 'owner',
});
@Injectable({ providedIn: 'root' })
export class Api {
  user = signal<User | null>(null);
  ready: Promise<void>;
  constructor() {
    this.ready = this.request('/auth/me')
      .then((r) => {
        this.user.set(r.user);
      })
      .catch(() => {});
  }
  async request(path: string, method = 'GET', body?: unknown): Promise<any> {
    const r = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-FormYfinite': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok)
      throw Object.assign(new Error(d.message || 'Request failed'), {
        status: r.status,
        details: d.details,
      });
    return d;
  }
  async logout() {
    await this.request('/auth/logout', 'POST', {});
    this.user.set(null);
  }
}
export function visibleFields(fields: Field[], answers: Record<string, any>) {
  const shown = new Set<string>();
  return fields.filter((f) => {
    const c = f.condition;
    let yes = true;
    if (c) {
      const v = answers[c.fieldId],
        s = Array.isArray(v) ? v.map(String) : String(v ?? '');
      const eq = Array.isArray(s) ? s.includes(c.value) : s === c.value;
      yes =
        shown.has(c.fieldId) &&
        (c.operator === 'notEmpty'
          ? s.length > 0
          : c.operator === 'contains'
            ? s.includes(c.value)
            : c.operator === 'equals'
              ? eq
              : !eq);
    }
    if (yes) shown.add(f.id);
    return yes;
  });
}
