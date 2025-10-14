import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './core/error-page/error-page.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';

const routes: Routes = [
  // {
  //   path: '**',
  //   redirectTo: 'not-found',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    redirectTo: 'formyfinite',
    pathMatch: 'full'
  },
  {
    path: 'formyfinite',
    loadChildren: () => import('./components/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  { path: '404', component: NotFoundComponent },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    anchorScrolling: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
