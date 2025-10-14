import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { CollaborationComponent } from './collaboration/collaboration.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { SubmissionComponent } from './submission/submission.component';
import { TemplateManagementComponent } from './template-management/template-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    UserManagementComponent,
    FormBuilderComponent,
    SubmissionComponent,
    TemplateManagementComponent,
    CollaborationComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(
      {
        timeOut: 10000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        enableHtml:true,
      }
    )
  ]
})
export class DashboardModule { }
