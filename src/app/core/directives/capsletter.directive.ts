import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appCapsletter]'
})
export class CapsletterDirective {

  constructor(public ref: ElementRef) { }
  @HostListener('input', ['$event']) onInput(event) {
    this.ref.nativeElement.value = event.target.value.toUpperCase();
 }
}
