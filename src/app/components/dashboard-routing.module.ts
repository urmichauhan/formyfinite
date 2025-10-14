import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthUserComponent } from './auth-user/auth-user.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { SubmissionComponent } from './submission/submission.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'formyfinite', // Updated redirectTo path
    pathMatch: 'full'
  },
  { path: 'auth', component: AuthUserComponent },
  { path: 'form-builder', component: FormBuilderComponent },
  { path: 'form-submission', component: SubmissionComponent },
  { path: 'profile', component: SubmissionComponent },
  // {
  //   path: '',
  //   redirectTo: '',
  //   pathMatch: 'full'
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
