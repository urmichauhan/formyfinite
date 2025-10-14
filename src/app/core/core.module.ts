import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MaterialModule } from './material/material.module';
import { OnlyNumberDirective } from './directives/validator.directive';
import { CapsletterDirective } from './directives/capsletter.directive';
import { LessThanNumberDirective } from './directives/less-than-number.directive';
import { RestrictInputDirective } from './directives/restrict-input.directive';
import { RestrictNumberDirective } from './directives/restrict-number.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // MaterialModule,
    
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // MaterialModule,
    OnlyNumberDirective,
    
    RestrictNumberDirective
  ],
  declarations: [
    OnlyNumberDirective,
    CapsletterDirective,
    LessThanNumberDirective,
    RestrictInputDirective,
    RestrictNumberDirective,
  ]
})
export class CoreModule { }
