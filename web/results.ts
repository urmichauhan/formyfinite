import { Component, inject, signal, OnDestroy } from "@angular/core";
import { DatePipe, DecimalPipe } from "@angular/common";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { Api, Survey } from "./core";
@Component({
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `<section class="shell workspace">
    <a [routerLink]="['/edit', id]">← Back to form</a>
    <div class="page-top">
      <div>
        <span class="eyebrow">FROM ANSWERS TO INSIGHT</span>
        <h1>{{ survey()?.title || "Responses" }}</h1>
        <p>Updates automatically every 10 seconds.</p>
      </div>
      <a class="button" [href]="'/api/forms/' + id + '/export.csv'"
        >Export CSV ↓</a
      >
    </div>
    @if (error()) {
      <div class="alert">{{ error() }}</div>
    }
    @if (report(); as r) {
      <div class="stats">
        <div>
          <span>Total responses</span><strong>{{ r.total }}</strong>
        </div>
        <div>
          <span>Active days</span><strong>{{ entries(r.daily).length }}</strong>
        </div>
        <div>
          <span>Form status</span
          ><strong class="word">{{ survey()?.state }}</strong>
        </div>
      </div>
      <div class="columns two">
        <article class="card">
          <h3>Responses by day</h3>
          @for (day of entries(r.daily); track day[0]) {
            <div class="chart-row">
              <span>{{ day[0] }}</span>
              <div class="track">
                <div
                  class="bar"
                  [style.width.%]="(day[1] * 100) / max(r.daily)"
                ></div>
              </div>
              <b>{{ day[1] }}</b>
            </div>
          } @empty {
            <p>Your response timeline will appear here.</p>
          }
        </article>
        @for (q of entries(r.questions); track q[0]) {
          <article class="card">
            <h3>{{ q[1].label }}</h3>
            @if (q[1].kind === "number") {
              <p>Average answer</p>
              <h2>{{ q[1].sum / q[1].count | number: "1.0-2" }}</h2>
            } @else {
              @for (c of entries(q[1].choices); track c[0]) {
                <div class="chart-row">
                  <span>{{ c[0] }}</span>
                  <div class="track">
                    <div
                      class="bar"
                      [style.width.%]="(c[1] * 100) / max(q[1].choices)"
                    ></div>
                  </div>
                  <b>{{ c[1] }}</b>
                </div>
              }
            }
          </article>
        }
      </div>
    }
    <div class="list-top">
      <h2>Individual responses</h2>
      <span>{{ total() }} responses · Page {{ page }}</span>
    </div>
    @for (row of rows(); track row.id) {
      <details class="card response-item">
        <summary>
          <strong>Response {{ row.id.slice(-6) }}</strong
          ><span>{{ row.createdAt | date: "medium" }}</span>
        </summary>
        @for (q of row.fields; track q.id) {
          @if (row.answers[q.id] !== undefined) {
            <div class="answer">
              <strong>{{ q.label }}</strong>
              @if (q.kind === "file") {
                <button class="plain" (click)="download(row.answers[q.id])">
                  Download {{ row.answers[q.id].name }} ↓
                </button>
              } @else if (q.kind === "password") {
                <span
                  >••••••••
                  <small>Included in authorized CSV exports.</small></span
                >
              } @else {
                <span>{{ display(row.answers[q.id]) }}</span>
              }
            </div>
          }
        }
        @if (survey()?.access === "owner") {
          <button class="plain danger" (click)="remove(row.id)">
            Delete response
          </button>
        }
      </details>
    } @empty {
      <div class="empty card">
        <h3>The conversation is just beginning.</h3>
        <p>Publish your form and share its link to start collecting answers.</p>
      </div>
    }
    <div class="actions spaced">
      <button
        class="button light small"
        [disabled]="page === 1"
        (click)="turn(-1)"
      >
        ← Previous</button
      ><button
        class="button light small"
        [disabled]="page * 50 >= total()"
        (click)="turn(1)"
      >
        Next →
      </button>
    </div>
  </section>`,
})
export class Results implements OnDestroy {
  api = inject(Api);
  id = inject(ActivatedRoute).snapshot.params["id"];
  survey = signal<Survey | null>(null);
  report = signal<any>(null);
  rows = signal<any[]>([]);
  total = signal(0);
  error = signal("");
  page = 1;
  timer: any;
  constructor() {
    this.load();
    this.timer = setInterval(() => this.load(), 10000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
  entries(o: any): [string, any][] {
    return Object.entries(o || {});
  }
  max(o: any) {
    return Math.max(1, ...Object.values(o).map(Number));
  }
  display(v: any) {
    return Array.isArray(v) ? v.join(", ") : String(v);
  }
  async load() {
    try {
      const [f, r, s] = await Promise.all([
        this.api.call("/forms/" + this.id),
        this.api.call("/forms/" + this.id + "/analytics"),
        this.api.call("/forms/" + this.id + "/responses?page=" + this.page),
      ]);
      this.survey.set(f);
      this.report.set(r);
      this.rows.set(s.rows);
      this.total.set(s.total);
      this.error.set("");
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  turn(delta: number) {
    this.page += delta;
    this.load();
  }
  async remove(id: string) {
    if (!confirm("Permanently delete this response?")) return;
    try {
      await this.api.call("/forms/" + this.id + "/responses/" + id, "DELETE");
      this.load();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  download(file: any) {
    const data = Uint8Array.from(atob(file.data.split(",")[1]), (s: string) =>
      s.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/octet-stream" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
