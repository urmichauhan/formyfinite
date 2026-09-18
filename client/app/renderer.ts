import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api, FormModel, Field, visibleFields } from './api';
@Component({
  selector: 'form-renderer',
  imports: [FormsModule],
  template: `<form class="response-form" (ngSubmit)="send()">
    @for (f of shown(); track f.id) {
      <div class="response-field">
        @if (f.type === 'info') {
          <div class="info-field">
            <h3>{{ f.label }}</h3>
            <p>{{ f.help }}</p>
          </div>
        } @else if (f.type === 'link') {
          <a [href]="safeLink(f.help)" target="_blank" rel="noopener noreferrer"
            >{{ f.label }} ↗</a
          >
        } @else {
          <label [for]="f.id"
            >{{ f.label }}
            @if (f.required) {
              <span class="required">*</span>
            }
          </label>
          @if (f.help) {
            <p class="field-help">{{ f.help }}</p>
          }
          @switch (f.type) {
            @case ('number') {
              <input
                type="number"
                step="any"
                [id]="f.id"
                [name]="f.id"
                [(ngModel)]="answers[f.id]"
                [required]="f.required"
                [attr.min]="f.min"
                [attr.max]="f.max"
              />
            }
            @case ('textarea') {
              <textarea
                [id]="f.id"
                [name]="f.id"
                [(ngModel)]="answers[f.id]"
                [required]="f.required"
                [attr.minlength]="f.min"
                [attr.maxlength]="f.max"
                rows="4"
              ></textarea>
            }
            @case ('dropdown') {
              <select
                [id]="f.id"
                [name]="f.id"
                [(ngModel)]="answers[f.id]"
                [required]="f.required"
              >
                <option value="">Choose an option</option>
                @for (o of f.options; track o) {
                  <option [value]="o">{{ o }}</option>
                }
              </select>
            }
            @case ('radio') {
              @for (o of f.options; track o) {
                <label class="choice"
                  ><input
                    type="radio"
                    [name]="f.id"
                    [value]="o"
                    [(ngModel)]="answers[f.id]"
                    [required]="f.required"
                  />{{ o }}</label
                >
              }
            }
            @case ('checkbox') {
              @for (o of f.options; track o) {
                <label class="choice"
                  ><input
                    type="checkbox"
                    [checked]="(answers[f.id] || []).includes(o)"
                    (change)="check(f.id, o, $event)"
                  />{{ o }}</label
                >
              }
            }
            @case ('file') {
              <input
                type="file"
                [id]="f.id"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                (change)="file(f.id, $event)"
              /><small>PDF, PNG, JPG or TXT · up to 1 MB per file</small>
            }
            @default {
              <input
                [id]="f.id"
                [name]="f.id"
                [type]="f.type"
                [attr.step]="f.type === 'number' ? 'any' : null"
                [(ngModel)]="answers[f.id]"
                [required]="f.required"
                [attr.min]="f.type === 'number' ? f.min : null"
                [attr.max]="f.type === 'number' ? f.max : null"
                [attr.minlength]="f.type !== 'number' ? f.min : null"
                [attr.maxlength]="f.type !== 'number' ? f.max : null"
                autocomplete="off"
              />
            }
          }
          @if (errors[f.id]) {
            <p class="field-error" role="alert">{{ errors[f.id] }}</p>
          }
        }
      </div>
    }
    <button
      class="button"
      type="submit"
      [disabled]="busy"
      [style.background]="form.theme"
    >
      {{
        busy ? 'Submitting…' : preview ? 'Test preview →' : 'Submit response →'
      }}</button
    ><small class="form-disclaimer"
      >Never submit account passwords or financial credentials through a
      form.</small
    >
  </form>`,
})
export class Renderer {
  @Input({ required: true }) form!: FormModel;
  @Input() preview = false;
  @Input() busy = false;
  @Input() errors: Record<string, string> = {};
  @Output() submitted = new EventEmitter<Record<string, any>>();
  answers: Record<string, any> = {};
  shown() {
    return visibleFields(this.form.fields, this.answers);
  }
  safeLink(v: string) {
    return /^https?:\/\//i.test(v) ? v : '#';
  }
  check(id: string, o: string, e: Event) {
    const a = this.answers[id] || [];
    this.answers[id] = (e.target as HTMLInputElement).checked
      ? [...a, o]
      : a.filter((x: string) => x !== o);
  }
  async file(id: string, e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    delete this.answers[id];
    delete this.errors[id];
    if (!f) return;
    if (
      f.size > 1024 * 1024 ||
      !['application/pdf', 'image/png', 'image/jpeg', 'text/plain'].includes(
        f.type,
      )
    ) {
      this.errors[id] = 'Choose a supported file no larger than 1 MB';
      return;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    this.answers[id] = { name: f.name, data };
  }
  send() {
    const a: Record<string, any> = {};
    for (const f of this.shown())
      if (this.answers[f.id] !== undefined) a[f.id] = this.answers[f.id];
    this.submitted.emit(a);
  }
}
@Component({
  imports: [Renderer],
  template: `<section class="public-shell">
    @if (error()) {
      <div class="alert" role="alert">{{ error() }}</div>
    }
    @if (done()) {
      <div class="panel success">
        <span>✓</span>
        <h1>Response received.</h1>
        <p>{{ done() }}</p>
        <small>Thank you for being part of the conversation.</small>
      </div>
    } @else if (form(); as f) {
      <div class="public-card" [style.borderTopColor]="f.theme">
        <span class="eyebrow">YOU’RE INVITED TO SHARE</span>
        <h1>{{ f.title }}</h1>
        <p>{{ f.description }}</p>
        <form-renderer
          [form]="f"
          [busy]="busy()"
          [errors]="details()"
          (submitted)="submit($event)"
        />
      </div>
    } @else if (!error()) {
      <p role="status">Loading form…</p>
    }
  </section>`,
})
export class PublicForm {
  api = inject(Api);
  route = inject(ActivatedRoute);
  form = signal<FormModel | null>(null);
  error = signal('');
  done = signal('');
  busy = signal(false);
  details = signal<Record<string, string>>({});
  constructor() {
    this.load();
  }
  async load() {
    try {
      this.form.set(
        await this.api.request(
          '/public/forms/' + this.route.snapshot.params['id'],
        ),
      );
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async submit(answers: any) {
    this.busy.set(true);
    this.error.set('');
    this.details.set({});
    try {
      const r = await this.api.request(
        '/public/forms/' + this.form()!._id + '/submissions',
        'POST',
        { answers, version: this.form()!.version },
      );
      this.done.set(r.message);
    } catch (e: any) {
      this.error.set(e.message);
      this.details.set(e.details || {});
    } finally {
      this.busy.set(false);
    }
  }
}
