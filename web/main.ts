import { bootstrapApplication } from "@angular/platform-browser";
import { Component, inject, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterOutlet,
  Routes,
  provideRouter,
  withInMemoryScrolling,
} from "@angular/router";
import { Api } from "./core";
@Component({
  selector: "app-root",
  imports: [RouterLink, RouterOutlet],
  template: `<header>
      <a routerLink="/" class="brand"
        ><span class="brand-icon">f∞</span>FormYfinite<span class="brand-dot"
          >.</span
        ></a
      >
      <nav>
        <a routerLink="/templates">Templates</a
        ><a routerLink="/guide">User guide</a>
        @if (api.person()) {
          <a routerLink="/workspace">Workspace</a
          ><a routerLink="/account" class="avatar" aria-label="Your account">{{
            api.person()!.name[0]
          }}</a
          ><button class="plain" (click)="logout()">Sign out</button>
        } @else {
          <a routerLink="/login">Log in</a
          ><a class="button small" routerLink="/register">Start creating ↗</a>
        }
      </nav>
    </header>
    @if (error()) {
      <div class="alert shell">{{ error() }}</div>
    }
    <main><router-outlet /></main>
    <footer>
      <a routerLink="/" class="brand">FormYfinite.</a
      ><span>Less paper. More possibilities.</span
      ><a routerLink="/guide">Complete user guide</a
      ><a routerLink="/guide" fragment="privacy">Privacy & data</a>
    </footer>`,
})
class Root {
  api = inject(Api);
  router = inject(Router);
  error = signal("");
  async logout() {
    if (!(await this.router.navigateByUrl("/"))) return;
    try {
      await this.api.call("/session", "DELETE");
      this.api.person.set(null);
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
const signedIn = async () => {
  const a = inject(Api),
    r = inject(Router);
  await a.ready;
  return a.person() ? true : r.parseUrl("/login");
};
const routes: Routes = [
  { path: "", loadComponent: () => import("./pages").then((m) => m.Landing) },
  {
    path: "login",
    loadComponent: () => import("./pages").then((m) => m.SignIn),
  },
  {
    path: "register",
    loadComponent: () => import("./pages").then((m) => m.SignIn),
  },
  {
    path: "workspace",
    canActivate: [signedIn],
    loadComponent: () => import("./workspace").then((m) => m.Workspace),
  },
  {
    path: "templates",
    canActivate: [signedIn],
    loadComponent: () => import("./workspace").then((m) => m.Library),
  },
  {
    path: "account",
    canActivate: [signedIn],
    loadComponent: () => import("./workspace").then((m) => m.AccountPage),
  },
  {
    path: "edit/new",
    canActivate: [signedIn],
    canDeactivate: [(c: any) => c.leave()],
    loadComponent: () => import("./editor").then((m) => m.Editor),
  },
  {
    path: "edit/:id",
    canActivate: [signedIn],
    canDeactivate: [(c: any) => c.leave()],
    loadComponent: () => import("./editor").then((m) => m.Editor),
  },
  {
    path: "results/:id",
    canActivate: [signedIn],
    loadComponent: () => import("./results").then((m) => m.Results),
  },
  {
    path: "f/:id",
    loadComponent: () => import("./respond").then((m) => m.Respond),
  },
  {
    path: "guide",
    loadComponent: () => import("./guide").then((m) => m.Guide),
  },
  { path: "**", redirectTo: "" },
];
bootstrapApplication(Root, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: "enabled",
        scrollPositionRestoration: "enabled",
      }),
    ),
  ],
}).catch(console.error);
