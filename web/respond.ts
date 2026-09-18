import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Api, Survey, shown } from "./core";
@Component({
  selector: "survey-fields",
  imports: [FormsModule],
  template: `<form (ngSubmit)="submit()">
    @for (q of visible(); track q.id) {
      <div class="response-question">
        @if (q.kind === "info") {
          <div class="info-box">
            <h3>{{ q.label }}</h3>
            <p>{{ q.hint }}</p>
          </div>
        } @else if (q.kind === "link") {
          <a [href]="link(q.hint)" target="_blank" rel="noopener noreferrer"
            >{{ q.label }} ↗</a
          >
        } @else {
          <label [for]="q.id"
            >{{ q.label }}
            @if (q.required) {
              <span class="required" aria-hidden="true">*</span>
            }
          </label>
          @if (q.hint) {
            <p class="hint">{{ q.hint }}</p>
          }
          @switch (q.kind) {
            @case ("number") {
              <input
                type="number"
                step="any"
                [id]="q.id"
                [name]="q.id"
                [(ngModel)]="answers[q.id]"
                [required]="q.required"
                [attr.min]="q.min"
                [attr.max]="q.max"
              />
            }
            @case ("textarea") {
              <textarea
                [id]="q.id"
                [name]="q.id"
                [(ngModel)]="answers[q.id]"
                [required]="q.required"
                [attr.minlength]="q.min"
                [attr.maxlength]="q.max"
                rows="4"
              ></textarea>
            }
            @case ("select") {
              <select
                [id]="q.id"
                [name]="q.id"
                [(ngModel)]="answers[q.id]"
                [required]="q.required"
              >
                <option value="">Select an option</option>
                @for (c of q.choices; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            }
            @case ("radio") {
              @for (c of q.choices; track c) {
                <label class="choice"
                  ><input
                    type="radio"
                    [name]="q.id"
                    [value]="c"
                    [(ngModel)]="answers[q.id]"
                    [required]="q.required"
                  />{{ c }}</label
                >
              }
            }
            @case ("checkbox") {
              @for (c of q.choices; track c) {
                <label class="choice"
                  ><input
                    type="checkbox"
                    [checked]="(answers[q.id] || []).includes(c)"
                    (change)="check(q.id, c, $event)"
                  />{{ c }}</label
                >
              }
            }
            @case ("file") {
              <input
                type="file"
                [id]="q.id"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                (change)="upload(q.id, $event)"
              /><small>PDF, PNG, JPEG or TXT · maximum 1 MB</small>
            }
            @default {
              <input
                [type]="q.kind"
                [id]="q.id"
                [name]="q.id"
                [(ngModel)]="answers[q.id]"
                [required]="q.required"
                [attr.minlength]="q.min"
                [attr.maxlength]="q.max"
                autocomplete="off"
              />
            }
          }
          @if (errors[q.id] || fileErrors()[q.id]) {
            <div class="field-error" role="alert">
              {{ errors[q.id] || fileErrors()[q.id] }}
            </div>
          }
        }
      </div>
    }
    <button
      class="button"
      [style.background]="survey.accent"
      [disabled]="busy || reading()"
    >
      {{
        reading()
          ? "Reading file…"
          : busy
            ? "Submitting…"
            : preview
              ? "Test preview"
              : "Submit response →"
      }}
    </button>
    <p class="hint">
      Never submit account passwords or financial credentials through a form.
    </p>
  </form>`,
})
export class Fields {
  @Input({ required: true }) survey!: Survey;
  @Input() preview = false;
  @Input() busy = false;
  @Input() errors: Record<string, string> = {};
  @Output() complete = new EventEmitter<Record<string, any>>();
  answers: Record<string, any> = {};
  reading = signal(0);
  fileErrors = signal<Record<string, string>>({});
  visible() {
    return shown(this.survey.fields, this.answers);
  }
  link(url: string) {
    return /^https?:\/\//i.test(url) ? url : "#";
  }
  check(id: string, c: string, event: Event) {
    const a = this.answers[id] || [];
    this.answers[id] = (event.target as HTMLInputElement).checked
      ? [...a, c]
      : a.filter((v: string) => v !== c);
  }
  async upload(id: string, event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0];
    delete this.answers[id];
    this.fileErrors.update((e) => ({ ...e, [id]: "" }));
    if (!f) return;
    if (
      f.size > 1048576 ||
      !["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(
        f.type,
      )
    ) {
      this.fileErrors.update((e) => ({
        ...e,
        [id]: "Choose a supported file under 1 MB",
      }));
      return;
    }
    this.reading.update((n) => n + 1);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      });
      this.answers[id] = { name: f.name, data };
    } catch {
      this.fileErrors.update((e) => ({
        ...e,
        [id]: "Could not read this file",
      }));
    } finally {
      this.reading.update((n) => n - 1);
    }
  }
  submit() {
    if (this.reading()) return;
    const clean: Record<string, any> = {};
    for (const q of this.visible())
      if (this.answers[q.id] !== undefined) clean[q.id] = this.answers[q.id];
    this.complete.emit(clean);
  }
}
@Component({
  imports: [Fields],
  template: `<section class="public-shell">
    @if (error()) {
      <div class="alert" role="alert">{{ error() }}</div>
    }
    @if (done()) {
      <div class="card success">
        <span>✓</span>
        <h1>Thank you for sharing.</h1>
        <p>{{ done() }}</p>
      </div>
    } @else if (survey(); as s) {
      <div class="public-card" [style.borderTopColor]="s.accent">
        <span class="eyebrow">YOUR PERSPECTIVE MATTERS</span>
        <h1>{{ s.title }}</h1>
        <p>{{ s.description }}</p>
        <survey-fields
          [survey]="s"
          [busy]="busy()"
          [errors]="errors()"
          (complete)="send($event)"
        />
      </div>
    } @else if (!error()) {
      <p role="status">Loading form…</p>
    }
  </section>`,
})
export class Respond {
  api = inject(Api);
  id = inject(ActivatedRoute).snapshot.params["id"];
  survey = signal<Survey | null>(null);
  error = signal("");
  errors = signal<Record<string, string>>({});
  done = signal("");
  busy = signal(false);
  submissionKey = crypto.randomUUID();
  constructor() {
    this.api
      .call("/public/" + this.id)
      .then((s) => this.survey.set(s))
      .catch((e) => this.error.set(e.message));
  }
  async send(answers: any) {
    this.busy.set(true);
    this.error.set("");
    this.errors.set({});
    try {
      const r = await this.api.call(
        "/public/" + this.id + "/responses",
        "POST",
        {
          answers,
          revision: this.survey()!.revision,
          submissionKey: this.submissionKey,
        },
      );
      this.done.set(r.message);
    } catch (e: any) {
      this.error.set(e.message);
      this.errors.set(e.details || {});
    } finally {
      this.busy.set(false);
    }
  }
}
