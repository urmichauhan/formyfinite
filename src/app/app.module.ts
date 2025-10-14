import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedComponent } from './shared/shared.component';
import { ErrorComponent } from './core/error-page/error-page.component';
import { DashboardNavComponent } from './dashboard-nav/dashboard-nav.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';
import { AuthUserComponent } from './components/auth-user/auth-user.component';
import { DashboardModule } from './components/dashboard.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    DashboardNavComponent,
    AppComponent,
    SharedComponent,
    ErrorComponent,
    AuthUserComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    HttpClientModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardModule,
    BrowserAnimationsModule, // Add this module
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      enableHtml:true,
    }), // Add this line to configure toastr
  ],
  providers: [BsModalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
