import { Component, inject, signal, OnDestroy } from '@angular/core';
import { DatePipe, JsonPipe, DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Api, FormModel } from './api';
@Component({
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `<section class="workspace">
    <a [routerLink]="['/forms', id]" class="back">← Back to form</a>
    <div class="page-heading">
      <div>
        <span class="eyebrow">THE STORY IN YOUR DATA</span>
        <h1>{{ form()?.title || 'Responses' }}</h1>
        <p>Responses refresh every 10 seconds.</p>
      </div>
      <a class="button" [href]="'/api/forms/' + id + '/export'"
        >Download CSV ↓</a
      >
    </div>
    @if (error()) {
      <div class="alert">{{ error() }}</div>
    }
    @if (report(); as r) {
      <div class="stats">
        <article>
          <span>Total responses</span><strong>{{ r.total }}</strong>
        </article>
        <article>
          <span>Days with responses</span
          ><strong>{{ entries(r.daily).length }}</strong>
        </article>
        <article>
          <span>Form status</span
          ><strong class="stat-word">{{ form()?.status }}</strong>
        </article>
      </div>
      <div class="analytics-grid">
        <article class="panel">
          <h3>Responses over time</h3>
          @for (day of entries(r.daily); track day[0]) {
            <div class="chart-row">
              <span>{{ day[0] }}</span>
              <div class="bar-track">
                <div
                  class="bar"
                  [style.width.%]="(100 * day[1]) / max(r.daily)"
                ></div>
              </div>
              <b>{{ day[1] }}</b>
            </div>
          } @empty {
            <p>Your response trends will appear here.</p>
          }
        </article>
        @for (entry of entries(r.fields); track entry[0]) {
          <article class="panel">
            <h3>{{ entry[1].label }}</h3>
            @if (entry[1].type === 'number') {
              <span>Average</span>
              <h2>{{ entry[1].sum / entry[1].count | number: '1.0-2' }}</h2>
              <small>{{ entry[1].count }} answers</small>
            } @else {
              @for (choice of entries(entry[1].counts); track choice[0]) {
                <div class="chart-row">
                  <span>{{ choice[0] }}</span>
                  <div class="bar-track">
                    <div
                      class="bar"
                      [style.width.%]="(100 * choice[1]) / max(entry[1].counts)"
                    ></div>
                  </div>
                  <b>{{ choice[1] }}</b>
                </div>
              }
            }
          </article>
        }
      </div>
    }
    <div class="list-heading">
      <h2>Individual responses</h2>
      <span>{{ total() }} total · Page {{ page }}</span>
    </div>
    @for (row of rows(); track row._id) {
      <details class="panel response-detail">
        <summary>
          <span>Response {{ row._id.slice(-6) }}</span
          ><span>{{ row.createdAt | date: 'medium' }}</span>
        </summary>
        @for (f of row.fields; track f.id) {
          @if (row.answers[f.id] !== undefined) {
            <div class="answer">
              <strong>{{ f.label }}</strong>
              @if (f.type === 'file') {
                <button
                  class="text-button"
                  (click)="download(row.answers[f.id])"
                >
                  Download {{ row.answers[f.id].name }} ↓
                </button>
              } @else if (f.type === 'password') {
                <span
                  >••••••••
                  <small
                    >Masked in the interface; included in owner-authorized CSV
                    exports.</small
                  ></span
                >
              } @else {
                <span>{{ display(row.answers[f.id]) }}</span>
              }
            </div>
          }
        }
        @if (form()?.access === 'owner') {
          <button class="text-button danger" (click)="remove(row._id)">
            Delete this response
          </button>
        }
      </details>
    } @empty {
      <div class="empty panel">
        <h3>The conversation is just getting started.</h3>
        <p>
          Publish your form and share its link to start collecting responses.
        </p>
      </div>
    }
    <div class="actions mt">
      <button
        class="button secondary small"
        [disabled]="page === 1"
        (click)="changePage(-1)"
      >
        ← Previous</button
      ><button
        class="button secondary small"
        [disabled]="page * 50 >= total()"
        (click)="changePage(1)"
      >
        Next →
      </button>
    </div>
  </section>`,
})
export class Responses implements OnDestroy {
  api = inject(Api);
  id = inject(ActivatedRoute).snapshot.params['id'];
  form = signal<FormModel | null>(null);
  report = signal<any>(null);
  rows = signal<any[]>([]);
  total = signal(0);
  error = signal('');
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
    return Array.isArray(v) ? v.join(', ') : String(v);
  }
  async load() {
    try {
      const [f, r, s] = await Promise.all([
        this.api.request('/forms/' + this.id),
        this.api.request('/forms/' + this.id + '/report'),
        this.api.request(
          '/forms/' + this.id + '/submissions?page=' + this.page,
        ),
      ]);
      this.form.set(f);
      this.report.set(r);
      this.rows.set(s.rows);
      this.total.set(s.total);
      this.error.set('');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  changePage(d: number) {
    this.page += d;
    this.load();
  }
  async remove(id: string) {
    if (!confirm('Permanently delete this response?')) return;
    try {
      await this.api.request(
        '/forms/' + this.id + '/submissions/' + id,
        'DELETE',
      );
      await this.load();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  download(file: any) {
    const [prefix, data] = file.data.split(',');
    const bytes = Uint8Array.from(atob(data), (x: string) => x.charCodeAt(0));
    const url = URL.createObjectURL(
      new Blob([bytes], { type: 'application/octet-stream' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
