import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { Api, Survey, blank } from "./core";
@Component({
  imports: [RouterLink, FormsModule, DatePipe],
  template: `<section class="shell workspace">
    <div class="page-top">
      <div>
        <span class="eyebrow">YOUR WORKSPACE</span>
        <h1>Hello, {{ api.person()?.name?.split(" ")?.[0] }}<em>.</em></h1>
        <p>Let’s turn a little curiosity into something meaningful.</p>
      </div>
      <a class="button" routerLink="/edit/new">＋ Create a form</a>
    </div>
    @if (error()) {
      <div class="alert">{{ error() }}</div>
    }
    @if (invitations().length) {
      <div class="card">
        <h3>You’re invited</h3>
        @for (i of invitations(); track i.id) {
          <div class="row">
            <span>{{ i.title }} · {{ i.role }}</span
            ><button class="button small" (click)="accept(i.id)">
              Accept invitation
            </button>
          </div>
        }
      </div>
    }
    <div class="stats">
      <div>
        <span>Your forms</span><strong>{{ forms().length }}</strong>
      </div>
      <div>
        <span>Responses collected</span><strong>{{ count() }}</strong>
      </div>
      <div>
        <span>Published</span><strong>{{ live() }}</strong>
      </div>
      <div class="stat-note">
        <span>✳</span>
        <p>New questions.<br />New possibilities.</p>
      </div>
    </div>
    <div class="list-top">
      <h2>Your forms</h2>
      <div class="actions">
        <input
          class="search"
          aria-label="Search forms"
          [(ngModel)]="search"
          placeholder="Find a form…"
        /><a class="button light small" routerLink="/templates"
          >Explore templates ↗</a
        >
      </div>
    </div>
    @if (loading()) {
      <p role="status">Loading your workspace…</p>
    } @else if (!forms().length) {
      <div class="empty card">
        <span>✦</span>
        <h2>A fresh start for your ideas.</h2>
        <p>Your first form is just a question away.</p>
        <a routerLink="/edit/new" class="button">Create your first form →</a>
      </div>
    }
    <div class="columns three">
      @for (f of filtered(); track f._id) {
        <article class="form-card">
          <div class="form-cover" [style.background]="f.accent + '18'">
            <span [style.color]="f.accent">▤</span
            ><span class="badge" [class.live]="f.state === 'published'">{{
              f.state
            }}</span>
          </div>
          <div class="form-card-content">
            <a [routerLink]="['/edit', f._id]"
              ><h3>{{ f.title }}</h3></a
            >
            <p>{{ f.description || "A place for your next conversation." }}</p>
            <div class="row meta">
              <span>{{ f.responses }} responses · {{ f.access }}</span
              ><span>{{ f.updatedAt | date: "MMM d" }}</span>
            </div>
            <a [routerLink]="['/results', f._id]">View responses ↗</a>
          </div>
        </article>
      }
    </div>
  </section>`,
})
export class Workspace {
  api = inject(Api);
  forms = signal<Survey[]>([]);
  invitations = signal<any[]>([]);
  loading = signal(true);
  error = signal("");
  search = "";
  constructor() {
    this.load();
  }
  async load() {
    try {
      const [f, i] = await Promise.all([
        this.api.call("/forms"),
        this.api.call("/invitations"),
      ]);
      this.forms.set(f);
      this.invitations.set(i);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
  count() {
    return this.forms().reduce((n, f) => n + (f.responses || 0), 0);
  }
  live() {
    return this.forms().filter((f) => f.state === "published").length;
  }
  filtered() {
    return this.forms().filter((f) =>
      f.title.toLowerCase().includes(this.search.toLowerCase()),
    );
  }
  async accept(id: string) {
    try {
      await this.api.call("/invitations/" + id, "POST", {});
      await this.load();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
const starter = (title: string, description: string, questions: any[]) => ({
  ...blank(),
  title,
  description,
  fields: questions.map((q, i) => ({
    id: "question" + i,
    hint: "",
    required: true,
    choices: [],
    ...q,
  })),
});
export const starters = [
  starter("Event registration", "Bring your community together.", [
    { kind: "text", label: "Your name" },
    { kind: "email", label: "Your email" },
    {
      kind: "radio",
      label: "How will you attend?",
      choices: ["In person", "Online"],
    },
    {
      kind: "textarea",
      label: "Accessibility or dietary requirements",
      required: false,
    },
  ]),
  starter("Customer feedback", "A fresh perspective on your work.", [
    {
      kind: "select",
      label: "How was your experience?",
      choices: ["Excellent", "Good", "Okay", "Needs improvement"],
    },
    { kind: "textarea", label: "What could we do better?" },
    { kind: "email", label: "Contact email", required: false },
  ]),
  starter("Research survey", "Find the people behind the answers.", [
    { kind: "number", label: "Your age", min: 18, max: 120 },
    {
      kind: "checkbox",
      label: "Your interests",
      choices: ["Technology", "Education", "Sustainability"],
    },
    { kind: "textarea", label: "Tell us more", required: false },
  ]),
];
@Component({
  imports: [RouterLink],
  template: `<section class="shell workspace">
    <a routerLink="/workspace">← Workspace</a>
    <div class="page-top">
      <div>
        <span class="eyebrow">A LITTLE INSPIRATION</span>
        <h1>A good place to start.</h1>
        <p>Pick a template and make it yours.</p>
      </div>
    </div>
    @if (error()) {
      <div class="alert">{{ error() }}</div>
    }
    <div class="columns three">
      @for (t of starters; track t.title) {
        <article class="card template">
          <span class="feature-symbol">▤</span>
          <h3>{{ t.title }}</h3>
          <p>{{ t.description }}</p>
          <small>{{ t.fields.length }} questions · Ready to customize</small
          ><button class="button light" (click)="use(t)">Use template →</button>
        </article>
      }
    </div>
    <h2 class="spaced">Your templates & community library</h2>
    <div class="columns three">
      @for (t of saved(); track t._id) {
        <article class="card template">
          <span class="badge">{{ t.shared ? "Community" : "Private" }}</span>
          <h3>{{ t.title }}</h3>
          <p>{{ t.description }}</p>
          <button class="button light" (click)="use(t)">Use template →</button>
          @if (t.owner === api.person()?.id) {
            <button class="plain danger" (click)="remove(t._id)">
              Delete template
            </button>
          }
        </article>
      } @empty {
        <p>Save a form as a template from the editor to reuse it here.</p>
      }
    </div>
  </section>`,
})
export class Library {
  api = inject(Api);
  router = inject(Router);
  starters = starters;
  saved = signal<any[]>([]);
  error = signal("");
  constructor() {
    this.load();
  }
  async load() {
    try {
      this.saved.set(await this.api.call("/templates"));
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async use(t: any) {
    try {
      const f = await this.api.call("/forms", "POST", {
        ...blank(),
        title: t.title,
        description: t.description,
        fields: t.fields,
      });
      this.router.navigate(["/edit", f._id]);
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async remove(id: string) {
    if (!confirm("Delete this template? Existing forms will remain.")) return;
    try {
      await this.api.call("/templates/" + id, "DELETE");
      this.load();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
@Component({
  imports: [RouterLink, FormsModule],
  template: `<section class="shell workspace narrow">
    <a routerLink="/workspace">← Workspace</a>
    <h1>Your account</h1>
    <form class="card" (ngSubmit)="save()">
      @if (message()) {
        <div class="notice">{{ message() }}</div>
      }
      <label
        >Display name<input
          [(ngModel)]="name"
          name="name"
          required
          minlength="2"
          maxlength="80" /></label
      ><label
        >Email address<input [value]="api.person()?.email" disabled
      /></label>
      <h3>Change password</h3>
      <p>Leave these blank to keep your current password.</p>
      <label
        >Current password<input
          [(ngModel)]="current"
          name="current"
          type="password"
          autocomplete="current-password" /></label
      ><label
        >New password<input
          [(ngModel)]="next"
          name="next"
          type="password"
          minlength="10"
          autocomplete="new-password" /></label
      ><button class="button">Save account</button>
    </form>
    @if (api.person()?.admin) {
      <div class="card spaced">
        <h2>User administration</h2>
        @for (p of people(); track p.id) {
          <div class="row">
            <span>{{ p.name }} · {{ p.email }}</span>
            @if (p.id !== api.person()?.id) {
              <button class="button light small" (click)="toggle(p)">
                {{ p.disabled ? "Enable" : "Disable" }}
              </button>
            }
          </div>
        }
      </div>
    }
  </section>`,
})
export class AccountPage {
  api = inject(Api);
  name = this.api.person()?.name || "";
  current = "";
  next = "";
  message = signal("");
  people = signal<any[]>([]);
  constructor() {
    if (this.api.person()?.admin) this.load();
  }
  async load() {
    try {
      this.people.set(await this.api.call("/admin/accounts"));
    } catch (e: any) {
      this.message.set(e.message);
    }
  }
  async save() {
    try {
      this.api.person.set(
        await this.api.call("/account", "PATCH", {
          name: this.name,
          ...(this.next
            ? { currentPassword: this.current, newPassword: this.next }
            : {}),
        }),
      );
      this.current = "";
      this.next = "";
      this.message.set("Account updated.");
    } catch (e: any) {
      this.message.set(e.message);
    }
  }
  async toggle(p: any) {
    try {
      await this.api.call("/admin/accounts/" + p.id, "PATCH", {
        disabled: !p.disabled,
      });
      this.load();
    } catch (e: any) {
      this.message.set(e.message);
    }
  }
}
