import { bootstrapApplication } from '@angular/platform-browser';
import { Component, inject } from '@angular/core';
import {
  provideRouter,
  RouterOutlet,
  RouterLink,
  Router,
  Routes,
} from '@angular/router';
import { Api } from './app/api';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: ` <header class="site-header">
      <a routerLink="/" class="brand"
        ><span class="brand-mark">f<span>∞</span></span
        >Form<span>Y</span>finite</a
      >
      <nav>
        <a routerLink="/templates">Templates</a
        ><a routerLink="/guide">User guide</a>
        @if (api.user()) {
          <a routerLink="/dashboard">My workspace</a
          ><a
            routerLink="/account"
            class="avatar"
            [attr.aria-label]="'Account for ' + api.user()!.name"
            >{{ api.user()!.name.slice(0, 1) }}</a
          ><button class="text-button" (click)="logout()">Sign out</button>
        } @else {
          <a routerLink="/login">Log in</a
          ><a routerLink="/register" class="button small">Get started ↗</a>
        }
      </nav>
    </header>
    <main><router-outlet /></main>
    <footer>
      <a routerLink="/" class="brand">Form<span>Y</span>finite</a
      ><span>Less paper. More possibilities.</span
      ><a routerLink="/guide">Complete user guide</a
      ><a routerLink="/guide" fragment="privacy">Privacy & data</a
      ><span>Built for people, together.</span>
    </footer>`,
})
class App {
  api = inject(Api);
  router = inject(Router);
  async logout() {
    await this.api.logout();
    this.router.navigateByUrl('/');
  }
}
const guard = async () => {
  const api = inject(Api),
    router = inject(Router);
  await api.ready;
  return api.user() ? true : router.parseUrl('/login');
};
const routes: Routes = [
  { path: '', loadComponent: () => import('./app/pages').then((m) => m.Home) },
  {
    path: 'login',
    loadComponent: () => import('./app/pages').then((m) => m.Auth),
  },
  {
    path: 'register',
    loadComponent: () => import('./app/pages').then((m) => m.Auth),
  },
  {
    path: 'guide',
    loadComponent: () => import('./app/guide').then((m) => m.Guide),
  },
  {
    path: 'dashboard',
    canActivate: [guard],
    loadComponent: () => import('./app/pages').then((m) => m.Dashboard),
  },
  {
    path: 'templates',
    canActivate: [guard],
    loadComponent: () => import('./app/pages').then((m) => m.Templates),
  },
  {
    path: 'account',
    canActivate: [guard],
    loadComponent: () => import('./app/pages').then((m) => m.Account),
  },
  {
    path: 'forms/new',
    canActivate: [guard],
    canDeactivate: [(c: any) => c.canLeave()],
    loadComponent: () => import('./app/builder').then((m) => m.Builder),
  },
  {
    path: 'forms/:id',
    canActivate: [guard],
    canDeactivate: [(c: any) => c.canLeave()],
    loadComponent: () => import('./app/builder').then((m) => m.Builder),
  },
  {
    path: 'forms/:id/responses',
    canActivate: [guard],
    loadComponent: () => import('./app/responses').then((m) => m.Responses),
  },
  {
    path: 'f/:id',
    loadComponent: () => import('./app/renderer').then((m) => m.PublicForm),
  },
  { path: '**', redirectTo: '' },
];
bootstrapApplication(App, { providers: [provideRouter(routes)] }).catch(
  console.error,
);
