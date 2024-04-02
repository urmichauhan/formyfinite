import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { CollaborationComponent } from './collaboration/collaboration.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { SubmissionComponent } from './submission/submission.component';
import { TemplateManagementComponent } from './template-management/template-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    UserManagementComponent,
    FormBuilderComponent,
    SubmissionComponent,
    TemplateManagementComponent,
    CollaborationComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DashboardModule { }
