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

  // constructor(@Attribute ) { }

    // shouldBeLessThanEqualToNumber(limitValue: any): ValidatorFn {
        // validate(control: AbstractControl): {[key: string]: any} | null {

        //     if((parseFloat(control.value+'') <= parseFloat(limitValue))) {
        //         console.log("[CustomValidators] ", parseFloat(control.value+''), limitValue, true);
        //     } else {
        //         console.log("[CustomValidators] ", parseFloat(control.value+''), limitValue, false);
        //     }
        //     return (parseFloat(control.value+'') <= parseFloat(limitValue)) ? null: {
        //         shouldBeLessThanEqualToNumber: {
        //             valid: false
        //         }
        //     }
        

}
