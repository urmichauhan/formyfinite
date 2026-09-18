import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Api } from "./core";
@Component({
  imports: [RouterLink],
  template: `<section class="hero shell">
      <div>
        <span class="eyebrow">A SPACE FOR EVERY QUESTION</span>
        <h1>Small questions.<br /><em>Infinite possibilities.</em></h1>
        <p class="lead">
          Create forms that feel like a conversation. Bring your team together,
          collect thoughtful answers, and discover what comes next.
        </p>
        <div class="actions">
          <a class="button" routerLink="/register">Create your first form ↗</a
          ><a class="button light" routerLink="/guide">Take a look around →</a>
        </div>
        <div class="hero-proof">
          <span>✦</span>
          <p>
            No coding required.<br /><strong
              >Just your ideas, ready to take shape.</strong
            >
          </p>
        </div>
      </div>
      <div class="hero-illustration">
        <div class="sticker">GOOD IDEAS START WITH A QUESTION</div>
        <div class="mock-form">
          <div class="mock-kicker">LET’S CONNECT <span>↗</span></div>
          <span class="sun">✳</span>
          <h2>Make something<br />meaningful.</h2>
          <p>We’d love to hear your perspective.</p>
          <label>Your name</label>
          <div class="mock-input">Alex Morgan</div>
          <label>What’s on your mind?</label>
          <div class="mock-options">
            <span>◉ A fresh idea</span><span>○ A little feedback</span>
          </div>
          <div class="mock-submit">Share your thoughts <span>→</span></div>
          <small>Made with FormYfinite</small>
        </div>
        <div class="floating-note">
          <span>✓</span>
          <div>
            <strong>A new perspective.</strong
            ><small>Every answer adds something.</small>
          </div>
        </div>
      </div>
    </section>
    <div class="use-cases">
      <span>MADE FOR REAL LIFE</span><b>Community & events</b
      ><b>Feedback & surveys</b><b>Research & learning</b
      ><b>Everyday teamwork</b>
    </div>
    <section class="shell features">
      <span class="eyebrow">THOUGHTFULLY SIMPLE</span>
      <h2>Your ideas. Your people.<br />Everything in one place.</h2>
      <div class="columns three">
        <article>
          <span class="feature-symbol">▦</span>
          <h3>Build a little differently</h3>
          <p>
            Twelve question types, drag-and-drop editing, and conditions that
            keep every question relevant.
          </p>
        </article>
        <article>
          <span class="feature-symbol apricot">♧</span>
          <h3>Invite another perspective</h3>
          <p>
            Work together with clear permissions and version checks that protect
            everyone’s changes.
          </p>
        </article>
        <article>
          <span class="feature-symbol sage">▥</span>
          <h3>See the bigger picture</h3>
          <p>
            Explore responses, find patterns, and take your data with you in a
            simple CSV export.
          </p>
        </article>
      </div>
    </section>
    <section class="shell callout">
      <div>
        <span class="eyebrow">LESS PAPER. MORE CONNECTION.</span>
        <h2>Give your next idea a place to begin.</h2>
      </div>
      <a routerLink="/register" class="button">Let’s make a form ↗</a>
    </section>`,
})
export class Landing {}
@Component({
  imports: [FormsModule, RouterLink],
  template: `<section class="auth shell">
    <div class="auth-story">
      <span class="eyebrow">WELCOME TO YOUR NEXT CHAPTER</span>
      <h1>Make space<br />for <em>possibility.</em></h1>
      <p>A few good questions can start something wonderful.</p>
      <span class="giant-flower">✳</span>
    </div>
    <form class="card auth-card" (ngSubmit)="submit()">
      <span class="eyebrow">YOUR WORKSPACE AWAITS</span>
      <h2>{{ register ? "Create your account" : "Welcome back." }}</h2>
      <p>
        {{
          register
            ? "Bring your ideas. We’ll make room."
            : "Sign in and keep the conversation going."
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
          type="email"
          name="email"
          [(ngModel)]="email"
          required
          autocomplete="email" /></label
      ><label
        >Password<input
          type="password"
          name="password"
          [(ngModel)]="password"
          required
          minlength="10"
          maxlength="128"
          [autocomplete]="
            register ? 'new-password' : 'current-password'
          " /></label
      ><small>At least 10 characters.</small
      ><button class="button full" [disabled]="busy()">
        {{ busy() ? "Please wait…" : register ? "Create account" : "Log in" }}
      </button>
      <p>
        {{ register ? "Already have an account?" : "New here?" }}
        <a [routerLink]="register ? '/login' : '/register'">{{
          register ? "Log in" : "Create an account"
        }}</a>
      </p>
      <a routerLink="/guide" fragment="accounts">Need help signing in?</a>
    </form>
  </section>`,
})
export class SignIn {
  api = inject(Api);
  router = inject(Router);
  register = this.router.url === "/register";
  name = "";
  email = "";
  password = "";
  busy = signal(false);
  error = signal("");
  async submit() {
    this.busy.set(true);
    this.error.set("");
    try {
      this.api.person.set(
        await this.api.call(this.register ? "/accounts" : "/session", "POST", {
          name: this.name,
          email: this.email,
          password: this.password,
        }),
      );
      this.router.navigateByUrl("/workspace");
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.busy.set(false);
    }
  }
}
