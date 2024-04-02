import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthUserComponent } from './auth-user/auth-user.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';

const routes: Routes = [
  {
    path : 'auth',
    component : AuthUserComponent
  },
  {
    path : 'form-builder',
    component : FormBuilderComponent
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
