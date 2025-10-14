import { Directive, forwardRef } from '@angular/core';
import { Validators, NG_VALIDATORS, AbstractControl } from '@angular/forms';
import { Attribute } from '@angular/compiler';

@Directive({
  selector: '[lessThanNumber][formControlName],[lessThanNumber][formControl]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LessThanNumberDirective),
      multi: true
    }
  ]
})
export class LessThanNumberDirective {
        

}
