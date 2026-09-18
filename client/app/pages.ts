import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Api, FormModel, newForm } from './api';
@Component({
  imports: [RouterLink],
  template: `<section class="hero">
      <div class="hero-copy">
        <span class="eyebrow"
          ><span class="dot"></span> A LITTLE FORM. INFINITE
          POSSIBILITIES.</span
        >
        <h1>Good questions.<br /><em>Great possibilities.</em></h1>
        <p>
          Bring your ideas to life with beautiful forms. Collect responses,
          collaborate with your team, and turn answers into something
          meaningful.
        </p>
        <div class="actions">
          <a class="button" routerLink="/register"
            >Create your first form <span>↗</span></a
          ><a routerLink="/guide" class="button secondary"
            >See how it works →</a
          >
        </div>
        <div class="hero-note">
          <span class="mini-avatars">U <b>A</b> <i>M</i></span
          ><span
            >Made for curious minds and teams.<br /><strong
              >No coding. No complicated setup.</strong
            ></span
          >
        </div>
      </div>
      <div class="hero-art">
        <div class="floating-tag">✦ Your next great idea starts here</div>
        <div class="sample-form">
          <div class="sample-top">
            <span class="pill">COMMUNITY & CONNECTION</span><span>↗</span>
          </div>
          <div class="flower">✳</div>
          <h2>Let’s make something<br />great together.</h2>
          <p>Tell us a little about yourself.</p>
          <label>Your name <span>*</span></label>
          <div class="fake-input">Alex Morgan</div>
          <label>What brings you here?</label>
          <div class="sample-options">
            <span>◉ A new idea</span><span>○ A little inspiration</span>
          </div>
          <div class="fake-button">Count me in <span>→</span></div>
          <div class="sample-bottom">
            Made with FormYfinite <span>1 of 1</span>
          </div>
        </div>
        <div class="response-tag">
          <span>✓</span>
          <div>
            <strong>One more connection.</strong
            ><small>Every response is a new possibility.</small>
          </div>
        </div>
        <div class="orbit">✺</div>
      </div>
    </section>
    <section class="trust-strip">
      <span>FROM EVERYDAY QUESTIONS TO BIG IDEAS</span><b>Feedback & surveys</b
      ><b>Event registrations</b><b>Research & learning</b><b>Team workflows</b>
    </section>
    <section class="section">
      <span class="eyebrow">THOUGHTFULLY SIMPLE</span>
      <h2>Everything you need.<br />Room for everything you imagine.</h2>
      <div class="feature-grid">
        <article>
          <span class="feature-icon">▦</span>
          <h3>Build it your way</h3>
          <p>
            Drag, drop, and make it yours. Twelve field types and conditional
            questions keep every form relevant.
          </p>
        </article>
        <article>
          <span class="feature-icon peach">♧</span>
          <h3>Better, together</h3>
          <p>
            Invite your people. Choose who can edit and who can view, with
            protection against conflicting changes.
          </p>
        </article>
        <article>
          <span class="feature-icon green">▥</span>
          <h3>Find the story in your data</h3>
          <p>
            Watch responses arrive, explore summaries, and export your results
            whenever you need them.
          </p>
        </article>
      </div>
    </section>
    <section class="cta-band">
      <div>
        <span class="eyebrow">LESS PAPER. MORE POSSIBILITY.</span>
        <h2>Your next idea deserves a form.</h2>
      </div>
      <a routerLink="/register" class="button">Let’s get started ↗</a>
    </section>`,
})
export class Home {}
@Component({
  imports: [FormsModule, RouterLink],
  template: `<section class="auth-layout">
    <div class="auth-intro">
      <span class="eyebrow">WELCOME TO FORMYFINITE</span>
      <h1>Make room for<br /><em>your next idea.</em></h1>
      <p>
        A space for questions, connections, and all the possibilities in
        between.
      </p>
      <div class="big-star">✳</div>
    </div>
    <form class="panel auth-card" (ngSubmit)="submit()">
      <span class="eyebrow">YOUR WORKSPACE AWAITS</span>
      <h2>{{ register ? 'Create your account' : 'Welcome back.' }}</h2>
      <p>
        {{
          register
            ? 'Start building something meaningful.'
            : 'Sign in to pick up where you left off.'
        }}
      </p>
      @if (error()) {
        <div class="alert" role="alert">{{ error() }}</div>
      }
      @if (register) {
        <label
          >Full name<input
            name="name"
            [(ngModel)]="name"
            required
            minlength="2"
            maxlength="80"
            autocomplete="name"
        /></label>
      }
      <label
        >Email address<input
          name="email"
          [(ngModel)]="email"
          type="email"
          required
          autocomplete="email" /></label
      ><label
        >Password<input
          name="password"
          [(ngModel)]="password"
          type="password"
          required
          minlength="10"
          maxlength="128"
          [autocomplete]="
            register ? 'new-password' : 'current-password'
          " /></label
      ><small>Use at least 10 characters.</small
      ><button class="button full" [disabled]="busy()">
        {{
          busy() ? 'Please wait…' : register ? 'Create account ↗' : 'Log in →'
        }}
      </button>
      <p class="center">
        {{ register ? 'Already have an account?' : 'New around here?' }}
        <a [routerLink]="register ? '/login' : '/register'">{{
          register ? 'Log in' : 'Create an account'
        }}</a>
      </p>
      <a routerLink="/guide" fragment="account">Need help signing in?</a>
    </form>
  </section>`,
})
export class Auth {
  api = inject(Api);
  router = inject(Router);
  register = this.router.url === '/register';
  name = '';
  email = '';
  password = '';
  error = signal('');
  busy = signal(false);
  async submit() {
    this.busy.set(true);
    this.error.set('');
    try {
      const r = await this.api.request(
        '/auth/' + (this.register ? 'register' : 'login'),
        'POST',
        { name: this.name, email: this.email, password: this.password },
      );
      this.api.user.set(r.user);
      await this.router.navigateByUrl('/dashboard');
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.busy.set(false);
    }
  }
}
@Component({
  imports: [RouterLink, FormsModule, DatePipe],
  template: `<section class="workspace">
    <div class="page-heading">
      <div>
        <span class="eyebrow">YOUR WORKSPACE</span>
        <h1>
          Hello, {{ api.user()?.name?.split(' ')?.[0]
          }}<span class="purple">.</span>
        </h1>
        <p>Big ideas start with a simple question.</p>
      </div>
      <a class="button" routerLink="/forms/new">＋ Create a form</a>
    </div>
    @if (error()) {
      <div class="alert">{{ error() }}</div>
    }
    @if (invites().length) {
      <div class="panel invitations">
        <h3>You’re invited to collaborate</h3>
        @for (i of invites(); track i.id) {
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
      <article>
        <span>Total forms</span><strong>{{ forms().length }}</strong>
      </article>
      <article>
        <span>Total responses</span><strong>{{ totalResponses() }}</strong>
      </article>
      <article>
        <span>Published forms</span><strong>{{ published() }}</strong>
      </article>
      <article class="stat-message">
        <span>✳</span>
        <p>Small questions.<br />Meaningful connections.</p>
      </article>
    </div>
    <div class="list-heading">
      <h2>
        Your forms <span class="count">{{ forms().length }}</span>
      </h2>
      <div class="actions">
        <input
          class="search"
          aria-label="Search forms"
          placeholder="Search your forms…"
          [(ngModel)]="search"
        /><a routerLink="/templates" class="button secondary small"
          >Explore templates ↗</a
        >
      </div>
    </div>
    @if (loading()) {
      <p role="status">Loading your workspace…</p>
    } @else if (!forms().length) {
      <div class="empty panel">
        <span>✳</span>
        <h2>A fresh canvas for your ideas.</h2>
        <p>Create your first form or start with a ready-to-use template.</p>
        <a routerLink="/forms/new" class="button">Create your first form →</a>
      </div>
    }
    <div class="form-grid">
      @for (f of filtered(); track f._id) {
        <article class="form-card">
          <div class="form-cover" [style.background]="f.theme + '18'">
            <span [style.color]="f.theme">▤</span
            ><span class="status" [class.live]="f.status === 'published'">{{
              f.status
            }}</span>
          </div>
          <div class="form-card-body">
            <a [routerLink]="['/forms', f._id]"
              ><h3>{{ f.title }}</h3></a
            >
            <p>{{ f.description || 'A new collection of possibilities.' }}</p>
            <div class="card-meta">
              <span>{{ f.responseCount }} responses</span
              ><span>{{ f.access }}</span>
            </div>
            <div class="card-bottom">
              <span>{{ f.updatedAt | date: 'MMM d, y' }}</span
              ><a [routerLink]="['/forms', f._id, 'responses']"
                >View results ↗</a
              >
            </div>
          </div>
        </article>
      }
    </div>
  </section>`,
})
export class Dashboard {
  api = inject(Api);
  forms = signal<FormModel[]>([]);
  invites = signal<any[]>([]);
  error = signal('');
  loading = signal(true);
  search = '';
  constructor() {
    this.load();
  }
  async load() {
    try {
      const [f, i] = await Promise.all([
        this.api.request('/forms'),
        this.api.request('/invitations'),
      ]);
      this.forms.set(f);
      this.invites.set(i);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
  filtered() {
    return this.forms().filter((f) =>
      f.title.toLowerCase().includes(this.search.toLowerCase()),
    );
  }
  totalResponses() {
    return this.forms().reduce((a, f) => a + (f.responseCount || 0), 0);
  }
  published() {
    return this.forms().filter((f) => f.status === 'published').length;
  }
  async accept(id: string) {
    try {
      await this.api.request('/invitations/' + id + '/accept', 'POST', {});
      await this.load();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
const starter = (title: string, description: string, fields: any[]) => ({
  ...newForm(),
  title,
  description,
  fields: fields.map((f, i) => ({
    id: 'q' + i,
    help: '',
    required: true,
    options: [],
    ...f,
  })),
});
export const starters = [
  starter('Event registration', 'Bring your community together.', [
    { type: 'text', label: 'Full name' },
    { type: 'email', label: 'Email address' },
    {
      type: 'dropdown',
      label: 'How will you join?',
      options: ['In person', 'Online'],
    },
    {
      type: 'textarea',
      label: 'Accessibility or dietary needs',
      required: false,
    },
  ]),
  starter('Customer feedback', 'A little feedback goes a long way.', [
    {
      type: 'radio',
      label: 'How was your experience?',
      options: ['Excellent', 'Good', 'Okay', 'Needs improvement'],
    },
    { type: 'textarea', label: 'What could we do better?', required: false },
    { type: 'email', label: 'Email for follow-up', required: false },
  ]),
  starter('Research survey', 'Understand the people behind the answers.', [
    { type: 'text', label: 'Your name', required: false },
    { type: 'number', label: 'Age', min: 18, max: 120 },
    {
      type: 'checkbox',
      label: 'Topics you are interested in',
      options: ['Technology', 'Education', 'Sustainability'],
    },
    { type: 'textarea', label: 'Tell us more', required: false },
  ]),
];
@Component({
  imports: [RouterLink],
  template: `<section class="workspace">
    <a routerLink="/dashboard" class="back">← Workspace</a>
    <div class="page-heading">
      <div>
        <span class="eyebrow">A HEAD START FOR YOUR IDEAS</span>
        <h1>Start with something good.</h1>
        <p>Pick a template. Add your own perspective.</p>
      </div>
    </div>
    @if (error()) {
      <div class="alert">{{ error() }}</div>
    }
    <h2>Made for everyday possibilities</h2>
    <div class="form-grid">
      @for (t of defaults; track t.title) {
        <article class="panel template-card">
          <span class="feature-icon">▤</span>
          <h3>{{ t.title }}</h3>
          <p>{{ t.description }}</p>
          <small>{{ t.fields.length }} fields · Ready to customize</small
          ><button class="button secondary" (click)="use(t)">
            Use template →
          </button>
        </article>
      }
    </div>
    <h2 class="mt">Your templates & community library</h2>
    <div class="form-grid">
      @for (t of templates(); track t._id) {
        <article class="panel template-card">
          <span class="pill">{{ t.shared ? 'Community' : 'Private' }}</span>
          <h3>{{ t.title }}</h3>
          <p>{{ t.description }}</p>
          <button class="button secondary" (click)="use(t)">
            Use template →
          </button>
          @if (t.owner === api.user()?.id) {
            <button class="text-button danger" (click)="remove(t._id)">
              Delete template
            </button>
          }
        </article>
      } @empty {
        <p>Save a form as a template from the form builder to see it here.</p>
      }
    </div>
  </section>`,
})
export class Templates {
  api = inject(Api);
  router = inject(Router);
  defaults = starters;
  templates = signal<any[]>([]);
  error = signal('');
  constructor() {
    this.load();
  }
  async load() {
    try {
      this.templates.set(await this.api.request('/templates'));
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async use(t: any) {
    try {
      const f = await this.api.request('/forms', 'POST', {
        ...newForm(),
        title: t.title,
        description: t.description,
        fields: t.fields,
      });
      this.router.navigate(['/forms', f._id]);
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async remove(id: string) {
    if (!confirm('Delete this template? Existing forms are not affected.'))
      return;
    try {
      await this.api.request('/templates/' + id, 'DELETE');
      await this.load();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
@Component({
  imports: [FormsModule, RouterLink],
  template: `<section class="workspace narrow">
    <a routerLink="/dashboard">← Workspace</a>
    <h1>Your account</h1>
    <form class="panel" (ngSubmit)="save()">
      @if (message()) {
        <div class="notice" role="status">{{ message() }}</div>
      }
      <label
        >Name<input
          name="name"
          [(ngModel)]="name"
          required
          minlength="2" /></label
      ><label>Email<input [value]="api.user()?.email" disabled /></label>
      <h3>Change password</h3>
      <p>Leave both fields blank to keep your current password.</p>
      <label
        >Current password<input
          type="password"
          name="current"
          [(ngModel)]="current"
          autocomplete="current-password" /></label
      ><label
        >New password<input
          type="password"
          name="next"
          [(ngModel)]="next"
          minlength="10"
          autocomplete="new-password" /></label
      ><button class="button">Save account</button>
    </form>
    @if (api.user()?.role === 'admin') {
      <div class="panel mt">
        <h2>User administration</h2>
        @for (u of users(); track u.id) {
          <div class="row">
            <span>{{ u.name }} · {{ u.email }}</span>
            @if (u.id !== api.user()?.id) {
              <button class="button secondary small" (click)="toggle(u)">
                {{ u.disabled ? 'Enable' : 'Disable' }}
              </button>
            }
          </div>
        }
      </div>
    }
  </section>`,
})
export class Account {
  api = inject(Api);
  name = this.api.user()?.name || '';
  current = '';
  next = '';
  message = signal('');
  users = signal<any[]>([]);
  constructor() {
    if (this.api.user()?.role === 'admin') this.load();
  }
  async load() {
    try {
      this.users.set(await this.api.request('/admin/users'));
    } catch (e: any) {
      this.message.set(e.message);
    }
  }
  async save() {
    try {
      const r = await this.api.request('/auth/profile', 'PATCH', {
        name: this.name,
        ...(this.next
          ? { currentPassword: this.current, newPassword: this.next }
          : {}),
      });
      this.api.user.set(r.user);
      this.current = '';
      this.next = '';
      this.message.set('Account updated.');
    } catch (e: any) {
      this.message.set(e.message);
    }
  }
  async toggle(u: any) {
    try {
      await this.api.request('/admin/users/' + u.id, 'PATCH', {
        disabled: !u.disabled,
      });
      await this.load();
    } catch (e: any) {
      this.message.set(e.message);
    }
  }
}
